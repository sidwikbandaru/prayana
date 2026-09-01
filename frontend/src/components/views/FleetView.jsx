import React, { useState } from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { MapView } from '../MapView';
import { 
  Truck, 
  BatteryCharging, 
  Sparkles, 
  Cpu, 
  RefreshCw,
  Boxes,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FleetView = () => {
  const { fleet } = useLiveData();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [consolidationResult, setConsolidationResult] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [appliedConsolidation, setAppliedConsolidation] = useState(false);

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('http://localhost:8000/api/optimize/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depot_node: 'N6',
          num_vehicles: 3,
          vehicle_capacities: [1000, 1200, 1500]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOptimizationResult(data.optimization);
        setConsolidationResult(data.cargo_consolidation);
        
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2DB88C', '#4C8DFF', '#34D399']
        });
      }
    } catch (err) {
      console.error('Failed to run OR-Tools fleet optimization:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyConsolidation = () => {
    setAppliedConsolidation(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2DB88C', '#F59E0B']
    });
  };

  const defaultFleet = [
    { id: "GM-V01", name: "EcoVan Alpha (EV)", driver: "Rohan M.", capacity_kg: 1000, current_load_kg: 350, route_nodes: ["N6", "N7", "N5", "N4"], status: "active", battery_pct: 84 },
    { id: "GM-V02", name: "UrbanTruck 02", driver: "Vikram S.", capacity_kg: 2500, current_load_kg: 900, route_nodes: ["N6", "N12", "N8", "N9"], status: "active", battery_pct: 71 },
    { id: "GM-V03", name: "SwiftRunner 03 (EV)", driver: "Ananya K.", capacity_kg: 800, current_load_kg: 720, route_nodes: ["N10", "N9", "N8"], status: "active", battery_pct: 65 },
    { id: "GM-V04", name: "CargoFlyer 04", driver: "Deepak P.", capacity_kg: 1500, current_load_kg: 400, route_nodes: ["N1", "N2", "N3", "N11"], status: "idle", battery_pct: 92 },
    { id: "GM-V05", name: "GreenHaul 05 (EV)", driver: "Pooja R.", capacity_kg: 1200, current_load_kg: 280, route_nodes: ["N5", "N4", "N3"], status: "active", battery_pct: 49 }
  ];

  const activeFleetList = (fleet && fleet.length > 0) ? fleet : defaultFleet;

  return (
    <div className="main-view-container fleet-layout">
      {/* 1. Left Telemetry & CVRP Controls */}
      <div className="fleet-left-col">
        {/* Banner */}
        <div className="fleet-header-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="glass-badge badge-teal">GreenMile Logistics</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                • 5 Active Commercial Vehicles
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Commercial Fleet Operations & CVRP
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '2px' }}>
              Google OR-Tools Guided Local Search + AI Cargo Consolidation
            </p>
          </div>

          <button
            id="btn-run-optimization"
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="btn-primary-teal"
          >
            {isOptimizing ? (
              <>
                <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                <span>Solving CVRP...</span>
              </>
            ) : (
              <>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>Run OR-Tools Optimization</span>
              </>
            )}
          </button>
        </div>

        {/* Cargo Consolidation Alert */}
        {consolidationResult?.opportunity_detected && (
          <div 
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: appliedConsolidation ? 'rgba(45, 184, 140, 0.12)' : 'rgba(232, 163, 61, 0.12)',
              border: appliedConsolidation ? '1px solid rgba(45, 184, 140, 0.4)' : '1px solid rgba(232, 163, 61, 0.4)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes style={{ width: '18px', height: '18px', color: appliedConsolidation ? '#34D399' : '#FBBF24' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
                  {appliedConsolidation ? 'Cargo Consolidation Active' : 'AI Cargo Consolidation Opportunity Detected'}
                </span>
              </div>
              <span className={`glass-badge ${appliedConsolidation ? 'badge-teal' : 'badge-amber'}`}>
                {appliedConsolidation ? 'Consolidated' : 'Low Utilization Flag'}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#E2E8F0', lineHeight: 1.4, marginBottom: '8px' }}>
              {appliedConsolidation ? (
                <span style={{ color: '#34D399', fontWeight: 600 }}>
                  ✓ Consolidated {consolidationResult.vehicle_b.name} into {consolidationResult.vehicle_a.name}. 1 truck returned to depot. Saving {consolidationResult.est_co2_reduction_kg} kg CO₂!
                </span>
              ) : (
                <>
                  Vehicles <b style={{ color: '#FBBF24' }}>{consolidationResult.vehicle_a.name}</b> ({consolidationResult.vehicle_a.utilization} load) and <b style={{ color: '#FBBF24' }}>{consolidationResult.vehicle_b.name}</b> ({consolidationResult.vehicle_b.utilization} load) share the <b>{consolidationResult.corridor_overlap}</b> corridor.
                </>
              )}
            </div>

            {!appliedConsolidation && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.7rem', color: '#CBD5E1' }}>
                  <span>Combined Load: <b style={{ color: '#fff' }}>{consolidationResult.combined_load_kg} kg</b></span>
                  <span>CO₂ Reduction: <b style={{ color: '#34D399' }}>+{consolidationResult.est_co2_reduction_kg} kg</b></span>
                </div>
                <button
                  onClick={handleApplyConsolidation}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(232, 163, 61, 0.2)',
                    border: '1px solid rgba(232, 163, 61, 0.5)',
                    color: '#FBBF24',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Apply Cargo Pooling</span>
                  <ArrowRight style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* OR-Tools Optimization Output Banner */}
        {optimizationResult?.success && (
          <div 
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(45, 184, 140, 0.15), rgba(11, 18, 32, 0.8))',
              border: '1px solid rgba(45, 184, 140, 0.4)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu style={{ width: '16px', height: '16px', color: '#2DB88C' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
                  OR-Tools Solution Generated
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#34D399', fontWeight: 700 }}>
                +{optimizationResult.efficiency_gain_pct}% Efficiency Gain
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Optimized</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{optimizationResult.total_optimized_km} km</span>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Baseline</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#64748B', textDecoration: 'line-through', fontFamily: 'monospace' }}>{optimizationResult.baseline_unoptimized_km} km</span>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Saved</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399', fontFamily: 'monospace' }}>-{optimizationResult.distance_reduction_km} km</span>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>CO₂ Abated</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#2DB88C', fontFamily: 'monospace' }}>+{optimizationResult.total_co2_reduction_kg} kg</span>
              </div>
            </div>

            {/* Routes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {optimizationResult.fleet_routes.map((rt) => (
                <div key={rt.vehicle_id} style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{rt.vehicle_name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(45,184,140,0.2)', color: '#34D399', fontFamily: 'monospace' }}>
                      {rt.assigned_load_kg}/{rt.capacity_kg} kg ({rt.utilization_pct}%)
                    </span>
                  </div>
                  <span style={{ color: '#34D399', fontWeight: 700, fontFamily: 'monospace' }}>
                    {rt.total_distance_km} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry Table */}
        <div className="fleet-table-wrap">
          <table className="custom-fleet-table">
            <thead>
              <tr>
                <th>Vehicle / Driver</th>
                <th>Route Corridor</th>
                <th>Cargo Load %</th>
                <th>Battery</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeFleetList.map((veh) => {
                const loadPct = Math.round((veh.current_load_kg / (veh.capacity_kg || 1000)) * 100);
                const isUnderloaded = loadPct < 45;
                const isSelected = selectedVehicleId === veh.id;

                return (
                  <tr 
                    key={veh.id}
                    onClick={() => setSelectedVehicleId(veh.id)}
                    style={{ background: isSelected ? 'rgba(45, 184, 140, 0.12)' : undefined, cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{veh.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace', marginTop: '2px' }}>
                        {veh.id} • {veh.driver}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#E2E8F0' }}>
                        {veh.route_nodes ? veh.route_nodes.join(' → ') : 'N6 → N7 → N5'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                        {veh.current_leg || 'En route'}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="load-bar-track">
                          <div 
                            className="load-bar-fill" 
                            style={{ 
                              width: `${Math.min(100, loadPct)}%`,
                              background: isUnderloaded ? '#FBBF24' : '#2DB88C'
                            }} 
                          />
                        </div>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: isUnderloaded ? '#FBBF24' : '#fff' }}>
                          {loadPct}%
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {veh.current_load_kg} / {veh.capacity_kg} kg
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', color: '#E2E8F0' }}>
                        <BatteryCharging style={{ width: '14px', height: '14px', color: '#34D399' }} />
                        <span>{veh.battery_pct || 85}%</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span className={`glass-badge ${veh.status === 'active' ? 'badge-teal' : 'badge-blue'}`}>
                        {veh.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right Map Panel */}
      <div className="overview-map-col">
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '12px',
            background: 'rgba(11, 18, 32, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <Truck style={{ width: '14px', height: '14px', color: '#2DB88C' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
            GREENMILE FLEET CORRIDOR MAP
          </span>
        </div>

        <MapView height="100%" showLegend={true} highlightVehicleId={selectedVehicleId} />
      </div>
    </div>
  );
};
