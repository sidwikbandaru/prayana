# Prayana (CityFlow + GreenMile) 🚀
> **Unified Urban Mobility & Logistics Intelligence Platform**  
> *Developed for the Smart India Hackathon (SIH) Prototype Pitch*

Prayana seamlessly bridges **citizen urban transit (CityFlow)** and **commercial fleet logistics (GreenMile)** on an integrated digital twin. Designed with a frosted **Glassmorphism design system**, real-time WebSocket simulation, Scikit-learn AI traffic forecasting, and Google OR-Tools CVRP fleet optimization.

---

## ✨ Key Features & Demo Walkthrough

### 1. 🌐 Overview (Digital Twin Road Network)
- **Live Leaflet Map**: 14-node high-density urban corridor (Central Hub, Silk Board, Domlur, Bellandur Tech Park, ITPL Whitefield).
- **Dynamic Edge Congestion**: Color-coded road segments updated live over WebSocket every ~2 seconds (`#2DB88C` Smooth, `#4C8DFF` Moderate, `#E8A33D` Congested, `#E2574C` Gridlock).
- **Pulsating Vehicle Markers**: Teal dots for GreenMile EV delivery fleets, blue dots for CityFlow commuters.
- **Live KPI Sidebar**: Real-time ticker for average delay, fuel conserved, CO₂ abated, and scrolling event stream.

### 2. 📱 Citizen App (CityFlow AI)
- **Glassmorphic Smartphone Mockup**: Preset route searches across major city commute pairs.
- **Scikit-Learn ML Congestion Engine**: Predicts real-time trip durations and bottleneck multipliers trained on temporal, weather, and volume factors.
- **Smart Multi-Modal Commute**: Instant comparison between CityFlow AI Eco-Route, Metro Rail Connector, and Shared EV Pools.

### 3. 🚚 Fleet Dashboard (GreenMile Logistics)
- **Commercial Fleet Telemetry**: Live tracking of cargo loads, battery levels, driver status, and active delivery corridors.
- **Google OR-Tools CVRP Solver**: Click **"Run OR-Tools Optimization"** to solve the Capacitated Vehicle Routing Problem with Guided Local Search.
- **AI Cargo Consolidation Proposal**: Automatically detects under-loaded vehicles (<50% capacity) on overlapping corridors to consolidate trips, eliminating dead-mileage and cutting emissions.

### 4. 🏛️ City Authority (Traffic Operations Control)
- **Zone Congestion Matrix**: Live health heatmaps for Central, East, South, and Outer Ring Road corridors.
- **Active Traffic Alerts**: Automated incident detection with dynamic signal adjustment recommendations.
- **Autonomous Policy Levers**: Interactive switches for Dynamic Congestion Pricing, GreenWave Eco-Corridors, and Commercial Delivery Windows.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, Leaflet, Lucide Icons, Canvas-Confetti | Glassmorphic Dark UI (`#0B1220` → `#131B2E`) with frosted blur panels |
| **Backend** | Python FastAPI, WebSockets, Uvicorn | High-throughput asynchronous event engine & REST APIs |
| **AI / ML** | Scikit-Learn (RandomForest Regressor) | Offline-trained model predicting traffic volume & ETA scaling |
| **Optimization** | Google OR-Tools v9 (`pywrapcp`) | CVRP solver for optimal multi-stop vehicle delivery routes |
| **Database** | PostgreSQL 15 (with SQLite fallback) | Auto-seeded relational schemas for nodes, edges, vehicles, logs |
| **Orchestration** | Docker & Docker Compose | Single-command launch for entire full-stack ecosystem |

---

## 🚀 Quickstart (One-Command Setup)

### Option A: Using Docker Compose (Recommended)
Make sure Docker Desktop is running, then execute:
```bash
docker compose up --build
```
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Development Run (Fast Native Launch)

#### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Key REST & WebSocket APIs

- `GET /api/graph` — Seeded 14-node road graph with lat/lng, capacities, and edges.
- `GET /api/vehicles` — Real-time telemetry of all moving fleet and commuter vehicles.
- `GET /api/predict/congestion?hour=18.5&vehicle_count=2400` — Scikit-learn ML congestion predictor.
- `POST /api/optimize/fleet` — Google OR-Tools CVRP solver & cargo pooling analyzer.
- `GET /api/zones` — City Authority zone congestion aggregations.
- `WS /ws/live` — 2-second real-time simulation broadcast stream.

---

*Prayana — Accelerating Sustainable Urban Transit & Green Logistics for Smarter Cities.*
