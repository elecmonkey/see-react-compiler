import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  onSelectionChange?: (line: number, column: number) => void;
  highlightPos?: { line: number; column: number } | null;
};

const EditorPane = ({ value, onChange, language = 'tsx', onSelectionChange, highlightPos }: Props) => {
  const [html, setHtml] = useState('');
  const [lines, setLines] = useState<number>(1);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLDivElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

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
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ color: highlightPos?.line === i + 1 ? '#d97706' : undefined }}>{i + 1}</div>
        ))}
      </div>
      {highlightPos ? (
        <div className="absolute left-[60px] right-0" style={{ top: 12 + (highlightPos.line - 1) * 20.8, height: 20.8, background: 'rgba(255,235,59,0.25)', zIndex: 1, pointerEvents: 'none' }} />
      ) : null}
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