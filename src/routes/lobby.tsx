import { createFileRoute } from '@tanstack/react-router'
import { map, z } from 'zod'
import { useContext, useState } from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import type { Key } from 'react'
import type { Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './sharedTypes'
import { SocketContext } from '@/lib/reactUtils'
import { Card } from '@/components/ui/card'

const lobbySearchSchema = z.object({
  id: z.string().min(1, 'Party ID is required'),
  nickname: z.string().min(1, 'Nickname is required'),
})

export const Route = createFileRoute('/lobby')({
  validateSearch: (search) => {
    return lobbySearchSchema.parse(search)
  },
  component: Lobby,
})

function PlayerCard({ nickname }: { nickname: string }) {
  return (
    <Card className="p-4">
      <p className="text-lg font-semibold">{nickname}</p>
    </Card>
  )
}

function Lobby() {
  const [message, set_message] = useState<string>('paweł')
  const [players, setPlayers] = useState<Array<string>>([])
  const { id: partyId, nickname } = Route.useSearch()
  const socket = useContext(SocketContext)

  return (
    <div className="flex justify-center">
      <Card>
        <p className="text-2xl">
          <span className="font-bold">Party ID: </span>
          {partyId}
        </p>
        <p className="text-2xl font-bold">Players:</p>
        <ScrollArea className="h-64 w-80">
          {players.map((player: string, index: Key) => (
            <PlayerCard key={index} nickname={player} />
          ))}
        </ScrollArea>
      </Card>
    </div>
  )
}
