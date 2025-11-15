type BabelRuntime = {
  transform: (
    code: string,
    options: Record<string, unknown>,
  ) => {
    code?: string;
  };
};
let BabelLib: BabelRuntime | null = null;
let ReactCompilerLib: unknown = null;

type InMessage = {
  code: string;
  filename: string;
  options?: Record<string, unknown>;
};

type OutMessage = {
  code: string | null;
  error: string | null;
  time: number;
  map: string | Record<string, unknown> | null;
};

interface WorkerCtx {
  postMessage: (msg: OutMessage) => void;
  addEventListener: (type: 'message', listener: (e: MessageEvent<InMessage>) => void) => void;
}
const ctx = self as unknown as WorkerCtx;

const g = self as unknown as Record<string, unknown>;
if (!('window' in g)) g.window = self as unknown as Window;
if (!('globalThis' in g)) g.globalThis = self;
if (!('global' in g)) g.global = self;
if (!('process' in g)) g.process = { env: {} };

async function ensureLibs() {
  if (!BabelLib) {
    const m = await import('@babel/standalone');
    BabelLib = ((m as unknown as { default?: BabelRuntime })?.default ?? (m as unknown as BabelRuntime));
  }
  if (!ReactCompilerLib) {
    const m = await import('babel-plugin-react-compiler');
    ReactCompilerLib = ((m as unknown as { default?: unknown })?.default ?? (m as unknown as unknown));
  }
}

ctx.addEventListener('message', async (e: MessageEvent<InMessage>) => {
  const { code, filename, options } = e.data;
  const start = performance.now();
  let result: string | null = null;
  let error: string | null = null;
  let map: string | Record<string, unknown> | null = null;
  try {
    await ensureLibs();
    if (!BabelLib || !BabelLib.transform) {
      throw new Error('Babel runtime not loaded');
    }
    const r = BabelLib.transform(code, {
      filename,
      plugins: [[ReactCompilerLib as object, options || {}]],
      parserOpts: { sourceType: 'module', plugins: ['jsx', 'typescript'] },
      sourceMaps: true,
      sourceFileName: filename,
    });
    result = r.code || '';
    map = (r as unknown as { map?: string | Record<string, unknown> }).map || null;
  } catch (err) {
    error = String(err);
  }
  const end = performance.now();
  const msg: OutMessage = { code: result, error, time: end - start, map };
  ctx.postMessage(msg);
});