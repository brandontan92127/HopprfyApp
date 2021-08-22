/**
 * Created by InspireUI on 14/02/2017.
 *
 * @format
 */

import { EventRegister } from "react-native-event-listeners";

const types = {
  LOGOUT: "LOGOUT",
  LOGIN: "LOGIN_SUCCESS",
  FINISH_INTRO: "FINISH_INTRO",

  UPDATE_CUSTOMER_PERMISSIONS: "UPDATE_CUSTOMER_PERMISSIONS",
  UPDATE_STORE_PERMISSIONS: "UPDATE_STORE_PERMISSIONS",
  UPDATE_DRIVER_PERMISSIONS: "UPDATE_DRIVER_PERMISSIONS",
  UPDATE_LOGISTICS_PERMISSIONS: "UPDATE_LOGISTICS_PERMISSIONS",
};

export const actions = {
  login: (user,successUsername, successPassword, token,tokenExpiry) => {
    return { type: types.LOGIN, user, successUsername, successPassword, token, tokenExpiry };
  },
  logout() {
    return { type: types.LOGOUT };
  },
  finishIntro() {
    return { type: types.FINISH_INTRO };
  },
  updateCustomerPermissions(dispatch, customerNetworksAndPermissions) {
    dispatch(
      actions.updateCustomerPermissionsSuccess(customerNetworksAndPermissions)
    );
  },
  updateCustomerPermissionsSuccess(customerNetworksAndPermissions) {
    console.debug("ALright");
    return {
      type: types.UPDATE_CUSTOMER_PERMISSIONS,
      customerNetworksAndPermissions,
    };
  },
  updateDriverPermissions(dispatch, driverNetworksAndPermissions) {
    dispatch(
      actions.updateDriverPermissionsSuccess(driverNetworksAndPermissions)
    );
  },
  updateDriverPermissionsSuccess(driverNetworksAndPermissions) {
    console.debug("ALright");
    return {
      type: types.UPDATE_DRIVER_PERMISSIONS,
      driverNetworksAndPermissions,
    };
  },
  updateStorePermissions(dispatch, storeNetworksAndPermissions) {
    dispatch(
      actions.updateStorePermissionsSuccess(storeNetworksAndPermissions)
    );
  },
  updateStorePermissionsSuccess(storeNetworksAndPermissions) {
    console.debug("ALright");
    return {
      type: types.UPDATE_STORE_PERMISSIONS,
      storeNetworksAndPermissions,
    };
  },
  updateLogisticsPermissions(dispatch, logisticsNetworksAndPermissions) {
    dispatch(
      actions.updateLogisticsPermissionsSuccess(logisticsNetworksAndPermissions)
    );
  },
  updateLogisticsPermissionsSuccess(logisticsNetworksAndPermissions) {
    console.debug("ALright");
    return {
      type: types.UPDATE_LOGISTICS_PERMISSIONS,
      logisticsNetworksAndPermissions,
    };
  },
};

const initialState = {
  user: null,
  successUsername:null,
  successPassword: null,
  customerNetworksAndPermissions: [],
  driverNetworksAndPermissions: [],
  storeNetworksAndPermissions: [],
  logisticsNetworksAndPermissions: [],
  token: null,
  tokenExpiry: null,
  finishIntro: null,
};

export const reducer = (state = initialState, action) => {
  const {
    type,
    user,
    successUsername,
    successPassword,
    token,
    tokenExpiry,    
    customerNetworksAndPermissions,
    driverNetworksAndPermissions,
    storeNetworksAndPermissions,
    logisticsNetworksAndPermissions,
  } = action;
  switch (type) {
    case types.LOGOUT:
     // EventRegister.emit('resetRouterStateToDefault');
      return Object.assign({}, initialState);
    case types.LOGIN:
      console.debug(
        `"We are applying login redux for user:${user} and token ${token}"`
      );
      return { ...state, user, successUsername, successPassword, token, tokenExpiry };
    case types.FINISH_INTRO:
      return { ...state, finishIntro: true };
    case types.UPDATE_CUSTOMER_PERMISSIONS:
      return {
        ...state,
        customerNetworksAndPermissions: customerNetworksAndPermissions,
      };
    case types.UPDATE_DRIVER_PERMISSIONS:
      return {
        ...state,
        driverNetworksAndPermissions: driverNetworksAndPermissions,
      };
    case types.UPDATE_STORE_PERMISSIONS:
      return {
        ...state,
        storeNetworksAndPermissions: storeNetworksAndPermissions,
      };
    case types.UPDATE_LOGISTICS_PERMISSIONS:
      return {
        ...state,
        logisticsNetworksAndPermissions: logisticsNetworksAndPermissions,
      };
    default:
      return state;
  }
};
