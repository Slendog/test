const TRACKERS = [
  'http://nyaa.tracker.wf:7777/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://explodie.org:6969/announce',
  'udp://tracker.qu.ax:6969/announce'
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
  if (!m) return ''
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim()
}

function parseSize (s) {
  const m = /([\d.]+)\s*([KMGT]?i?B)/i.exec(s || '')
  if (!m) return 0
  const mult = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KIB: 1024, MIB: 1024 ** 2, GIB: 1024 ** 3, TIB: 1024 ** 4 }
  return Math.round(parseFloat(m[1]) * (mult[m[2].toUpperCase()] || 1))
}

// Magnets on TokyoTosho carry the info hash as base32; normalise to 40-char hex.
function hexHash (h) {
  if (/^[0-9a-f]{40}$/i.test(h)) return h.toLowerCase()
  if (!/^[A-Z2-7]{32}$/i.test(h)) return ''
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bits = [...h.toUpperCase()].map(c => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('')
  return bits.match(/.{4}/g).map(b => parseInt(b, 2).toString(16)).join('')
}

function magnet (hash, title) {
  const tr = TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('')
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${tr}`
}

export default new class TokyoTosho18 {
  base = 'https://www.tokyotosho.info/'
  filter = '4,12' // Hentai + Hentai (Anime). See README for category ids.

  async single ({ titles, episode, resolution, exclusions, fetch }) {
    if (!titles?.length) return []
    return this._search({ title: titles[0], episode, resolution, exclusions, fetch })
  }

  async batch ({ titles, resolution, exclusions, fetch }) {
    if (!titles?.length) return []
    return this._search({ title: `${titles[0]} batch`, resolution, exclusions, fetch, type: 'batch' })
  }

  async movie ({ titles, resolution, exclusions, fetch }) {
    if (!titles?.length) return []
    return this._search({ title: titles[0], resolution, exclusions, fetch })
  }

  _query ({ title, episode, resolution }) {
    let q = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (resolution) q += ` ${resolution}`
    if (episode != null) q += ` ${episode.toString().padStart(2, '0')}`
    return q
  }

  async _search ({ title, episode, resolution, exclusions = [], fetch: doFetch, type }) {
    const req = doFetch || fetch
    const q = this._query({ title, episode, resolution })
    const url = `${this.base}rss.php?filter=${this.filter}&terms=${encodeURIComponent(q)}`
    const res = await req(url)
    if (!res.ok) return []
    const xml = await res.text()

    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    const out = []
    for (const item of items) {
      const name = decode(pick(item, 'title'))
      if (!name) continue
      if (exclusions.some(e => name.toLowerCase().includes(e.toLowerCase()))) continue
      const desc = pick(item, 'description')
      const orig = decode((/href="(magnet:[^"]+)"/.exec(desc) || [])[1])
      const hash = hexHash((/btih:([a-z0-9]+)/i.exec(orig) || [])[1] || '')
      if (!hash) continue
      out.push({
        title: name,
        link: magnet(hash, name) + (orig.match(/&tr=[^&]+/g) || []).join(''), // keep the uploader's own trackers
        hash,
        seeders: 0, // not exposed by TokyoTosho
        leechers: 0,
        downloads: 0,
        size: parseSize((/Size:\s*([\d.]+\s*[KMGT]?i?B)/i.exec(desc) || [])[1]),
        date: new Date(pick(item, 'pubDate')),
        accuracy: 'low',
        type: type || (pick(item, 'category') === 'Batch' ? 'batch' : undefined)
      })
    }
    return out
  }

  async test () {
    const res = await fetch(`${this.base}rss.php?filter=${this.filter}&terms=one+piece`)
    if (!res.ok) throw new Error(`TokyoTosho 18+ unreachable (HTTP ${res.status}). The site may be down or blocked by your ISP.`)
    return true
  }
}()
