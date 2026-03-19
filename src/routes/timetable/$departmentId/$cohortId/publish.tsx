import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react'
import { formatDistanceToNow } from '@/features/timetabling/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId/publish')({
  component: PublishReviewPage,
})

// TODO: replace with data from loader
const hasUnresolvedConflicts = false
const mockGeneratedAt = new Date(Date.now() - 1000 * 60 * 120)

const mockCourseUnits = [
  {
    id: 'cs301',
    name: 'Operating Systems',
    slots: ['Mon 09:00', 'Wed 09:00'],
    room: 'LT1',
    lecturer: 'Dr. Opio',
  },
  {
    id: 'cs302',
    name: 'Database Systems',
    slots: ['Tue 11:00', 'Thu 11:00'],
    room: 'LT2',
    lecturer: 'Dr. Namutebi',
  },
  {
    id: 'cs303',
    name: 'Software Engineering',
    slots: ['Mon 14:00'],
    room: 'LT3',
    lecturer: 'Dr. Ssekibuule',
  },
  {
    id: 'cs304',
    name: 'Computer Networks',
    slots: ['Wed 14:00', 'Fri 09:00'],
    room: 'LT4',
    lecturer: 'Dr. Kizza',
  },
  {
    id: 'cs305',
    name: 'Algorithms',
    slots: ['Tue 09:00', 'Thu 09:00'],
    room: 'LT1',
    lecturer: 'Dr. Tumwine',
  },
]

const rooms = ['LT1', 'LT2', 'LT3', 'LT4']
const lecturers = ['Dr. Opio', 'Dr. Namutebi', 'Dr. Ssekibuule', 'Dr. Kizza', 'Dr. Tumwine']
const studentCount = 274
const lecturerCount = lecturers.length

function PublishReviewPage() {
  const { cohortId } = Route.useParams()
  const router = useRouter()

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-auto pb-16">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Status banner */}
          <Card
            className={`mb-6 border-l-4 ${
              hasUnresolvedConflicts ? 'border-l-destructive' : 'border-l-green-500'
            }`}
          >
            <CardContent className="flex items-start gap-3 pt-6">
              {hasUnresolvedConflicts ? (
                <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-green-500" />
              )}
              <div>
                <p className="font-medium">
                  {hasUnresolvedConflicts
                    ? 'Resolve all conflicts before publishing'
                    : 'All conflicts resolved — ready to publish'}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {/* TODO: replace with real cohort label, semester, unit count, student count from loader */}
                  {cohortId} · Easter 2026 · {mockCourseUnits.length} units · {studentCount} students
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Course unit summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Course unit summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course unit</TableHead>
                    <TableHead>Slots</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Lecturer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCourseUnits.map(unit => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {unit.slots.map(slot => (
                            <Badge key={slot} variant="outline" className="text-xs font-normal">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{unit.room}</TableCell>
                      <TableCell>{unit.lecturer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* What happens on publish */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">What happens on publish</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[
                  {
                    primary: `${studentCount} students can view their timetable`,
                    secondary: 'Visible in the student portal immediately',
                  },
                  {
                    primary: `${lecturerCount} lecturers notified of their schedule`,
                    secondary: lecturers.join(', '),
                  },
                  {
                    primary: 'Room bookings locked in the room system',
                    secondary: rooms.join(', '),
                  },
                  {
                    primary: 'Alpha-MIS notified via SchedulePublished event',
                    secondary: 'ACL forwards the event to the main system',
                  },
                ].map(item => (
                  <div key={item.primary} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle2Icon className="size-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.primary}</p>
                      <p className="text-xs text-muted-foreground">{item.secondary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning alert */}
          <Alert>
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Note — lecturer preferences not captured</AlertTitle>
            <AlertDescription>
              Some lecturers have informal scheduling preferences on file with the support team.
              These were not factored into this draft. Review manually if needed before publishing.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 flex items-center justify-between border-t bg-background px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {/* TODO: replace with real cohort label and semester from loader */}
          {cohortId} · Easter 2026 · draft generated{' '}
          {formatDistanceToNow(mockGeneratedAt, { addSuffix: true })}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.history.back()}>
            Back to grid
          </Button>
          <Button
            disabled={hasUnresolvedConflicts}
            className="border border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
          >
            Publish cohort →
          </Button>
        </div>
      </div>
    </div>
  )
}
