// store/index.ts
import { combineReducers } from 'redux';
import globalReducer from './reducer/globalReducer';

const rootReducer = combineReducers({
  global: globalReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
