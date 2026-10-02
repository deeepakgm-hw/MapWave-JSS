# NavEdge entity model
import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, func
from app.db.base import Base

class NavEdge(Base):
    __tablename__ = "nav_edges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_node_id = Column(String, ForeignKey("nav_nodes.id"), nullable=False)
    to_node_id = Column(String, ForeignKey("nav_nodes.id"), nullable=False)
    weight_meters = Column(Float, nullable=False)
    is_accessible = Column(Boolean, default=True)
    bidirectional = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
