import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  code: string;
  language?: string;
  map?: string | Record<string, unknown> | null;
  sourceFile?: string;
  origin?: { line: number; column: number };
  onMappedLineChange?: (line: number | null) => void;
  onOriginalPosChange?: (pos: { line: number; column: number } | null) => void;
};

const OutputPane = ({ code, language = 'tsx', map = null, sourceFile, origin, onMappedLineChange, onOriginalPosChange }: Props) => {
  const [html, setHtml] = useState<string>('');
  const lines = useMemo(() => ((code || '').split('\n').length || 1), [code]);
  const [genLine, setGenLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const shiki = await import('shiki');
        const h = await shiki.codeToHtml(code || '', { lang: language, theme: 'github-light' });
        if (active) setHtml(h);
      } catch {
        if (active) setHtml(`<pre class="p-3">${code}</pre>`);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [code, language]);

  useEffect(() => {
    let disposed = false;
    const run = async () => {
      if (!map || !origin || !sourceFile) {
        setGenLine(null);
        return;
      }
      try {
        const sm = await import('source-map-js');
        const rawMap = typeof map === 'string' ? JSON.parse(map) : map;
        console.log('[SourceMap] Raw map:', rawMap);
        console.log('[SourceMap] Looking for origin:', { source: sourceFile, line: origin.line, column: origin.column });
        const consumer = await new sm.SourceMapConsumer(rawMap as SourceMapShape);
        const pos = consumer.generatedPositionFor({ source: sourceFile, line: origin.line, column: origin.column });
        console.log('[SourceMap] Generated position:', pos);
        const nextLine = pos.line || null;

        // 反向映射：从生成代码位置映射回源码位置
        if (nextLine && pos.column !== null) {
          const originalPos = consumer.originalPositionFor({ line: nextLine, column: pos.column });
          console.log('[SourceMap] Reverse mapped original position:', originalPos);
          if (!disposed && originalPos.line && originalPos.column !== null && onOriginalPosChange) {
            onOriginalPosChange({ line: originalPos.line, column: originalPos.column });
          }
        } else {
          if (!disposed && onOriginalPosChange) {
            onOriginalPosChange(null);
          }
        }

        if (!disposed) {
          setGenLine(nextLine);
          if (onMappedLineChange) onMappedLineChange(nextLine);
        }
      } catch (err) {
        console.error('[SourceMap] Error:', err);
        if (!disposed) {
          setGenLine(null);
          if (onMappedLineChange) onMappedLineChange(null);
          if (onOriginalPosChange) onOriginalPosChange(null);
        }
      }
    };
    run();
    return () => {
      disposed = true;
    };
  }, [map, origin, sourceFile, onMappedLineChange, onOriginalPosChange]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-auto code-output font-mono text-[13px] leading-[1.6]" style={{ padding: 12, paddingLeft: 60 }}>
      <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none select-none text-right" style={{ width: 48, paddingTop: 12, paddingLeft: 12, paddingRight: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ color: genLine === i + 1 ? '#d97706' : undefined }}>{i + 1}</div>
        ))}
      </div>
      {genLine ? (
        <div className="absolute left-[60px] right-0" style={{ top: 12 + (genLine - 1) * 20.8, height: 20.8, background: 'rgba(255,235,59,0.25)', zIndex: 1, pointerEvents: 'none' }} />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default OutputPane;
type SourceMapShape = {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  sourceRoot?: string;
  sourcesContent?: (string | null)[];
};