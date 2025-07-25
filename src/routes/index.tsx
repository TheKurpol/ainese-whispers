import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useContext, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import type { CreatePartyPayload } from './sharedTypes'
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

  // TODO Zamienić na useCallback

  const requestNewParty = useCallback(() => {
    socket?.emit('create_party', (payload: CreatePartyPayload) => {
      if (payload.error) {
        setMessage('Failed to create party. Try again later.')
      } else {
        setPartyId(payload.partyId)
        navigate({
          to: '/lobby',
          search: { partyId: payload.partyId, nickname: nickname },
        })
      }
    })
  }, [socket, navigate, nickname])

  const checkPartyExists = useCallback(
    (partyIdToCheck: string) => {
      socket?.emit('check_party_exists', partyIdToCheck, (exists: boolean) => {
        console.log(`Party ${partyIdToCheck} exists:`, exists)
        if (exists) {
          navigate({
            to: '/lobby',
            search: { partyId: partyIdToCheck, nickname: nickname },
          })
        } else {
          setMessage('Party does not exist. Please check the Party ID.')
        }
      })
    },
    [socket, navigate, nickname],
  )

  const handleJoinParty = useCallback(
    (newParty: boolean) => {
      if (!nickname) {
        setMessage('Please enter a nickname.')
        return
      }
      if (newParty) {
        requestNewParty()
      }
      if (!newParty) {
        if (!partyId) {
          setMessage('Please enter a Party ID.')
          return
        }
        checkPartyExists(partyId)
      }
    },
    [nickname, partyId, requestNewParty, checkPartyExists],
  )

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
