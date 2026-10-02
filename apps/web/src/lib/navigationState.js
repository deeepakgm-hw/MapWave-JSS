// Navigation State Machine Reducer & Constants

export const NAV_STATES = {
  OVERVIEW: 'OVERVIEW',
  BUILDING_FLOORS: 'BUILDING_FLOORS',
  FLOOR_VIEW: 'FLOOR_VIEW',
  ROUTE_PREVIEW: 'ROUTE_PREVIEW',
  ROUTING_ACTIVE: 'ROUTING_ACTIVE',
  QR_PROMPT: 'QR_PROMPT',
  ARRIVED: 'ARRIVED',
};

export const INITIAL_NAV_STATE = {
  currentState: NAV_STATES.OVERVIEW,
  selectedBuilding: null,  // { id, name, status, height_m }
  selectedFloor: null,     // { id, level_number, notes }
  selectedRoom: null,      // { id, room_code, name, room_type }
  destination: null,       // { node_id, room_code, name }
  activeRoute: null,       // { path: [], total_distance_m, steps: [] }
  isAccessibleMode: false, // boolean flag for wheelchair/elevator accessible routing
  lastAnchor: null,        // { node_id, timestamp, confidence_m, source: 'gps'|'qr' }
  gpsLocation: null,       // { latitude, longitude, accuracy }
  errorMessage: null,      // constraint error message
  isLoading: false,
};

export function navigationReducer(state, action) {
  switch (action.type) {
    case 'SELECT_BUILDING':
      return {
        ...state,
        currentState: NAV_STATES.BUILDING_FLOORS,
        selectedBuilding: action.payload,
        selectedFloor: null,
        selectedRoom: null,
        errorMessage: null,
      };

    case 'SELECT_FLOOR':
      return {
        ...state,
        currentState: NAV_STATES.FLOOR_VIEW,
        selectedFloor: action.payload,
        selectedRoom: null,
        errorMessage: null,
      };

    case 'SELECT_ROOM_DESTINATION':
      return {
        ...state,
        currentState: NAV_STATES.ROUTE_PREVIEW,
        selectedRoom: action.payload.room,
        destination: action.payload.destination || action.payload.room,
        activeRoute: action.payload.route || null,
        errorMessage: action.payload.error || null,
      };

    case 'START_NAVIGATION':
      return {
        ...state,
        currentState: NAV_STATES.ROUTING_ACTIVE,
        errorMessage: null,
      };

    case 'TRIGGER_REANCHOR':
      return {
        ...state,
        currentState: NAV_STATES.QR_PROMPT,
      };

    case 'SCAN_SUCCESS':
      return {
        ...state,
        currentState: NAV_STATES.ROUTING_ACTIVE,
        lastAnchor: {
          node_id: action.payload.node_id,
          timestamp: Date.now(),
          confidence_m: 1.0,
          source: 'qr',
        },
      };

    case 'SKIP_SCAN':
      return {
        ...state,
        currentState: NAV_STATES.ROUTING_ACTIVE,
        lastAnchor: {
          node_id: null,
          timestamp: Date.now(),
          confidence_m: state.gpsLocation?.accuracy || 20.0,
          source: 'gps_unanchored',
        },
      };

    case 'DESTINATION_REACHED':
      return {
        ...state,
        currentState: NAV_STATES.ARRIVED,
      };

    case 'DISMISS':
      return {
        ...INITIAL_NAV_STATE,
        gpsLocation: state.gpsLocation,
        isAccessibleMode: state.isAccessibleMode,
      };

    case 'SEARCH_ROOM':
      return {
        ...state,
        currentState: NAV_STATES.ROUTE_PREVIEW,
        selectedBuilding: action.payload.building || state.selectedBuilding,
        selectedFloor: action.payload.floor || state.selectedFloor,
        selectedRoom: action.payload.room,
        destination: action.payload.room,
        activeRoute: action.payload.route || null,
        errorMessage: action.payload.error || null,
      };

    case 'BACK':
      switch (state.currentState) {
        case NAV_STATES.BUILDING_FLOORS:
          return {
            ...state,
            currentState: NAV_STATES.OVERVIEW,
            selectedBuilding: null,
            selectedFloor: null,
          };
        case NAV_STATES.FLOOR_VIEW:
          return {
            ...state,
            currentState: NAV_STATES.BUILDING_FLOORS,
            selectedFloor: null,
            selectedRoom: null,
          };
        case NAV_STATES.ROUTE_PREVIEW:
          return {
            ...state,
            currentState: NAV_STATES.FLOOR_VIEW,
            destination: null,
            activeRoute: null,
            errorMessage: null,
          };
        case NAV_STATES.ROUTING_ACTIVE:
        case NAV_STATES.QR_PROMPT:
          return {
            ...state,
            currentState: NAV_STATES.ROUTE_PREVIEW,
          };
        default:
          return {
            ...state,
            currentState: NAV_STATES.OVERVIEW,
          };
      }

    case 'TOGGLE_ACCESSIBLE':
      return {
        ...state,
        isAccessibleMode: !state.isAccessibleMode,
      };

    case 'UPDATE_GPS_LOCATION':
      return {
        ...state,
        gpsLocation: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        errorMessage: action.payload,
      };

    default:
      return state;
  }
}
