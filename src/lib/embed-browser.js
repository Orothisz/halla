// /src/lib/embed-browser.js
let _pipe;
export async function getEmbedder() {
  if (_pipe) return _pipe;
  const { pipeline } = await import('@xenova/transformers');
  _pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return _pipe;
}

export async function embedText(text) {
  const pipe = await getEmbedder();
  const out = await pipe(text, { pooling: 'mean', normalize: true });
  // out.data is a Float32Array – convert to normal array for JSON
  return Array.from(out.data);
}
