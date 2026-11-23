# Solution Lab · 溶液實驗室

An interactive 3D learning game about solutes, solvents, and solutions. Students identify the solute and solvent, watch a mixing animation, then decide whether a solution forms. The interface uses English first, with Chinese support.

**Play online:** https://solute-solvent-solution-lab.marcolam20000.chatgpt.site/

**Download the standalone website:** https://solute-solvent-solution-lab.marcolam20000.chatgpt.site/solution-lab-download.zip

**Download the GitHub source ZIP:** https://github.com/lamyeunglung20-tech/solution-lab-3d/archive/refs/heads/main.zip

## Scenarios

- **Milk tea · 大快活:** milk tea powder and hot water.
- **Calcium + C · 醫院:** 康鈣C and hot water.

## Run locally

The app is static and has no build step. Serve the repository root or the extracted ZIP folder with a local web server, for example:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/ in a browser. The 3D scene uses a locally bundled Three.js module, so the game does not need an external package server.
