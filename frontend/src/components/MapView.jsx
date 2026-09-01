import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLiveData } from '../context/LiveDataContext';

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Custom DivIcon for nodes
const createNodeIcon = (type) => {
  let color = '#4C8DFF';
  if (type === 'logistics_depot') color = '#2DB88C';
  if (type === 'bottleneck') color = '#E2574C';
  if (type === 'tech_corridor') color = '#A855F7';

  return L.divIcon({
    className: 'custom-node-pin',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${color};
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 5px; height: 5px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
};

export const MapView = ({ height = '100%', showLegend = true, interactive = true, highlightVehicleId = null }) => {
  const { nodes, edges, vehicles } = useLiveData();

  const centerPosition = useMemo(() => {
    return [12.9352, 77.6445]; // Bangalore Central/East Corridor
  }, []);

  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [nodes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: height, borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer
        center={centerPosition}
        zoom={12.5}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="dark-osm-tiles"
        style={{ width: '100%', height: '100%', minHeight: '350px', background: '#0B1220' }}
      >
        {/* OpenStreetMap Standard Tiles with dark mode CSS filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapUpdater center={centerPosition} />

        {/* 1. Draw Road Edges with Dynamic Congestion Colors */}
        {edges.map((edge) => {
          const u = nodeMap[edge.u];
          const v = nodeMap[edge.v];
          if (!u || !v) return null;

          const load = edge.current_load || 0.35;
          let color = '#2DB88C'; // Smooth Green
          let weight = 4.5;
          let opacity = 0.8;

          if (load >= 0.85) {
            color = '#E2574C'; // Red Alert
            weight = 6;
            opacity = 0.95;
          } else if (load >= 0.70) {
            color = '#E8A33D'; // Amber Warning
            weight = 5;
            opacity = 0.9;
          } else if (load >= 0.45) {
            color = '#4C8DFF'; // Moderate Blue
            weight = 4.5;
            opacity = 0.85;
          }

          return (
            <Polyline
              key={edge.id}
              positions={[
                [u.lat, u.lng],
                [v.lat, v.lng]
              ]}
              pathOptions={{
                color: color,
                weight: weight,
                opacity: opacity,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: load > 0.85 ? '6, 6' : undefined
              }}
            >
              <Popup>
                <div style={{ padding: '4px', fontSize: '12px', color: '#1E293B', fontFamily: 'sans-serif' }}>
                  <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>{edge.name}</strong>
                  <div>Length: <b>{edge.dist_km} km</b></div>
                  <div>Congestion Load: <b style={{ color }}>{Math.round(load * 100)}%</b></div>
                  <div>Capacity: <b>{edge.capacity} veh/hr</b></div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Draw Graph Nodes */}
        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={createNodeIcon(node.type)}
          >
            <Popup>
              <div style={{ padding: '4px', fontSize: '12px', color: '#1E293B', fontFamily: 'sans-serif' }}>
                <strong style={{ display: 'block', fontSize: '13px' }}>{node.name}</strong>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>{node.zone} • {node.type}</span>
                <span style={{ display: 'inline-block', padding: '2px 6px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', fontWeight: 600, fontSize: '10px' }}>
                  Node: {node.id}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Draw Animated Moving Vehicles */}
        {vehicles.map((veh) => {
          if (!veh.lat || !veh.lng) return null;
          const isFleet = veh.category === 'fleet';
          const isHighlighted = highlightVehicleId === veh.id;
          const color = isFleet ? '#2DB88C' : '#4C8DFF';
          const radius = isHighlighted ? 8 : (isFleet ? 6.5 : 5);

          return (
            <CircleMarker
              key={veh.id}
              center={[veh.lat, veh.lng]}
              radius={radius}
              pathOptions={{
                color: isHighlighted ? '#FFFFFF' : color,
                fillColor: color,
                fillOpacity: 0.95,
                weight: isHighlighted ? 3 : 2
              }}
            >
              <Popup>
                <div style={{ padding: '4px', fontSize: '12px', color: '#1E293B', fontFamily: 'sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{isFleet ? '🚚' : '🚗'}</span>
                    <span>{veh.name || veh.id}</span>
                  </div>
                  <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                    <div>Type: <b style={{ textTransform: 'capitalize' }}>{veh.category}</b></div>
                    {isFleet && (
                      <>
                        <div>Load: <b>{veh.current_load_kg || 0} / {veh.capacity_kg} kg</b></div>
                        <div>Battery: <b>{veh.battery_pct}%</b></div>
                      </>
                    )}
                    {veh.current_leg && <div style={{ fontSize: '10px', color: '#64748B' }}>{veh.current_leg}</div>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      {showLegend && (
        <div 
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 1000,
            padding: '8px 14px',
            borderRadius: '12px',
            background: 'rgba(11, 18, 32, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2DB88C', display: 'inline-block' }} />
            <span style={{ color: '#E2E8F0' }}>GreenMile Fleet</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4C8DFF', display: 'inline-block' }} />
            <span style={{ color: '#E2E8F0' }}>CityFlow Commuters</span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: '#94A3B8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '3px', background: '#2DB88C', borderRadius: '2px' }} /> Smooth
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '3px', background: '#4C8DFF', borderRadius: '2px' }} /> Moderate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '3px', background: '#E8A33D', borderRadius: '2px' }} /> Heavy
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '3px', background: '#E2574C', borderRadius: '2px' }} /> Gridlock
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
