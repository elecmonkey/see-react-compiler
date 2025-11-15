import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EditorPane from '../components/EditorPane';
import OutputPane from '../components/OutputPane';
import HeaderBar from '../components/HeaderBar';
import StatusBar from '../components/StatusBar';

const DEFAULT_CODE = `import React, { useState } from 'react';
export const Demo = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};`;

const Inspector = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [compiled, setCompiled] = useState<string>('');
  const [map, setMap] = useState<string | Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);
  const [filename, setFilename] = useState<string>('Demo.tsx');
  const workerRef = useRef<Worker | null>(null);
  const [compiling, setCompiling] = useState<boolean>(false);
  const [originPos, setOriginPos] = useState<{ line: number; column: number } | null>(null);
  const [mappedLine, setMappedLine] = useState<number | null>(null);
  const [reverseMappedPos, setReverseMappedPos] = useState<{ line: number; column: number } | null>(null);

  const runCompile = useCallback(
    (src: string) => {
      if (!workerRef.current) return;
      setCompiling(true);
      workerRef.current.postMessage({ code: src, filename, options: {} });
    },
    [filename],
  );

  useEffect(() => {
    const w = new Worker(new URL('../workers/compiler.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = w;
    const handler = (e: MessageEvent<{ code: string | null; error: string | null; time: number; map: string | Record<string, unknown> | null }>) => {
      setCompiling(false);
      setTime(e.data.time);
      setError(e.data.error);
      setCompiled(e.data.code || '');
      setMap(e.data.map || null);
    };
    w.addEventListener('message', handler);
    return () => {
      w.removeEventListener('message', handler);
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const debouncedCompile = useRef<number | null>(null);
  useEffect(() => {
    if (debouncedCompile.current) {
      window.clearTimeout(debouncedCompile.current);
    }
    debouncedCompile.current = window.setTimeout(() => {
      runCompile(code);
    }, 500);
    return () => {
      if (debouncedCompile.current) {
        window.clearTimeout(debouncedCompile.current);
        debouncedCompile.current = null;
      }
    };
  }, [code, runCompile]);

  const layout = useMemo(
    () => (
      <div className="grid grid-cols-[minmax(320px,1fr)_minmax(480px,1.2fr)] gap-4 p-4">
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm min-h-[480px] h-[calc(100vh-9rem)]">
          <EditorPane value={code} onChange={setCode} language="typescript" onSelectionChange={(line, column) => setOriginPos({ line, column })} highlightPos={reverseMappedPos} />
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm min-h-[480px] h-[calc(100vh-9rem)]">
          <OutputPane code={compiled} language="tsx" map={map} sourceFile={filename} origin={originPos || undefined} onMappedLineChange={setMappedLine} onOriginalPosChange={setReverseMappedPos} />
        </div>
      </div>
    ),
    [code, compiled, filename, map, originPos, reverseMappedPos],
  );

  return (
    <div className="pb-12">
      <HeaderBar
        filename={filename}
        onFilenameChange={setFilename}
        onCompile={() => runCompile(code)}
      />
      {layout}
      <StatusBar compiling={compiling} timeMs={time} error={error} mappedLine={mappedLine} />
    </div>
  );
};

export default Inspector;