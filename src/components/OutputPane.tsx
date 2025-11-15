import { useEffect, useMemo, useState } from 'react';

type Props = {
  code: string;
  language?: string;
};

const OutputPane = ({ code, language = 'tsx' }: Props) => {
  const [html, setHtml] = useState<string>('');
  const lines = useMemo(() => ((code || '').split('\n').length || 1), [code]);

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

  return (
    <div className="relative w-full h-full overflow-auto code-output font-mono text-[13px] leading-[1.6]" style={{ padding: 12, paddingLeft: 60 }}>
      <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none select-none text-right" style={{ width: 48, paddingTop: 12, paddingLeft: 12, paddingRight: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default OutputPane;