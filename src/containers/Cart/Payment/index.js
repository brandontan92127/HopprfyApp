/** @format */

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Text,
  Dimensions,
  ScrollView,
  View,
  TouchableHighlight,
  Image,
  Alert
} from "react-native";
import css from "@cart/styles";
import { connect } from "react-redux";
import { warn, toast, currencyFormatter } from "@app/Omni";
import { Button, ConfirmCheckout } from "@components";
import { Languages, Config, Images, withTheme, Constants, GlobalStyle } from "@common";
import Buttons from "@cart/Buttons";
import HTML from "react-native-render-html";
import styles from "./styles";
import checkoutStyles from "../../../components/ConfirmCheckout/styles";
import SwitchToggle from "react-native-switch-toggle";
//nadav
import HopprWorker from "../../../services/HopprWorker";
import OrderRequest from "../../../apiModels/orderRequest/OrderRequest";
import LocationRequest from "../../../apiModels/orderRequest/LocationRequest";
import ItemRequest from "../../../apiModels/orderRequest/ItemRequest";
import AppOrderRequest from "../../../apiModels/orderRequest/AppOrderRequest";
import Stripe from "react-native-stripe-api";

import { EventRegister } from "react-native-event-listeners";
import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import Carousel from "react-native-snap-carousel";
import SoundPlayer from "react-native-sound-player";
import FastImage from "react-native-fast-image";

const { width } = Dimensions.get("window");
const carouselHeightWidth = 200;
const carouselContainerHeightWidth = 240;

class PaymentOptions extends Component {
  static propTypes = {
    message: PropTypes.array,
    type: PropTypes.string,
    cleanOldCoupon: PropTypes.func,
    onNext: PropTypes.func,
    user: PropTypes.object,
    userInfo: PropTypes.object,
    currency: PropTypes.any,
    payments: PropTypes.object,
    isLoading: PropTypes.bool,
    cartItems: PropTypes.any,
    filteredCartItems: PropTypes.any,
    onShowCheckOut: PropTypes.func,
    emptyCart: PropTypes.func,
    couponCode: PropTypes.any,
    couponId: PropTypes.any,
    couponAmount: PropTypes.any,
    shippingMethod: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      networkForOrder: undefined,
      loading: false,
      // token: null,
      selectedIndex: 0,
      // accountNumber: '',
      // holderName: '',
      // expirationDate: '',
      // securityCode: '',
      // paymentState: '',
      // createdOrder: {},
    };
  }

   

  componentWillReceiveProps(nextProps) {
    if (nextProps.message && nextProps.message.length > 0) {
      // Alert.alert(Languages.Error, nextProps.carts.message)
      toast(nextProps.message);
    }

    if (
      nextProps.type !== this.props.type &&
      nextProps.type == "CREATE_NEW_ORDER_SUCCESS"
    ) {
      warn(nextProps);
      this.props.cleanOldCoupon();
      this.props.onNext();
    }
  }

  lightenDarkenColor(col, amt) {
    col = parseInt(col, 16);
    return (((col & 0x0000FF) + amt) | ((((col >> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16);
  }
  

  shadeColor =(color, percent)=> {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    let result= "#"+RR+GG+BB;
    if(result == "#ffffff")
    return "black";

    return "#"+RR+GG+BB;
}

  nextStep = async () => {
    const { user, token } = this.props.user;
    const { userInfo, currency } = this.props;

    //const coupon = this.getCouponInfo();

    // Billing First name is a required field.
    // Billing Last name is a required field.
    // Billing Country is a required field.
    // Billing Street address is a required field.
    // Billing Town / City is a required field.

    // const { list } = this.props.payments;
    // const payload = {
    //   token,
    //   customer_id: user.id,
    //   set_paid: list[this.state.selectedIndex].id == "cod",
    //   payment_method: list[this.state.selectedIndex].id,
    //   payment_method_title: list[this.state.selectedIndex].title,
    //   billing: {
    //     ...user.billing,
    //     email: userInfo.email,
    //     phone: userInfo.phone,
    //     first_name:
    //       user.billing.first_name.length === 0
    //         ? userInfo.first_name
    //         : user.billing.first_name,
    //     last_name:
    //       user.billing.last_name.length === 0
    //         ? userInfo.last_name
    //         : user.billing.last_name,
    //     address_1:
    //       user.billing.address_1.length === 0
    //         ? userInfo.address_1
    //         : user.billing.address_1,
    //     city:
    //       user.billing.city.length === 0 ? userInfo.city : user.billing.city,
    //     state:
    //       user.billing.state.length === 0 ? userInfo.state : user.billing.state,
    //     country:
    //       user.billing.country.length === 0
    //         ? userInfo.country
    //         : user.billing.country,
    //     postcode:
    //       user.billing.postcode.length === 0
    //         ? userInfo.postcode
    //         : user.billing.postcode
    //   },
    //   shipping: {
    //     first_name: userInfo.first_name,
    //     last_name: userInfo.last_name,
    //     address_1: userInfo.address_1,
    //     city: userInfo.city,
    //     state: userInfo.state,
    //     country: userInfo.country,
    //     postcode: userInfo.postcode
    //   },
    //   line_items: this.getItemsCart(),
    //   customer_note: typeof userInfo.note !== "undefined" ? userInfo.note : "",
    //   currency: currency.code
    // };

    // check the shipping info
    // if (Config.shipping.visible) {
    //   payload.shipping_lines = this.getShippingMethod();
    // }

    // // check the coupon
    // if (coupon.length != 0) {
    //   payload.coupon_lines = this.getCouponInfo();
    // }

    // this.setState({ loading: true });
    if (this.props.validatedDelivery == false) {
      showMessage({
        message: "Your delivery isn't valid",
        autoHide: true,
        duration: 6000,
        position:"center",
        description:
          "Maybe just wait a couple more seconds until the icon turns green? If not, please check the address you're sending to is specific enough. Thanks",
        backgroundColor: "orange", // background color
        color: "white", // text color
      });

      //alert("Your delivery destination isn't valid - please make sure it is to continue the order");
      return;
    }

    try {
      EventRegister.emit("showSpinner");
      //do order checks
      if (this.props.filteredNetworkId != -1) {
        //await this.getNetwork(this.props.filteredNetworkId);
        let testLocaiton = this.props.location;
        await this.checkPaymentCustomerExistsAndCreateOrder(
          this.props.location.mostRecentOrderDestinationLatLng,
          this.props.location.latestPickerDestinationText
        );
        //create order in api
        //wipe    
      } else {
        alert(
          "You need to select an network to order on. Sadly we can't place all orders for you at once on seperate networks."
        );
        //this.props.onShowCheckOut({}); //payload
      }
    } catch (error) {
      alert("There was a problem creating the order:" + JSON.stringify(error));
    } finally {
      EventRegister.emit("hideSpinner");
    }

    // warn([userInfo, payload]);

    // if (list[this.state.selectedIndex].id == "cod") {
    //   this.setState({ loading: true });
    //   WooWorker.createNewOrder(
    //     payload,
    //     () => {
    //       this.setState({ loading: false });
    //       this.props.emptyCart();
    //       this.props.onNext();
    //     },
    //     () => {
    //       this.setState({ loading: false });
    //     }
    //   );
    // } else {
    //   // other kind of payment
    //   this.props.onShowCheckOut(payload);
    // }
  };

  //this now gets the filted items not the whole cart
  getItemsCart = () => {
    const { cartItems, filteredCartItems } = this.props;
    const items = [];
    for (let i = 0; i < filteredCartItems.length; i++) {
      const cartItem = filteredCartItems[i];

      const item = {
        product_id: cartItem.product.id,
        quantity: cartItem.quantity,
      };

      if (cartItem.variation != null) {
        item.variation_id = cartItem.variation.id;
      }
      items.push(item);
    }
    return items;
  };

  getCouponInfo = () => {
    const { couponCode, couponAmount } = this.props;
    if (
      typeof couponCode !== "undefined" &&
      typeof couponAmount !== "undefined" &&
      couponAmount > 0
    ) {
      return [
        {
          code: couponCode,
        },
      ];
    }
    return {};
  };

  // getShippingMethod = () => {
  //   const { shippingMethod } = this.props;

  //   if (typeof shippingMethod !== "undefined") {
  //     return [
  //       {
  //         method_id: `${shippingMethod.method_id}:${shippingMethod.id}`,
  //         method_title: shippingMethod.title,
  //         total:
  //           shippingMethod.id == "free_shipping" ||
  //           shippingMethod.method_id == "free_shipping"
  //             ? "0"
  //             : shippingMethod.settings.cost.value,
  //       },
  //     ];
  //   }
  // return the free class as default
  //   return [
  //     {
  //       method_id: "free_shipping",
  //       total: "0",
  //     },
  //   ];
  // };

  renderDesLayout = (item) => {
    if (typeof item === "undefined") {
      return <View />;
    }
    if (item.description == null || item.description == "") return <View />;

    const tagsStyles = {
      p: {
        color: "#666",
        flex: 1,
        textAlign: "center",
        width: width - 40,
        paddingLeft: 20,
      },
    };
    return (
      <View style={styles.descriptionView}>
        <HTML tagsStyles={tagsStyles} html={`<p>${item.description}</p>`} />
      </View>
    );
  };

  /**this VISUALLY sets the carousel back to it's first item!!!Doesn't change which item is ACTUALLY selected int he background */
  _resetCarouselToFirstItem = () => {
    try {
      this._carousel.snapToItem(0);
    } catch (error) {
    //  alert("Coudnt' reset the carousel to the first item");
    }

  }

  /**Creates new order request in API */
  createOrderRequest = async (orderDestinationLatLng, resolvedOrderAddress) => {    //open order request modal

    //do some checks - items, payment etc before we put the order in
    if (this.props.filteredCartItems < 1) {
      toast("You dont' have any items in your basket");
    } else {
      this.props.updateModalState("orderRequestedModal", true);
      
      let dest = new LocationRequest(
        orderDestinationLatLng.lat,
        orderDestinationLatLng.lng
      );
      let itemsReq = new Array();

      this.props.filteredCartItems.map((x) => {
        itemsReq.push(new ItemRequest(x.product._id, x.quantity));
      });

      //if it's a stuart delivery option currently selected
      //order, we need to add the storeId returned in that delivery option
      //and 'tell' the system which store we want to use
      let amaglamDriverNote = this.props.manualAddressPrefixInput === "" ? this.props.driverNote : "Extra address info: " + this.props.manualAddressPrefixInput + " - " + this.props.driverNote;

      let selectedDeliveryType = this.props.selectedDeliveryOption.deliveryOrderProviderType;
      let pickupStoreId = this.props.deliveryOptions.whichStoreIsClosestSelling.relationGuid || "";
      let request = new OrderRequest(
        this.props.filteredNetworkId,
        this.props.user.user.customerId,
        dest,
        itemsReq,
        pickupStoreId,
        amaglamDriverNote,
        this.props.storeNote,
        resolvedOrderAddress
      );

       
      let payload = new AppOrderRequest(request, dest, selectedDeliveryType);

      try {
        //post the request
        console.debug("About to create order");
        
        showMessage({
          message: "We are capturing your payment",
          autoHide: true,
          duration: 4000,
          position:"center",
          description:
            "You won't be charged until your driver accepts, you can cancel up until then.",
          backgroundColor:GlobalStyle.primaryColorDark.color, // background color
          color: "white", // text color
        });     

        this.props.navigation.navigate("FinishOrderScreen");
        //this.props.onNext(); //this takes us to order completed srreen
        //remove cart items
        try {
          this.props.removeNetworkSubcart(this.props.cartItems, this.props.filteredNetworkId);                                                                
          if(this.props.cartItems.length >0)
          {
            this.props.setCartToLastAddedItem()
          }              
        } catch (error) {
          
        }
        HopprWorker.createNewOrder(JSON.stringify(payload))
          .then((x) => {
            console.debug("We created an order!!");
            //activate the modal
            //push to redux if successful, if not tell the customer it failed
           //if(true) {          
            if (x.status == 200 || x.status == 201) {
              showMessage({
                message: "Searching for a driver",
                autoHide: true,
                duration: 4000,
                position:"center",
                description:
                  "This can take from a few seconds to a couple of minutes, depending on numerous factors.. please be patient!!\n\n You can still cancel.",
                backgroundColor: GlobalStyle.softLinkColor.color, // background color
                color: "white", // text color
              }); 
               //toast("Order was created!!!!");              
              //remove items from cart                                       
              this.props.clearNotes();                         
              this.props.updateModalState("orderRequestedModal", false);
              this.props.clearManualAddressInput();
              
              // 
              // console.debug("ok great");                         
              //this.props.resetCartFilter(this.props.cartItems);
             
              // if(this.props.cartItems.length > 0)
              // {
              //   let netIdToSwitchto = this.props.cartItems[0].product.networkId;
              //   let netToSwitchTo = this.props.networks.find(x=>x.networkId == netIdToSwitchto);
              //   //change picked to something else!!
              //   this.props.filterCart(
              //     netToSwitchTo.networkId,
              //     netToSwitchTo.StoreName,
              //     netToSwitchTo,
              //   )
              // }              
            } else if (x.status == 500) {
              this.props.updateModalState("orderRequestedModal", true);
              alert(x.data.exceptionMessage + " --- " + (x.data.innerException.exceptionMessage || ""));
              EventRegister.emit("hideOrderRequestModal");
              SoundPlayer.playSoundFile("negative1", "mp3");
            }
            else if(x.status == 400) {
              this.props.updateModalState("orderRequestedModal", false);
              showMessage({
                message: "Your order failed",
                autoHide: true,
                duration: 20000,
                position:"center",
                description:
                  x.data.message,
                backgroundColor: "red", // background color
                color: "white", // text color
              });                 
              
              SoundPlayer.playSoundFile("negative1", "mp3");
            }
            else{
              alert("Sorry, that didn't work! Response was: " + x.status);
            }
          })
          .catch((err) => {
            toast("Error in order creation");
            console.debug(err);
          });

        //redirect to order tracking view
      } catch (error) {
        toast("Error in order creation");
        console.debug(error);
      }
    }
  };

  //creates a new customer in stripe
  createNewStripeCustomer = async (email, token) => {
    return stripe.customers.create({
      email: email,
      source: req.body.tokenId,
    });
  };

  //based on the token - eithe
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

  isDefaultPaymentSourceSet = async () => {
    console.debug("checking default payment source");
    let defaulPsReponse = await HopprWorker.isStripeCustomerDefaultPaymentSourceSet(
      "STRIPE"
    );
    console.debug("checked default payment source");
    return defaulPsReponse;
  };

  checkPaymentCustomerExistsAndCreateOrder = async (orderDestinationLatLng, resolvedOrderAddress) => {
    try {

      //toast("Attempting to make payment request");
      //send token to server
      let exstingCustomerbool = await this.doesStripeCustomerExistInApi();
      if (exstingCustomerbool == false) {
        //there should be a customer already created when card was added.
        //doesn't exist, need to create token and create new customer
        // Create a Stripe token with new card infos

        //show card modal, get them to add a card - show message about needing defaul card!

        console.debug("there is no customer in API");
        //this.props.updateModalState("addRemoveCardModal", true);
        alert(
          "You have no default payment customer set!!Please add a card!!"
        );

        return;
        // const apiKey = Config.HopprStripe.PKTest;
        // const client = new Stripe(apiKey);  
        // const token = await client.createToken({
        //   number: "4242424242424242",
        //   exp_month: "09",
        //   exp_year: "19",
        //   cvc: "111",
        //   address_zip: "12345",
        // });

        // console.debug("HELLO");
        // console.debug("got token: " + token);
        // var customerResult = await HopprWorker.createExternalPaymentCustomerNOTALLOWED(
        //   this.props.user.user.id,
        //   token.id
        // );

        // if (customerResult.code != 201) {
        //   // should return created at rpite
        //   throw new Error(
        //     "We were unable to create a customer in the API - therefore we can't accept a Stripe payment! Sorry"
        //   );
        // }
      }
      toast(
        "Found a payment customer - About to create order request going to: " +
        this.props.location.latestPickerDestinationText
      );
      //check default payment source is set
      console.debug("checking default payment src set");
      let isPaymentSourceSet = await this.isDefaultPaymentSourceSet();
      if (isPaymentSourceSet) {
        //now customer deffo exists, place order - the charge will be created by the server
        console.debug("found default payment source");
        //check there is a default payment source in the api
        //CHECK USER IS OLD ENOUGH
        let ageRespnose = await HopprWorker.isUserOldEnoughToBuy(this.props.filteredNetworkId);
        if(ageRespnose.status == 200)
        {
          if(ageRespnose.data.customerOldEnough)
          {
            //then create order request
            await this.createOrderRequest(orderDestinationLatLng, resolvedOrderAddress);
          }
          else{
            showMessage({
              message: "You are too young!",
              autoHide: true,
              duration: 6000,
              position:"center",
              description:
              '\n' + "I'm sorry my friend, you are not old enough to purchase on this network. If you think you're seeing this in error, try logging out then back in to refresh your age.",
              backgroundColor: "red", // background color
              color: "white", // text color
            });
          }            
        }
        else{
          alert("Couldn't verify your age vs the network age. How embarassing. Sorry! :)")
        }       
      } else {
        //tell them it's not set and open the modal to set a card        
        //this.props.updateModalState("addRemoveCardModal", true);              

        this.props.updateModalState("addRemoveCardModal", true);

        setTimeout(()=>{
            Alert.alert("Set payment source",
                  "You have no default payment source set!! If you could set one please!"
            );

        },300)
      
      }
    } catch (error) {
      console.debug(error);
    }
  };

  load = async () => {
    HopprWorker.init({
      username: this.props.user.user.email,
      password: this.props.user.successPassword,
      token: this.props.user.token,
    });
  };

  componentWillUnmount = ()=>{
    try {
      EventRegister.removeEventListener(this.resetCarouselHandler);
      this.unsubscribeWillFocus();  
    } catch (error) {
     console.debug("Error unmounting in payment/index") 
    }    
  }

  componentDidMount = async () => {
    //ADD HANDLERS   
    this.unsubscribeWillFocus =  this.props.navigation.addListener("willFocus", this.load);
    this.resetCarouselHandler = EventRegister.addEventListener("resetCarouselToFirstItem", () => {
    this._resetCarouselToFirstItem();
    })

    await this.load();
    //THIS MUST BE THE CURRENT NETWORK ID!!! If it's -1 it's not set
  };

  _renderConfirmCheckout = (
    totalItemPrice,
    networkForOrder,
    selectedDriverCharge
  ) => {
    if (typeof networkForOrder !== "undefined") {
      //do some maths
      let itemCharge = totalItemPrice;
      let baseCurrency = 0;
      let networkFee = 0;
      let platformFee = 0;
      let driverCharge = 0;
      let finalTotal = 0;
      baseCurrency = networkForOrder.BaseCurrency;
      networkFee = networkForOrder.NetworkCommissionBaseRate * itemCharge;
      platformFee = networkForOrder.PlatformCommissionBaseRate;
      driverCharge = selectedDriverCharge;

      finalTotal = itemCharge + networkFee + platformFee + driverCharge;

      return (
        <View style={[checkoutStyles.container]}>
          <View style={{flex:1, padding:10}}>
          <View style={checkoutStyles.row}>
            <Text style={checkoutStyles.label}>{"Subtotal"}</Text>
            <Text style={[checkoutStyles.value, { color: "black" }]}>
              {currencyFormatter(itemCharge)}
            </Text>
          </View>
          <View style={checkoutStyles.row}>
            <Text style={checkoutStyles.label}>{"Delivery Charge"}</Text>
            <Text style={[checkoutStyles.value, { color: this.props.selectedDeliveryOption.cssColor }]}>
              {currencyFormatter(driverCharge)}
            </Text>
          </View>
          <View style={checkoutStyles.row}>
            <Text style={checkoutStyles.label}>{"Network Fee"}</Text>
            <Text style={[checkoutStyles.value, { color: "black" }]}>
              {currencyFormatter(networkFee)}
            </Text>
          </View>
          <View style={checkoutStyles.row}>
            <Text style={checkoutStyles.label}>{"Platform Fee"}</Text>
            <Text style={[checkoutStyles.value, { color: "black" }]}>
              {currencyFormatter(platformFee)}
            </Text>
          </View>
          <View style={checkoutStyles.divider} />
          <View style={checkoutStyles.row}>
            <Text style={checkoutStyles.label}>{Languages.Total}</Text>
            <Text style={[checkoutStyles.value, { color: "black" }]}>
              {currencyFormatter(finalTotal)}
            </Text>
          </View>
          </View>
        </View>
      );

      // return;
      // <ConfirmCheckout
      //   networkForOrder={this.state.networkForOrder}
      //   couponAmount={this.props.couponAmount}
      //   discountType={this.props.discountType}
      //   shippingMethod={this.getShippingMethod()}
      //   totalPrice={this.props.totalPrice}
      // />;
    }
    return (
      <View>
        <Text
          style={{ textAlign: "center", color: "black", fontStyle: "italic" }}
        >
          {"Please select a basket to place your order!"}
        </Text>
      </View>
    );
  };

  // getNetwork = async networkId => {
  //   try {
  //     let net = await HopprWorker.getNetwork(networkId);
  //     this.setState({ networkForOrder: net });
  //   } catch (error) {
  //     alert(
  //       "Couldn't get the Hoppr network from server - have you updated the Config._2yu.networkIdOnHopprServer?"
  //     );
  //   }
  // };

  _renderCarouselItem = ({ item, index }) => {
    let imageUrl =
      item.imageUrl ||
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";

    return (
      <View
        style={{
          zIndex:1,
          borderWidth:0,
          backgroundColor: this.props.selectedDeliveryOption.cssColor,
          padding:0,
          margin:0,
          borderRadius: carouselHeightWidth / 2,
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          // height: 95,
          // padding: 5,
          // marginLeft: 2,
          // marginRight: 2,
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            borderWidth:0,
            zIndex:1,
            paddingTop: 0,
            paddingBottom: 0,
            marginBottom:20,
            margin: 0,
            paddingLeft: 2,
            paddingRight: 2,
            //borderRadius: 80,
            overflow: "hidden",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FastImage
            style={{
              flex: 1,
              zIndex:1,
              padding: 10,              
              margin: 0,
              height: undefined,
              //borderRadius: 190 / 2,
              width:170,
              maxWidth: 190,
            }}
            resizeMode="contain"
            source={{ uri: imageUrl }}
          />
         
  <View style={{ flexDirection:"row", position:"absolute", bottom:-18 }}>
     <Text
              style={{
                padding: 0,
                margin: 0,
                paddingBottom: 2,
                marginBottom:2,
                textAlign: "center",
                justifyContent: "flex-end",
                fontSize: 14,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {"@"}
            </Text>
            <Text
              style={{
                padding: 0,
                margin: 0,
                paddingBottom: 10,
                marginBottom: 10,
                textAlign: "center",
                justifyContent: "flex-start",
                fontSize: 14,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {"£" + this.props.selectedDeliveryOption.estimatedPrice.toFixed(2)}
            </Text>          
            </View>

        </View>
      </View>
    );
  };
  _renderCarouselOrDefaulImg=()=>{
    if(this.props.deliveryOptions.deliveryMethods.length > 0)
    {
      return (
        <Carousel
        ref={(c) => {
          this._carousel = c;
        }}
        layout={"default"}
        layoutCardOffset={`0`}
        data={this.props.deliveryOptions.deliveryMethods}
        renderItem={this._renderCarouselItem}
        sliderWidth={carouselHeightWidth}
        itemWidth={carouselHeightWidth}
        onSnapToItem={(index) => {
          //we want to set current delivery method to when
          let oneWeWantToSetTo = this.props.deliveryOptions
            .deliveryMethods[index];
          this.props.changeSelectedDeliveryOption(oneWeWantToSetTo);
          SoundPlayer.playSoundFile("notification1", "mp3");
        }}
      />
      )
    }
    else{
      return(
        <Image
        style={{
          flex: 1,
          padding: 0,
          margin: 0,
          height: undefined,
          borderRadius: 190 / 2,
          width: 190,
        }}
        resizeMode="contain"
        source={Images.Closed2 }
      />
      );
    }
  }

  _renderTickOrCross = () => {
    let imgURl = this.props.validatedDelivery == false ? Images.NoDelivery1 : Images.YesNoSet2_Yes;
    return <Image source={imgURl} style={{ minHeight: 30, maxHeight: 30, maxWidth: 30, minWidth: 30 }} />
  }

  render() {
    console.debug("In payment");

    const { list } = this.props.payments;
    const {
      theme: {
        colors: { background, text },
      },
    } = this.props;

    return (
      <View style={[styles.container]}>
      <ScrollView style={{paddingTop:10, backgroundColor:GlobalStyle.primaryBackgroundColor.color}}>
        <View style={{ flex: 1,backgroundColor:GlobalStyle.primaryBackgroundColor.color,
           paddingBottom: 38,
            marginBottom: 38, 
            backgroundColor:GlobalStyle.primaryBackgroundColor.color }}>

            {/* <View style={[css.rowEmpty, { padding: 5, margin: 5, paddingBottom:1, marginBottom:1 }]}>                                                                
            </View>   */}
            <Text style={[styles.label, { paddingLeft:3, fontFamily: Constants.fontFamilyBold,textAlign:"center", color: text }]}>
                  {"Swipe courier:"}
                </Text>  
            
            <View
              style={{
                marginTop: 5,
                paddingTop: 5,
                width: width,
                height: 270,
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                //backgroundColor:"red"
              }}
            >
              <View style={{
                   minHeight: 270,
                   maxHeight:270,
                   maxWidth: 270,
                   minWidth: 270,
                   width: 270,
                   borderRadius:270 / 2,
                   alignContent: "center",
                   alignItems: "center",
                   justifyContent: "center",
                backgroundColor:this.shadeColor(this.props.selectedDeliveryOption.cssColor,20)}}>
              <View
                style={{
                  elevation: 5,
                  zIndex:10,
                  paddingTop: 4,               
                  borderWidth: 0,
                  borderRadius: 240 / 2,
                  backgroundColor: this.props.selectedDeliveryOption.cssColor,
                  borderColor: this.props.selectedDeliveryOption.cssColor,
                  minHeight: 240,
                  maxHeight:240,
                  maxWidth: 240,
                  minWidth: 240,
                  width: 240,
                  overflow: "hidden",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
               {this._renderCarouselOrDefaulImg()}
                {/* <Text style={{ textAlign: "center", fontSize: 11, color: "black" }}>
              {"Select delivery methods"}
            </Text> */}
              </View>
              </View>
            </View>
            {/* Swiper */}
            {/* <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                margin: 3,
                paddingTop: 3,
                paddingBottom: 3,
              }}
            >           
              <Carousel
                ref={(c) => {
                  this._carousel = c;
                }}
                layout={"default"}
                layoutCardOffset={`9`}
                data={this.props.deliveryOptions.deliveryMethods}
                renderItem={this._renderCarouselItem}
                sliderWidth={130}
                itemWidth={130}
              />
              <Text style={{ textAlign: "center", fontSize: 11, color: "black" }}>
                {"Select delivery methods"}
              </Text>
            </View>
          </View> */}
       
            {/* <View
                style={{ flexDirection: "row", marginTop:3, paddingTop:3, paddingLeft:7, justifyContent: "center" }}>                                        
              <Text style={{textAlign:"center", fontFamily: Constants.fontFamilyBold, color:"black", fontSize:11, fontStyle:"italic", maxWidth:width * 0.8}}>{this.props.selectedDeliveryOption.description}</Text>                        
            </View> */}
            
            <View style={{justifyContent: "center",
                alignContent:"center",
                alignItems:"center",
                width:width,
                padding: 5,
                paddingLeft:0,
                paddingRight:0,
                marginLeft:0,
                marginRight:0,
                margin: 5,   }}>
            <Text style={[{ fontSize: 20, 
              fontWeight: "bold", 
              textAlign:"center", 
              fontFamily: Constants.fontFamilyBold,
              paddingLeft:0,
              paddingRight:0,
              marginLeft:0,
              marginRight:0,
               color: this.props.selectedDeliveryOption.cssColor }]}>
                  {this.props.selectedDeliveryOption.displayName}
            </Text> 
            <Text style={[{ fontSize: 20, 
              fontWeight: "bold", 
              textAlign:"center", 
              fontFamily: Constants.fontFamilyBold,              
              paddingLeft:2,
              paddingRight:0,
              marginLeft:0,
              marginRight:0,
               color: GlobalStyle.primaryColorDark.color }]}>                 
                  <Text style={{fontSize:22, fontWeight:"bold", color:this.props.selectedDeliveryOption.cssColor}}>{this.props.selectedDeliveryOption.estimatedMinsToPickupTime}</Text>
                  <Text>{" mins"}</Text>                   
            </Text>  
            </View>        
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignContent:"center",
                alignItems:"center",
                width:width,
                padding: 5,
                margin: 5, 
                paddingLeft:0,
                marginLeft:0,
                paddingRight:0,
                marginRight:0,  
                marginTop:1,
                paddingTop:1,
                paddingBottom:1,
                marginBottom:1,
              }}
            >
              {this._renderTickOrCross()}
            </View>

            {/* <View style={[css.rowEmpty, { padding: 5, margin: 5 }]}>
              <Text style={[styles.label, { color: text }]}>
                {"Your courier: " + this.props.selectedDeliveryOption.displayName + " | Pickup in: " + this.props.selectedDeliveryOption.estimatedMinsToPickupTime + " mins"}
              </Text>
            </View> */}
            {/* SELECT DELIVERY METHOD */}
            {/* <View style={styles.paymentOption}>
            {list.map((item, index) => {
              if (!item.enabled) return null;

              const image =
                typeof Config.Payments[item.id] !== "undefined" &&
                Config.Payments[item.id];
              return (
                <View style={styles.optionContainer} key={index}>
                  <Button
                    type="image"
                    source={image}
                    defaultSource={Images.defaultPayment}
                    onPress={() => this.setState({ selectedIndex: index })}
                    buttonStyle={[
                      styles.btnOption,
                      this.state.selectedIndex == index &&
                      styles.selectedBtnOption,
                    ]}
                    imageStyle={styles.imgOption}
                  />
                </View>
              );
            })}
          </View> */}
            {/* {this.renderDesLayout(list[this.state.selectedIndex])} */}
            {this.props.selectedDeliveryOption &&
              this._renderConfirmCheckout(
                this.props.filteredItemsTotal,
                this.props.filteredCartNetwork,
                this.props.selectedDeliveryOption.estimatedPrice
              )}
          </View>
        </ScrollView>

        <Buttons
          isAbsolute
          onPrevious={this.props.onPrevious}
          isLoading={this.state.loading}
          nextText={Languages.ConfirmOrder}
          onNext={this.nextStep}
        />
      </View>
    );
  }
}

const mapStateToProps = ({
  payments,
  carts,
  user,
  products,
  currency,
  location,
}) => {
  return {
    payments,
    user,
    type: carts.type,
    cartItems: carts.cartItems,
    filteredCartItems: carts.filteredCartItems,
    filteredItemsTotal: carts.filteredItemsTotal,
    filteredNetworkId: carts.filteredNetworkId,
    filteredNetworkName: carts.filteredNetworkName,
    filteredCartNetwork: carts.filteredCartNetwork,
    totalPrice: carts.totalPrice,
    message: carts.message,
    customerInfo: carts.customerInfo,

    couponCode: products.coupon && products.coupon.code,
    couponAmount: products.coupon && products.coupon.amount,
    discountType: products.coupon && products.coupon.type,
    couponId: products.coupon && products.coupon.id,

    shippingMethod: carts.shippingMethod,

    currency,

    //location
    manualAddressPrefixInput:location.manualAddressPrefixInput,
    latestPickerDestinationText: location.latestPickerDestinationText,
    location: location,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const CartRedux = require("@redux/CartRedux");
  const productActions = require("@redux/ProductRedux").actions;
  const paymentActions = require("@redux/PaymentRedux").actions;
  const modalActions = require("@redux/ModalsRedux");
  //const locationRedux = require("@redux/LocationRedux")

  return {
    ...ownProps,
    ...stateProps,
    emptyCart: () => CartRedux.actions.emptyCart(dispatch),
    createNewOrder: (payload) => {
      CartRedux.actions.createNewOrder(dispatch, payload);
    },
    cleanOldCoupon: () => {
      productActions.cleanOldCoupon(dispatch);
    },
    clearCart:()=>{
      CartRedux.actions.emptyCart(dispatch);
    },
    removeNetworkSubcart:(entireCart, networkIdToRemove)=>{
      CartRedux.actions.removeNetworkSubcart(dispatch, entireCart, networkIdToRemove);
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
}

export default connect(
  mapStateToProps,
  undefined,
  mergeProps
)(withTheme(PaymentOptions));
