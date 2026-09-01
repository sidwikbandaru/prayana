"""
Hand-crafted 14-node urban road graph for Prayana.
Centered on a vibrant metropolitan tech & logistics corridor (Bangalore East-Central).
Fully offline seed data with realistic geographic coordinates, connections, and capacities.
"""

from typing import Dict, List, Any

# 14 Strategic City Nodes
NODES: Dict[str, Dict[str, Any]] = {
    "N1": {
        "id": "N1",
        "name": "Central Hub (MG Road)",
        "lat": 12.9756,
        "lng": 77.6066,
        "type": "transit_hub",
        "zone": "Central Zone",
        "demand_weight": 1.2
    },
    "N2": {
        "id": "N2",
        "name": "Indiranagar 100ft",
        "lat": 12.9719,
        "lng": 77.6412,
        "type": "commercial",
        "zone": "East Zone",
        "demand_weight": 1.1
    },
    "N3": {
        "id": "N3",
        "name": "Domlur Flyover Junction",
        "lat": 12.9609,
        "lng": 77.6387,
        "type": "junction",
        "zone": "East Zone",
        "demand_weight": 1.4
    },
    "N4": {
        "id": "N4",
        "name": "Koramangala 80ft",
        "lat": 12.9352,
        "lng": 77.6245,
        "type": "commercial",
        "zone": "South-East Zone",
        "demand_weight": 1.3
    },
    "N5": {
        "id": "N5",
        "name": "Sony World Junction",
        "lat": 12.9385,
        "lng": 77.6322,
        "type": "junction",
        "zone": "South-East Zone",
        "demand_weight": 1.5
    },
    "N6": {
        "id": "N6",
        "name": "HSR Sector 1 Depot",
        "lat": 12.9121,
        "lng": 77.6446,
        "type": "logistics_depot",
        "zone": "South Zone",
        "demand_weight": 0.8
    },
    "N7": {
        "id": "N7",
        "name": "Silk Board Interchange",
        "lat": 12.9176,
        "lng": 77.6238,
        "type": "bottleneck",
        "zone": "South Zone",
        "demand_weight": 1.8
    },
    "N8": {
        "id": "N8",
        "name": "Bellandur Eco-Tech Hub",
        "lat": 12.9304,
        "lng": 77.6784,
        "type": "tech_corridor",
        "zone": "Outer Ring Road",
        "demand_weight": 1.6
    },
    "N9": {
        "id": "N9",
        "name": "Marathahalli Bridge",
        "lat": 12.9569,
        "lng": 77.7011,
        "type": "junction",
        "zone": "Outer Ring Road",
        "demand_weight": 1.5
    },
    "N10": {
        "id": "N10",
        "name": "Whitefield ITPL Logistics Park",
        "lat": 12.9866,
        "lng": 77.7314,
        "type": "logistics_depot",
        "zone": "Whitefield Zone",
        "demand_weight": 1.0
    },
    "N11": {
        "id": "N11",
        "name": "Old Airport Road Express",
        "lat": 12.9575,
        "lng": 77.6681,
        "type": "arterial",
        "zone": "East Zone",
        "demand_weight": 1.2
    },
    "N12": {
        "id": "N12",
        "name": "Sarjapur Road Gate",
        "lat": 12.9190,
        "lng": 77.6690,
        "type": "residential_arterial",
        "zone": "South-East Zone",
        "demand_weight": 1.1
    },
    "N13": {
        "id": "N13",
        "name": "Electronic City Expressway Entry",
        "lat": 12.8452,
        "lng": 77.6602,
        "type": "expressway",
        "zone": "South Zone",
        "demand_weight": 1.3
    },
    "N14": {
        "id": "N14",
        "name": "Bannerghatta Ring Gateway",
        "lat": 12.8988,
        "lng": 77.5998,
        "type": "arterial",
        "zone": "South Zone",
        "demand_weight": 1.0
    }
}

# 20 Interconnected Road Graph Edges (Bidirectional connectivity)
RAW_EDGES: List[Dict[str, Any]] = [
    {"id": "E1", "u": "N1", "v": "N2", "dist_km": 4.2, "free_speed": 45, "capacity": 2500, "name": "MG-Indiranagar Link"},
    {"id": "E2", "u": "N2", "v": "N3", "dist_km": 2.1, "free_speed": 40, "capacity": 2200, "name": "100ft Domlur Connector"},
    {"id": "E3", "u": "N3", "v": "N4", "dist_km": 3.8, "free_speed": 35, "capacity": 2000, "name": "Inner Ring Road Domlur"},
    {"id": "E4", "u": "N4", "v": "N5", "dist_km": 1.2, "free_speed": 30, "capacity": 1800, "name": "80ft Sony Link"},
    {"id": "E5", "u": "N5", "v": "N7", "dist_km": 3.1, "free_speed": 35, "capacity": 2400, "name": "Koramangala Silk Connector"},
    {"id": "E6", "u": "N7", "v": "N6", "dist_km": 2.4, "free_speed": 40, "capacity": 2600, "name": "ORR Silk-HSR Stretch"},
    {"id": "E7", "u": "N6", "v": "N12", "dist_km": 3.0, "free_speed": 35, "capacity": 1900, "name": "HSR-Sarjapur Bypass"},
    {"id": "E8", "u": "N12", "v": "N8", "dist_km": 2.2, "free_speed": 40, "capacity": 2800, "name": "Sarjapur-Bellandur ORR"},
    {"id": "E9", "u": "N8", "v": "N9", "dist_km": 4.5, "free_speed": 45, "capacity": 3000, "name": "Bellandur-Marathahalli Tech Corridor"},
    {"id": "E10", "u": "N9", "v": "N10", "dist_km": 5.2, "free_speed": 50, "capacity": 2600, "name": "Marathahalli-ITPL Highway"},
    {"id": "E11", "u": "N3", "v": "N11", "dist_km": 3.4, "free_speed": 45, "capacity": 2100, "name": "Old Airport Flyover Segment"},
    {"id": "E12", "u": "N11", "v": "N9", "dist_km": 3.6, "free_speed": 40, "capacity": 2200, "name": "HAL-Marathahalli Main"},
    {"id": "E13", "u": "N7", "v": "N13", "dist_km": 9.5, "free_speed": 70, "capacity": 3500, "name": "Electronic City Elevated Expressway"},
    {"id": "E14", "u": "N7", "v": "N14", "dist_km": 4.1, "free_speed": 40, "capacity": 2000, "name": "Silk-Bannerghatta Link"},
    {"id": "E15", "u": "N1", "v": "N3", "dist_km": 3.9, "free_speed": 40, "capacity": 2300, "name": "Command Hospital Road"},
    {"id": "E16", "u": "N4", "v": "N6", "dist_km": 3.3, "free_speed": 35, "capacity": 1900, "name": "Koramangala-HSR Link Road"},
    {"id": "E17", "u": "N2", "v": "N11", "dist_km": 3.2, "free_speed": 40, "capacity": 2000, "name": "Indiranagar-Airport Road Link"},
    {"id": "E18", "u": "N8", "v": "N5", "dist_km": 5.0, "free_speed": 35, "capacity": 2100, "name": "Bellandur-Koramangala Green Channel"},
    {"id": "E19", "u": "N6", "v": "N13", "dist_km": 8.0, "free_speed": 60, "capacity": 3000, "name": "HSR-Electronic City Service Road"},
    {"id": "E20", "u": "N11", "v": "N10", "dist_km": 8.1, "free_speed": 45, "capacity": 2400, "name": "Varthur-Whitefield Express Link"}
]

# Zones grouping for City Authority
CITY_ZONES = [
    {"id": "central", "name": "Central Zone", "nodes": ["N1"], "base_congestion": 0.45},
    {"id": "east", "name": "East Zone", "nodes": ["N2", "N3", "N11"], "base_congestion": 0.52},
    {"id": "southeast", "name": "South-East Zone", "nodes": ["N4", "N5", "N12"], "base_congestion": 0.65},
    {"id": "south", "name": "South Zone", "nodes": ["N6", "N7", "N13", "N14"], "base_congestion": 0.72},
    {"id": "orr", "name": "Outer Ring Road", "nodes": ["N8", "N9"], "base_congestion": 0.81},
    {"id": "whitefield", "name": "Whitefield IT Zone", "nodes": ["N10"], "base_congestion": 0.58}
]

# Citizen App Preset Routes
CITIZEN_PRESETS = [
    {
        "id": "route_1",
        "title": "Daily Commute: Central Hub -> ITPL Whitefield",
        "origin_id": "N1",
        "destination_id": "N10",
        "distance_km": 16.5,
        "base_duration_mins": 32,
        "user_role": "Software Engineer",
        "modes": ["CityFlow Smart Route", "Metro + Micro-mobility", "Eco-EV Pool"]
    },
    {
        "id": "route_2",
        "title": "Evening Return: Bellandur -> Koramangala",
        "origin_id": "N8",
        "destination_id": "N4",
        "distance_km": 6.2,
        "base_duration_mins": 18,
        "user_role": "Product Manager",
        "modes": ["Green Corridor Transit", "Fast Cab Reroute", "Active Cycle Path"]
    },
    {
        "id": "route_3",
        "title": "Airport Express: HSR Depot -> MG Road",
        "origin_id": "N6",
        "destination_id": "N1",
        "distance_km": 11.8,
        "base_duration_mins": 25,
        "user_role": "Executive Traveler",
        "modes": ["Dynamic Priority Lane", "Metro Line Connector", "Direct Shuttle"]
    }
]

# Preset Fleet Vehicles for GreenMile
FLEET_VEHICLES_SEED = [
    {"id": "GM-V01", "name": "EcoVan Alpha (EV)", "driver": "Rohan M.", "capacity_kg": 1000, "current_load_kg": 350, "route_nodes": ["N6", "N7", "N5", "N4"], "status": "active", "battery_pct": 84, "co2_saved_kg": 14.2},
    {"id": "GM-V02", "name": "UrbanTruck 02", "driver": "Vikram S.", "capacity_kg": 2500, "current_load_kg": 900, "route_nodes": ["N6", "N12", "N8", "N9"], "status": "active", "battery_pct": 71, "co2_saved_kg": 22.8},
    {"id": "GM-V03", "name": "SwiftRunner 03 (EV)", "driver": "Ananya K.", "capacity_kg": 800, "current_load_kg": 720, "route_nodes": ["N10", "N9", "N8"], "status": "active", "battery_pct": 65, "co2_saved_kg": 18.5},
    {"id": "GM-V04", "name": "CargoFlyer 04", "driver": "Deepak P.", "capacity_kg": 1500, "current_load_kg": 400, "route_nodes": ["N1", "N2", "N3", "N11"], "status": "idle", "battery_pct": 92, "co2_saved_kg": 8.9},
    {"id": "GM-V05", "name": "GreenHaul 05 (EV)", "driver": "Pooja R.", "capacity_kg": 1200, "current_load_kg": 280, "route_nodes": ["N5", "N4", "N3"], "status": "active", "battery_pct": 49, "co2_saved_kg": 31.0}
]

# Simulated Commuters
COMMUTER_VEHICLES_SEED = [
    {"id": "CF-C101", "name": "Commuter Sedan #101", "type": "cab", "origin": "N1", "destination": "N10", "current_node": "N1", "target_node": "N2", "progress": 0.2},
    {"id": "CF-C102", "name": "Transit Bus #335E", "type": "bus", "origin": "N7", "destination": "N8", "current_node": "N7", "target_node": "N6", "progress": 0.6},
    {"id": "CF-C103", "name": "Metro Shuttle #42", "type": "shuttle", "origin": "N9", "destination": "N11", "current_node": "N9", "target_node": "N11", "progress": 0.4},
    {"id": "CF-C104", "name": "EV Carpool #88", "type": "carpool", "origin": "N14", "destination": "N7", "current_node": "N14", "target_node": "N7", "progress": 0.8},
    {"id": "CF-C105", "name": "Urban Rider #209", "type": "auto", "origin": "N3", "destination": "N4", "current_node": "N3", "target_node": "N4", "progress": 0.15}
]
