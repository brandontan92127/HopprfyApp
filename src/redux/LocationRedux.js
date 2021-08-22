import GeoWorker from "../services/GeoWorker";
import { Config } from "@common";
import HopprWorker from "../services/HopprWorker";
import locationUpdateRequest from "../apiModels/location/locationUpdateRequest";
import { toast } from "@app/Omni";
import { EventRegister } from "react-native-event-listeners";
import { Alert } from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { showMessage, hideMessage } from "react-native-flash-message";

const defaultLocation = {
  mostRecentOrderDestinationLatLng: {
    lat: undefined,
    lng: undefined,
  },
  latestPickerDestinationText: "", //THIS IS PROPERLY FORMATTED
  latestPickerTextInputBackingField: "", //THIS IS USED FOR TEXTINPUT
  fullGeoDestinationAddress: undefined,
  manualAddressPrefixInput: ""
}

const types = {
  ORDER_DESTINATION_LOCATION_SUCCESS: "ORDER_DESTINATION_LOCATION_SUCCESS",
  ORDER_DESTINATION_LOCATION_FETCHING: "ORDER_DESTINATION_LOCATION_FETCHING",
  ORDER_DESTINATION_LOCATION_FAILURE: "ORDER_DESTINATION_LOCATION_FAILURE",

  CURRENT_LOCATION_SUCCESS: "CURRENT_LOCATION_SUCCESS",
  CURRENT_LOCATION_FETCHING: "CURRENT_LOCATION_FETCHING",
  CURRENT_LOCATION_FAILURE: "CURRENT_LOCATION_FAILURE",

  UPDATE_STORE_LOCATION_SUCCESS: "UPDATE_STORE_LOCATION_SUCCESS",
  UPDATE_STORE_LOCATION_FAILURE: "UPDATE_STORE_LOCATION_FAILURE",
  UPDATE_STORE_LOCATION_PENDING: "UPDATE_STORE_LOCATION_PENDING",

  UPDATE_LOCATION_WATCH: "UPDATE_LOCATION_WATCH",
  CLEAR_LOCATION_WATCH: "CLEAR_LOCATION_WATCH",

  UPDATE_TEXTINPUT:"UPDATE_TEXTINPUT",
  UPDATE_MANUAL_ADDRESS:"UPDATE_MANUAL_ADDRESS",
  RESET_ORDER_DESTINATION_LOCATION_TO_DEFAULT: "RESET_ORDER_DESTINATION_LOCATION_TO_DEFAULT",
};



export const actions = {
  startLocationWatchWithApiLocationPush: async (
    dispatch,
    relationGuid,
    urlToPostTo,
    existingWatchId
  ) => {
    return new Promise(async (resolve, reject) => {
      toast("WE IN THE OUTER LOOP...")
      console.log("we made it!!");
      try {
        BackgroundGeolocation.checkStatus(async status => {
          console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
          console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
          console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
          toast("OK WE IN!!!")
          // you don't need to check status before start
          if (!status.isRunning) {        

            BackgroundGeolocation.on('authorization', (status) => {
              console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
              if (status !== BackgroundGeolocation.AUTHORIZED) {
                // we need to set delay or otherwise alert may not be shown
                setTimeout(() =>
                  Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                    { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                    { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                  ]), 1000);
              }
            });

            BackgroundGeolocation.on('location', async (location) => {
              // handle your locations here
              // to perform long running operation on iOS
              // you need to create background task
              BackgroundGeolocation.startTask(async taskKey => {
                // execute long running task
                // eg. ajax post location
            try {                             
               let locationUpdateRequest = {
                  relationGuid: relationGuid,
                  lat: location.latitude,
                  long: location.longitude,
                }; 

                console.log("");
                let updateRes = await HopprWorker.updateLocationOnApi(
                  urlToPostTo,
                  JSON.stringify(locationUpdateRequest)
                );

                if(updateRes.status == 200)
                {
                  // showMessage({
                  //   message: "Location updated",
                  //   autoHide: true,
                  //   duration: 2000,
                  //   description:
                  //     "",
                  //   backgroundColor: "#761BF1", // background color
                  //   color: "white", // text color
                  // });
                  
                }
                else{
                  showMessage({
                    message: "Location updated failed",
                    autoHide: true,
                    duration: 2000,
                    description:
                      "",
                    backgroundColor: "red", // background color
                    color: "white", // text color
                  });
                }

                //convert to standard 'coords' object
                let position = {
                  coords: {
                    latitude: location.latitude,
                    longitude: location.longitude
                  }
                }             

                return { type: types.CURRENT_LOCATION_SUCCESS, currentPosition:position };
                // dispatch(actions.getCurrentLocationSuccess(position));

              } catch (error) {
                showMessage({
                  message: "Couldn't get location",
                  autoHide: true,
                  duration: 2000,
                  description:
                    error.message,
                  backgroundColor: "#761BF1", // background color
                  color: "white", // text color
                });
              }

                //toast(JSON.stringify(location));
                // IMPORTANT: task has to be ended by endTask
                BackgroundGeolocation.endTask(taskKey);
              });
            });

            BackgroundGeolocation.on('stationary', (location) => {
              // showMessage({
              //   message: "Location stationary!!",
              //   autoHide: true,
              //   duration: 2000,
              //   description:
              //     "",
              //   backgroundColor: "orange", // background color
              //   color: "white", // text color
              // });
            });

            BackgroundGeolocation.on('error', (error) => {
              showMessage({
                message: "Location ERROR:",
                autoHide: true,
                duration: 2000,
                description:
                  error.message,
                backgroundColor: "red", // background color
                color: "white", // text color
              });
            });

            BackgroundGeolocation.on('start', () => {
              toast('[INFO] BackgroundGeolocation service has been started');
              let watchId = 12345 //fake a watch ID so other parts of program think location push service is active           
              dispatch(actions.updateLocationWatchTimerId(watchId));
            });

            BackgroundGeolocation.on('stop', () => {
              BackgroundGeolocation.checkStatus(status => {
                console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
                toast('[INFO] BackgroundGeolocation service has been stopped');
                // showMessage({
                //   message: "Location STOPPED",
                //   autoHide: true,
                //   duration: 2000,
                //   description:
                //     "",
                //   backgroundColor: "brown", // background color
                //   color: "white", // text color
                // });
                dispatch(actions.updateLocationWatchTimerId(-1));
                BackgroundGeolocation.removeAllListeners();
              });
            });

            BackgroundGeolocation.on('authorization', (status) => {
              console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
              if (status !== BackgroundGeolocation.AUTHORIZED) {
                // we need to set delay or otherwise alert may not be shown
                setTimeout(() =>
                  Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                    { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                    { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                  ]), 1000);
              }
            });

            BackgroundGeolocation.on('background', () => {
              toast('[INFO] App is in background');
            });

            BackgroundGeolocation.on('foreground', () => {
              toast('[INFO] App is in foreground');
            });

            BackgroundGeolocation.start(existingWatchId); //triggers start on start event         
          }
        });
        resolve();
      } catch (error) {
        toast("ERROR IN BACKGROUND LOCATION PUSH")
        console.debug(error);
        reject(error);
      }
    });
  },
  endLocationWatchWithApiLocationPush: async (dispatch, watchId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (watchId != -1) {
          console.debug("hit the get start location watch action");
          //navigator.geolocation.clearWatch(watchId);

          BackgroundGeolocation.stop();
          //timer stop now in  BackgroundGeolocation.on('stop', ()
          resolve();
        }
      } catch (error) {
        alert("BACKGROUND LOCATION ERRORED OUT:" + error.message,  + "  -  " + error.stack + "  -  " + error.type )
        console.debug(error);
        reject(error);
      }
    });
  },

  getCurrentLocation: async (dispatch) => {
    console.debug("hit the get current location action");
    // dispatch(actions.getCurrentLocationFetching());

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        //success
        dispatch(actions.getCurrentLocationSuccess(position));
      },
      (error) => {
        console.debug("Error getting location:" + JSON.stringify(error));
        dispatch(
          actions.getCurrentLocationFailure("Couldn't get current position")
        );
      },   
    );
  },
  getCurrentLocationSuccess: async (currentPosition) => {
    return { type: types.CURRENT_LOCATION_SUCCESS, currentPosition };
  },
  getCurrentLocationFailure: (errorMessage) => {
    return { type: types.CURRENT_LOCATION_FAILURE };
  },
  getCurrentLocationFetching: () => {
    return { type: types.CURRENT_LOCATION_FETCHING };
  },
  updateLocationWatchTimerId: (watchId) => {
    return { type: types.UPDATE_LOCATION_WATCH, locationWatchId: watchId };
  },
  //order destination
  setOrderDestination: async (
    dispatch,
    orderDestinationLatLng,
    latestPickerDestinationText,
    fullGeoDestinationAddress
  ) => {
    //do something here
    console.debug("At setOrderDestination");
    dispatch(
      actions.setOrderDestinationSuccess(
        orderDestinationLatLng,
        latestPickerDestinationText,
        fullGeoDestinationAddress
      ));

    setTimeout(() => {
      EventRegister.emit("refreshDeliveryOptions")
      EventRegister.emit("showNetworkPicker");
    }, 600);
  },
  setOrderDestinationSuccess: (
    orderDestinationLatLng,
    latestPickerDestinationText,
    fullGeoDestinationAddress
  ) => {
    console.debug("Well we got here...");
    return {
      type: types.ORDER_DESTINATION_LOCATION_SUCCESS,
      orderDestinationLatLng: orderDestinationLatLng,
      latestPickerDestinationText: latestPickerDestinationText,
      fullGeoDestinationAddress: fullGeoDestinationAddress
    };
  },
  setOrderDestinationFailure: (errorMessage) => {
    return { type: types.ORDER_DESTINATION_LOCATION_FAILURE };
  },
  setOrderDestinationFetching: () => {
    return { type: types.ORDER_DESTINATION_LOCATION_FETCHING };
  },
  setStoreLocation: (
    dispatch,
    storeLocationLatLng,
    latestPickerDestinationText
  ) => {
    console.debug("At setStoreLocation");
    dispatch(
      actions.setStoreLocationSuccess(
        storeLocationLatLng,
        latestPickerDestinationText
      )
    );
  },
  setStoreLocationSuccess: (storeLocationLatLng, latestStoreLocationText) => {
    console.debug("Well we got here...");
    return {
      type: types.UPDATE_STORE_LOCATION_SUCCESS,
      storeLocationLatLng: storeLocationLatLng,
      latestStorePickerLocationText: latestStoreLocationText,
    };
  },
  setStoreLocationFailure: (errorMessage) => {
    return { type: types.UPDATE_STORE_LOCATION_FAILURE };
  },
  setStoreLocationFetching: () => {
    return { type: types.UPDATE_STORE_LOCATION_PENDING };
  },
  resetOrderDestination: () => {
    return { type: types.RESET_ORDER_DESTINATION_LOCATION_TO_DEFAULT };
  },
  updateTextInputBackingField: (dispatch, newField) => {
    return { type: types.UPDATE_TEXTINPUT,
      latestPickerTextInputBackingField:newField
    };   
  },
  updateManualAddressPrefixField: (dispatch, newField) => {
    return { type: types.UPDATE_MANUAL_ADDRESS,
      manualAddressPrefixInput:newField
    };
  },
};

const initialState = {
  //this is a google location object
  currentPosition: {
    coords: {
      latitude: 51.5563969,
      longitude: -0.2094992,
    },
  },
  //this is set when the customer makes the order  
  mostRecentOrderDestinationLatLng: defaultLocation.mostRecentOrderDestinationLatLng,
  latestPickerDestinationText: defaultLocation.latestPickerDestinationText,
  fullGeoDestinationAddress: defaultLocation.fullGeoDestinationAddress,
  latestPickerTextInputBackingField: defaultLocation.latestPickerTextInputBackingField,
  manualAddressPrefixInput : defaultLocation.manualAddressPrefixInput,
  orderInProgress: {},
  isFetching: false,
  storeLocationLatLng: {
    lat: undefined,
    lng: undefined,
  },
  latestStorePickerLocationText: "None",
  locationWatchId: -1,

};

export const reducer = (state = initialState, action) => {
  const {
    type,
    currentPosition,
    orderDestinationLatLng,
    latestPickerDestinationText,
    fullGeoDestinationAddress,
    storeLocationLatLng,
    latestStorePickerLocationText,
    locationWatchId,
    latestPickerTextInputBackingField,
    manualAddressPrefixInput
  } = action;
  console.debug("Hit the location reducer");
  switch (type) {
    case types.CURRENT_LOCATION_SUCCESS:
      console.debug(
        "Current location updated in LocationReducer!!! This is where we want to be!!!"
      );
      return {
        ...state,
        currentPosition: currentPosition,
        isFetching: false,
      };
    case types.CURRENT_LOCATION_FAILURE:
      console.debug("Current location FAILED in LocationReducer");
      return {
        ...state,
        finish: true,
        isFetching: false,
      };
    case types.CURRENT_LOCATION_FETCHING:
      console.debug("Current location fetching in LocationReducer");
      return {
        ...state,
        isFetching: true,
      };
    //reducer for current order destination
    case types.ORDER_DESTINATION_LOCATION_SUCCESS:
      console.debug(
        "order destination location updated in LocationReducer!!! This is where we want to be!!!"
      );
      return {
        ...state,
        mostRecentOrderDestinationLatLng: orderDestinationLatLng,
        latestPickerDestinationText: latestPickerDestinationText,
        fullGeoDestinationAddress: fullGeoDestinationAddress,
        isFetching: false,
        finish: true,
      };
    case types.ORDER_DESTINATION_LOCATION_FAILURE:
      console.debug("order destination location FAILED in LocationReducer");
      return {
        ...state,
        finish: true,
        isFetching: false,
      };

    case types.ORDER_DESTINATION_LOCATION_FETCHING:
      console.debug("order destination fetching in LocationReducer");
      return {
        ...state,
        isFetching: true,
      };

    //STORE UPDATES
    case types.UPDATE_STORE_LOCATION_SUCCESS:
      console.debug(
        "order destination location updated in LocationReducer!!! This is where we want to be!!!"
      );
      return {
        ...state,
        storeLocationLatLng: storeLocationLatLng,
        latestStorePickerLocationText: latestStorePickerLocationText,
        isFetching: false,
        finish: true,
      };
    case types.UPDATE_STORE_LOCATION_FAILURE:
      console.debug("order destination location FAILED in LocationReducer");
      return {
        ...state,
        finish: true,
        isFetching: false,
      };
    case types.UPDATE_STORE_LOCATION_PENDING:
      console.debug("order destination fetching in LocationReducer");
      return {
        ...state,
        isFetching: true,
      };
    case types.UPDATE_LOCATION_WATCH:
      console.debug("updating location watch");
      return {
        ...state,
        locationWatchId: locationWatchId,
      };
      case types.RESET_ORDER_DESTINATION_LOCATION_TO_DEFAULT:
        console.debug("updating location watch");
        return {
          ...state,
          mostRecentOrderDestinationLatLng: defaultLocation.mostRecentOrderDestinationLatLng,
          latestPickerDestinationText: defaultLocation.latestPickerDestinationText,
          fullGeoDestinationAddress: defaultLocation.fullGeoDestinationAddress,
        };
      case types.UPDATE_TEXTINPUT:
      console.debug("updating location watch");
      return {
        ...state,
        latestPickerTextInputBackingField: latestPickerTextInputBackingField,
      };
      case types.UPDATE_MANUAL_ADDRESS:
      console.debug("updating location watch");
      return {
        ...state,
        manualAddressPrefixInput: manualAddressPrefixInput,
      };
    default:
      return state;
  }
};
