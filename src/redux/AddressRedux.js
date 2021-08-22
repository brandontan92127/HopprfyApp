import { Config } from "@common";
// import { warn } from '@app/Omni'
// import { WooWorker } from "api-ecommerce";
import _ from "lodash";

const types = {
  ADD_ADDRESS: "ADD_ADDRESS",
  REMOVE_ADDRESS: "REMOVE_ADDRESS",
  SELECTED_ADDRESS: "SELECTED_ADDRESS",
  INIT_ADDRESSES: "INIT_ADDRESSES",
  UPDATE_SELECTED_ADDRESS: "UPDATE_SELECTED_ADDRESS",
};

export const actions = {
  addAddress: (dispatch, address) => {
    console.debug("Adding address:" + JSON.stringify(address));
    dispatch({ type: types.ADD_ADDRESS, address });
  },

  removeAddress: (dispatch, index) => {
    dispatch({ type: types.REMOVE_ADDRESS, index });
  },

  selectAddress: (dispatch, address) => {
    dispatch({ type: types.SELECTED_ADDRESS, address });
  },
  initAddresses: (dispatch, customerInfo) => {
    let address = {
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      firstName: customerInfo.firstName,
      streetNumber: "",
      street: "",
      zip: "",
      country: "",
      telephone: "",
      note: "",
      city: "",
    };

    console.debug("In redux initAddress with adress:" + address);
    dispatch({ type: types.INIT_ADDRESSES, address });
  },
  updateSelectedAddress: (dispatch, address) => {
    dispatch({ type: types.UPDATE_SELECTED_ADDRESS, address });
  },
};

const initialState = {
  list: [],
  reload: false,
};

export const reducer = (state = initialState, action) => {
  const { type } = action;

  switch (type) {
    case types.ADD_ADDRESS: {
      state.list.push(action.address);
      return {
        ...state,
        reload: !state.reload,
      };
    }
    case types.REMOVE_ADDRESS: {
      state.list.splice(action.index, 1);
      return {
        ...state,
        reload: !state.reload,
      };
    }
    case types.SELECTED_ADDRESS: {
      return {
        ...state,
        reload: !state.reload,
        selectedAddress: action.address,
      };
    }
    case types.INIT_ADDRESSES: {
      return {
        ...state,
        reload: !state.reload,
        selectedAddress: action.address,
        list: [action.address],
      };
    }
    case types.UPDATE_SELECTED_ADDRESS: {
      var list = state.list || [];
      var index = -1;
      list.forEach((item, i) => {
        if (_.isEqual(item, state.selectedAddress)) {
          index = i;
        }
      });
      if (index > -1) {
        list.splice(index, 1);
      }
      list.push(action.address);
      return {
        ...state,
        reload: !state.reload,
        list,
        selectedAddress: action.address,
      };
    }
    default: {
      return state;
    }
  }
};
