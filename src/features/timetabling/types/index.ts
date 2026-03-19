export type DepartmentStatus
  = | 'conflict' // draft exists, has unresolved conflicts
    | 'ready' // draft exists, no conflicts, awaiting publish
    | 'pending' // assignments approved in Alpha-MIS, no draft generated yet
    | 'waiting' // assignments not yet approved in Alpha-MIS
    | 'published' // timetable is live

export type CohortStatus = 'conflict' | 'ready' | 'published' | 'pending'

export interface Cohort {
  id: string
  label: string // e.g. "Year 1", "Cohort 2"
  status: CohortStatus
  conflictCount?: number
}

export interface Program {
  id: string
  name: string // e.g. "BSc Computer Science"
  code: string // e.g. "BSCS"
  cohorts: Cohort[]
}

export interface DepartmentDraft {
  id: string
  name: string
  status: DepartmentStatus
  programs: Program[]
  conflictCount?: number
  studentCount?: number
  unitCount?: number
  generatedAt?: Date
  publishedAt?: Date
  assignmentsApprovedAt?: Date
}

export type SemesterName = 'Easter' | 'Trinity' | 'Advent'

export interface Semester {
  id: string
  name: SemesterName
  year: number
  startDate: string
  endDate: string
}
