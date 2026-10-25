import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl text-xs max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      {icons[toast.type]}
      <p className="font-medium leading-relaxed">{toast.message}</p>
    </div>
  );
};
