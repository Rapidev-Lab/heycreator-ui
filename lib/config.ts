// lib/config.ts

const config = {
  rapidApi: {
    key: process.env.RAPIDAPI_KEY || "",
    key_2: process.env.RAPIDAPI_KEY_2 || "",
  },

  platforms: {
    instagram: {
      host: process.env.INSTAGRAM_API_HOST || "",
      searchHost: process.env.INSTAGRAM_SEARCH_API_HOST || "",
      searchUrl: "https://instagram-premium-api-2023.p.rapidapi.com/v1/search/users",
    },
    facebook: {
      host: process.env.FACEBOOK_API_HOST || "",
      url: "https://facebook-scraper3.p.rapidapi.com/search/people",
    },
    youtube: {
      host: process.env.YOUTUBE_API_HOST || "",
      url: "https://youtube138.p.rapidapi.com/search/",
    },
    tiktok: {
      host: process.env.TIKTOK_API_HOST || "",
      searchHost: process.env.TIKTOK_SEARCH_API_HOST || "",
      searchUrl: "https://tiktok-scraper7.p.rapidapi.com/user/search",
    },
    twitter: {
      host: process.env.TWITTER_API_HOST || "",
      searchHost: process.env.TWITTER_SEARCH_API_HOST || "",
      searchUrl: "https://twitter-api45.p.rapidapi.com/search.php",
    },
  },
};

export default config;
