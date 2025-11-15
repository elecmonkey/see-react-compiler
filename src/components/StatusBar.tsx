type Props = {
  compiling: boolean;
  timeMs: number;
  error: string | null;
  mappedLine?: number | null;
};

const StatusBar = ({ compiling, timeMs, error, mappedLine }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-10 border-t border-neutral-200 bg-white text-xs">
      <div className="flex items-center gap-2">
        <span className={compiling ? 'text-blue-600' : error ? 'text-red-600' : 'text-green-600'}>
          {compiling ? 'Compiling' : error ? 'Failed' : 'Success'}
        </span>
        {error ? <span className="text-red-600 truncate max-w-[480px]">{error}</span> : null}
      </div>
      <div className="flex items-center gap-3 text-neutral-500">
        <span>{timeMs ? `${Math.round(timeMs)}ms` : ''}</span>
        <span>{mappedLine ? `Mapped: ${mappedLine}` : ''}</span>
      </div>
    </div>
  );
};

export default StatusBar;