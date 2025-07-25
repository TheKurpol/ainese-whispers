import { Outlet, createRootRoute } from '@tanstack/react-router'
import { SocketProvider } from '@/lib/reactUtils'

export const Route = createRootRoute({
  component: () => (
    <>
      <SocketProvider>
        <Outlet />
      </SocketProvider>
    </>
  ),
})
