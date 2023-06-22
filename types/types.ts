export type IContactIdentificationResponse = {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
};

export type IContactIdentificationInput = {
  email?: string;
  phoneNumber?: number;
};
