import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full no-print px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
            t.type === 'success'
              ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white border-blue-400/40 shadow-blue-950/50'
              : t.type === 'error'
              ? 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white border-rose-500/40 shadow-rose-950/40'
              : 'bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white border-sky-400/40 shadow-slate-950/50'
          }`}
        >
          {/* Top glowing accent bar */}
          <div
            className={`h-1 w-full ${
              t.type === 'success'
                ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400'
                : t.type === 'error'
                ? 'bg-gradient-to-r from-rose-400 to-amber-500'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500'
            }`}
          />

          <div className="p-4 flex items-start gap-3.5">
            {/* Glowing Icon Medallion */}
            <div
              className={`p-2 rounded-xl shrink-0 shadow-md ${
                t.type === 'success'
                  ? 'bg-gradient-to-tr from-sky-400 to-blue-600 text-white ring-2 ring-sky-300/30'
                  : t.type === 'error'
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white ring-2 ring-rose-400/30'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white ring-2 ring-cyan-300/30'
              }`}
            >
              {t.type === 'success' && <Sparkles className="w-5 h-5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {t.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            {/* Content Text */}
            <div className="flex-1 pr-2">
              <h4 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>{t.title}</span>
              </h4>
              {t.message && (
                <p className="mt-1 text-xs text-blue-100/90 leading-relaxed font-normal">
                  {t.message}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
