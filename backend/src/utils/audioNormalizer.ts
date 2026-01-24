/**
 * Audio Normalizer Utility
 *
 * Normalizes audio volume for quiet speech to improve transcription accuracy.
 * Supports WAV format (16-bit PCM).
 */

// WAV header constants
const WAV_HEADER_SIZE = 44;
const BYTES_PER_SAMPLE = 2; // 16-bit audio
const MAX_SAMPLE_VALUE = 32767;
const MIN_SAMPLE_VALUE = -32768;

// Normalization settings
const QUIET_THRESHOLD = 0.3;  // Consider audio quiet if peak < 30%
const TARGET_PEAK = 0.8;       // Target 80% of max amplitude
const MAX_GAIN = 5.0;          // Maximum gain to prevent distortion

export interface NormalizationResult {
  buffer: Buffer;
  wasNormalized: boolean;
  originalPeak: number;
  appliedGain: number;
}

/**
 * Parse WAV header to extract audio properties
 */
function parseWavHeader(buffer: Buffer): {
  isValid: boolean;
  dataOffset: number;
  dataSize: number;
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
} {
  // Check RIFF header
  const riff = buffer.slice(0, 4).toString('ascii');
  const wave = buffer.slice(8, 12).toString('ascii');

  if (riff !== 'RIFF' || wave !== 'WAVE') {
    return { isValid: false, dataOffset: 0, dataSize: 0, sampleRate: 0, numChannels: 0, bitsPerSample: 0 };
  }

  // Parse fmt chunk
  const numChannels = buffer.readUInt16LE(22);
  const sampleRate = buffer.readUInt32LE(24);
  const bitsPerSample = buffer.readUInt16LE(34);

  // Find data chunk (may not be at standard offset)
  let dataOffset = 12;
  let dataSize = 0;

  while (dataOffset < buffer.length - 8) {
    const chunkId = buffer.slice(dataOffset, dataOffset + 4).toString('ascii');
    const chunkSize = buffer.readUInt32LE(dataOffset + 4);

    if (chunkId === 'data') {
      dataOffset += 8; // Move past chunk header
      dataSize = chunkSize;
      break;
    }

    dataOffset += 8 + chunkSize;
  }

  return {
    isValid: dataSize > 0,
    dataOffset,
    dataSize,
    sampleRate,
    numChannels,
    bitsPerSample,
  };
}

/**
 * Find peak amplitude in 16-bit PCM samples
 */
function findPeakAmplitude(buffer: Buffer, dataOffset: number, dataSize: number): number {
  let maxAbs = 0;

  for (let i = dataOffset; i < dataOffset + dataSize; i += BYTES_PER_SAMPLE) {
    if (i + BYTES_PER_SAMPLE > buffer.length) break;

    const sample = buffer.readInt16LE(i);
    const absValue = Math.abs(sample);
    if (absValue > maxAbs) {
      maxAbs = absValue;
    }
  }

  return maxAbs / MAX_SAMPLE_VALUE;
}

/**
 * Apply gain to 16-bit PCM samples with clipping prevention
 */
function applyGain(buffer: Buffer, dataOffset: number, dataSize: number, gain: number): Buffer {
  const result = Buffer.from(buffer);

  for (let i = dataOffset; i < dataOffset + dataSize; i += BYTES_PER_SAMPLE) {
    if (i + BYTES_PER_SAMPLE > result.length) break;

    const sample = result.readInt16LE(i);
    let amplified = Math.round(sample * gain);

    // Clamp to prevent clipping
    if (amplified > MAX_SAMPLE_VALUE) amplified = MAX_SAMPLE_VALUE;
    if (amplified < MIN_SAMPLE_VALUE) amplified = MIN_SAMPLE_VALUE;

    result.writeInt16LE(amplified, i);
  }

  return result;
}

/**
 * Normalize audio buffer to boost quiet speech
 *
 * Algorithm:
 * 1. Parse WAV header (44 bytes)
 * 2. Extract PCM samples (16-bit signed)
 * 3. Find peak amplitude (0-32767)
 * 4. Normalize to 0-1 scale (peak / 32767)
 * 5. If peak < 0.3 (quiet):
 *    - Calculate gain = 0.8 / peak
 *    - Clamp gain to max 5x
 *    - Apply gain to all samples
 *    - Clamp samples to [-32768, 32767]
 * 6. Return normalized buffer
 *
 * @param audioBuffer - WAV audio buffer
 * @param format - Audio format (currently only 'wav' supported)
 * @returns Normalized audio buffer
 */
export async function normalizeAudioBuffer(
  audioBuffer: Buffer,
  format: string = 'wav'
): Promise<NormalizationResult> {
  // Only support WAV format for now
  if (format !== 'wav') {
    console.log(`[AudioNormalizer] Skipping normalization for format: ${format}`);
    return {
      buffer: audioBuffer,
      wasNormalized: false,
      originalPeak: 1,
      appliedGain: 1,
    };
  }

  // Parse WAV header
  const header = parseWavHeader(audioBuffer);

  if (!header.isValid) {
    console.warn('[AudioNormalizer] Invalid WAV header, skipping normalization');
    return {
      buffer: audioBuffer,
      wasNormalized: false,
      originalPeak: 1,
      appliedGain: 1,
    };
  }

  // Only support 16-bit audio
  if (header.bitsPerSample !== 16) {
    console.log(`[AudioNormalizer] Unsupported bit depth: ${header.bitsPerSample}, skipping`);
    return {
      buffer: audioBuffer,
      wasNormalized: false,
      originalPeak: 1,
      appliedGain: 1,
    };
  }

  // Find peak amplitude
  const peakAmplitude = findPeakAmplitude(audioBuffer, header.dataOffset, header.dataSize);

  console.log(`[AudioNormalizer] Peak amplitude: ${(peakAmplitude * 100).toFixed(1)}%`);

  // Check if normalization is needed
  if (peakAmplitude >= QUIET_THRESHOLD) {
    console.log('[AudioNormalizer] Audio level OK, no normalization needed');
    return {
      buffer: audioBuffer,
      wasNormalized: false,
      originalPeak: peakAmplitude,
      appliedGain: 1,
    };
  }

  // Audio is too quiet - calculate gain
  if (peakAmplitude === 0) {
    console.warn('[AudioNormalizer] Silent audio detected (0% peak)');
    return {
      buffer: audioBuffer,
      wasNormalized: false,
      originalPeak: 0,
      appliedGain: 1,
    };
  }

  let gain = TARGET_PEAK / peakAmplitude;

  // Clamp gain to prevent excessive amplification
  if (gain > MAX_GAIN) {
    console.log(`[AudioNormalizer] Clamping gain from ${gain.toFixed(1)}x to ${MAX_GAIN}x`);
    gain = MAX_GAIN;
  }

  console.log(`[AudioNormalizer] Boosting quiet audio: ${(peakAmplitude * 100).toFixed(1)}% -> ${(peakAmplitude * gain * 100).toFixed(1)}% (${gain.toFixed(2)}x gain)`);

  // Apply gain
  const normalizedBuffer = applyGain(audioBuffer, header.dataOffset, header.dataSize, gain);

  return {
    buffer: normalizedBuffer,
    wasNormalized: true,
    originalPeak: peakAmplitude,
    appliedGain: gain,
  };
}

/**
 * Calculate RMS (Root Mean Square) volume level
 * Useful for determining overall audio energy
 */
export function calculateRMS(buffer: Buffer, dataOffset: number, dataSize: number): number {
  let sumSquares = 0;
  let sampleCount = 0;

  for (let i = dataOffset; i < dataOffset + dataSize; i += BYTES_PER_SAMPLE) {
    if (i + BYTES_PER_SAMPLE > buffer.length) break;

    const sample = buffer.readInt16LE(i) / MAX_SAMPLE_VALUE;
    sumSquares += sample * sample;
    sampleCount++;
  }

  if (sampleCount === 0) return 0;

  return Math.sqrt(sumSquares / sampleCount);
}
