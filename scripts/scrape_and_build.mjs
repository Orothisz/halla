// /scripts/scrape_and_build.mjs
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pdfParse from 'pdf-parse';
import { pipeline as make } from '@xenova/transformers';
import { SOURCES } from './scrape_sources.mjs';

const OUTDIR = path.resolve(process.cwd(), 'public', 'wilt_index');
const SHARD_SIZE = 500;           // chunks per shard
const DIM = 384;                  // MiniLM dimension

function chunkText(txt, max=900, overlap=120) {
  const words = txt.split(/\s+/);
  const chunks = [];
  for (let i=0; i<words.length; i+= (max-overlap)) {
    const part = words.slice(i, i+max).join(' ');
    if (part.trim().length > 200) chunks.push(part.trim());
  }
  return chunks;
}

async function fetchText(u) {
  const r = await fetch(u);
  const buf = Buffer.from(await r.arrayBuffer());
  if (/\.pdf($|\?)/i.test(u) || buf.slice(0,4).toString() === '%PDF') {
    const data = await pdfParse(buf).catch(()=>null);
    return data?.text || '';
  }
  // fallback: plaintext
  return buf.toString('utf8');
}

function cosine(a, b) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-9);
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });

  console.log('Loading MiniLM…');
  const emb = await make('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const docs = [];
  for (const { url, title } of SOURCES) {
    console.log('Fetching:', title);
    let text = '';
    try { text = await fetchText(url); } catch { text = ''; }
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const chunks = chunkText(text);
    for (const t of chunks) {
      docs.push({ title, url, text: t });
    }
  }

  console.log('Embedding', docs.length, 'chunks…');
  const vectors = [];
  for (let i=0;i<docs.length;i++) {
    const out = await emb(docs[i].text, { pooling: 'mean', normalize: true });
    vectors.push(Array.from(out.data)); // Float32Array -> number[]
    if ((i+1)%200===0) console.log(`  ${i+1}/${docs.length}`);
  }

  // Write shards
  const shards = [];
  let shardIdx = 0;
  for (let i=0; i<docs.length; i+=SHARD_SIZE) {
    const ids = [], embs = [], texts = [], meta = [];
    const slice = docs.slice(i, i+SHARD_SIZE);
    const vecs = vectors.slice(i, i+SHARD_SIZE);
    for (let j=0;j<slice.length;j++) {
      ids.push(`d${i+j}`);
      embs.push(vecs[j]);
      texts.push(slice[j].text);
      meta.push({ title: slice[j].title, url: slice[j].url });
    }
    const shard = { ids, embeddings: embs, texts, meta };
    const file = `shard-${String(shardIdx).padStart(3,'0')}.json`;
    fs.writeFileSync(path.join(OUTDIR, file), JSON.stringify(shard));
    shards.push({ id: String(shardIdx), url: `/wilt_index/${file}`, size: slice.length });
    shardIdx++;
  }

  const manifest = {
    dim: DIM,
    createdAt: new Date().toISOString(),
    shards,
    about: 'Noir MUN local RAG index (public sources, embedded with MiniLM)',
  };
  fs.writeFileSync(path.join(OUTDIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Done. Shards:', shards.length);
}

main().catch(e => { console.error(e); process.exit(1); });
