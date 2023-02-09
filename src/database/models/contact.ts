// Interfaces
export interface IReducedContact {
  id: string;
  number: string;
  is_user: boolean;
  friend_request: boolean;
}

// Helpers
export const isReducedContact = (contact: any): contact is IReducedContact => {
  const unsafeCast = contact as IReducedContact;

  return (
    unsafeCast.id !== undefined &&
    unsafeCast.number !== undefined &&
    unsafeCast.is_user !== undefined &&
    unsafeCast.friend_request !== undefined
  );
};

export const areReducedContact = (
  contacts: any[]
): contacts is IReducedContact[] => {
  const reducedContacts = contacts.reduce((acc, curr) => {
    if (isReducedContact(curr)) {
      return acc * 1;
    } else {
      return acc * 0;
    }
  }, 1);

  return reducedContacts === 1;
};
