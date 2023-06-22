import { Contact, Prisma } from "@prisma/client";
import { prisma } from "../client/prisma-client";
import {
  IContactIdentificationInput,
  IContactIdentificationResponse,
} from "../types/types";

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
    const { phoneNumber, email } = input;
    console.debug(`Searching for records associated to ${phoneNumber}`);
    const data = await prisma.contact.findMany({
      where: {
        OR: [
          {
            phoneNumber: {
              equals: phoneNumber?.toString(),
            },
          },
          {
            email: {
              equals: email?.toString(),
            },
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
      distinct: ["email"],
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
    const foundContacts = await findContactsWithPhoneNumber(input);
    console.log(`Contacts ... ${JSON.stringify(foundContacts, null, 2)}`);
    if (foundContacts.length === 0) {
      if (email && phoneNumber) {
        // If contact is not found & the arguments are valid, create a new order
        return placeOrder(email, phoneNumber.toString());
      }
    } else {
      // If a duplicate contact is found (with either duplicate email or phone number)

      const phoneNumbers: string[] = [];
      const emails: string[] = [];

      const { id: foundPrimaryId } = foundContacts[0];

      const secondaryContactIds: number[] = [];
      const contactsToBeUpdated: number[] = [];

      /**
       * @description If every contact has the same distinct phone number as the one that we have input
       * @example Current state of database
       * {
            id                   1                   
            phoneNumber          "123456"
            email                "lorraine@hillvalley.edu"
            linkedId             null
            linkPrecedence       "primary"
            createdAt            2023-04-01 00:00:00.374+00              
            updatedAt            2023-04-01 00:00:00.374+00              
            deletedAt            null
          },
          {
            id                   23                   
            phoneNumber          "123456"
            email                "mcfly@hillvalley.edu"
            linkedId             1
            linkPrecedence       "secondary"
            createdAt            2023-04-20 05:30:00.11+00              
            updatedAt            2023-04-20 05:30:00.11+00              
            deletedAt            null
          }
          @note This is executed when any one of the request body attribute (i.e, email or phone number is the same)
       */
      if (
        foundContacts.every((contact) => contact.phoneNumber === phoneNumber)
      ) {
        foundContacts.forEach((contact) => {
          const { linkPreference, id } = contact;

          if (contact.email) {
            emails.push(contact.email);
          }

          if (contact.phoneNumber) {
            phoneNumbers.push(contact.phoneNumber);
          }

          if (linkPreference === "SECONDARY") {
            secondaryContactIds.push(id);
          }
        });
      } else {
        /**
         * @description When there are two PRIMARY records with different emails & phone numbers
         * @example Current database state
         * {
              id                   11                   
              phoneNumber          "919191"
              email                "george@hillvalley.edu"
              linkedId             null
              linkPrecedence       "primary"
              createdAt            2023-04-11 00:00:00.374+00              
              updatedAt            2023-04-11 00:00:00.374+00              
              deletedAt            null
            },
            {
              id                   27                   
              phoneNumber          "717171"
              email                "biffsucks@hillvalley.edu"
              linkedId             null
              linkPrecedence       "primary"
              createdAt            2023-04-21 05:30:00.11+00              
              updatedAt            2023-04-21 05:30:00.11+00              
              deletedAt            null
            }
            @note This is executed when the request body contains an email & phone number which belongs to 2 different records
         */
        foundContacts.forEach((contact) => {
          const { linkPreference, id } = contact;

          if (contact.email) {
            emails.push(contact.email);
          }

          if (contact.phoneNumber) {
            phoneNumbers.push(contact.phoneNumber);
          }

          if (
            phoneNumber === contact.phoneNumber &&
            linkPreference === "PRIMARY"
          ) {
            contactsToBeUpdated.push(contact.id);
            secondaryContactIds.push(id);
          } else if (linkPreference === "SECONDARY") {
            secondaryContactIds.push(id);
          }
        });

        console.debug(`Contacts to be updated ... ${contactsToBeUpdated}`);

        if (contactsToBeUpdated.length > 0) {
          await prisma.contact.updateMany({
            where: { id: { in: contactsToBeUpdated } },
            data: { linkedId: foundPrimaryId, linkPreference: "SECONDARY" },
          });
        }
      }
      return {
        contact: {
          primaryContactId: foundPrimaryId,
          emails,
          phoneNumbers: Array.from(new Set(phoneNumbers)),
          secondaryContactIds,
        },
      };
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

export const resetAndSeedData = async (data: Contact[]) => {
  try {
    await prisma.contact.deleteMany();
    await prisma.contact.createMany({ data });
  } catch (error) {
    console.error(`Error while seeding data ... ${error}`);
    throw error;
  }
};
