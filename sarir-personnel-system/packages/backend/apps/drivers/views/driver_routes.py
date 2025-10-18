# packages/backend/apps/drivers/views/driver_routes.py

from fastapi import APIRouter, HTTPException
from apps.drivers.schemas.driver_schema import DriverCreate, DriverResponse
from apps.drivers.services.driver_service import create_driver, get_drivers

router = APIRouter(prefix="/api/drivers", tags=["drivers"])

@router.post("/", response_model=DriverResponse)
async def create(driver: DriverCreate):
    return await create_driver(driver)

@router.get("/", response_model=list[DriverResponse])
async def list_all():
    return await get_drivers()
