interface ErrorAlertProps {
  children: string;
  className?: string;
}

export function ErrorAlert({ children, className = "" }: ErrorAlertProps) {
  return (
    <div className={`bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg ${className}`}>
      {children}
    </div>
  );
}
