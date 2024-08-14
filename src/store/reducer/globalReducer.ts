import { GlobalState, GlobalActionTypes, SET_STATION, SET_GROUPS, SET_ORGANIZATION, SET_PERMISSIONS, SET_SALES, SET_PURCHASE, SET_COMPANY, SET_ITEMGROUP, SET_CONTROLROOMSETTINGS, SET_PARTY, SET_ITEM, SET_BILLBOOK, SET_SUB_GROUPS } from '../types/globalTypes';

const initialState: GlobalState = {
  stations: [],
  groups: [],
  subGroups: [],
  organizations: [],
  permissions:[],
  sales:[],
  purchase:[],
  company:[],
  itemGroups:[],
  controlRoomSettings:[],
  party:[],
  item:[],
  billBookSeries:[],
};

const globalReducer = (state = initialState, action: GlobalActionTypes): GlobalState => {
  switch (action.type) {
    case SET_STATION:
      return { ...state, stations: action.payload };
    case SET_GROUPS:
      return { ...state, groups: action.payload };
    case SET_SUB_GROUPS:
      return { ...state, subGroups: action.payload };
    case SET_ORGANIZATION:
      return { ...state, organizations: action.payload };
    case SET_PERMISSIONS:
      return { ...state, permissions: action.payload };
    case SET_SALES:
      return { ...state, sales: action.payload };
    case SET_PURCHASE:
      return { ...state, purchase: action.payload };
    case SET_COMPANY:
      return { ...state, company: action.payload };
    case SET_ITEMGROUP:
      return { ...state, itemGroups: action.payload };
    case SET_CONTROLROOMSETTINGS:
      return { ...state, controlRoomSettings: action.payload };
    case SET_PARTY:
      return { ...state, party: action.payload };
      case SET_BILLBOOK:
    return { ...state, billBookSeries: action.payload };
    case SET_ITEM:
      return { ...state, item: action.payload };
  default:
      return state;
  }
};

export default globalReducer;
