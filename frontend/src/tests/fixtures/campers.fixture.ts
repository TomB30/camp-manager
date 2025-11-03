import type { Camper } from "@/generated/api";
import { sessionsFixture } from "./sessions.fixture";

export const campersFixture: Camper[] = [
  {
    meta: {
      id: "camper-1",
      name: "Emma Johnson",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Emma",
      // lastName: "Johnson",
      birthday: "2013-05-15", // Age 12
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-2",
      name: "Liam Smith",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Liam",
      // lastName: "Smith",
      birthday: "2015-03-22", // Age 10
      gender: "male",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-3",
      name: "Olivia Williams",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Olivia",
      // lastName: "Williams",
      birthday: "2011-08-10", // Age 14
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-4",
      name: "Noah Brown",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Noah",
      // lastName: "Brown",
      birthday: "2017-11-05", // Age 8
      gender: "male",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-5",
      name: "Ava Davis",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Ava",
      // lastName: "Davis",
      birthday: "2012-07-18", // Age 13
      gender: "female",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-6",
      name: "Ethan Miller",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Ethan",
      // lastName: "Miller",
      birthday: "2014-02-28", // Age 11
      gender: "male",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-7",
      name: "Sophia Wilson",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Sophia",
      // lastName: "Wilson",
      birthday: "2016-04-12", // Age 9
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-8",
      name: "Mason Moore",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Mason",
      // lastName: "Moore",
      birthday: "2010-09-30", // Age 15
      gender: "male",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-9",
      name: "Isabella Taylor",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Isabella",
      // lastName: "Taylor",
      birthday: "2018-12-20", // Age 7
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-10",
      name: "Lucas Anderson",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Lucas",
      // lastName: "Anderson",
      birthday: "2013-06-08", // Age 12
      gender: "male",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-11",
      name: "Mia Thomas",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Mia",
      // lastName: "Thomas",
      birthday: "2009-01-14", // Age 16
      gender: "female",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-12",
      name: "Alex Martinez",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Alex",
      // lastName: "Martinez",
      birthday: "2011-10-25", // Age 14
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-13",
      name: "Charlotte Garcia",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Charlotte",
      // lastName: "Garcia",
      birthday: "2019-03-17", // Age 6
      gender: "female",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-14",
      name: "James Rodriguez",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "James",
      // lastName: "Rodriguez",
      birthday: "2008-07-09", // Age 17
      gender: "male",
      sessionId: sessionsFixture[2].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
  {
    meta: {
      id: "camper-15",
      name: "Amelia Lopez",
      description: "A test camper",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      // firstName: "Amelia",
      // lastName: "Lopez",
      birthday: "2015-05-03", // Age 10
      gender: "female",
      sessionId: sessionsFixture[1].meta.id,
      registrationDate: "2025-10-01T09:00:00.000Z",
    },
  },
];
