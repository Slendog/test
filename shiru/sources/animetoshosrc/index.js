import AbstractSource from '../abstract.js'

/**
 * @typedef {import('../index.d.ts').TorrentQuery} TorrentQuery
 * @typedef {import('../index.d.ts').TorrentResult} TorrentResult
 */

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

function magnet (hash, title) {
  const tr = TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('')
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}${tr}`
}

// AnimeTosho reports very large placeholder counts when the tracker scrape failed.
function peers (n) {
  n = Number(n) || 0
  return n >= 30000 ? 0 : n
}

export default new class AnimeTosho extends AbstractSource {
  base = 'https://feed.animetosho.org/json'

  /**
   * @param {TorrentQuery} options
   * @returns {Promise<TorrentResult[]>}
   */
  async single ({ anidbEid, titles, episode, resolution, exclusions }) {
    if (anidbEid) return this._search({ params: `eid=${anidbEid}`, resolution, exclusions, accuracy: 'high', type: 'alt' })
    if (!titles?.length) return []
    return this._search({ params: `q=${encodeURIComponent(this._query({ title: titles[0], episode, resolution }))}`, resolution, exclusions, type: 'alt' })
  }

  /**
   * @param {TorrentQuery} options
   * @returns {Promise<TorrentResult[]>}
   */
  async batch ({ anidbAid, titles, episodeCount, resolution, exclusions }) {
    const minFiles = Math.max(2, episodeCount || 0)
    if (anidbAid) return this._search({ params: `order=size-d&aid=${anidbAid}`, resolution, exclusions, minFiles, accuracy: 'high', type: 'batch' })
    if (!titles?.length) return []
    return this._search({ params: `q=${encodeURIComponent(this._query({ title: `${titles[0]} batch`, resolution }))}`, resolution, exclusions, minFiles, type: 'batch' })
  }

  /**
   * @param {TorrentQuery} options
   * @returns {Promise<TorrentResult[]>}
   */
  async movie ({ anidbAid, titles, resolution, exclusions }) {
    if (anidbAid) return this._search({ params: `aid=${anidbAid}`, resolution, exclusions, accuracy: 'high', type: 'best' })
    if (!titles?.length) return []
    return this._search({ params: `q=${encodeURIComponent(this._query({ title: titles[0], resolution }))}`, resolution, exclusions, type: 'best' })
  }

  _query ({ title, episode, resolution }) {
    let q = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (resolution) q += ` ${resolution}`
    if (episode != null) q += ` ${episode.toString().padStart(2, '0')}`
    return q
  }

  /**
   * @returns {Promise<TorrentResult[]>}
   */
  async _search ({ params, resolution, exclusions = [], minFiles = 0, accuracy = 'medium', type }) {
    const res = await fetch(`${this.base}?${params}`)
    if (!res.ok) return []
    const entries = await res.json()
    if (!Array.isArray(entries)) return []

    const resRe = resolution ? new RegExp(`(^|\\D)${resolution}p`, 'i') : null
    const out = []
    for (const e of entries) {
      const name = e.title || e.torrent_name
      const hash = (e.info_hash || '').toLowerCase()
      if (!name || !hash) continue
      if (exclusions.some(x => name.toLowerCase().includes(x.toLowerCase()))) continue
      if (resRe && !resRe.test(name)) continue
      if ((e.num_files || 0) < minFiles) continue
      out.push({
        title: name,
        link: e.magnet_uri || magnet(hash, name),
        hash,
        seeders: peers(e.seeders),
        leechers: peers(e.leechers),
        downloads: Number(e.torrent_downloaded_count) || 0,
        size: Number(e.total_size) || 0,
        date: new Date(e.timestamp * 1000),
        accuracy,
        type
      })
    }
    return out
  }

  /**
   * @returns {Promise<boolean>}
   */
  async validate () {
    try {
      const res = await fetch(`${this.base}?q=one+piece`)
      return res.ok
    } catch {
      return false
    }
  }
}()
