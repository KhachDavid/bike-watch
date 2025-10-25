export interface Email {
  id: string;
  from: string;
  fromTitle: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface EmailState {
  emails: Email[];
  unreadCount: number;
}
