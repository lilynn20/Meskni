import type { Listing } from './listing'

export type Message = {
  id: number
  thread_id: string
  listing_id: number
  sender_id: number
  receiver_id: number
  body: string
  read_at: string | null
  created_at: string | null
}

export type Conversation = {
  thread_id: string
  listing: Pick<Listing, 'id' | 'title' | 'city' | 'neighborhood'>
  participant: { id: number; name: string }
  messages: Message[]
}