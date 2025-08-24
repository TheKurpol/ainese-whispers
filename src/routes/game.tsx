import { createFileRoute } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react'
import {
  DrawingsFirstRound,
  DrawingsRound,
  Waiting,
  WaitingForNextRound,
} from '@/components/gameComponents'
import { SocketContext } from '@/lib/reactUtils'

export const Route = createFileRoute('/game')({
  component: Game,
})

function Game() {
  // TODO: Think how to display appropriate components according to game state
  const [gameState, setGameState] = useState('waiting')
  const socket = useContext(SocketContext)

  useEffect(() => {
    if (!socket) return

    socket.on('game_state_update', (newState) => {
      setGameState(newState)
    })

    return () => {
      socket.off('game_state_update')
    }
  }, [socket])

  return (
    <div>
      {gameState === 'waiting' && <Waiting />}
      {gameState === 'drawingsFirstRound' && <DrawingsFirstRound />}
      {gameState === 'drawingsRound' && <DrawingsRound />}
      {gameState === 'waitForNextDrawingsRound' && (
        <WaitingForNextRound message="Wait until AI generates all images" />
      )}
    </div>
  )
}
