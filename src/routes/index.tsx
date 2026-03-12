import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,

})

function RouteComponent() {
  redirect({ to: '/dashboard' })
}
