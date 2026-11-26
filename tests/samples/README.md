# OpenEXR test files

Real OpenEXR files that the tests load. They are unchanged copies, taken at commit `e38ffb0790` of openexr-images.

| Files | What they cover | Source and licence |
| --- | --- | --- |
| `GammaChart.exr`, `GrayRampsHorizontal.exr`, `AllHalfValues.exr`, `stripes.exr`, `WideFloatRange.exr` | Several compressions, every half value, a one-channel image | The [OpenEXR test images](https://github.com/AcademySoftwareFoundation/openexr-images) (`TestImages`), under their [BSD 3-Clause licence](https://github.com/AcademySoftwareFoundation/openexr-images/blob/main/LICENSE), copyright Industrial Light & Magic. |

These files keep their own licences. They are test data only, and are not part of the npm package, which includes only `dist`, `Documentation`, `README.md` and `LICENSE`.
