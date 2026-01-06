
import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Bell,
  Settings,
  WifiOff,
  AlertTriangle,
  ArrowRight,
  User as UserIcon,
  CheckSquare,
  BarChart3
} from 'lucide-react';
import { getUserSBOs } from "./api";
import Dashboard from './components/Dashboard';
import NewSBOForm from './components/NewSBOForm';
import SubmissionHistory from './components/SubmissionHistory';
import ManagerDashboard from './components/ManagerDashboard';
import ActionRecords from './components/ActionRecords';
import SummaryDashboard from './components/SummaryDashboard';
import Toast, { ToastType } from './components/Toast';
import { SBO, User } from './types';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'history' | 'manager' | 'actions' | 'summary'>('dashboard');
  const [submissions, setSubmissions] = useState<SBO[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Auth Form State
  const [username, setUsername] = useState('');

  // Toast state
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are currently offline. Changes will sync when reconnected.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async (uid: string, role: string) => {
    try {
      const data = await getUserSBOs(uid, role);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      const cached = localStorage.getItem(`gzi_sbo_cache_${uid}`);
      if (cached) setSubmissions(JSON.parse(cached));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);

    try {
      const foundUser = MOCK_USERS.find(u => u.name.toLowerCase() === username.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
        await fetchData(foundUser.id, foundUser.role);
        showToast(`Welcome back, ${foundUser.name}!`, 'success');
      } else {
        setLoginError('User not found.');
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      setLoginError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSubmissions([]);
    showToast('You have been signed out.', 'info');
  };

  const handleAddSubmission = async (entry: SBO) => {
    setSubmissions([entry, ...submissions]);
    showToast('Observation submitted successfully!', 'success');
    setActiveTab('dashboard');
  };

  const refreshData = () => {
    if (user) fetchData(user.id, user.role);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white items-center justify-center px-8 text-center py-10">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl mb-8">G</div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SAFETY MANAGER</h1>
        <p className="text-slate-500 mb-8">Secure sign-in for authorized personnel</p>
        
        <form onSubmit={handleAuth} className="w-full space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Enter your name"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-left animate-in fade-in slide-in-from-top-1">
              <p className="text-[10px] text-rose-500 font-bold leading-relaxed flex items-center gap-1">
                <AlertTriangle size={12} /> {loginError}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={authLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all btn-active active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {authLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 w-full">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Test Accounts</h3>
          <div className="space-y-2">
            {MOCK_USERS.map((mockUser) => (
              <button
                key={mockUser.id}
                onClick={() => setUsername(mockUser.name)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{mockUser.name}</span>
                    <span className="text-xs text-slate-500 ml-2">({mockUser.role})</span>
                  </div>
                  <span className="text-xs text-slate-400">{mockUser.dept}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-12 text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
          Proprietary System of GZI Industry<br/>
          Unauthorized Access is Strictly Prohibited
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 relative border-x border-slate-200 shadow-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {!isOnline && (
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-center gap-2 z-[60] sticky top-0">
          <WifiOff size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Offline Mode</span>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">G</div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-slate-800 leading-none">SAFETY MANAGER</h1>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
              {user.role === 'hse' ? 'Safety HQ' : user.role === 'manager' ? 'Ops Control' : 'Observer'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-300 hover:text-slate-900"><Bell size={18} /></button>
          <button onClick={handleLogout} className="text-slate-300 hover:text-rose-500"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard submissions={submissions} onStartNew={() => setActiveTab('form')} />}
        {activeTab === 'form' && <NewSBOForm onSubmit={handleAddSubmission} onCancel={() => setActiveTab('dashboard')} currentUser={user} />}
        {activeTab === 'history' && <SubmissionHistory submissions={submissions} />}
        {activeTab === 'manager' && <ManagerDashboard submissions={submissions} currentUser={user} refresh={refreshData} />}
        {activeTab === 'actions' && <ActionRecords currentUserId={user.id} />}
        {activeTab === 'summary' && <SummaryDashboard currentUser={user} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-around z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </button>
        
        {(user.role === 'manager' || user.role === 'hse') && (
          <button 
            onClick={() => setActiveTab('manager')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'manager' ? 'text-blue-600' : 'text-slate-300'}`}
          >
            <ShieldCheck size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Workflow</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-300'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">History</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'actions' ? 'text-blue-600' : 'text-slate-300'}`}
        >
          <CheckSquare size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'summary' ? 'text-blue-600' : 'text-slate-300'}`}
        >
          <BarChart3 size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Summary</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
