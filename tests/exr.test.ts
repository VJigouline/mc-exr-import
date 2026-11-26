import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { applyEnvironment, ExrImportError, loadExr } from '../src/index.js';
import { sample } from './files.js';

describe('EXR', () => {
  const files = ['GammaChart.exr', 'GrayRampsHorizontal.exr', 'AllHalfValues.exr', 'stripes.exr', 'WideFloatRange.exr'];

  for (const name of files) {
    it(`reads ${name}`, async () => {
      const r = await loadExr(sample(name));
      expect(r.width).toBeGreaterThan(0);
      expect(r.compression).toMatch(/_COMPRESSION$/);
      expect(r.channels.length).toBeGreaterThan(0);
      expect(r.texture.image.data!.length).toBe(r.width * r.height * 4);
      expect(r.texture.mapping).toBe(THREE.EquirectangularReflectionMapping);
    });
  }

  it('reads several compressions', async () => {
    const compressions = new Set<string>();
    for (const name of files) compressions.add((await loadExr(sample(name))).compression);
    expect(compressions.size).toBeGreaterThan(1);
  });

  it('reads float pixels and lights a scene', async () => {
    const r = await loadExr(sample('GammaChart.exr'), { type: 'float' });
    expect(r.texture.type).toBe(THREE.FloatType);
    expect(r.maxLuminance).toBeGreaterThan(0);
    const scene = new THREE.Scene();
    applyEnvironment(scene, r.texture);
    expect(scene.environment).toBe(r.texture);
  });

  it('reads a one-channel image as grey', async () => {
    const r = await loadExr(sample('WideFloatRange.exr'));
    expect(r.channels).toEqual(['G']);
    expect(r.warnings[0]).toContain('one channel, G');
  });

  it('refuses files that are not EXR', async () => {
    await expect(loadExr('hello')).rejects.toThrow(ExrImportError);
  });
});
