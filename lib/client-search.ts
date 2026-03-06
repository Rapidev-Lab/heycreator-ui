// Client-side search function that calls the real API
export interface Profile {
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
  results: Profile[]
  platformResults: {[key: string]: number}
}

// Real search function that calls the API
export async function searchProfiles(
  query: string, 
  platforms: string[] = ['Instagram', 'Twitter', 'TikTok', 'Facebook'],
  sortBy: string = 'relevance'
): Promise<SearchResponse> {
  
  console.log(`🔍 Client: Searching "${query}" on platforms: ${platforms.join(', ')}`)
  
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: query.trim(),
        platforms: platforms,
        sortBy: sortBy
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Search failed')
    }

    return {
      results: data.results || [],
      platformResults: data.platformResults || {}
    }
  } catch (error) {
    console.error('Search failed:', error)
    throw error
  }
}
