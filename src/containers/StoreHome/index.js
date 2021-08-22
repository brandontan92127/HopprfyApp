import styles from "./styles";
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
  ScrollView,
  Animated,
  Text,
  FlatList,
  SectionList,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
  RefreshControlBase
} from "react-native";
import { connect } from "react-redux";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
import { Timer, toast, BlockTimer } from "@app/Omni";
import LogoSpinner from "@components/LogoSpinner";
import Empty from "@components/Empty";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import GeoWorker from "../../services/GeoWorker";
import MapWorker from "../../services/MapWorker";
import HopprWorker from "../../services/HopprWorker";
import { Images } from "@common";
import Permissions from "react-native-permissions";
import {
  AdMob,
  ModalBox,
  WebView,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating,
  FullOrderDisplayModal
} from "@components";
import { Config } from "@common";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import Modal from "react-native-modalbox";
import SwitchToggle from "react-native-switch-toggle";
import Moment from "react-moment";
import DateHelper from "../../services/DateHelper";
import DateTimePicker from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import SoundPlayer from "react-native-sound-player";
import Carousel from "react-native-snap-carousel";
import { EventRegister } from "react-native-event-listeners";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { clearIntervalAsync } from "set-interval-async";
const fromEntries = require("fromentries");
//import { WooWorker } from "api-ecommerce";
import moment from "moment";
import { NoFlickerImage } from "react-native-no-flicker-image";
import FastImage from "react-native-fast-image";
import TextTicker from "react-native-text-ticker";

const screen = Dimensions.get("window");
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE = 51.5397824;
const LONGITUDE = -0.1435601;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const getDefaultState = () => {
  return {
    showMap: true,
    fullOrderModalOpenClosed: false,
    selectedOrderAddress: undefined,
    selectedOrder: undefined,
    selectedOrderNetwork: undefined,
    updateOrdersTimer: null,
    myStoreOrders: [],
    storeActive: false,
    thisStore: null,
    storeName: "None",
    storeAddress: "Nowhere",
    isOpeningTimePickerVisible: false,
    isClosingTimePickerVisible: false,
    latestStoreCalendarDayOfWeek: undefined,
    latestStoreCalendarIsClosingTime: false //either open or close =  true / false
  };
};

class StoreHome extends Component {
  constructor(props) {
    super(props);

    this.hasLoaded = false;
    const { user, navigation } = this.props;
    this.orderRotationNumber = 0;
    this.state = getDefaultState();

    //OPENING PICKERS - CALLED FROM FLATLIST WITH PARAM
    this._showOpeningTimePicker = daySelected => {
      toast("Edit opening hours");
      this.setState({
        isOpeningTimePickerVisible: true,
        latestStoreCalendarIsClosingTime: false,
        latestStoreCalendarDayOfWeek: daySelected
      });
    };
    this._hideOpeningTimePicker = () =>
      this.setState({ isOpeningTimePickerVisible: false });

    //CLOSING PICKERS- CALLED FROM FLATLIST WITH PARAM
    this._showClosingTimePicker = daySelected => {
      toast("Edit closing hours");
      this.setState({
        isClosingTimePickerVisible: true,
        latestStoreCalendarIsClosingTime: true,
        latestStoreCalendarDayOfWeek: daySelected
      });
    };

    this.navigateToStockScreen = () => {
      const { navigation } = this.props;
      navigation.navigate("ProductStockScreen");
    };

    //todo: finish
    //INCOMPLETE AND INACTIVE.
    /**Looks at opening times and active to see if open */
    this.isStoreTakingOrdersNow = () => {
      if (this.state.thisStore) {
        if (this.state.thisStore.storeCalendars.length > 0) {
          //we got data - do checks
          let currentDateTime = Date.now();
          let todaysDate = new Date(currentDateTime);
          //let whatDayIsit = todaysDate.getDay();
          let dayText = todaysDate.toLocaleDateString("en-GB", {
            weekday: "long"
          });

          console.debug("Is store taking orders?");
        }
        return false;
      }
    };

    this._hideClosingTimePicker = () =>
      this.setState({ isClosingTimePickerVisible: false });
    /////////

    //handle selected time pick
    this._handleDatePicked = async date => {
      //toast("A time has been picked: ", date);

      var dateToSend = date.toTimeString().split(" ")[0];
      console.debug("Sending updated date to api");

      //update on api
      //update locally

      var daySelected = this.state.latestStoreCalendarDayOfWeek;
      var parsedDaySelected =
        daySelected.charAt(0).toUpperCase() + daySelected.slice(1);

      //get local item
      var existingItemInArray = this.state.thisStore.storeCalendars.find(
        x => x.dayOfWeek.toString() == parsedDaySelected
      );
      //update locally
      var copiedStore = JSON.parse(JSON.stringify(this.state.thisStore));
      let copiedArray = [...copiedStore.storeCalendars];
      let indexOfItem = copiedArray.findIndex(
        el => el._id === existingItemInArray._id
      );
      var copyCalendar = copiedArray[indexOfItem];

      if (this.state.latestStoreCalendarIsClosingTime == true) {
        //update closing time

        console.debug("updatingClosing");
        await HopprWorker.updateClosingHoursStoresCalendar(
          parsedDaySelected,
          dateToSend.toString()
        );
        copyCalendar.closingTime = dateToSend;
        this._hideClosingTimePicker();
      } else {
        //update opening time
        console.debug("updatingopening");
        await HopprWorker.updateOpeningHoursStoresCalendar(
          //daySelected,//.substring(0, 3).toUpperCase(),
          parsedDaySelected,
          dateToSend.toString()
        );
        copyCalendar.openingTime = dateToSend;
        this._hideOpeningTimePicker();
      }

      //do local update
      copiedArray[indexOfItem] = copyCalendar;
      copiedStore.storeCalendars = copiedArray;
      this.setState({ thisStore: copiedStore });
      console.debug("Test completed");
      //end
    };

    this.showOrderLongPressMenu = id => {
      Alert.alert(
        "Order options",
        "Take actions here:",
        [
          {
            text: "Cancel order",
            style: "destructive",
            onPress: () => this.cancelOrder(id)
          },
          {
            text: "Confirm pickup",
            onPress: () => this.confirmOrderPickup(id),
            style: "cancel"
          },
          { text: "Close", onPress: () => console.debug("OK Pressed") }
        ],
        { cancelable: true }
      );
    };
  }

  _renderOpenOrCloseImage = () => {
    if (this.props.storeActive) {
      return (
        <FastImage
          style={{
            margin: 10,
            flex: 1,
            maxHeight: 140,
            height: 140,
            width: undefined
          }}
          source={Images.Open}
          resizeMode='contain'
        />
      );
    } else {
      return (
        <FastImage
          style={{
            flex: 1,
            margin: 10,
            maxHeight: 140,
            height: 140,
            width: undefined
          }}
          source={Images.Closed}
          resizeMode='contain'
        />
      );
    }
  };

  _renderStoreActiveIcon = () => {
    if (this.props.storeActive) {
      return (
        <View style={{ paddingTop: 4, marginTop: 13 }}>
          <TouchableHighlight onPress={() => this.refs.modal2.open()}>
            <FastImage
              source={Images.Open1}
              style={{ height: 26, width: 26 }}
            />
          </TouchableHighlight>
        </View>
      );
    } else {
      return null;
    }
  };

  _updateSelectedNetwork = async netId => {
    let newNetResultsData = await HopprWorker.getNetwork(netId);
    //lowecase the result so it works
    let entries = Object.entries(newNetResultsData);
    let capsEntries = entries.map(entry => [
      entry[0][0].toLowerCase() + entry[0].slice(1),
      entry[1]
    ]);
    let netNets = fromEntries(capsEntries);

    this.setState({ selectedOrderNetwork: netNets });
    console.log(netNets);
  };

  toggleStoreActive = async () => {
    if (this.props.storeActive == true) {
      this.turnStoreOff();
    } else {
      this.turnStoreOn();
    }
  };

  toggleCalendarDayActive = async newBool => {
    // calendar.storeActive == true
    //   ? (calendar.dayActive = false)
    //   : (calendar.dayActive = true);
    // //todo: update in API!!!
    // this.updateCalendarDayInApi(calendar);
  };

  //NOT USING ATM
  //todo: THIS ONLY UPDATES LOCALLY AT THE MOMENT!!! ADD FEATURE
  updateCalendarDayInApi = calendar => {
    var existingItemInArray = this.state.thisStore.storeCalendars.find(
      x => x._id == calendar._id
    );
    //update locally
    var copiedStore = JSON.parse(JSON.stringify(this.state.thisStore));
    let copiedArray = [...copiedStore.storeCalendars];
    let indexOfItem = copiedArray.findIndex(
      el => el._id === existingItemInArray._id
    );
    var copyCalendar = copiedArray[indexOfItem];
    copyCalendar.dayActive = calendar.dayActive;
    copiedArray[indexOfItem] = copyCalendar;
    copiedStore.storeCalendars = copiedArray;
    this.setState({ thisStore: copiedStore });
  };

  turnStoreOff = async () => {
    try {
      HopprWorker.turnStoreOff(this.state.thisStore._id);
      this.props.updateStoreActive(false);
      toast("Store Off");
    } catch (error) {
      console.debug("Couldn't turn store off");
    }
  };

  confirmOrderPickup = async orderId => {
    await HopprWorker.storeConfirmOrderPickup(orderId);
    toast("Thanks! You confirmed the order was picked up.");
  };

  /**Store cancels order */
  cancelOrder = async orderId => {
    //get order

    //if state not:  tehn tell them sorry
    let orderToCancel = this.state.myStoreOrders.find(x => x._id == orderId);
    if (orderToCancel.state == "DRIVER_EN_ROUTE_TO_STORE") {
      await HopprWorker.storeCancelOrder(orderId, "Store Cancelled");
    } else {
      showMessage({
        message: "Sorry, we couldn't do that...",
        autoHide: true,
        duration: 7000,
        style: {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        },
        position: "center",
        description:
          "You can only cancel an order BEFORE the pickup has been confirmed...otherwise the goods have left the store!!",
        backgroundColor: "red", // background color
        color: "white" // text color
      });
    }
  };

  _toggleShowMap = () => {
    let newVal = this.state.showMap == true ? false : true;
    this.setState({ showMap: newVal });
  };

  turnStoreOn = async () => {
    try {
      await HopprWorker.turnStoreOn(this.state.thisStore._id);
      this.props.updateStoreActive(true);
      toast("Store On");
    } catch (error) {
      console.debug("Couldn't turn store on");
    }
  };

  renderOpeningHoursRow = ({ item }) => {
    // let imageUrl = "";

    return (
      <ListItem
        roundAvatar
        leftIcon={
          <FastImage
            style={{
              maxHeight: 45,
              height: 45,
              width: 45,
              maxWidth: 45
            }}
            source={Images.clock_gif}
            resizeMode='contain'
          />
        }
        subtitle={
          "Opening: " +
          item.openingTime.substring(0, 8) +
          "| Closing: " +
          item.closingTime.substring(0, 8)
        }
        switched={item.dayActive}
        onSwitch={item => {
          console.debug("About to toggle");
          this.toggleCalendarDayActive(item);
        }}
        switchButton={true}
        hideChevron={true}
        subtitleNumberOfLines={1}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.dayOfWeek}
        titleNumberOfLines={3}
        switchTintColor={"grey"}
        onPress={() => this._showOpeningTimePicker(item.dayOfWeek)}
        onLongPress={() => this._showClosingTimePicker(item.dayOfWeek)}
      />
    );
  };

  //takes an order item
  _renderCarouselItem = ({ item, index }) => {
    let name = item.product.name;
    let size = item.product.size;
    let price = item.product.price;

    let amount = item.amount;
    let catImageBaseUrl = Config.ProductBaseUrl;
    if (
      item.product.images[0].indexOf("http://") == 0 ||
      item.product.images[0].indexOf("https://") == 0
    ) {
      //it's already an HTTP link, don't add anything
      catImageBaseUrl = "";
    }

    let imageUrl =
      catImageBaseUrl + item.product.images[0] ||
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";

    let concatText =
      size != null ? amount + " " + name + "\n@" + size : amount + " " + name;

    return (
      <View style={{
        height: 80,
        width: 80,
        overflow:"hidden",
        borderRadius:20,
      }}>
      <FastImage
        style={{
          flex: 1,
          height: 80,
          width: 80
        }}
        resizeMode={"cover"}
        source={{ uri: imageUrl }}
      />
      </View>
    );
  };

  _generateProductBaseUrl = item => {
    let catImageBaseUrl = Config.ProductBaseUrl;
    if (item.items[0] != null && typeof item.items[0] !== "undefined") {
      if (
        item.items[0].product.images[0].indexOf("http://") == 0 ||
        item.items[0].product.images[0].indexOf("https://") == 0
      ) {
        //it's already an HTTP link, don't add anything
        catImageBaseUrl = "";
      }
    }

    return catImageBaseUrl;
  };

  //this is for list
  renderRow = ({ item }) => {
    try {
      let pickupCode = item.driverPickupCode;
      let itemString = "";
      let totalItemsCount = 0;
      let prods = [];
      item.items.map(x => {
        itemString += " " + x.amount + " of " + x.productName + ",";
        totalItemsCount += x.amount;
      });

      itemString = itemString.slice(0, -1);
      item.items.map(i => {
        let p = i.product;
        prods.push(p);
      });
      //show different image based on state / outcome
      let stateImageUrl = Images.OrderCancelled;
      let stateText = "NONE";
      switch (item.state) {
        case "DRIVER_EN_ROUTE_TO_STORE":
          stateImageUrl = Images.MapIconStore8;
          stateText = "IN";
          break;
        case "ORDER_EN_ROUTE_TO_CUSTOMER":
          stateText = "OUT";
          stateImageUrl = Images.AddDriver1;
          break;
        case "DELIVERED_TO_CUSTOMER":
          stateText = "OUT";
          stateImageUrl = Images.ShowStripeAccount1;
          break;
        default:
          break;
      }

      //set image URL depending on what type of link it is

      let catImageBaseUrl = this._generateProductBaseUrl(item);

      let imageUrl =
        catImageBaseUrl + item.items[0].product.images[0] ||
        "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";
      return (
        <ListItem
          containerStyle={{
            backgroundColor: "white",
            borderRadius: 20,
            marginBottom: 15,
            minHeight: 40,
            borderBottomWidth: 0,
            borderTopWidth: 0
          }}
          leftIcon={
            <View>
              <Carousel
                ref={c => {
                  this._carousel = c;
                }}
                layout={"default"}
                layoutCardOffset={`9`}
                data={item.items}
                renderItem={this._renderCarouselItem}
                sliderWidth={100}
                itemWidth={100}
              />
            </View>
          }
          rightIcon={
            <View
              style={{
                backgroundColor: "#F1F2F6",
                flexDirection: "row",
                borderTopLeftRadius: 40,
                borderBottomLeftRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                height: 30,
                marginRight: -10,
                alignSelf: "center",
                width: "22%"
              }}
            >
              <Image
                source={stateImageUrl}
                style={{ width: 25, height: 25, tintColor: "#AFBECD" }}
              />
              <Text style={{ marginLeft: 5, fontSize: 12, color: "#AFBECD" }}>
                {stateText}
              </Text>
            </View>
          }
          subtitleNumberOfLines={7}
          leftIconOnPress={() => toast("Pressed left icon")}
          titleNumberOfLines={1}
          title={
            <View style={{ overflow: "hidden" }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: Constants.fontFamilyBold,
                  color: "#A2C3F5",
                  fontSize: 12
                }}
              >
                {item.state.replace(/_/g, " ")}
              </Text>

              <Text style={{ ...styles.greyFont, marginTop: 5 }}>
                {moment
                  .parseZone(item.creationDate)
                  .format("MMMM DD, YYYY - H:mm")}
              </Text>
              <Text style={styles.greyFont}>{`ID: ${item._id.substring(
                0,
                4
              )} | CODE: ${item._id.substring(0, 4)}`}</Text>
              <Text
                style={{ fontFamily: Constants.fontFamilyMedium, marginTop: 5 }}
              >
                {`Item: ${itemString.replace(/,\s*$/, "")}`}
              </Text>

              {/* <Text>
                {"ID: #" +
                  item._id.substring(0, 4) +
                  " | " +
                  "Code: " +
                  pickupCode ??
                  "None" +
                    " | " +
                    totalItemsCount +
                    " items" +
                    "\n£" +
                    item.itemSubTotal.toFixed(2)}
              </Text> */}
            </View>
          }
          // subtitle={
          //   moment.parseZone(item.creationDate).format("MMMM DD, YYYY - H:mm") +
          //   "\n" +
          //   item.state.replace(/_/g, " ") +
          //   "\nItems: " +
          //   itemString.replace(/,\s*$/, "")
          // }
          onPress={async () => {
            //get network in order, save
            await this._updateSelectedNetwork(item.networkId);
            await this._reverseGeoCodeOrderDestinationAndSave(item);
            //show full order modal w carousel
            this.setState({ selectedOrder: item });
            this._openFullOrderModal();
          }}
          //onPress={() => this.showOrderLongPressMenu(item._id)}
          onLongPress={() => this.showOrderLongPressMenu(item._id)}
        />
      );
    } catch (error) {}
  };

  _reverseGeoCodeOrderDestinationAndSave = async order => {
    try {
      let address = await GeoWorker.reverseGeocode(
        order.location.lat,
        order.location.long
      );

      this.setState({ selectedOrderAddress: address.formattedAddress });
    } catch (error) {
      alert("Couldn't geocode address!");
    }
  };

  //this is for flatlist
  cell = (data, index) => {
    const item = data.cleanData ? data.cleanData : data;

    console.debug(data.cleanData);
    console.debug(
      "data.cleanData will be not null if search bar is not empty. caution, data without search is not same like data with search due to implement the highlight component. data.cleanData is equal to data"
    );

    console.debug("this is index number : " + index);
    console.debug(item + " this is original data");
    return (
      <View style={{ flexGrow: 1 }}>
        <FastImage source={Images.MapIconStore} />
        <Text style={{ color: "red" }}>
          {item.driver.email + " " + item.itemSubTotal}
        </Text>
      </View>
    );
  };

  updateOrderFromServer = async () => {
    try {
      console.debug("ABout to get orders for store by token");
      let allSToreOrdersResopnse = await HopprWorker.ordersByStoreAccountId(
        this.props.user.user.storeId,
        100,
        1
      );

      if (allSToreOrdersResopnse.status == 200) {
        let orderData = allSToreOrdersResopnse.data;
        var newIds = orderData.map(function (v) {
          return {
            _id: v._id,
            state: v.state,
            driverLocation: v.driver.location
          };
        });
        var oldIds = this.state.myStoreOrders.map(function (v) {
          return {
            _id: v._id,
            state: v.state,
            driverLocation: v.driver.location
          };
        });

        let exactSame = JSON.stringify(newIds) === JSON.stringify(oldIds);
        if (!exactSame) {
          //check if we need to do an update
          console.debug("Got store orders:" + JSON.stringify(orderData));
          this.setState({ myStoreOrders: orderData });
        }
      } else {
        //didn't work
      }
    } catch (error) {
      toast("Coudn't update orders from server");
    }
  };

  getOpeningHours = async () => {
    try {
      let hours = await HopprWorker.getOpeningHours();
      array.forEach(element => {});

      this.setState({ openingHours: hours });
    } catch (error) {
      toast("Coudn't get opening hours fromm server");
    }
  };

  //updates a single day of StoreCalendar
  updateOpeningHours = () => {};

  showOpeningHoursList = () => {
    {
      if (this.state.thisStore) {
        if (this.state.thisStore.storeCalendars.length > 0) {
          return (
            <View>
              {/* <List style={{ flexGrow: 1 }}> */}
              <FlatList
                style={{
                  flexGrow: 1,
                  borderTopWidth: 0,
                  borderBottomWidth: 0
                }}
                data={this.state.thisStore.storeCalendars}
                renderItem={this.renderOpeningHoursRow}
                keyExtractor={item => item.dayOfWeek}
              />
              {/* </List> */}
            </View>
          );
        }
      } else {
        return (
          <View>
            <FastImage
              style={{
                flex: 1,
                maxHeight: 140,
                height: 140,
                width: undefined
              }}
              source={Images.whereisIt}
              resizeMode='contain'
            />
            <Text style={{ color: "black", fontSize: 20, textAlign: "center" }}>
              {"There were no opening hours to show!"}
            </Text>
          </View>
        );
      }
    }
  };

  showOrderList = () => {
    if (this.state.myStoreOrders && this.state.myStoreOrders.length > 0) {
      return (
        <View
          style={{
            flex: 1,
            minHeight: 300,
            height: 300,
            borderTopWidth: 0,
            borderBottomWidth: 0
          }}
        >
          <FlatList
            style={{
              flexGrow: 1,
              height: "100%",
              backgroundColor: "#F1F2F6",
              padding: 10,
              borderTopWidth: 0,
              borderBottomWidth: 0
            }}
            data={this.state.myStoreOrders}
            renderItem={this.renderRow}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, minHeight: 200, height: 200 }}>
          <FastImage
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined
            }}
            source={Images.NoOrderClipboard}
            resizeMode='contain'
          />
          <Text
            style={{
              marginTop: 4,
              color: "black",
              fontSize: 20,
              textAlign: "center"
            }}
          >
            {"There were no orders to show!"}
          </Text>
        </View>
      );
    }
  };

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = user => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        if (user.user.roles.find(x => x === "Store")) {
          //we are allowed
          return true;
        }
      }
    }

    const { navigation } = this.props;
    this.props.navigation.pop();
    this.props.navigation.navigate("LoginScreen");
    alert(
      "You are not in the correct role, or not logged in. Please register to become a store!!"
    );

    return false;
  };

  _isThereADriverWithinPointXKMOfTheStore = (storeLat, storeLng, orders) => {
    let reult = { value: false, distanceKM: 0 };
    //if ANY drivers are within range,
    orders
      .filter(x => x.state === "DRIVER_EN_ROUTE_TO_STORE")
      .map(order => {
        let driverLocation = order.driver.location;
        let howFar = GeoWorker._calculateDistanceKM(
          storeLat,
          storeLng,
          driverLocation.lat,
          driverLocation.long
        );
        if (howFar <= 0.035) {
          reult = { value: true, distanceKM: howFar };
        }
      });

    return reult;
  };

  load = async () => {
    if (!this.hasLoaded) {
      this.hasLoaded = true;
      const { user, navigation } = this.props;
      console.debug("we're in stores view");

      try {
        //if we're logged in and have user + store - go, else don't and redirect
        if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(user)) {
          HopprWorker.init({
            username: this.props.user.user.email,
            password: this.props.user.successPassword,
            token: this.props.user.token
          });

          EventRegister.emit("showSpinner");

          try {
            await this.updateOrderFromServer();
          } catch (error) {}

          let storeUpdateOrdersTimer = setIntervalAsync(async () => {
            try {
              this.orderRotationNumber = this.orderRotationNumber + 1;
              await this.updateOrderFromServer();
              //make a noise if there is driver within 0.1km
              try {
                let returnPayload =
                  this._isThereADriverWithinPointXKMOfTheStore(
                    this.props.storeLocationLatLng.lat,
                    this.props.storeLocationLatLng.lng,
                    this.state.myStoreOrders
                  );
                let isThereSomeoneClose = returnPayload.value;
                if (isThereSomeoneClose && this.orderRotationNumber % 4 == 0) {
                  //only play sometimes
                  let distanceAway = returnPayload.distanceKM;
                  SoundPlayer.playSoundFile("doorbell1", "mp3");

                  showMessage({
                    message: `There is a pickup driver ${
                      distanceAway * 1000
                    } meters away!`,
                    autoHide: true,
                    duration: 9000,
                    style: {
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20
                    },
                    position: "top",
                    description:
                      "Check your map, please make sure the order is ready to go!\n\nThen 'confirm pickup' by long pressing on the order.",
                    backgroundColor: "orange", // background color
                    color: "white" // text color
                  });
                }
              } catch (error) {
                //do nothing!
              }
            } catch (error) {
              toast("We couldn't update orders from server at this time");
            }
          }, 10000);

          this.setState({ updateOrdersTimer: storeUpdateOrdersTimer });

          let thisSTore = await HopprWorker.getStore(user.user.storeId);
          this.setState({ thisStore: thisSTore[0] });
          this.setState({ storeName: thisSTore[0].storeName }, () =>
            this.isStoreTakingOrdersNow()
          );

          //get location from API and push to redux - to make sure we're in sync!!!
          let thisAddress = await GeoWorker.reverseGeocode(
            thisSTore[0].location.lat,
            thisSTore[0].location.long
          );
          // this.setState({ storeAdress: thisAddress }); //NOT USING THIS NOW

          //needs to be a lat/lng
          this.props.pushStoreLocation(
            {
              lat: thisSTore[0].location.lat,
              lng: thisSTore[0].location.long
            },
            thisAddress.formattedAddress
          );
          //get order for this store
          //in userInfo
        }
      } catch (error) {
        console.log(error);
      } finally {
        EventRegister.emit("hideSpinner");
      }
    }
  };

  _closeFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: false });
  };

  _openFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: true });
  };

  unload = async () => {
    //toast("Timers stopped");
    clearIntervalAsync(this.state.updateOrdersTimer);
    this.setState(getDefaultState());
    toast("UNLOADED");
    this.hasLoaded = false; //reset this
  };

  componentWillUnmount = () => {
    try {
      this.unload();
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();
    } catch (error) {}
  };

  _getDriverMarker = order => {
    try {
      return (
        <Marker
          zIndex={101}
          //tracksViewChanges={this.state.tracksViewChanges}
          ref={el => (this._destinationMarker = el)}
          key={`${order.driver._id}`}
          identifier={order.driver._id}
          coordinate={{
            latitude: order.driver.location.lat,
            longitude: order.driver.location.long
          }}
          title={"Picking up: #" + order._id.substring(0, 4)}
          description={order.driver.firstName + " " + order.driver.lastName}
        >
          <FastImage
            source={Images.MapIconDriver4}
            style={{
              width: 34,
              maxWidth: 34,
              minHeight: 34,
              height: 34
            }}
          />
        </Marker>
      );
    } catch (error) {}
  };

  componentDidMount = async () => {
    console.debug("Store home");
    this.unsubscribeWillFocus = this.props.navigation.addListener(
      "willFocus",
      this.load
    );
    this.unsubscribeLoseFocus = this.props.navigation.addListener(
      "willBlur",
      this.unload
    );
    await this.load();
  };

  _renderDriverMarkers = () => {
    try {
      return this.state.myStoreOrders
        .filter(x => x.state === "DRIVER_EN_ROUTE_TO_STORE")
        .map(order => {
          return this._getDriverMarker(order);
        });
    } catch (error) {}
  };

  _renderMapView = () => {
    if (
      this.props.storeLocationLatLng &&
      typeof this.props.storeLocationLatLng.lat !== "undefined" &&
      typeof this.props.storeLocationLatLng.lng !== "undefined"
    ) {
      return (
        <View
          style={{
            height: 250
          }}
        >
          <View
            style={{
              height: 180,
              marginBottom: 6,
              borderBottomRightRadius: 25,
              borderBottomLeftRadius: 25,
              shadowColor: "#000000",
              shadowOffset: {
                width: 0,
                height: 3
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              alignItems: "center",
              backgroundColor: "#0000"
            }}
          >
            <MapView
              ref={el => (this._mapView = el)}
              // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 25,
                zIndex: -10
              }}
              initialRegion={{
                latitude: this.props.storeLocationLatLng.lat,
                longitude: this.props.storeLocationLatLng.lng,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
              }}
            >
              {/* DRIVER MARKERS */}

              {this._renderDriverMarkers()}
              <Marker
                ref={el => (this._storeMarker = el)}
                coordinate={{
                  latitude: this.props.storeLocationLatLng.lat,
                  longitude: this.props.storeLocationLatLng.lng
                }}
                onLongPress={() => {
                  this.props.updateModalState("quickControlsModal", true);
                }}
                onPress={() => {
                  this.props.updateModalState("storeLocationPickerModal", true);
                  this._storeMarker.hideCallout();
                }}
                onCalloutPress={() => {
                  this.props.updateModalState("storeLocationPickerModal", true);
                  this._storeMarker.hideCallout();
                }}
                // image={Images.MapIconStore}
                description={this.props.latestStorePickerLocationText}
                title={"Now At:"}
              >
                <FastImage
                  source={Images.MapIconStore10}
                  style={{ width: 40, maxWidth: 40, height: 40 }}
                />
              </Marker>
            </MapView>
          </View>
          <Text
            style={{
              marginTop: "2%",
              fontSize: 12,
              color: "#79879F",
              fontFamily: Constants.fontFamily,
              alignSelf: "center"
            }}
          >
            {"YOU ARE AT: " +
              this.props.latestStorePickerLocationText.toUpperCase()}
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            minHeight: 120,
            height: 120,
            padding: 20,
            margin: 20,
            paddingTop: 3,
            marginTop: 3,
            borderWidth: 1,
            borderColor: "lightblue",
            borderRadius: 15,
            marginBottom: 20,
            overflow: "hidden"
          }}
        >
          <MapView
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{ ...StyleSheet.absoluteFillObject }}
            region={{
              latitude: 51.5407134,
              longitude: -0.1676347,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}
          />
        </View>
      );
    }
  };

  render = () => {
    let inbound = [];
    let inboundCount = 0;

    let circleBgColor =
      this.props.storeActive == true
        ? "#4BC98C"
        : GlobalStyle.modalTextBlackish.color;
    let openStatus = this.props.storeActive == true ? "OPEN" : "SHUT";

    try {
      if (typeof this.state.myStoreOrders !== "undefined") {
        if (this.state.myStoreOrders.length > 0) {
          inbound = this.state.myStoreOrders.filter(
            x => x.state === "DRIVER_EN_ROUTE_TO_STORE"
          );
          inboundCount = inbound.length;
        }
      }
    } catch (error) {
      console.debug("Render broke in Store Home");
    }

    return (
      <View
        style={{
          flexGrow: 1,
          backgroundColor: "#F1F2F6"
          // paddingBottom: 40
        }}
      >
        <Header
          backgroundColor='#2B477C'
          outerContainerStyles={{
            // height: "15%",
            height: "20%",
            marginTop: -20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          }}
          rightComponent={
            <View style={{ minWidth: "70%" }}>
              <TextTicker
                duration={10000}
                loop
                bounce
                repeatSpacer={10}
                marqueeDelay={8000}
                style={{
                  fontFamily: Constants.fontFamilyBold,
                  fontSize: 18,
                  color: "#FFFFFF"
                }}
              >
                {`Store: ${this.state.storeName}`}
              </TextTicker>
              <View style={styles.controls}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.updateModalState("quickControlsModal", true)
                  }
                  style={[styles.status, {}]}
                >
                  <View
                    style={[
                      styles.statusCircle,
                      { backgroundColor: circleBgColor }
                    ]}
                  ></View>
                  <Text style={{ fontSize: 12, color: "#FFFFFF" }}>
                    {openStatus}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.props.updateModalState(
                      "storeLocationPickerModal",
                      true
                    );
                  }}
                  onLongPress={() => this.navigateToStockScreen()}
                >
                  <Image
                    source={Images.NewAppReskinIcon.Controls}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this._toggleShowMap()}>
                  <Image
                    source={
                      this.state.showMap === false
                        ? Images.NewAppReskinIcon.CenterLine
                        : require("../../../assets/icons/RoadMap.png")
                    }
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.props.updateModalState("chatModal", true)}
                >
                  <Image
                    source={Images.NewAppReskinIcon.ChatLine}
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          }
          leftComponent={
            <FastImage
              source={require("../../../assets/img/Onboarding14.png")}
              style={{
                width: 90,
                height: 90,
                marginLeft: -10,
                marginBottom: -15
              }}
            />
          }
        />
        <View style={{ flexGrow: 1 }}>
          {this.state.showMap && this._renderMapView()}

          <View
            style={{
              marginLeft: 6,
              paddingHorizontal: 6,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={styles.heading}>{"FULFILLMENT"}</Text>
            <Text style={{ ...styles.heading, color: "#79879F" }}>
              {inboundCount + " Inbound"}
            </Text>
          </View>
          {this.showOrderList()}
        </View>

        {/* FULL ORDER MODAL */}
        <FullOrderDisplayModal
          mode={"manager"}
          closeMe={this._closeFullOrderModal}
          openClosed={this.state.fullOrderModalOpenClosed}
          ref={"fullOrderDisplayModal"}
          orderNetwork={this.state.selectedOrderNetwork}
          orderAndItems={this.state.selectedOrder}
          fullAddress={this.state.selectedOrderAddress}
        />

        {/* STORE CONTROLS MODAL */}
        <Modal
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "hotpink",
            width: screen.width - 8,
            height: screen.height - 10
          }}
          backdrop={true}
          position={"top"}
          swipeToClose={false}
          onClosed={() => {
            () => this.refs.modal2.close();
          }}
          ref={"modal2"}
        >
          <Header
            backgroundColor={"#FF1493"}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19
            }}
            centerComponent={{
              text: "Store Controls",
              style: { color: "#fff" }
            }}
            rightComponent={{
              icon: "close",
              color: "#fff",
              onPress: () => this.refs.modal2.close()
            }}
          />
          <View style={{ height: 235 }}>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.headline}>{"Opening Hours"}</Text>
              {this.showOpeningHoursList()}
            </ScrollView>

            {/* {OPENING PICKERS} */}
            <DateTimePicker
              isVisible={this.state.isOpeningTimePickerVisible}
              onConfirm={this._handleDatePicked}
              onCancel={this._hideOpeningTimePicker}
              mode={"time"}
            />
            {/* CLOSING PICKER */}
            <DateTimePicker
              isVisible={this.state.isClosingTimePickerVisible}
              isVisible={this.state.isClosingTimePickerVisible}
              onConfirm={this._handleDatePicked}
              onCancel={this._hideClosingTimePicker}
              mode={"time"}
            />
          </View>

          <ScrollView
            style={{
              flexGrow: 1,
              backgroundColor: Color.background
            }}
          >
            <View style={{ flex: 1, paddingBottom: 40 }}>
              <View style={{ marginBottom: 30 }}>
                <Text style={[styles.headline, { paddingTop: 3 }]}>
                  {"Your Location"}
                </Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 10
                  }}
                >
                  <Text
                    style={{
                      color: GlobalStyle.primaryColorDark.color,
                      fontWeight: "bold",
                      textAlign: "center",
                      textShadowColor: "black",
                      textShadowRadius: 1,
                      textShadowRadius: 1
                    }}
                  >
                    {this.props.latestStorePickerLocationText}
                  </Text>
                </View>
                {/* CHANGE STORE LOCATION BUTTON */}
                <View
                  style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 10
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.props.updateModalState(
                        "storeLocationPickerModal",
                        true
                      );
                      this._storeMarker.hideCallout();
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        alignContent: "center",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <FastImage
                        style={{
                          maxHeight: 80,
                          height: 80,
                          width: 80,
                          maxWidth: 80
                        }}
                        source={Images.LaunchMap1}
                        resizeMode='contain'
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          marginBottom: 10,
                          paddingTop: 4,
                          textAlign: "center",
                          color: "silver"
                        }}
                      >
                        {"Change Store Location"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <Divider style={{ backgroundColor: "pink", marginTop: 10 }} />

              <View>
                <Text style={styles.headline}>{"Open Now?"}</Text>
                <View
                  style={{
                    flexDirection: "row"
                  }}
                >
                  {this._renderOpenOrCloseImage()}

                  <View
                    style={{
                      paddingLeft: 10,
                      justifyContent: "center"
                    }}
                  >
                    {/* <Text>{"Active"}</Text> */}

                    <SwitchToggle
                      backgroundColorOff={"grey"}
                      backgroundColorOn={"hotpink"}
                      containerStyle={{
                        marginTop: 5,
                        marginRight: 20,
                        width: 108,
                        height: 48,
                        borderRadius: 25,
                        backgroundColor: "pink",
                        padding: 5
                      }}
                      circleStyle={{
                        width: 28,
                        height: 28,
                        borderRadius: 19,
                        backgroundColor: "white" // rgb(102,134,205)
                      }}
                      switchOn={this.props.storeActive}
                      onPress={() => this.toggleStoreActive()}
                      circleColorOff='white'
                      backgroundColor='hotpink'
                      circleColorOn='white'
                      duration={500}
                    />
                  </View>
                </View>
              </View>
              <Divider style={{ backgroundColor: "pink" }} />
              <View style={{ paddingTop: 10 }}>
                <Button
                  backgroundColor={"pink"}
                  borderRadius={30}
                  width={100}
                  icon={{ name: "ac-unit" }}
                  title='Edit Stocked Products'
                  style={{ paddingBottom: 20 }}
                  onPress={() => this.navigateToStockScreen()}
                />
              </View>
            </View>
          </ScrollView>
        </Modal>
      </View>
    );
  };
}

const mapStateToProps = state => {
  return {
    user: state.user,
    storeActive: state.store.storeActive,
    latestStorePickerLocationText: state.location.latestStorePickerLocationText,
    storeLocationLatLng: state.location.storeLocationLatLng
  };
};

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/StoreRedux");
  const modalActions = require("@redux/ModalsRedux");
  const locationActions = require("@redux/LocationRedux");
  return {
    updateStoreActive: async storeActive => {
      console.debug("Updating store active");
      dispatch(actions.updateStoreActive(dispatch, storeActive));
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
    //this sets the order location
    pushStoreLocation: async (pickedLatLng, latestPickerDestinationText) => {
      console.debug("About to dispatch");
      dispatch(
        locationActions.actions.setStoreLocation(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText
        )
      );
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(StoreHome));
