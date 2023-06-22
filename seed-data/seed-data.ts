import { LinkPreference } from "@prisma/client";

export const seedData = [
  {
    id: 1,
    phoneNumber: "123456",
    email: "lorraine@hillvalley.edu",
    linkedId: null,
    linkPreference: LinkPreference.PRIMARY,
    createdAt: new Date("2023-04-01 00:00:00.374+00"),
    updatedAt: new Date("2023-04-01 00:00:00.374+00"),
    deletedAt: null,
  },
  {
    id: 23,
    phoneNumber: "123456",
    email: "mcfly@hillvalley.edu",
    linkedId: 1,
    linkPreference: LinkPreference.SECONDARY,
    createdAt: new Date("2023-04-20 05:30:00.11+00"),
    updatedAt: new Date("2023-04-20 05:30:00.11+00"),
    deletedAt: null,
  },
];

export const seedDataTwo = [
  {
    id: 11,
    phoneNumber: "919191",
    email: "george@hillvalley.edu",
    linkedId: null,
    linkPreference: LinkPreference.PRIMARY,
    createdAt: new Date("2023-04-01 00:00:00.374+00"),
    updatedAt: new Date("2023-04-01 00:00:00.374+00"),
    deletedAt: null,
  },
  {
    id: 27,
    phoneNumber: "717171",
    email: "biffsucks@hillvalley.edu",
    linkedId: null,
    linkPreference: LinkPreference.PRIMARY,
    createdAt: new Date("2023-04-20 05:30:00.11+00"),
    updatedAt: new Date("2023-04-20 05:30:00.11+00"),
    deletedAt: null,
  },
];
