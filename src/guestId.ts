const KEY = 'logic-guest-id'

export function getGuestId(): string {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = 'g_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
    localStorage.setItem(KEY, id)
  }
  return id
}

const KEY_NICK = 'logic-nickname'

export function getNickname(): string {
  return localStorage.getItem(KEY_NICK) || ''
}

export function setNickname(name: string): void {
  localStorage.setItem(KEY_NICK, name.slice(0, 20))
}

export function defaultNickname(guestId: string): string {
  const adjectives = ['勇敢な', '冷静な', '聡明な', '熱心な', '思慮深い', '柔軟な', '探究心ある', '直感的な']
  const nouns = ['学習者', '思考家', '探検家', '挑戦者', '研究者', '観察者']
  const seed = guestId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return adjectives[seed % adjectives.length] + nouns[(seed >> 3) % nouns.length]
}
