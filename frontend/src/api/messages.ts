import { apiRequest } from './client'
import type { Conversation, Message } from '../types/message'

export async function getMessages(): Promise<Conversation[]> {
  const response = await apiRequest<{ data: Conversation[] }>('/messages')
  return response.data
}

export async function sendInquiry(listingId: number, body: string): Promise<Message> {
  const response = await apiRequest<{ data: Message }>(`/listings/${listingId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
  return response.data
}

export async function replyToMessage(messageId: number, body: string): Promise<Message> {
  const response = await apiRequest<{ data: Message }>(`/messages/${messageId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
  return response.data
}