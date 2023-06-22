import { Prisma } from "@prisma/client";
import { prisma } from "../client/prisma-client";
import {
  IContactIdentificationInput,
  IContactIdentificationResponse,
} from "../types/types";
import { seedData } from "../seed-data/seed-data";

export const findContacts = async (input: IContactIdentificationInput) => {
  try {
    const { email, phoneNumber } = input;
    const data = await prisma.contact.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: email?.toString(),
            },
          },
          {
            phoneNumber: {
              equals: phoneNumber?.toString(),
            },
          },
        ],
      },
    });

    return data;
  } catch (error) {
    console.error(`Error while getting contacts ... ${error}`);
    throw error;
  }
};

export const findContactsWithPhoneNumber = async (
  input: IContactIdentificationInput
) => {
  try {
    const { phoneNumber } = input;
    const data = await prisma.contact.findMany({
      where: {
        phoneNumber: {
          equals: phoneNumber?.toString(),
        },
      },
    });

    return data;
  } catch (error) {
    console.error(`Error while getting contacts ... ${error}`);
    throw error;
  }
};

export const identifyContacts = async (
  input: IContactIdentificationInput
): Promise<IContactIdentificationResponse> => {
  try {
    const { email, phoneNumber } = input;
    // Check for existence of the contact
    const foundContact = await findContactsWithPhoneNumber(input);
    if (foundContact.length === 0) {
      if (email && phoneNumber) {
        // If contact is not found & the arguments are valid, create a new order
        return placeOrder(email, phoneNumber.toString());
      }
    } else {
      // If a duplicate contact is found (with either duplicate email or phone number)
      const primaryContactIndex = foundContact.findIndex(
        (contact) => contact.linkPreference === "PRIMARY"
      );

      const phoneNumbers: string[] = [];
      const emails: string[] = [];
      const secondaryContactIds: number[] = [];

      if (primaryContactIndex > -1) {
        const { email: foundPrimaryEmail } = foundContact[primaryContactIndex];

        if (foundPrimaryEmail) {
          emails.push(foundPrimaryEmail);
        }

        foundContact
          .filter((_contact, index) => index !== primaryContactIndex)
          .forEach(({ email, phoneNumber, id }) => {
            if (email) {
              emails.push(email);
            }
            if (phoneNumber) {
              phoneNumbers.push(phoneNumber);
            }
            secondaryContactIds.push(id);
          });
        return {
          contact: {
            primaryContactId: foundContact[primaryContactIndex].id,
            emails,
            phoneNumbers,
            secondaryContactIds,
          },
        };
      }
    }
    throw new Error("Invalid contacts");
  } catch (error) {
    console.error(`Error while identifying contacts ... ${error}`);
    throw error;
  }
};

export const placeOrder = async (
  email: string,
  phoneNumber: string
): Promise<IContactIdentificationResponse> => {
  try {
    const currentDate = new Date();
    const createContact: Prisma.ContactCreateArgs = {
      data: {
        createdAt: currentDate,
        linkPreference: "PRIMARY",
        updatedAt: currentDate,
        email,
        phoneNumber,
      },
    };
    const { id } = await prisma.contact.create(createContact);
    return {
      contact: {
        emails: [email],
        phoneNumbers: [phoneNumber],
        primaryContactId: id,
        secondaryContactIds: [],
      },
    };
  } catch (error) {
    console.error(`Error while placing order ... ${error}`);
    throw error;
  }
};

export const resetAndSeedData = async () => {
  try {
    await prisma.contact.deleteMany();
    await prisma.contact.createMany({ data: seedData });
  } catch (error) {
    console.error(`Error while seeding data ... ${error}`);
    throw error;
  }
};
