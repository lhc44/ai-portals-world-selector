# Portals World Selector · 世界漫游

A fork-style adaptation of [Ethan Mollick's ai-portals](https://github.com/emollick/ai-portals), with its complete 471-world source and assets.

- **World selector:** 471 thumbnail cards, category filters, search, and sorting
- **One world at a time:** no automatic transitions to another random world
- **3D exploration:** mouse drag, W/S navigation, A/D side movement, Q/E vertical movement, and a touchscreen D-pad
- **Autopilot:** explore the selected route without changing worlds
- **Static deployment:** build with Node.js 18+; publish the `dist/` directory

See [WORLD_SELECTOR_README.md](WORLD_SELECTOR_README.md) for full instructions (中文).

## Run locally

```bash
npm ci
npm run build
npm run preview
```

Open http://localhost:8001/

## Credits / license

Original work by Ethan Mollick and AI agents. Source project: [emollick/ai-portals](https://github.com/emollick/ai-portals).
License: **CC BY-NC-SA 4.0**. This adaptation retains the original `LICENSE` and `THIRD-PARTY-NOTICES.txt`. Noncommercial use; respect the source and third-party terms.
