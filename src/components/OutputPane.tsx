import { useEffect, useState } from 'react';

type Props = {
  code: string;
  language?: string;
};

const OutputPane = ({ code, language = 'tsx' }: Props) => {
  const [html, setHtml] = useState<string>('');

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
    <div className="w-full h-full overflow-auto code-output p-3 font-mono text-[13px] leading-[1.6]">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default OutputPane;