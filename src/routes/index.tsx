import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <div className='justify-center items-center'>
        <h1 className='text-4xl text-center font-bold mb-8'>AInese Whispers</h1>
      </div>
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
        <Card className='p-6 w-3xl shadow-lg flex justify-center items-center'>
          <Input
            placeholder='Nickname'
            className='w-[400px] h-16'
          />
          <div className='flex gap-3'>
            <Input
              placeholder='Party ID'
              className='w-[195px] h-16 text-8xl'
            />
            <Button className='h-16 w-[195px] text-xl'>
              Join Party
            </Button>
          </div>
          <Button className='w-[400px] h-16 text-xl'>Create New Party</Button>
        </Card>
      </div>
    </>
  )
}
