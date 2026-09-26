import { writeFileSync } from 'fs';

const sources = [
  {
    id: "nyaa",
    name: "Nyaa",
    description: "Searches nyaa.si for anime torrents via its RSS feed.",
    icon: "https://nyaa.si/static/favicon.png",
    type: "torrent",
    // base64("https://nyaa.si") — enables CORS for the source
    url: "aHR0cHM6Ly9ueWFhLnNp",
    media: "sub",
    version: "1.1.1"
  },
  {
    id: "sukebei",
    name: "Sukebei",
    description: "Searches sukebei.nyaa.si for adult torrents via its RSS feed.",
    icon: "https://sukebei.nyaa.si/static/favicon.png",
    type: "torrent",
    nsfw: true,
    // base64("https://sukebei.nyaa.si")
    url: "aHR0cHM6Ly9zdWtlYmVpLm55YWEuc2k=",
    media: "both",
    version: "1.1.1"
  },
  {
    id: "animetosho",
    name: "AnimeTosho",
    description: "Searches AnimeTosho's JSON feed (mirrors Nyaa, TokyoTosho, AniDex). Matches by AniDB episode/anime id when available.",
    icon: "https://animetosho.org/inc/favicon.ico",
    type: "torrent",
    accuracy: "high",
    // base64("https://feed.animetosho.org")
    url: "aHR0cHM6Ly9mZWVkLmFuaW1ldG9zaG8ub3Jn",
    media: "sub",
    version: "1.0.0"
  },
  {
    id: "tokyotosho",
    name: "TokyoTosho",
    description: "Searches tokyotosho.info (Anime + Batch categories) via its RSS feed. No seeder counts.",
    icon: "https://www.tokyotosho.info/favicon.ico",
    type: "torrent",
    accuracy: "low",
    // base64("https://www.tokyotosho.info")
    url: "aHR0cHM6Ly93d3cudG9reW90b3Noby5pbmZv",
    media: "sub",
    version: "1.0.0"
  },
  {
    id: "tokyotosho18",
    name: "TokyoTosho 18+",
    description: "Searches tokyotosho.info (Hentai + Hentai (Anime) categories) via its RSS feed. No seeder counts.",
    icon: "https://www.tokyotosho.info/favicon.ico",
    type: "torrent",
    nsfw: true,
    accuracy: "low",
    // base64("https://www.tokyotosho.info")
    url: "aHR0cHM6Ly93d3cudG9reW90b3Noby5pbmZv",
    media: "both",
    version: "1.0.0"
  },
];

const REPO_BASE = "https://raw.githubusercontent.com/Slendog/test/main";

// Shiru index
const shiruIndex = sources.map((s) => ({
  id: `${s.id}src`,
  name: s.name + " SRC",
  version: s.version,
  main: `sources/${s.id}src`, // Source dir
  type: s.type,
  nsfw: s.nsfw || false,
  description: `Shiru extension for ${s.name} (custom)`,
  icon: s.icon,
  update: `${REPO_BASE}/shiru/index.json`,
}));

writeFileSync("./shiru/index.json", JSON.stringify(shiruIndex, null, 2));

// Shiru package
const shiruPackage = {
  "name": "@rewelp/shiru-extensions",
  "version": "1.2.0",
  "description": "Nyaa and Sukebei extensions for Shiru",
  "license": "GPLv3",
  "main": "index.json",
  "types": "sources/index.d.ts"
};

writeFileSync("./shiru/package.json", JSON.stringify(shiruPackage, null, 2));

// Hayase index (manifest format v2)
const hayaseIndex = sources.map((s) => ({
  manifestVersion: 2,
  deprecated: false,
  id: `hayase.extension.${s.id}`,
  name: s.name,
  description: s.description,
  version: s.version,
  type: s.type,
  accuracy: s.accuracy || "medium",
  ratio: 0,
  media: s.media,
  url: s.url,
  languages: ["all"],
  nsfw: s.nsfw || false,
  updatePeers: false,
  icon: s.icon,
  update: `${REPO_BASE}/hayase/index.json`,
  code: `${REPO_BASE}/hayase/${s.id}.js`,
}));

writeFileSync("./hayase/index.json", JSON.stringify(hayaseIndex, null, 2));

// Root index
const rootIndex = [
  {
    "main": "gh:Slendog/test/shiru"
  }
];

writeFileSync("./index.json", JSON.stringify(rootIndex, null, 2));

console.log("All indexes generated successfully!");
