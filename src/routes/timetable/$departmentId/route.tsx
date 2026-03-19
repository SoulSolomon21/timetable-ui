import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

export const Route = createFileRoute('/timetable/$departmentId')({
  component: DepartmentLayout,
})

function DepartmentLayout() {
  const { departmentId } = Route.useParams()

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3 lg:px-6">
        <Link
          to="/timetable"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Scheduling
        </Link>
        <span className="text-muted-foreground">/</span>
        {/* TODO: replace raw param with department name from loader */}
        <span className="text-sm font-medium capitalize">{departmentId}</span>

        <div className="ml-auto flex items-center gap-2">
          {/* TODO: render conflict count badge when dept data is loaded */}
          {/* TODO: render "Publish department" button when dept status === 'ready' */}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
