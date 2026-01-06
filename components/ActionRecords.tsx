import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { SBO, ActionStatus } from '../types';
import { getActionRecords, completeAction } from '../api';
import Toast, { ToastType } from './Toast';

interface ActionRecordsProps {
  currentUserId: string;
}

const ActionRecords: React.FC<ActionRecordsProps> = ({ currentUserId }) => {
  const [actions, setActions] = useState<SBO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  useEffect(() => {
    fetchActions();
  }, [currentUserId]);

  const fetchActions = async () => {
    try {
      const data = await getActionRecords(currentUserId);
      setActions(data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load action records.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (sboId: string) => {
    try {
      await completeAction(sboId);
      setActions(actions.map(action =>
        action.id === sboId ? { ...action, actionStatus: 'completed' as ActionStatus } : action
      ));
      setToast({ message: 'Action marked as completed.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to complete action.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle size={24} className="text-blue-600" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">My Action Items</h2>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No action items assigned.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      action.actionStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      action.actionStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {action.actionStatus?.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(action.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{action.category} - {action.subCategory}</h3>
                  <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                  {action.actionDeadline && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                      <Calendar size={14} />
                      <span>Deadline: {new Date(action.actionDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">Location: {action.location} • Unit: {action.unit}</p>
                </div>
                {action.actionStatus !== 'completed' && (
                  <button
                    onClick={() => handleComplete(action.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
              {action.suggestedSolution && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Suggested Solution</p>
                  <p className="text-sm text-slate-700">{action.suggestedSolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionRecords;