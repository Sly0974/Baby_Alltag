import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import MahlzeitenPage from './components/MahlzeitenPage';
import OtherLogs from './components/OtherLogs';
import StatistikPage from './components/StatistikPage';
import KalenderPage from './components/KalenderPage';
import ErinnerungenPage from './components/ErinnerungenPage';
import ProfilPage from './components/ProfilPage';
import SettingsPage from './components/SettingsPage';
import PrintReport from './components/PrintReport';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, LogOut, Menu, X, Baby, 
  Home, Coffee, PlusCircle, BarChart2, Calendar, Bell, User, Settings, Sparkles 
} from 'lucide-react';

type TabType = 'dashboard' | 'mahlzeiten' | 'other' | 'statistik' | 'kalender' | 'erinnerungen' | 'profil' | 'settings';

function MainAppContent() {
  const { currentUser, logout, activeChild, children, setActiveChildId } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not logged in, show Auth Page
  if (!currentUser) {
    return <AuthPage />;
  }

  // Navigation tabs configuration
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home, color: 'text-rose-500 bg-rose-50' },
    { id: 'mahlzeiten' as TabType, label: 'Mahlzeiten', icon: Coffee, color: 'text-sky-500 bg-sky-50' },
    { id: 'other' as TabType, label: 'Protokolle', icon: PlusCircle, color: 'text-teal-500 bg-teal-50' },
    { id: 'statistik' as TabType, label: 'Statistik', icon: BarChart2, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'kalender' as TabType, label: 'Verlauf', icon: Calendar, color: 'text-amber-500 bg-amber-50' },
    { id: 'erinnerungen' as TabType, label: 'Reminders', icon: Bell, color: 'text-rose-500 bg-rose-50' },
    { id: 'profil' as TabType, label: 'Kinder', icon: Baby, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings, color: 'text-purple-500 bg-purple-50' },
  ];

  const handleTabChange = (tabId: TabType) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row antialiased text-[#2D3142] transition-colors duration-300 font-sans print:hidden">
      
      {/* 1. Mobile Top Navigation Header */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#748FFC] rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100/50 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            BabyCare+
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeChild && (
            <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <img 
                src={activeChild.photoUrl} 
                alt="baby" 
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover" 
              />
              <span className="text-[10px] font-bold text-indigo-600">{activeChild.name}</span>
            </div>
          )}
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200/40 text-gray-600 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Mobile Sliding Side Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 p-5 flex flex-col justify-between shadow-2xl md:hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#748FFC] rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100/50 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    BabyCare+
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation List */}
              <nav className="space-y-1.5">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-100/60' 
                          : 'text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-950'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom info */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100">
                  Rolle: {currentUser?.role}
                </span>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Desktop Permanent Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-gray-100 p-6 shrink-0 sticky top-0 h-screen shadow-sm">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-[#748FFC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-1">
              BabyCare+
            </span>
          </div>

          {/* Active Baby Dropdown Select */}
          {children.length > 0 && activeChild && (
            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Aktives Baby:</span>
              <div className="flex items-center gap-2.5">
                <img 
                  src={activeChild.photoUrl} 
                  alt="active" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                />
                <div className="flex-1 min-w-0">
                  <select
                    value={activeChild.id}
                    onChange={(e) => setActiveChildId(e.target.value)}
                    className="w-full bg-transparent font-bold text-indigo-950 text-xs outline-none border-none py-0.5 cursor-pointer"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="text-[9px] font-bold text-indigo-500 block">Profil geladen</span>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Tab links */}
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-100/60' 
                      : 'text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-950'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info Block & Logout */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.role[0]}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-700 truncate">{currentUser?.email}</p>
              <span className="text-[9px] font-semibold text-gray-400">Rolle: {currentUser?.role}</span>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="text-gray-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 4. Main Page Content Stage */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-60px)] md:min-h-screen overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'mahlzeiten' && <MahlzeitenPage />}
            {currentTab === 'other' && <OtherLogs />}
            {currentTab === 'statistik' && <StatistikPage />}
            {currentTab === 'kalender' && <KalenderPage />}
            {currentTab === 'erinnerungen' && <ErinnerungenPage />}
            {currentTab === 'profil' && <ProfilPage />}
            {currentTab === 'settings' && <SettingsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
    <PrintReport />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
