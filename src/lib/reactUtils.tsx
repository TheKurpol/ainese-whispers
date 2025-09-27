import React, { useEffect } from 'react'
import { io } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/routes/sharedTypes'
import type { Socket } from 'socket.io-client'

export const SocketContext = React.createContext<Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null>(null)
const SOCKET_SERVER_URL = 'http://localhost:5000'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null)

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> =
      io(SOCKET_SERVER_URL)

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      newSocket.removeAllListeners()
    }
  }, [])
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}
