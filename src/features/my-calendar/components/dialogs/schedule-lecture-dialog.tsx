import type { TLectureSchema } from '../../schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@tanstack/react-form'
import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDisclosure } from '@/hooks/use-disclosure'
import { lectureSchema } from '../../schemas'

interface IProps {
  children: React.ReactNode
  day?: number
  startTime?: number
}

const courseUnits = [{
  label: 'AI',
  value: '1',
}, {
  label: 'Machine learning',
  value: '2',
}]

const rooms = [
  {
    label: 'LT1',
    value: '1',
  },
  {
    label: 'LT2',
    value: '2',
  },
  {
    label: 'LT3',
    value: '3',
  },
  {
    label: 'LT4',
    value: '4',
  },
]

function ScheduleLectureDialog({ children, day, startTime }: IProps) {
  // get the approved teaching assignments for this cohort that we are currently viewing
  // const {lectures} = useGetTeachingAssignmentsForCohort()
  console.log({ day, startTime })


  const { isOpen, onClose, onToggle } = useDisclosure()

  const form = useForm({
    defaultValues: {
      room: '',
      startTime: 0,
      teachingAssignment: '',
    },
    validators: {
      onSubmit: lectureSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success('Lecture scheduled successfully')
    },
  })

  // useEffect(() => {
  //   if (startTime) {
  //     form.reset({
  //       startTime,
  //     })
  //   }
  // }, [day, startTime, form])

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
          <DialogDescription>Select a course unit to create a lecture for.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="grid gap-4 py-4"
          id="lecture-form"
        >
          <FieldGroup>
            <form.Field
              name="teachingAssignment"
              children={(field) => {
                const isInvalid
                  = field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Course Unit</FieldLabel>
                      <FieldDescription>
                        Which Course Unit do you want to schedule at this time?
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id="form-tanstack-select-language"
                        aria-invalid={isInvalid}
                        className="min-w-30"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {courseUnits.map(unit => (
                          <SelectItem
                            key={unit.value}
                            value={unit.value}
                          >
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
            <form.Field
              name="room"
              children={(field) => {
                const isInvalid
                  = field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Room</FieldLabel>
                      <FieldDescription>
                        Select a Room for this lecture if its physical
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id="form-tanstack-select-language"
                        aria-invalid={isInvalid}
                        className="min-w-30"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {rooms.map(room => (
                          <SelectItem
                            key={room.value}
                            value={room.value}
                          >
                            {room.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
            {/* complete the rest of the form afterwards */}
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button form="lecture-form" type="submit">
            Schedule lecture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleLectureDialog
