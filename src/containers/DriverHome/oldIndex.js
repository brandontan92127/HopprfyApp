import React, { Component } from "react";
import {
  Image,
  PermissionsAndroid,
  Platform,
  View,
  RefreshControl,
  Dimensions,
  I18nManager,
  StyleSheet,
  ListView,
  FlatList,
  ScrollView,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Vibration,
} from "react-native";
import { connect } from "react-redux";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
import { Timer, toast, BlockTimer } from "@app/Omni";
import LogoSpinner from "@components/LogoSpinner";
import Empty from "@components/Empty";
import MapView, {
  ProviderPropType,
  AnimatedRegion,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Marker, MarkerAnimated, UrlTile } from "react-native-maps";
import GeoWorker from "../../services/GeoWorker";
import MapWorker from "../../services/MapWorker";
import HopprWorker from "../../services/HopprWorker";
import { Images } from "@common";
import Permissions from "react-native-permissions";
import {
  Button,
  AdMob,
  ModalBox,
  WebView,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating,
  DriverCompleteOrderModal,
} from "@components";
import MapViewDirections from "react-native-maps-directions";
import { Config } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  List,
  ListItem,
  Divider,
} from "react-native-elements";
import Modal from "react-native-modalbox";
import BlinkView from "react-native-blink-view";
import SwitchToggle from "react-native-switch-toggle";
import SoundPlayer from "react-native-sound-player";
import { TimeBetweenPointsRequestPayload } from "../../apiModels/Order/TimeToDeliveryRequest";
import { showMessage, hideMessage } from "react-native-flash-message";
import moment from "moment";
import FastImage from 'react-native-fast-image'
import { EventRegister } from "react-native-event-listeners";
import NetworkImageList from "../../components/NetworkImageList/index"
import { setIntervalAsync } from 'set-interval-async/dynamic'
import { clearIntervalAsync } from 'set-interval-async'
import LayoutHelper from "../../services/LayoutHelper";
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { set } from "lodash";

const mapHeight = 300;
const mapMinHeight = 200;
const GOOGLE_MAPS_APIKEY = Config.GoogleMapsDirectionAPIKey;
const { width, height } = Dimensions.get("window");

const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  label: {
    fontWeight: "bold",
    fontSize: Styles.FontSize.medium,
    color: Color.blackTextPrimary,
    marginTop: 20,
  },
  naviBar: {
    height: 64,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  naviTitle: {
    flex: 1,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  btnBack: {
    zIndex: 2,
    position: "absolute",
    top: 20,
    left: 10,
  },
  btnBackImage: {
    height: 30,
    width: 30,
  },
  listContainer: {
    flex: 1,
  },
  productInfo: {
    alignItems: "center",
    backgroundColor: "#f6f6f8",
  },
  imageSlider: {
    flex: 1,
    marginTop: 0,
  },
  imageProduct: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: "contain",
    width: Constants.Window.width,
    height: height * 0.5,
  },
  imageProductFull: {
    flex: 1,
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 3,
    resizeMode: "cover",
    height,
  },
  productSizeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 15,
  },
  productSize: {
    marginLeft: 5,
    marginRight: 5,
  },
  productName: {
    textAlign: "center",
    fontSize: 20,
    color: Color.Text,
    padding: 8,
    marginTop: 4,
    fontFamily: Constants.fontHeader,
  },
  productPrice: {
    fontSize: 18,
    color: Color.blackTextSecondary,
    fontFamily: Constants.fontFamily,
  },
  sale_price: {
    textDecorationLine: "line-through",
    color: Color.blackTextDisable,
    marginLeft: 5,
    marginTop: 4,
    fontFamily: Constants.fontFamily,
  },
  tabButton: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "rgba(255,255,255,1)",
  },
  textTab: {
    fontFamily: Constants.fontHeader,
    color: "rgba(183, 196, 203, 1)",
    fontSize: 16,
  },
  tabButtonHead: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    opacity: 0,
  },
  tabItem: {
    flex: 0.25,
    backgroundColor: "rgba(255,255,255,1)",
  },
  bottomView: {
    height: 50,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f7f9",
  },
  buttonContainer: {
    flex: 0.5,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
  },
  imageButton: {
    width: 20,
    height: 20,
    tintColor: "#ccc",
    flex: 1,
  },
  buttonStyle: {
    flex: 1 / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  btnBuy: {
    flex: 0.5,
    backgroundColor: Color.product.BuyNowButton,
  },
  outOfStock: {
    backgroundColor: Color.product.OutOfStockButton,
  },
  btnBuyText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: Constants.fontHeader,
  },
  description: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  productColorContainer: {
    position: "absolute",
    top: 50,
    left: I18nManager.isRTL ? width - 50 : 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
    width: 50,
  },

  modalBoxWrap: {
    position: "absolute",
    borderRadius: 2,
    width,
    height,
    zIndex: 9999,
  },
  iconZoom: {
    position: "absolute",
    right: 0,
    top: 10,
    backgroundColor: "rgba(255,255,255,.9)",
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    zIndex: 9999,
  },
  textClose: {
    color: "#666",
    fontWeight: "600",
    fontSize: 10,
    margin: 4,
    zIndex: 9999,
  },
  image: {
    width,
    height: height - 40,
    zIndex: 9999,
  },
  dotActive: {
    backgroundColor: "rgba(183, 196, 203, 1)",
    width: 10,
    height: 10,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "rgba(183, 196, 203, 1)",
  },
  tabView: {
    minHeight: height / 5,
    marginTop: 3,
  },
  price_wrapper: {
    flexDirection: "row",
    marginBottom: 8,
  },

  textRating: {
    fontSize: 12,
    marginLeft: 4,
    paddingTop: 4,
  },

  attributeName: {
    color: "#aaa",
    fontFamily: Constants.fontFamily,
    fontSize: 11,
  },

  smallButtonContainer: {
    paddingTop: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  smallButton: {
    height: 40,
    width: 160,
    borderRadius: 20,
    backgroundColor: "blue",
  },
  smallButtonText: {
    fontSize: 15,
    fontFamily: Constants.fontHeader,
  },

  // DRIVER CONTROLS
  driverControlsButton: {
    margin: 5,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 440,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
    margin: 5,
  },
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

const getDefaultState = () => {
  return {
    //GUI ELEMENTS
    warningModalOpen:false,
    driverActiveImage: Images.TrafficLightRed,
    colorOfHeaderBar: "black",
    headerTextColor: "silver",
    tabLineColor: "black",
    flashingOrderMessage: "None",

    //END
    tracksViewChanges: true,
    initalDriverLocation: {
      lat: 0,
      lng: 0,
      isSet: false
    },
    orderIsActive: false,
    timeToDelivery: {
      distanceAway: "0",
      timeAway: "0",
      unit: "K",
    },
    tabIndex: 0,
    orderItemsAsTextArray: [],
    storeAddressText: "Nowhere",
    destinationAndAddressTextArray: [],
    driverName: "None",
    storeName: "None",
    userInfo: null,
    activeDriverOrder: [],
    activeOrderStores: [],
    drivers: [],
    networkImages: [],
    currentRegion: {
      latitude: 51.5407134,
      longitude: -0.1676347,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    //IOS MAP
    coordinate: new AnimatedRegion({
      latitude: 51.5407134,
      longitude: -0.1676347,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    //ALL TIMERS
    storesTimerId: -1,
    driversTimerId: -1,
    timeToDeliveryTimerId: -1, //time to delivery
    resetTimerId: -1, //modal reset
    enableStatusUpdateTimerId: -1, //status update    
  };
};

class DriverHome extends Component {
  constructor(props) {
    super(props);

    console.debug("in driver home");
    this.state = getDefaultState();
    this.mapView = null;
    this.hasLoaded = false;

    let aRandom = Math.random();
    this.imageForDash = this.generateDashImage(aRandom);
    this.imageForDashBackground = this.generateDashBackground(aRandom);
    this.imageForMenuIcon = this.generateImageForMenuIcon(aRandom);


    this.storeWasClicked = false;
    this.destWasClicked = false;
    //METHODS FOR THIS CLASS

    //location method to track order delivery - uses non-expensive server methods
    this.getTimeToDelivery = (
      currentLat,
      currentLng,
      destLat,
      destLng
    ) => {
      if (this.props.orderIsActive) {    
        try {         
          const timeToDeliveryResult = GeoWorker.calculateTimeAndDistanceToDelivery(
            currentLat,
            currentLng,
            destLat,
            destLng
          );

          // toast("Got time to delivery");
          this.setState({ timeToDelivery: timeToDeliveryResult });
        } catch (error) {
          console.debug("Couldn't get time to delivery!");
          toast("Couldn't get time to delivery!");
        }
      }
    };

    this.openInWaze = (lat, lng) => {
      try {
        //close modal
        this.refs.driverInOrderControlsModal.close();
        let linkURl = `https://waze.com/ul?ll=${lat},${lng}&z=10&navigate=yes`;
        Linking.openURL(linkURl);

      } catch (error) {
        toast("Couldnt' open in Waze: maybe it's not installed?");
      }
    };

    this.stopTrackingViewChanges = () => {
      this.setState(() => ({
        tracksViewChanges: false,
      }));
    }

    /**Once order completed or cancelled */
    this.resetDriverStateToDefault = () => {
      try {
        //stop the order tracking timer
        //WE DON'T WANT THIS TO EVER TURN OFF - KEEP TRACKING
        // if (this.state.timeToDeliveryTimerId != null) {
        //   clearInterval(this.state.timeToDeliveryTimerId);
        // }
        //set state via redux - it'll get picked up soon enough

        this.props.resetDriverState();
      } catch (error) {
        toast("Couldn't reset driver state");
      }
    };
    /**order active - set*/
    this.setOrderActive = () => {
      //should push to reducer which should update state automatically
      this.props.updateDriverState(this.props.driverActive, true);
    };
    this.setOrderInactive = () => {
      this.props.updateDriverState(this.props.driverActive, false);
    };

    this.normaliseDriverState = async () => {
      try {
        await HopprWorker.workoutAndSetDriverOnlineIfNoOrderActive(
          this.state.drivers[0]._id
        );

        //make sure the modal is closed!!!
        this.makeSureOrderRequestModalIsClosed();
        this.refs.driverControlsModal.close();
        toast("State normalised. You're either online or on an order!");
      } catch (error) {
        toast("couldn't normalise driver state");
      }
    };

    this.makeSureOrderRequestModalIsClosed = () => {
      this.props.updateModalState("orderRequestModal", false);
    };

    this.toggleDriverState = async () => {
      if (this.props.driverActive == true) {
        this.turnDriverOff();
      } else {
        this.turnDriverOn();
      }
    };

    this.turnDriverOff = async () => {
      try {
        this.props.turnDriverOff(
          this.state.drivers[0]._id,
          this.props.keepAliveCycleTimerId
        );
        this.props.updateDriverState(false, this.props.orderIsActive);
        this.props.endLocationWatchWithApiLocationPush(
          this.props.locationWatchId
        );

        toast("Driver Off");
      } catch (error) {
        console.debug("Couldn't turn driver off");
      }
    };

    this.turnDriverOn = async () => {
      try {
        //call this in the redux
        //this.enableKeepAliveCycle();
        this.props.updateDriverState(true, this.props.orderIsActive);
        //call this in the redux
        //await HopprWorker.turnDriverOn(this.state.drivers[0]._id);
        this.props.turnDriverOn(this.state.drivers[0]._id);
        this.props.startLocationWatchAndApiLocationPush(
          this.state.drivers[0]._id,
          "locations/drivers",
          this.props.locationWatchId
        );
        toast("Driver On");
      } catch (error) {
        console.debug("Couldn't turn store on");
      }
    };

    //get status - enable / disable
    this.enableStatusUpdate = async () => {
      console.debug("Driver status updates enabled");
      let enableStatusUpdateTimerId = setIntervalAsync(async () => {
        //call API and update state

        let driverId = this.props.user.user.driverId;
        try {
          console.debug("get driver state and set in redux");
          await this.props.checkDriverStatusInApiAndSetDriverActiveVariable(
            this.props.user.user.driverId,
            this.props.orderIsActive
          );

          // let currentState = await HopprWorker.getDriverStatus(
          //   this.props.user.user.driverId
          // );
          //   this.setState({ driverState: currentState.state });
        } catch (error) {
          toast("Couldn't get driver state" + error);
          console.debug("Couldn't get driver state" + error);
        }
      }, 6000);

      this.setState({ enableStatusUpdateTimerId: enableStatusUpdateTimerId })
    };



    this.enableKeepAliveCycle = () => {
      setIntervalAsync(() => {
        try {
          HopprWorker.sendDriverKeepAlivePing();
        } catch (error) {
          console.debug("sending keep alive failed");
        }
      }, 15000);
    };

    /**Check is state is AWAITINGORDERRESPONSE start a countdown, - if at end of timer still same state, and if no modal is open, check local onlione driver state (which should be set) reset driver state to online / offline */
    this.startResetIfStuckInAwaitingOrderResponseStateTimer = async () => {
      //let need to put this in state so it can be cancelled?
      let resetInterval = await setIntervalAsync(async () => {
        try {
          //check state - if no modal open and status is 'awaiting order response' clear state in api
          if (this.props.driverStatusState !== "undefined") {
            let orderRequestModalCurrentValue = this.props.modalsArray.find(
              (x) => x.modalName == "orderRequestModal"
            ).isOpenValue;
            if (
              this.props.driverStatusState == "AWAITING_ORDER_RESPONSE" &&
              orderRequestModalCurrentValue == false
            ) {
              //Trigger secondarty coundown which eventually resets state
              console.debug("second phase");
              setTimeout(async () => {
                orderRequestModalCurrentValue = this.props.modalsArray.find(
                  (x) => x.modalName == "orderRequestModal"
                ).isOpenValue;
                if (
                  this.props.driverStatusState == "AWAITING_ORDER_RESPONSE" &&
                  orderRequestModalCurrentValue == false
                ) {
                  //final fire - this resets state
                  await this.normaliseDriverState();
                }
              }, 2000);
            }
          }
        } catch (error) {
          alert.error(
            "There was a problem in the AWAITING_ORDER_RESPONSE reset timer:" +
            error
          );
        }
      }, 6000);
    };

    //show in order menu depending on order active or not
    this.showInOrderMenu = () => {
      if (this.props.orderIsActive) {
        this.refs.driverInOrderControlsModal.open();
      } else {
        this.refs.driverControlsModal.open();
      }
    };
    this.updateUserInfo = (userInfo) => this.setState(userInfo);
    this.updateStores = (stores) =>
      this.setState(stores, console.debug("Stores state were reset"));
    this.updateDrivers = (drivers) =>
      this.setState(drivers, console.debug("drivers state were reset"));
  }

  _findMe = () => {
    if (this.state.drivers.length > 0) {
      this._mapView.animateToRegion(
        {
          latitude: this.state.drivers[0].location.lat,
          longitude: this.state.drivers[0].location.long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        4
      );
      this.refs.driverControlsModal.close();
    } else {
      alert("there was no driver to find");
    }
  };

  //DRIVER
  triggerDriverCompleteOrderModal = () => {
    //this.refs.driverCompleteOrderModal.open();
    this.props.updateModalState("driverCompleteOrderModal", true);
  };

  hideDriverCompleteOrderModal = () => {
    //this.refs.driverCompleteOrderModal.close();
    this.props.updateModalState("driverCompleteOrderModal", false);
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }

  /**driver cancels order */
  cancelOrder = async (orderDeliveryDestinationId) => {
    try {
      await HopprWorker.driverCancelOrderEntireDestination(
        orderDeliveryDestinationId,
        "Test reason"
      );
      toast("You cancelled the order");
      //need to check if there are other orders = else reset driver state
      if (this.props.activeDriverOrder.length == 1)
        this.resetDriverStateToDefault();

      this.refs.driverInOrderControlsModal.close();
    } catch (error) {
      toast("Failed to cancel the order!");
    }
  };

  driverConfirmOrderPickup = async () => {
    console.debug("Trying to confirm order pickup");
    try {
      let result = await HopprWorker.driverConfirmOrderPickup(
        this.props.activeDriverOrder[0].orderDeliveryItineraryId //sends the itinierary ID from first destination
      );
      toast("Thanks for confirming the order pickup");
      this.refs.driverInOrderControlsModal.close(); //close open modal
      //todo:
      //reset to non order state
    } catch (error) {
      let msg = "Couldn't confirm order pickup on behalf of driver: " + error;
      toast(msg);
      console.debug(msg);
    }
  };

  driverPageAlmostArrivedAtPickup = async (orderDestId) => {
    console.debug("Trying to page store");
    try {
      let result = await HopprWorker.driverPageAlmostArrivedAtPickupEntireDestination(
        orderDestId
      );
      // toast("Thanks for confirming the order pickup");
      // this.refs.driverInOrderControlsModal.close(); //close open modal
      //todo:
      //reset to non order state
    } catch (error) {
      let msg = "Couldn't confirm order pickup on behalf of driver: " + error;
      toast(msg);
      console.debug(msg);
    }
  };

  driverPageAlmostArrivedAtDestination = async (orderDestId) => {
    console.debug("Trying to page customer");
    try {
      let result = await HopprWorker.driverPageAlmostArrivedAtDestinationEntireDestination(
        orderDestId
      );
      // toast("Thanks for confirming the order pickup");
      // this.refs.driverInOrderControlsModal.close(); //close open modal
      //todo:
      //reset to non order state
    } catch (error) {
      let msg = "Couldn't confirm order pickup on behalf of driver: " + error;
      toast(msg);
      console.debug(msg);
    }
  };


  driverConfirmOrderDelivery = async (orderDeliveryDestinationId) => {
    this.setState(
      {
        orderDeliveryDestinationIdToConfirm: orderDeliveryDestinationId,
      },
      () => {
        this.triggerDriverCompleteOrderModal();
        //close current modal
        this.refs.driverInOrderControlsModal.close();
      }
    );
  };

  getLocationIndex = async (relationGuid, urlToPostTo) => {
    console.debug("inside getLocationIndex");

    navigator.geolocation.watchPosition(
      async (position) => {
        //success
        try {
          let locationUpdateRequest = {
            relationGuid: relationGuid,
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };

          await HopprWorker.updateLocationOnApi(
            urlToPostTo,
            JSON.stringify(locationUpdateRequest)
          );

          let addressResult = await HopprWorker.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          toast("You're at:" + addressResult.data);
        } catch (error) {
          toast("Couldn't update location on API - try again in a sec");
        }
      },
      (error) => {
        console.debug("Error getting location:" + JSON.stringify(error));
        // dispatch(
        //   actions.getCurrentLocationFailure("Couldn't get current position")
        // );
      },
      { enableHighAccuracy: true, distanceFilter: 5, maximumAge: 15000 }
    );
  };

  /**
   * Render tabview detailer
   */

  /** This checks latest driver state and assigns various messages and notifications based on that state */
  _defineSomeVariablesBasedOnDriverStateVariables = (newDriverState) => {
    //now do switch for driver image
    switch (newDriverState) {
      case "OFFLINE":
        this.setState({
          driverActiveImage: Images.TrafficLightRed,
          colorOfHeaderBar: "black",
          headerTextColor: "silver",
          tabLineColor: "black",
          flashingOrderMessage: "None"
        });
        break;
      case "ONLINE":
        this.setState({
          driverActiveImage: Images.TrafficLightGreen,
          colorOfHeaderBar: "white",
          headerTextColor: "silver",
          tabLineColor: "black",
          flashingOrderMessage: "None"
        });
        break;
      case "AWAITING_ORDER_RESPONSE":
        this.setState({
          driverActiveImage: Images.TrafficLightYellow,
          colorOfHeaderBar: "white",
          headerTextColor: "silver",
          tabLineColor: "yellow",
          flashingOrderMessage: "None"
        });
        break;
      case "ON_DELIVERY_ORDER_PICKUP":
        this.setState({
          driverActiveImage: Images.TrafficLightBlue,
          colorOfHeaderBar: "lightblue",
          headerTextColor: "white",
          tabLineColor: GlobalStyle.primaryColorDark.color,
          flashingOrderMessage: "On Order: Complete Store Pickup"
        });
        break;
      case "ON_DELIVERY_OUT_FOR_DELIVERY":
        this.setState({
          driverActiveImage: Images.TrafficLightBlue,
          colorOfHeaderBar: "lightblue",
          headerTextColor: "white",
          tabLineColor: GlobalStyle.primaryColorDark.color,
          flashingOrderMessage: "On Order: Out for Delivery"
        });
        break;
      default:
        this.setState({
          driverActiveImage: Images.TrafficLightRed,
          colorOfHeaderBar: "white",
          headerTextColor: "silver",
          tabLineColor: "black",
          flashingOrderMessage: "None"
        });
        break;
    }
  }
  _renderDriverMenuImage = (imageForDash, imageForDashBackground) => {
    if (this.props.activeDriverOrder == 0) {
      return (
        <View
          style={{
            flexGrow: 1,
            borderBottomLeftRadius: 240,
            borderBottomRightRadius: 240,
            overflow: "hidden",
          }}
        >
          <TouchableHighlight
            onLongPress={() => this.props.updateModalState("quickControlsModal", true)}
            onPress={() => this.showInOrderMenu()}>
            <ImageBackground
              ref={"hudBackground"}
              borderRadius={5}
              source={imageForDashBackground}
              //source={Images.HopprLogoPlaceholder}
              style={{
                flexGrow: 1,
                maxHeight: 120,
                height: 120,
                minHeight:120,
                borderBottomLeftRadius: 240,
                borderBottomRightRadius: 240,
              }}
            >
              {/* <FastImage
                style={{
                  flex: 1,
                  marginTop: 21,
                  margin: 5,
                  padding: 5,
                  maxHeight: 120,
                  height: 120,
                  width: undefined,
                }}
                source={imageForDash}
               //source={Images.HopprLogoPlaceholder}
                resizeMode="contain"
              /> */}
            </ImageBackground>
          </TouchableHighlight>
        </View>
      );
    } else {
      return null;
    }
  };

  _renderOrderActiveView = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    if (this.props.activeDriverOrder.length > 0) {
      return (
        <View style={styles.container}>
          <TouchableHighlight onPress={() => this.showInOrderMenu()}>
            <FastImage
              style={{
                flex: 1,
                maxHeight: 110,
                height: 110,
                width: undefined,
              }}
              source={Images.NewAppReskinGraphics.PingerDriver}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <BlinkView blinking={true} delay={1300}>
            <Text
              style={{
                color: "lightblue",
                textAlign: "center",
                fontSize: 22,
              }}
            >
              {this.state.flashingOrderMessage}
            </Text>
          </BlinkView>
        </View>
      );
    } else {
      return null;
    }
  };

  _renderOrderPickupTime = () => {
    let latestOrderPickupTimeUtc = "None";
    if (this.props.activeDriverOrder.length > 0) {
      letAllOrdersPicupTimes = [];
      this.props.activeDriverOrder.map((d) => {
        d.orders.map((orderInD) => {
          let tryConvertTODate = new Date(orderInD.pickupTime);
          letAllOrdersPicupTimes.push(tryConvertTODate);
        });
      });

      let maxTime = new Date(Math.max.apply(null, letAllOrdersPicupTimes));
      latestOrderPickupTimeUtc = maxTime.toLocaleTimeString();
    }

    return latestOrderPickupTimeUtc;
  };

  _renderEstimatedPickupTime = () => {
    let latestOrderPickupTimeUtc = this._renderOrderPickupTime();

    if (this.props.orderIsActive !== true) {
      return (
        <BlinkView blinking={true} delay={800}>
          <View style={{ paddingTop: 8, marginTop: 8 }}>
            <Text
              style={{
                borderRadius: 15,
                textShadowOffset: { width: 1, height: 1 },
                textShadowColor: "black",
                textShadowRadius: 2,
                color: "silver",
                textAlign: "center",
                fontSize: 18,
              }}
            >
              {"No pickup active"}
            </Text>
          </View>
        </BlinkView>
      );
    } else {
      //return icon row with pickup time
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <FastImage
            source={Images.PickupFromStore1}
            style={{
              width: 75,
              maxWidth: 75,
              minHeight: 75,
              height: 75,
            }}
          />
          {/* <BlinkView blinking={true} delay={800}> */}
          <View style={{ paddingTop: 8, marginTop: 8, paddingRight: 2 }}>
            <Text
              style={{
                textAlignVertical: "center",
                borderRadius: 8,
                textShadowOffset: { width: 1, height: 1, paddingRight: 2 },
                textShadowColor: "black",
                textShadowRadius: 6,
                paddingRight: 2,
                color: "hotpink",
                textAlign: "center",
                fontSize: 18,
              }}
            >
              {"Pickup @ " + latestOrderPickupTimeUtc}
            </Text>
          </View>
          {/* </BlinkView> */}
        </View>
      );
    }
  };
  /**
   * Render tabview detail
   */
  _renderTabView = () => {
    orderIterationNumber = { number: 0 };
    let theStoreAddress = this.props.storeAddressText;
    let theStoreName = this.props.storeName;

    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    return (
      <View
        style={[
          styles.tabView,
          { paddingBottom: 20, backgroundColor: "white" },
        ]}
      >
        <View
          style={[
            styles.tabButton,
            { backgroundColor: lineColor },
            { borderTopColor: lineColor },
            { borderBottomColor: lineColor },
            Constants.RTL && { flexDirection: "row-reverse" },
          ]}
        >
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={this.state.tabLineColor}
              icon={Images.TabDestIcon1}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Going to:"}
              onPress={() => this.handleClickTab(0)}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={this.state.tabLineColor}
              icon={Images.TabShoppingIcon1}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Details:"}
              onPress={() => this.handleClickTab(1)}
              selected={this.state.tabIndex == 1}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={this.state.tabLineColor}
              icon={Images.TabStoreIcon1}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Store:"}
              onPress={() => this.handleClickTab(2)}
              selected={this.state.tabIndex == 2}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              icon={Images.Drone1}
              lineColor={this.state.tabLineColor}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Misc:"}
              onPress={() => this.handleClickTab(3)}
              selected={this.state.tabIndex == 3}
            />
          </View>
        </View>
        {this.state.tabIndex === 0 && (
          <View
            style={{
              paddingTop: 5,
              paddingLeft: 10,
              paddingRight: 10,
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              {this._renderEstimatedPickupTime()}
              {this.props.activeDriverOrder.map((orderDeliveryDesty) =>
                this._renderDeliverToText(
                  orderDeliveryDesty,
                  orderIterationNumber
                )
              )}
            </View>
          </View>
        )}
        {this.state.tabIndex === 1 && (
          <View
            style={{
              flex: 1,
              paddingLeft: 10,
              paddingRight: 10,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {this.renderItemText()}
          </View>
        )}
        {this.state.tabIndex === 2 && (
          <View
            style={{
              flex: 1,
              paddingLeft: 10,
              paddingRight: 10,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Text style={[styles.label, { textAlign: "center" }]}>
              {theStoreName + " @ " + theStoreAddress}
            </Text>
          </View>
        )}
        {this.state.tabIndex === 3 && (
          <View
            style={{
              paddingTop:20,
              paddingLeft: 10,
              paddingRight: 10,
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Text style={[styles.label, { textAlign: "center" }]}>
              {"Distance (m) away from next delivery point:  " +
                parseFloat(this.state.timeToDelivery.distanceAway).toFixed(1)}
            </Text>
            <Text style={[styles.label, { textAlign: "center" }]}>
              {"Estimated time to next delivery point: " +
                parseFloat(this.state.timeToDelivery.timeAway / 60).toFixed(0) +
                " mins"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  displayMarkerLines = () => {
    if (
      this.props.activeDriverOrder.length > 0 &&
      this.props.activeOrderStores.length > 0 &&
      this.props.activeDriverOrder.length > 0 &&
      this.state.drivers.length > 0
    ) {
      let copiedDests = [...this.props.activeDriverOrder];
      let lengthOfArray = copiedDests.length;
      let lastElement = copiedDests[copiedDests.length - 1]; //this is the last destination
      //remove last element, use rest as waypoints, insert store as first waypoint
      copiedDests.pop();

      let waypointArray = [];
      waypointArray.push({
        latitude: this.props.activeOrderStores[0].location.lat,
        longitude: this.props.activeOrderStores[0].location.long,
      });

      copiedDests.map((remainingDest) => {
        waypointArray.push({
          latitude: remainingDest.location.lat,
          longitude: remainingDest.location.long,
        });
      });

      console.debug("shoudl have evrything we need now");
      return (
        <MapViewDirections
          origin={{
            latitude: this.state.drivers[0].location.lat,
            longitude: this.state.drivers[0].location.long,
          }}
          destination={{
            latitude: lastElement.location.lat,
            longitude: lastElement.location.long,
          }}
          waypoints={waypointArray}
          mode={"DRIVING"}
          apikey={Config.GoogleMapsDirectionAPIKey}
          strokeWidth={5}
          strokeColor="hotpink"
        />
      );
    } else {
      return null;
    }
  };

  /**UNUSED AT PRESENT */
  /** just checks we're not 'stuck' in driver state when there's no orders */
  _startResetCheckerTimer = () => {
    let resetTimerId = setInterval(() => {
      if (
        this.props.orderIsActive &&
        this.props.activeDriverOrder.length == 0
      ) {
        this.resetDriverStateToDefault();
      }
    }, 6000);

    this.setState({ resetTimerId });
  };

  //CLEAR TIMERS
  _clearStoresTimerId = () => {
    clearIntervalAsync(this.state.storesTimerId);
  }

  _cleardriversTimerId = () => {
    clearIntervalAsync(this.state.driversTimerId);
  }

  _clearTImeToDeliveryTimerId =  () => {
    clearIntervalAsync(this.state.timeToDeliveryTimerId);
  }

  //this is syncrhonous
  _clearResetCheckerTimer = () => {
    clearInterval(this.state.resetTimerId);
  };

  _clearStatusUpdateTimer = () => {
    clearIntervalAsync(this.state.enableStatusUpdateTimerId);
  };

  _rerenderHUD = () => {
    let random = Math.random();
    this.imageForDash = this.generateDashImage(random);
    this.imageForDashBackground = this.generateDashBackground(random);
    this.imageForMenuIcon = this.generateImageForMenuIcon(random);

    this.refs.hudBackground.forceUpdate();
    this.refs.driverControlsModal.close();
  };

  componentDidUpdate = async (prevProps, prevState) => {
    //check what state, is, if changed redefine vars
    if (this.state.drivers.length > 0) {
      //IF this state isn't last state or there was no last state, update that shit!!
      if (this.state.drivers[0].state != prevState.drivers[0].state
        | prevState.drivers.length == 0) {
        this._defineSomeVariablesBasedOnDriverStateVariables(this.state.drivers[0].state);
      }
    }
  };

  /**Needs to be called on unload / unmount */
  _clearAllTimers = () => {    
    this._clearTImeToDeliveryTimerId();    
    this._cleardriversTimerId();    
    this._clearResetCheckerTimer();
    this._clearStatusUpdateTimer();
    this._clearStoresTimerId();
  }

  unload = async () => {
    // this.disableDriverTracking(); 
    
     this._clearAllTimers();
    this.setState(getDefaultState());
    toast("UNLOADED");
    this.hasLoaded = false; //reset this
  };

  load = async () => {
    if(!this.hasLoaded)
    {
      this.hasLoaded = true;
    EventRegister.emit("showSpinner");
    this.resetDriverStateToDefault();
    console.debug("Driver Home Did");
    this._mapView.forceUpdate(); //make sure it redraws
    try {
      if (
        this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)
      ) {
        //check that location is enabled cos we need it
        console.debug("Requesting loction permissions");
        if(!await MapWorker.requestLocationPermission()){
          alert("Please enable location");
          return;
        };

        const { username, password } = this.state;
        HopprWorker.init({
          username: this.props.user.user.email,
          password: this.props.user.successPassword,
          token: this.props.user.token,
        });

        await HopprWorker.toDriverMode();
        let driverId = this.props.user.user.driverId;
        let fullDriverResponse = await this.getDriver(driverId);

        //clear location watch from last time - get a 'fresh' one
        //disabled when moved to new background location servuce
        // this.props.endLocationWatchWithApiLocationPush(
        //   this.props.locationWatchId
        // );

        //if it works keep going
        if (fullDriverResponse.status != 200) {
          toast("Couldn't get drivers from api");
          throw new Error("Couldn't get drivers from API!!");
        }

        let fullDriver = fullDriverResponse.data.value;
        this.setState(
          {
            //set driver first location for marker
            initalDriverLocation: {
              lat: fullDriver[0].location.lat,
              lng: fullDriver[0].location.long,
              isSet: true
            },
            drivers: [...this.state.drivers, fullDriver[0]]
          },
          function () {
            console.debug("Updated drivers state");
          }
        );
        this.setState({
          driverName: fullDriver[0].firstName + " " + fullDriver[0].lastName,
        });


        let networKImages = await HopprWorker.getActiveNetworkImages("Driver");
        this.setState({ networkImages: networKImages });

        this._mapView.animateToRegion({
          latitude: fullDriver[0].location.lat,
          longitude: fullDriver[0].location.long,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });

        //move the ios driver to where it needs to go for first start
        if (Platform.OS === "ios") {
          if (fullDriver[0].location != null) {
            //ios code to track marker
            const newCoordinate = {
              latitude: fullDriver[0].location.lat,
              longitude: fullDriver[0].location.long,
            };
            this.state.coordinate
            .timing({ ...newCoordinate, duration: 100 })
            .start();    
          }
        }
       
        await this.enableDriverTracking(driverId);
        this.enableStatusUpdate();
        this.startResetIfStuckInAwaitingOrderResponseStateTimer();
        this._startResetCheckerTimer();

        //start location track - should be able to call infinite times 
        //and not matter
        this.props.startLocationWatchAndApiLocationPush(
          driverId,
          "locations/drivers",
          this.props.locationWatchId
        );

        //set props / store state to whatever API state is
        if (typeof fullDriver[0].state !== "undefined") {
          if (
            fullDriver[0].state !== "OFFLINE" &&
            fullDriver[0].state !== "ONLINE" &&
            fullDriver[0].state !== "AWAITING_ORDER_RESPONSE"
          ) {
            this.props.updateDriverState(this.props.driverActive, true);
          }
        }
        //end

        //DEPRICATED - checks for single order
        //THIS IS JUST USED TO 'TEST' FOR ANY ORDERS - WE DON'T ACTUALLY USE THE DATA - EVERYTHING IS DONE IN THE REDUX
        //check order and set state
        let activeOrderInApi = await HopprWorker.getActiveDriverOrder(driverId);
        if (
          typeof activeOrderInApi !== "undefined" &&
          activeOrderInApi !== ""
        ) {
          //there is an order
          if (this.props.orderIsActive !== true) {
            //somehow we're at the wrong state - correct it!!
            this.props.updateDriverState(this.props.driverActive, true);
          }
        } else {
          //make sure it's false
          this.props.updateDriverState(this.props.driverActive, false);
        }

        //move map to correct region
        try {
          const location = {
            latitude: fullDriver[0].location.lat,
            longitude: fullDriver[0].location.long,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };

          let region = new AnimatedRegion(location);


          if (Platform.OS === "android") {
            this._mapView.animateToRegion({
              latitude: fullDriver[0].location.lat,
              longitude: fullDriver[0].location.long,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }, 6000);
          } else {
            this._mapView.animateToRegion(location, 3000);

          }


          this._defineSomeVariablesBasedOnDriverStateVariables(fullDriver[0].state);

          this._mapView.animateToViewingAngle(60, 100);
          this.setState({ currentRegion: location });        
        } catch (error) {
          console.debug("there was a problem with the map camera" + error);
        }

        //UPDATE ORDERS REGARDLESS OF WHETHER ACTIVE OR NOT
        //START CODE
        const updateOrders = async () => {
          //THIS IS NOW UPDATING EVERY 4 SECONDS
          console.log("in driver update orders");
          this.props
            .checkForNewOrderAndEnableOrderModeIfExists(driverId)
            .then(async () => {
              if (
                this.props.activeDriverOrder.length > 0 &&
                this.state.drivers.length > 0
              ) {
                try {
                  toast(
                    "Active order destination in props were:" +
                    this.props.activeDriverOrder.length
                  );
                  
                   this.getTimeToDelivery(
                    this.state.drivers[0].location.lat,
                    this.state.drivers[0].location.long,
                    this.props.activeDriverOrder[0].location.lat,
                    this.props.activeDriverOrder[0].location.long
                  );

                } catch (error) {
                  toast("Couldn't get time to delivery");
                }
              } else {
                if (this.props.orderIsActive) {
                  this.resetDriverStateToDefault();
                }
              }
            });
        };

        //This tracks the orders
        const timeToDeliveryTimerIdTemp = setIntervalAsync(async () => {
          toast("Test timer");
          console.log("firing?");
          await updateOrders();
        }, 7000);

        await updateOrders();
        this.setState({ timeToDeliveryTimerId: timeToDeliveryTimerIdTemp });
        //END CODE MOVED FROM INSIDE LOOP

        //todo: move these into the reducer and have  a disable fuctions
        //check if order is active, and start locaiton push/ store tracking if so
        if (this.props.orderIsActive === true) {
          //double check in the redux that we really do have an order in the API
          //if so, turn everything on
          //if not reset driver state
          if (
            typeof activeOrderInApi !== "undefined" &&
            activeOrderInApi !== ""
          ) {
            //start all the shit

            //tell driver he's on an order
            Vibration.vibrate(3000);
            showMessage({
              message: "You are on an order pickup",
              duration: 10000,
              backgroundColor: "lightblue", // background color
              description:
                "Please go to the store and collect the order, then deliver it to the destination. You can link to Waze via the driver menu if you click the HUD.",
              color: "white", // text color
              autoHide: true,
            });

            //this.enableStoreTracking(this.props.activeDriverOrder[0].storeId);

            //start time to next delivery updates (this looks at destination[0]) and tells you
            const locationObject = {
              latitude: fullDriver[0].location.lat,
              longitude: fullDriver[0].location.long,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            };
            //move the map to the order regions

            this._mapView.animateToRegion(locationObject, 4);
            this._mapView.animateToViewingAngle(60, 100);

            this.setState({ currentRegion: locationObject });

          } else {
            //reset driver state if no order
            this.resetDriverStateToDefault();
            //show default message
            showMessage({
              message: "This is the driver home view",
              autoHide: true,
              position: "bottom",
              duration: 10000,
              description:
                "You can view all driver facilities here,including where your delivery should be taken and picked up from. ",
              backgroundColor: "black", // background color
              color: "white", // text color
            });
          }
        } else {
          this.resetDriverStateToDefault();
        }
      } else {
        this.resetDriverStateToDefault();
      }
    } catch (error) {
      alert(
        "That spazzed out - can you reload this screen please - we couldn't connect with the API" +
        error
      );
    } finally {
      EventRegister.emit("hideSpinner");
    }
   }
  };

  componentWillUnmount = () => {
    try {
      this._clearAllTimers();
      this.setState(getDefaultState());
  
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      
    }    
  }

  componentDidMount = async () => {        
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    this.unsubscribeLoseFocus = this.props.navigation.addListener("willBlur", this.unload);

    
    //PERMS  
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.check("android.permission.ACCESS_BACKGROUND_LOCATION");
     // const grantedAgain = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);    
      if (!granted){    
        this.setState({warningModalOpen:true})                    
      }   
    }

    await this.load();
  };



  // markerClick = () => {
  //   // toast("Marker Was clicked");
  //   let test = this._mapView;
  //   //pass map view to GeoWorker to add marker
  //   if (this.props.activeDriverOrder.length > 0) {
  //     this._driverMarker.animateMarkerToCoordinate(
  //       {
  //         latitude: this.props.activeDriverOrder[0].location.lat,
  //         longitude: this.props.activeDriverOrder[0].location.long,
  //       },
  //       6000
  //     );
  //   }
  // };

  //turns on store updates
  enableStoreTracking = async (storeId) => {
    //repulls store from API on timer
    let newStoreTImerId = await setIntervalAsync(async () => {
      //get data
      let fullStore = await this.getStore(storeId);
      let newSTore = fullStore[0];
      this.setState({ stores: fullStore }, function () {
        // toast("Treacking updated store location");
        console.debug("Updated stores state");
      });
    }, 4000);

    this.setState({ storesTimerId: newStoreTImerId });
  };

  disableStoreTracking = () => {
    clearTimeout(this.state.storesTimerId);
  };

  //turn on driver updates
  enableDriverTracking = async (driverId) => {
    //check it's not already enabled first
    let newDriversTimerId = await setIntervalAsync(async () => {
      //get data
      try {
        console.debug("hold on");
        let allDriversResponse = await this.getDriver(driverId);
        if (allDriversResponse.status == 200) {
          let allDrivers = allDriversResponse.data.value;
          let driver = allDrivers[0];
          //animate marker
          if (typeof driver !== "undefined") {
            if (Platform.OS === "ios") {
            if (driver.location != null) {
              //ios code to track marker
              const newCoordinate = {
                latitude: driver.location.lat,
                longitude: driver.location.long,
              };
              this.state.coordinate
              .timing({ ...newCoordinate, duration: 8500 })
              .start();                   

              // showMessage({
              //   message: "DRIVER HOME Location updated",
              //   autoHide: true,
              //   duration: 2000,
              //   description:
              //     "",
              //   backgroundColor: "green", // background color
              //   color: "white", // text color
              // });
            }
            } else {
              if (driver.location != null) {
                this._driverMarker.animateMarkerToCoordinate(
                  {
                    latitude: driver.location.lat,
                    longitude: driver.location.long,
                  },
                  8000
                );
              }
            }
          }
          //save updates to state
          this.setState({ drivers: allDrivers }, function () {
            console.debug("Updated drivers location state");
          });
        } else {
          //wasn't successful
          toast("Couldn't get driver data that time");
        }
      } catch (error) {
        toast("Couldn't complete enableDriverTracking! Try again in a sec");
      }
    }, 12000);

    this.setState({ driversTimerId: newDriversTimerId });
  };

  getStore = async (storeId) => {
    return await HopprWorker.getStore(storeId);
  };

  //returns whole response with status
  getDriver = async (driverId) => {
    return await HopprWorker.getDriver(driverId);
  };

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = (user) => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        if (user.user.roles.find((x) => x === "Driver")) {
          //we are allowed
          return true;
        }
      }
    }

    const { navigation } = this.props;
    this.props.navigation.pop();
    this.props.navigation.navigate("LoginScreen");

    alert(
      "You are not in the correct role, or not logged in. Please register to become a driver!!"
    );

    return false;
  };

  _renderDeliverToText = (orderDestination, orderIterationNumber) => {
    orderIterationNumber.number = orderIterationNumber.number + 1;
    let thisLoop = orderIterationNumber.number;
   
    let addressDesc = orderDestination.orders[0].deliveryLocationAsString;
    let orderCount = orderDestination.orders.length;

    return (
      <Text style={[styles.label, { textAlign: "center" }]}>
        {"Delivery #:" +
          thisLoop +
          ": " +
          addressDesc +
          " - " +
          orderCount +
          " orders to deliver"}
      </Text>
    );
  };


  renderItemText = () => {
    if (this.props.activeDriverOrder.length > 0) {
      return this.props.activeDriverOrder.map((orderDeliveryDesty) =>
        this._renderItemsToText(orderDeliveryDesty, orderIterationNumber)
      );
    } else {
      return <Text style={[styles.label, { textAlign: "center" }]}>
        {"No Details"}
      </Text>
    }
  }

  _renderItemsToText = (orderDestination, orderIterationNumber) => {
    orderIterationNumber.number = orderIterationNumber.number + 1;
    let thisLoop = orderIterationNumber.number;
    let ordersString = "";
    let itemsString = "";

    orderDestination.orders.map((x) => {
      ordersString += "#" + x._id.substring(0, 4);
      ordersString = ordersString + ", "
    });

    ordersString = ordersString.substring(0, ordersString.length - 2);
    
    return (
      <Text style={[styles.label, { textAlign: "center" }]}>
        {"Delivery #" +
          thisLoop +
          "- Orders to deliver: " +
          ordersString}          
      </Text>
    );
  };

  _getOrderDestinationMarker = (
    orderDestination,
    orderDestinationNumberObject
  ) => {
    orderDestinationNumberObject.number =
      orderDestinationNumberObject.number + 1;
    let orderDestinationNumber = orderDestinationNumberObject.number;
    let tryAndGetAddressForDesc = orderDestination.orders[0].deliveryLocationAsString;

    let newDestKey = orderDestination._id + this.props.driverStatusState;
    // toast("markerkey:" + newDestKey);

    return (
      <Marker
        zIndex={101}
        tracksViewChanges={this.state.tracksViewChanges}
        ref={(el) => (this._destinationMarker = el)}
        key={`${newDestKey}`}
        identifier={orderDestination._id}
        coordinate={{
          latitude: orderDestination.location.lat,
          longitude: orderDestination.location.long,
        }}
        title={"Order destination #" + orderDestinationNumber}
        description={tryAndGetAddressForDesc}
      >
        <FastImage
          source={Images.MapPin4}
          style={{
            width: 75,
            maxWidth: 75,
            minHeight: 75,
            height: 75,
          }}
        />
      </Marker>
    );
  };

  //tell the api that all orders are complete for an entire destination
  driverCompletesOrder = async (
    orderCompletionText,
    orderDeliveryDestinationId
  ) => {
    let howMany = this.props.activeDriverOrder.length;
    if (howMany > 0 && typeof orderDeliveryDestinationId !== "undefined") {
      console.debug("Trying confirmed the order delivery.");
      try {
        let result = await HopprWorker.driverConfirmOrderDelivery(
          orderDeliveryDestinationId,
          orderCompletionText
        );

        toast("You confirmed the order delivery. Thanks");

        this.props.updateModalState("driverCompleteOrderModal", false);

        //only reset if this is last destination
        if (howMany == 1) {
          this.resetDriverStateToDefault();
        }

        SoundPlayer.playSoundFile("notification1", "mp3");
        this.props.updateModalState("oneMoreStepModal", true);

        showMessage({
          message: "Thanks for delivering the order",
          autoHide: true,
          duration: 9000,
          description:
            "You are now free to pick up another order. You will begin getting new order requests immediately. Disable the driver client if you don't want to continue to deliver.",
          backgroundColor: "#761BF1", // background color
          color: "white", // text color
        });
        //todo:
        //reset to non order state
      } catch (error) {
        let msg = "Couldn't confirm order delivery behalf of driver: " + error;
        toast(msg);
        console.debug(msg);
      }
    } else {
      //nothing to confirm
      this.props.updateModalState("driverCompleteOrderModal", false);
      toast(
        "Seems like you didn't have an active order to confirm, so it's already done!! Don't worry."
      );
      alert("I think that order was already confirmed");
    }
  };

  componentWillReceiveProps(nextProps) { }

  _renderDriverActiveIcon = () => {
    if (this.props.driverActive) {
      //return img
      return (
        <View style={{ paddingTop: 4, marginTop: 12 }}>
          <TouchableHighlight
            onPress={() => this._findMe()}
          //onPress={() => this.props.updateModalState("chatModal", true)}
          >
            <FastImage
              source={this.state.driverActiveImage}
              style={{ maxHeight: 50, maxWidth: 50, height: 50, width: 50 }}
            />
          </TouchableHighlight>
        </View>
      );
    } else {
      return null;
    }
  };

  generateDashImage = (aRandom) => {
    if (aRandom >= 0.75) {
      return Images.MapIconDriverSpaceship6;
    }
    if (aRandom >= 0.5) {
      return Images.MapIconDriverSpaceship6;
    }
    if (aRandom >= 0.25) {
      return Images.MapIconDriverSpaceship6;
    } else {
      // return Images.drone;
      return Images.MapIconDriverSpaceship6;
    }
  };

  generateDashBackground = (aRandom) => {
    return Images.Horizon;

    if (aRandom > 0.75) {
      return Images.space10;
    }
    if (aRandom > 0.5) {
      return Images.Horizon;
    }
    if (aRandom > 0.25) {
      return Images.space10;
    } else {
      // return Images.endlessHorizon;
      return Images.Horizon;
    }
  };

  generateImageForMenuIcon = (aRandom) => {
    if (aRandom > 0.75) {
      return Images.Settings3;
    }
    if (aRandom > 0.5) {
      return Images.Settings4;
    }
    if (aRandom > 0.25) {
      // return Images.Toolkit3;
      return Images.Settings3;
    } else {
      // return Images.Toolkit2;
      return Images.Settings4;
    }
  };

  _renderInOrderModalDestinationListviewRow = ({ item }) => {
    console.debug("in listview");

    //get address for destination
    let driverNote = item.orders[0].driverNote;
    let tryAndGetAddressForDesc = item.orders[0].deliveryLocationAsString;
    let ordersTODeliverString = item.orders.length + " order to deliver here";

    let amalgTitle =driverNote == "" ? tryAndGetAddressForDesc :  driverNote + " | " + tryAndGetAddressForDesc

    return (
      <ListItem
        titleNumberOfLines={6}
        subtitleNumberOfLines={4}
        title={amalgTitle}
        subtitle={"PICKUP CODE: " + (item.orders[0].driverPickupCode ?? "NONE\n").toUpperCase() +  "\n"+ordersTODeliverString}
        hideChevron={false}
        // onPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
        // onLongPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
        rightIcon={
          <ScrollView horizontal={true}
            style={{ flexDirection: "row", flex: 1 }}>
            {/* DESTINATION WAZE */}
            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableHighlight
                onPress={() =>
                  this.openInWaze(item.location.lat, item.location.long)
                }
              >
                <FastImage
                  style={{
                    margin: 5,
                    padding: 5,
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                  }}
                  source={Images.PinkPin}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{ textAlign: "center", color: "black", fontSize: 10 }}
              >
                {"Waze to\ndestination"}
              </Text>
            </View>

            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableHighlight
                onPress={() => this.driverConfirmOrderDelivery(item._id)}
              >
                <FastImage
                  style={{
                    margin: 5,
                    padding: 5,
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                  }}
                  source={Images.CompleteOrder3}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{ textAlign: "center", color: "black", fontSize: 10 }}
              >
                {"Complete\norder"}
              </Text>
            </View>

            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableHighlight onPress={() => this.driverPageAlmostArrivedAtPickup(item._id)}>
                <FastImage
                  style={{
                    margin: 5,
                    padding: 5,
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                  }}
                  source={Images.Add3}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{ textAlign: "center", color: "black", fontSize: 10 }}
              >
                {"Page\nStore"}
              </Text>
            </View>

            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableHighlight onPress={() => this.driverPageAlmostArrivedAtDestination(item._id)}>
                <FastImage
                  style={{
                    margin: 5,
                    padding: 5,
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                  }}
                  source={Images.Pager1}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{ textAlign: "center", color: "black", fontSize: 10 }}
              >
                {"Page\nDestination"}
              </Text>
            </View>

            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <TouchableHighlight onPress={() => this.cancelOrder(item._id)}>
                <FastImage
                  style={{
                    margin: 5,
                    padding: 5,
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                  }}
                  source={Images.NoDelivery1}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{ textAlign: "center", color: "black", fontSize: 10 }}
              >
                {"Cancel\norder"}
              </Text>
            </View>
          </ScrollView>
        }
      />
    );
  };

  _renderInOrderModalDestinationFlatlist = () => {
    console.debug("stop");
    if (this.props.activeDriverOrder.length > 0) {
      console.debug("stop again");
      return (
        <ScrollView style={{ flex:1 }}>  
        <TouchableOpacity>      
            <FlatList
              style={{ flex:1, paddingBottom:40 }}
              data={this.props.activeDriverOrder}
              renderItem={this._renderInOrderModalDestinationListviewRow}
              keyExtractor={(item) => item._id}
            />        
          </TouchableOpacity>
        </ScrollView>
      );
    } else {
      return (
        <View style={{ flex: 1, paddingTop: 10 }}>
          <FastImage
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.DeliveryLocation1}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 4,
              color: "black",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {"There were no destinations to show!"}
          </Text>
        </View>
      );
    }
  };

  _renderNetworkImageResultsRow = ({ item }) => {
    //put the url together
    let netImgUrl = "https://booza.store:44300/images/NetworkLogos/953e5978-6b88-ea11-811a-00155d5eb736.png";

    let baseNetImg = Config.NetworkImageBaseUrl;
    let fullImgeUrl = baseNetImg + item.storeLogoUrl
    //render a square row
    return (
      <TouchableOpacity
        style={{
          backgroundColor: 'transparent',
          flex: 1 / 3, //here you can use flex:1 also
          aspectRatio: 1
        }}>
        <View style={{ backgroundColor: 'transparent', flex: 1 }}>
          <View style={{
            backgroundColor: 'transparent',
            minHeight: 50,
            minWidth: 50
          }}
            resizeMode='contain'
            source={{ uri: fullImgeUrl }}>
              
            </View>
        </View>
      </TouchableOpacity>
    )
  }

  _showNetworkList = () => {
    if (typeof this.state.networkImages !== "undefined") {
      if (this.state.networkImages.length > 0) {
        return (
          <NetworkImageList listOfImages={
            this.state.networkImages
          }
            baseImageUrl={"testurl.com"} />
        );
      }
    }
    return null

  };

  _renderDriverMarker=()=>{
    if(this.state.drivers.length > 0)
    {
    let marker = this.state.drivers[0];
    if (Platform.OS === "android") {
      return (
        <Marker
              zIndex={102}
              tracksViewChanges={this.state.tracksViewChanges}
              ref={(el) => (this._driverMarker = el)}
              key={`${marker._id}${this.props.driverStatusState}`}
              identifier={marker._id}
              style={{
                zIndex:10
              }}
              // coordinate={{
              //   latitude: marker.location.lat,
              //   longitude: marker.location.long,
              // }}
              coordinate={{
                latitude: this.state.initalDriverLocation.lat,
                longitude: this.state.initalDriverLocation.lng,
              }}
      
              description={"Your current position"}
              title={
                "Driver: " + marker.firstName + " " + marker.lastName
              }
            >
              <FastImage
                source={Images.sport_utility_vehicle}
                style={{
                  zIndex:10,
                  maxWidth: 110,
                  width: 70,
                  minHeight: 70,
                  height: 70,                      
                }}
              />
            </Marker>
      );
    } else {
      return (
        <Marker.Animated
        zIndex={102}
        tracksViewChanges={this.state.tracksViewChanges}
        ref={(el) => (this._driverMarker = el)}
        key={`${marker._id}${this.props.driverStatusState}`}
        identifier={marker._id}
        description={"Your current position"}
        title={
          "Driver: " + marker.firstName + " " + marker.lastName
        }
        coordinate={this.state.coordinate}        
        >
        <FastImage
                source={Images.sport_utility_vehicle}
                style={{
                  maxWidth: 110,
                  width: 70,
                  minHeight: 70,
                  height: 70,                      
                }}
              />
        </Marker.Animated>
      );
    }
  }


  }

  render = () => {
    let whichNumberDestination = { number: 0 };
    let headerColor = this.props.orderIsActive ? "lightblue" : "black";
    let iconColor = this.props.orderIsActive ? "black" : "white";
    //scroll to end, just looks better at bottom
    console.debug("Order state active is:" + this.props.orderIsActive);
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Header
          backgroundColor={this.state.colorOfHeaderBar}
          outerContainerStyles={{ height: 49 }}
          // rightComponent={{
          //   icon: "help",
          //   color: "#fff",
          //   onPress: () => this.showInOrderMenu()
          // }}
          rightComponent={
            <View style={{ paddingTop: 4, marginTop: 12 }}>
              <TouchableHighlight onPress={() => this.showInOrderMenu()}>
                <FastImage
                  source={this.imageForMenuIcon}
                  style={{ maxHeight: 24, maxWidth: 24, height: 24, width: 24 }}
                />
              </TouchableHighlight>
            </View>
          }
          centerComponent={{
            text: this.props.driverStatusState.replace(/_/g, " "),
            style: { color: this.state.headerTextColor },
          }}          
          leftComponent={{
            icon: "arrow-back",
            color: this.state.headerTextColor,
            onPress: () => this.props.navigation.goBack(),
          }}

        // <FastImage
        //   style={{
        //     flex: 1,
        //     maxHeight: 20,
        //     height: 20,
        //     width: undefined
        //   }}
        //   source={Images.van}
        //   resizeMode="contain"
        // />
        />
        <ScrollView
          ref={(ref) => (this.scrollView = ref)}
          // onContentSizeChange={(contentWidth, contentHeight) => {
          //   this.scrollView.scrollTo({ y: 300 });
          //   // this.scrollView.scrollToEnd({ animated: true });
          // }}
          style={styles.container}
        >
          <View style={styles.container}>
            <View
              style={{
                minHeight: mapMinHeight,
                height: mapHeight,
                borderWidth: 1,
                borderColor: "lightblue",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                overflow: "hidden",
              }}
            >
              <MapView
                onMapReady={() => {

                }
                }
                ref={(el) => (this._mapView = el)}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                initialRegion={this.state.currentRegion}
                customMapStyle={Config.MapThemes.SecondaryMapTheme}
              >

                {this._renderDriverMarker()}
                {this.props.activeOrderStores.map((marker) => (
                  <Marker
                    zIndex={103}
                    tracksViewChanges={this.state.tracksViewChanges}
                    ref={(el) => (this._storeMarker = el)}
                    key={`${marker._id}${this.props.driverStatusState}`}
                    identifier={marker._id}
                    coordinate={{
                      latitude: marker.location.lat,
                      longitude: marker.location.long,
                    }}
                    // image={Images.MapIconStore}
                    description={this.props.storeAddressText}
                    title={"Store: " + marker.storeName}
                  >
                    <FastImage
                      source={Images.MapIconStore8}
                      style={{ width: 50, height: 50 }}
                    />
                  </Marker>
                ))}                
                {/* THIS IS EACH DESTINATION NOW */}
                {this.props.activeDriverOrder.map((marker) =>
                  this._getOrderDestinationMarker(
                    marker,
                    whichNumberDestination
                  )
                )}

                {this.displayMarkerLines()}
              </MapView>

              {/* NETWORKS IM OPERATING ON  */}
              <View
                style={{
                  backgroundColor: 'transparent',
                  position: "absolute",
                  justifyContent: "flex-end",
                  top: 0,
                  minHeight: mapMinHeight,
                  height: mapHeight,
                  width: 50,
                  right: 0,
                  zIndex: 200,
                }}
              >


                {this._showNetworkList()}

              </View>
              {/* MAP ICON RED/YELLOW/GREEN - BASED ON DRIVER STATE*/}
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  left: 4,
                  zIndex: 100,
                }}
              >
                <View style={{
                  flexDirection: "row",
                  flex: 1,
                  alignItems: "center",
                  alignContent: "center",
                  justifyContent: "center"
                }}>

                  {this._renderDriverActiveIcon()}
                  {/* <TouchableOpacity
                    onPress={async () => {
                      await this._getCurrentLocationAndUpdatePickedLocationIfSuccessful();
                      //this.props.getCurrentLocation();
                    }}
                  >
                    <FastImage
                      style={{
                        maxHeight: 40,
                        height: 40,
                        width: 40,
                        maxWidth: 40,
                      }}
                      source={Images.TrafficLightGreen}
                      resizeMode="contain"
                    />
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>

            <View
              style={{
                flex: 1,
                // borderTopWidth: 1
              }}
            >
              {this._renderOrderActiveView()}
              {this._renderDriverMenuImage(
                this.imageForDash,
                this.imageForDashBackground
              )}
              <View
                style={{
                  marginBottom: 33,
                }}
              >
                {this._renderTabView()}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* MODALS */}
        {/* DRIVER IN ORDER CONTROLS MODAL */}
        <Modal
          style={{
            backgroundColor: "#fff",
            height: LayoutHelper.getDynamicModalHeight(),
            maxHeight: LayoutHelper.getDynamicModalHeight(),            
            borderRadius: 20,
            width: width - 14,
            overflow:"hidden"
          }}
          swipeToClose={true}
          backdropPressToClose={true}
          backdrop={true}
          position={"center"}
          ref={"driverInOrderControlsModal"}
        >
          <Header
            backgroundColor={"hotpink"}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
            rightComponent={{
              icon: "close",
              color: "#fff",
              onPress: () => this.refs.driverInOrderControlsModal.close(),
            }}
            centerComponent={{
              text: this.state.driverName + " In-Order Controls",
              style: { color: "#fff" },
            }}
          />

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: 190,
              height: 190,
              maxHeight: 190,
            }}
          >
            <Text style={{ textAlign: "center", color: "black" }}>
              {"Chat | Open In Waze? |  Confirm Pickup"}
            </Text>

            {/* STORE WAZE */}
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View>
                <TouchableHighlight
                  onPress={() => this.props.updateModalState("chatModal", true)}
                >
                  <FastImage
                    style={{
                      margin: 5,
                      padding: 5,
                      maxHeight: 95,
                      height: 95,
                      width: 95,
                    }}
                    source={Images.Chat1}
                    resizeMode="contain"
                  />
                </TouchableHighlight>
                <Text
                  style={{ textAlign: "center", color: "black", fontSize: 10 }}
                >
                  {"Chat"}
                </Text>
              </View>

              <View>
                <TouchableHighlight
                  onPress={() =>
                    this.openInWaze(
                      this.props.activeOrderStores[0].location.lat,
                      this.props.activeOrderStores[0].location.long
                    )
                  }
                >
                  <FastImage
                    style={{
                      margin: 5,
                      padding: 5,
                      maxHeight: 95,
                      height: 95,
                      width: 95,
                    }}
                    source={Images.MapIconStore2}
                    resizeMode="contain"
                  />
                </TouchableHighlight>
                <Text
                  style={{ textAlign: "center", color: "black", fontSize: 10 }}
                >
                  {"Store"}
                </Text>
              </View>

              <View>
                <TouchableHighlight
                  onPress={() => this.driverConfirmOrderPickup()}
                >
                  <FastImage
                    style={{
                      margin: 5,
                      padding: 5,
                      maxHeight: 86,
                      height: 86,
                      width: 86,
                    }}
                    source={Images.Handover3}
                    resizeMode="contain"
                  />
                </TouchableHighlight>
                <Text
                  style={{
                    textAlign: "center",
                    color: "black",
                    fontSize: 10,
                    marginTop: 8,
                  }}
                >
                  {"Confirm pickup"}
                </Text>
              </View>
              {/* DESTINATION WAZE */}
              {/* <View
                style={{                
                  justifyContent: "center"
                }}
              > */}
              {/* <View>
                <TouchableHighlight
                  onPress={() =>
                    this.openInWaze(
                      this.props.activeDriverOrder[0].location.lat,
                      this.props.activeDriverOrder[0].location.long
                    )
                  }
                >
                  <FastImage
                    style={{
                      margin: 5,
                      padding: 5,
                      maxHeight: 60,
                      height: 60,
                      width: 60
                    }}
                    source={Images.PinkPin}
                    resizeMode="contain"
                  />
                </TouchableHighlight>
                <Text
                  style={{ textAlign: "center", color: "black", fontSize: 10 }}
                >
                  {"Destination"}
                </Text>
              </View> */}
            </View>

            <View style={{ marginTop: 15 }}>
              <Divider style={{ backgroundColor: "#FFC300" }} />
            </View>        
          </View>

          {/* FLATLIST ROWS */}          
            {this._renderInOrderModalDestinationFlatlist()}          
          {/* FOR PADDING */}
          {/* <View style={{ minHeight: 14, maxHeight: 14, }}></View> */}
        </Modal>

        {/* DRIVER NOT IN ORDER CONTROLS MODAL */}
        <Modal
          style={{
            backgroundColor: "#fff",
            height: null,
            paddingBottom: 10,
            borderRadius: 20,
            width: width - 35,
          }}
          backdrop={true}
          position={"center"}
          ref={"driverControlsModal"}
        >
          <Header
            backgroundColor={"#fbad4a"}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
            rightComponent={{
              icon: "close",
              color: "#fff",
              onLongPress: () => this.props.updateModalState("quickControlsModal", true),
              onPress: () => this.refs.driverControlsModal.close(),
            }}
            centerComponent={{
              text: this.state.driverName,
              style: { color: "#fff" },
            }}
          />
          {/* <FastImageBackground
            source={Images.animatedRoad}
            style={{ height: 420, flex: 1, width: undefined }}
         
          {/* START ROW COMPONENT*/}
          <View style={{ paddingTop: 5 }}>
            {/* THIS IS MAIN ROW */}
            <Text style={{ textAlign: "center", color: "black" }}>
              {"Active?"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {/* START FIRST BUTTON */}
              <View style={{ margin: 15 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <TouchableHighlight onPress={() => this._findMe()}>
                    <FastImage
                      style={{
                        margin: 2,
                        marginLeft: 20,
                        maxHeight: 90,
                        height: 90,
                        width: 90,
                      }}
                      source={Images.LaunchMap3}
                      resizeMode="contain"
                    />
                  </TouchableHighlight>
                </View>
                <Text
                  style={{
                    textAlign: "center",
                    color: "black",
                    fontSize: 11,
                    marginLeft: 20,
                  }}
                >
                  {"Find Me"}
                </Text>
              </View>
              {/* END FIRST BUTTON */}

              {/* START SECOND BUTTON */}
              <View
                style={{
                  margin: 15,
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      marginLeft: 30,
                      height: 98,
                      width: 98,
                      justifyContent: "center",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <SwitchToggle
                      backgroundColorOff={"grey"}
                      backgroundColorOn={"#fbad4a"}
                      containerStyle={{
                        width: 95,
                        height: 44,
                        borderRadius: 25,
                        backgroundColor: "#fbad4a",
                        backgroundColorOn: "#fbad4a",
                        backgroundColorOff: "#fbad4a",
                        padding: 5,
                      }}
                      circleStyle={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: "white", // rgb(102,134,205)
                      }}
                      switchOn={this.props.driverActive}
                      onPress={() => this.toggleDriverState()}
                      circleColorOff="white"
                      circleColorOn="white"
                      duration={300}
                    />
                  </View>
                  {/* <Text
                    style={{
                      marginLeft: 40,
                      textAlign: "center",
                      color: "black",
                      fontSize: 11
                    }}
                  >
                    {"On/Off"}
                  </Text> */}
                </View>
                {/* END SECOND BUTTON */}
              </View>
            </View>
          </View>
          {/* END TOGGLE ROW */}
          {/* START ROW COMPONENT*/}
          <View style={{ paddingTop: 5 }}>
            {/* THIS IS MAIN ROW */}
            <Text style={{ textAlign: "center", color: "black" }}>
              {"Technical"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {/* START FIRST BUTTON */}
              <View style={{ margin: 15 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <TouchableHighlight
                    onPress={() => this.normaliseDriverState()}
                  >
                    <FastImage
                      style={{
                        margin: 2,
                        marginLeft: 20,
                        height: 90,
                        width: 90,
                      }}
                      source={Images.CloudSync2}
                      resizeMode="contain"
                    />
                  </TouchableHighlight>
                </View>
                <Text
                  style={{
                    textAlign: "center",
                    color: "black",
                    fontSize: 11,
                    marginLeft: 20,
                  }}
                >
                  {"Normalise State"}
                </Text>
              </View>
              {/* END FIRST BUTTON */}

              {/* START SECOND BUTTON */}
              <View style={{ margin: 15 }}>
                <View
                  style={{
                    justifyContent: "center",
                  }}
                >
                  <TouchableHighlight onPress={() => this._rerenderHUD()}>
                    <FastImage
                      style={{
                        margin: 2,
                        marginLeft: 40,
                        paddingLeft: 40,
                        height: 90,
                        width: 90,
                      }}
                      source={Images.GenerateHud2}
                      resizeMode="contain"
                    />
                  </TouchableHighlight>
                </View>
                <Text
                  style={{
                    marginLeft: 40,
                    textAlign: "center",
                    color: "black",
                    fontSize: 11,
                  }}
                >
                  {"Generate HUD"}
                </Text>
              </View>
              {/* END SECOND BUTTON */}
            </View>
          </View>
        </Modal>

        {
          <DriverCompleteOrderModal
            ref={"driverCompleteOrderModal"}
            openClosed={
              this.props.modalsArray.find(
                (x) => x.modalName === "driverCompleteOrderModal"
              ).isOpenValue
            }
            orderDeliveryDestinationId={
              this.state.orderDeliveryDestinationIdToConfirm
            }
            orderCompleted={async () =>
              await this.driverCompletesOrder(
                "Order was compltetd",
                this.state.orderDeliveryDestinationIdToConfirm
              )
            }
            closeMe={this.hideDriverCompleteOrderModal}
          />
        }
        {/* <CancelOrderModal
          ref={this.cancelOrderModalRef}
          headerText={"this is headerText"}
        /> */}

         {/* LOCATION REQUEST */}
         <Modal
          style={{
            backgroundColor: "#fff",
            height: null,
            paddingBottom: 10,
            borderRadius: 20,
            width: width - 35,
          }}
          isOpen={this.state.warningModalOpen}
          backdrop={true}
          swipeToClose={false}          
          onClosed={()=>this.setState({warningModalOpen :false})}
          position={"center"}
          ref={"locationAlwaysOnWarningModal"}
        >          

          <Text
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 30,
                textAlign: "center"
              }}
            >
              {"We need always-on location permissions to track you"}
            </Text>
            <View>
              <FastImage
                style={{
                  alignSelf:"center",
                  minHeight: 160,
                  minWidth:160,
                  height: 160,
                  width: 160
                }}
                source={Images.NewAppReskinGraphics.OrderPickedUp}
                resizeMode="contain"
              />
            </View>
            <Text style={{
             fontFamily:Constants.fontFamily,
             color: GlobalStyle.modalTextBlackish.color,
              paddingLeft: 12,
              paddingRight: 12,
              margin: 8,
              textAlign: "center"
            }}>
              {
                "If you could turn the permission to, 'always on', thank you.  This app collects location data to enable driver tracking even when the app is closed or not in use."
              }
            </Text>       
            {/* <Divider style={{ backgroundColor: "#C11F1F" }} /> */}
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, height:50, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}           
              title="Take me there"
              onPress={() => {
              this.setState({warningModalOpen:false})
              BackgroundGeolocation.showAppSettings()
              }}
            />
            </Modal>
      </View>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    location: state.location,
    locationWatchId: state.location.locationWatchId,
    user: state.user,
    driverActive: state.driver.driverActive,
    orderIsActive: state.driver.orderIsActive,
    orderItemsAsTextArray: state.driver.itemsAsText,
    storeAddressText: state.driver.storeAddressText,
    driverStatusState: state.driver.driverStatusState,
    storeName: state.driver.storeName,
    destinationAndAddressTextArray: state.driver.destinationAddressText,
    orderRegion: state.driver.orderRegion,
    activeDriverOrder: state.driver.activeDriverOrder, //this is a list of order destinations now
    activeOrderStores: state.driver.activeOrderStores,
    modalsArray: state.modals.modalsArray,
    keepAliveCycleTimerId: state.driver.keepAliveCycleTimerId,
  };
};

const mapDispatchToProps = (dispatch) => {
  const driverStateActions = require("@redux/DriverRedux");
  const locationActions  = require("@redux/LocationRedux");
  const modalActions = require("@redux/ModalsRedux");
  return {
    checkDriverStatusInApiAndSetDriverActiveVariable: (
      driverId,
      orderIsActive
    ) => {
      console.debug("let's check this shit");
      driverStateActions.actions.checkDriverStatusInApiAndSetDriverActiveVariable(
        dispatch,
        driverId,
        orderIsActive
      );
    },
    turnDriverOn: (driverId) => {
      console.debug("About to turn driver on");
      try {
        // dispatch(
        driverStateActions.actions.turnDriverOn(dispatch, driverId);
      } catch (error) {
        console.debug(error);
      }
    },
    turnDriverOff: (driverId, timerId) => {
      try {
        driverStateActions.actions.turnDriverOff(dispatch, driverId, timerId);
      } catch (error) {
        console.debug(error);
      }
    },
    //MODALS
    updateModalState: (modalName, modalState) => {
      console.debug("About to update modals");
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState
          )
        );
      } catch (error) {
        console.debug(error);
      }
    },
    //DRIVER ORDER
    checkForNewOrderAndEnableOrderModeIfExists: async (driverId) => {
      try {
        // dispatch(
        return driverStateActions.actions.checkForNewOrderAndEnableOrderModeIfExists(
          dispatch,
          driverId
          // )
        );
      } catch (error) {
        console.debug(error);
        toast(
          "checkForNewOrderAndEnableOrderModeIfExists FAILED:" +
          JSON.stringify(error)
        );
      }
    },
    resetDriverState: () => {
      console.debug("restting driver state");
      dispatch(driverStateActions.actions.resetDriverState(dispatch));
    },
    updateDriverState: async (_driverActive, _orderIsActive) => {
      console.debug("driver active:" + _driverActive + " " + _orderIsActive);
      let activeDriverState = {
        driverActive: _driverActive,
        orderIsActive: _orderIsActive,
      };
      dispatch(
        driverStateActions.actions.updateDriverState(
          dispatch,
          activeDriverState
        )
      );
    },
    getMyPosition: async (relationGuid, urlToPostTo) => {
      console.debug("RelationGuid:" + relationGuid + " " + urlToPostTo);
      dispatch(locationActions.actions.getCurrentLocation(dispatch, relationGuid, urlToPostTo));
    },
    startLocationWatch: async () =>
      dispatch(actions.startLocationWatch(dispatch)),
    startLocationWatchAndApiLocationPush: async (
      relationGuid,
      urlToPostTo,
      locationWatchId
    ) => {
      dispatch(
        locationActions.actions.startLocationWatchWithApiLocationPush(
          dispatch,
          relationGuid,
          urlToPostTo,
          locationWatchId
        )
      );
    },
    endLocationWatchWithApiLocationPush: async (locationWatchId) => {
      dispatch(
        locationActions.actions.endLocationWatchWithApiLocationPush(dispatch, locationWatchId)
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(DriverHome));
