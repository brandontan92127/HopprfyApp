import GeoWorker from "../services/GeoWorker";
import { Config } from "@common";
import HopprWorker from "../services/HopprWorker";
import locationUpdateRequest from "../apiModels/location/locationUpdateRequest";
import { toast } from "@app/Omni";
import store from "@store/configureStore";

const types = {
  //when driver toggles on / off
  ACTIVE_DRIVER_SUCCESS: "ACTIVE_DRIVER_SUCCESS",
  ACTIVE_DRIVER_FAILURE: "ACTIVE_DRIVER_FAILURE",
  //when we check for an active order
  ON_ACTIVE_ORDER_SUCCESS: "ON_ACTIVE_ORDER_SUCCESS",
  ON_ACTIVE_ORDER_FAILURE: "ON_ACTIVE_ORDER_FAILURE",
  //once active order is over and we want to go back into 'normal' state
  DRIVER_RESET_SUCCESS: "DRIVER_RESET_SUCCESS",
  DRIVER_RESET_FAILURE: "DRIVER_RESET_FAILURE",

  //FOR ENABLE CYCLE TIME
  UPDATE_CYCLE_TIMER: "UPDATE_CYCLE_TIMER",
  //FOR THE 'STATUS'
  UPDATE_DRIVER_STATUS_STATE: "UPDATE_DRIVER_STATUS_STATE",
  //LATEST MODAL STATE FOR INBOUND ORDER MODAL
  UPDATE_LATEST_INBOUND_ORDER: "UPDATE_LATEST_INBOUND_ORDER",
};

export const actions = {
  checkDriverStatusInApiAndSetDriverActiveVariable: async (
    dispatch,
    driverId,
    orderState
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        //WHAT IS STATE IN API - If it's 1 or above set driverState on, else set off
        //pass orderState varible as whatever it is currently
        console.debug("okay great");
        let status = await HopprWorker.getDriverStatus(driverId);
        console.debug("got status");
        let driverStatusState = status.state;
        //based on result set the 'active' state

        let updateDriverBoolState = false;
        if (driverStatusState.toLowerCase() !== "offline") {
          //if it's not offlien set to true
          updateDriverBoolState = true;
        }
        //save it in props..?
        console.debug("made it here");
        //this updates BOTH driver states (active and status(, and the order active state
        dispatch(
          actions.updateAllDriverStates(
            driverStatusState,
            updateDriverBoolState,
            orderState
          )
        );

        resolve(driverStatusState);
      } catch (error) {
        console.debug(error);
        reject(error);
      }
    });
  },
  updateAllDriverStates: (
    driverStatusState,
    updateDriverBoolState,
    orderState
  ) => {
    return {
      type: types.UPDATE_DRIVER_STATUS_STATE,
      driverStatusState: driverStatusState,
      driverActive: updateDriverBoolState,
      orderIsActive: orderState,
    };
  },
  /**This turn driver active and enables tracking */
  turnDriverOn: async (dispatch, driverId) => {
    console.debug("turning driver on redux");
    await HopprWorker.turnDriverOn(driverId);

    return dispatch(actions.enableKeepAliveCycle(driverId));
  },
  /**disables driver in the API */
  turnDriverOff: async (dispatch, driverId, timerId) => {
    console.debug("turning driver off redux");

    await HopprWorker.turnDriverOff(driverId);
    return dispatch(actions.disableKeepAliveCycle(dispatch, timerId));
  },
  //this gets called after you accept an order
  checkForNewOrderAndEnableOrderModeIfExists: async (dispatch, driverId) => {
    //try get the order details if any exist?
    return new Promise(async (resolve, reject) => {
      HopprWorker.getActiveDriverOrderDestinations(driverId)
        .then(async (driverDestinationWOrdersResponse) => {
          toast(`Got ${driverDestinationWOrdersResponse.data.length} destinations from API`);
          if (
            driverDestinationWOrdersResponse.status == 200 &&
            driverDestinationWOrdersResponse.data.length > 0
          ) {
            //this is array of destination
            var driverDestinationWOrders = driverDestinationWOrdersResponse.data;           
            //CHECK AGAINST EXISTING 
            let existingStore = store.getState();
            let existingDest = existingStore.driver.activeDriverOrder;
            var newData = JSON.stringify(driverDestinationWOrders);
            var oldData = JSON.stringify(existingDest);

            //don't just update if unnecessary
            if(newData !== oldData)
            {               
                //alert("ran update"); 
                //convert objects into marker arrays
                let newStore = driverDestinationWOrders[0].store;
                //just get it from order, they're all going to the same store!!
                let storeFullAddress = driverDestinationWOrders[0].orders[0].pickupLocationAsString.toString();

                //make this the store
                let orderRegionFromStore = {
                  latitude: newStore.location.lat,
                  longitude: newStore.location.long,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                };                   

                //generate items for each order
                //this is now an array orderId / itemString            
                let orderIdAndItemStringArray = [];

                //does it exist in the existing data?  
                //merge the two sets, not overwrite
                

              //  const pArray = await driverDestinationWOrders.map(async (destin) => {
                  //IS THER ALREADY A DESTINATION IN THE ARRAY - IE does the ID exist
              

                  // //now map strings
                  // destin.orders.map((destORder) => {
                  //   let itemString = "None";
                  //   if (
                  //     destORder.items != null &&
                  //     typeof destORder.items !== "undefined"
                  //   ) {
                  //     if (destORder.items.length > 0) {
                  //       itemString = "";
                  //       destORder.items.map(
                  //         (x) =>
                  //           (itemString +=
                  //             " " + x.amount + " of " + x.product.productName + "\n")
                  //       );

                  //       orderIdAndItemStringArray.push({
                  //         orderId: destORder._id,
                  //         itemString: itemString,
                  //       });
                  //       console.debug("pushed!");
                  //     }
                  //   }
                  // });
              // });

          

                // //all the order items we need
                // //wait for
                // Promise.all(pArray).then((data) => {
                //   console.log("promise resolved");
                // });
                // // console.log(waitForAllPromises);

                console.log("now all resolved");

                var arrayOfStores = [];
                arrayOfStores.push(newStore);
                console.debug("At dispatch");
                dispatch(
                  actions.updateDriverStateOnOrderSuccess(
                    newStore.storeName,
                    orderIdAndItemStringArray, //this is now an array of order / itemString
                    storeFullAddress,                
                    orderRegionFromStore,
                    driverDestinationWOrders, //array of order destinations w/orders
                    arrayOfStores, //array of stores
                    [], //array of customers, don't think we use this?
                    true,
                    true
                  )
                );
              } //end IF JSON string compare of data old / new 
              else{
               
              }
            resolve();
          } else {
            //set order state to inactive
            dispatch(actions.resetDriverState());
            resolve();
            // toast(
            //   "We were unable to find an active order, don't worry, unless you were expecting one!"
            // );
          }
        })
        .catch((err) => {
          toast(
            "There was an error trying to REFRESH THE ORDERS:" + JSON.stringify(err)
          );
          console.debug(
            "There was an error trying to get an order:" + JSON.stringify(err)
          );
          reject();
        });
    })
  },

  /**this is only called from within this redux - to enable keep alive ping / post - gets Id from header token */
  enableKeepAliveCycle: (dispatch) => {
    let existingStore = store.getState();
    //checck it's not running we don't want two
    if (existingStore.driver.keepAliveCycleTimerId == -1) {
      let keepAliveCycleTimerId = setInterval(async () => {
        try {
          HopprWorker.sendDriverKeepAlivePing();
        } catch (error) {
          console.debug("sending keep alive failed");
        }
      }, 15000);

      //need to store the ID by dispatchcing it to redux
      return { type: types.UPDATE_CYCLE_TIMER, keepAliveCycleTimerId };
    }
  },

  /**Turns the keep alive timer off */
  disableKeepAliveCycle: (dispatch, timerId) => {
    clearInterval(timerId);
    //turn timer id to nothing
    return { type: types.UPDATE_CYCLE_TIMER, keepAliveCycleTimerId: -1 };
  },

  //update latest order
  updateLatestInboundOrder: async (
    dispatch,
    orderRequestGuid,
    networkColor,
    driverFees,
    message,
    latestModalPayload
  ) => {
    return new Promise((resolve, reject) => {
      try {
        let newNetworkColor = "hotpink";
        if (networkColor != null && typeof networkColor !== "undefined") {
          newNetworkColor = networkColor;
        }

        return dispatch(
          actions.updateLatestInboundOrderSuccess(
            orderRequestGuid,
            newNetworkColor,
            driverFees,
            message,
            latestModalPayload
          )
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  updateLatestInboundOrderSuccess: (
    orderRequestGuid,
    newNetworkColor,
    driverFees,
    message,
    latestModalPayload
  ) => {
    return {
      type: types.UPDATE_LATEST_INBOUND_ORDER,
      latestOrderRequestId: orderRequestGuid,
      latestModalColor: newNetworkColor,
      latestModalDriverFees:driverFees,
      latestModalHTML: message,
      latestModalPayload:latestModalPayload
    };
  },
  //reset methods
  resetDriverState: (dispatch) => {
    return dispatch(actions.resetDriverStateSuccess());
  },
  resetDriverStateSuccess: () => {
    return { type: types.DRIVER_RESET_SUCCESS, finish: true };
  },
  resetDriverStateFailure: (error) => {
    return { type: types.DRIVER_RESET_FAILURE, error, finish: true };
  },
  //toggle state methods
  updateDriverState: (dispatch, driverState) => {
    console.debug("updating driver state");
    return dispatch(actions.updateDriverStateSuccess(driverState));
  },
  updateDriverStateSuccess: (driverState) => {
    return { type: types.ACTIVE_DRIVER_SUCCESS, driverState, finish: true };
  },
  updateDriverStateFailure: (error) => {
    return { type: types.ACTIVE_DRIVER_FAILURE, error, finish: true };
  },

  //when the new order comes in
  updateDriverStateOnOrderSuccess: (
    storeName,
    itemString,
    storeAddressResult,
    orderRegion,
    driverOrderArray, //array of orderes
    fullStore, //array of stores
    fullCustomer, //array of customers) =>
    driverActive,
    orderIsActive
  ) => {
    return {
      type: types.ON_ACTIVE_ORDER_SUCCESS,
      storeName: storeName,
      itemString: itemString,
      storeAddressResult: storeAddressResult,
      orderRegion: orderRegion,
      driverOrderArray: driverOrderArray,
      fullStore: fullStore,
      fullCustomer: fullCustomer,
      finish: true,
      driverActive: driverActive,
      orderIsActive: orderIsActive,
    };
  },
  updateDriverStateOnOrderFailure: () => {
    return { type: types.ON_ACTIVE_ORDER_FAILURE, error, finish: true };
  },
};

getInitialState = () => {
  return {
    finish: false,
    error: null,
    driverStatusState: "OFFLINE", //THIS IS ACTUALLY DRIVER STATUS, even though it's called state
    driverActive: false,
    orderIsActive: false,
    timeToDelivery: {
      distanceAway: "None",
      timeAway: "None",
      unit: "None",
    },
    itemsAsText: [], //changed to array for muliple destinations
    storeAddressText: "Nowhere",
    destinationAddressText: [], //changed to array for muliple destinations
    storeName: "None",
    activeDriverOrder: new Array(), //changed to array of destinations
    activeOrderStores: new Array(),
    //on order variables
    activeOrderCustomer: new Array(),
    keepAliveCycleTimerId: -1,

    //FIELDS TO POPULATE ORDER REQUEST MODALS
    latestOrderRequestId: null,
    latestModalDriverFees: 0.00,
    latestModalHTML: "<h1>None</h1>",
    latestModalColor: "hotpink",
    latestModalPayload:null
  };
};

export const reducer = (state = getInitialState(), action) => {
  const {
    type,
    driverState,
    finish,
    error,
    driverActive,
    orderIsActive,
    storeName,
    itemsAsText,
    storeAddressText,
    destinationAddressText,
    activeDriverOrder,
    activeOrderStores,
    activeOrderCustomer,
    keepAliveCycleTimerId,
    driverStatusState,
    latestOrderRequestId,
    latestModalHTML,
    latestModalColor,
    latestModalDriverFees,
    latestModalPayload
  } = action;
  switch (type) {
    case types.ACTIVE_DRIVER_FAILURE: {
      console.debug("UPdating active driver state FAILEd");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.ACTIVE_DRIVER_SUCCESS: {
      try {
        console.debug("UPdating active driver state");
        return {
          ...state,
          driverActive: driverState.driverActive,
          orderIsActive: driverState.orderIsActive,
          finish: true,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    case types.DRIVER_RESET_FAILURE: {
      console.debug("resetting driver state failed");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.DRIVER_RESET_SUCCESS: {
      try {
        console.debug("resetting driver state succeded");
        let newState = getInitialState();
        newState.driverActive = true; //cos driver always on immediatley after order finsihes
        newState.finish = true;
        return newState;
      } catch (error) {
        console.debug("Error");
      }
    }
    case types.ON_ACTIVE_ORDER_FAILURE: {
      console.debug("UPdating active driver state FAILEd");
      return {
        ...state,
        error: "failed",
        finish: true,
      };
    }
    case types.ON_ACTIVE_ORDER_SUCCESS: {
      try {
        console.debug("UPdating active driver state");
        return {
          ...state,
          storeName: action.storeName,
          itemsAsText: action.itemString,
          storeAddressText: action.storeAddressResult,
          destinationAddressText: action.destinationAddressResult,
          orderRegion: action.orderRegion,
          activeDriverOrder: action.driverOrderArray,
          activeOrderStores: action.fullStore,
          activeOrderCustomer: action.fullCustomer,
          finish: true,
          driverActive: action.driverActive,
          orderIsActive: action.orderIsActive,
        };
      } catch (error) {
        console.debug("Error");
      }
    }
    case types.UPDATE_CYCLE_TIMER: {
      return {
        ...state,
        keepAliveCycleTimerId: action.keepAliveCycleTimerId,
      };
    }
    case types.UPDATE_DRIVER_STATUS_STATE: {
      console.debug("ok boys");
      return {
        ...state,
        driverActive: action.driverActive,
        driverStatusState: action.driverStatusState,
        orderIsActive: orderIsActive,
      };
    }
    case types.UPDATE_LATEST_INBOUND_ORDER: {
      console.debug("ok boys");
      return {
        ...state,
        latestOrderRequestId: action.latestOrderRequestId,
        latestModalHTML: action.latestModalHTML,
        latestModalDriverFees : action.latestModalDriverFees,
        latestModalColor: action.latestModalColor,
        latestModalPayload: action.latestModalPayload
      };
    }
    default: {
      return state;
    }
  }
};
