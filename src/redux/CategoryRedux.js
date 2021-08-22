/**
 * Created by InspireUI on 14/02/2017.
 *
 * @format
 */

import { Config } from "@common";
// import { warn } from '@app/Omni'
import PlatformApiClient from "../services/PlatformApiClient";
import HopprWorker from "../services/HopprWorker";
import store from "@store/configureStore";
import ImageHelper from "../helper/ImageHelper"
import { EventRegister } from "react-native-event-listeners";
import { showMessage } from "react-native-flash-message";


const types = {
  FETCH_NETWORK_PICKER_NETWORKS: "FETCH_NETWORK_PICKER_NETWORKS",
  FETCH_NETWORK_PICKER_NETWORKS_SUCCESS:
    "FETCH_NETWORK_PICKER_NETWORKS_SUCCESS",
  FETCH_NETWORK_PICKER_NETWORKS_FAILURE:
    "FETCH_NETWORK_PICKER_NETWORKS_FAILURE",

  FETCH_CATEGORIES_PENDING: "FETCH_CATEGORIES_PENDING",
  FETCH_CATEGORIES_SUCCESS: "FETCH_CATEGORIES_SUCCESS",
  FETCH_CATEGORIES_FAILURE: "FETCH_CATEGORIES_FAILURE",
  RESET_CATEGORIES: "RESET_CATEGORIES",

  //Whatever was queried last
  UPDATE_LATEST_QUERIED_NETWORK: "UPDATE_LATEST_QUERIED_NETWORK",

  ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS: "ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS",
  ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS_SUCCESS: "ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS_SUCCESS",

  SWITCH_DISPLAY_MODE: "SWITCH_DISPLAY_MODE",
  SET_SELECTED_CATEGORY: "SET_SELECTED_CATEGORY",
  CATEGORY_SELECT_LAYOUT: "CATEGORY_SELECT_LAYOUT",

  UPDATE_FIRST_INSTANCE_LOAD:"UPDATE_FIRST_INSTANCE_LOAD"
};

export const DisplayMode = {
  ListMode: "ListMode",
  GridMode: "GridMode",
  CardMode: "CardMode",
};

export const actions = {
  addNetworkToLocalPickerIfNotExists: (dispatch, networkToAdd) => {
    let existingStore = store.getState();
    let isThisNetworkThereAlready = existingStore.categories.networkPickerData.find(x => x.id == networkToAdd.networkId);
    if (typeof isThisNetworkThereAlready === "undefined") {
      let newNetModel = {
        id: networkToAdd.networkId,
        name: networkToAdd.storeName,
        description: networkToAdd.description,
        explainerVideoUrl: networkToAdd.explainerVideoUrl || "",
        networkCssColor: "black",
        storeLogoUrl: networkToAdd.storeLogoUrl
      }
      if (networkToAdd.networkSettings.length > 0) {
        newNetModel.networkCssColor = networkToAdd.networkSettings[0].cssMainScreenBarColor;
      }
      //add it
      dispatch(actions.addNetworkToLocalPickerIfNotExistsSuccess(newNetModel));
    }

    return;
  },
  addNetworkToLocalPickerIfNotExistsSuccess: (newNet) => {
    return { type: types.ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS_SUCCESS, newNet };
  },
  fetchCategories: async (dispatch, selectedNetworkGuid, showAgeNotification = true) => {
    // dispatch({ type: types.FETCH_CATEGORIES_PENDING });
    return new Promise(async (resolve, reject) => {
      //check client is init
      // if (!HopprWorker.initalised && !HopprWorker.initalisedWithCreds) {
      //   HopprWorker.init({ username: null, password: null });
      // }

      console.debug("in fetch categories");
      console.debug("Getting categories now from server in category redux");

      //SET FROM SELECTED NETWORK - SORT THIS OUT!!"!"
      if (typeof selectedNetworkGuid !== "undefined") {
        netID = selectedNetworkGuid;
      } else {
        dispatch(actions.fetchCategoriesFailure("Can't get data from server"));
        alert(
          "Unable to get categories in network redux - passed networkID is undefined"
        );
        reject();
      }

      let existingStore = store.getState();
      let pickedDestination  = existingStore.location.mostRecentOrderDestinationLatLng;
      let pickedLat = null;
      let pickedLng = null;
      if(typeof pickedDestination !== "undefined")
      {
        pickedLat = pickedDestination.lat;
        pickedLng = pickedDestination.lng;
      }      

      let response = await HopprWorker.getCategoriesAndNestedProductsInStock(netID,pickedLat,pickedLng);
      let json = [];
      var parsedJson = [];
      if (response.status == 200) {
        json = response.data;
        if(json.length > 0)
        {
          parsedJson= JSON.parse(json);
        }        
      }        
     
     
      if (parsedJson === undefined) {
        reject();
        dispatch(actions.fetchCategoriesFailure("Can't get data from server"));
      } else if (parsedJson.code) {
        dispatch(actions.fetchCategoriesFailure(parsedJson.message));
        reject();
      } else {

        //clear the navigation category stack else it will crash
        let filteredCats = parsedJson.filter(x=>x.Products.length > 0);

        //cache cat image
        var imrUrls = filteredCats.map(x=>{
            return x.image;
        })
        ImageHelper.cacheImages(imrUrls);
        dispatch(actions.fetchCategoriesSuccess(filteredCats, netID));
        resolve();
      }
    });
  },
  fetchCategoriesSuccess: (items, netGuid) => {
    return { type: types.FETCH_CATEGORIES_SUCCESS, items, netGuid };
  },
  fetchCategoriesFailure: (error) => {
    return { type: types.FETCH_CATEGORIES_FAILURE, error };
  },
  switchDisplayMode: (mode) => {
    return { type: types.SWITCH_DISPLAY_MODE, mode };
  },
  setSelectedCategory: (category) => {
    return { type: types.SET_SELECTED_CATEGORY, category };
  },
  setActiveLayout: (value) => {
    return { type: types.CATEGORY_SELECT_LAYOUT, value };
  },
  fetchNetworkPickerData: async (dispatch) => {
    console.debug("in fetch network picker data");
    return new Promise(async (resolve, reject) => {
      let netPickerResult = await HopprWorker.getAvailableShoppingNetworks();
      if (netPickerResult.status == 200) {
        dispatch(actions.fetchNetworkPickerDataSuccess(netPickerResult.data));
        resolve();
      } else {
        dispatch(actions.fetchNetworkPickerDataFailure(netPickerResult.error));
        reject();
      }
    });
  },
  fetchNetworkPickerDataSuccess: (netsPickerData) => {
    return {
      type: types.FETCH_NETWORK_PICKER_NETWORKS_SUCCESS,
      netsPickerData,
    };
  },
  fetchNetworkPickerDataFailure: (error) => {
    return { type: types.FETCH_NETWORK_PICKER_NETWORKS_FAILURE, error };
  },
  updateLatestQueriedNetwork: (dispatch, lastQueried) => {
    return {
      type: types.UPDATE_LATEST_QUERIED_NETWORK,
      lastQueriedNet: lastQueried,
    };
  },
  resetCategories: async (dispatch) => {
    return new Promise((resolve, reject) => {
      try {
        dispatch(actions.resetCategoriesSuccess());
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  resetCategoriesSuccess: () => {
    return { type: types.RESET_CATEGORIES };
  },
  updateFirstInstanceLoad: (dispatch, newBoolValue) => {   
    dispatch({
      type: types.UPDATE_FIRST_INSTANCE_LOAD,
      firstInstanceAppLoad: newBoolValue      
    });
  },  
};

const initialState = {
  isFetching: false,
  error: null,
  displayMode: DisplayMode.GridMode,
  list: [],
  selectedCategory: null,
  currentlySelectedNetworkGuid: undefined, //this is the latest 'picked' network for GUI, basket etc
  selectedLayout: Config.CategoryListView,
  networkPickerData: [], //this is all the available networks shown in the picker,
  latestQueriedNetwork: undefined, //last network they asked for details about in GUI
  firstInstanceAppLoad:true, //each time the app starts, this is set true / false
};

//this actual reducer that saves state based on result
export const reducer = (state = initialState, action) => {
  const {
    type,
    mode,
    error,
    items,
    category,
    value,
    netGuid,
    netsPickerData,
    lastQueriedNet,
    newNet,
    firstInstanceAppLoad
  } = action;

  switch (type) {
    case types.RESET_CATEGORIES: {
      console.debug("about to reset categories");
      return {
        ...state,
        list: [],
        selectedCategory: undefined,
      };
    }
    case types.FETCH_CATEGORIES_PENDING: {
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    }
    case types.FETCH_CATEGORIES_SUCCESS: {
      console.debug("In category redux, we successfully fetched catgories");
      return {
        ...state,
        isFetching: false,
        list: items,
        currentlySelectedNetworkGuid: netGuid,
        error: null,
      };
    }
    case types.FETCH_CATEGORIES_FAILURE: {
      return {
        ...state,
        isFetching: false,
        list: [],
        error,
      };
    }
    case types.SWITCH_DISPLAY_MODE: {
      return {
        ...state,
        displayMode: mode,
      };
    }
    case types.SET_SELECTED_CATEGORY: {
      return {
        ...state,
        selectedCategory: category,
      };
    }
    case types.CATEGORY_SELECT_LAYOUT:
      return {
        ...state,
        isFetching: false,
        selectedLayout: value || false,
      };
    case types.FETCH_NETWORK_PICKER_NETWORKS: {
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    }
    case types.FETCH_NETWORK_PICKER_NETWORKS_FAILURE: {
      return {
        ...state,
        isFetching: false,
        list: [],
        error,
      };
    }
    case types.FETCH_NETWORK_PICKER_NETWORKS_SUCCESS: {
      console.debug("This is where we want to be");
      return {
        ...state,
        isFetching: false,
        networkPickerData: netsPickerData,
        error: null,
      };
    }
    case types.UPDATE_LATEST_QUERIED_NETWORK: {
      console.debug("UPdate latest queried netwotrk");
      return {
        ...state,
        latestQueriedNetwork: lastQueriedNet,
      };
    }
    case types.ADD_NETWORK_TO_LOCAL_PICKER_IF_NOT_EXISTS_SUCCESS: {
      console.debug("adding");
      let existingPickerData = state.networkPickerData;
      let copiedArray = [...existingPickerData];
      copiedArray.push(newNet);
      return {
        ...state,
        networkPickerData: copiedArray
      };
    }
    case types.UPDATE_FIRST_INSTANCE_LOAD: {      
      return {
        ...state,
        firstInstanceAppLoad: firstInstanceAppLoad,
      };
    }
    default: {
      return state;
    }
  }
};
