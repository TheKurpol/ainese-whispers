import React, { useEffect } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

export const SocketContext = React.createContext<Socket | null>(null)
const SOCKET_SERVER_URL = 'http://localhost:5000'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket | null>(null)

  useEffect(() => {
    const newSocket: Socket = io(SOCKET_SERVER_URL)
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server')
    })
    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
    })
    newSocket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error)
    })
    newSocket.on('welcome', (data: { content: string }) => {
      console.log(
        'Now I am everywhere on the website Lol the message to you:',
        data.content,
      )
    })

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
