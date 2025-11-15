import { useMemo } from 'react';

type Props = {
  filename: string;
  onFilenameChange: (v: string) => void;
  onCompile: () => void;
  dark: boolean;
  onToggleDark: () => void;
};

const HeaderBar = ({ filename, onFilenameChange, onCompile, dark, onToggleDark }: Props) => {
  const title = useMemo(() => 'React Compiler Inspector', []);
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <input
          className="h-9 px-2 rounded-md border outline-none focus:ring-2 focus:ring-blue-500"
          value={filename}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="文件名"
        />
        <button
          className="px-3 h-9 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={onCompile}
        >
          编译
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 h-9 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={onToggleDark}
        >
          {dark ? '切换亮色' : '切换暗色'}
        </button>
      </div>
    </div>
  );
};

export default HeaderBar;