from typing import Annotated, Optional

from fastapi import APIRouter, Header, Query

from app.models.domains import DomainPurchaseRequest, DomainRecord
from app.services.domains import GoDaddyClient, get_client

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
