import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute('/timetable/$departmentId')({
  component: DepartmentLayout,
})

function DepartmentLayout() {
  const { departmentId } = Route.useParams()

  return (
    <div className="flex flex-col">
      <div className="flex h-12 items-center border-b px-4 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/timetable">Work queue</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {/* TODO: replace raw param with department name from loader */}
              <BreadcrumbPage className="capitalize">{departmentId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Outlet />
    </div>
  )
}
