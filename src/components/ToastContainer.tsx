import { useToast, type ToastType } from '../hooks/useToast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-brand-400 shrink-0" aria-hidden="true" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-surface-900/95',
  error: 'border-rose-500/40 bg-surface-900/95',
  warning: 'border-amber-500/40 bg-surface-900/95',
  info: 'border-brand-500/40 bg-surface-900/95',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md transition-all ${
            borderStyles[toast.type]
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-surface-100">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-surface-300 mt-0.5 break-words leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
