export interface ProfileResult {
  platform: string
  username: string
  displayName: string
  bio?: string
  profileUrl: string
  avatar?: string
  followerCount?: number
  verified?: boolean
}

export interface SearchResponse {
  results: ProfileResult[]
  query: string
  totalCount: number
}
