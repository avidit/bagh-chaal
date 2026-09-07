# Bagh-chaal

A tiger's move — a Bagh-chaal board game built with SvelteKit.

Play the mini game (1 tiger, 3 goats) or the standard 5×5 board against the computer.

## Live demo

After GitHub Pages is enabled for this repo, the site is published at:

https://avidit.github.io/bagh-chal/

## Attribution

Game piece SVGs are from [Game-icons.net](https://game-icons.net) (CC BY 3.0). See [ATTRIBUTION.md](ATTRIBUTION.md).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run test`    | Run engine unit tests    |
| `npm run check`   | Type-check Svelte/TS     |

## Board layout

The mini board is defined in [`src/lib/game/board-mini.ts`](src/lib/game/board-mini.ts): tiger at **A**, goats at **H**, **I**, **J**. Edges **E↔H** and **G↔J** are not playable.

## Deploy

Pushes run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds with `adapter-static` and publishes to GitHub Pages.
