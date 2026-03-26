import { z } from 'zod'

export const lectureSchema = z.object({
  teachingAssignment: z.string(),
  startTime: z.number({ error: 'Start time is required' }),
  room: z.string({ error: 'A room is required' }),
  // please change this to actual days, or an enum, but numbers work for now
  day: z.number(),
  // type: z.enum(['ONLINE', 'PHYSICAL']).default('PHYSICAL'),
})

export type TLectureSchema = z.infer<typeof lectureSchema>
