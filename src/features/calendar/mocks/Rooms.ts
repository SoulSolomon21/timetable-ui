import type { IRoom } from "../interfaces";

export const MOCK_ROOMS: IRoom[] = [
  { id: "r1", name: "LT1",         building: "Main Block",    capacity: 200, type: "lecture_hall"  },
  { id: "r2", name: "LT2",         building: "Main Block",    capacity: 200, type: "lecture_hall"  },
  { id: "r3", name: "LT3",         building: "Main Block",    capacity: 120, type: "lecture_hall"  },
  { id: "r4", name: "SR1",         building: "Main Block",    capacity: 40,  type: "seminar_room"  },
  { id: "r5", name: "SR2",         building: "Main Block",    capacity: 40,  type: "seminar_room"  },
  { id: "r6", name: "CS Lab 1",    building: "Science Block", capacity: 50,  type: "lab"           },
  { id: "r7", name: "CS Lab 2",    building: "Science Block", capacity: 50,  type: "lab"           },
  { id: "r8", name: "Exam Hall A", building: "Exam Centre",   capacity: 300, type: "exam_hall"     },
];