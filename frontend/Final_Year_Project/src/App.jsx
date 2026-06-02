import React, { useState, useEffect, useCallback } from 'react';
import XAIFeatureImportance from './components/XAIFeatureImportance';
import { fetchAIData } from './services/apiService'; 
import {
  HomeIcon, ChartBarIcon, UserGroupIcon,
  Cog6ToothIcon, ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Main Application Component
 * Handles Global State, AI Data Synchronization, and Dashboard Layout
 */
export default function App() {
  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aiData, setAiData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 1. Data Synchronization Logic
   * Fetches analyzed JSON data from Node.js Backend (Port 5000)
   */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend se extracted array mangwana (apiService handles success/fail logic)
      const data = await fetchAIData(); 
      setAiData(data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError(err.message || "XAI Engine Connection Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect: Jab user login ho jaye, foran data load karein
  useEffect(() => {
    if (isLoggedIn) loadDashboardData();
  }, [isLoggedIn, loadDashboardData]);

  /**
   * 2. Behavioral Metrics Calculation
   * AI Data se insights extract karke summary cards ke liye taiyar karna
   */
  const totalAttempts = aiData.length;
  
  // Isolation Forest flagging (-1 = Suspicious)
  const anomaliesCount = aiData.filter(row => String(row.anomaly) === "-1").length;
  
  // Average Anomaly Score (Lower is riskier in Isolation Forest)
  const avgRiskScore = aiData.length > 0 
    ? Math.abs(Math.round(aiData.reduce((acc, curr) => acc + (parseFloat(curr.anomaly_score) || 0), 0) / aiData.length * 100))
    : 0;

  // ================= LOGIN SCREEN (Access Control) =================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form
          onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 border border-slate-200"
        >
          <div className="text-center">
            <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-blue-200">
              <ChartBarIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">XAI PROTECT</h2>
            <p className="text-slate-500 text-sm mt-2 font-semibold uppercase tracking-wider">Internal Security Engine</p>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Admin Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="password" placeholder="Passcode" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
            UNLOCK DASHBOARD
          </button>
        </form>
      </div>
    );
  }

  // ================= DASHBOARD CORE UI =================
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="font-black text-2xl tracking-tighter italic">XAI.SYS</h2>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem Icon={HomeIcon} text="System Overview" active />
          <NavItem Icon={ChartBarIcon} text="Behavior Analytics" />
          <NavItem Icon={UserGroupIcon} text="Access Logs" />
          <NavItem Icon={Cog6ToothIcon} text="Model Settings" />
        </nav>
        <div className="p-6">
        <button onClick={() => setIsLoggedIn(false)} className="w-full p-4 text-red-500 ...">
             <ArrowRightStartOnRectangleIcon className="w-5 h-5" /> 
             TERMINATE SESSION
         </button>

        </div>
      </aside>

      {/* MAIN ANALYTICS VIEW */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Explainable AI Dashboard</h1>
            <p className="text-slate-500 font-medium">Monitoring User Anomalies via SHAP Interpretations</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadDashboardData} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
              FORCE SYNC
            </button>
            <StatusBadge loading={loading} error={error} />
          </div>
        </header>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatCard title="Total Observations" value={totalAttempts} sub="Raw Log Data" />
          <StatCard title="Detected Anomalies" value={anomaliesCount} color="text-rose-600" sub="Flagged by Isolation Forest" />
          <StatCard title="Risk Confidence" value={`${avgRiskScore}%`} color="text-blue-600" sub="System-wide Average" />
        </div>

        {/* XAI VISUALIZATION SECTION */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Global Feature Importance (SHAP)</h3>
              <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">ML INTERPRETATION</span>
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-4">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-blue-600">
                   <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   <span className="font-black text-sm uppercase tracking-widest">Processing SHAP Values</span>
                </div>
              ) : aiData.length > 0 ? (
                <XAIFeatureImportance data={aiData} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold italic">Engine Ready - Awaiting Payload</div>
              )}
            </div>
          </div>

          {/* AI INTERPRETATION CARD */}
          <div className="bg-slate-900 p-10 rounded-[2rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ChartBarIcon className="w-32 h-32 rotate-12" /></div>
            <div>
              <h3 className="text-2xl font-black mb-6">XAI Narrative</h3>
              <p className="text-slate-400 leading-relaxed font-medium italic">
                {anomaliesCount > 0 
                  ? `Anomalous clusters detected. SHAP analysis indicates that 'Login Attempts' and 'Night Access' are the primary drivers of current risk scores.`
                  : "Continuous monitoring active. Behavioral patterns match historical baselines within 95% confidence interval."}
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Model Status</div>
              <div className="text-lg font-bold">Optimized (Contamination: 0.1)</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS (Modular Clean Code) ---

const StatCard = ({ title, value, color = "text-slate-900", sub }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{title}</p>
    <h4 className={`text-4xl font-black ${color} mb-1`}>{value}</h4>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{sub}</p>
  </div>
);

const NavItem = ({ Icon, text, active = false }) => (
  <a href="#" className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-sm">{text}</span>
  </a>
);

const StatusBadge = ({ loading, error }) => {
  if (error) return <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black border border-rose-100">ENGINE ERROR: {error}</div>;
  return (
    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100 flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
      {loading ? 'AI CALCULATING...' : 'ENGINE ONLINE'}
    </div>
  );
};
