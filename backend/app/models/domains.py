from pydantic import BaseModel
from typing import Optional


class DomainContact(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    address1: str
    city: str
    state: str
    postal_code: str
    country: str


class DomainContacts(BaseModel):
    registrant: DomainContact
    admin: Optional[DomainContact] = None
    tech: Optional[DomainContact] = None
    billing: Optional[DomainContact] = None


class DomainPurchaseRequest(BaseModel):
    domain: str
    privacy: bool = False
    auto_renew: bool = True
    period: int = 1
    contacts: DomainContacts


class DomainAvailabilityResult(BaseModel):
    domain: str
    available: bool
    definitive: Optional[bool] = None
    price: Optional[int] = None
    currency: Optional[str] = None
    period: Optional[int] = None


class DomainRecord(BaseModel):
    type: str
    name: str
    data: str
    ttl: Optional[int] = 3600
    priority: Optional[int] = None
    service: Optional[str] = None
    protocol: Optional[str] = None
    port: Optional[int] = None
    weight: Optional[int] = None


class DomainDetail(BaseModel):
    domain: str
    domain_id: Optional[int] = None
    status: Optional[str] = None
    expires: Optional[str] = None
    auto_renew: Optional[bool] = None
    privacy: Optional[bool] = None
    name_servers: Optional[list[str]] = None
