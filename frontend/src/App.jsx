import React from 'react';
import { LiveDataProvider, useLiveData } from './context/LiveDataContext';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/views/OverviewView';
import { CitizenView } from './components/views/CitizenView';
import { FleetView } from './components/views/FleetView';
import { AuthorityView } from './components/views/AuthorityView';

const MainContent = () => {
  const { activeTab } = useLiveData();

  return (
    <main className="w-full flex-1">
      {activeTab === 'overview' && <OverviewView />}
      {activeTab === 'citizen' && <CitizenView />}
      {activeTab === 'fleet' && <FleetView />}
      {activeTab === 'authority' && <AuthorityView />}
    </main>
  );
};

export const App = () => {
  return (
    <LiveDataProvider>
      <div className="min-h-screen flex flex-col bg-[#0B1220] text-slate-100 selection:bg-teal-500 selection:text-white">
        <Navbar />
        <MainContent />
      </div>
    </LiveDataProvider>
  );
};

export default App;
