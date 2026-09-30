from fastapi import APIRouter
from app.api.v1.endpoints import auth, buildings, nav_graph, occupants

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(buildings.router, prefix="/buildings", tags=["Buildings & Floors"])
api_router.include_router(nav_graph.router, prefix="/nav", tags=["Navigation & Routing"])
api_router.include_router(occupants.router, prefix="/occupants", tags=["Faculty Directory"])
