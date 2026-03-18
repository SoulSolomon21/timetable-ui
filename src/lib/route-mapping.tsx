import { BookIcon, CalendarDays, LayoutDashboardIcon } from 'lucide-react'

export const routeMapping = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: 'Scheduling',
      url: '/timetable',
      icon: (
        <CalendarDays />
      ),
    },
    {
      title: 'Departments',
      url: '/dashboard/departments',
      icon: (
        <BookIcon />
      ),
    },
  ],
}
