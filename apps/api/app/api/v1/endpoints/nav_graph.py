# TODO: NavNode / NavEdge management and A* routing computation
from typing import List
from fastapi import APIRouter
from app.schemas.nav import NavNodeResponse, RouteRequest, RouteResponse

router = APIRouter()

@router.get("/nodes", response_model=List[NavNodeResponse])
def get_nav_nodes():
    # TODO: Fetch campus walkway and indoor waypoint nodes
    return []

@router.post("/route", response_model=RouteResponse)
def calculate_route(request: RouteRequest):
    # TODO: Solve shortest path using NetworkX A* solver and return step-by-step instructions
    return {
        "total_distance_meters": 0.0,
        "estimated_duration_seconds": 0,
        "segments": [],
        "path_coordinates": []
    }

@router.get("/checkpoints/{checkpoint_id}")
def locate_qr_checkpoint(checkpoint_id: str):
    # TODO: Resolve QR code payload to campus floor coordinates and nearest NavNode
    return {"checkpoint_id": checkpoint_id, "node_id": "placeholder-node-id"}
