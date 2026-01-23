export interface AudioChunkMetadata {
  timestamp: number;
  duration: number;
  sampleRate: number;
}

export class StreamingAudioBuffer {
  private chunks: Array<{ buffer: Buffer; metadata: AudioChunkMetadata }> = [];
  private totalDuration = 0;
  private readonly maxDurationMs: number;
  private readonly minDurationForTranscription: number;

  constructor(
    maxDurationMs: number = 30000,
    minDurationForTranscription: number = 1000
  ) {
    this.maxDurationMs = maxDurationMs;
    this.minDurationForTranscription = minDurationForTranscription;
  }

  addChunk(base64Data: string, metadata: Partial<AudioChunkMetadata> = {}): void {
    const buffer = Buffer.from(base64Data, 'base64');
    const chunkMetadata: AudioChunkMetadata = {
      timestamp: metadata.timestamp || Date.now(),
      duration: metadata.duration || 500,
      sampleRate: metadata.sampleRate || 16000,
    };

    this.chunks.push({ buffer, metadata: chunkMetadata });
    this.totalDuration += chunkMetadata.duration;

    // Enforce max duration by removing old chunks
    this.trimToMaxDuration();
  }

  isReadyForTranscription(): boolean {
    return this.totalDuration >= this.minDurationForTranscription;
  }

  getBuffer(): Buffer {
    return Buffer.concat(this.chunks.map(c => c.buffer));
  }

  getBufferForTranscription(): Buffer | null {
    if (!this.isReadyForTranscription()) {
      return null;
    }
    return this.getBuffer();
  }

  getDuration(): number {
    return this.totalDuration;
  }

  getChunkCount(): number {
    return this.chunks.length;
  }

  getLatestTimestamp(): number {
    if (this.chunks.length === 0) return 0;
    return this.chunks[this.chunks.length - 1].metadata.timestamp;
  }

  clear(): void {
    this.chunks = [];
    this.totalDuration = 0;
  }

  // Keep only the last N milliseconds of audio
  trimToLastMs(keepMs: number): void {
    if (this.totalDuration <= keepMs) return;

    let removedDuration = 0;
    while (this.chunks.length > 0 && this.totalDuration - removedDuration > keepMs) {
      const removed = this.chunks.shift();
      if (removed) {
        removedDuration += removed.metadata.duration;
      }
    }
    this.totalDuration -= removedDuration;
  }

  private trimToMaxDuration(): void {
    while (this.totalDuration > this.maxDurationMs && this.chunks.length > 1) {
      const removed = this.chunks.shift();
      if (removed) {
        this.totalDuration -= removed.metadata.duration;
      }
    }
  }

  // Create a copy of the current buffer state
  snapshot(): Buffer {
    return Buffer.concat(this.chunks.map(c => c.buffer));
  }
}

// Convert audio formats if needed
export function convertAudioFormat(
  buffer: Buffer,
  fromFormat: string,
  toFormat: string
): Buffer {
  // For now, return as-is. In production, use ffmpeg or similar
  // The WebM format from expo-av is generally compatible with Whisper
  return buffer;
}

// Estimate audio duration from buffer size (rough approximation)
export function estimateDurationMs(
  bufferSize: number,
  sampleRate: number = 16000,
  bitsPerSample: number = 16,
  channels: number = 1
): number {
  const bytesPerSecond = (sampleRate * bitsPerSample * channels) / 8;
  return (bufferSize / bytesPerSecond) * 1000;
}

// Create WAV header for raw PCM audio
export function createWavHeader(
  dataLength: number,
  sampleRate: number = 16000,
  bitsPerSample: number = 16,
  channels: number = 1
): Buffer {
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * channels * bitsPerSample) / 8, 28); // ByteRate
  header.writeUInt16LE((channels * bitsPerSample) / 8, 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

// Wrap raw PCM data in WAV format
export function wrapInWav(pcmData: Buffer, sampleRate: number = 16000): Buffer {
  const header = createWavHeader(pcmData.length, sampleRate);
  return Buffer.concat([header, pcmData]);
}
