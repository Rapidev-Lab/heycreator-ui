// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import http from "http";

// Create a dedicated agent for forcing IPv4 resolution
const ipv4Agent = new http.Agent({ family: 4 });

// Base URL for the weserv.nl image proxy service
const WESERV_FALLBACK_URL = "https://images.weserv.nl/";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Simple retry helper (replaces the deleted lib/apify/retry.ts import) */
async function retryFetch<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
    }
  }
  throw new Error('Retry exhausted');
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// 1x1 transparent PNG (68 bytes)
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB' +
  'Nl7BcQAAAABJRU5ErkJggg==',
  'base64'
);

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encodedUrl = searchParams.get("url");
  const encoding = searchParams.get("encoding"); // "url" or absent (base64)

  if (!encodedUrl) {
    return new NextResponse("URL parameter is missing", { status: 400, headers: CORS_HEADERS });
  }

  let imageUrl: string;
  try {
    if (encoding === "url") {
      imageUrl = decodeURIComponent(encodedUrl);
    } else {
      const decoded = Buffer.from(encodedUrl, "base64").toString("utf-8");
      if (decoded.startsWith("http")) {
        imageUrl = decoded;
      } else {
        imageUrl = decodeURIComponent(encodedUrl);
      }
    }
    new URL(imageUrl); // Validate URL
  } catch (error) {
    return new NextResponse("Invalid or malformed URL parameter", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Mock mode: return transparent pixel instead of fetching from external CDNs
  if (isMockMode) {
    return new NextResponse(TRANSPARENT_PIXEL, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  try {
    let response;
    try {
      response = await retryFetch(
        async () => {
          const headers: any = {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          };

          // Firebase Storage URLs: use minimal headers
          const isFirebaseStorage = imageUrl.includes('firebasestorage.googleapis.com');
          if (isFirebaseStorage) {
            delete headers["User-Agent"];
            delete headers["Accept-Language"];
            delete headers["Accept-Encoding"];
            delete headers["Cache-Control"];
            delete headers["Pragma"];
          }

          // Instagram/Facebook-specific headers
          if (!isFirebaseStorage && (imageUrl.includes('cdninstagram.com') || imageUrl.includes('fbcdn.net'))) {
            headers["Referer"] = "https://www.instagram.com/";
            headers["Origin"] = "https://www.instagram.com";
            headers["Sec-Fetch-Dest"] = "image";
            headers["Sec-Fetch-Mode"] = "no-cors";
            headers["Sec-Fetch-Site"] = "cross-site";
          }

          return await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            httpAgent: ipv4Agent,
            headers,
          });
        },
        2,
        500
      );
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        try {
          const weservUrl = `${WESERV_FALLBACK_URL}?url=${encodeURIComponent(imageUrl)}`;
          response = await axios.get(weservUrl, {
            responseType: "arraybuffer",
            timeout: 20000,
            httpAgent: ipv4Agent,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
            },
          });
        } catch (weservErr: any) {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const imageBuffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"] || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      return new NextResponse("Image blocked by CDN", { status: 403, headers: CORS_HEADERS });
    }

    return new NextResponse("Failed to fetch image", {
      status: error.response?.status || 500,
      headers: CORS_HEADERS,
    });
  }
}
