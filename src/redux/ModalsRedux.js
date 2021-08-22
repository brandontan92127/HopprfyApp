import { Config } from "@common";
import HopprWorker from "../services/HopprWorker";
import locationUpdateRequest from "../apiModels/location/locationUpdateRequest";
import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";

const defaultModalArray=[
  { modalName: "orderRequestModal", isOpenValue: false }, //for driver. so they can accept the order
  { modalName: "youGotPaidModal", isOpenValue: false }, //for anyone
  { modalName: "orderWasCancelledTellDriverModal", isOpenValue: false }, //for driver
  { modalName: "storeConfirmOrderPickupModal", isOpenValue: false },
  { modalName: "orderWasCancelledTellCustomerModal", isOpenValue: false },
  {
    modalName: "orderWasConfirmedAcceptedTellCustomerModal",
    isOpenValue: false,
  },
  { modalName: "orderRequestedModal", isOpenValue: false }, //for customer, when they put in order
  { modalName: "wasOrderCompletedModal", isOpenValue: false }, //for customer, when they put in order
  { modalName: "storeReceivesNewOrderModal", isOpenValue: false }, //for store , when they recieve order
  { modalName: "oneMoreStepModal", isOpenValue: false }, //for anyone before they get paid
  { modalName: "driverCompleteOrderModal", isOpenValue: false }, //for anyone before they get paid
  { modalName: "addRemoveCardModal", isOpenValue: false }, //for anyone before they get paid
  {
    modalName: "orderWasConfirmedPickedUpTellCustomerModal",
    isOpenValue: false,
  }, //for anyone before they get paid
  { modalName: "storeLocationPickerModal", isOpenValue: false }, //for anyone before they get paid
  { modalName: "locationPickerModal", isOpenValue: false }, //location
  { modalName: "salesBIModal", isOpenValue: false }, //BI,
  { modalName: "chatModal", isOpenValue: false }, //chat
  { modalName: "cashoutModal", isOpenValue: false }, //cashout
  { modalName: "networkPickerModal", isOpenValue: false }, //network picker
  { modalName: "networkSearchAndAddModal", isOpenValue: false }, //network search and add permissions
  { modalName: "networkDisplayModal", isOpenValue: false }, //network display
  { modalName: "requestPermissionsModal", isOpenValue: false }, //request new permissions
  { modalName: "inboundPermissionsModal", isOpenValue: false }, //inbound permissions
  { modalName: "nearestStoresAndNetworksModal", isOpenValue: false }, //request new permissions
  { modalName: "networkInfoModal", isOpenValue: false }, //request new permissions
  { modalName: "videoDisplayModal", isOpenValue: false }, //video display
  { modalName: "startingHelpModal", isOpenValue: false }, //help display
  { modalName: "quickControlsModal", isOpenValue: false }, //help display
  { modalName: "orderLogisticsDriverRequestModal", isOpenValue: false }, //order logistics - driver request
  { modalName: "tellDriverUpdatedLogisticsModal", isOpenValue: false },
  { modalName: "actionMessageModal", isOpenValue: false },
  { modalName: "customerOrderRequestsModal", isOpenValue: false },  
  { modalName: "driverOrderRequestsModal", isOpenValue: false },   
  { modalName: "courierControlsModal", isOpenValue: false },   
  { modalName: "networkSwitcherModal", isOpenValue: false },   
  { modalName: "resetPasswordModal", isOpenValue: false },
];

const types = {
  UPDATE_MODAL_PENDING: "UPDATE_MODAL_PENDING",
  UPDATE_MODAL_FAILURE: "UPDATE_MODAL_FAILURE",
  UPDATE_MODAL_SUCCESS: "UPDATE_MODAL_SUCCESS",

  TEST_BEGUN: "TEST_BEGUN",
  TEST_SUCCEEDED: "TEST_SUCCEEDED",
  TEST_FAILED: "TEST_FAILED",

  //FOR HOME AUTOCOMPLETES
  UPDATE_PRODUCT_AUTOCOMPLETE: "UPDATE_PRODUCT_AUTOCOMPLETE",
  UPDATE_LOCATION_AUTOCOMPLETE: "UPDATE_LOCATION_AUTOCOMPLETE",

  //FOR AUTOCOMPLETE SEARCHES
  //UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM: "UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM",
  UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_RESULTS:
    "UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_RESULTS",
  //latest prod/net search for super search modal
  UPDATE_PRODUCT_AND_NETWORK_RESULTS: "UPDATE_PRODUCT_AND_NETWORK_RESULTS",
  UPDATE_CURRENTLY_SELECTED_NETWORK_PICKER_NETWORK:
    "UPDATE_CURRENTLY_SELECTED_NETWORK_PICKER_NETWORK",
  UPDATE_FULL_SCREEN_LIST_NETWORK_PICKER_NETWORK:
    "UPDATE_FULL_SCREEN_LIST_NETWORK_PICKER_NETWORK",

  CLEAR_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM: "CLEAR_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM",
  RESET_TO_DEFAULT: "RESET_TO_DEFAULT",
  UPDATE_NETWORK_SWITCHER_SCROLL_OFFSET: "UPDATE_NETWORK_SWITCHER_SCROLL_OFFSET",
};

export const actions = {
  resetModalArrayToDefault: () => {    
  //   setTimeout(()=>{t 
  //     style:{    
  //       borderTopLeftRadius: 20,
  //       borderTopRightRadius: 20
  //     },            
  //     position: "bottom",
  //   });
  // },4000)
  defaultModalArray.map((e) => {
    let findValue = state.modalsArray.find(x=>x.modalName === e.modalName);
    if(typeof findValue === "undefined") {
      console.log("++++pushing modal");
      state.modalsArray.push(e);
    }
  })
    return { type: types.RESET_TO_DEFAULT };
  },
  updateModalActive: (dispatch, modalName, modalActive) => {
    return dispatch(actions.updateModalActiveSuccess(modalName, modalActive));
  },
  updateModalActiveSuccess: (modalName, modalActive) => {
    return {
      type: types.UPDATE_MODAL_SUCCESS,
      modalName,
      modalActive,
      finish: true,
    };
  },
  updateModalActiveFailure: (error) => {
    return { type: types.UPDATE_MODAL_FAILURE, error, finish: true };
  },

  //FOR AUTOCOMPLETES IN STICKY PANEL IN HOME
  updateProductAutocomplete: (dispatch, newVisibleValue) => {
    dispatch(actions.updateProductAutocompleteSuccess(newVisibleValue));
  },
  updateProductAutocompleteSuccess: (newVisibleValue) => {
    return {
      type: types.UPDATE_PRODUCT_AUTOCOMPLETE,
      productAutocompleteVisible: newVisibleValue,
    };
  },
  updateLocationAutocomplete: (dispatch, newVisibleValue) => {
    dispatch(actions.updateLocationAutocompleteSuccess(newVisibleValue));
  },
  updateLocationAutocompleteSuccess: (newVisibleValue) => {
    return {
      type: types.UPDATE_LOCATION_AUTOCOMPLETE,
      locationAutocompleteVisible: newVisibleValue,
    };
  },
  updateProductAutocompleteSearchResults: (
    dispatch,
    newSearchTerm,
    newSearchResult
  ) => {
    dispatch(
      actions.updateProductAutocompleteSearchResultsSuccess(
        newSearchTerm,
        newSearchResult
      )
    );
  },
  clearProductAutocompleteSearchTerm: (
    dispatch,
  ) => {
    dispatch(
      actions.clearProductAutocompleteSearchTermSuccess(
      )
    );
  },
  updateProductAutocompleteSearchResultsSuccess: (
    newSearchTerm,
    newSearchResult
  ) => {
    return {
      type: types.UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_RESULTS,
      latestProductAutocompleteSearchTerm: newSearchTerm,
      latestProductAutocompleteSearchResults: newSearchResult,
    };
  },
  updateProductAndNetworkSearchResults: (dispatch, latestResults) => {
    dispatch(
      actions.updateProductAndNetworkSearchResultsSuccess(latestResults)
    );
  },
  updateProductAndNetworkSearchResultsSuccess: (latestResults) => {
    return {
      type: types.UPDATE_PRODUCT_AND_NETWORK_RESULTS,
      latestProductAndNetworkResults: latestResults,
    };
  },
  clearProductAutocompleteSearchTermSuccess: () => {
    return {
      type: types.CLEAR_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM
    };
  },

  //FOR 'NETWORKPICKERMODAL' - SUPER SEARCH (Product)
  updateCurrentlySelectedNetworkInNetworkPickerModal: (
    dispatch,
    currentNet
  ) => {
    dispatch(
      actions.updateCurrentlySelectedNetworkInNetworkPickerModalSuccess(
        currentNet
      )
    );
  },
  updateCurrentlySelectedNetworkInNetworkPickerModalSuccess: (currentNet) => {
    return {
      type: types.UPDATE_CURRENTLY_SELECTED_NETWORK_PICKER_NETWORK,
      currentlySelectedNetwork: currentNet,
    };
  },
  updateFullScreenListInNetworkPickerModal: (dispatch, fullScreenListBool) => {
    dispatch(
      actions.updateFullScreenListInNetworkPickerModalSuccess(
        fullScreenListBool
      )
    );
  },
  updateFullScreenListInNetworkPickerModalSuccess: (fullScreenListBool) => {
    return {
      type: types.UPDATE_FULL_SCREEN_LIST_NETWORK_PICKER_NETWORK,
      fullScreenList: fullScreenListBool,
    };
  },
  updateNetworkSwitcherScrollOffset: (newOffset) => {
    return {
      type: types.UPDATE_NETWORK_SWITCHER_SCROLL_OFFSET,
      currentNetworkSwitchScrollOffset: newOffset
    };
  },

};

const initialState = {
  currentNetworkSwitchScrollOffset:0,
  //netwrokpickermodal - product search
  currentlySelectedNetwork: undefined,
  fullScreenList: true,
  //Home autocomplete / panel and associated
  latestProductAutocompleteSearchTerm: "",
  latestProductAutocompleteSearchResults: [],
  latestProductAndNetworkResults: [],
  productAutocompleteVisible: true,
  locationAutocompleteVisible: true,
  //modals open close
  error: null,
  finish: null,
  modalsArray: defaultModalArray,
};

export const reducer = (state = initialState, action) => {
  const {
    type,
    modalName,
    modalActive,
    finish,
    fullScreenList,
    currentlySelectedNetwork,
    productAutocompleteVisible,
    locationAutocompleteVisible,
    latestProductAutocompleteSearchTerm,
    latestProductAutocompleteSearchResults,
    latestProductAndNetworkResults,
    currentNetworkSwitchScrollOffset
  } = action;
  console.debug("in modal reducer");
  switch (type) {
    case types.UPDATE_MODAL_FAILURE: {
      console.debug("Updating modal state failed");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.UPDATE_MODAL_SUCCESS: {
      try {
        console.debug("Updating modal state succeeded");

        //generaate a new array and replace or rerender won't trigger in Component
        let newArray = state.modalsArray.filter(
          (item) => item.modalName !== modalName
        ); //get new array without item
        newArray.push({ modalName: modalName, isOpenValue: modalActive });

        return {
          ...state,
          modalsArray: newArray,
          finish: true,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    case types.RESET_TO_DEFAULT: {
      return {
        ...state,
        modalsArray: defaultModalArray,
      };
    }
    case types.CLEAR_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_TERM: {
      console.debug("test has hit");
      return {
        ...state,
        latestProductAutocompleteSearchTerm: undefined,
      };
    }
    case types.UPDATE_PRODUCT_AUTOCOMPLETE: {
      console.debug("test has hit");
      return {
        ...state,
        productAutocompleteVisible: productAutocompleteVisible,
      };
    }
    case types.UPDATE_LOCATION_AUTOCOMPLETE: {
      console.debug("test has hit");
      return {
        ...state,
        locationAutocompleteVisible: locationAutocompleteVisible,
      };
    }
    case types.UPDATE_PRODUCT_AUTOCOMPLETE_LATEST_SEARCH_RESULTS: {
      console.debug("test has hit");
      return {
        ...state,
        latestProductAutocompleteSearchResults: latestProductAutocompleteSearchResults,
        latestProductAutocompleteSearchTerm: latestProductAutocompleteSearchTerm,
      };
    }
    case types.UPDATE_PRODUCT_AND_NETWORK_RESULTS: {
      console.debug("test has hit");
      return {
        ...state,
        latestProductAndNetworkResults: latestProductAndNetworkResults,
      };
    }
    case types.UPDATE_CURRENTLY_SELECTED_NETWORK_PICKER_NETWORK: {
      console.debug("test has hit");
      return {
        ...state,
        currentlySelectedNetwork: currentlySelectedNetwork,
      };
    }
    case types.UPDATE_FULL_SCREEN_LIST_NETWORK_PICKER_NETWORK: {
      console.debug("test has hit");
      return {
        ...state,
        fullScreenList: fullScreenList,
      };
    }
    case types.UPDATE_PRODUCT_AUTOCOMPLETE: {
      console.debug("test has hit");
      return {
        ...state,
        productAutocompleteVisible: productAutocompleteVisible,
      };
    }
    case types.UPDATE_NETWORK_SWITCHER_SCROLL_OFFSET: {
      console.debug("test has hit");
      return {
        ...state,
        currentNetworkSwitchScrollOffset: currentNetworkSwitchScrollOffset,
      };
    }
    default: {
      return state;
    }
  }
};
