import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Alert,
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Vibration
} from "react-native";
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Autocomplete from "react-native-autocomplete-input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  GlobalStyle
} from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import { NetworkDisplay } from "@components";
import RNPickerSelect from "react-native-picker-select";
import { Images } from "@common";
import { toast } from "../../../Omni";
import { connect } from "react-redux";
import SwitchToggle from "react-native-switch-toggle";
import SoundPlayer from "react-native-sound-player";
import HopprWorker from "@services/HopprWorker";
import FlashMessage, {
  showMessage,
  hideMessage
} from "react-native-flash-message";
import { EventRegister } from "react-native-event-listeners";
import { isIphoneX } from "react-native-iphone-x-helper";
import DeliveryHelper from "../../../services/DeliveryHelper";
import GeoWorker from "../../../services/GeoWorker";
import OrderRequest from "../../../apiModels/orderRequest/OrderRequest";
import LocationRequest from "../../../apiModels/orderRequest/LocationRequest";
import ItemRequest from "../../../apiModels/orderRequest/ItemRequest";
import AppOrderRequest from "../../../apiModels/orderRequest/AppOrderRequest";
import List from "./List";
import Map from "./Map";
import Button from "./Button";
import styles from "./style";
const { width, height } = Dimensions.get("window");
const listSuggestionPlacement = height * 0.35;
const zeroDeliveryOptions = {
  whichInHouseDriverMightBeDriving: {
    deliveryLatLng: {
      lat: -18.14324,
      lng: -112.7205117
    },
    name: "None",
    address: "None"
  },
  whichStoreIsClosestSelling: {
    deliveryLatLng: {
      lat: -18.14324,
      lng: -112.7205117
    },
    name: "None",
    address: "Nowhere"
  },
  whereItsGoing: "None",
  networkId: -1,
  deliveryMethods: [],
  additionalFees: 0.0
};

const defaultDeliveryOption = {
  id: -1,
  description: "None available",
  deliveryOrderProviderType: "None",
  estimatedPrice: 0,
  estimatedMinsToPickupTime: "N/A",
  wasChosen: false,
  cssColor: GlobalStyle.primaryColorDark.color,
  displayName: "None",
  imageUrl: Images.SadFace
};

const textInputColor1 = "#00b2be";
const textInputColor2 = "silver";
const clearIconSize = 32;
const heightForTHeAutocompletes = 50;
const backgroundColorForDropdowns = "black";
const oldStyles = StyleSheet.create({
  mainModalHeight: isIphoneX() ? 572 : 512,
  modalTopPadding: isIphoneX() ? 60 : 6,
  modalCloseIconTopPadding: isIphoneX() ? 18 : 1,
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff"
  },
  driverButtonViewContainer: {
    padding: 5
  }
});

const defaultState = {
  extraScrollHeight:0,
  locationAutocompletePossibleResults: [],
  locationAutocompleteLatestSearchTerm: "",
  //transient fields for inputs
  currentLocationAutoSearchTerm: "",
  courierNetwork: undefined,
  selectedDeliveryProductItemId: -1,
  courierProducts: [],
  deliveryOptions: zeroDeliveryOptions,
  selectedDeliveryOption: defaultDeliveryOption,
  currentPrice: 0.0,
  pickupAddressAsString: "None",
  pickupPhoneNumber: "",
  dropOffPhoneNumber: "",
  pickupInstructions: "", //this become the ghost store name
  dropoffNote: "",
  txtInputColor1: textInputColor1,
  txtInputColor2: textInputColor2,
  pickupGeoResult: undefined //this is set when they type in a pickup destination, a location georesultsa
};

class CourierControlsModal extends Component {
  constructor(props) {
    super(props);
    console.debug("CourierControlsModal modal constructor");
    this.state = defaultState;
  }

  componentDidMount = async () => {
    this.unsubscribeWillFocus = this.props.navigation.addListener(
      "willFocus",
      this.load
    );
  };
  componentWillUnmount = () => {
    try {
      this.unsubscribeWillFocus();
    } catch (error) {}
  };

  _resetDeliveryOptions = () => {
    this.setState({
      deliveryOptions: zeroDeliveryOptions,
      selectedDeliveryOption: defaultDeliveryOption
    });
  };

  /** price is held in selected deliveryOptiions. Options are refreshed when new package size is chosen */
  _updateCurrentPrice = () => {
    //we need a selected item, plus a selected option
    if (
      this.state.selectedDeliveryProductItemId != -1 &&
      this.state.deliveryOptions.networkId != -1
      //&& this.state.selectedDeliveryOption.id != -1
    ) {
      let newPrice =
        this.state.selectedDeliveryOption.estimatedPrice +
        this.state.deliveryOptions.additionalFees;
      this.setState({ currentPrice: newPrice });
      //alert("All criteria were met!!")
    }
  };

  _getDeliveryOptions = async () => {
    if (
      typeof this.props.fullGeoDestinationAddress !== "undefined" &&
      typeof this.state.pickupGeoResult !== "undefined"
    ) {
      let smoosheditemsArray = [];
      let pcourierProd = this.state.courierProducts.find(
        x => x._id == this.state.selectedDeliveryProductItemId
      );

      try {
        smoosheditemsArray.push({
          productId: pcourierProd._id,
          amount: 1
        });
      } catch (error) {
        alert(
          "Sorry, there was a momentary connection error, please try again"
        );
      }

      const theDeliveryUrl = DeliveryHelper.generateCustomerCourierDeliveryOptionsUrl(
        this.state.pickupGeoResult.streetNumber,
        this.state.pickupGeoResult.streetName,
        this.state.pickupGeoResult.subAdminArea,
        this.state.pickupGeoResult.postalCode,
        this.props.fullGeoDestinationAddress.streetNumber,
        this.props.fullGeoDestinationAddress.streetName,
        this.props.fullGeoDestinationAddress.subAdminArea,
        this.props.fullGeoDestinationAddress.postalCode,
        smoosheditemsArray,
        "small",
        this.state.courierNetwork.networkId
      );

      console.debug("Stop");
      let deliveryOptions = await HopprWorker.getAvailableDeliveryOptionsExternal(
        theDeliveryUrl
      );
      console.debug("Stop");
      toast("Response for delivery request was: " + deliveryOptions.status);
      if (deliveryOptions.status == 200) {
        let firstOption = deliveryOptions.data.deliveryMethods[0];
        this.setState(
          {
            deliveryOptions: deliveryOptions.data,
            selectedDeliveryOption: firstOption
          },
          () => {
            this._updateCurrentPrice();
          }
        );
      }
    } else {
      let title =
        typeof this.state.pickupGeoResult === "undefined"
          ? "pickup"
          : "destination";

      this.refs.localFlashMessage.showMessage({
        message: `Set ${title} location`,
        duration: 7200,
        backgroundColor: "hotpink", // background color
        description: `You need to set a ${title} location first. We have auto-set your current location for you.`,
        color: "white", // text colo
        position: "top",
        autoHide: true,
        style: {
          borderRadius: 8
        }
      });
    }
  };

  _renderPackageSizePickerRow = () => {
    const myPackageItems = this.state.courierProducts.map(prod => ({
      label: prod.name,
      value: prod._id
    }));
    if (
      true
      //this.state.courierProducts.length > 0
    ) {
      return (
        <View
          style={{
            flex: 1,
            overflow: "hidden",
            borderWidth: 0,
            fontSize: 12
          }}
        >
          <RNPickerSelect
            placeholder={{
              label: "Select Package Size",
              value: -1
            }}
            style={{
              placeholder: "black",
              flex: 1,
              borderWidth: 1,
              borderColor: "orange",
              height: 20,
              //alignItems: "center",
              inputIOS: {
                //textAlign: "center",
                color: "black",
                marginLeft: "8%",
                fontSize: 13,
                fontFamily: "RedHatDisplay-Regular"
              },
              inputAndroid: {
                marginLeft: "8%",
                fontSize: 13,
                fontFamily: "RedHatDisplay-Regular",
                //textAlign: "center",
                color: "black"
              }
            }}
            inputStyle={styles.textInputText}
            onValueChange={async (itemValue, index) => {
              if (itemValue != -1) {
                itemValue &&
                  (await this._changePackageSizePickerValue(itemValue));
              }
            }}
            value={this.state.selectedDeliveryProductItemId}
            items={myPackageItems}
          />
        </View>
      );
    }
  };

  _changePackageSizePickerValue = async itemValue => {
    try {
      this.setState({ selectedDeliveryProductItemId: itemValue });
      //refresh deliveryOptions
      let selectedDeliveryProduct = this.state.courierProducts.find(
        x => x._id == itemValue
      );
      //update options
      this._resetDeliveryOptions();
      await this._getDeliveryOptions();
      this._updateCurrentPrice();
    } catch (error) {}
  };

  _changeCourierPickerValue = async itemValue => {
    try {
      let selectedDeliveryOp = this.state.deliveryOptions.deliveryMethods.find(
        x => x.id == itemValue
      );
      this.setState({ selectedDeliveryOption: selectedDeliveryOp }, () => {
        this._updateCurrentPrice();
      });
    } catch (error) {}
  };

  _renderCourierPickerRow = () => {
    try {
      if (
        true
        //this.state.deliveryOptions.deliveryMethods.length > 0
      ) {
        let myDeliveryOptionItems = {
          label: "None",
          value: -1
        };

        let idValueForControl = 0;
        if (typeof this.state.selectedDeliveryOption.id !== "undefined") {
          idValueForControl = this.state.selectedDeliveryOption.id;
        }

        try {
          myDeliveryOptionItems = this.state.deliveryOptions.deliveryMethods.map(
            deliveryMethod => ({
              label: deliveryMethod.displayName,
              value: deliveryMethod.id
            })
          );
        } catch (error) {}
        return (
          <View
            style={{
              flex: 1,
              overflow: "hidden",
              borderWidth: 0,
              fontSize: 12
            }}
          >
            <RNPickerSelect
              placeholder={{
                value: -1,
                label: "No courier available"
              }}
              textInputProps={{
                placeholderTextColor: "red"
              }}
              style={{
                placeholder: "black",
                flex: 1,
                borderWidth: 1,
                borderColor: "orange",
                height: 20,
                //alignItems: "center",
                inputIOS: {
                  //textAlign: "center",
                  color: "black",
                  marginLeft: "8%",
                  fontSize: 13,
                  fontFamily: "RedHatDisplay-Regular"
                },
                inputAndroid: {
                  marginLeft: "8%",
                  fontSize: 13,
                  fontFamily: "RedHatDisplay-Regular",
                  //textAlign: "center",
                  color: "black"
                }
              }}
              inputStyle={styles.textInputText}
              onValueChange={async (itemValue, index) => {
                if (itemValue != -1) {
                  itemValue &&
                    (await this._changeCourierPickerValue(itemValue));
                }
              }}
              value={idValueForControl}
              items={myDeliveryOptionItems}
            />
          </View>
        );
      }
    } catch (error) {}
  };

  _reverseGeocodeTappedAddressAndUpdatePickupLocation = async pickedAddressString => {
    let geoResult = await GeoWorker.geocode(pickedAddressString);
    let geoLatLng = {
      lat: geoResult.position.lat,
      lng: geoResult.position.lng
    };

    this.setState({
      pickupAddressAsString: pickedAddressString,
      pickupGeoResult: geoResult,
      pickupGeoLatLng: geoLatLng
    });

    // //launch location modal
    // this.props.updateModalState("locationPickerModal", true);

    this._clearAutocompleteLocationSuggestions();
    this.clearLocationInputText();
    SoundPlayer.playSoundFile("notification5", "mp3");

    this.refs.localFlashMessage.showMessage({
      message: "Your order pickup was set!",
      duration: 2500,
      backgroundColor: "hotpink", // background color
      description: `We're fetching delivery options for ${pickedAddressString} to ${this.props.latestPickerDestinationText}`,
      color: "white", // text color
      position: "top",
      autoHide: true,
      style: {
        borderRadius: 8
      }
    });

    await this._getDeliveryOptions();
  };

  clearLocationInputText() {
    this._locationTextInput.setNativeProps({ text: " " });

    setTimeout(() => {
      this._locationTextInput.setNativeProps({ text: "" });
    }, 3);
  }

  _renderAutocompletePickupItems = ({ item }) => {
    return (
      <ListItem
        titleNumberOfLines={6}
        subtitleNumberOfLines={4}
        title={"TEST"}
        hideChevron={false}
      ></ListItem>
    );
  };

  _showPickeableAddressList = () => {
    return (
      <View style={{ flex: 1, position: "absolute", maxHeight: 100 }}>
        <FlatList
          style={{ flex: 1 }}
          data={this.props.locationAutocompletePossibleResults}
          renderItem={this._renderAutocompletePickupItems}
          keyExtractor={item => item._id}
        />
      </View>
    );
  };

  _clearAutocompleteLocationSuggestions = () => {
    this.setState({ locationAutocompletePossibleResults: [] });
  };

  _renderLocationAutocomplete = () => {
    return (
      <TouchableOpacity
        onPress={() => this._locationTextInput.focus()}
        style={{
          flex: 1,
          borderWidth: 0,
          borderColor: "white",
          justifyContent: "center",
          borderRadius: 20,
          flexWrap: "wrap",
          position: "absolute"
        }}
      >
        <Autocomplete
          //hideResults={false}
          data={this.state.locationAutocompletePossibleResults}
          containerStyle={{
            borderWidth: 0,
            borderColor: "white",
            flexWrap: "wrap"
          }}
          //defaultValue={this.state.locationAutocompleteLatestSearchTerm}
          inputContainerStyle={{
            flexWrap: "wrap",
            // color: "black",
            borderWidth: 0,
            overflow: "hidden"
          }}
          listStyle={{
            zIndex: 9999,
            //  position:"absolute",
            right: 0,
            flex: 1,
            maxHeight: 80,
            fontSize: 12,
            borderWidth: 1,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            minWidth: width * 0.5 - 20,
            fontFamily: Constants.fontFamily,
            borderColor: GlobalStyle.primaryColorDark.color,
            borderRadius: 8,
            backgroundColor: GlobalStyle.primaryColorDark.color,
            overflow: "hidden"
          }}
          clearButtonMode={"always"}
          onChangeText={text => this.getLocationAutocomplete(text)}
          renderTextInput={() => this._renderTextInputForLocationAutocomplete()}
          renderItem={(item, i) => (
            <View
              style={{
                borderWidth: 0,
                borderColor: GlobalStyle.primaryColorDark.color,
                borderRadius: 20,
                backgroundColor: backgroundColorForDropdowns
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this._reverseGeocodeTappedAddressAndUpdatePickupLocation(
                    item.item
                  );
                  //launch location picker modal once redux done

                  //clear suggestions box
                  // this._clearAutocompleteLocationSuggestions();
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontFamily: Constants.fontFamily
                  }}
                >
                  {" " + item.item}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </TouchableOpacity>
    );
  };

  /**For location Autocomplete */
  _renderTextInputForLocationAutocomplete = () => {
    let placeholderTExt = "Pickup from...   ";
    let pickupAddressAsString = this.state.pickupAddressAsString;
    let colorOfPlaceHolder = "grey";

    placeholderTExt = "From: " + pickupAddressAsString;
    colorOfPlaceHolder = GlobalStyle.primaryColorDark.color;

    return (
      <TextInput
        style={{
          flex: 1,
          color: "#24333D",
          textAlign: "right",
          fontSize: 12,
          fontFamily: "RedHatDisplay-Regular",
          backgroundColor: "transparent"
        }}
        multiline={true}
        onEndEditing={() => this._isValid()}
        numberOfLines={2}
        //   value={this.state.currentLocationAutoSearchTerm}
        placeholder={placeholderTExt}
        placeholderTextColor={"black"}
        onChangeText={text => this.getLocationAutocomplete(text)}
        ref={component => (this._locationTextInput = component)}
      />
    );
  };

  getLocationAutocomplete = async phrase => {
    this.setState({ currentLocationAutoSearchTerm: phrase });
    if (phrase.length > 4) {
      //save what we searched fors
      let test = "";
      let geoResults = await GeoWorker.geocodeAllResults(phrase);
      let ourGeoResult = [];

      //build result set single dimenson array of strings to return
      geoResults.map(x => {
        ourGeoResult.push(x.formattedAddress);
      });

      this.setState(
        { locationAutocompletePossibleResults: ourGeoResult },
        () => {
          console.debug("Yoooo");
        }
      );
      //then save the results to the place where dropdown is mapped
      //this.props.updateProductAutocompleteSearchResults(phrase, result);
    }
  };

  load = async () => {
    console.debug("in quick controls");
    if (!this.state.loadFired) {
      this.setState({ loadFired: true });
      //make sure logged in
      if (
        this.props.user.user != null &&
        typeof this.props.user.user !== "undefined"
      ) {
        //get

        let couriersResponse = await HopprWorker.getCustomerCourierNetwork();
        let weGetHere = "";
        if (couriersResponse.status == 200) {
          let courierData = couriersResponse.data;
          this.setState({
            courierNetwork: courierData.network,
            selectedDeliveryProductItemId: courierData.products[0]._id,
            courierProducts: courierData.products
          });

          //get options IF there is location set!
          await this.getCurrentLocationAndUpdatePickupLocation();
        }
      } else {
        toast("You're not logged in!! We can't show you this!");
        this.closeMe();
      }
    }
  };

  doesStripeCustomerExistInApi = async () => {
    try {
      let customerResponse = await HopprWorker.doesStripeCustomerExistOnHopprServerForUser(
        "STRIPE"
      );
      return customerResponse;
    } catch (error) {
      console.debug("Couldn't check if payment customer existed");
    }
  };

  _isValid = () => {
    let errorString = "";
    let result = false;
    if (
      this.state.pickupAddressAsString == "" ||
      this.state.pickupAddressAsString == "None"
    ) {
      errorString = errorString + "You need to set a pickup address!\n";
    }
    if (this.state.pickupInstructions == "") {
      errorString =
        errorString +
        "Can you add a quick description of the pickup location in the pickup note! E.g. 'Garden Flat', or 'go around the side gate'\n";
    }
    if (
      this.props.latestPickerDestinationText == "None" ||
      typeof this.props.latestPickerDestinationText === "undefined" ||
      this.props.latestPickerDestinationText == ""
    ) {
      errorString = errorString + "Set a delivery destination!\n";
    }

    result = errorString !== "" ? false : true;

    if (result == false) {
      this.refs.localFlashMessage.showMessage({
        message: "Sorry, there were some issues",
        autoHide: true,
        style: {
          borderRadius: 8
        },
        duration: 12000,
        position: "center",
        description: errorString,
        backgroundColor: "red", // background color
        color: "white" // text color
      });
    }

    return result;
  };

  isDefaultPaymentSourceSet = async () => {
    console.debug("checking default payment source");
    let defaulPsReponse = await HopprWorker.isStripeCustomerDefaultPaymentSourceSet(
      "STRIPE"
    );
    console.debug("checked default payment source");
    return defaulPsReponse;
  };

  _placeExternalCourierOrder = async () => {
    try {
      if (this._isValid()) {
        EventRegister.emit("showSpinner");
        //toast("Attempting to make payment request");
        //send token to server
        let exstingCustomerbool = await this.doesStripeCustomerExistInApi();
        if (exstingCustomerbool == false) {
          //there should be a customer alrea.....dy created when card was added.
          //doesn't exist, need to create token and create new customer
          // Create a Stripe token with new card infos

          //show card modal, get them to add a card - show message about needing defaul card!

          console.debug("there is no customer in API");
          //this.props.updateModalState("addRemoveCardModal", true);
          alert(
            "You have no default payment customer set!!Please add a card!!"
          );
          return;
        }
        toast(
          "Found a payment customer - About to create order request going to: " +
            this.props.latestPickerDestinationText
        );
        //check default payment source is set
        console.debug("checking default payment src set");
        let isPaymentSourceSet = await this.isDefaultPaymentSourceSet();
        if (isPaymentSourceSet) {
          //now customer deffo exists, place order - the charge will be created by the server
          console.debug("found default payment source");
          //check there is a default payment source in the api
          //CHECK USER IS OLD ENOUGH
          await this.createOrderRequest();
        } else {
          //tell them it's not set and open the modal to set a card
          //this.props.updateModalState("addRemoveCardModal", true);

          this.props.updateModalState("addRemoveCardModal", true);
          setTimeout(() => {
            Alert.alert(
              "Set payment source",
              "You have no default payment source set!! If you could set one please!"
            );
          }, 300);
        }
      }
    } catch (error) {
      console.debug(error);
    } finally {
      EventRegister.emit("hideSpinner");
    }
  };

  createOrderRequest = async () => {
    //open order request modal
    let selectedNetworkId = this.state.deliveryOptions.networkId;
    if (selectedNetworkId == -1) {
      alert("You need to select an item");
      return;
    }
    //do some checks - items, payment etc before we put the order in
    let orderDestinationLatLng = this.props.orderDestinationLatLng;
    let resolvedOrderAddress = this.props.latestPickerDestinationText;
    let pickupAddress = this.state.pickupAddressAsString;

    let dest = new LocationRequest(
      orderDestinationLatLng.lat,
      orderDestinationLatLng.lng
    );
    let itemsReq = new Array();
    itemsReq.push(new ItemRequest(this.state.selectedDeliveryProductItemId, 1));

    //if it's a stuart delivery option currently selected
    //order, we need to add the storeId returned in that delivery option
    //and 'tell' the system which store we want to use
    let selectedDeliveryType = this.state.selectedDeliveryOption
      .deliveryOrderProviderType;
    let request = new OrderRequest(
      selectedNetworkId,
      this.props.user.user.customerId,
      dest,
      itemsReq,
      "",
      "",
      "",
      resolvedOrderAddress
    );

    let pickupPhoneNumber =
      this.state.pickupPhoneNumber == ""
        ? this.props.user.user.customer.telephone
        : this.state.pickupPhoneNumber;
    let payload = new AppOrderRequest(request, dest, selectedDeliveryType);
    //update payload
    payload.createGhostStoreRequest = {
      fullAddress: pickupAddress,
      pickupContactName: "Test contact",
      pickupEmail: this.props.user.user.customer.email,
      pickupLabelOrStoreName: this.state.pickupInstructions,
      pickupTelephone: pickupPhoneNumber
    };
    payload.orderType = "Customer_Courier";

    this.refs.localFlashMessage.showMessage({
      message: "We are creating your order",
      autoHide: true,
      duration: 2200,
      position: "center",
      description: "Give us a second...",
      backgroundColor: "lightgreen", // background color
      color: "white" // text color
    });

    try {
      //post the request
      console.debug("About to create order");
      this.closeMe();
      HopprWorker.createNewCustomerCourierOrder(JSON.stringify(payload))
        .then(x => {
          console.debug("We created an order!!");
          //activate the modal
          //push to redux if successful, if not tell the customer it failed
          //if(true) {
          if (x.status == 200 || x.status == 201) {
            //toast("Order was created!!!!");
            //remove items from cart

            showMessage({
              message: "Searching for a driver",
              autoHide: true,
              duration: 4000,
              position: "center",
              description:
                "This can take from a few seconds to a couple of minutes, depending on numerous factors.. please be patient!!\n\n You can still cancel.",
              backgroundColor: GlobalStyle.softLinkColor.color, // background color
              color: "white" // text color
            });
          } else if (x.status == 500) {
            this.props.updateModalState("orderRequestedModal", true);
            alert(
              x.data.exceptionMessage +
                " --- " +
                (x.data.innerException.exceptionMessage || "")
            );
            EventRegister.emit("hideOrderRequestModal");
            SoundPlayer.playSoundFile("negative1", "mp3");
          } else if (x.status == 400) {
            this.props.updateModalState("orderRequestedModal", false);
            this.refs.localFlashMessage.showMessage({
              message: "Your order failed",
              autoHide: true,
              duration: 20000,
              position: "center",
              description: JSON.parse(x.data.message),
              backgroundColor: "red", // background color
              color: "white" // text color
            });

            SoundPlayer.playSoundFile("negative1", "mp3");
          } else {
            alert("Sorry, that didn't work! Response was: " + x.status);
          }
        })
        .catch(err => {
          toast("Error in order creation");
          console.debug(err);
        });

      //redirect to order tracking view
    } catch (error) {
      toast("Error in order creation");
      console.debug(error);
    }
  };

  _clearPickupLocationInputs = () => {
    this.setState({
      currentLocationAutoSearchTerm: "",
      pickupAddressAsString: "None",
      locationAutocompletePossibleResults: []
    });
  };

  getCurrentLocationAndUpdatePickupLocation = async (showDaMessage = true) => {
    this._clearPickupLocationInputs();

    BackgroundGeolocation.getCurrentLocation(async position => {
        var lat = parseFloat(position.latitude);
        var long = parseFloat(position.longitude);

        //reverse geocode lat / lng and put in pickup
        let addressResult = await GeoWorker.reverseGeocode(lat, long);
        let geoLatLng = {
          lat: addressResult.position.lat,
          lng: addressResult.position.lng
        };

        this.setState(
          {
            pickupAddressAsString: addressResult.formattedAddress,
            pickupGeoResult: addressResult,
            pickupGeoLatLng: geoLatLng
          },
          async () => {
            await this._getDeliveryOptions();
          }
        );

        if (showDaMessage) {
          //  showMessage({
          //   message: "Current location set",
          //   duration: 16800,
          //   backgroundColor: "lightblue", // background color
          //   description: "Pick a package size, choose a courier, give some pickup instructions and you're ready to go. You can also add phone numbers for pickkup and drop-off",
          //   color: "white", // text color
          //   position: "bottom",
          //   autoHide: true,
          //   style: {
          //     borderRadius: 8,
          //   },
          // });
        }
      },
      error => this.setState({ error: error.message })
    );
  };

  _getEstimatedPickupTime = () => {
    if (typeof this.state.selectedDeliveryOption !== "undefined") {
      return this.state.selectedDeliveryOption.estimatedMinsToPickupTime;
    }

    return "None";
  };

  _renderListForLocationAutoComplete=()=>{
    if(this.state.locationAutocompletePossibleResults.length > 0 && !this.state.hideLocationSuggestions)
    return(     
        <View style={{
          left: 38,                 
          right: 38,
          position:"absolute",
          top: listSuggestionPlacement,
          paddingTop:20,
          paddingBottom:20,
          borderBottomLeftRadius:30,
          borderBottomRightRadius:30,         
          overflow:"hidden",
          backgroundColor:GlobalStyle.primaryColorDark.color,
          elevation:9999,
          zIndex: 9999}}>
          <View style={{zIndex:7,             
            maxHeight: height - listSuggestionPlacement}}>           
          <FlatList                                          
            data={this.state.locationAutocompletePossibleResults}
            renderItem={this._renderItemLocationAutocomplete}
            //keyExtractor={(item) => item.item.}
        />         
    </View>
    </View>
    )
  }

  _renderItemLocationAutocomplete=(item, i)=>{
    return  (
      <View
        style={{                    
          borderWidth: 0,
          //borderColor: GlobalStyle.primaryColorDark.color,
          borderRadius: 0,
          //maxWidth: locationAutocompleteWidth + 400,               
        }}
      >
        <TouchableOpacity
          onPress={() => {
            try {
              this._reverseGeocodeTappedAddressAndUpdatePickupLocation(
                item.item
              );
              //launch location picker modal once redux done                        
            } catch (error) {
              
            }
            finally{
              //clear suggestions box                  
             
            }                  
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily:Constants.fontFamily,
              textAlign:"center",
             // maxWidth: locationAutocompleteWidth + 400,
              fontSize: 18,
            }}
          >
            {"Update destination: " + item.item}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    console.debug("Welcome to quick controls modal");
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    let minsToPickupTime = 0;
    if (typeof this.state.selectedDeliveryOption !== "undefined") {
      minsToPickupTime = this.state.selectedDeliveryOption
        .estimatedMinsToPickupTime;
    }

    const data = [
      {
        pickup: "141 Drummond St, Kings Cross, London NW12PB, UK",
        goingTo: "141 Drummond St, Kings Cross, London NW12PB, UK",
        price: 4.8,
        time: 0
      }
    ];

    return (
      <Modal
        style={{
          height: null,
          backgroundColor: "transparent",
          flex: 1,
          borderRadius: 8
        }}
        backdrop={true}
        backdropOpacity={0.7}    
        backdropPressToClose={true}    
        swipeToClose={true}
        //  coverScreen={false}
        position={"center"}
        ref={"courierControlsModal"}
        isOpen={this.props.openClosed}       
        onOpened={async () => await this.load()}
        onClosed={() => {
          this.setState({ loadFired: false });
          this.closeMe();
        }}
      >
        <KeyboardAwareScrollView ref={(view) => {
            this.scrollView = view;
          }}
         extraScrollHeight={this.state.extraScrollHeight}
         contentContainerStyle={{ height: "95%" }}>
          {/* <KeyboardAvoidingView
          behavior='padding'
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 70 })}
        > */}
          <View style={styles.modalMain}>
            <View style={{ flex: 1, paddingTop: oldStyles.modalTopPadding }}>
              <View style={styles.body}>
                <Header
                  backgroundColor={GlobalStyle.modalHeader.backgroundColor}
                  outerContainerStyles={{
                    height: 49,
                    borderTopLeftRadius: 19,
                    borderTopRightRadius: 19
                  }}
                  rightComponent={{
                    icon: "close",
                    color: "#fff",
                    onPress: () => this.props.closeMe()
                  }}
                  centerComponent={{
                    text: "Create Delivery",
                    style: {
                      fontSize: 14,
                      color: GlobalStyle.modalTextBlackish.color,
                      fontFamily: Constants.fontHeader
                    }
                  }}
                />
                <View style={styles.content}>
                  <View style={{ height: "35%", marginTop: "2%" }}>
                    <List
                      openLocationPickerModal={() => {
                        this.props.updateModalState(
                          "locationPickerModal",
                          true
                        );
                        this.closeMe();
                      }}
                      clearInputs={() => this._clearPickupLocationInputs()}
                      setCurrentLocation={async () =>
                        await this.getCurrentLocationAndUpdatePickupLocation()
                      }
                      pickupIn={() => this._getEstimatedPickupTime()}
                      price={this.state.currentPrice}
                      goingTo={this.props.latestPickerDestinationText}
                      renderLocationAutocomplete={() =>
                        this._renderTextInputForLocationAutocomplete()
                      }
                      data={data}
                    />
                  </View>
                  <View style={{ minHeight: 14 }}></View>
                  <Map
                    currentPickupAddress={this.state.pickupAddressAsString}
                  />

                  <View style={styles.row}>
                    <View style={styles.textInputcontainer}>
                      <Image
                        source={require("../../../../assets/icons/Track.png")}
                        style={styles.textInputImage}
                      />
                      {this._renderPackageSizePickerRow()}
                      {/* <Text style={styles.textInputText}>{"Text Input"}</Text> */}
                    </View>

                    <View style={styles.textInputcontainer}>
                      <Image
                        source={require("../../../../assets/icons/Driver.png")}
                        style={styles.textInputImage}
                      />
                      {this._renderCourierPickerRow()}
                      {/* <Text style={styles.textInputText}>{"Text Input"}</Text> */}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => this._pickupInstructionsInput.focus()}
                      style={styles.textInputcontainer}
                    >
                      <Image
                        source={Images.NewBlueIcons.blueFileLine2}
                        style={styles.textInputImage}
                      />
                      <TextInput
                        ref={ref => (this._pickupInstructionsInput = ref)}
                        placeholderTextColor={"black"}
                        onEndEditing={() => this._isValid()}
                        onChangeText={val =>
                          this.setState({ pickupInstructions: val })
                        }
                        onFocus={(event: Event) => {
                          // `bind` the function if you're using ES6 classes
                          this.setState({extraScrollHeight: 80})
                        }}
                        onBlur={()=>{
                          this.setState({extraScrollHeight: 0})
                        }}
                        placeholder={"Pickup note"}
                        placeholderTextColor={"black"}
                        // value={this.state.pickupInstructions}
                        numberOfLines={1}
                        style={styles.textInputText}
                      ></TextInput>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => this._dropOffNoteInput.focus()}
                      style={styles.textInputcontainer}
                    >
                      <Image
                        source={Images.NewBlueIcons.blueFileLine2}
                        style={styles.textInputImage}
                      />
                      <TextInput
                        ref={ref => (this._dropOffNoteInput = ref)}
                        placeholderTextColor={"black"}
                        onEndEditing={() => this._isValid()}
                        onChangeText={val =>
                          this.setState({ dropoffNote: val })
                        }
                        onFocus={(event: Event) => {
                          // `bind` the function if you're using ES6 classes
                          this.setState({extraScrollHeight: 80})
                        }}
                        onBlur={()=>{
                          this.setState({extraScrollHeight: 0})
                        }}
                        placeholder={"Drop-off note"}
                        // value={this.state.dropoffNote}
                        numberOfLines={1}
                        style={styles.textInputText}
                      ></TextInput>
                    </TouchableOpacity>
                    {/* <Button
                    label='Drop-off Note'
                    image={require("../../../../assets/icons/Browse.png")}
                  /> */}
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => this._pickupPhoneInput.focus()}
                      style={styles.textInputcontainer}
                    >
                      <Image
                        source={Images.NewBlueIcons.bluePhone1}
                        style={styles.textInputImage}
                      />
                      <TextInput
                        ref={ref => (this._pickupPhoneInput = ref)}
                        onEndEditing={() => this._isValid()}
                        onFocus={(event: Event) => {
                          // `bind` the function if you're using ES6 classes
                          this.setState({extraScrollHeight: 80})
                        }}
                        onBlur={()=>{
                          this.setState({extraScrollHeight: 0})
                        }}
                        onChangeText={val =>
                          this.setState({ pickupPhoneNumber: val })
                        }
                        placeholder={"Pickup phone"}
                        placeholderTextColor={"black"}
                        onEndEditing={() => this._isValid()}
                        numberOfLines={1}
                        // value={this.state.pickupPhoneNumber}
                        style={styles.textInputText}
                      ></TextInput>
                    </TouchableOpacity>

                    {/* <Button
                    label='Pickup Phone'
                    image={require("../../../../assets/icons/Track.png")}
                  /> */}

                    <TouchableOpacity
                      onPress={() => this._dropoffPhoneInput.focus()}
                      style={styles.textInputcontainer}
                    >
                      <Image
                        source={Images.NewBlueIcons.bluePhone1}
                        style={styles.textInputImage}
                      />
                      <TextInput
                        ref={ref => (this._dropoffPhoneInput = ref)}
                        placeholderTextColor={"black"}
                        onEndEditing={() => this._isValid()}
                        onChangeText={val =>
                          this.setState({ dropOffPhoneNumber: val })
                        }
                        //  value={this.state.dropOffPhoneNumber}
                        placeholder={"Drop-off phone"}
                        onFocus={(event: Event) => {
                          // `bind` the function if you're using ES6 classes
                          this.setState({extraScrollHeight: 80})
                        }}
                        onBlur={()=>{
                          this.setState({extraScrollHeight: 0})
                        }}
                        onEndEditing={() => this._isValid()}
                        numberOfLines={1}
                        style={styles.textInputText}
                      ></TextInput>
                    </TouchableOpacity>

                    {/* <Button
                    label='Drop-off Phone'
                    image={require("../../../../assets/icons/Track.png")}
                  /> */}
                  </View>

                  <TouchableOpacity
                    onPress={() => this._placeExternalCourierOrder()}
                    style={{
                      backgroundColor: "#3559A2",
                      width: "85%",
                      borderRadius: 50,
                      height: "8%",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      bottom: "2%"
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "RedHatDisplay-Bold",
                        fontSize: 20
                      }}
                    >
                      Let's Go
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
        {/* </KeyboardAvoidingView> */}
        {this._renderListForLocationAutoComplete()} 
        <FlashMessage ref='localFlashMessage' />
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    locationWatchId: state.location.locationWatchId,
    storeActive: state.store.storeActive,
    driverActive: state.driver.driverActive,
    orderIsActive: state.driver.orderIsActive,
    keepAliveCycleTimerId: state.driver.keepAliveCycleTimerId,
    latestPickerDestinationText: state.location.latestPickerDestinationText,
    orderDestinationLatLng: state.location.mostRecentOrderDestinationLatLng,
    fullGeoDestinationAddress: state.location.fullGeoDestinationAddress //to query delivery methods
  };
};

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/StoreRedux");
  const modalActions = require("@redux/ModalsRedux");
  const locationActions = require("@redux/LocationRedux");
  const driverStateActions = require("@redux/DriverRedux");
  return {
    checkDriverStatusInApiAndSetDriverActiveVariable: async (
      driverId,
      orderIsActive
    ) => {
      console.debug("let's check this shit");
      return driverStateActions.actions.checkDriverStatusInApiAndSetDriverActiveVariable(
        dispatch,
        driverId,
        orderIsActive
      );
    },
    turnDriverOn: driverId => {
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
    updateDriverState: async (_driverActive, _orderIsActive) => {
      console.debug("driver active:" + _driverActive + " " + _orderIsActive);
      let activeDriverState = {
        driverActive: _driverActive,
        orderIsActive: _orderIsActive
      };
      dispatch(
        driverStateActions.actions.updateDriverState(
          dispatch,
          activeDriverState
        )
      );
    },
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
      dispatch(
        locationActions.actions.setStoreLocation(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText
        )
      );
    },
    startLocationWatchAndApiLocationPush: async (
      relationGuid,
      urlToPostTo,
      locationWatchId
    ) => {
      locationActions.actions.startLocationWatchWithApiLocationPush(
        dispatch,
        relationGuid,
        urlToPostTo,
        locationWatchId
      );
    },
    endLocationWatchWithApiLocationPush: async locationWatchId => {
      locationActions.actions.endLocationWatchWithApiLocationPush(
        dispatch,
        locationWatchId
      );
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(CourierControlsModal));
