import { Email } from '../../types/email.types';

export const EMAIL_ACTION_TYPES = {
  ADD_EMAIL: 'ADD_EMAIL',
  MARK_EMAIL_READ: 'MARK_EMAIL_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
} as const;

export const addEmail = (email: Email) => ({
  type: EMAIL_ACTION_TYPES.ADD_EMAIL,
  payload: email
});

export const markEmailRead = (emailId: string) => ({
  type: EMAIL_ACTION_TYPES.MARK_EMAIL_READ,
  payload: emailId
});

export const markAllRead = () => ({
  type: EMAIL_ACTION_TYPES.MARK_ALL_READ
});
