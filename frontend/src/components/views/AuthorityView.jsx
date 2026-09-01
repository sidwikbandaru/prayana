import React, { useState, useEffect } from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { 
  Building2, 
  ShieldAlert, 
  Activity, 
  Leaf, 
  Clock, 
  Sliders, 
  Zap, 
  CheckCircle2
} from 'lucide-react';

export const AuthorityView = () => {
  const { metrics } = useLiveData();
  const [zones, setZones] = useState([]);
  const [policies, setPolicies] = useState({
    congestion_pricing: true,
    eco_corridor_priority: true,
    commercial_time_window: false,
    metro_fare_subsidy: true
  });

  const defaultZones = [
    { id: 'central', name: 'Central Zone', congestion_score: 0.45, status: 'Moderate', color: '#4C8DFF', avg_speed_kmh: 34.2, nodes: ['N1'] },
    { id: 'east', name: 'East Zone', congestion_score: 0.52, status: 'Moderate', color: '#4C8DFF', avg_speed_kmh: 31.8, nodes: ['N2', 'N3', 'N11'] },
    { id: 'southeast', name: 'South-East Zone', congestion_score: 0.65, status: 'Heavy', color: '#E8A33D', avg_speed_kmh: 24.5, nodes: ['N4', 'N5', 'N12'] },
    { id: 'south', name: 'South Zone', congestion_score: 0.76, status: 'Critical', color: '#E2574C', avg_speed_kmh: 18.2, nodes: ['N6', 'N7', 'N13', 'N14'] },
    { id: 'orr', name: 'Outer Ring Road', congestion_score: 0.82, status: 'Critical', color: '#E2574C', avg_speed_kmh: 16.5, nodes: ['N8', 'N9'] },
    { id: 'whitefield', name: 'Whitefield IT Zone', congestion_score: 0.38, status: 'Smooth', color: '#2DB88C', avg_speed_kmh: 41.0, nodes: ['N10'] }
  ];

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/zones');
        if (res.ok) {
          const data = await res.json();
          if (data.zones && data.zones.length > 0) {
            setZones(data.zones);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch city zones:', err);
      }
    };
    fetchZones();
    const interval = setInterval(fetchZones, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeZonesList = zones.length > 0 ? zones : defaultZones;

  const togglePolicy = (key) => {
    setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeAlerts = [
    { id: 1, title: "Silk Board Interchange Bottleneck Overload", zone: "South Zone", severity: "critical", time: "Active Now", action: "Dynamic Signal Timings +15s green phase" },
    { id: 2, title: "Outer Ring Road High Density Congestion Alert", zone: "Outer Ring Road", severity: "warning", time: "2m ago", action: "CityFlow AI commuters rerouted via HAL bypass" },
    { id: 3, title: "Indiranagar 100ft Eco-Corridor Flow Normalization", zone: "East Zone", severity: "info", time: "5m ago", action: "GreenWave Signal priority active" }
  ];

  return (
    <div className="main-view-container authority-layout">
      {/* 1. Top 4 KPIs */}
      <div className="authority-top-kpis">
        {/* KPI 1 */}
        <div className="metric-card-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>City-Wide Delay</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{metrics.avg_delay_mins}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>mins/trip</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600 }}>↓ 22% delay reduction</span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(232, 163, 61, 0.15)', border: '1px solid rgba(232, 163, 61, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock style={{ width: '20px', height: '20px', color: '#E8A33D' }} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="metric-card-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>Est. CO₂ Reduced / Day</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2DB88C', fontFamily: 'var(--font-heading)' }}>{metrics.total_co2_reduced_kg}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>kg/day</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#2DB88C', fontWeight: 600 }}>Target: 500 kg/day (77%)</span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(45, 184, 140, 0.15)', border: '1px solid rgba(45, 184, 140, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf style={{ width: '20px', height: '20px', color: '#2DB88C' }} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="metric-card-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>Fuel Conserved</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{metrics.total_fuel_saved_liters}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>liters</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 600 }}>Fleet CVRP + Smart Reroutes</span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76, 141, 255, 0.15)', border: '1px solid rgba(76, 141, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: '20px', height: '20px', color: '#4C8DFF' }} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="metric-card-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>Congested Links</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', fontFamily: 'var(--font-heading)' }}>{metrics.congested_links_count}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>of 20 links</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Adaptive dynamic sync</span>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity style={{ width: '20px', height: '20px', color: '#A855F7' }} />
          </div>
        </div>
      </div>

      {/* 2. Zone Congestion Heatmap 3x2 Grid */}
      <div style={{ padding: '18px 22px', borderRadius: '20px', background: 'var(--glass-surface)', border: 'var(--glass-border)', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 style={{ width: '18px', height: '18px', color: '#4C8DFF' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF', letterSpacing: '0.04em' }}>
              City Zone Congestion Heatmap & Flow Matrix
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>Live Node Aggregator</span>
        </div>

        <div className="zone-grid-3x2">
          {activeZonesList.map((zone) => {
            const scorePct = Math.round((zone.congestion_score || 0.4) * 100);
            return (
              <div 
                key={zone.id}
                className="zone-card-glass"
                style={{ borderColor: zone.color ? `${zone.color}55` : undefined }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#FFFFFF' }}>{zone.name}</span>
                  <span 
                    className="glass-badge" 
                    style={{
                      background: `${zone.color}22`,
                      color: zone.color,
                      border: `1px solid ${zone.color}66`
                    }}
                  >
                    {zone.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Congestion Index:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: zone.color }}>{scorePct}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Avg Speed:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>{zone.avg_speed_kmh} km/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Nodes:</span>
                    <span style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{zone.nodes?.join(', ')}</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, scorePct)}%`, height: '100%', background: zone.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Row: Alerts & Policy Levers */}
      <div className="authority-bottom-split">
        {/* Active Alerts */}
        <div style={{ padding: '18px 20px', borderRadius: '18px', background: 'var(--glass-surface)', border: 'var(--glass-border)', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert style={{ width: '16px', height: '16px', color: '#E2574C' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
                Active Traffic Alerts & Incidents
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>3 Signals</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>({alert.zone})</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Action: {alert.action}
                  </div>
                </div>
                <span className={`glass-badge ${alert.severity === 'critical' ? 'badge-red' : 'badge-amber'}`}>
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Levers */}
        <div style={{ padding: '18px 20px', borderRadius: '18px', background: 'var(--glass-surface)', border: 'var(--glass-border)', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders style={{ width: '16px', height: '16px', color: '#4C8DFF' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
                Autonomous Policy Control Room
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#34D399', fontFamily: 'monospace' }}>Auto-Balancing Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Policy 1 */}
            <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Dynamic Congestion Pricing Surge</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Automatically discounts off-peak EV transit lanes</div>
              </div>
              <button 
                onClick={() => togglePolicy('congestion_pricing')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: policies.congestion_pricing ? 'rgba(45,184,140,0.2)' : 'rgba(255,255,255,0.06)',
                  border: policies.congestion_pricing ? '1px solid rgba(45,184,140,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: policies.congestion_pricing ? '#34D399' : '#94A3B8',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {policies.congestion_pricing ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Policy 2 */}
            <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>GreenWave Eco-Corridor Signal Priority</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Gives priority green phases to high-occupancy buses and EVs</div>
              </div>
              <button 
                onClick={() => togglePolicy('eco_corridor_priority')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: policies.eco_corridor_priority ? 'rgba(45,184,140,0.2)' : 'rgba(255,255,255,0.06)',
                  border: policies.eco_corridor_priority ? '1px solid rgba(45,184,140,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: policies.eco_corridor_priority ? '#34D399' : '#94A3B8',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {policies.eco_corridor_priority ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Policy 3 */}
            <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Commercial Fleet Off-Peak Delivery Window</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Restricts non-EV heavy cargo in peak hours (8-11 AM, 6-9 PM)</div>
              </div>
              <button 
                onClick={() => togglePolicy('commercial_time_window')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: policies.commercial_time_window ? 'rgba(45,184,140,0.2)' : 'rgba(255,255,255,0.06)',
                  border: policies.commercial_time_window ? '1px solid rgba(45,184,140,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: policies.commercial_time_window ? '#34D399' : '#94A3B8',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {policies.commercial_time_window ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
