const fs = require('fs');

// Simple ambient pad + subtle nature generator (WAV 16-bit PCM stereo)
// Duration: configurable (default 180 seconds)
const sampleRate = 44100;
const durationSec = 180; // 3 minutes
const numSamples = sampleRate * durationSec;
const numChannels = 2;

console.log(`Generating ${durationSec}s ambient WAV (${sampleRate}Hz stereo) ...`);

// buffers for float samples
const left = new Float32Array(numSamples);
const right = new Float32Array(numSamples);

// simple one-pole filter helper for noise and global smoothing
function onePoleFilter(prev, x, a) {
  return a * prev + (1 - a) * x;
}

let noiseL = 0, noiseR = 0, globalPrev = 0;

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  // LFO for slow amplitude movement (0.02-0.06 Hz)
  const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.03 * t + Math.sin(t * 0.001));

  // Pad: sum of detuned low sines (band-limited-ish because low freq)
  const f1 = 55.0; // base pad
  const pad = (Math.sin(2 * Math.PI * f1 * t) * 0.9
             + Math.sin(2 * Math.PI * (f1 * 1.005) * t) * 0.7
             + Math.sin(2 * Math.PI * (f1 * 2.0) * t) * 0.2) * 0.4 * lfo;

  // Gentle low drone
  const drone = Math.sin(2 * Math.PI * 40 * t) * 0.06;

  // Subtle filtered noise to emulate nature texture (no birds/drip)
  const rawNoiseL = (Math.random() * 2 - 1) * 0.3;
  const rawNoiseR = (Math.random() * 2 - 1) * 0.3;
  noiseL = onePoleFilter(noiseL, rawNoiseL, 0.995);
  noiseR = onePoleFilter(noiseR, rawNoiseR, 0.995);
  // Slightly high-pass the noise to avoid DC
  const hpL = noiseL - onePoleFilter(globalPrev, noiseL, 0.999);
  const hpR = noiseR - onePoleFilter(globalPrev, noiseR, 0.999);

  // Soft random slow gusts (low frequency noise) to add life
  const gust = (Math.sin(2 * Math.PI * 0.01 * t) * 0.3 + Math.sin(2 * Math.PI * 0.005 * t) * 0.2) * 0.15;

  // Mix layers
  let sL = pad + drone + hpL * 0.6 + gust;
  let sR = pad + drone * 0.98 + hpR * 0.6 - gust * 0.2;

  // Gentle global smoothing
  sL = onePoleFilter(globalPrev, sL, 0.999);
  sR = onePoleFilter(globalPrev, sR, 0.999);
  globalPrev = (sL + sR) * 0.5;

  left[i] = sL;
  right[i] = sR;
}

// Apply long crossfade at start/end to minimize loop seam
const fadeSec = 8;
const fadeSamples = Math.min(numSamples, Math.floor(sampleRate * fadeSec));
for (let i = 0; i < fadeSamples; i++) {
  const inFade = i / fadeSamples;
  const outFade = 1 - inFade;
  left[i] *= inFade;
  right[i] *= inFade;
  const j = numSamples - fadeSamples + i;
  left[j] *= outFade;
  right[j] *= outFade;
}

// Normalize to 0.85 peak to leave headroom
let peak = 0;
for (let i = 0; i < numSamples; i++) {
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
if (peak < 1e-9) peak = 1;
const norm = 0.85 / peak;
for (let i = 0; i < numSamples; i++) {
  left[i] *= norm;
  right[i] *= norm;
}

// Create WAV buffer (16-bit PCM little-endian)
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = numSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

let offset = 0;
function writeString(str) {
  buffer.write(str, offset, 'ascii');
  offset += str.length;
}
function writeInt32(v) { buffer.writeInt32LE(v, offset); offset += 4; }
function writeInt16(v) { buffer.writeInt16LE(v, offset); offset += 2; }

writeString('RIFF');
writeInt32(36 + dataSize);
writeString('WAVE');
writeString('fmt ');
writeInt32(16); // PCM chunk size
writeInt16(1); // PCM format
writeInt16(numChannels);
writeInt32(sampleRate);
writeInt32(byteRate);
writeInt16(blockAlign);
writeInt16(bytesPerSample * 8);
writeString('data');
writeInt32(dataSize);

// interleave samples
let pos = 44;
for (let i = 0; i < numSamples; i++) {
  const l = Math.max(-1, Math.min(1, left[i]));
  const r = Math.max(-1, Math.min(1, right[i]));
  // 16-bit signed
  buffer.writeInt16LE(Math.floor(l * 32767), pos); pos += 2;
  buffer.writeInt16LE(Math.floor(r * 32767), pos); pos += 2;
}

const outPath = 'frontend/public/calm_loop.wav';
fs.writeFileSync(outPath, buffer);
console.log('WAV written to', outPath, 'size', buffer.length, 'bytes');
