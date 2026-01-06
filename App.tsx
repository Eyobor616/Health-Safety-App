
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
  Mail,
  Lock,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile 
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserSBOs } from "./api";
import Dashboard from './components/Dashboard';
import NewSBOForm from './components/NewSBOForm';
import SubmissionHistory from './components/SubmissionHistory';
import ManagerDashboard from './components/ManagerDashboard';
import Toast, { ToastType } from './components/Toast';
import { SBO, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'history' | 'manager'>('dashboard');
  const [submissions, setSubmissions] = useState<SBO[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const role: any = firebaseUser.email?.includes('manager') ? 'manager' : 
                           firebaseUser.email?.includes('hse') ? 'hse' : 'observer';
                           
          const userData: User = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'GZI Employee',
            id: firebaseUser.uid,
            dept: 'Operations',
            role: role
          };
          setUser(userData);
          await fetchData(firebaseUser.uid, role);
        } else {
          setUser(null);
          setSubmissions([]);
        }
      } catch (err) {
        showToast('Failed to sync data with server.', 'error');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
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
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        showToast('Account created successfully!', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back!', 'success');
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      let friendlyMessage = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found') friendlyMessage = 'No account found with this email.';
      if (err.code === 'auth/wrong-password') friendlyMessage = 'Incorrect password.';
      if (err.code === 'auth/email-already-in-use') friendlyMessage = 'This email is already registered.';
      if (err.code === 'auth/weak-password') friendlyMessage = 'Password should be at least 6 characters.';
      
      setLoginError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
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
        <p className="text-slate-500 mb-8">{isSignUp ? 'Create your safety profile' : 'Secure sign-in for authorized personnel'}</p>
        
        <form onSubmit={handleAuth} className="w-full space-y-4">
          {isSignUp && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email"
              placeholder="Corporate Email"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password"
              placeholder="Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                {isSignUp ? 'Register Account' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </button>
        
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
          <button onClick={() => signOut(auth)} className="text-slate-300 hover:text-rose-500"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard submissions={submissions} onStartNew={() => setActiveTab('form')} />}
        {activeTab === 'form' && <NewSBOForm onSubmit={handleAddSubmission} onCancel={() => setActiveTab('dashboard')} currentUser={user} />}
        {activeTab === 'history' && <SubmissionHistory submissions={submissions} />}
        {activeTab === 'manager' && <ManagerDashboard submissions={submissions} currentUser={user} refresh={refreshData} />}
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

        <button className="flex flex-col items-center gap-1 text-slate-300">
          <Settings size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
