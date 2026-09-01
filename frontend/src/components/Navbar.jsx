import React, { useState, useEffect } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { 
  Compass, 
  Smartphone, 
  Truck, 
  Building2, 
  Wifi, 
  WifiOff, 
  Sparkles,
  Clock
} from 'lucide-react';

export const Navbar = () => {
  const { activeTab, setActiveTab, isConnected } = useLiveData();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: 'Live Map' },
    { id: 'citizen', label: 'Citizen App', icon: Smartphone, badge: 'CityFlow AI' },
    { id: 'fleet', label: 'Fleet Dashboard', icon: Truck, badge: 'GreenMile' },
    { id: 'authority', label: 'City Authority', icon: Building2, badge: 'Command' },
  ];

  return (
    <header className="navbar-header">
      {/* Brand Section */}
      <div className="brand-section">
        <div 
          className="brand-logo-icon"
          onClick={() => setActiveTab('overview')}
        >
          <Sparkles style={{ width: '24px', height: '24px' }} />
        </div>
        <div className="brand-text-wrap">
          <div className="brand-title-row">
            <span className="brand-name">PRAYANA</span>
            <span className="brand-tag">MVP v1.0</span>
          </div>
          <div className="brand-subtitle">
            <span style={{ color: '#4C8DFF', fontWeight: 600 }}>CityFlow</span>
            <span style={{ margin: '0 4px', color: '#64748B' }}>+</span>
            <span style={{ color: '#2DB88C', fontWeight: 600 }}>GreenMile</span>
            <span style={{ margin: '0 6px', color: '#475569' }}>•</span>
            <span>SIH Edition</span>
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs Pill */}
      <nav className="nav-pill-group">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          let activeClass = '';
          if (isActive) {
            activeClass = tab.id === 'fleet' ? 'active tab-fleet' : tab.id === 'citizen' ? 'active tab-citizen' : 'active';
          }

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab-btn ${activeClass}`}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
              <span>{tab.label}</span>
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Right Status Pill */}
      <div className="nav-right-status">
        <div className="time-pill">
          <Clock style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
          <span>{timeStr || '19:30:00'}</span>
        </div>

        <div className={`live-pill ${isConnected ? 'online' : 'offline'}`}>
          {isConnected && <span className="pulse-dot-indicator" />}
          {isConnected ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wifi style={{ width: '14px', height: '14px' }} /> LIVE 2s
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <WifiOff style={{ width: '14px', height: '14px' }} /> OFFLINE
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
