import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Picker,
  Vibration,
  WebView,
  NativeModules,
} from "react-native";
import {
  Button,
  ShopButton,
  CashOutModal,
  PermissionsList,
  InboundPermissionsModal,
  DriverProfileModal
} from "@components";
import RandomMarkerHelper from "../../helper/RandomMarkerHelper"
import { List, ListItem, Header, Icon, Divider } from "react-native-elements";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config
} from "@common";
import { Images } from "@common";
import { toast } from "@app/Omni";
import { connect } from "react-redux";
import HopprWorker from "../../services/HopprWorker";
import GeoWorker from "../../services/GeoWorker";
import MapWorker from "../../services/MapWorker";
import { showMessage, hideMessage } from "react-native-flash-message";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import SwitchToggle from "react-native-switch-toggle";
import SoundPlayer from "react-native-sound-player";
import { getDistance } from "geolib";
//models for requests
import OrderRequest from "../../apiModels/orderRequest/OrderRequest";
import LocationRequest from "../../apiModels/orderRequest/LocationRequest";
import ItemRequest from "../../apiModels/orderRequest/ItemRequest";
import AppOrderRequest from "../../apiModels/orderRequest/AppOrderRequest";
import ItineraryAppOrderRequest from "../../apiModels/orderRequest/ItineraryAppOrderRequest";
import SvgUri from "react-native-svg-uri";
import LayoutHelper from "../../services/LayoutHelper";
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { clearIntervalAsync } from 'set-interval-async';

import RNPickerSelect from "react-native-picker-select";
import { img } from "../../../changed_modules/react-native-render-html/src/HTMLRenderers";
import { EventRegister } from "react-native-event-listeners";

//other device
// const { PlatformConstants } = NativeModules;
// const deviceType = PlatformConstants.interfaceIdiom;

//SETUPS VARS
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE = 51.5397824;
const LONGITUDE = -0.1435601;
const LATITUDE_DELTA = 0.105;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

//STYLES
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  //TABS
  tabView: {
    minHeight: height / 5,
    marginTop: 3,
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
    color: "rgba(255,153,153,0.2)",
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
    flex: 0.32,
    backgroundColor: "rgba(255,153,153,0.2)",
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

/**Sets default state for new order */
getDefaultNewOrder = () => {
  return {
    assignedItinierary: undefined, //gets assigned when you click on icon
    assignedItineraryDestination: undefined, //the destination in the itinerary
    assignedDriver: undefined, //BI driver model
    assignedStore: undefined, //full store from itin
  };
};

const getDefaultState = () => {
  return {
    fullDriverModalOpenClosed: false,
    selectedDriver: undefined,

    driverItineraries_ItinerariesOnToggle: false, //shows drivers or itins to assign to new order - defaul is drivers
    networkStores: [], //stores
    networkDrivers: [], //drivers
    filteredInboundDrivers: [],
    filteredOnlineDrivers: [],
    filteredAllOtherStatusDrivers: [],
    //store fields for selected store
    selectedStore: undefined,
    selectedStoreId: undefined,
    currentStoreName: "None",
    currentStoreAddress: "Nowhere",
    filteredInboundDriversJustMyStore: [],
    //itineraries state
    entireNetworkOrderItineries: [], //entire network itineraries
    activeOrderItineriesForStore: [], //all itineraries for the store you just picked
    destinationsForStore: [], //all destination for the store you just picked
    currentDestinations: [], //this is postcodes / gecocoded addresses for store's destinations
    onlineDriverPostcodesAndIds: [],
    //this is for building the order request from
    newOrder: getDefaultNewOrder(),
    MaxKMToSearchItineraryDestination: 10,
    refreshAllTimerTimerId: -1,

    driverImageRender: true,
    tabIndex: 1,

    daMapHeight: 330,
    iconSize: 50,
    textSize: 8,
    iconRowSize: 100,
    iconPadding: 6,
  };
};

class OrderLogisticsCreate extends Component {
  constructor(props) {
    super(props);

    this.hasLoaded = false;
    this.state = getDefaultState();
    console.debug("In OrderLogistics home");
  }

  /**Sets to default */
  _wipeNewOrderDriver = () => {
    let existing = this.state.newOrder;
    existing.assignedDriver = undefined;
    this.setState({ newOrder: existing });
  };

  _wipeNewOrderIntinerary = () => {
    let existing = this.state.newOrder;
    existing.assignedItinierary = undefined;
    this.setState({ newOrder: existing });
  };

  _wipeNewOrderStore = () => {
    let existing = this.state.newOrder;
    existing.assignedStore = undefined;
    existing.assignedItineraryDestination = undefined;
    this.setState({ newOrder: existing });
  };

  //assigns just itin w / no destination
  //this also assigns the store OF that itinerary
  _assignThisItinieraryAsNewOrderItinierary = (itin) => {
    //CHECK IF DESTINATION ASSIGNED
    let orderDest = this.props.orderDestinationLatLng;
    if (
      typeof orderDest === "undefined" ||
      Object.keys(orderDest).length == 0
    ) {
      alert("There is no order destination. Assign one first.");
      return;
    }

    let existing = this.state.newOrder;
    existing.assignedItinierary = itin;

    this.setState({ newOrder: existing });
    toast("New itinierary assigned!");    
    //assign store from itin
    this._assignThisStoreForNewOrder(itin.store);

    showMessage({
      message: "Itinerary Assigned To Order",
      autoHide: true,
      duration: 2000,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
       "Your selected itinerary was assigned.",
      backgroundColor: "hotpink", // background color
      color: "white", // text color
    });
  };

  _getFullDriver_SetState_ShowModal = async (driverGuid) => {
    try {
      console.debug("");
      let newDriverResponse = await HopprWorker.getDriver(driverGuid);

      if (newDriverResponse.status == 200) {
        this.setState({ selectedDriver: newDriverResponse.data.value[0] });
        //this.closeTabViewModal();
        this._openFullDriverModal();
      }
      else {
        alert("Ahh that didn't work!")
      }

    } catch (error) {
      alert("Ahh that didn't work!")
    }
  }

  _closeFullDriverModal = () => {
    this.setState({ fullDriverModalOpenClosed: false })
  }

  _openFullDriverModal = () => {
    this.setState({ fullDriverModalOpenClosed: true });
  }

  _renderFullDriverDisplayModal = () => {
    //  if (typeof this.state.selectedDriver !== "undefined") {
    return (
      <DriverProfileModal
        closeMe={this._closeFullDriverModal}
        openClosed={this.state.fullDriverModalOpenClosed}
        ref={"fullDriverDisplayModal"}
        driver={this.state.selectedDriver}
      />);
    //  }
  }

  _assignThisStoreForNewOrder = (store) => {
    let existing = this.state.newOrder;
    existing.assignedStore = store;
    this.setState({ newOrder: existing });
    toast("New store assigned!");
  };

  //assigns jsut driver
  _assignThisDriverForNewOrder = (driver) => {
    let existing = this.state.newOrder;
    existing.assignedDriver = driver;
    this.setState({ newOrder: existing });
    toast("New driver assigned!");

    showMessage({
      message: "Driver Assigned To Order",
      autoHide: true,
      duration: 900,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
       "Your selected driver was assigned.",
      backgroundColor: "red", // background color
      color: "white", // text color
    });
  };

  _resetNewOrder = () => {
    let current = this.state.newOrder;
    this.setState({ newOrder: getDefaultNewOrder(), currentStoreAddress:"Nowhere" });
    toast("Order reset");
  };


  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = (user) => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        // return true;
        if (user.user.roles.find((x) => x === "Logistics")) {
          //we are allowed
          return true;
        }
      }
    }

    const { navigation } = this.props;
    this.props.navigation.pop();
    this.props.navigation.navigate("LoginScreen");

    alert(
      "You are not in the correct role, or not logged in. Please register to become a logistics manager!!"
    );

    return false;
  };

  /**when page is entered */
  load = async () => {
    if(!this.hasLoaded)
    {
      this.hasLoaded = true;
    try {
      
    EventRegister.emit("showSpinner");    
    const Device = require("react-native-device-detection");

    if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)) {

    var heightResult = this._getMapHeight();
    let isTabletResult = LayoutHelper.isTabletOrPhone(
      Device.pixelDensity,
      height,
      width
    );

    let iconSize = isTabletResult === "TABLET" ? 90 : 50;
    let iconPadding = isTabletResult === "TABLET" ? 12 : 6;
    let iconRowSize = isTabletResult === "TABLET" ? 140 : 100;
    let iconTextSize = isTabletResult === "TABLET" ? 13 : 8;
    let daMapHeight = isTabletResult === "TABLET" ? 330 : 330;

    this.setState({
      daMapHeight: daMapHeight,
      iconSize: iconSize,
      iconTextSize: iconTextSize,
      iconRowSize: iconRowSize,
      iconPadding: iconPadding,
    });

    await MapWorker.requestLocationPermission();
    //get all drivers / stores etc if we've got an order
    console.debug("in loistics create load");
    if (typeof this.props.filteredNetworkId !== "undefined") {
      await this._getActiveStoresForNetwork(this.props.filteredNetworkId);      
      await this._getActiveDriversForNetwork(this.props.filteredNetworkId);
      let itins = await this._getFullNetworkOrderItinaries(
        this.props.filteredNetworkId
      );

      //auta
      try {
      this._autoAssignStore();  
      } catch (error) {
        
      }
   
      if (this.state.driverItineraries_ItinerariesOnToggle == false)
      this._onDriverItinerarySwitchToggle();

 //     set the toggle based on if there were any itiniraries
      // if (itins.length == 0) {
      //   if (this.state.driverItineraries_ItinerariesOnToggle == false)
      //     this._onDriverItinerarySwitchToggle();
      // }
    } else {
      toast(
        "There was an error: Couldn't find filtered networkId to get stores and drivers"
      );

    }

    let refreshAllTimerId = setIntervalAsync(async () => {
      if (typeof this.props.filteredNetworkId !== "undefined") {
        try {
          this._getFullNetworkOrderItinaries(this.props.filteredNetworkId);
          this._getActiveStoresForNetwork(this.props.filteredNetworkId, true);
          this._getActiveDriversForNetwork(this.props.filteredNetworkId);
        } catch (error) {
          toast("There was an error getting data - retrying: " + error);
        }
      }
    }, 30000);
    this.setState({ refreshAllTimerId: refreshAllTimerId }); 
     }
    }        
    catch (error) {
          alert("Sorry, that didn't load correctly. Try again.")
    }
    finally{
      EventRegister.emit("hideSpinner");
      EventRegister.emit("savePingerStateAndCorner");
    }    
   }
  };

  unload = async () => {
    //clear timer

    clearIntervalAsync(this.state.refreshAllTimerId);
    //clear state
    this.setState(getDefaultState());
    toast("UNLOADED CREATE VIEW");
    this.hasLoaded = false;
    EventRegister.emit("returnPingersToPreviousState");
  };

  componentWillUnmount = () => {
    try {
      this.unload();
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      console.debug("component didn't ummount propery");
    }    
  }

  componentDidMount = async () => {
    console.debug("in logistics home");
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);    
    this.unsubscribeLoseFocus =this.props.navigation.addListener("willBlur", this.unload);

    await this.load();
    

    showMessage({
      message: "This is the logistics itinerary creation view",
      autoHide: true,
      duration: 6000,
      position: "bottom",
      description: "Create orders for your stores and assign them to drivers!",
      backgroundColor: "hotpink", // background color
      color: "white", // text color
    });
  };

  _renderControlsModal = () => {

    let textColor = this._getModeTextColor();

    return (
      <Modal
        style={{
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: textColor,
          width: width - 8,
          height: height - 40,          
        }}
        backdrop={true}
        position={"center"}
        swipeToClose={true}
        backdropPressToClose={true}
        onClosed={() => {
          () => this.refs.controlsModal.close()
        }}
        ref={"controlsModal"}
      >
        <Header
          backgroundColor={textColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          centerComponent={{
            text: "Controls",
            style: { color: "#fff" },
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.refs.controlsModal.close(),
          }}
        />
         <View style={{ flex: 1, 
         borderBottomRightRadius:20, 
          borderBottomLeftRadius:20,             
          overflow:"hidden" }}>
          {this._renderTabHeaders()}
          {this._renderTabView()}
        </View>
      </Modal>
    )
  }

  _renderSecondIconForAutoAssignItinerary = (shouldShow,
    imagePadding, imageSize, textSize) => {
    if (shouldShow) {
      return (
        <View style={{ padding: imagePadding }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH LOCATION  MODAL */}
            <TouchableOpacity
              onPress={() => this._autoAssignItineraryJustThisStore()}
            >
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: imageSize,
                  height: imageSize,
                  width: imageSize,
                }}
                source={Images.MapPin3}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: textSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Auto assign\n selected store"}
          </Text>
        </View>
      )
    } else return null;
  }

  _renderAutoAssignDriverOrItinerary = (imageSize, imagePadding, textSize, shouldShowSecondIcon = true) => {
    //driver auto assign
    if (this.state.driverItineraries_ItinerariesOnToggle) {
      return (
        <View style={{ padding: imagePadding }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH LOCATION  MODAL */}
            <TouchableOpacity onPress={() => this._autoAssignDriver()}>
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: imageSize,
                  height: imageSize,
                  width: imageSize,
                }}
                source={Images.DeliveryDriver5}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: textSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Auto assign\n driver"}
          </Text>
        </View>
      );
    } else {
      //itinerary auto assign
      return (
        <View style={{ flexDirection: "row" }}>
          <View style={{ padding: imagePadding }}>
            {/* LOCATION MODAL BUTTON */}
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                margin: 3,
                paddingTop: 3,
                paddingBottom: 3,
              }}
            >
              {/* LAUNCH LOCATION  MODAL */}
              <TouchableOpacity onPress={() => this._autoAssignItinerary()}>
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 0,
                    maxHeight: imageSize,
                    height: imageSize,
                    width: imageSize,
                  }}
                  source={Images.MapPin3}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontSize: textSize,
                fontStyle: "italic",
                color: "grey",
              }}
            >
              {"Auto assign\n entire network"}
            </Text>
          </View>
          {this._renderSecondIconForAutoAssignItinerary(shouldShowSecondIcon, imagePadding, imageSize, textSize)}
        </View>
      );
    }
  };

  _renderStoreMarker = () => {

    if (typeof this.state.selectedStore !== "undefined") {
      return (
        <Marker
          coordinate={{
            latitude: this.state.selectedStore.location.lat,
            longitude: this.state.selectedStore.location.long,
          }}
          //image={Images.MapIconStore8}
          //description={"Selected Store"}
          title={"Selected Store"}
        >
          <Image
            source={Images.MapIconStore8}
            style={{ width: 50, height: 50, zIndex:101 }}
          />
        </Marker>
      );
    }
  };

  _renderDestinationMarker = () => {

    let whichMarker = this._getDestinationPickerImage();

    if (
      this.props.orderDestinationLatLng &&
      typeof this.props.orderDestinationLatLng.lat !== "undefined" &&
      this.props.orderDestinationLatLng.lng !== "undefined"
    ) {
      return (
        <Marker
          coordinate={{
            latitude: this.props.orderDestinationLatLng.lat,
            longitude: this.props.orderDestinationLatLng.lng,
          }}
          //image={Images.MapIconStore7b}
          description={"Order Destination"}
          //image={Images.TabDestIcon150px}
          title={this.props.latestPickerDestinationText}
        >
          <Image
            source={whichMarker}
            //source={Images.TabDestIcon150px}
            style={{ width: 60, height: 80,zIndex:102 }}
          />
        </Marker>
      );
    }
  };

  _renderExistingDestinationMarkers = () => {
    console.debug("stop");
    if (typeof this.state.newOrder.assignedItinierary !== "undefined") {
      let testForDest = this.state.newOrder.assignedItinierary;

      this.state.newOrder.assignedItinierary.orderDeliveryDestinations.map(
        (dest) => {
          console.debug(dest);
          //return this._renderExistingDestinationMarker(dest);
        }
      );
    }
  };

  //Only if itinerary selected
  _renderExistingDestinationMarker = (orderDeliveryDestination) => {

    return (
      <Marker
        coordinate={{
          latitude: orderDeliveryDestination.location.lat,
          longitude: orderDeliveryDestination.location.long,
        }}
        //image={Images.MapIconStore7b}
        description={"Order Destination"}
        // image={Images.animatedArrow4}        
        title={"Route Existing Destination"}
      >
        <Image
          source={Images.animatedArrow4}
          style={{ width: 50, maxWidth: 50, height: 50, zIndex:103 }}
        />
      </Marker>
    );
  };

  _renderDriverMarker = () => {
    if (typeof this.state.newOrder.assignedDriver !== "undefined") {
      let whichMarker = RandomMarkerHelper.GetCorrectMarkerForVehicleType(this.state.newOrder.assignedDriver.vehicleType);
      return (
        <Marker
          coordinate={{
            latitude: this.state.newOrder.assignedDriver.location.lat,
            longitude: this.state.newOrder.assignedDriver.location.long,
          }}
          //image={Images.DeliveryDriver3b}
          description={"Assigned Driver"}
          title={
            this.state.newOrder.assignedDriver.firstName + " " +
            this.state.newOrder.assignedDriver.lastName
          }
        >
          <Image
            source={whichMarker}
            style={{ width: 50, maxWidth: 50, height: 50 }}
          />
        </Marker>
      );
    }
  };

  _openAssignDestinationModal = () => {
    this.refs.orderLogisticsDestinationAssignModal.open();
  };

  _closeAssignDestinationModal = () => {
    this.refs.orderLogisticsDestinationAssignModal.close();
  };

  _renderAssignDestinationModal = () => {
    return (
      <Modal
        style={{ height: 510 }}
        backdrop={true}
        position={"center"}
        ref={"orderLogisticsDestinationAssignModal"}
      >
        <Header
          backgroundColor={modetextColor}
          outerContainerStyles={{ height: 49 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this._closeAssignDestinationModal(),
          }}
          centerComponent={{
            text: "Assign Order Destination",
            style: { color: "#fff" },
          }}
        />
        {/* {this._renderDestinationFlatlist()} */}
      </Modal>
    );
  };

  _renderTickOrCross = () => {
      let imgURl = Images.NoDelivery1;

      if (typeof this.state.selectedStore !== "undefined" //store
      && this.props.orderDestinationLatLng && //order
      typeof this.props.orderDestinationLatLng.lat !== "undefined" &&
      this.props.orderDestinationLatLng.lng !== "undefined"
      && typeof this.state.newOrder.assignedDriver !== "undefined" //driver
    ) {
      imgURl = Images.Tick1;
      return <Image source={imgURl} style={{ minHeight: 60, maxHeight: 60, maxWidth: 60, minWidth: 60 }} />
    }
  }

  //device detection
  _getMapHeight = () => {
    const Device = require("react-native-device-detection");

    let mainMapHeight = 130;
    let he = height;
    let wi = width;

    if (Device.pixelDensity <= 2) {
      if (height > 900) {
        toast("This is a tablet");
        if (width > height) {
          mainMapHeight = 180;
          toast("In landscape mode");
        } else {
          mainMapHeight = 250;
          toast("In portrait mode");
        }
      } else {
        //phone, forget it
        toast("This is not a tablet");
      }
    } else {
      toast("This is not a tablet");
    }

    return mainMapHeight;
  };

  _renderMapView = () => {
    let modeColor = this._getModeTextColor();
    if (
      this.props.orderDestinationLatLng &&
      typeof this.props.orderDestinationLatLng.lat !== "undefined" &&
      this.props.orderDestinationLatLng.lng !== "undefined"
    ) {
      return (
        <View
          style={{
            flex: 1,
            borderColor: "blue",
            // minHeight: this.state.daMapHeight,
            // maxHeight: this.state.daMapHeight,
            // height: this.state.daMapHeight,
            borderWidth: 1,
            paddingLeft: 4,
            paddingRight: 4,
            marginLeft: 4,
            marginRight: 4,
            borderColor: modeColor,
            borderRadius: 15,
            marginBottom: 10,
            overflow: "hidden",
          }}
        >
          <MapView
            ref={(el) => (this._mapView1 = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{ ...StyleSheet.absoluteFillObject }}
            initialRegion={{
              latitude: this.props.orderDestinationLatLng.lat,
              longitude: this.props.orderDestinationLatLng.lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            customMapStyle={Config.MapThemes.SecondaryMapTheme}
          >
            {this._renderDestinationMarker()}
            {this._renderStoreMarker()}
            {this._renderDriverMarker()}

            {this._renderExistingDestinationMarkers()}
            {this.displayMarkerLines()}
          </MapView>
          {/* WHICH MODE */}
          {this._renderWhichModeText()}

{/* TICK */}
          <View
              style={{
                position: 'absolute',//use absolute position to show button on top of the map
                //top: '100%', //for center align
                top: '1%',
                left:'1%',
                //alignSelf: 'flex-end', //for align to right                                
                paddingRight: 3,
                marginRight: 3
              }}
            >
              {this._renderTickOrCross()}
            </View>

          {/* BUTTON */}
          <View
            style={{
              marginTop: 0,
              paddingTop: 0,
              position: "absolute", //use absolute position to show button on top of the map
              //top: '100%', //for center align
              bottom: "1%",
              right: 3,
              //alignSelf: "flex-end", //for align to right                  
            }}
          >

            {/* DO ROW FOR BUTTONS */}
            <View style={{
              flexDirection: "row",
              alignContent: "flex-end",
              justifyContent: "flex-end",
            }}>


              {/* BUTTON 1 */}
              <View style={{ marginTop: 20 }}>
                {this._renderAutoAssignDriverOrItinerary(50, 4, this.state.iconTextSize, false)}
              </View>
              {/* BUTTON 2 */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  paddingTop: 3,
                  paddingRight: 8,
                  marginTop: 25,
                  paddingBottom: 2,
                  marginBottom: 2,
                }}
              >
                {/* CONTROLS */}
                <TouchableOpacity onPress={() => this._autoAssignStore()}>
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: 50,
                      height: 50,
                      width: 50,
                    }}
                    source={Images.MapIconStore12}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    paddingTop: 8,
                    textAlign: "center",
                    fontSize: this.state.iconTextSize,
                    fontStyle: "italic",
                    color: "grey",
                  }}
                >
                  {"Auto assign\n nearest store"}
                </Text>
              </View>
              {/* BUTTON 3 */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  paddingTop: 3,
                  paddingBottom: 2,
                  marginBottom: 2,
                }}
              >
                {/* CONTROLS */}
                <TouchableOpacity onPress={() => this.refs.controlsModal.open()}>
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: 90,
                      height: 90,
                      width: 90,
                    }}
                    source={Images.Settings3}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    paddingTop: 3,
                    textAlign: "center",
                    fontSize: this.state.iconTextSize,
                    fontStyle: "italic",
                    color: "grey",
                  }}
                >
                  {"Show Controls"}
                </Text>
              </View>


            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "lightblue",
            borderRadius: 15,
            overflow: "hidden",
          }}
        >
          <MapView
            customMapStyle={Config.MapThemes.SecondaryMapTheme}
            ref={(el) => (this._mapView1 = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{ ...StyleSheet.absoluteFillObject }}
            region={{
              latitude: 51.5407134,
              longitude: -0.1676347,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          />
        </View>
      );
    }
  };

  /** this gets ALL orders on the nework now! */
  _getFullNetworkOrderItinaries = async (networkId) => {
    let inboundActive = await HopprWorker.getOrderItineraryByNetwork(networkId);
    this.setState({ entireNetworkOrderItineries: inboundActive });

    //generate postcodes from destinations
    let allDestinationsFOrThisStore = [];
    inboundActive.map((eachItin) => {
      eachItin.orderDeliveryDestinations.map((eachDest) => {
        allDestinationsFOrThisStore.push(eachDest);
      });
    });
    await this._getAddressesForDeliveryDestinations(
      allDestinationsFOrThisStore
    );

    return inboundActive;
  };

  /**This gets BI stores, not full models */
  _getActiveStoresForNetwork = async (
    selectedNetId,
    dontRefreshPicker = false
  ) => {
    console.debug("test");
    let biStores = await HopprWorker.getBIStores(selectedNetId);
    if(biStores.length == 0)
    {
      //can't work wihtou stores!!!
      alert("Sorry, there are no stores online to process that order!! Please enable one first!");
      this.props.navigation.goBack();
    }
    
    this.setState({ networkStores: biStores });

    //if there's a first store, set it as default

    if (!dontRefreshPicker) {
      if (biStores.length > 0) {
        this.setState({ selectedStoreId: biStores[0]._id });
        this._changeStorePickerValue(biStores[0]._id);
      }
    }
  };

  /**This gets BI model, not full model */
  _getActiveDriversForNetwork = async (selectedNetId) => {
    console.debug("test");
    let biDrivers = await HopprWorker.getBIDrivers(selectedNetId);

    //filter into groups needed
    let inboundDrivers = biDrivers.filter(
      (x) => x.state == "ON_DELIVERY_ORDER_PICKUP"
    );
    let otherDrivers = biDrivers.filter(
      (x) => x.state != "ON_DELIVERY_ORDER_PICKUP"
    );
    let onlineDrivers = biDrivers.filter((x) => x.state == "ONLINE");

    //do postcodes
    await this._getCurrentAddressesForOnlineDrivers(onlineDrivers);

    this.setState({
      networkDrivers: biDrivers,
      filteredInboundDrivers: inboundDrivers,
      filteredOnlineDrivers: onlineDrivers,
      filteredAllOtherStatusDrivers: otherDrivers,
    });
  };

  _onDriverItinerarySwitchToggle = () => {
    let newVal =
      this.state.driverItineraries_ItinerariesOnToggle == true ? false : true;
    this.setState({ driverItineraries_ItinerariesOnToggle: newVal });
    SoundPlayer.playSoundFile("notification6", "mp3");
    Vibration.vibrate(500);
    toast("Toggled");
  };

  _renderStorePickerRow = () => {
    if (
      typeof this.state.networkStores != "undefined" &&
      this.state.networkStores.length > 0 &&
      typeof this.state.selectedStoreId !== "undefined"
    ) {    

      const itemsForPicker = this.state.networkStores.map((item) => ({
        label: item.markerDescription,
        value: item._id
      }));

      let modetextColor = this._getModeTextColor();
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 3,
            padding: 4,
            paddingBottom: 0,
            margin: 5,
            justifyContent:"center",
            alignContent:"center",
            marginBottom: 0,
            borderColor: modetextColor,
            borderRadius: 20,
            maxHeight: 50,
            minHeight: 50,
            height: 50,
          }}
        >

          <RNPickerSelect
           useNativeAndroidPickerStyle={false}
            placeholder={{
              label: "Select Store",
              value: -1,
            }}
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: "orange",
              height: 20,
              alignItems: "center",
              inputIOS: {
                textAlign: "center",
                color: "silver"
              },
              inputAndroid: {
                textAlign: "center",
                color: "silver"
              },
            }}
            inputStyle={{
              textAlign: "center",
              color: "silver"
            }}
            onValueChange={(itemValue, itemIndex) => {
              console.debug("lets do it");
              this._changeStorePickerValue(itemValue);
            }}
            value={this.state.selectedStoreId}
            items={itemsForPicker}
          />


          {/* <Picker
            style={{
              // alignSelf: "flex-end",
              // justifyContent: "center",
              flex: 1,
              margin: 2,
              paddingLeft: 18,
              borderWidth: 2,
              borderRadius: 15,
              borderColor: "orange",
              color: "black",
              maxHeight: 50,
              height: 50,
              // width: undefined,
              color: "black",
            }}
            mode="dropdown"
            selectedValue={this.state.selectedStoreId}
            onValueChange={(itemValue, itemIndex) => {
              console.debug("lets do it");
              this._changeStorePickerValue(itemValue);
            }}
          >
            {this.state.networkStores.map((item, index) => {
              return (
                <Picker.Item
                  label={item.markerDescription}
                  value={item._id}
                  key={index}
                />
              );
            })}
          </Picker> */}



          
        </View>
      );
    }
  };

  _changeStorePickerValue = async (itemValue, wipeStoreAndDriver = true) => {
    console.debug("stop");
    if (typeof itemValue !== "undefined") {
      let selStore = this.state.networkStores.find((x) => x._id == itemValue);
      this.setState({
        selectedStore: selStore,
        selectedStoreId: itemValue,
      });

      //set current store address
      let currentStoreAddress = await GeoWorker.reverseGeocode(
        selStore.location.lat,
        selStore.location.long
      );

      console.debug("deon");

      //do filtering now to split the whole network orders for the store
      //itemValue
      let filteredItineraries = this.state.entireNetworkOrderItineries.filter(
        (x) => x.storeId == itemValue
      );
      this.setState({
        currentStoreName: selStore.markerDescription,
        currentStoreAddress: currentStoreAddress.formattedAddress,
        activeOrderItineriesForStore: filteredItineraries,
      });

      //get all destinations so they can be used to assign drivers / locations
      let allDestinationsFOrThisStore = [];
      filteredItineraries.map((eachItin) => {
        eachItin.orderDeliveryDestinations.map((eachDest) => {
          allDestinationsFOrThisStore.push(eachDest);
        });
      });
      this.setState({
        destinationsForStore: allDestinationsFOrThisStore,
      });

      //filter drivers to just the ones in the stores itinerary
      let newFilteredDriversInboundForStore = [];
      filteredItineraries.map((eachInin) => {
        eachInin.orderDeliveryDestinations.map((eachDest) => {
          console.debug("checking driver");
          //try and match driver Id
          let datDriver = this.state.networkDrivers.find(
            (x) => x._id == eachDest.assignedDriverId
          );
          console.debug("got driver");
          //now check if it's in array if not add him
          if (!newFilteredDriversInboundForStore.includes(datDriver)) {
            newFilteredDriversInboundForStore.push(datDriver);
          }
        });
      });

      this.setState({
        filteredInboundDriversJustMyStore: newFilteredDriversInboundForStore,
      });

      //get addresses for filtered
      console.debug("test");
      await this._getAddressesForDeliveryDestinations(
        allDestinationsFOrThisStore
      );

      // //wipe any itinerary cos we changed stores
      // this._wipeNewOrderDriver();
      // //wipe and driver cos we changed store
      // this._wipeNewOrderIntinerary();
      //assign this store as new selected stoer
      this._assignThisStoreForNewOrder(selStore);

      if (wipeStoreAndDriver) {
        this._wipeNewOrderDriver();
        this._wipeNewOrderIntinerary();
      }
    }
  };

  _getCurrentAddressesForOnlineDrivers = async (arrayOfDrivers) => {
    let postcodesAndIds = [];
    for (const dri of arrayOfDrivers) {
      console.debug("stop");
      let thisAddress = await GeoWorker.reverseGeocode(
        dri.location.lat,
        dri.location.long
      );

      let pushedAd = "";
      let pushedPostcode = "";
      if (typeof thisAddress !== "undefined") {
        pushedAd = thisAddress.formattedAddress;
        pushedPostcode = thisAddress.postalCode;
      }

      postcodesAndIds.push({
        _id: dri._id,
        formattedAddress: pushedAd,
        postcode: pushedPostcode,
      });

      this.setState({ onlineDriverPostcodesAndIds: postcodesAndIds });
      console.debug("pushed");
    }
  };

  _getAddressesForDeliveryDestinations = async (arrayOfDestination) => {
    console.debug("_getAddressesForDeliveryDestinations");
    let postcodesAndIds = [];
    for (const dest of arrayOfDestination) {
      try {
        let thisAddress = await GeoWorker.reverseGeocode(
          dest.location.lat,
          dest.location.long
        );

        postcodesAndIds.push({
          _id: dest._id,
          orderDeliveryItineraryId: dest.orderDeliveryItineraryId,
          driverId: dest.assignedDriverId,
          formattedAddress: thisAddress.formattedAddress,
          postcode: thisAddress.postalCode,
        });
        console.debug("pushed");
      } catch (error) {
        console.debug(error);
      }
    }

    console.debug("Shouldn't get here until completed");
    this.setState({ currentDestinations: postcodesAndIds });
  };

  /**This sets the state (like Loction modal) of current order delivery destination */
  _assignDestinationAsCurrentOrderDestination = async (item) => {
    try {
      let theId = item._id;
      let postcodeEtc = this.state.currentDestinations.filter(
        (x) => x._id == item._id
      )[0];
      console.debug("got destination and address");

      //get the destination + full address

      //send them to redux - will update state
      let latLng = { lat: item.location.lat, lng: item.location.long };
      let fullAddress = postcodeEtc.formattedAddress;
      this.props.pushCurrentPickerLocationAsOrderDestination(
        latLng,
        fullAddress
      );
      this._closeAssignDestinationModal();

      this._wipeNewOrderDriver();
      this._wipeNewOrderIntinerary();
      this._wipeNewOrderStore();

      toast("New destination assigned!");
    } catch (error) {
      alert(
        "We couldn't assign the delivery destination. Leave and reload the screen, and make sure you have internet."
      );
    }
  };

  _renderAssignedStoreRow = () => {
    if (typeof this.state.newOrder.assignedStore !== "undefined") {
      let storeName = "";
      if (typeof this.state.newOrder.assignedStore.storeName === "undefined") {
        storeName = this.state.newOrder.assignedStore.markerDescription;
      } else {
        storeName = this.state.newOrder.assignedStore.storeName;
      }

      return (
        <View style={{ flexDirection: "row", padding: 5 }}>
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={Images.MapIconStore5}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "black",
              fontSize: 15,
            }}
          >
            {"Store Assigned: " + storeName}
          </Text>
        </View>
      );
    }

    return null;
  };

  _renderAssignedDriverRow = () => {
    if (typeof this.state.newOrder.assignedDriver !== "undefined") {
      return (
        <View style={{ flexDirection: "row", padding: 5 }}>
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={Images.DeliveryDriver2}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "black",
              fontSize: 15,
            }}
          >
            {"Driver Assigned: " +
              this.state.newOrder.assignedDriver.firstName +
              " " +
              this.state.newOrder.assignedDriver.lastName}
          </Text>
        </View>
      );
    }

    return null;
  };

  _renderAssignedItineraryRow = () => {
    if (typeof this.state.newOrder.assignedItinierary !== "undefined") {
      return (
        <View
          style={{
            flexDirection: "row",
            padding: 5,
          }}
        >
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={Images.DeliveryDestination1}
            resizeMode="contain"
          />
          <View style={{ padding: 5 }}>
            <Text style={{ color: "black", fontSize: 15 }}>
              {"Intinerary Assigned: " +
                this.state.newOrder.assignedItinierary._id.substring(0, 4)}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  /**creates the base payload which is then amended by the calling method, and send */
  _createBaseLogisticsOrderRequest = (lat, lng) => {
    if (this.props.filteredNetworkCartItems < 1) {
      toast("You dont' have any items in your basket");
    } else {
      let dest = new LocationRequest(lat, lng);
      let itemsReq = new Array();

      this.props.filteredNetworkCartItems.map((x) => {
        itemsReq.push(new ItemRequest(x.product._id, x.quantity));
      });

      let request = new OrderRequest(
        this.props.filteredNetworkId,
        this.props.user.user.customerId,
        dest,
        itemsReq
      );

      let payload = new AppOrderRequest(request, dest);

      return payload;
    }
  };

  _renderSwitchToggle = () => {
    return (
      <View
        style={{
          marginTop: 10,
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SwitchToggle
          backgroundColorOff={"#ff7cb9"}
          backgroundColorOn={"#df4d60"}
          containerStyle={{
            width: 75,
            height: 38,
            borderRadius: 25,
            backgroundColor: "#E50808",
            backgroundColorOn: "#E50808",
            backgroundColorOff: "#E50808",
            padding: 5,
          }}
          circleStyle={{
            width: 28,
            height: 28,
            borderRadius: 19,
            backgroundColor: "white", // rgb(102,134,205)
          }}
          switchOn={this.state.driverItineraries_ItinerariesOnToggle}
          onPress={() => this._onDriverItinerarySwitchToggle()}
          circleColorOff="white"
          circleColorOn="white"
          duration={100}
        />
        <View style={{ paddingTop: 14 }}>
          <Text
            style={{
              fontStyle: "italic",
              color: "grey",
              fontSize: 9,
              textAlign: "center",
            }}
          >
            {"Driver / Existing Order\n Assign"}
          </Text>
        </View>
      </View>
    );
  };

  _renderFirstIconRow = () => {

    let whichGoImg = this._getWhichGoImage();

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          height: this.state.iconRowSize,
          minHeight: this.state.iconRowSize,
        }}
      >
        <View style={{ padding: 6 }}>
          {/* DESTINATIONS BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH DESTINATIONS MODAL */}
            <TouchableOpacity
              onPress={() => this._openAssignDestinationModal()}
            >
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: this.state.iconSize,
                  height: this.state.iconSize,
                  width: this.state.iconSize,
                }}
                source={Images.DeliveryDestination2}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: this.state.iconTextSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Assign destination\n from existing"}
          </Text>
        </View>

        {/* {this._renderSwitchToggle()} */}

        <View style={{ padding: 6 }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH LOCATION  MODAL */}
            <TouchableOpacity onPress={() => this._resetNewOrder()}>
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: this.state.iconSize,
                  height: this.state.iconSize,
                  width: this.state.iconSize,
                }}
                source={Images.Reset1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: this.state.iconTextSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Reset Order"}
          </Text>
        </View>

        <View style={{ padding: 6 }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 2,
              marginBottom: 2,
            }}
          >
            {/* CREATE ORDER */}
            <TouchableOpacity onPress={() => this._createOrderRequest()}>
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: this.state.iconSize,
                  height: this.state.iconSize,
                  width: this.state.iconSize,
                }}
                source={whichGoImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: this.state.iconTextSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Create Order"}
          </Text>
        </View>
      </View>
    );
  };

  _renderSecondIconRow = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          height: this.state.iconRowSize,
          minHeight: this.state.iconRowSize,
        }}
      >
        <View style={{ padding: 6 }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH LOCATION  MODAL */}
            <TouchableOpacity
              onPress={() => {
                this.props.updateModalState("locationPickerModal", true);
                this._wipeNewOrderDriver();
                this._wipeNewOrderStore();
                this._wipeNewOrderIntinerary();
              }}
            >
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: this.state.iconSize,
                  height: this.state.iconSize,
                  width: this.state.iconSize,
                }}
                source={Images.MapPin1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: this.state.iconTextSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Assign destination\n manually"}
          </Text>
        </View>

        <View style={{ padding: 6 }}>
          {/* LOCATION MODAL BUTTON */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              margin: 3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            {/* LAUNCH LOCATION  MODAL */}
            <TouchableOpacity onPress={() => this._autoAssignStore()}>
              <Image
                style={{
                  alignSelf: "center",
                  margin: 0,
                  maxHeight: this.state.iconSize,
                  height: this.state.iconSize,
                  width: this.state.iconSize,
                }}
                source={Images.MapIconStore8}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: this.state.iconTextSize,
              fontStyle: "italic",
              color: "grey",
            }}
          >
            {"Auto assign\n nearest store"}
          </Text>
        </View>

        {this._renderAutoAssignDriverOrItinerary(this.state.iconSize, this.state.iconPadding, this.state.iconTextSize)}
      </View>
    );
  };

  /**Takes in itinerary destination */
  _renderDestinationListViewRow = ({ item }) => {
    console.debug("in listview");

    let postcodeEtc = this.state.currentDestinations.filter(
      (x) => x._id == item._id
    );
    console.debug("got destination and address");

    return (
      <ListItem
        leftIconOnPress={() => toast("Pressed left icon")}
        titleNumberOfLines={2}
        subtitleNumberOfLines={4}
        title={postcodeEtc[0].postcode}
        subtitle={postcodeEtc[0].formattedAddress}
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 90,
              height: 90,
              width: 90,
              maxWidth: 90,
              padding: 5,
              //   width: undefined
            }}
            source={Images.DeliveryDestination2}
            resizeMode="contain"
          />
        }
        hideChevron={false}
        onPress={async () =>
          await this._assignDestinationAsCurrentOrderDestination(item)
        }
        onLongPress={async () =>
          await this._assignDestinationAsCurrentOrderDestination(item)
        }
        rightIcon={
          <TouchableOpacity
            onPress={async () => {
              console.debug(item);
              await this._assignDestinationAsCurrentOrderDestination(item);
            }}
          >
            <Image
              style={{
                flex: 1,
                maxHeight: 60,
                height: 60,
                width: 60,
                maxWidth: 60,
                padding: 5,
                //   width: undefined
              }}
              source={Images.DeliveryDestination1}
              resizeMode="contain"
            />
            <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
              {"Assign"}
            </Text>
          </TouchableOpacity>
        }
      />
    );
  };

  /**this takes a full itinerary */
  _renderExistingItinerariesListRow = ({ item }) => {
    console.debug("were here");
    let destStrings = "";
    let driversString = "";

    item.orderDeliveryDestinations.map((delDest) => {
      driversString +=
        delDest.assignedDriver.firstName +
        " " +
        delDest.assignedDriver.lastName +
        " | ";
      let postcodeEtc = this.state.currentDestinations.filter(
        (x) => x._id == delDest._id
      );
      if (typeof postcodeEtc !== "undefined")
        if (postcodeEtc.length > 0) {
          destStrings += postcodeEtc[0].postcode + " | ";
          console.debug("got destination and address");
        }
    });

    //create string for list of postcode / destinations
    return (
      <ListItem
        leftIconOnPress={() => toast("Pressed left icon")}
        titleNumberOfLines={3}
        subtitleNumberOfLines={6}
        title={"Itinerary: #" + item._id.substring(0, 4)}
        subtitle={
          "Going to: " + destStrings + "\n" + "Drivers: " + driversString
        }
        leftIcon={
          <View style={{ padding: 4, paddingRight: 10 }}>
            <Image
              style={{
                flex: 1,
                maxHeight: 70,
                height: 70,
                width: 70,
                maxWidth: 70,
                padding: 5,
                //   width: undefined
              }}
              source={Images.DeliveryDestination3}
              resizeMode="contain"
            />
          </View>
        }
        hideChevron={false}
        onPress={() => toast("Test")}
        onLongPress={() => toast("Test")}
        rightIcon={
          <TouchableOpacity
            onPress={() => this._assignThisItinieraryAsNewOrderItinierary(item)}
          >
            <Image
              style={{
                flex: 1,
                maxHeight: 60,
                height: 60,
                width: 60,
                maxWidth: 60,
                padding: 5,
                //   width: undefined
              }}
              source={Images.DeliveryDestination1}
              resizeMode="contain"
            />
            <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
              {"Assign to itinerary"}
            </Text>
          </TouchableOpacity>
        }
      />
    );
  };

  _renderOnlineDriverListViewRow = ({ item }) => {
    console.debug("were here");

    let driverImg = RandomMarkerHelper.GetCorrectMarkerForVehicleType(item.vehicleType);

    let currentDriverLocation = this.state.onlineDriverPostcodesAndIds.filter(
      (x) => x._id == item._id
    );
    let fullAddy = "Unknown";
    if (typeof currentDriverLocation !== "undefined") {
      if (currentDriverLocation.length > 0)
        fullAddy = currentDriverLocation[0].formattedAddress;
    }

    //create string for list of postcode / destinations
    return (
      <ListItem
        leftIconOnPress={() => toast("Pressed left icon")}
        titleNumberOfLines={2}
        subtitleNumberOfLines={5}
        title={item.firstName + " " + item.lastName}
        subtitle={"Current Location:" + fullAddy}
        leftIcon={
          <View style={{ padding: 4, paddingRight: 10 }}>
            <Image
              style={{
                flex: 1,
                maxHeight: 70,
                height: 70,
                width: 70,
                maxWidth: 70,
                padding: 5,
                //   width: undefined
              }}
              source={driverImg}
              resizeMode="contain"
            />
          </View>
        }
        hideChevron={false}
        onPress={async () => await this._getFullDriver_SetState_ShowModal(item._id)}
        onLongPress={() => this._assignThisDriverForNewOrder(item)}
        rightIcon={
          <TouchableOpacity
            onPress={() => this._assignThisDriverForNewOrder(item)}
          >
            <Image
              style={{
                flex: 1,
                maxHeight: 60,
                height: 60,
                width: 60,
                maxWidth: 60,
                padding: 5,
                //   width: undefined
              }}
              source={Images.DeliveryDestination1}
              resizeMode="contain"
            />
            <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
              {"Assign to new\n order itinerary"}
            </Text>
          </TouchableOpacity>
        }
      />
    );
  };

  _renderExistingItinerariesFlatlist = () => {
    if (this.state.entireNetworkOrderItineries.length > 0) {
      return (        
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.entireNetworkOrderItineries}
            renderItem={this._renderExistingItinerariesListRow}
            keyExtractor={(item) => item._id}
          //onRefresh={() => this.pullToRefresh()}
          //refreshing={this.state.refreshing}
          />        
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.NoOrderClipboard}
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
            {"There were no itineraries to show!"}
          </Text>
        </View>
      );
    }
  };

  _renderDestinationFlatlist = () => {
    console.debug("stop");
    if (this.state.destinationsForStore.length > 0) {
      console.debug("stop again");
      return (
               <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.destinationsForStore}
            renderItem={this._renderDestinationListViewRow}
            keyExtractor={(item) => item._id}
          //onRefresh={() => this.pullToRefresh()}
          //refreshing={this.state.refreshing}
          />   
      );
    } else {
      return (
        <View style={{ flex: 1, paddingTop: 10 }}>
          <Image
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

  _renderOnlineDriversFlatlist = () => {
    console.debug("stop");
    if (this.state.filteredOnlineDrivers.length > 0) {
      console.debug("stop again");
      return (      
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.filteredOnlineDrivers}
            renderItem={this._renderOnlineDriverListViewRow}
            keyExtractor={(item) => item._id}
          //onRefresh={() => this.pullToRefresh()}
          //refreshing={this.state.refreshing}
          />    
      );
    } else {
      return (
        <View style={{ flex: 1, paddingTop: 10 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.DeliveryDriver4}
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
            {"There were no active drivers to show!"}
          </Text>
        </View>
      );
    }
  };

  _renderDriversOrItineraries = () => {
    if (this.state.driverItineraries_ItinerariesOnToggle) {
      return (
        <View style={{ paddingTop: 0, marginLeft: 4, paddingLeft: 4, paddingRight: 4, padding: 0, flex: 1 }}>
          <Text style={{ color: "black", fontSize: 13 }}>
            {"Available Drivers:"}
          </Text>
          {this._renderOnlineDriversFlatlist()}
        </View>
      );
    } else {
      return (
        <View style={{ paddingTop: 0, marginLeft: 4, paddingLeft: 4, paddingRight: 4, padding: 0, flex: 1 }}>
          <Text style={{ color: "black", fontSize: 13 }}>
            {/* {"Existing itineraries for " + this.state.currentStoreName + ":"} */}
            {"Existing itineraries for all stores:"}
          </Text>

          {this._renderExistingItinerariesFlatlist()}
        </View>
      );
    }
  };

  /**returns KM */
  _calculateDistance = (startlat, startlng, endlat, endlng) => {
    let geoResult = getDistance(
      { latitude: startlat, longitude: startlng },
      { latitude: endlat, longitude: endlng }
    );

    let resultInKm = geoResult / 100;
    return resultInKm;
  };

  //** finds store closest to dest and assigns*/
  _autoAssignStore = () => {
    //check not empty object
    let orderDest = this.props.orderDestinationLatLng;
    if (
      typeof orderDest === "undefined" ||
      Object.keys(orderDest).length == 0
    ) {
      alert("There is no order destination. Assign one first.");
      return;
    }

    let distanceAndStoreArray = [];
    for (const eachStore of this.state.networkStores) {
      //order them by how close they are to dest, and assign closest
      let distanceResult = this._calculateDistance(
        eachStore.location.lat,
        eachStore.location.long,
        this.props.orderDestinationLatLng.lat,
        this.props.orderDestinationLatLng.lng
      );
      let newDistanceAndStore = {
        distanceAway: distanceResult,
        store: eachStore,
      };
      distanceAndStoreArray.push(newDistanceAndStore);
    }
    //order and assign nearest one to newOrder variabke
    distanceAndStoreArray.sort(function (a, b) {
      return a.distanceAway - b.distanceAway;
    });

    let lowestDistanceAwayStore = distanceAndStoreArray[0];

    //change picker to nearest store
    this._changeStorePickerValue(lowestDistanceAwayStore.store._id);

    //assign new store in state
    let existing = this.state.newOrder;
    existing.assignedStore = lowestDistanceAwayStore.store;
    this.setState({ newOrder: existing });

    showMessage({
      message: "Store Auto Assigned To Order",
      autoHide: true,
      duration: 1500,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
        lowestDistanceAwayStore.store.markerDescription +
        " is the nearest store to " +
        this.props.latestPickerDestinationText,
      backgroundColor: "black", // background color
      color: "white", // text color
    });

    this._wipeNewOrderDriver();
    this._wipeNewOrderIntinerary();
  };

  //** finds driver closest to store and assigns*/
  _autoAssignDriver = () => {
    let orderDest = this.props.orderDestinationLatLng;
    if (
      typeof orderDest === "undefined" ||
      Object.keys(orderDest).length == 0
    ) {
      alert("There is no order destination. Assign one first.");
      return;
    }
    //order and assign nearest one to newOrder variable
    let assignedStore = this.state.newOrder.assignedStore;
    if (typeof assignedStore === "undefined") {
      alert(
        "There is no store assigned. Assign one first so the driver knows where he's picking up from."
      );
      return;
    }

    if (this.state.filteredOnlineDrivers.length == 0) {
      alert("There are no drivers online - sorry!");
      return;
    }

    let distanceAndDriverArray = [];
    for (const eachDriver of this.state.filteredOnlineDrivers) {
      //order them by how close they are to dest, and assign closest
      let distanceResult = this._calculateDistance(
        eachDriver.location.lat,
        eachDriver.location.long,
        assignedStore.location.lat,
        assignedStore.location.long
      );
      let newDistanceAndDriver = {
        distanceAway: distanceResult,
        driver: eachDriver,
      };
      distanceAndDriverArray.push(newDistanceAndDriver);
    }
    //order and assign nearest one to newOrder variabke
    distanceAndDriverArray.sort(function (a, b) {
      return a.distanceAway - b.distanceAway;
    });

    let lowestDistanceAwayDriver = distanceAndDriverArray[0];

    //assign driver in new order state
    this._assignThisDriverForNewOrder(lowestDistanceAwayDriver.driver);

    showMessage({
      message: "Driver Auto Assigned To Order",
      autoHide: true,
      duration: 3000,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
        lowestDistanceAwayDriver.driver.markerDescription +
        " is the nearest driver to " +
        this.props.latestPickerDestinationText,
      backgroundColor: "purple", // background color
      color: "white", // text color
    });

    this._wipeNewOrderIntinerary();
  };

  _autoAssignItineraryJustThisStore = () => {
    let orderDest = this.props.orderDestinationLatLng;
    if (
      typeof orderDest === "undefined" ||
      Object.keys(orderDest).length == 0
    ) {
      alert("There is no order destination. Assign one first.");
      return;
    }

    if (this.state.activeOrderItineriesForStore.length == 0) {
      alert("There are no order itineraries!");
      return;
    }

    let distanceAndDestinationItineraryArray = [];
    for (const eachItin of this.state.activeOrderItineriesForStore) {
      for (const currentDest of eachItin.orderDeliveryDestinations) {
        if (
          currentDest.location != null &&
          typeof currentDest.location !== "undefined"
        ) {
          let distanceResult = this._calculateDistance(
            orderDest.lat,
            orderDest.lng,
            currentDest.location.lat,
            currentDest.location.long
          );
          if (distanceResult <= this.state.MaxKMToSearchItineraryDestination) {
            //add this dest to the list
            let newDest = {
              distanceAway: distanceResult,
              orderDeliveryItineraryId: eachItin._id,
              itinerary: eachItin,
              destination: currentDest,
            };
            distanceAndDestinationItineraryArray.push(newDest);
          }
        }
      }
    }

    distanceAndDestinationItineraryArray.sort(function (a, b) {
      return a.distanceAway - b.distanceAway;
    });

    if (distanceAndDestinationItineraryArray.length == 0) {
      alert(
        "Sorry, there were no suitable itinieraries. Create a new one by assigning a store and driver"
      );
      return;
    }

    let lowestDistanceAwayItinDestination =
      distanceAndDestinationItineraryArray[0];

    //set this as itenerary
    this._assignThisItinieraryAsNewOrderItinierary(
      lowestDistanceAwayItinDestination.itinerary
    );
    //change store to this store
    this._changeStorePickerValue(
      lowestDistanceAwayItinDestination.itinerary.storeId,
      false
    );

    //set driver to itinerary driver
    this._assignThisDriverForNewOrder(
      lowestDistanceAwayItinDestination.destination.assignedDriver
    );
    //message
    showMessage({
      message: "Existing Itinerary Auto Assigned To This Order!!",
      autoHide: true,
      duration: 10000,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
        "Itinerary: #" +
        lowestDistanceAwayItinDestination.orderDeliveryItineraryId.substring(
          0,
          4
        ) +
        " has the nearest existing destination to " +
        this.props.latestPickerDestinationText +
        "\n\n" +
        lowestDistanceAwayItinDestination.distanceAway +
        " KM away.\n\n It was assigned, with driver: " +
        lowestDistanceAwayItinDestination.destination.assignedDriver.firstName +
        " " +
        lowestDistanceAwayItinDestination.destination.assignedDriver.lastName +
        " picking up from store: " +
        lowestDistanceAwayItinDestination.itinerary.store.storeName,
      backgroundColor: "lightblue", // background color
      color: "white", // text color
    });
  };

  //** finds itin with closest dest and assigns - if there is no destination within x KM will say unsuitable */
  _autoAssignItinerary = () => {
    let orderDest = this.props.orderDestinationLatLng;
    if (
      typeof orderDest === "undefined" ||
      Object.keys(orderDest).length == 0
    ) {
      alert("There is no order destination. Assign one first.");
      return;
    }

    if (this.state.entireNetworkOrderItineries.length == 0) {
      alert("There are no order itineraries!");
      return;
    }

    let distanceAndDestinationItineraryArray = [];
    for (const eachItin of this.state.entireNetworkOrderItineries) {
      for (const currentDest of eachItin.orderDeliveryDestinations) {
        if (
          currentDest.location != null &&
          typeof currentDest.location !== "undefined"
        ) {
          let distanceResult = this._calculateDistance(
            orderDest.lat,
            orderDest.lng,
            currentDest.location.lat,
            currentDest.location.long
          );
          if (distanceResult <= this.state.MaxKMToSearchItineraryDestination) {
            //add this dest to the list
            let newDest = {
              distanceAway: distanceResult,
              orderDeliveryItineraryId: eachItin._id,
              itinerary: eachItin,
              destination: currentDest,
            };
            distanceAndDestinationItineraryArray.push(newDest);
          }
        }
      }
    }

    distanceAndDestinationItineraryArray.sort(function (a, b) {
      return a.distanceAway - b.distanceAway;
    });

    if (distanceAndDestinationItineraryArray.length == 0) {
      alert(
        "Sorry, there were no suitable itinieraries. Create a new one by assigning a store and driver"
      );
      return;
    }

    let lowestDistanceAwayItinDestination =
      distanceAndDestinationItineraryArray[0];

    if(typeof lowestDistanceAwayItinDestination !== "undefined")
    {
    //change store to this store
    this._changeStorePickerValue(
      lowestDistanceAwayItinDestination.itinerary.storeId,
      false
    );

    //set this as itenerary
    this._assignThisItinieraryAsNewOrderItinierary(
      lowestDistanceAwayItinDestination.itinerary
    );

    //set driver to itinerary driver
    this._assignThisDriverForNewOrder(
      lowestDistanceAwayItinDestination.destination.assignedDriver
    );
    //message
    showMessage({
      message: "Existing Itinerary Auto Assigned To This Order!!",
      autoHide: true,
      duration: 12000,
      style:{    
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },            
      position: "top",
      description:
        "Itinerary: #" +
        lowestDistanceAwayItinDestination.orderDeliveryItineraryId.substring(
          0,
          4
        ) +
        " has the nearest existing destination to " +
        this.props.latestPickerDestinationText +
        "--" +
        lowestDistanceAwayItinDestination.distanceAway +
        " KM away.\n\nIt was assigned, with driver: " +
        lowestDistanceAwayItinDestination.destination.assignedDriver.firstName +
        " " +
        lowestDistanceAwayItinDestination.destination.assignedDriver.lastName,        
      backgroundColor: "hotpink", // background color
      color: "white", // text color
    });
    }
  };

  _renderTabHeaders = () => {
    const {
      theme: {
        colors: { background },
      },
    } = this.props;

    let lineColor = this._getModeTextColor();
    let text = "pink";

    let iconMiddle = this._renderAssignmentIconImage();
    let iconFirst = this._renderControlsIconImage();

    return (
      <View style={[{ paddingBottom: 3, backgroundColor: "white" }]}>
        <View
          style={[
            styles.tabButton,
            { backgroundColor: "white" },
            { borderTopColor: "white" },
            { borderBottomColor: "white" },
            Constants.RTL && { flexDirection: "row-reverse" },
          ]}
        >
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={lineColor}
              icon={iconFirst}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Controls:"}
              onPress={() => this.handleClickTab(0)}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={lineColor}
              icon={iconMiddle}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Assign:"}
              onPress={() => this.handleClickTab(1)}
              selected={this.state.tabIndex == 1}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              lineColor={lineColor}
              icon={Images.Permissions3}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Details:"}
              onPress={() => this.handleClickTab(2)}
              selected={this.state.tabIndex == 2}
            />
          </View>
        </View>
      </View>
    );
  };

  _renderAssignmentIconImage = () => {
    let iconImage =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? Images.DeliveryDriver4
        : Images.Drone1;
    return iconImage;
  };

  _renderControlsIconImage = () => {
    let iconImage =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? Images.Switch2
        : Images.Switch1;
    return iconImage;
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex: tabIndex });
  }

  _renderTextAndDivider = (color, text) => {
    return (
      <View style={{ paddingTop: 8 }}>
        <Divider
          style={{
            height: 8,
            backgroundColor: color,
            padding: 0,
            paddingLeft: 50,
            paddingRight: 50,
            marginBottom: 0,
            marginLeft: 50,
            marginRight: 50,
          }}
        />
        <Text
          style={{
            borderWidth: 1,
            paddingLeft: 45,
            paddingRight: 45,
            paddingTop: 0,
            marginTop: 0,
            borderColor: color,
            borderRadius: 15,
            textShadowOffset: { width: 1, height: 1 },
            textShadowColor: "black",
            textShadowRadius: 3,
            color: color,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          {text}
        </Text>
        <Divider
          style={{
            height: 5,
            backgroundColor: color,
            padding: 4,
            paddingLeft: 50,
            paddingRight: 50,
            marginBottom: 10,
            marginLeft: 50,
            marginRight: 50,
          }}
        />
      </View>
    );
  };

  _renderTabView = () => {
    let modetextColor = this._getModeTextColor();
    let pickerImg = this._getDestinationPickerImage();

    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    // let background = "white";
    // let text = "black";
    // let lineColor = "silver";

    const screenWidth = Dimensions.get("window").width;

    return (
      <View
        style={[
          //styles.tabView,
          {
            flex: 1,
            paddingBottom: 10,
            backgroundColor: "white",
          },
        ]}
      >
        {this.state.tabIndex === 0 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: "flex-start",
            }}
          >
            {this._renderTextAndDivider(modetextColor, "Assignment Controls")}
            {/* BUTTON */}
            <ScrollView style={{ flex: 1 }}>
              {this._renderSecondIconRow()}
              {this._renderFirstIconRow()}
            </ScrollView>
            {/* END */}
          </View>
        )}
        {this.state.tabIndex === 1 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: "flex-start",
            }}
          >
            {this._renderTextAndDivider(modetextColor, "Available To Assign")}
            {this._renderPickerRow()}
            {this._renderDriversOrItineraries()}
          </View>
        )}
        {this.state.tabIndex === 2 && (
          <View
            style={{
              flex: 1,
              alignContent: "flex-start",
            }}
          >
            {this._renderTextAndDivider(modetextColor, "Details")}
            {/* ROW FOR WHERE ORDER IS GOING */}
            <View style={{ padding: 5, flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  padding: 5,
                  paddingRight: 10,
                }}
              >
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 0,
                    maxHeight: 20,
                    height: 20,
                    width: 20,
                  }}
                  source={pickerImg}
                  resizeMode="contain"
                />
                <Text style={{ color: "black", fontSize: 15 }}>
                  {"Going to: " + this.props.latestPickerDestinationText}
                </Text>
              </View>
              {this._renderAssignedStoreRow()}
              {this._renderAssignedDriverRow()}
              {this._renderAssignedItineraryRow()}
            </View>
          </View>
        )}
      </View>
    );
  };

  displayMarkerLines = () => {
    if (typeof this.state.selectedStore !== "undefined" //store
      && this.props.orderDestinationLatLng && //order
      typeof this.props.orderDestinationLatLng.lat !== "undefined" &&
      this.props.orderDestinationLatLng.lng !== "undefined"
      && typeof this.state.newOrder.assignedDriver !== "undefined" //driver
    ) {

      let whichColor = this._getModeTextColor();
      return (
        <MapViewDirections
          style={{ zIndex: 1 }}
          origin={{
            latitude: this.state.newOrder.assignedDriver.location.lat,
            longitude: this.state.newOrder.assignedDriver.location.long,
          }}
          destination={{
            latitude: this.props.orderDestinationLatLng.lat,
            longitude: this.props.orderDestinationLatLng.lng,
          }}
          waypoints={[
            {
              latitude: this.state.selectedStore.location.lat,
              longitude: this.state.selectedStore.location.long,
            },
          ]}
          mode={"DRIVING"}
          apikey={Config.GoogleMapsDirectionAPIKey}
          strokeWidth={6}
          strokeColor={"lightblue"}
        />
      );
    } else {
      return null;
    }
  };

  _getDestinationPickerImage = () => {
    let whichImg =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? Images.HopprLogoMapPin4Filled
        : Images.HopprLogoMapPin2Filled;
    return whichImg;
  }

  _getModeTextColor = () => {
    let modetextColor =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? "#df4d60"
        : "#ff7cb9";
    return modetextColor;
  };

  _getWhichGoImage = () => {
    let modetextColor =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? Images.Go5
        : Images.Go3;
    return modetextColor;
  }

  _renderWhichModeText = () => {
    let modetextColor = this._getModeTextColor();
    let text =
      this.state.driverItineraries_ItinerariesOnToggle == true
        ? "Create New Itinerary"
        : "Add To Itinerary";

    return (
      <View
        style={{
          position: "absolute",
          top: "1%",
          backgroundColor: "white",
          borderRadius: 16,
          right: "1%"
        }}
      >
        <Text
          style={{
            //borderWidth: 1,
            padding: 8,
            paddingLeft: 8,
            paddingRight: 8,
            marginRight: 5,
            //borderColor: modetextColor,
            // borderRadius: 15,
            textShadowOffset: { width: 2, height: 2, paddingLeft: 3, paddingRight: 3 },
            textShadowColor: "black",
            textShadowRadius: 2,
            color: modetextColor,
            textAlign: "center",
            fontSize: 16,
          }}
        >
          {text}
        </Text>
      </View>
    );
  };

  _verifyOrderFieldsAreSet = () => {
    let theOrderDest = this.props.orderDestinationLatLng;
    if (
      typeof theOrderDest === "undefined" ||
      typeof theOrderDest.lat == "undefined" ||
      typeof theOrderDest.lng == "undefined"
    ) {
      alert("You haven't picked an order destination!");
      return false;
    }

    //if set to driver type request, check driver assigned
    if (this.state.driverItineraries_ItinerariesOnToggle) {
      if (typeof this.state.newOrder.assignedDriver === "undefined") {
        alert("You haven't picked a driver!");
        return false;
      }
    } else {
      //if set to logistics type request, check logistics parts assigned
      if (typeof this.state.newOrder.assignedItinierary === "undefined") {
        alert("You haven't assigned an itinerary");
        return false;
      }
    }

    //check there's actually something in the cart
    if (this.props.filteredNetworkCartItems.length == 0) {
      alert("There are no items in the cart!");
      return false;
    }

    return true;
  };

  /**verify everything is set  */
  _createOrderRequest = async () => {
    if (this._verifyOrderFieldsAreSet()) {
      toast("Valid. About to create order request");
      let baseRequest = this._createBaseLogisticsOrderRequest(
        this.props.orderDestinationLatLng.lat,
        this.props.orderDestinationLatLng.lng
      );

      //now assign driver / store / itinerary based on a number of factors (what's assigned in newOrder) and send to the
      let creattionResponse;
      if (this.state.driverItineraries_ItinerariesOnToggle == true) {
        //it's a new driver order, new itinerary - just need driverId, storeId and items
        //assign the orther missing items
        baseRequest.order.storeId = this.state.newOrder.assignedStore._id;
        baseRequest.order.driverId = this.state.newOrder.assignedDriver._id;
        creattionResponse = await HopprWorker.CreateNewUnpaidLogisticsOrderNewDriver(
          baseRequest
        );
      } else {
        //attaches to existing itinerary - just send in the itinieraryId (which has the store) and the destinationId (which has the driver in it)
        baseRequest = new ItineraryAppOrderRequest(
          this.state.newOrder.assignedItinierary._id,
          baseRequest.order,
          baseRequest.location
        );
        creattionResponse = await HopprWorker.CreateNewUnpaidLogisticsOrderAttachExisting(
          baseRequest
        );
      }

      //handle the response
      if (creattionResponse.status == 200) {
        showMessage({
          message:
            "Request Created. Driver paged. You will be notified if they accept it.",
          autoHide: true,
          duration: 4000,
          position: "bottom",
          description:
            "Your order request was created! Successfully. We will update you as soon as the driver responds.",
          backgroundColor: "hotpink", // background color
          color: "white", // text color
        });

        this._resetNewOrder();
        this.refs.controlsModal.close();
        
      } else if (creattionResponse.status == 400) {
        //show the api error
        alert("There was a problem: " + creattionResponse.data.message);
      }
    } else {
      //invla
      alert("Invalid request!!! Some fields aren't assigned");
    }
  };

  _renderPickerRow = () => {

    let whichGoImg = this._getWhichGoImage();

    return (
      <View
        style={{
          padding: 0,
          margin: 0,
          marginBottom: 0,
          paddingBottom: 0,
          paddingTop: 1,
        }}
      >
        {/* SWITCH */}
        <View style={{ flexDirection: "row" }}>
          {this._renderStorePickerRow()}
          <View style={{ paddingTop: 2 }}>
            <View
              style={{
                marginTop: 10,
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SwitchToggle
                backgroundColorOff={"#ff7cb9"}
                backgroundColorOn={"#df4d60"}
                containerStyle={{
                  width: 75,
                  height: 38,
                  borderRadius: 25,
                  backgroundColor: "#E50808",
                  backgroundColorOn: "#E50808",
                  backgroundColorOff: "#E50808",
                  padding: 5,
                }}
                circleStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 19,
                  backgroundColor: "white", // rgb(102,134,205)
                }}
                switchOn={this.state.driverItineraries_ItinerariesOnToggle}
                onPress={() => this._onDriverItinerarySwitchToggle()}
                circleColorOff="white"
                circleColorOn="white"
                duration={100}
              />
              <Text
                style={{
                  paddingTop: 4,
                  textAlign: "center",
                  fontSize: 8,
                  fontStyle: "italic",
                  color: "grey",
                }}
              >
                {"Mode"}
              </Text>
            </View>
          </View>
          <View style={{ padding: 3 }}>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                margin: 3,
                paddingTop: 3,
                paddingBottom: 1,
              }}
            >
              {/* CREATE DESTINATION */}
              <TouchableOpacity
                onPress={() => {
                  this.props.updateModalState("locationPickerModal", true);
                  this._wipeNewOrderDriver();
                  this._wipeNewOrderStore();
                  this._wipeNewOrderIntinerary();
                }}
              >
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 0,
                    maxHeight: 42,
                    height: 42,
                    width: 42,
                  }}
                  source={this._getDestinationPickerImage()}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontSize: 8,
                fontStyle: "italic",
                color: "grey",
              }}
            >
              {"Destination"}
            </Text>
          </View>
          <View style={{ padding: 3 }}>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                margin: 3,
                paddingTop: 3,
                paddingBottom: 1,
              }}
            >
              {/* CREATE ORDER */}
              <TouchableOpacity onPress={() => this._createOrderRequest()}>
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 0,
                    maxHeight: 42,
                    height: 42,
                    width: 42,
                  }}
                  source={whichGoImg}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontSize: 8,
                fontStyle: "italic",
                color: "grey",
              }}
            >
              {"Create Order"}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  render = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    let pickerImg = this._getDestinationPickerImage();
    let driverName = "None";
    let textColor = this._getModeTextColor();

    if(typeof this.state.newOrder.assignedDriver !== "undefined")
    {
      driverName = this.state.newOrder.assignedDriver.firstName +  " " +  this.state.newOrder.assignedDriver.lastName
    }

    return (
      
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* HEADER */}
        <Header
          backgroundColor={textColor}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: "Mangement Mode - Create Order",
            style: { color: "#fff" },
          }}
          leftComponent={{
            icon: "arrow-back",
            color: "#fff",
            onPress: () => this.props.navigation.goBack(),
          }}
          rightComponent={            
              <Image
                source={Images.Drone2}
                style={{ height: 28, width: 28 }}
              />
            
          }
          leftComponent={{
            icon: "arrow-back",
            color: "#fff",
            onPress: () => this.props.navigation.goBack(),
          }}
        />


        {/* TEXT */}
        {this._renderPickerRow()}

        {/* GOING TO */}
        <View
          style={{
            flexDirection: "row",
            padding: 0,
            paddingBottom: 2,
            paddingRight: 10,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={pickerImg}
            resizeMode="contain"
          />
          <Text style={{ color: "black", fontSize: 13 }}>
            {" Going to: " + this.props.latestPickerDestinationText}
          </Text>
        </View>

        {/* STORE TEXT AND IMG */}
        <View
          style={{
            flexDirection: "row",
            padding: 0,
            paddingBottom: 2,
            paddingRight: 10,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={Images.MapIconStore8}
            resizeMode="contain"
          />
          <Text
            numberOfLines={1}
            style={{ color: "black", fontSize: 13, paddingLeft: 3 }}
          >
            {"Selected store: " + this.state.currentStoreAddress}
          </Text>
        </View>

              {/* DRIVER TEXT AND IMG */}
          <View
          style={{
            flexDirection: "row",
            padding: 0,
            paddingRight: 10,
            paddingBottom: 3,
            marginBottom: 3,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 20,
              height: 20,
              width: 20,
            }}
            source={Images.DeliveryDriver5}
            resizeMode="contain"
          />
          <Text
            numberOfLines={1}
            style={{ color: "black", fontSize: 13, paddingLeft: 3 }}
          >
            {"Selected Driver: " +  driverName}
          </Text>
        </View>   

        {/* GOING TO DESTINATION ROW */}
        {this._renderControlsModal()}
        {/* MAP */}
        {this._renderMapView()}
        {/* {this._renderAssignDestinationModal()} */}

        {this._renderFullDriverDisplayModal()}
      </View>
    );
  };
}

const mapStateToProps = ({ modals, carts, user, location }) => {
  return {
    user: user,
    modalsArray: modals.modalsArray,
    filteredNetworkCartItems: carts.filteredCartItems,
    filteredNetworkId: carts.filteredNetworkId,
    filteredNetworkName: carts.filteredNetworkName,
    filteredItemsTotal: carts.filteredItemsTotal,
    filteredCartNetwork: carts.filteredCartNetwork,
    location,
    latestPickerDestinationText: location.latestPickerDestinationText,
    orderDestinationLatLng: location.mostRecentOrderDestinationLatLng,
  };
};

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/LocationRedux");
  const userActions = require("@redux/UserRedux");
  const modalActions = require("@redux/ModalsRedux");
  return {
    pushCurrentPickerLocationAsOrderDestination: async (
      pickedLatLng,
      latestPickerDestinationText
    ) => {
      dispatch(
        actions.setOrderDestination(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText
        )
      );
    },
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(OrderLogisticsCreate));
