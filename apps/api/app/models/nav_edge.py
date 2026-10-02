import uuid
import enum
from sqlalchemy import Column, Float, Boolean, Enum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class EdgeType(str, enum.Enum):
    corridor = "corridor"
    stairs = "stairs"
    lift = "lift"
    outdoor_path = "outdoor_path"

class NavEdge(Base):
    __tablename__ = "nav_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_node_id = Column(UUID(as_uuid=True), ForeignKey("nav_nodes.id", ondelete="CASCADE"), nullable=False)
    to_node_id = Column(UUID(as_uuid=True), ForeignKey("nav_nodes.id", ondelete="CASCADE"), nullable=False)
    weight = Column(Float, nullable=False)
    is_accessible = Column(Boolean, nullable=False, default=True)
    edge_type = Column(Enum(EdgeType, name="edge_type", native_enum=True), nullable=False)

    from_node = relationship("NavNode", foreign_keys=[from_node_id], back_populates="edges_from")
    to_node = relationship("NavNode", foreign_keys=[to_node_id], back_populates="edges_to")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
