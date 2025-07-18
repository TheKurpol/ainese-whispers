import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Provider } from '@/lib/reactUtils'

export const Route = createRootRoute({
  component: () => (
    <>
      <Provider>
        <Outlet />
      </Provider>
    </>
  ),
})
