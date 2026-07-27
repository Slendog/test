export type Speed = 'fast' | 'moderate' | 'slow'
export type Accuracy = 'high' | 'medium' | 'low'
export type TorrentType = 'batch' | 'best' | 'alt'

export interface TorrentResult {
    title: string
    link: string
    hash: string
    seeders: number
    leechers: number
    downloads: number
    size: number
    date: Date
    accuracy?: Accuracy
    type?: TorrentType
}

export interface TorrentQuery {
    anilistId?: number
    anidbAid?: number
    anidbEid?: number
    titles: string[]
    episode?: number
    episodeCount?: number
    resolution?: '2160' | '1080' | '720' | '540' | '480' | ''
    exclusions?: string[]
}

export type SearchFunction = (query: TorrentQuery) => Promise<TorrentResult[]>

export abstract class TorrentSource {
    abstract single: SearchFunction
    abstract batch: SearchFunction
    abstract movie: SearchFunction
    abstract validate(): Promise<boolean>
}
