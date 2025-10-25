export interface SocialPost {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  timestamp: Date;
  sentiment: 'angry' | 'sarcastic' | 'concerned' | 'frustrated' | 'disappointed' | 'hopeful' | 'brutal' | 'positive';
  neighborhood?: string;
}

export interface SocialState {
  posts: SocialPost[];
  unreadCount: number;
}
