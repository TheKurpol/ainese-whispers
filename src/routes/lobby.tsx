import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useContext, useState } from 'react'
import type { Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './sharedTypes'
import { SocketContext } from '@/lib/reactUtils'

const lobbySearchSchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  nickname: z.string().min(1, 'Nickname is required'),
})

export const Route = createFileRoute('/lobby')({
  validateSearch: (search) => {
    return lobbySearchSchema.parse(search)
  },
  component: Lobby,
})

// TODO: Przeczytać o useCallback

function Lobby() {
  const [message, set_message] = useState<string>('paweł')
  const { partyId, nickname } = Route.useSearch()
  const socket = useContext(SocketContext)

  return (
    <div>
      <h1>Lobby</h1>
      <p>Party ID: {partyId}</p>
      <p>Nickname: {nickname}</p>
      <p>{message}</p>
    </div>
  )
}
