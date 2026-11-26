# mc-exr-import

An OpenEXR importer for [three.js](https://threejs.org/), written in TypeScript. It reads OpenEXR images, with any compression three.js decodes, as equirectangular environment maps, which light a scene with image-based lighting and show behind it. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadExr, applyEnvironment } from 'mc-exr-import';

const result = await loadExr(await file.arrayBuffer());
applyEnvironment(scene, result.texture);   // lights the scene and shows the image behind it
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Scan-line and tiled images, uncompressed or with RLE, ZIPS, ZIP, PIZ, PXR24, B44, B44A, DWAA or DWAB compression, in half, float or unsigned integer pixels.
- RGB and RGBA images, luminance (Y) and luminance-chroma images, and images of one channel with another name, read as grey.
- The header's compression and channels, and the brightest and mean luminance and direction of the brightest point.

Only the first part of multi-part files and the first level of mipmapped tiles are read, and deep images are not read. Images that are not twice as wide as they are high get a warning, as they are not equirectangular. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-exr-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real OpenEXR files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
