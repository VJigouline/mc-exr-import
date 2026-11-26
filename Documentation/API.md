# API

## `loadExr(input, options?)`

Reads `.exr` and returns a promise of a `ExrLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened.

It throws a `ExrImportError` for input that isn't OpenEXR.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .exr file | The file to open, if several are given. |
| `type` | 'half' | `'half'` or `'float'` pixels. |

### `ExrLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `texture` | `THREE.DataTexture` | The environment texture. |
| `width` | `number` | Width in pixels. |
| `height` | `number` | Height in pixels. |
| `compression` | `string` | Such as PIZ_COMPRESSION. |
| `channels` | `string[]` | The channels, such as R, G, B and A. |
| `header` | `object` | Every header attribute. |
| `maxLuminance` | `number` | The brightest pixel's luminance. |
| `meanLuminance` | `number` | The mean luminance. |
| `brightest` | `THREE.Vector3` | Direction of the brightest pixel. |
| `warnings` | `string[]` | Problems that didn't stop the import. |

## `applyEnvironment(scene, texture, options?)`

Sets the texture as the scene's `environment`, which lights physically based materials, and, unless `background` is false, as its `background`. Options: `background`, `backgroundBlurriness`, `intensity`, `rotation`.

See the package's `index.d.ts` for every exported type and helper.
