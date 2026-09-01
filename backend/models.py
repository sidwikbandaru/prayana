"""
SQLAlchemy DB Models for Prayana (CityFlow + GreenMile).
Stores nodes, road edges, fleet vehicles, and congestion event logs.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
from database import Base

class NodeModel(Base):
    __tablename__ = "nodes"
    
    id = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    node_type = Column(String(50), default="junction")
    zone = Column(String(50), default="Central")
    demand_weight = Column(Float, default=1.0)

class EdgeModel(Base):
    __tablename__ = "edges"
    
    id = Column(String(10), primary_key=True, index=True)
    u = Column(String(10), ForeignKey("nodes.id"), nullable=False)
    v = Column(String(10), ForeignKey("nodes.id"), nullable=False)
    name = Column(String(100), nullable=False)
    dist_km = Column(Float, nullable=False)
    free_speed = Column(Float, default=45.0)
    capacity = Column(Integer, default=2000)
    current_load = Column(Float, default=0.35) # 0.0 to 1.0 congestion

class VehicleModel(Base):
    __tablename__ = "vehicles"
    
    id = Column(String(20), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    driver = Column(String(100), nullable=True)
    category = Column(String(20), default="fleet") # "fleet" or "commuter"
    capacity_kg = Column(Integer, default=1000)
    current_load_kg = Column(Integer, default=0)
    battery_pct = Column(Integer, default=100)
    status = Column(String(30), default="active") # "active", "idle", "rerouting"
    co2_saved_kg = Column(Float, default=0.0)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

class EventLogModel(Base):
    __tablename__ = "event_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    category = Column(String(30)) # "reroute", "congestion", "optimization", "eco_milestone"
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info") # "info", "warning", "success", "alert"
