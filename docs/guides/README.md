# Guides

The DM guide and the player guide, as PDFs in the app's look.

| File | What it is |
| --- | --- |
| `DM-Guide.pdf`, `Player-Guide.pdf` | The finished guides — hand these out |
| `dm-guide.md`, `player-guide.md` | The text (source of truth for the PDFs) |
| `guide.css` | The styling: same colour and font tokens as `src/frontend/src/index.css` |
| `build.mjs` | Markdown → HTML → PDF via headless Chrome |

## Rebuild

Edit the Markdown, then:

```sh
cd docs/guides
npm install
npm run build
```

Needs Google Chrome installed (or `CHROME_PATH` pointing at a Chrome/Chromium binary). The "As of" date in the title band is the build date.

The first `# ` line of each Markdown file becomes the title band: the part after "— " is the big title. A4, page numbers in the footer.
