
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-600 shadow-emerald-200',
    error: 'bg-rose-600 shadow-rose-200',
    info: 'bg-blue-600 shadow-blue-200',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[1000] animate-in slide-in-from-top-10 duration-300`}>
      <div className={`${styles[type]} text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          {icons[type]}
          <p className="text-xs font-bold leading-tight">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
