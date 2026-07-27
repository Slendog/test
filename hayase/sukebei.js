const TRACKERS = [
  'udp://open.stealth.si:80/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://9.rarbg.to:2710/announce'
]

function decode (s) {
  return (s || '')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

function pick (block, tag) {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block)
  return m ? m[1].trim() : ''
}

function parseSize (s) {
  const m = /([\d.]+)\s*([KMGT]?i?B)/i.exec(s || '')
  if (!m) return 0
  const mult = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KIB: 1024, MIB: 1024 ** 2, GIB: 1024 ** 3, TIB: 1024 ** 4 }
  return Math.round(parseFloat(m[1]) * (mult[m[2].toUpperCase()] || 1))
}

function magnet (hash, title) {
  const tr = TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('')
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${tr}`
}

export default new class Sukebei {
  base = 'https://sukebei.nyaa.si/'
  category = '0_0' // all categories

  async single ({ titles, episode, resolution, exclusions }) {
    if (!titles?.length) return []
    return this._search({ title: titles[0], episode, resolution, exclusions, type: 'alt' })
  }

  async batch ({ titles, resolution, exclusions }) {
    if (!titles?.length) return []
    return this._search({ title: `${titles[0]} batch`, resolution, exclusions, type: 'batch' })
  }

  async movie ({ titles, resolution, exclusions }) {
    if (!titles?.length) return []
    return this._search({ title: titles[0], resolution, exclusions, type: 'best' })
  }

  _query ({ title, episode, resolution }) {
    let q = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (resolution) q += ` ${resolution}`
    if (episode != null) q += ` ${episode.toString().padStart(2, '0')}`
    return q
  }

  async _search ({ title, episode, resolution, exclusions = [], type = 'alt' }) {
    const q = this._query({ title, episode, resolution })
    const url = `${this.base}?page=rss&q=${encodeURIComponent(q)}&c=${this.category}&f=0&s=seeders&o=desc`
    const res = await fetch(url)
    if (!res.ok) return []
    const xml = await res.text()

    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    const out = []
    for (const item of items) {
      const name = decode(pick(item, 'title'))
      if (!name) continue
      if (exclusions.some(e => name.toLowerCase().includes(e.toLowerCase()))) continue
      const hash = pick(item, 'nyaa:infoHash').toLowerCase()
      if (!hash) continue
      out.push({
        title: name,
        link: magnet(hash, name),
        hash,
        seeders: Number(pick(item, 'nyaa:seeders') || 0),
        leechers: Number(pick(item, 'nyaa:leechers') || 0),
        downloads: Number(pick(item, 'nyaa:downloads') || 0),
        size: parseSize(pick(item, 'nyaa:size')),
        date: new Date(pick(item, 'pubDate')),
        accuracy: 'medium',
        type
      })
    }
    return out
  }

  async test () {
    const res = await fetch(`${this.base}?page=rss&q=test`)
    return res.ok
  }
}()
