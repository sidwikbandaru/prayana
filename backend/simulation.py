"""
Real-time simulation engine for Prayana.
Advances commuter and commercial vehicle positions along graph paths.
Perturbs edge traffic loads every ~2 seconds and broadcasts live telemetry over WebSockets.
"""

import asyncio
import json
import random
import time
from typing import List, Dict, Any, Set
from fastapi import WebSocket
from graph_data import NODES, RAW_EDGES, FLEET_VEHICLES_SEED, COMMUTER_VEHICLES_SEED, CITY_ZONES
from ml_model import ml_engine

class SimulationEngine:
    def __init__(self):
        self.active_websockets: Set[WebSocket] = set()
        self.is_running = False
        self.tick_count = 0
        
        # Initialize dynamic edges
        self.edges = {e["id"]: dict(e) for e in RAW_EDGES}
        for e_id, e in self.edges.items():
            e["current_load"] = random.uniform(0.25, 0.65)
            e["speed_kmh"] = e["free_speed"] * (1.0 - (e["current_load"] * 0.6))
            
        # Initialize simulation vehicles with path routes
        self.fleet_vehicles = []
        for fv in FLEET_VEHICLES_SEED:
            veh = dict(fv)
            veh["category"] = "fleet"
            veh["current_node_idx"] = 0
            veh["progress"] = random.uniform(0.1, 0.9)
            self._update_vehicle_coordinates(veh)
            self.fleet_vehicles.append(veh)
            
        self.commuter_vehicles = []
        for cv in COMMUTER_VEHICLES_SEED:
            veh = dict(cv)
            veh["category"] = "commuter"
            veh["route_nodes"] = [cv["origin"], cv["destination"]]
            veh["current_node_idx"] = 0
            veh["progress"] = cv.get("progress", 0.3)
            self._update_vehicle_coordinates(veh)
            self.commuter_vehicles.append(veh)
            
        # Cumulative telemetry metrics
        self.metrics = {
            "avg_delay_mins": 4.2,
            "total_fuel_saved_liters": 142.8,
            "total_co2_reduced_kg": 384.5,
            "active_reroutes_count": 8,
            "congested_links_count": 3,
            "active_fleet_count": len(self.fleet_vehicles),
            "active_commuters_count": len(self.commuter_vehicles),
            "system_health": 98.4
        }
        
        # Live event log ticker
        self.event_feed = [
            {"id": 1, "time": "Just now", "type": "greenmile", "message": "EcoVan Alpha (GM-V01) completed smart dropoff at Koramangala.", "severity": "success"},
            {"id": 2, "time": "1m ago", "type": "cityflow", "message": "Silk Board dynamic signal timing adjusted (+18% throughput).", "severity": "info"},
            {"id": 3, "time": "2m ago", "type": "alert", "message": "Heavy corridor load (84%) detected at Bellandur-Marathahalli ORR.", "severity": "warning"},
            {"id": 4, "time": "3m ago", "type": "reroute", "message": "CityFlow AI rerouted 14 commuter vehicles via Inner Ring Road.", "severity": "info"}
        ]
        
    def _update_vehicle_coordinates(self, veh: Dict[str, Any]):
        """Interpolates lat/lng along the current segment of the vehicle's route."""
        nodes = veh.get("route_nodes", ["N1", "N2"])
        if len(nodes) < 2:
            start_n = NODES.get(nodes[0], NODES["N1"])
            veh["lat"] = start_n["lat"]
            veh["lng"] = start_n["lng"]
            return
            
        idx = veh["current_node_idx"] % (len(nodes) - 1)
        u_id = nodes[idx]
        v_id = nodes[idx + 1]
        
        u = NODES.get(u_id, NODES["N1"])
        v = NODES.get(v_id, NODES["N2"])
        
        prog = max(0.0, min(1.0, veh["progress"]))
        veh["lat"] = round(u["lat"] + (v["lat"] - u["lat"]) * prog, 6)
        veh["lng"] = round(u["lng"] + (v["lng"] - u["lng"]) * prog, 6)
        veh["current_leg"] = f"{u['name']} -> {v['name']}"

    def register_websocket(self, ws: WebSocket):
        self.active_websockets.add(ws)

    def unregister_websocket(self, ws: WebSocket):
        self.active_websockets.discard(ws)

    def advance_simulation_step(self):
        """Advances vehicle positions and perturbs road edge congestion."""
        self.tick_count += 1
        
        # 1. Advance Fleet Vehicles
        for fv in self.fleet_vehicles:
            if fv.get("status") == "active":
                fv["progress"] += random.uniform(0.04, 0.08)
                if fv["progress"] >= 1.0:
                    fv["progress"] = 0.0
                    nodes = fv.get("route_nodes", ["N1", "N2"])
                    fv["current_node_idx"] = (fv["current_node_idx"] + 1) % (len(nodes) - 1)
                self._update_vehicle_coordinates(fv)
                
        # 2. Advance Commuters
        for cv in self.commuter_vehicles:
            cv["progress"] += random.uniform(0.05, 0.10)
            if cv["progress"] >= 1.0:
                cv["progress"] = 0.0
                # Pick a new random target node for infinite city life
                cur_target = cv.get("destination", "N2")
                next_target = random.choice([k for k in NODES.keys() if k != cur_target])
                cv["route_nodes"] = [cur_target, next_target]
                cv["origin"] = cur_target
                cv["destination"] = next_target
                cv["current_node_idx"] = 0
            self._update_vehicle_coordinates(cv)

        # 3. Perturb Edge Loads using realistic noise
        congested_count = 0
        for e_id, edge in self.edges.items():
            # Small random walk perturbation
            delta = random.uniform(-0.04, 0.04)
            # Silk board or Bellandur naturally tend higher
            bias = 0.02 if edge["u"] in ["N7", "N8"] or edge["v"] in ["N7", "N8"] else 0.0
            edge["current_load"] = round(max(0.12, min(0.95, edge["current_load"] + delta + bias)), 3)
            
            # Color code based on load
            if edge["current_load"] < 0.40:
                edge["status_color"] = "#2DB88C" # Green
            elif edge["current_load"] < 0.70:
                edge["status_color"] = "#4C8DFF" # Blue
            elif edge["current_load"] < 0.85:
                edge["status_color"] = "#E8A33D" # Amber
                congested_count += 1
            else:
                edge["status_color"] = "#E2574C" # Red
                congested_count += 1

        # 4. Update Aggregate City Metrics
        self.metrics["congested_links_count"] = congested_count
        self.metrics["avg_delay_mins"] = round(3.5 + (congested_count * 0.9) + random.uniform(-0.2, 0.2), 1)
        self.metrics["total_fuel_saved_liters"] = round(self.metrics["total_fuel_saved_liters"] + 0.12, 1)
        self.metrics["total_co2_reduced_kg"] = round(self.metrics["total_co2_reduced_kg"] + 0.31, 1)
        
        # 5. Periodically inject live events
        if self.tick_count % 5 == 0:
            sample_events = [
                {"type": "greenmile", "message": f"GreenMile EV #{random.choice(['01', '02', '05'])} saved 2.4kg CO₂ via OR-Tools eco-routing.", "severity": "success"},
                {"type": "cityflow", "message": f"AI Congestion model rerouted {random.randint(4, 18)} commuters away from {random.choice(['Silk Board', 'Domlur Flyover', 'Bellandur Junction'])}.", "severity": "info"},
                {"type": "alert", "message": f"Dynamic toll discount applied on Outer Ring Road corridor.", "severity": "info"},
                {"type": "reroute", "message": f"Cargo consolidation event: 2 delivery routes unified into single EV.", "severity": "success"}
            ]
            new_event = random.choice(sample_events)
            new_event["id"] = int(time.time() * 1000)
            new_event["time"] = "Just now"
            self.event_feed.insert(0, new_event)
            if len(self.event_feed) > 15:
                self.event_feed.pop()

    def get_snapshot(self) -> Dict[str, Any]:
        """Returns the full unified state snapshot for WebSocket broadcast."""
        all_vehicles = self.fleet_vehicles + self.commuter_vehicles
        return {
            "type": "SIMULATION_UPDATE",
            "timestamp": time.time(),
            "tick": self.tick_count,
            "edges": list(self.edges.values()),
            "vehicles": all_vehicles,
            "fleet": self.fleet_vehicles,
            "metrics": self.metrics,
            "latest_events": self.event_feed[:6]
        }

    async def broadcast_loop(self):
        """Asynchronous broadcast loop ticking every ~2.0 seconds."""
        self.is_running = True
        print("[Prayana Engine] Background simulation loop started.")
        while self.is_running:
            self.advance_simulation_step()
            snapshot = self.get_snapshot()
            payload = json.dumps(snapshot)
            
            # Broadcast to all connected clients
            dead_sockets = set()
            for ws in list(self.active_websockets):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_sockets.add(ws)
                    
            for dead in dead_sockets:
                self.unregister_websocket(dead)
                
            await asyncio.sleep(2.0)

# Global simulation instance
sim_engine = SimulationEngine()
