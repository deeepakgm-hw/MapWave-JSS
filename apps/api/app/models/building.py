import uuid
import enum
from sqlalchemy import Column, String, Float, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base

class BuildingStatus(str, enum.Enum):
    existing = "existing"
    proposed = "proposed"

class Building(Base):
    __tablename__ = "buildings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    college_id = Column(UUID(as_uuid=True), nullable=True)
    name = Column(String, nullable=False)
    status = Column(Enum(BuildingStatus, name="building_status", native_enum=True), nullable=False, default=BuildingStatus.existing)
    footprint = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    height_m = Column(Float, nullable=True)

    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
