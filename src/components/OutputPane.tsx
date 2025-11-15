import { useEffect, useState } from 'react';

type Props = {
  code: string;
  language?: string;
  dark?: boolean;
};

const OutputPane = ({ code, language = 'tsx', dark = false }: Props) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const shiki = await import('shiki');
        const theme = dark ? 'github-dark' : 'github-light';
        const h = await shiki.codeToHtml(code || '', { lang: language, theme });
        if (active) setHtml(h);
      } catch {
        if (active) setHtml(`<pre class="p-3">${code}</pre>`);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [code, language, dark]);

  return (
    <div className="w-full h-full overflow-auto">
      <div className="shiki" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default OutputPane;