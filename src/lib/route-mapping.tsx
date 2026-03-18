import { BookIcon, ChartBarIcon, FolderIcon, LayoutDashboardIcon, UsersIcon } from 'lucide-react'

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
      title: 'Departments',
      url: '/dashboard/departments',
      icon: (
        <BookIcon />
      ),
    },
    {
      title: 'Analytics',
      url: '#',
      icon: (
        <ChartBarIcon />
      ),
    },
    {
      title: 'Projects',
      url: '#',
      icon: (
        <FolderIcon />
      ),
    },
    {
      title: 'Team',
      url: '#',
      icon: (
        <UsersIcon />
      ),
    },
  ],
}
