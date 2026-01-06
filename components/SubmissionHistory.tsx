
import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { SBO, SBOType } from '../types';

interface SubmissionHistoryProps {
  submissions: SBO[];
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions }) => {
  const [filter, setFilter] = useState('All');

  const filteredSubmissions = filter === 'All' 
    ? submissions 
    : submissions.filter(s => s.type === filter.toLowerCase().replace(' ', '-'));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Observation Reports</h2>
        <p className="text-slate-500 text-sm">View and track all submitted records.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Safe', 'Unsafe', 'Near Miss'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Search observations..." 
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium">No records matching your filters</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3 active:scale-98 transition-transform cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sub.type === 'safe' ? 'bg-green-100 text-green-600' : 
                    sub.type === 'unsafe' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {sub.type === 'safe' ? <CheckCircle2 size={18} /> : 
                     sub.type === 'unsafe' ? <AlertCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{sub.category}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{sub.subCategory}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    sub.status === 'closed' ? 'bg-green-500/10 text-green-600' : 
                    sub.status === 'open' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {sub.status}
                  </span>
                  <span className="text-[10px] text-slate-300">{new Date(sub.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed italic">
                  "{sub.description}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-slate-500">{sub.observer.name.charAt(0)}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{sub.location}</span>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;
