/** @format */

import { Constants, warn, Languages } from "@common";
import HopprWorker from "../services/HopprWorker";
import Validate from "../ultils/Validate.js";
import { toast } from "@app/Omni";
import  {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import { EventRegister } from "react-native-event-listeners";
import store from "@store/configureStore";

const types = {
  ADD_CART_ITEM: "ADD_CART_ITEM",
  REMOVE_CART_ITEM: "REMOVE_CART_ITEM",
  DELETE_CART_ITEM: "DELETE_CART_ITEM",
  EMPTY_CART: "EMPTY_CART",
  CREATE_NEW_ORDER_PENDING: "CREATE_NEW_ORDER_PENDING",
  CREATE_NEW_ORDER_SUCCESS: "CREATE_NEW_ORDER_SUCCESS",
  CREATE_NEW_ORDER_ERROR: "CREATE_NEW_ORDER_ERROR",
  VALIDATE_CUSTOMER_INFO: "VALIDATE_CUSTOMER_INFO",
  INVALIDATE_CUSTOMER_INFO: "INVALIDATE_CUSTOMER_INFO",
  FETCH_MY_ORDER: "FETCH_MY_ORDER",
  FETCH_CART_PENDING: "FETCH_CART_PENDING",
  GET_SHIPPING_METHOD_PENDING: "GET_SHIPPING_METHOD_PENDING",
  GET_SHIPPING_METHOD_SUCCESS: "GET_SHIPPING_METHOD_SUCCESS",
  GET_SHIPPING_METHOD_FAIL: "GET_SHIPPING_METHOD_FAIL",
  SELECTED_SHIPPING_METHOD: "SELECTED_SHIPPING_METHOD",
  RESET_FILTER_CART: "RESET_FILTER_CART",
  FILTER_CART_TO_NETWORK: "FILTER_CART_TO_NETWORK",
  FILTER_CART_TO_NETWORK_SUCCESS: "FILTER_CART_TO_NETWORK_SUCCESS",
  REMOVE_NETWORK_SUBCART:"REMOVE_NETWORK_SUBCART"
};

export const actions = {
  removeNetworkSubcart:(dispatch, entireCart, netowrkIdToRemove)=>{
    //get the items on that network and remove them!
    let itemsWeDeleteing = entireCart.filter(x=>x.product.networkId == netowrkIdToRemove);
    let allItemsExceptThatNetwork = entireCart.filter(x=>x.product.networkId != netowrkIdToRemove);
    //now update cart
    let totalItemsToDelete = 0;
    let totalPriceOfITems = 0.00;
    itemsWeDeleteing.map(itemDeleted=>{
        totalItemsToDelete = totalItemsToDelete + itemDeleted.quantity;
        totalPriceOfITems = itemDeleted.quantity * itemDeleted.product.price;
    });

    
    dispatch({
      type: types.REMOVE_NETWORK_SUBCART,
      completeCartAfterSubcartRemoval: allItemsExceptThatNetwork,
      subcartRemovalQuantityDecrement: totalItemsToDelete,
      subcartRemovalPriceDecrement: totalPriceOfITems,
    });
    // return Object.assign({}, state, {
    //   type: types.REMOVE_NETWORK_SUBCART,
    //   completeCartAfterSubcartRemoval: allItemsExceptThatNetwork
    // });
  },
  resetFilterCart: (dispatch, entireCart) => {
    return this.filterCart(dispatch, -1, "All networks", entireCart);
  },
  filterCart: (dispatch, filtNetId, filteredNetName, filteredNetwork) => {
    const existingStore = store.getState();
    const entireCart = existingStore.carts.cartItems;

    console.debug("hit filter cart");
    let filteredString = "Filtered to: ";
    let prodsForThisNet = [];

    if (filtNetId == -1) {
      //just keep whoel cart, we didn't select a fileter
      filteredString = "All networks";
      prodsForThisNet = entireCart;
    } else {
      entireCart.map((x) => {
        if (x.product.networkId == filtNetId) {
          filteredString += x.product.name + " ";
          prodsForThisNet.push(x);
        }
      });
    }

    //calc total for items
    let newTotal = 0;
    prodsForThisNet.map((x) => (newTotal += x.product.price * x.quantity));

    toast(filteredString + " | Price: " + newTotal);
    //dispatch success
    dispatch({
      type: types.FILTER_CART_TO_NETWORK_SUCCESS,
      newFilteredCartItems: prodsForThisNet,
      newFilteredTotal: newTotal,
      newFilteredNetworkId: filtNetId,
      newfilteredNetworkName: filteredNetName,
      newFilteredNetwork: filteredNetwork,
    });

    //get new delivery options if selected a network!! Else will throw error
    if (filtNetId != -1) {
      setTimeout(() => {
        EventRegister.emit("refreshDeliveryOptions");
      }, 600);
    }

    return;
  },
  addCartItem: async (dispatch, product, variation) => {
    return new Promise((resolve, reject) => {

      let isThereLatLng = HopprWorker.getDestinationPickedLatLngIfExistFromStoreOrNULL();
      if(!isThereLatLng)
        {
        //show a message if there's no locaiton set
        showMessage({        
          position: "center",
          message: "You don't have a location set...",
          autoHide: true,
          duration: 3900,
          description:
            "So we can't be sure this product is available in your area. Please select a delivery destination",
          backgroundColor: "red", // background color
          color: "white", // text color
        });          
       }                         


      dispatch({
        type: types.ADD_CART_ITEM,
        product,
        variation,
      });

      resolve();
    });
  },
  fetchMyOrder: (dispatch, user) => {
    dispatch({ type: types.FETCH_CART_PENDING });

    HopprWorker.ordersByCustomerId(user.customerid, 200, 1)
      .then((data) => {
        dispatch({
          type: types.FETCH_MY_ORDER,
          data,
        });
      })
      .catch((err) => { });
  },
  removeCartItem: async (dispatch, product, variation) => {
    return new Promise((resolve, reject) => {
      try {
        dispatch({
          type: types.REMOVE_CART_ITEM,
          product,
          variation,
        });
  
        resolve();  
      } catch (error) {
       alert("Couldnt delete that sorry"); 
       reject();
      }      
    });
  },
  deleteCartItem: async (dispatch, product, variation, quantity) => {
    dispatch({
      type: types.DELETE_CART_ITEM,
      product,
      variation,
      quantity,
    });
  },
  emptyCart: (dispatch) => {
    dispatch({
      type: types.EMPTY_CART,
    });
  },
  validateCustomerInfo: (dispatch, customerInfo) => {
    const { first_name, last_name, address_1, email, phone } = customerInfo;
    if (
      first_name.length == 0 ||
      last_name.length == 0 ||
      address_1.length == 0 ||
      email.length == 0 ||
      phone.length == 0
    ) {
      dispatch({
        type: types.INVALIDATE_CUSTOMER_INFO,
        message: Languages.RequireEnterAllFileds,
      });
    } else if (!Validate.isEmail(email)) {
      dispatch({
        type: types.INVALIDATE_CUSTOMER_INFO,
        message: Languages.InvalidEmail,
      });
    } else {
      dispatch({
        type: types.VALIDATE_CUSTOMER_INFO,
        message: "",
        customerInfo,
      });
    }
  },

  // createNewOrder: async (dispatch, payload) => {
  //   dispatch({ type: types.CREATE_NEW_ORDER_PENDING });

  //   //todo: sort this out
  //   const json = await WooWorker.createOrder(payload);

  //   // console.debug('json', json);
  //   if (json.hasOwnProperty("id")) {
  //     // dispatch({type: types.EMPTY_CART});
  //     dispatch({ type: types.CREATE_NEW_ORDER_SUCCESS, orderId: json.id });
  //   } else {
  //     dispatch({
  //       type: types.CREATE_NEW_ORDER_ERROR,
  //       message: Languages.CreateOrderError
  //     });
  //   }
  // },
  // getShippingMethod: async dispatch => {
  //   dispatch({ type: types.GET_SHIPPING_METHOD_PENDING });
  //   const json = await WooWorker.getShippingMethod();

  //   if (json === undefined) {
  //     dispatch({
  //       type: types.GET_SHIPPING_METHOD_FAIL,
  //       message: Languages.ErrorMessageRequest
  //     });
  //   } else if (json.code) {
  //     dispatch({ type: types.GET_SHIPPING_METHOD_FAIL, message: json.message });
  //   } else {
  //     dispatch({ type: types.GET_SHIPPING_METHOD_SUCCESS, shippings: json });
  //   }
  // },
  selectShippingMethod: (dispatch, shippingMethod) => {
    dispatch({ type: types.SELECTED_SHIPPING_METHOD, shippingMethod });
  },

  finishOrder: async (dispatch, payload) => {
    dispatch({ type: types.CREATE_NEW_ORDER_SUCCESS });
  }, 
  //filterCartItemsToNetwork: async (itemsToFilter, networks)
};

const initialState = {
  cartItems: [],
  total: 0,
  totalPrice: 0,
  filteredCartItems: [],
  filteredItemsTotal: 0,
  filteredItemsTotalPrice: 0,
  filteredNetworkId: -1, //this is whatever network was last filtered to
  filteredNetworkName: "None",
  filteredCartNetwork: undefined,
  myOrders: [],
  isFetching: false,  
};

export const reducer = (state = initialState, action) => {
  console.debug("in cart redux");
  const {
    type,
    completeCartAfterSubcartRemoval,
    subcartRemovalQuantityDecrement,
    subcartRemovalPriceDecrement,
    newFilteredCartItems,
    newFilteredTotal,
    newFilteredNetworkId,
    newfilteredNetworkName,
    newFilteredNetwork,    
  } = action;
  switch (type) {
    case types.FILTER_CART_TO_NETWORK_SUCCESS: {
      return Object.assign({}, state, {
        type: types.FILTER_CART_TO_NETWORK_SUCCESS,
        filteredCartItems: newFilteredCartItems,
        filteredItemsTotal: newFilteredTotal,
        filteredItemsTotalPrice: newFilteredTotal,
        filteredNetworkId: newFilteredNetworkId,
        filteredNetworkName: newfilteredNetworkName,
        filteredCartNetwork: newFilteredNetwork,
      });
    }
    case types.ADD_CART_ITEM: {
      const isExisted = state.cartItems.some((cartItem) =>
        compareCartItem(cartItem, action)
      );
      return Object.assign(
        {},
        state,
        isExisted
          ? { cartItems: state.cartItems.map((item) => cartItem(item, action)) }
          : { cartItems: [...state.cartItems, cartItem(undefined, action)] },
        {
          total: state.total + 1,
          lastAddedItemId: action.product._id,
          totalPrice:
            state.totalPrice +
            Number(
              action.variation === undefined ||
                action.variation == null ||
                action.variation.price === undefined
                ? action.product.price
                : action.variation.price
            ),
        }
      );
    }
    case types.REMOVE_CART_ITEM: {
      const index = state.cartItems.findIndex((cartItem) =>
        compareCartItem(cartItem, action)
      ); // check if existed
      return index == -1
        ? state // This should not happen, but catch anyway
        : Object.assign(
          {},
          state,
          state.cartItems[index].quantity == 1
            ? {
              cartItems: state.cartItems.filter(
                (cartItem) => !compareCartItem(cartItem, action)
              ),
            }
            : {
              cartItems: state.cartItems.map((item) =>
                cartItem(item, action)
              ),
            },
          {
            total: state.total - 1,
            totalPrice:
              state.totalPrice -
              Number(
                action.variation === undefined ||
                  action.variation == null ||
                  action.variation.price === undefined
                  ? action.product.price
                  : action.variation.price
              ),
          }
        );
    }
    case types.DELETE_CART_ITEM: {
      const index1 = state.cartItems.findIndex((cartItem) =>
        compareCartItem(cartItem, action)
      ); // check if existed
      return index1 == -1
        ? state // This should not happen, but catch anyway
        : Object.assign({}, state, {
          cartItems: state.cartItems.filter(
            (cartItem) => !compareCartItem(cartItem, action)
          ),
          total: state.total - Number(action.quantity),
          totalPrice:
            state.totalPrice -
            Number(action.quantity) *
            Number(
              action.variation === undefined ||
                action.variation == null ||
                action.variation.price === undefined
                ? action.product.price
                : action.variation.price
            ),
        });
    }
    case types.REMOVE_NETWORK_SUBCART:           
    return Object.assign({}, state, {
      cartItems: completeCartAfterSubcartRemoval,      
      total: state.total - Number(subcartRemovalQuantityDecrement),
      totalPrice:
        state.totalPrice -
        Number(subcartRemovalPriceDecrement)
    });    
    case types.EMPTY_CART:
      return Object.assign({}, state, {
        type: types.EMPTY_CART,
        cartItems: [],
        total: 0,
        totalPrice: 0,
      });
    case types.INVALIDATE_CUSTOMER_INFO:
      return Object.assign({}, state, {
        message: action.message,
        type: types.INVALIDATE_CUSTOMER_INFO,
      });
    case types.VALIDATE_CUSTOMER_INFO:
      return Object.assign({}, state, {
        message: null,
        type: types.VALIDATE_CUSTOMER_INFO,
        customerInfo: action.customerInfo,
      });
    case types.CREATE_NEW_ORDER_SUCCESS:
      return Object.assign({}, state, {
        type: types.CREATE_NEW_ORDER_SUCCESS,
        cartItems: [],
        total: 0,
        totalPrice: 0,
      });
    case types.CREATE_NEW_ORDER_ERROR:
      return Object.assign({}, state, {
        type: types.CREATE_NEW_ORDER_ERROR,
        message: action.message,
      });
    case types.FETCH_MY_ORDER:
      return Object.assign({}, state, {
        type: types.FETCH_MY_ORDER,
        isFetching: false,
        myOrders: action.data,
      });
    case types.FETCH_CART_PENDING: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case types.GET_SHIPPING_METHOD_PENDING: {
      return Object.assign({}, state, {
        ...state,
        isFetching: true,
        error: null,
      });
    }
    case types.GET_SHIPPING_METHOD_FAIL: {
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
      });
    }
    case types.GET_SHIPPING_METHOD_SUCCESS: {
      return Object.assign({}, state, {
        isFetching: false,
        shippings: action.shippings,
        error: null,
      });
    }
    case types.SELECTED_SHIPPING_METHOD: {
      return Object.assign({}, state, {
        ...state,
        shippingMethod: action.shippingMethod,
      });
    }   
    default: {
      return state;
    }
  }
};

const compareCartItem = (cartItem, action) => {
  // if (
  //   cartItem.variation !== undefined &&
  //   action.variation !== undefined &&
  //   cartItem.variation != null &&
  //   action.variation != null
  // )
  //   return (
  //     cartItem.product.id === action.product.id &&
  //     cartItem.variation.id === action.variation.id
  //   );

  return cartItem.product._id === action.product._id;
};

const cartItem = (
  state = { product: undefined, quantity: 1, variation: undefined },
  action
) => {
  switch (action.type) {
    case types.ADD_CART_ITEM:
      return state.product === undefined
        ? Object.assign({}, state, {
          product: action.product,
          variation: action.variation,
        })
        : !compareCartItem(state, action)
          ? state
          : Object.assign({}, state, {
            quantity:
              state.quantity < Constants.LimitAddToCart
                ? state.quantity + 1
                : state.quantity,
          });
    case types.REMOVE_CART_ITEM:
      return !compareCartItem(state, action)
        ? state
        : Object.assign({}, state, { quantity: state.quantity - 1 });
    default:
      return state;
  }
};
