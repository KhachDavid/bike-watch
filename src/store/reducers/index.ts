import { combineReducers } from 'redux';
import gameReducer from './game.reducer';
import emailReducer from './email.reducer';
import socialReducer from './social.reducer';

const rootReducer = combineReducers({
  game: gameReducer,
  email: emailReducer,
  social: socialReducer,
});

export default rootReducer;