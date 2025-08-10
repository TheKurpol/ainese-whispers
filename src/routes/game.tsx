/* 
STARTING AND HANDLING THE GAME
1. Listen to 'game_start' event
2. When navigated to game, emit something like 'game_loaded'
3. In backend, wait until all players emitted 'game_loaded'
4. Then start the game, so select the first player(s) to write and emit appropriate events
5. In frontend, listen to the event 'wait' or 'your_turn' etc. idk and show appropriate UI elements
6. Of course, the backend should store info whose turn is it to prevent some cheating
7. Backend should also listen to player if they are ready
8. Once everyone is ready or the time's up, emit an event to start the round
9. Frontend should listen to the event and update the UI accordingly
10. Then frontend emit something like 'loaded'
11. This time, when someone hasn't answered for too long, the backend should handle it appropriately
*/

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/game')({
  component: Game,
})

function Game() {
  return (
    <>
      <h1>Game Room</h1>
      <p>Welcome to the game!</p>
    </>
  )
}
