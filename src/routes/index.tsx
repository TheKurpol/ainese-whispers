import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { generateRandomPartyId } from './utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [nickname, setNickname] = useLocalStorage<string>('nickname', '')
  const [partyId, setPartyId] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const navigate = useNavigate()

  async function requestNewParty() {
    const max_attempts = 100
    let attempts = 0
    while (attempts < max_attempts) {
      const newPartyId = generateRandomPartyId()
      console.log('Generated new party ID:', newPartyId)
      const response = await fetch('http://localhost:5000/create_party', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyId: newPartyId }),
      })
      if (!response.ok) {
        if (response.status === 409) {
          attempts++
          continue
        }
      }
      if (response.ok) {
        return newPartyId
      }
    }
    throw new Error('Failed to create a new party after multiple attempts.')
  }

  async function checkPartyExists(partyIdToCheck: string): Promise<boolean> {
    const response = await fetch(
      `http://localhost:5000/party_exists/${partyIdToCheck}`,
    )
    if (!response.ok) {
      throw new Error('Failed to check party existence.')
    }
    const data = await response.json()
    return data.exists
  }

  function handleJoinParty(newParty: boolean) {
    if (!nickname) {
      setMessage('Please enter a nickname.')
      return
    }
    if (newParty) {
      requestNewParty()
        .then((createdPartyId) => {
          console.log('New party created with ID:', createdPartyId)
          navigate({
            to: '/lobby',
            search: { partyId: createdPartyId, nickname: nickname },
          })
        })
        .catch(() => {
          setMessage('Failed to create a new party. Please try again later.')
        })
    }
    if (!newParty) {
      if (!partyId) {
        setMessage('Please enter a Party ID.')
        return
      }
      checkPartyExists(partyId)
        .then((exists) => {
          if (exists) {
            navigate({
              to: '/lobby',
              search: { partyId: partyId, nickname: nickname },
            })
          } else {
            setMessage('Party does not exist.')
          }
        })
        .catch(() => {
          setMessage('Failed to check party existence. Please try again later.')
        })
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
