import { ApiReference } from '@scalar/nextjs-api-reference'

export const dynamic = 'force-dynamic'

const handler = ApiReference({
  url: '/openapi.json',
  pageTitle: 'HeyCreator API Reference',
})

export async function GET() {
  return handler()
}
