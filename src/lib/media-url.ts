export function mediaUrl(chatId: string, filename: string): string {
  return `/api/chats/${encodeURIComponent(chatId)}/media/${encodeURIComponent(filename)}`;
}
