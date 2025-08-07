import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useContext, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import type { CreatePartyPayload, ErrorMessage } from './sharedTypes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SocketContext } from '@/lib/reactUtils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [nickname, setNickname] = useLocalStorage<string>('nickname', '')
  const [partyId, setPartyId] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const socket = useContext(SocketContext)

  const navigate = useNavigate()

  function requestParty() {
    return new Promise<string>((resolve, reject) => {
      if (socket?.disconnected) {
        reject('Unable to connect to the server. Please try again later.')
        return
      }
      if (!nickname) {
        reject('Please enter a nickname.')
        return
      }
      socket?.emit('create_party', (payload: CreatePartyPayload) => {
        if (payload.error) {
          reject('Failed to create party. Try again later')
        } else {
          resolve(payload.partyId)
        }
      })
    })
  }

  function partyExists(partyIdToCheck: string) {
    return new Promise<void>((resolve, reject) => {
      if (!partyIdToCheck) {
        reject('Please enter a Party ID.')
        return
      }
      if (socket?.disconnected) {
        reject('Unable to connect to the server. Please try again later.')
        return
      }
      if (!nickname) {
        reject('Please enter a nickname.')
        return
      }
      socket?.emit('check_party_exists', partyIdToCheck, (exists: boolean) => {
        if (exists) {
          resolve()
        } else {
          reject('Party does not exist. Please check the Party ID.')
        }
      })
    })
  }

  function joinParty(id: string) {
    return new Promise<void>((resolve, reject) => {
      socket?.emit('join_party', id, nickname, (error: ErrorMessage | null) => {
        if (!error) {
          navigate({
            to: '/lobby',
            search: { id, nickname },
            // @ts-ignore We mask the search params so we can't pass the 'search' option
            mask: { to: '/lobby' },
          })
          resolve()
        } else {
          reject(error.message)
        }
      })
    })
  }

  async function handleJoinParty(newParty: boolean) {
    let id = partyId
    try {
      if (newParty) {
        id = await requestParty()
      }
      await partyExists(id)
      await joinParty(id)
    } catch (error) {
      setPartyId(id)
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="mb-5 text-6xl">
          <span className="font-serif">AI</span>nese Whispers
        </h1>
        <Card className="flex w-3xl items-center justify-center p-6 shadow-lg">
          <Input
            placeholder="Nickname"
            className="h-16 w-[400px]"
            onChange={(e) => setNickname(e.target.value)}
            value={nickname}
          />
          <div className="flex gap-3">
            <Input
              placeholder="Party ID"
              className="h-16 w-[195px]"
              onChange={(e) => setPartyId(e.target.value)}
              value={partyId}
            />
            <Button
              className="h-16 w-[195px]"
              onClick={() => handleJoinParty(false)}
            >
              Join Party
            </Button>
          </div>
          <Button
            className="h-16 w-[400px]"
            onClick={() => handleJoinParty(true)}
          >
            Create New Party
          </Button>
        </Card>
        <p className="mt-4 text-xl text-red-400">{message}</p>
      </div>
    </>
  )
}
