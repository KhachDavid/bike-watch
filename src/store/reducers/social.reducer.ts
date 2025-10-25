import { SocialState } from '../../types/social.types';
import { generateInitialPosts } from '../../services/socialGenerator';

const initialState: SocialState = {
  posts: generateInitialPosts(1),
  unreadCount: 0 // Don't mark initial posts as unread
};

export const SOCIAL_ACTION_TYPES = {
  ADD_POSTS: 'ADD_POSTS',
  MARK_ALL_READ: 'MARK_ALL_READ'
} as const;

export default function socialReducer(state = initialState, action: any): SocialState {
  switch (action.type) {
    case SOCIAL_ACTION_TYPES.ADD_POSTS:
      const newPosts = action.payload;
      return {
        ...state,
        posts: [...newPosts, ...state.posts].slice(0, 3000), // Keep last 3000 posts
        unreadCount: state.unreadCount + newPosts.length
      };

    case SOCIAL_ACTION_TYPES.MARK_ALL_READ:
      return {
        ...state,
        unreadCount: 0
      };

    default:
      return state;
  }
}
