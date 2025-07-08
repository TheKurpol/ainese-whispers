export function generateRandomPartyId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let partyId = ''
  for (let i = 0; i < 4; i++) {
    partyId += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return partyId
}