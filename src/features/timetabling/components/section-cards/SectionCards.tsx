import {
  AlertTriangleIcon,
  CheckCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">

      {/* Needs attention */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Needs attention</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-destructive">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <AlertTriangleIcon />
              6 conflicts
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Departments with unresolved conflicts
            <AlertTriangleIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Resolve before publishing is available
          </div>
        </CardFooter>
      </Card>

      {/* Ready to review */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ready to review</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-yellow-500">
            2
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCheckIcon />
              9 cohorts
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Drafts generated, no conflicts found
            <CheckCheckIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Awaiting your review and publish
          </div>
        </CardFooter>
      </Card>

      {/* Published */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Published</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-500">
            5
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <UsersIcon />
              1,240 students
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            5 of 12 departments live this semester
            <CheckCheckIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Last published: Engineering, 2h ago
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
