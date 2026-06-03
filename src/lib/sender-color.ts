/** Colori nome mittente in chat di gruppo (stile WhatsApp, leggibili su bolle chiare). */
const SENDER_NAME_COLORS = [
  "#e5425c",
  "#35a79a",
  "#6bcbef",
  "#a35acd",
  "#e17b34",
  "#7f66ff",
  "#00a884",
  "#c45308",
  "#9b59b6",
  "#1abc9c",
] as const;

function hashSender(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getSenderNameColor(sender: string): string {
  const idx = hashSender(sender) % SENDER_NAME_COLORS.length;
  return SENDER_NAME_COLORS[idx];
}
