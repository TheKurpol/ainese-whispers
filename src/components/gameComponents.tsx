import { useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ErrorMessage, PlayerLoadedPayload } from '@/routes/sharedTypes'
import { SocketContext } from '@/lib/reactUtils'

export function Waiting(): ReactNode {
  const socket = useContext(SocketContext)
  const [numPlayers, setNumPlayers] = useState(0)
  const [allPlayers, setAllPlayers] = useState(0)

  useEffect(() => {
    if (!socket) return
    function handlePlayerLoaded(payload: PlayerLoadedPayload | ErrorMessage) {
      if ('error' in payload) {
        return
      }
      setNumPlayers(payload.numLoaded)
      setAllPlayers(payload.numPlayers)
    }
    socket.emit('game_loaded', handlePlayerLoaded)
    socket.on('player_loaded', handlePlayerLoaded)
  }, [socket])

  return (
    <div>
      <h2>Waiting all players to be connected...</h2>
      <p>
        Number of players connected: {numPlayers}/{allPlayers}
      </p>
    </div>
  )
}

export function DrawingsFirstRound(): ReactNode {
  const socket = useContext(SocketContext)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.on('ask_for_input', () => {
      socket.emit('submit_input', input)
    })

    return () => {
      socket.off('ask_for_input')
    }
  }, [socket])

  return (
    <div>
      <h2>Write a sentence</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  )
}

export function DrawingsRound(): ReactNode {
  const socket = useContext(SocketContext)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.on('ask_for_input', () => {
      socket.emit('submit_input', input)
    })

    return () => {
      socket.off('ask_for_input')
    }
  }, [socket])

  return (
    <div>
      <h2>Try to describe the picture</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  )
}

export function WaitingForNextRound({
  message,
}: {
  message: string
}): ReactNode {
  return (
    <div>
      <h2>{message}</h2>
    </div>
  )
}
