"""Map services — thin wrapper over service_mapping service."""

from schemas.intelligence import MatchedService, Risk
from services.service_mapping import map_services_to_risks


async def map_services(risks: list[Risk]) -> list[MatchedService]:
    return map_services_to_risks(risks)
