import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { createContext, useContext, useEffect, useState } from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import type { ErrorMessage, Player, PlayerListPayload } from './sharedTypes'
import { SocketContext } from '@/lib/reactUtils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

function Lobby() {
  const [players, setPlayers] = useState<Array<Player>>([])
  const { id: partyId, nickname } = Route.useSearch()
  const [ownerSid, setOwnerSid] = useState<string | null>(null)
  const [startGameMessage, setStartGameMessage] = useState<string | null>(null)
  const socket = useContext(SocketContext)

  const navigate = useNavigate()

  // TODO: Save socket connection even after page reload

  function PlayerCard({
    playerNickname,
    sid,
    mySid,
  }: {
    playerNickname: string
    sid: string
    mySid: string
  }) {
    function handleKick() {
      if (!socket) return
      socket.emit('kick_player', partyId, sid)
    }

    return (
      <Card className="flex-row p-4">
        <p className="text-2xl font-semibold">{playerNickname}</p>
        {mySid === ownerSid && sid !== mySid && (
          <p className="">
            <Button className="ml-2 h-6 px-2 py-1 text-xs" onClick={handleKick}>
              X
            </Button>
          </p>
        )}
        {sid === ownerSid && (
          <p className="text-sm text-green-500">
            <Avatar></Avatar>
          </p>
        )}
      </Card>
    )
  }

  function goBackToIndex(goodbyeMessage: string) {
    alert(goodbyeMessage)
    navigate({
      to: '/',
    })
  }

  function handleStartGameError(error: ErrorMessage | null) {
    if (error) {
      setStartGameMessage(error.error)
    }
  }

  useEffect(() => {
    function handlePlayerList(payload: PlayerListPayload) {
      console.log('Received player list:', payload)
      if (
        socket &&
        !payload.list.some((player: Player) => player.sid === socket.id)
      ) {
        goBackToIndex("You've been kicked out of the party")
      }
      setPlayers(payload.list)
      setOwnerSid(payload.ownerSid)
    }
    if (!socket) {
      return
    }

    socket.emit('get_players')

    socket.on('send_player_list', handlePlayerList)

    socket.on('game_started', () => {
      navigate({
        to: '/game',
      })
    })

    return () => {
      socket.off('send_player_list')
      socket.off('game_started')
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
              <PlayerCard
                key={player.sid}
                playerNickname={player.nickname}
                sid={player.sid}
                mySid={socket?.id || ''}
              />
            ))}
          </ScrollArea>
        </Card>
        <div className="flex justify-center">
          <Button
            onClick={() =>
              socket?.emit('start_game', partyId, handleStartGameError)
            }
          >
            Start Game
          </Button>
          <h1>{startGameMessage}</h1>
        </div>
      </div>
    </PartyIdContext.Provider>
  )
}
