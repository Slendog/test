# HayasexShiru Extensions

Community-maintained torrent-source extensions for **Hayase** and **Shiru**.
Includes **Nyaa** and **Sukebei** support.

[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

---

## Available Sources

| Source | Host | NSFW | Media |
|--------|------|------|-------|
| **Nyaa** | `nyaa.si` | no | sub |
| **Sukebei** | `sukebei.nyaa.si` | yes | both |

Both query the site's **native RSS feed directly** — no third-party proxy. Results include
title, info hash, seeders, leechers, downloads, real file size, and upload date. A magnet link
is built from the info hash plus public trackers.

---

## Installation

### Hayase

Paste into **Settings → Extensions → Repositories**:

```
https://raw.githubusercontent.com/ReWelp/HayasexShiru-Extensions/main/hayase/index.json
```

### Shiru

Paste into **Settings → Extensions → Sources**:

```
https://raw.githubusercontent.com/ReWelp/HayasexShiru-Extensions/main/shiru/index.json
```

Alternatively: `gh:ReWelp/HayasexShiru-Extensions/shiru`

> Enable **Adult Content (Hentai)** in settings to use Sukebei.

---

## How it works

Each source implements `single`, `batch`, `movie`, and a health check (`test` on Hayase,
`validate` on Shiru).

1. Build a query from the anime title — strip non-word chars, append resolution and
   zero-padded episode when present.
2. Fetch `https://<host>/?page=rss&q=<query>&c=<category>&f=0&s=seeders&o=desc`.
3. Parse each `<item>`: title, `<nyaa:infoHash>`, seeders/leechers/downloads,
   `<nyaa:size>` (parsed to bytes), `<pubDate>`.
4. Filter out titles matching any `exclusions` term.
5. Return `TorrentResult[]` — magnet in `link`, hash in `hash`.

Category is set per source in the class (`category` field):

| Value | Meaning |
|-------|---------|
| `1_2` | Nyaa — Anime, English-translated (default) |
| `1_0` | Nyaa — all Anime |
| `0_0` | all categories (Sukebei default) |

### Result shape (`shiru/sources/index.d.ts`)

```ts
interface TorrentResult {
  title: string
  link: string       // magnet
  hash: string
  seeders: number
  leechers: number
  downloads: number
  size: number       // bytes
  date: Date
  accuracy?: 'high' | 'medium' | 'low'
  type?: 'batch' | 'best' | 'alt'
}
```

---

## Repository layout

```
.
├─ index.json              # root pointer → shiru
├─ package.json
├─ generate_indexes.js     # regenerates every manifest
├─ hayase/
│  ├─ index.json           # generated
│  ├─ nyaa.js
│  └─ sukebei.js
└─ shiru/
   ├─ index.json           # generated
   ├─ package.json         # generated
   └─ sources/
      ├─ abstract.js
      ├─ index.d.ts
      ├─ nyaasrc/index.js
      └─ sukebeisrc/index.js
```

---

## Manifests

Manifests are **generated** — do not hand-edit `index.json` / `shiru/package.json`.
Bump `sources[].version` in `generate_indexes.js`, then:

```bash
npm run generate
```

This writes `hayase/index.json`, `shiru/index.json`, `shiru/package.json`, and root `index.json`.

### Hayase manifest v2

The Hayase manifest uses `manifestVersion: 2` (current schema). Key fields beyond version:

- `manifestVersion: 2` — required; without it Hayase flags the extension **outdated**.
- `description` — required in v2.
- `url` — **base64-encoded base URL** (`https://nyaa.si` / `https://sukebei.nyaa.si`).
  Whitelists the host so the extension's requests are CORS-enabled. Required because
  nyaa.si sends no CORS headers.
- `updatePeers: false` — let Hayase scrape fresh peer counts from trackers.

Extension code runs in a **sandboxed Web Worker** (no DOM — hence regex XML parsing, not
`DOMParser`). Search methods use the **`query.fetch`** passed by Hayase, not global `fetch`,
for CORS-enabled requests.

---

## Limitations

- RSS returns up to ~75 items per query; no pagination.
- XML is parsed with regex (no DOM dependency) — robust for Nyaa's stable feed, but would break
  if the feed format changes.
- Trackers in the magnet link are a fixed public set; peer discovery also relies on DHT.

---

## Support

Found a bug or have a feature request? Open an issue.

---

## Shoutouts

- Shiru: <https://github.com/RockinChaos/Shiru>
- Hayase: <https://github.com/hayase-app>
- Hayase community repo inspiration: <https://github.com/LetMeGetAByte/Hayase-Extensions/>
- Shiru community repo inspiration: <https://github.com/Spithskia/Shiru-Extensions/>

---

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).

⭐ If you find this useful, consider giving it a star.
