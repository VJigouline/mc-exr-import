// Reads OpenEXR images with three.js's EXRLoader into textures for image-based lighting:
// equirectangular environment maps that light a scene and show as its background. Every
// OpenEXR compression three.js decodes is read: none, RLE, ZIPS, ZIP, PIZ, PXR24, B44, B44A,
// DWAA and DWAB.

import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { ImportFiles, type ImportInput } from './common.js';
import { makeTexture, measure } from './environment.js';

export { ImportFiles } from './common.js';
export type { ImportInput, ImportFile, ImportData } from './common.js';
export { applyEnvironment, type EnvironmentOptions } from './environment.js';

export interface ExrOptions {
  /** The .exr file to open, if several are given. By default, the first. */
  main?: string;
  /** Pixel type of the texture: half floats (the default) use half the memory of floats. */
  type?: 'half' | 'float';
}

export interface ExrLoadResult {
  /** The image, as an equirectangular environment texture in linear colour. */
  texture: THREE.DataTexture;
  width: number;
  height: number;
  /** The file's compression, such as PIZ_COMPRESSION or ZIP_COMPRESSION. */
  compression: string;
  /** The file's channels, such as R, G, B and A. */
  channels: string[];
  /** Every attribute of the file's header. */
  header: Record<string, unknown>;
  /** The brightest and mean luminance, and the direction of the brightest point, such as the sun. */
  maxLuminance: number;
  meanLuminance: number;
  brightest: THREE.Vector3;
  warnings: string[];
}

export class ExrImportError extends Error {
  override name = 'ExrImportError';
}

/** A channel of the image, with where its name is in the file. */
export interface ExrChannel {
  name: string;
  /** 0 unsigned int, 1 half, 2 float. */
  pixelType: number;
  /** Byte offset of the name in the file. */
  offset: number;
}

/** Reads the channel list and compression from an OpenEXR header. */
export function readExrHeader(bytes: Uint8Array): { channels: ExrChannel[]; compression: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (from: number) => {
    let end = from;
    while (end < bytes.length && bytes[end] !== 0) end++;
    return { value: new TextDecoder('latin1').decode(bytes.subarray(from, end)), next: end + 1 };
  };
  const channels: ExrChannel[] = [];
  let compression = -1;
  let at = 8;
  while (at < bytes.length) {
    const name = text(at);
    if (!name.value) break;
    const type = text(name.next);
    const size = view.getUint32(type.next, true);
    const start = type.next + 4;
    if (name.value === 'channels' && type.value === 'chlist') {
      let c = start;
      while (c < start + size && bytes[c] !== 0) {
        const ch = text(c);
        channels.push({ name: ch.value, pixelType: view.getInt32(ch.next, true), offset: c });
        c = ch.next + 16;
      }
    } else if (name.value === 'compression') compression = bytes[start]!;
    at = start + size;
  }
  return { channels, compression };
}

/** Reads an OpenEXR image. Use `applyEnvironment` to light a scene with it. */
export async function loadExr(input: ImportInput, options: ExrOptions = {}): Promise<ExrLoadResult> {
  const files = await ImportFiles.from(input, 'environment.exr');
  const main = files.main(['exr'], options.main) ?? files.files[0];
  if (!main) throw new ExrImportError('There is no .exr file to open');
  let b = main.bytes;
  if (!(b[0] === 0x76 && b[1] === 0x2f && b[2] === 0x31 && b[3] === 0x01)) throw new ExrImportError(`${main.name} is not an OpenEXR file: its magic number is wrong`);
  const warnings: string[] = [];
  // three.js reads RGB(A), YC and Y images; a lone channel with another one-letter name is read as Y, grey.
  const { channels: list } = readExrHeader(b);
  const known = (n: string) => ['R', 'G', 'B', 'A', 'Y', 'RY', 'BY'].includes(n);
  const hasColour = ['R', 'G', 'B'].every((n) => list.some((c) => c.name === n)) || list.some((c) => c.name === 'Y');
  if (!hasColour) {
    const grey = list.filter((c) => c.name !== 'A');
    if (grey.length === 1 && grey[0]!.name.length === 1) {
      b = b.slice();
      b[grey[0]!.offset] = 0x59;
      warnings.push(`The image has one channel, ${grey[0]!.name}, which is read as grey`);
    } else {
      throw new ExrImportError(`${main.name} has channels ${list.map((c) => c.name).join(', ') || 'none'}; an image needs R, G and B, or Y`);
    }
  } else if (list.some((c) => !known(c.name))) {
    warnings.push(`Channels not read: ${list.filter((c) => !known(c.name)).map((c) => c.name).join(', ')}`);
  }
  const loader = new EXRLoader().setDataType(options.type === 'float' ? THREE.FloatType : THREE.HalfFloatType);
  let d: { header: Record<string, unknown>; width: number; height: number; data: Float32Array | Uint16Array; format: THREE.PixelFormat; type: THREE.TextureDataType };
  try {
    d = loader.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer) as unknown as typeof d;
  } catch (e) {
    throw new ExrImportError(`${main.name} could not be read: ${(e as Error).message}`);
  }
  const header = d.header;
  const channels = list.map((c) => c.name);
  if (header.multiPart || header.tiles && (header.tiles as { levelMode?: number }).levelMode) warnings.push('Only the first part and level are read');
  if (Math.abs(d.width / d.height - 2) > 0.01) warnings.push(`The image is ${d.width} x ${d.height}; an environment map is twice as wide as it is high`);
  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.exr$/i, '');
  const pixels = { width: d.width, height: d.height, data: d.data, format: d.format, type: d.type, flipY: false };
  const texture = makeTexture(name, pixels);
  const m = measure(pixels);
  return {
    texture,
    width: d.width,
    height: d.height,
    compression: String(header.compression ?? ''),
    channels,
    header,
    maxLuminance: m.maxLuminance,
    meanLuminance: m.meanLuminance,
    brightest: m.brightest,
    warnings,
  };
}
