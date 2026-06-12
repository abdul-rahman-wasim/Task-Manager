import Pusher from 'pusher'

function createPusherServer() {
  if (!process.env.PUSHER_APP_ID) return null
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  })
}

export const pusherServer = createPusherServer()
