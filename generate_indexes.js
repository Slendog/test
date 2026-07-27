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
    version: "1.1.0"
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
    version: "1.1.0"
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
  "version": "1.1.0",
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
  accuracy: "medium",
  ratio: 0,
  media: s.id === "sukebei" ? "both" : "sub",
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
    "main": "gh:ReWelp/HayasexShiru-Extensions/shiru"
  }
];

writeFileSync("./index.json", JSON.stringify(rootIndex, null, 2));

console.log("All indexes generated successfully!");
