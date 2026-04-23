
type AlertType = 'error' | 'success' | 'info';

const styles: Record<AlertType, string> = {
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  success: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const icons: Record<AlertType, string> = {
  error: '✕',
  success: '✓',
  info: 'ℹ',
};

interface AlertMessageProps {
  type?: AlertType;
  message: string;
}

export function AlertMessage({ type = 'error', message }: AlertMessageProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      <span className="font-bold text-lg leading-none">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}