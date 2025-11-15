type Props = {
  compiling: boolean;
  timeMs: number;
  error: string | null;
};

const StatusBar = ({ compiling, timeMs, error }: Props) => {
  return (
    <div className="flex items-center justify-between px-4 h-10 border-t border-neutral-200 dark:border-neutral-800 text-xs">
      <div className="flex items-center gap-2">
        <span className={compiling ? 'text-blue-600' : error ? 'text-red-600' : 'text-green-600'}>
          {compiling ? 'Compiling' : error ? 'Failed' : 'Success'}
        </span>
        {error ? <span className="text-red-600 dark:text-red-500 truncate max-w-[480px]">{error}</span> : null}
      </div>
      <div className="text-neutral-500 dark:text-neutral-400">{timeMs ? `${Math.round(timeMs)}ms` : ''}</div>
    </div>
  );
};

export default StatusBar;