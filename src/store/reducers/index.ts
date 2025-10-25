import { combineReducers } from 'redux';
import gameReducer from './game.reducer';
import emailReducer from './email.reducer';

const rootReducer = combineReducers({
  game: gameReducer,
  email: emailReducer,
});

export default rootReducer;