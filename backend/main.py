"""
Prayana FastAPI Backend Server.
Unified Urban Mobility & Logistics Platform (CityFlow + GreenMile).
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph_data import NODES, RAW_EDGES, CITY_ZONES, CITIZEN_PRESETS, FLEET_VEHICLES_SEED
from ml_model import ml_engine
from optimizer import solve_fleet_cvrp, analyze_cargo_consolidation
from simulation import sim_engine
from database import Base, engine, get_db
from models import NodeModel, EdgeModel, VehicleModel

# Create database tables automatically
try:
    Base.metadata.create_all(bind=engine)
    print("[Prayana DB] Database schema created successfully.")
except Exception as e:
    print(f"[Prayana DB Warning] Schema creation notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background simulation broadcast task
    sim_task = asyncio.create_task(sim_engine.broadcast_loop())
    print("[Prayana Backend] Startup complete. WebSocket simulation active.")
    yield
    # Shutdown
    sim_engine.is_running = False
    sim_task.cancel()
    print("[Prayana Backend] Shutdown complete.")

app = FastAPI(
    title="Prayana API",
    description="Unified Urban Mobility & Logistics Platform (CityFlow + GreenMile)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local dev and frontend container
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic request models
class OptimizationRequest(BaseModel):
    depot_node: Optional[str] = "N6"
    demands: Optional[Dict[str, int]] = None
    num_vehicles: Optional[int] = 3
    vehicle_capacities: Optional[List[int]] = None

# --- Core Endpoints ---

@app.get("/")
def root():
    return {
        "service": "Prayana Urban Mobility Engine",
        "status": "online",
        "modules": ["CityFlow (Citizen Transit)", "GreenMile (Commercial Logistics)"],
        "docs_url": "/docs"
    }

@app.get("/graph")
@app.get("/api/graph")
def get_graph():
    """Returns the city road network, 14 nodes, edges, zones, and presets."""
    return {
        "nodes": list(NODES.values()),
        "edges": list(sim_engine.edges.values()),
        "zones": CITY_ZONES,
        "citizen_presets": CITIZEN_PRESETS
    }

@app.get("/vehicles")
@app.get("/api/vehicles")
def get_vehicles():
    """Returns active fleet and commuter vehicles."""
    return {
        "fleet": sim_engine.fleet_vehicles,
        "commuters": sim_engine.commuter_vehicles,
        "total_active": len(sim_engine.fleet_vehicles) + len(sim_engine.commuter_vehicles)
    }

@app.get("/predict/congestion")
@app.get("/api/predict/congestion")
def predict_congestion(
    hour: float = Query(18.5, description="Hour of the day (0.0 to 23.9)"),
    is_weekend: int = Query(0, description="0 for weekday, 1 for weekend"),
    capacity: float = Query(2400.0, description="Road vehicle capacity/hr"),
    vehicle_count: float = Query(2100.0, description="Current vehicle volume/hr"),
    weather_severity: float = Query(0.1, description="Weather severity (0.0 clear to 1.0 storm)"),
    incident_flag: int = Query(0, description="1 if active road incident, else 0")
):
    """
    Scikit-learn ML endpoint for real-time congestion and travel ETA prediction.
    """
    prediction = ml_engine.predict_congestion(
        hour=hour,
        is_weekend=is_weekend,
        capacity=capacity,
        vehicle_count=vehicle_count,
        weather_severity=weather_severity,
        incident_flag=incident_flag
    )
    return {
        "input_features": {
            "hour": hour,
            "is_weekend": bool(is_weekend),
            "capacity": capacity,
            "vehicle_count": vehicle_count,
            "weather_severity": weather_severity,
            "incident_flag": bool(incident_flag)
        },
        "prediction": prediction
    }

@app.post("/optimize/fleet")
@app.post("/api/optimize/fleet")
def optimize_fleet(request: OptimizationRequest = Body(default=None)):
    """
    Solves Capacitated Vehicle Routing Problem (CVRP) with Google OR-Tools.
    Detects cargo consolidation opportunities for under-loaded fleet vehicles.
    """
    req_dict = request.dict() if request else {}
    depot = req_dict.get("depot_node") or "N6"
    demands = req_dict.get("demands")
    num_vehicles = req_dict.get("num_vehicles") or 3
    capacities = req_dict.get("vehicle_capacities")
    
    # 1. Run OR-Tools VRP Solver
    vrp_solution = solve_fleet_cvrp(
        depot_node=depot,
        delivery_demands=demands,
        num_vehicles=num_vehicles,
        vehicle_capacities=capacities
    )
    
    # 2. Run Cargo Consolidation Analysis
    consolidation_report = analyze_cargo_consolidation(sim_engine.fleet_vehicles)
    
    return {
        "status": "success",
        "optimization": vrp_solution,
        "cargo_consolidation": consolidation_report
    }

@app.get("/zones")
@app.get("/api/zones")
def get_zones():
    """Returns city zones with computed average live congestion and metrics."""
    zones_data = []
    for zone in CITY_ZONES:
        # Compute avg congestion of zone nodes
        zone_node_ids = set(zone["nodes"])
        relevant_edges = [
            e for e in sim_engine.edges.values()
            if e["u"] in zone_node_ids or e["v"] in zone_node_ids
        ]
        if relevant_edges:
            avg_load = sum(e.get("current_load", 0.5) for e in relevant_edges) / len(relevant_edges)
        else:
            avg_load = zone["base_congestion"]
            
        load_score = round(avg_load, 2)
        if load_score < 0.40:
            status = "Smooth"
            color = "#2DB88C"
        elif load_score < 0.70:
            status = "Moderate"
            color = "#4C8DFF"
        elif load_score < 0.85:
            status = "Heavy"
            color = "#E8A33D"
        else:
            status = "Critical"
            color = "#E2574C"
            
        zones_data.append({
            "id": zone["id"],
            "name": zone["name"],
            "nodes": zone["nodes"],
            "congestion_score": load_score,
            "status": status,
            "color": color,
            "avg_speed_kmh": round(max(12.0, 48.0 * (1.0 - (load_score * 0.7))), 1)
        })
    return {"zones": zones_data}

@app.get("/metrics")
@app.get("/api/metrics")
def get_metrics():
    """Returns live city and fleet telemetry metrics."""
    return sim_engine.metrics

# --- WebSocket Live Stream ---

@app.websocket("/ws/live")
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    sim_engine.register_websocket(websocket)
    # Send initial snapshot immediately
    initial_snapshot = sim_engine.get_snapshot()
    await websocket.send_text(json.dumps(initial_snapshot))
    try:
        while True:
            # Keep connection alive and listen for client commands
            data = await websocket.receive_text()
            # If client sends a ping or trigger
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "PONG", "timestamp": asyncio.get_event_loop().time()}))
    except WebSocketDisconnect:
        sim_engine.unregister_websocket(websocket)
    except Exception:
        sim_engine.unregister_websocket(websocket)
