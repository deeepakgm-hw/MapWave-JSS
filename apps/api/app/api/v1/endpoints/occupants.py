# TODO: Faculty and staff room assignments and directory search
from typing import List, Optional
from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
def search_occupants(query: str):
    # TODO: Search faculty members by name, department, or office
    return []

@router.post("/assign")
def assign_room_occupant(room_id: str, faculty_name: str, department: Optional[str] = None):
    # TODO: Assign faculty member to room
    return {"status": "success", "room_id": room_id, "faculty_name": faculty_name}
