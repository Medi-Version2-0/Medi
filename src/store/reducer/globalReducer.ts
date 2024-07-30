import { GlobalState, GlobalActionTypes, SET_STATION, SET_GROUPS, SET_ORGANIZATION, SET_PERMISSIONS } from '../types/globalTypes';

const initialState: GlobalState = {
  stations: [],
  groups: [],
  organizations: [],
  permissions:[],
};

const globalReducer = (state = initialState, action: GlobalActionTypes): GlobalState => {
  switch (action.type) {
    case SET_STATION:
      return { ...state, stations: action.payload };
    case SET_GROUPS:
      return { ...state, groups: action.payload };
    case SET_ORGANIZATION:
      return { ...state, organizations: action.payload };
    case SET_PERMISSIONS:
      return { ...state, permissions: action.payload };
    default:
      return state;
  }
};

export default globalReducer;
