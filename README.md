# Teaching Portfolio

Short-form teaching dossier for **Samarth Reddy**, Associate Professor of Practice,
School of Design, Graphic Era Deemed to be University.

Static site, no build step. Published via GitHub Pages (`.nojekyll` present).

## Structure

| Path | Purpose |
|---|---|
| `index.html` | The dossier: five sections plus hero and TOC |
| `css/styles.css` | Design system (tokens, layout, print stylesheet) |
| `js/main.js` | Theme toggle, reading progress, scroll-spy TOC, reveal-on-scroll |
| `Data/` | Source notes (`Info.md`, `Template.md`) and reference letters |
| `_assets/` | Logo and imagery |

## Design

Palette, typography, and accent behaviour are shared with
[calluxpore.github.io](https://calluxpore.github.io/): warm paper (`#faf8f4`) with a
burnt-sienna accent in light mode, near-black with amber in dark mode.
Type is Newsreader for prose and JetBrains Mono for labels and metadata.

Theme follows the OS by default and remembers an explicit choice in `localStorage`.

## Local preview

```bash
npx --yes http-server . -p 4173 -c-1
```

Then open <http://localhost:4173>. (`.claude/launch.json` wires the same command up
for in-editor previews; delete it if you don't need it.)

## Printing

The "Print / Save PDF" button expands every collapsed section and applies a
dedicated print stylesheet: white ground, no navigation or sidebar, cards kept
whole across page breaks.
