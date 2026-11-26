# Using it in SceneEditor

[SceneEditor](https://github.com/VJigouline/SceneEditor) opens `.exr` files with mc-exr-import. Drop or open an `.exr` file. It becomes the scene's environment: it lights the materials and shows as the background. Opening a model doesn't change it; another environment map replaces it.

A file that can't be read gives a **Failure** message, and the scene is unaffected. Warnings go to the browser console.
