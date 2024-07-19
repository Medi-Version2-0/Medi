import { GlobalState, GlobalActionTypes, SET_STATION, SET_GROUPS } from '../types/globalTypes';

const initialState: GlobalState = {
  stations: [],
  groups: [],
};

const globalReducer = (state = initialState, action: GlobalActionTypes): GlobalState => {
  switch (action.type) {
    case SET_STATION:
      return { ...state, stations: action.payload };
    case SET_GROUPS:
      return { ...state, groups: action.payload };
    default:
      return state;
  }
};

export default globalReducer;
