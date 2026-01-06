
import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  UserPlus, 
  CheckCircle, 
  ChevronRight,
  Filter,
  MoreVertical,
  X
} from 'lucide-react';
import { SBO, User, Comment } from '../types';
import { AREA_MANAGERS, MOCK_USERS } from '../constants';
import { addComment, reassignSBO, closeSBO, assignAction } from '../api';

interface ManagerDashboardProps {
  submissions: SBO[];
  currentUser: User;
  refresh: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ submissions, currentUser, refresh }) => {
  const [selectedSbo, setSelectedSbo] = useState<SBO | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');

  // HSE sees all open/pending. Managers see their assigned open/pending.
  const activeTasks = submissions.filter(s => 
    s.status !== 'closed' && (currentUser.role === 'hse' || s.areaMgr === currentUser.name)
  );

  const handleAction = async (action: 'comment' | 'reassign' | 'close' | 'assign', value?: string) => {
    if (!selectedSbo) return;

    if (action === 'comment' && commentText.trim()) {
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        text: commentText,
        timestamp: Date.now()
      };
      await addComment(selectedSbo.id, newComment);
      setCommentText('');
    } else if (action === 'reassign' && value) {
      await reassignSBO(selectedSbo.id, value);
      setIsReassigning(false);
    } else if (action === 'close') {
      await closeSBO(selectedSbo.id, currentUser.id);
    } else if (action === 'assign' && assigneeId) {
      await assignAction(selectedSbo.id, assigneeId);
      setIsAssigning(false);
      setAssigneeId('');
    }

    refresh();
    setSelectedSbo(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manager Hub</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            {currentUser.role === 'hse' ? 'HSE Oversight' : 'Action Required'}
          </p>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <Filter size={18} className="text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Open Cases</p>
          <p className="text-3xl font-black">{activeTasks.filter(t => t.status === 'open').length}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Pending Review</p>
          <p className="text-3xl font-black">{activeTasks.filter(t => t.status === 'pending').length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Work Queue</h3>
        {activeTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Queue Clear</p>
          </div>
        ) : (
          activeTasks.map(sbo => (
            <div 
              key={sbo.id} 
              onClick={() => setSelectedSbo(sbo)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${sbo.type === 'unsafe' ? 'bg-rose-50 text-rose-500' : 'bg-purple-50 text-purple-600'}`}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{sbo.category}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{sbo.location}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${sbo.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {sbo.status}
                  </span>
                  {sbo.isActionable && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700">
                      Action
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                {sbo.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-blue-600">EA</div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">JD</div>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedSbo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom-20 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Case Review</h3>
              <button onClick={() => setSelectedSbo(null)} className="p-2 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Observation Details</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">"{selectedSbo.description}"</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Take Action</label>
                <div className={`grid gap-3 ${selectedSbo.isActionable && !selectedSbo.actionAssigneeId ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => setIsReassigning(!isReassigning)}
                    className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 text-xs font-black uppercase tracking-wider"
                  >
                    <UserPlus size={16} /> Reassign
                  </button>
                  {selectedSbo.isActionable && !selectedSbo.actionAssigneeId && (
                    <button
                      onClick={() => setIsAssigning(!isAssigning)}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-200"
                    >
                      <UserPlus size={16} /> Assign Action
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction('close')}
                    className="flex items-center justify-center gap-2 p-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200"
                  >
                    <CheckCircle size={16} /> Close Case
                  </button>
                </div>
              </div>

              {isReassigning && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                  <select
                    onChange={(e) => handleAction('reassign', e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                  >
                    <option value="">Select New Manager</option>
                    {AREA_MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}

              {isAssigning && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                  >
                    <option value="">Select Assignee</option>
                    {MOCK_USERS.filter(u => u.role === 'observer').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button
                    onClick={() => handleAction('assign')}
                    disabled={!assigneeId}
                    className="w-full p-4 bg-blue-600 text-white rounded-2xl text-sm font-bold disabled:opacity-50"
                  >
                    Assign Action
                  </button>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Comments & Notes</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => handleAction('comment')}
                    className="p-4 bg-blue-600 text-white rounded-2xl"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
