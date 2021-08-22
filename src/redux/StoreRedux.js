import { Config } from "@common";
import HopprWorker from "../services/HopprWorker";
import locationUpdateRequest from "../apiModels/location/locationUpdateRequest";

const types = {
  UPDATE_STORE_ACTIVE_SUCCESS: "UPDATE_STORE_ACTIVE_SUCCESS",
  //ACTIVE_STORE_FETCHING: "ACTIVE_STORE_FETCHING",
  UPDATE_STORE_ACTIVE_FAILURE: "UPDATE_STORE_ACTIVE_FAILURE",

  //STOCK COLLECTION
  UPDATE_STORESTOCK_COLLECTION_SUCCESS: "UPDATE_STORESTOCK_COLLECTION_SUCCESS",
  UPDATE_STORESTOCK_COLLECTION_FAILURE: "UPDATE_STORESTOCK_COLLECTION_FAILURE",
  //STOCK
  UPDATE_STORESTOCK_ITEM_SUCCESS: "UPDATE_STORESTOCK_ITEM_SUCCESS",
  UPDATE_STORESTOCK_ITEM_FAILURE: "UPDATE_STORESTOCK_ITEM_FAILURE",

  //STOCK AMENDMENT COLLECTION
  UPDATE_STOCKAMENDMENT_COLLECTION_SUCCESS:
    "UPDATE_STOCKAMENDMENT_COLLECTION_SUCCESS",
  UPDATE_STOCKAMENDMENT_COLLECTION_FAILURE:
    "UPDATE_STOCKAMENDMENT_COLLECTION_FAILURE",
  //STOCK AMENDMENT
  UPDATE_STOCKAMENDMENT_ITEM_SUCCESS: "UPDATE_STOCKAMENDMENT_ITEM_SUCCESS",
  UPDATE_STOCKAMENDMENT_ITEM_FAILURE: "UPDATE_STOCKAMENDMENT_ITEM_FAILURE",
};

export const actions = {
  updateStoreActive: async (dispatch, storeActive) => {
    return dispatch(actions.updateStoreActiveSuccess(storeActive));
  },
  updateStoreActiveSuccess: (storeActive) => {
    return {
      type: types.UPDATE_STORE_ACTIVE_SUCCESS,
      storeActive,
      finish: true,
    };
  },
  updateStoreActiveFailure: (error) => {
    return { type: types.UPDATE_STORE_ACTIVE_FAILURE, error, finish: true };
  },
  //ALL STOCK - COLLETIONS
  updateStockCollection: async (dispatch, stockArray) => {
    return dispatch(actions.updateStockCollectionSuccess(stockArray));
  },
  updateStockCollectionSuccess: (stockArray) => {
    return {
      type: types.UPDATE_STORESTOCK_COLLECTION_SUCCESS,
      stockArray,
      finish: true,
    };
  },
  updateStockCollectionFailure: (error) => {
    return {
      type: types.UPDATE_STORESTOCK_COLLECTION_FAILURE,
      error,
      finish: true,
    };
  },
  //INDIVIDUAL STOCKS
  updateStockItem: (stockItem) => {
    return dispatch(actions.updateStockItemSuccess(stockItem));
  },
  updateStockItemSuccess: (stockItem) => {
    return {
      type: types.UPDATE_STORESTOCK_ITEM_SUCCESS,
      stockItem,
      finish: true,
    };
  },
  updateStockItemFailure: (error) => {
    return { type: types.UPDATE_STORESTOCK_ITEM_FAILURE, error, finish: true };
  },
};

const initialState = {
  finish: false,
  error: null,
  storeActive: false,
  myStoreStocksAndAmendments: [],
  myStoreOrders: [],
};

export const reducer = (state = initialState, action) => {
  console.debug("in store reducer");
  const { type, storeActive, stockArray, stockItem, finish } = action;
  switch (type) {
    //ACTIVE
    case types.UPDATE_STORE_ACTIVE_FAILURE: {
      console.debug("UPdating active store state FAILEd");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.UPDATE_STORE_ACTIVE_SUCCESS: {
      try {
        console.debug("UPdating active store state");
        return {
          ...state,
          storeActive: storeActive,
          finish: true,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    //STOCK - COLLECTION
    case types.UPDATE_STORESTOCK_COLLECTION_FAILURE: {
      console.debug("Updating store stock collection failed");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.UPDATE_STORESTOCK_COLLECTION_SUCCESS: {
      try {
        console.debug("Updating store stock collection succeeded");
        return {
          ...state,
          myStoreStocksAndAmendments: stockArray,
          finish: true,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    //STOCK - ITEM
    case types.UPDATE_STORESTOCK_ITEM_FAILURE: {
      console.debug("Updating store stock item failed");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.UPDATE_STORESTOCK_ITEM_SUCCESS: {
      try {
        console.debug("Updating store stock item succeeded");
        let copiedArray = [...myStoreStocksAndAmendments];
        let indexOfItem = copiedArray.findIndex(
          (el) => el.productId === stockItem.productId
        );
        copiedArray[indexOfItem] = stockItem;
        return {
          ...state,
          myStoreStocksAndAmendments: copiedArray,
          finish: true,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    default: {
      return state;
    }
  }
};
