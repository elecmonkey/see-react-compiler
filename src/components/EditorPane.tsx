import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  dark?: boolean;
};

const EditorPane = ({ value, onChange, language = 'tsx', dark = false }: Props) => {
  const [html, setHtml] = useState('');
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: number | null = null;
    let disposed = false;
    const update = async () => {
      try {
        const shiki = await import('shiki');
        const theme = dark ? 'github-dark' : 'github-light';
        const h = await shiki.codeToHtml(value || '', { lang: language, theme });
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
  }, [value, language, dark]);

  useEffect(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    if (!ta || !pre) return;
    const onScroll = () => {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    };
    ta.addEventListener('scroll', onScroll);
    return () => {
      ta.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={preRef}
        className="absolute inset-0 overflow-auto pointer-events-none editor-overlay p-3 font-mono text-[13px] leading-[1.6]"
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <textarea
        ref={taRef}
        className="absolute inset-0 w-full h-full resize-none outline-none p-3 font-mono text-[13px] leading-[1.6] bg-transparent caret-blue-600 text-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        wrap="off"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="code editor"
        style={{ tabSize: 2 }}
      />
    </div>
  );
};

export default EditorPane;