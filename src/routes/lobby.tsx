import { createFileRoute } from '@tanstack/react-router'
import { set, z } from 'zod'
import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  IWelcomeMessagePayload,
  ServerToClientEvents,
} from './sharedTypes'

const SOCKET_SERVER_URL = 'http://localhost:5000'
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const lobbySearchSchema = z.object({
  partyId: z.string().min(1, 'Party ID is required'),
  nickname: z.string().min(1, 'Mickname is required'),
})

export const Route = createFileRoute('/lobby')({
  validateSearch: (search) => {
    return lobbySearchSchema.parse(search)
  },
  component: Lobby,
})

function Lobby() {
  const [message, set_message] = useState<string>('paweł')
  const { partyId, nickname } = Route.useSearch()
  const [socket, set_socket] = useState<TypedSocket | null>(null)

  useEffect(() => {
    const newSocket: TypedSocket = io(SOCKET_SERVER_URL)
    newSocket.on('connect', () => {
      console.log('You are connected to the Socket.IO server in Lobby.')
    })

    newSocket.on('disconnect', () => {
      console.log('You have disconnected from the Socket.IO server in Lobby.')
    })

    newSocket.on('welcome', (data: IWelcomeMessagePayload) => {
      console.log('Received welcome message:', data.content)
      set_message(partyId)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket.IO error:', error)
      set_message('An error occurred while connecting to the server.')
    })

    set_socket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return (
    <div>
      <h1>Lobby</h1>
      <p>Party ID: {partyId}</p>
      <p>Nickname: {nickname}</p>
      <p>{message}</p>
    </div>
  )
}
