import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  onSelectionChange?: (line: number, column: number) => void;
  highlightRanges?: Array<{ line: number; column: number; endColumn: number }> | null;
};

const EditorPane = ({ value, onChange, language = 'tsx', onSelectionChange, highlightRanges }: Props) => {
  const [html, setHtml] = useState('');
  const [lines, setLines] = useState<number>(1);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLDivElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  // 合并所有高亮范围为连续区间（支持跨行）
  const mergedRange = highlightRanges && highlightRanges.length > 0
    ? (() => {
        // 找到所有涉及的行和列
        let minLine = Infinity;
        let maxLine = -Infinity;
        let minColumn = Infinity;
        let maxColumn = -Infinity;

        highlightRanges.forEach(range => {
          if (range.line < minLine || (range.line === minLine && range.column < minColumn)) {
            minLine = range.line;
            minColumn = range.column;
          }
          if (range.line > maxLine || (range.line === maxLine && range.endColumn > maxColumn)) {
            maxLine = range.line;
            maxColumn = range.endColumn;
          }
        });

        return { startLine: minLine, startColumn: minColumn, endLine: maxLine, endColumn: maxColumn };
      })()
    : null;

  useEffect(() => {
    let timer: number | null = null;
    let disposed = false;
    const update = async () => {
      try {
        const shiki = await import('shiki');
        const h = await shiki.codeToHtml(value || '', { lang: language, theme: 'github-light' });
        if (!disposed) setHtml(h);
      } catch {
        if (!disposed) setHtml(`<pre class="p-3">${value}</pre>`);
      }
    };
    timer = window.setTimeout(update, 200);
    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [value, language]);

  useEffect(() => {
    setLines((value || '').split('\n').length || 1);
  }, [value]);

  useEffect(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    const gut = gutterRef.current;
    if (!ta || !pre || !gut) return;
    const onScroll = () => {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
      gut.scrollTop = ta.scrollTop;
    };
    ta.addEventListener('scroll', onScroll);
    return () => {
      ta.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={gutterRef}
        className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none select-none text-right font-mono text-[13px] leading-[1.6]"
        style={{ width: 48, paddingTop: 12, paddingLeft: 12, paddingRight: 8 }}
      >
        {Array.from({ length: lines }).map((_, i) => {
          const lineNum = i + 1;
          const isHighlighted = mergedRange && lineNum >= mergedRange.startLine && lineNum <= mergedRange.endLine;
          return (
            <div key={i} style={{ color: isHighlighted ? '#d97706' : undefined }}>{lineNum}</div>
          );
        })}
      </div>
      {mergedRange && (() => {
        const { startLine, startColumn, endLine, endColumn } = mergedRange;

        // 单行高亮
        if (startLine === endLine) {
          return (
            <div
              className="absolute"
              style={{
                top: 12 + (startLine - 1) * 20.8,
                left: 60 + startColumn * 7.8,
                width: (endColumn - startColumn) * 7.8,
                height: 20.8,
                background: 'rgba(255,235,59,0.4)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          );
        }

        // 多行高亮：需要分段渲染
        const highlights = [];
        const codeLines = value.split('\n');

        for (let line = startLine; line <= endLine; line++) {
          const lineText = codeLines[line - 1] || '';
          let colStart = 0;
          let colEnd = lineText.length;

          if (line === startLine) {
            colStart = startColumn;
          }
          if (line === endLine) {
            colEnd = endColumn;
          }

          highlights.push(
            <div
              key={line}
              className="absolute"
              style={{
                top: 12 + (line - 1) * 20.8,
                left: 60 + colStart * 7.8,
                width: (colEnd - colStart) * 7.8,
                height: 20.8,
                background: 'rgba(255,235,59,0.4)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          );
        }

        return <>{highlights}</>;
      })()}
      <div
        ref={preRef}
        className="absolute inset-0 overflow-auto pointer-events-none editor-overlay font-mono text-[13px] leading-[1.6]"
        style={{ padding: 12, paddingLeft: 60 }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <textarea
        ref={taRef}
        className="absolute inset-0 w-full h-full resize-none outline-none font-mono text-[13px] leading-[1.6] bg-transparent caret-blue-600 text-transparent"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          const ta = taRef.current;
          if (!ta || !onSelectionChange) return;
          const idx = ta.selectionStart || 0;
          const before = (e.target.value || '').slice(0, idx);
          const parts = before.split('\n');
          const line = parts.length;
          const column = parts[parts.length - 1].length;
          onSelectionChange(line, column);
        }}
        onSelect={() => {
          const ta = taRef.current;
          if (!ta || !onSelectionChange) return;
          const idx = ta.selectionStart || 0;
          const before = (ta.value || '').slice(0, idx);
          const parts = before.split('\n');
          const line = parts.length;
          const column = parts[parts.length - 1].length;
          onSelectionChange(line, column);
        }}
        onKeyUp={() => {
          const ta = taRef.current;
          if (!ta || !onSelectionChange) return;
          const idx = ta.selectionStart || 0;
          const before = (ta.value || '').slice(0, idx);
          const parts = before.split('\n');
          const line = parts.length;
          const column = parts[parts.length - 1].length;
          onSelectionChange(line, column);
        }}
        onClick={() => {
          const ta = taRef.current;
          if (!ta || !onSelectionChange) return;
          const idx = ta.selectionStart || 0;
          const before = (ta.value || '').slice(0, idx);
          const parts = before.split('\n');
          const line = parts.length;
          const column = parts[parts.length - 1].length;
          onSelectionChange(line, column);
        }}
        wrap="off"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="code editor"
        style={{ tabSize: 2, padding: 12, paddingLeft: 60 }}
      />
    </div>
  );
};

export default EditorPane;