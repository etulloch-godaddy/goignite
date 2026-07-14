from typing import Annotated, Optional

from fastapi import APIRouter, Header, HTTPException, Query

from app.models.domains import (
    AiDomainSuggestResponse,
    DomainPurchaseRequest,
    DomainRecord,
    DomainSuggestion,
)
from app.services.domain_ai import API_KEY, generate_domain_candidates
from app.services.domains import GoDaddyClient, get_client
from app.services.user_store import load_users

router = APIRouter(prefix="/api/domains", tags=["domains"])


def _client() -> GoDaddyClient:
    return get_client()


@router.get("/available")
async def check_availability(
    domain: str = Query(..., description="Domain name to check"),
    check_type: str = Query("FAST", description="FAST or FULL"),
    for_transfer: bool = Query(False),
):
    return await _client().check_availability(domain, check_type, for_transfer)


@router.post("/available/bulk")
async def check_availability_bulk(
    domains: list[str],
    check_type: str = Query("FAST"),
):
    return await _client().check_availability_bulk(domains, check_type)


@router.get("/suggest")
async def suggest(
    query: str = Query(..., description="Seed keyword or domain"),
    tlds: Optional[str] = Query(None, description="Comma-separated TLD list, e.g. com,net"),
    limit: int = Query(10, ge=1, le=50),
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
):
    tld_list = tlds.split(",") if tlds else None
    return await _client().suggest(query, tld_list, limit, country, city)


@router.get("/ai-suggest/{user_id}", response_model=AiDomainSuggestResponse)
async def ai_suggest_domains(
    user_id: str,
    tlds: str = Query("com,co,io,shop", description="Comma-separated TLD list, e.g. com,co,io"),
    limit: int = Query(6, ge=1, le=20),
):
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    context = {
        "business_name": user.onboarding_data.get("business_name"),
        "pitch": user.business_profile.pitch or user.onboarding_data.get("pitch"),
        "niche": user.onboarding_data.get("niche"),
        "creator_type": (
            user.creator_type.value
            if user.creator_type
            else user.onboarding_data.get("creator_type_label")
        ),
        "goal": user.onboarding_data.get("goal") or user.business_profile.revenue_goal,
    }

    tld_list = [t.strip().lstrip(".") for t in tlds.split(",") if t.strip()] or ["com"]

    candidates = await generate_domain_candidates(context, count=8)
    full_domains = [f"{base}.{tld}" for base in candidates for tld in tld_list]

    if not full_domains:
        return AiDomainSuggestResponse(
            user_id=user_id, suggestions=[], mock=not API_KEY
        )

    # Use FULL (authoritative registry check) rather than the default FAST,
    # which returns cached results that can report already-registered domains
    # as available.
    raw = await _client().check_availability_bulk(full_domains, check_type="FULL")
    results = raw.get("domains", raw) if isinstance(raw, dict) else raw
    if not isinstance(results, list):
        results = []

    suggestions: list[DomainSuggestion] = []
    for entry in results:
        if not isinstance(entry, dict) or not entry.get("available"):
            continue
        # FULL responses mark authoritative results as definitive; skip any
        # non-definitive entry so we never surface a domain that's actually taken.
        if entry.get("definitive") is False:
            continue
        price = entry.get("price")
        suggestions.append(
            DomainSuggestion(
                domain=entry.get("domain", ""),
                available=True,
                price=(price / 1_000_000) if isinstance(price, (int, float)) else None,
                currency=entry.get("currency"),
            )
        )

    return AiDomainSuggestResponse(
        user_id=user_id,
        suggestions=suggestions[:limit],
        mock=not API_KEY,
    )


@router.get("/tlds")
async def list_tlds():
    return await _client().list_tlds()


@router.get("/")
async def list_domains(
    x_shopper_id: Annotated[Optional[str], Header()] = None,
):
    return await _client().list_domains(x_shopper_id)


@router.post("/purchase")
async def purchase_domain(
    payload: DomainPurchaseRequest,
    x_shopper_id: Annotated[Optional[str], Header()] = None,
):
    body = {
        "domain": payload.domain,
        "privacy": payload.privacy,
        "renewAuto": payload.auto_renew,
        "period": payload.period,
        "consent": {"agreedAt": "", "agreedBy": "", "agreementKeys": []},
        "contactRegistrant": _contact_to_godaddy(payload.contacts.registrant),
        "contactAdmin": _contact_to_godaddy(
            payload.contacts.admin or payload.contacts.registrant
        ),
        "contactTech": _contact_to_godaddy(
            payload.contacts.tech or payload.contacts.registrant
        ),
        "contactBilling": _contact_to_godaddy(
            payload.contacts.billing or payload.contacts.registrant
        ),
    }
    return await _client().purchase(body, x_shopper_id)


@router.get("/{domain}")
async def get_domain(
    domain: str,
    x_shopper_id: Annotated[Optional[str], Header()] = None,
):
    return await _client().get_domain(domain, x_shopper_id)


@router.post("/{domain}/renew")
async def renew_domain(
    domain: str,
    period: Optional[int] = Query(None),
    x_shopper_id: Annotated[Optional[str], Header()] = None,
):
    return await _client().renew(domain, period, x_shopper_id)


@router.get("/{domain}/records")
async def get_records(
    domain: str,
    type: Optional[str] = Query(None, description="Record type, e.g. A, CNAME, MX"),
    name: Optional[str] = Query(None, description="Record name"),
):
    return await _client().get_records(domain, type, name)


@router.patch("/{domain}/records")
async def add_records(domain: str, records: list[DomainRecord]):
    await _client().add_records(domain, [r.model_dump(exclude_none=True) for r in records])
    return {"status": "ok"}


@router.put("/{domain}/records/{record_type}")
async def replace_records_by_type(
    domain: str, record_type: str, records: list[DomainRecord]
):
    await _client().replace_records(
        domain, record_type, [r.model_dump(exclude_none=True) for r in records]
    )
    return {"status": "ok"}


@router.delete("/{domain}/records/{record_type}/{name}")
async def delete_records(domain: str, record_type: str, name: str):
    await _client().delete_records(domain, record_type, name)
    return {"status": "ok"}


def _contact_to_godaddy(contact) -> dict:
    return {
        "firstName": contact.first_name,
        "lastName": contact.last_name,
        "email": contact.email,
        "phone": contact.phone,
        "addressMailing": {
            "address1": contact.address1,
            "city": contact.city,
            "state": contact.state,
            "postalCode": contact.postal_code,
            "country": contact.country,
        },
    }
