import React from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { MapView } from '../MapView';
import { 
  Clock, 
  Fuel, 
  Leaf, 
  Navigation, 
  Radio, 
  TrendingUp,
  Activity
} from 'lucide-react';

export const OverviewView = () => {
  const { metrics, events, nodes, edges } = useLiveData();

  return (
    <div className="main-view-container">
      {/* 1. Left Map Panel */}
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
          <Radio style={{ width: '14px', height: '14px', color: '#4C8DFF' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
            LIVE CORRIDOR DIGITAL TWIN
          </span>
          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(76, 141, 255, 0.2)', color: '#93C5FD', fontWeight: 600 }}>
            {nodes.length || 14} Nodes • {edges.length || 20} Links
          </span>
        </div>

        <MapView height="100%" showLegend={true} />
      </div>

      {/* 2. Right Metrics & Event Stream Sidebar */}
      <div className="overview-sidebar-col">
        {/* 2x2 Grid of KPI Cards */}
        <div className="metrics-2x2-grid">
          {/* Card 1: Delay */}
          <div className="metric-card-glass">
            <div className="metric-header">
              <span>Avg Delay</span>
              <Clock style={{ width: '16px', height: '16px', color: '#E8A33D' }} />
            </div>
            <div className="metric-value-row">
              <span className="metric-number">{metrics.avg_delay_mins}</span>
              <span className="metric-unit">mins/trip</span>
            </div>
            <div className="metric-footer" style={{ color: '#34D399' }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              <span>-18% vs peak baseline</span>
            </div>
          </div>

          {/* Card 2: CO2 Saved */}
          <div className="metric-card-glass">
            <div className="metric-header">
              <span>CO₂ Reduced</span>
              <Leaf style={{ width: '16px', height: '16px', color: '#2DB88C' }} />
            </div>
            <div className="metric-value-row">
              <span className="metric-number" style={{ color: '#2DB88C' }}>{metrics.total_co2_reduced_kg}</span>
              <span className="metric-unit">kg today</span>
            </div>
            <div className="metric-footer" style={{ color: '#2DB88C' }}>
              <span>+0.3 kg / 2s pulse</span>
            </div>
          </div>

          {/* Card 3: Fuel Saved */}
          <div className="metric-card-glass">
            <div className="metric-header">
              <span>Fuel Saved</span>
              <Fuel style={{ width: '16px', height: '16px', color: '#4C8DFF' }} />
            </div>
            <div className="metric-value-row">
              <span className="metric-number">{metrics.total_fuel_saved_liters}</span>
              <span className="metric-unit">liters</span>
            </div>
            <div className="metric-footer" style={{ color: '#60A5FA' }}>
              <span>OR-Tools CVRP routing</span>
            </div>
          </div>

          {/* Card 4: Active Reroutes */}
          <div className="metric-card-glass">
            <div className="metric-header">
              <span>Reroutes</span>
              <Navigation style={{ width: '16px', height: '16px', color: '#A855F7' }} />
            </div>
            <div className="metric-value-row">
              <span className="metric-number">{metrics.active_reroutes_count}</span>
              <span className="metric-unit">vehicles</span>
            </div>
            <div className="metric-footer" style={{ color: '#C084FC' }}>
              <span>Adaptive link bypass</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="sys-health-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(45, 184, 140, 0.15)', border: '1px solid rgba(45, 184, 140, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: '18px', height: '18px', color: '#2DB88C' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Autonomous Network Health</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>OR-Tools & ML Auto-Balancing</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399', fontFamily: 'monospace' }}>
              {metrics.system_health || '98.4'}%
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B' }}>Operational</span>
          </div>
        </div>

        {/* Live Event Feed */}
        <div className="event-feed-card">
          <div className="feed-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4C8DFF' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff' }}>
                Live Event Stream
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>Realtime Pipeline</span>
          </div>

          <div className="feed-list-scroll">
            {events.map((evt, idx) => {
              let badgeClass = 'badge-blue';
              let tag = 'CityFlow';
              if (evt.type === 'greenmile') {
                badgeClass = 'badge-teal';
                tag = 'GreenMile';
              } else if (evt.severity === 'warning' || evt.type === 'alert') {
                badgeClass = 'badge-amber';
                tag = 'Alert';
              }

              return (
                <div key={evt.id || idx} className="feed-item">
                  <div className="feed-item-header">
                    <span className={`glass-badge ${badgeClass}`}>{tag}</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748B', fontFamily: 'monospace' }}>{evt.time || 'now'}</span>
                  </div>
                  <div className="feed-item-msg">{evt.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
