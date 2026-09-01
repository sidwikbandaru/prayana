import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const LiveDataContext = createContext(null);

export const LiveDataProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [zones, setZones] = useState([]);
  const [presets, setPresets] = useState([]);
  const [metrics, setMetrics] = useState({
    avg_delay_mins: 4.2,
    total_fuel_saved_liters: 142.8,
    total_co2_reduced_kg: 384.5,
    active_reroutes_count: 8,
    congested_links_count: 3,
    active_fleet_count: 5,
    active_commuters_count: 5,
    system_health: 98.4
  });
  const [events, setEvents] = useState([
    { id: 1, time: "Just now", type: "greenmile", message: "EcoVan Alpha (GM-V01) completed smart dropoff at Koramangala.", severity: "success" },
    { id: 2, time: "1m ago", type: "cityflow", message: "Silk Board dynamic signal timing adjusted (+18% throughput).", severity: "info" },
    { id: 3, time: "2m ago", type: "alert", message: "Heavy corridor load (84%) detected at Bellandur-Marathahalli ORR.", severity: "warning" },
    { id: 4, time: "3m ago", type: "reroute", message: "CityFlow AI rerouted 14 commuter vehicles via Inner Ring Road.", severity: "info" }
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'citizen' | 'fleet' | 'authority'
  const [selectedRoute, setSelectedRoute] = useState(null);

  const wsRef = useRef(null);

  // 1. Fetch static/seed graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/graph');
        if (res.ok) {
          const data = await res.json();
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setZones(data.zones || []);
          setPresets(data.citizen_presets || []);
          if (data.citizen_presets && data.citizen_presets.length > 0) {
            setSelectedRoute(data.citizen_presets[0]);
          }
        }
      } catch (err) {
        console.warn('[Prayana Data] Initial REST fetch notice:', err);
      }
    };
    fetchGraphData();
  }, []);

  // 2. Establish persistent WebSocket connection
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // Directly connect to backend websocket port 8000
      const host = window.location.hostname || 'localhost';
      const wsUrl = `ws://${host}:8000/ws/live`;

      console.log('[Prayana WS] Connecting to:', wsUrl);
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[Prayana WS] Live simulation stream established');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'SIMULATION_UPDATE') {
              if (data.edges) setEdges(data.edges);
              if (data.vehicles) setVehicles(data.vehicles);
              if (data.fleet) setFleet(data.fleet);
              if (data.metrics) setMetrics(data.metrics);
              if (data.latest_events) {
                setEvents(data.latest_events);
              }
            }
          } catch (err) {
            console.error('[Prayana WS] Parse error:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = (err) => {
          console.warn('[Prayana WS] Socket notice:', err);
          ws.close();
        };
      } catch (err) {
        console.error('[Prayana WS] Init error:', err);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <LiveDataContext.Provider
      value={{
        nodes,
        edges,
        vehicles,
        fleet,
        zones,
        presets,
        metrics,
        events,
        isConnected,
        activeTab,
        setActiveTab,
        selectedRoute,
        setSelectedRoute
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within a LiveDataProvider');
  }
  return context;
};
