import { pusherServer } from '@/lib/pusher'

export async function GET() {
  return Response.json({ configured: pusherServer !== null })
}
