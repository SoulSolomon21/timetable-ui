import { BookIcon, CameraIcon, ChartBarIcon, CircleHelpIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, FileTextIcon, FolderIcon, LayoutDashboardIcon, SearchIcon, Settings2Icon, UsersIcon } from 'lucide-react'

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
  navClouds: [
    {
      title: 'Capture',
      icon: (
        <CameraIcon />
      ),
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: (
        <FileTextIcon />
      ),
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: (
        <FileTextIcon />
      ),
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: 'Get Help',
      url: '#',
      icon: (
        <CircleHelpIcon />
      ),
    },
    {
      title: 'Search',
      url: '#',
      icon: (
        <SearchIcon />
      ),
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: (
        <DatabaseIcon />
      ),
    },
    {
      name: 'Reports',
      url: '#',
      icon: (
        <FileChartColumnIcon />
      ),
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: (
        <FileIcon />
      ),
    },
  ],
}
