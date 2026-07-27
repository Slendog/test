/**
 * @typedef {import('./index.d.ts').TorrentQuery} TorrentQuery
 * @typedef {import('./index.d.ts').TorrentResult} TorrentResult
 * @typedef {import('./index.d.ts').SearchFunction} SearchFunction
 */

/**
 * Abstract base class for torrent sources
 * @implements {import('./index.d.ts').TorrentSource}
 */
export default class AbstractSource {
  /**
   * Query results for a single episode.
   * @type {SearchFunction}
   */
  async single (options) {
    throw new Error('Source does not implement method #single()')
  }

  /**
   * Query results for a batch of episodes.
   * @type {SearchFunction}
   */
  async batch (options) {
    throw new Error('Source does not implement method #batch()')
  }

  /**
   * Query results for a movie.
   * @type {SearchFunction}
   */
  async movie (options) {
    throw new Error('Source does not implement method #movie()')
  }

  /**
   * Validates the source url.
   * @returns {Promise<boolean>}
   */
  async validate () {
    throw new Error('Source does not implement method #validate()')
  }
}
