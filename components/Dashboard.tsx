
import React from 'react';
import { 
  Calendar, 
  ArrowRight, 
  HardHat, 
  ShieldCheck, 
  Activity,
  Plus,
  Trophy,
  Target
} from 'lucide-react';
import { SBO } from '../types';

interface DashboardProps {
  submissions: SBO[];
  onStartNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ submissions, onStartNew }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyCount = submissions.filter(s => {
    const d = new Date(s.timestamp);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const yearlyCount = submissions.filter(s => {
    const d = new Date(s.timestamp);
    return d.getFullYear() === currentYear;
  }).length;

  const monthlyTarget = 8;
  const yearlyTarget = 96;

  const monthlyProgress = Math.min((monthlyCount / monthlyTarget) * 100, 100);
  const yearlyProgress = Math.min((yearlyCount / yearlyTarget) * 100, 100);

  const latestDate = submissions.length > 0 
    ? new Date(submissions[0].timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-')
    : 'No submissions';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-blue-600 font-bold flex items-center gap-2">
            Operational Safety <ShieldCheck size={16} />
          </p>
        </div>
        <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
          <HardHat size={32} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Monthly Goal</span>
              <p className="text-3xl font-black text-slate-900">{monthlyCount} <span className="text-slate-300 text-lg">/ {monthlyTarget}</span></p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Target size={20} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm shadow-blue-200"
                style={{ width: `${monthlyProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
              <span>Performance</span>
              <span>{Math.round(monthlyProgress)}% Completed</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-white">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Year-to-Date</span>
              <p className="text-3xl font-black">{yearlyCount} <span className="text-slate-700 text-lg">/ {yearlyTarget}</span></p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl text-blue-400 backdrop-blur-md">
              <Trophy size={20} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${yearlyProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
              <span>Annual Progress</span>
              <span className="text-emerald-500">{Math.round(yearlyProgress)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Report Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={16} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Latest Record</p>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{latestDate}</h3>
          
          <button 
            onClick={onStartNew}
            className="w-full flex items-center justify-between bg-blue-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all btn-active shadow-xl shadow-blue-100"
          >
            Start Observation <ArrowRight size={18} />
          </button>
        </div>
        
        {/* Background Graphic */}
        <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-10 transform -rotate-12 transition-transform group-hover:rotate-0">
          <ShieldCheck size={140} />
        </div>
      </div>

      {/* Safety Prompt */}
      <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-emerald-900 text-[11px] font-black uppercase tracking-wider leading-none mb-1">Stay Vigilant</p>
          <p className="text-emerald-600/70 text-[10px] font-medium leading-tight">A safe workplace starts with a single observation. Every report matters.</p>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onStartNew}
        className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center btn-active transition-transform hover:scale-105 z-40 border-4 border-white"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Dashboard;
