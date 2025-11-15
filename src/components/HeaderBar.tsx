import { useMemo } from 'react';

type Props = {
  filename: string;
  onFilenameChange: (v: string) => void;
  onCompile: () => void;
};

const HeaderBar = ({ filename, onFilenameChange, onCompile }: Props) => {
  const title = useMemo(() => 'React Compiler Inspector', []);
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <input
          className="h-9 px-2 rounded-md border outline-none focus:ring-2 focus:ring-blue-500"
          value={filename}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="Filename"
        />
        <button
          className="px-3 h-9 rounded-md border hover:bg-neutral-100"
          onClick={onCompile}
        >
          Compile
        </button>
      </div>
      <div className="flex items-center gap-2" />
    </div>
  );
};

export default HeaderBar;