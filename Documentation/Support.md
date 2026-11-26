# Formats and support

mc-exr-import reads OpenEXR with three.js's EXRLoader, with its own header reader.

## What is read

- Scan-line and tiled images, uncompressed or with RLE, ZIPS, ZIP, PIZ, PXR24, B44, B44A, DWAA or DWAB compression, in half, float or unsigned integer pixels.
- RGB and RGBA images, luminance (Y) and luminance-chroma images, and images of one channel with another name, read as grey.
- The header's compression and channels, and the brightest and mean luminance and direction of the brightest point.

## Orientation and units

The image's centre faces -Z, as three.js maps equirectangular environments; `applyEnvironment` can turn it about the vertical axis.

## Limits

Only the first part of multi-part files and the first level of mipmapped tiles are read, and deep images are not read. Images that are not twice as wide as they are high get a warning, as they are not equirectangular.
