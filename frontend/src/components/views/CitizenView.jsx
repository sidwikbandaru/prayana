import React, { useState, useEffect } from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { MapView } from '../MapView';
import { 
  Navigation, 
  MapPin, 
  BrainCircuit, 
  Clock, 
  Sparkles, 
  Leaf, 
  Car, 
  Train, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export const CitizenView = () => {
  const { presets } = useLiveData();
  const [selectedPresetId, setSelectedPresetId] = useState('route_1');
  const [mlPrediction, setMlPrediction] = useState(null);
  const [isLoadingMl, setIsLoadingMl] = useState(false);
  const [hourOfDay, setHourOfDay] = useState(18.5); // 6:30 PM evening rush
  const [selectedMode, setSelectedMode] = useState('smart_route');

  const defaultPresets = [
    { id: 'route_1', title: 'Central Hub -> ITPL Whitefield', distance_km: 16.5, base_duration_mins: 32, user_role: 'Daily Commute' },
    { id: 'route_2', title: 'Bellandur -> Koramangala', distance_km: 6.2, base_duration_mins: 18, user_role: 'Evening Return' },
    { id: 'route_3', title: 'HSR Depot -> MG Road', distance_km: 11.8, base_duration_mins: 25, user_role: 'Airport Express' }
  ];

  const activePresetsList = (presets && presets.length > 0) ? presets : defaultPresets;
  const activePreset = activePresetsList.find(p => p.id === selectedPresetId) || activePresetsList[0];

  useEffect(() => {
    const fetchMlPrediction = async () => {
      setIsLoadingMl(true);
      try {
        const params = new URLSearchParams({
          hour: hourOfDay.toString(),
          is_weekend: '0',
          capacity: '2400',
          vehicle_count: hourOfDay >= 17 && hourOfDay <= 20 ? '2800' : '1700',
          weather_severity: '0.15',
          incident_flag: selectedPresetId === 'route_2' ? '1' : '0'
        });

        const res = await fetch(`http://localhost:8000/api/predict/congestion?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMlPrediction(data.prediction);
        }
      } catch (err) {
        console.error('Failed to fetch ML congestion prediction:', err);
      } finally {
        setIsLoadingMl(false);
      }
    };

    fetchMlPrediction();
  }, [selectedPresetId, hourOfDay]);

  const calculatedEtaMins = mlPrediction 
    ? Math.round(activePreset.base_duration_mins * mlPrediction.eta_multiplier) 
    : activePreset.base_duration_mins;

  const timeSavedMins = Math.max(4, Math.round(calculatedEtaMins * 0.22));

  return (
    <div className="main-view-container citizen-layout">
      {/* 1. Phone Frame Mockup */}
      <div className="phone-mockup-frame">
        <div>
          {/* Header */}
          <div className="phone-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(76, 141, 255, 0.2)', border: '1px solid rgba(76, 141, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation style={{ width: '16px', height: '16px', color: '#4C8DFF' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>CityFlow Citizen</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Smart Multi-modal Commute</div>
              </div>
            </div>
            <span className="glass-badge badge-teal">
              <Leaf style={{ width: '10px', height: '10px' }} /> +180 GreenPts
            </span>
          </div>

          {/* Preset Route Buttons */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Select City Commute Pair
            </span>
            {activePresetsList.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`preset-route-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#60A5FA' : '#fff' }}>
                      {preset.title}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>
                      {preset.distance_km} km • {preset.user_role}
                    </div>
                  </div>
                  <ChevronRight style={{ width: '16px', height: '16px', color: isSelected ? '#60A5FA' : '#64748B' }} />
                </div>
              );
            })}
          </div>

          {/* Time of Day Slider */}
          <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
              <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px', height: '12px' }} /> Departure Hour
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
                {Math.floor(hourOfDay)}:{Math.floor((hourOfDay % 1) * 60).toString().padStart(2, '0')} {hourOfDay >= 12 ? 'PM' : 'AM'}
                {hourOfDay >= 17 && hourOfDay <= 20 ? ' (Peak)' : ''}
              </span>
            </div>
            <input 
              type="range" 
              min="6" 
              max="23" 
              step="0.5" 
              value={hourOfDay}
              onChange={(e) => setHourOfDay(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#4C8DFF', cursor: 'pointer' }}
            />
          </div>

          {/* ML AI Forecast Card */}
          <div className="ml-card-glow" style={{ borderColor: mlPrediction?.color ? `${mlPrediction.color}66` : 'rgba(76, 141, 255, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrainCircuit style={{ width: '16px', height: '16px', color: '#4C8DFF' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#fff' }}>
                  AI ML Prediction
                </span>
              </div>
              <span 
                className="glass-badge" 
                style={{
                  background: `${mlPrediction?.color || '#2DB88C'}22`,
                  color: mlPrediction?.color || '#2DB88C',
                  border: `1px solid ${mlPrediction?.color || '#2DB88C'}66`
                }}
              >
                {mlPrediction?.severity || 'Optimal'} Traffic
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '8px 0' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>Predicted Trip Duration</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    {calculatedEtaMins}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 600 }}>mins</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'line-through' }}>
                    {Math.round(calculatedEtaMins * 1.35)}m
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                  <TrendingDown style={{ width: '12px', height: '12px' }} /> -{timeSavedMins}m saved
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                  {mlPrediction?.estimated_speed_kmh || 38} km/h avg
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', color: '#E2E8F0', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.35 }}>
              💡 {mlPrediction?.recommendation || 'CityFlow AI calculated optimal signal timing corridor.'}
            </p>
          </div>
        </div>

        {/* Multi-modal choices */}
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
            Choose Transit Mode
          </span>
          <div className="modal-choices-grid">
            <div 
              onClick={() => setSelectedMode('smart_route')}
              className={`mode-pill-btn ${selectedMode === 'smart_route' ? 'active' : ''}`}
            >
              <Car style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#4C8DFF' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>CityFlow EV</div>
              <div style={{ fontSize: '0.6rem', color: '#34D399' }}>Fastest</div>
            </div>

            <div 
              onClick={() => setSelectedMode('metro')}
              className={`mode-pill-btn ${selectedMode === 'metro' ? 'active' : ''}`}
            >
              <Train style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#C084FC' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>Metro Rail</div>
              <div style={{ fontSize: '0.6rem', color: '#C084FC' }}>No Delays</div>
            </div>

            <div 
              onClick={() => setSelectedMode('green_pool')}
              className={`mode-pill-btn ${selectedMode === 'green_pool' ? 'active' : ''}`}
            >
              <Leaf style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#2DB88C' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>Green Pool</div>
              <div style={{ fontSize: '0.6rem', color: '#2DB88C' }}>+50 pts</div>
            </div>
          </div>

          <button className="btn-primary-blue">
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>Start AI Guided Commute</span>
          </button>
        </div>
      </div>

      {/* 2. Map Panel */}
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
          <MapPin style={{ width: '14px', height: '14px', color: '#4C8DFF' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
            {activePreset.title}
          </span>
        </div>

        <MapView height="100%" showLegend={true} />
      </div>
    </div>
  );
};
