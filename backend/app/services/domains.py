import os
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env", override=False)


class GoDaddyClient:
    def __init__(self):
        api_key = os.environ.get("GODADDY_API_KEY", "")
        api_secret = os.environ.get("GODADDY_API_SECRET", "")
        ote = os.environ.get("GODADDY_OTE", "false").lower() == "true"

        host = "api.ote-godaddy.com" if ote else "api.godaddy.com"
        self._base_url = f"https://{host}"
        self._headers = {
            "Authorization": f"sso-key {api_key}:{api_secret}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _raise_for_status(self, response: httpx.Response) -> None:
        if response.is_success:
            return
        status = response.status_code
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise HTTPException(
            status_code=status if status < 500 else 502,
            detail=detail,
        )

    async def check_availability(
        self, domain: str, check_type: str = "FAST", for_transfer: bool = False
    ) -> dict:
        params = {"domain": domain, "checkType": check_type, "forTransfer": for_transfer}
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}/v1/domains/available",
                headers=self._headers,
                params=params,
            )
        self._raise_for_status(r)
        return r.json()

    async def check_availability_bulk(
        self, domains: list[str], check_type: str = "FAST"
    ) -> dict:
        params = {"checkType": check_type}
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self._base_url}/v1/domains/available",
                headers=self._headers,
                params=params,
                json=domains,
            )
        self._raise_for_status(r)
        return r.json()

    async def suggest(
        self,
        query: str,
        tlds: Optional[list[str]] = None,
        limit: int = 10,
        country: Optional[str] = None,
        city: Optional[str] = None,
    ) -> list[dict]:
        params: dict = {"query": query, "limit": limit}
        if tlds:
            params["tlds"] = ",".join(tlds)
        if country:
            params["country"] = country
        if city:
            params["city"] = city
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}/v1/domains/suggest",
                headers=self._headers,
                params=params,
            )
        self._raise_for_status(r)
        return r.json()

    async def list_tlds(self) -> list[dict]:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}/v1/domains/tlds",
                headers=self._headers,
            )
        self._raise_for_status(r)
        return r.json()

    async def list_domains(self, shopper_id: Optional[str] = None) -> list[dict]:
        headers = dict(self._headers)
        if shopper_id:
            headers["X-Shopper-Id"] = shopper_id
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}/v1/domains",
                headers=headers,
            )
        self._raise_for_status(r)
        return r.json()

    async def get_domain(self, domain: str, shopper_id: Optional[str] = None) -> dict:
        headers = dict(self._headers)
        if shopper_id:
            headers["X-Shopper-Id"] = shopper_id
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}/v1/domains/{domain}",
                headers=headers,
            )
        self._raise_for_status(r)
        return r.json()

    async def purchase(self, payload: dict, shopper_id: Optional[str] = None) -> dict:
        headers = dict(self._headers)
        if shopper_id:
            headers["X-Shopper-Id"] = shopper_id
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self._base_url}/v1/domains/purchase",
                headers=headers,
                json=payload,
            )
        self._raise_for_status(r)
        return r.json()

    async def renew(
        self,
        domain: str,
        period: Optional[int] = None,
        shopper_id: Optional[str] = None,
    ) -> dict:
        headers = dict(self._headers)
        if shopper_id:
            headers["X-Shopper-Id"] = shopper_id
        body = {}
        if period is not None:
            body["period"] = period
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self._base_url}/v1/domains/{domain}/renew",
                headers=headers,
                json=body if body else None,
            )
        self._raise_for_status(r)
        return r.json()

    async def get_records(
        self,
        domain: str,
        record_type: Optional[str] = None,
        name: Optional[str] = None,
    ) -> list[dict]:
        if record_type and name:
            path = f"/v1/domains/{domain}/records/{record_type}/{name}"
        elif record_type:
            path = f"/v1/domains/{domain}/records/{record_type}"
        else:
            path = f"/v1/domains/{domain}/records"
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self._base_url}{path}",
                headers=self._headers,
            )
        self._raise_for_status(r)
        return r.json()

    async def add_records(self, domain: str, records: list[dict]) -> None:
        async with httpx.AsyncClient() as client:
            r = await client.patch(
                f"{self._base_url}/v1/domains/{domain}/records",
                headers=self._headers,
                json=records,
            )
        self._raise_for_status(r)

    async def replace_records(
        self, domain: str, record_type: str, records: list[dict]
    ) -> None:
        async with httpx.AsyncClient() as client:
            r = await client.put(
                f"{self._base_url}/v1/domains/{domain}/records/{record_type}",
                headers=self._headers,
                json=records,
            )
        self._raise_for_status(r)

    async def delete_records(
        self, domain: str, record_type: str, name: str
    ) -> None:
        async with httpx.AsyncClient() as client:
            r = await client.delete(
                f"{self._base_url}/v1/domains/{domain}/records/{record_type}/{name}",
                headers=self._headers,
            )
        self._raise_for_status(r)


_client: Optional[GoDaddyClient] = None


def get_client() -> GoDaddyClient:
    global _client
    if _client is None:
        _client = GoDaddyClient()
    return _client
