import type { DepartmentDraft, DepartmentStatus } from '@/features/timetabling/types'
import { useNavigate } from '@tanstack/react-router'
import { CheckCheckIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { WorkQueueSection } from './WorkQueueSection'

// TODO: replace with useQuery(departmentDraftsQuery(semesterId))
const mockDepartments: DepartmentDraft[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    status: 'conflict',
    programs: [
      {
        id: 'bscs',
        name: 'BSc Computer Science',
        code: 'BSCS',
        cohorts: [
          { id: 'bscs-y1', label: 'Year 1', status: 'conflict', conflictCount: 2 },
          { id: 'bscs-y2', label: 'Year 2', status: 'ready' },
          { id: 'bscs-y3', label: 'Year 3', status: 'conflict', conflictCount: 1 },
        ],
      },
      {
        id: 'bsit',
        name: 'BSc Information Technology',
        code: 'BSIT',
        cohorts: [
          { id: 'bsit-y1', label: 'Year 1', status: 'ready' },
          { id: 'bsit-y2', label: 'Year 2', status: 'conflict', conflictCount: 1 },
        ],
      },
    ],
    conflictCount: 4,
    studentCount: 274,
    generatedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: 'ba',
    name: 'Business Administration',
    status: 'conflict',
    programs: [
      {
        id: 'bba',
        name: 'Bachelor of Business Administration',
        code: 'BBA',
        cohorts: [
          { id: 'bba-y1', label: 'Year 1', status: 'conflict', conflictCount: 1 },
          { id: 'bba-y2', label: 'Year 2', status: 'ready' },
          { id: 'bba-y3', label: 'Year 3', status: 'ready' },
          { id: 'bba-y4', label: 'Year 4', status: 'ready' },
        ],
      },
    ],
    conflictCount: 1,
    studentCount: 412,
    generatedAt: new Date(Date.now() - 1000 * 60 * 240),
  },
  {
    id: 'eng',
    name: 'Engineering',
    status: 'ready',
    programs: [
      {
        id: 'bece',
        name: 'BEng Civil Engineering',
        code: 'BECE',
        cohorts: [
          { id: 'bece-y1', label: 'Year 1', status: 'ready' },
          { id: 'bece-y2', label: 'Year 2', status: 'ready' },
        ],
      },
      {
        id: 'bele',
        name: 'BEng Electrical Engineering',
        code: 'BELE',
        cohorts: [
          { id: 'bele-y1', label: 'Year 1', status: 'ready' },
          { id: 'bele-y2', label: 'Year 2', status: 'ready' },
          { id: 'bele-y3', label: 'Year 3', status: 'ready' },
        ],
      },
    ],
    studentCount: 320,
    generatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'ss',
    name: 'Social Sciences',
    status: 'ready',
    programs: [
      {
        id: 'bss',
        name: 'BSc Social Sciences',
        code: 'BSS',
        cohorts: [
          { id: 'bss-y1', label: 'Year 1', status: 'ready' },
          { id: 'bss-y2', label: 'Year 2', status: 'ready' },
          { id: 'bss-y3', label: 'Year 3', status: 'published' },
        ],
      },
    ],
    studentCount: 295,
    generatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'nurs',
    name: 'Nursing',
    status: 'pending',
    programs: [
      {
        id: 'bns',
        name: 'Bachelor of Nursing Science',
        code: 'BNS',
        cohorts: [],
      },
    ],
    unitCount: 22,
    assignmentsApprovedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'the',
    name: 'Theology',
    status: 'pending',
    programs: [
      {
        id: 'bth',
        name: 'Bachelor of Theology',
        code: 'BTH',
        cohorts: [],
      },
    ],
    unitCount: 10,
    assignmentsApprovedAt: new Date(Date.now() - 1000 * 60 * 200),
  },
  {
    id: 'law',
    name: 'Law',
    status: 'waiting',
    programs: [],
  },
  {
    id: 'med',
    name: 'Medicine',
    status: 'waiting',
    programs: [],
  },
  {
    id: 'arts',
    name: 'Arts & Design',
    status: 'published',
    programs: [
      {
        id: 'bfa',
        name: 'Bachelor of Fine Arts',
        code: 'BFA',
        cohorts: [
          { id: 'bfa-y1', label: 'Year 1', status: 'published' },
          { id: 'bfa-y2', label: 'Year 2', status: 'published' },
        ],
      },
    ],
    studentCount: 156,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: 'edu',
    name: 'Education',
    status: 'published',
    programs: [
      {
        id: 'bed',
        name: 'Bachelor of Education',
        code: 'BED',
        cohorts: [
          { id: 'bed-y1', label: 'Year 1', status: 'published' },
          { id: 'bed-y2', label: 'Year 2', status: 'published' },
          { id: 'bed-y3', label: 'Year 3', status: 'published' },
        ],
      },
    ],
    studentCount: 188,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
]

const statusOrder: DepartmentStatus[] = ['conflict', 'ready', 'pending', 'waiting', 'published']

export function WorkQueue() {
  const navigate = useNavigate()

  const grouped = statusOrder.reduce<Record<DepartmentStatus, DepartmentDraft[]>>(
    (acc, status) => {
      acc[status] = mockDepartments.filter(d => d.status === status)
      return acc
    },
    { conflict: [], ready: [], pending: [], waiting: [], published: [] },
  )

  function handleCohortSelect(deptId: string, cohortId: string) {
    navigate({
      to: '/timetable/$departmentId/$cohortId',
      params: { departmentId: deptId, cohortId },
    })
  }

  function handleGenerateRequest(deptId: string) {
    // TODO: POST /api/timetable/generate { departmentId: deptId }
    console.log('Triggering generation for', deptId)
  }

  const hasWork = statusOrder.some(s => grouped[s].length > 0)

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {statusOrder.map(status => (
        <WorkQueueSection
          key={status}
          status={status}
          departments={grouped[status]}
          onCohortSelect={handleCohortSelect}
          onGenerateRequest={handleGenerateRequest}
        />
      ))}

      {!hasWork && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CheckCheckIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">All departments up to date</p>
            <p className="text-xs text-muted-foreground">
              No drafts pending review for this period
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
