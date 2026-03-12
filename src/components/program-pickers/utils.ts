import type { FacultyGroupFacultyType, LegacyDepartmentResponse } from '@/utils/models'

export interface FlatEntry {
  id: number
  department: string
  faculty: string
  facultyType: FacultyGroupFacultyType
  campus: string
  searchText: string
}

export function flattenData(data: LegacyDepartmentResponse[]): FlatEntry[] {
  return data.flatMap(campus =>
    campus.faculties?.flatMap(faculty =>
      faculty.departments?.map(dept => ({
        id: dept.id!,
        department: dept.name!,
        faculty: faculty.facultyName!,
        facultyType: faculty.facultyType!,
        campus: campus.campusName!,
        searchText: `${campus.campusName} ${faculty.facultyName} ${dept.name}`.toLowerCase(),
      })) ?? [],
    ) ?? [],
  )
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bOf\b/g, 'of')
}

export const FACULTY_TYPE_COLORS = {
  SCHOOL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FACULTY: 'bg-sky-50 text-sky-700 border-sky-200',
  null: 'bg-amber-50 text-amber-700 border-amber-200',
}
