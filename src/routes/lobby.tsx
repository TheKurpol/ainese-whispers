import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { createContext, useContext, useEffect, useState } from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import type { Player } from './sharedTypes'
import { SocketContext } from '@/lib/reactUtils'
import { Card } from '@/components/ui/card'

const PartyIdContext = createContext<string>('')

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
  const socket = useContext(SocketContext)
  const [amIOwner, setAmIOwner] = useState<boolean>(false)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const partyId = useContext(PartyIdContext)

  useEffect(() => {
    if (!socket) return

    socket.emit(
      'check_my_ownership',
      partyId,
      (amIOwnerVerification: boolean) => {
        setAmIOwner(amIOwnerVerification)
      },
    )

    socket.emit(
      'is_owner',
      partyId,
      nickname,
      (isOwnerVerification: boolean) => {
        setIsOwner(isOwnerVerification)
      },
    )
  }, [socket])

  return (
    <Card className="p-4">
      <p className="text-lg font-semibold">{nickname}</p>
      {amIOwner && (
        <p className="text-sm text-gray-500">
          You are the owner of this party!
        </p>
      )}
      {isOwner && (
        <p className="text-sm text-green-500">
          This is the owner of the party!
        </p>
      )}
    </Card>
  )
}

function Lobby() {
  const [message, set_message] = useState<string>('paweł')
  const [players, setPlayers] = useState<Array<Player>>([])
  const { id: partyId, nickname } = Route.useSearch()
  const socket = useContext(SocketContext)

  // TODO: Save socket connection even after page reload

  useEffect(() => {
    function handlePlayerList(list: Array<Player>) {
      console.log('Received player list:', list)
      setPlayers(list)
    }

    if (!socket) {
      return
    }

    socket.emit('get_players')

    socket.on('send_player_list', handlePlayerList)

    return () => {
      socket.off('send_player_list')
    }
  }, [socket])

  return (
    <PartyIdContext.Provider value={partyId}>
      <div className="flex justify-center">
        <Card>
          <p className="text-2xl">
            <span className="font-bold">Party ID: </span>
            {partyId}
          </p>
          <p className="text-2xl font-bold">Players:</p>
          <ScrollArea className="h-64 w-80">
            {players.map((player) => (
              <PlayerCard key={player.sid} nickname={player.nickname} />
            ))}
          </ScrollArea>
        </Card>
      </div>
    </PartyIdContext.Provider>
  )
}
