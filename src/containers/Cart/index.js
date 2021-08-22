/** @format */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Alert,
  Dimensions,
  TouchableOpacity,
  Picker,
  Image,
} from 'react-native';
import {WebView} from 'react-native-webview';
import MapWorker from '@services/MapWorker';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {connect} from 'react-redux';
import {
  Languages,
  Images,
  Config,
  Constants,
  withTheme,
  GlobalStyle,
} from '@common';
import {BlockTimer, warn, toast} from '@app/Omni';
import Modal from 'react-native-modalbox';
import {StepIndicator} from '@components';
import base64 from 'base-64';
import {isObject} from 'lodash';

import MyCart from './MyCart';
import Delivery from './Delivery';
import Payment from './Payment';
import FinishOrder from './FinishOrder';
import PaymentEmpty from './Empty';
import Buttons from './Buttons';
import styles from './styles';

//nadazv
import HopprWorker from '../../services/HopprWorker';
import OrderRequest from '../../apiModels/orderRequest/OrderRequest';
import LocationRequest from '../../apiModels/orderRequest/LocationRequest';
import ItemRequest from '../../apiModels/orderRequest/ItemRequest';
import AppOrderRequest from '../../apiModels/orderRequest/AppOrderRequest';
import Stripe from 'react-native-stripe-api';
import {showMessage, hideMessage} from 'react-native-flash-message';
import RNPickerSelect from 'react-native-picker-select';
import DeliveryHelper from '../../services/DeliveryHelper';
import {EventRegister} from 'react-native-event-listeners';
import SoundPlayer from 'react-native-sound-player';
import {NoFlickerImage} from 'react-native-no-flicker-image';

const zeroDeliveryOptions = {
  whichInHouseDriverMightBeDriving: {
    deliveryLatLng: {
      lat: -18.14324,
      lng: -112.7205117,
    },
    name: 'None',
    address: 'None',
  },
  whichStoreIsClosestSelling: {
    deliveryLatLng: {
      lat: -18.14324,
      lng: -112.7205117,
    },
    name: 'Nowhere',
    address: 'Nowhere',
  },
  whereItsGoing: 'None',
  networkId: -1,
  deliveryMethods: [],
  additionalFees: 0.0,
};

const defaultDeliveryOption = {
  id: -1,
  description: 'None available',
  deliveryOrderProviderType: 'None',
  estimatedPrice: 0,
  estimatedMinsToPickupTime: 'N/A',
  wasChosen: false,
  cssColor: '#fec456',
  displayName: 'None',
  imageUrl: Images.SadFace,
};
const {width, height} = Dimensions.get('window');
const iconWidth = width * 0.11;
class Cart extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
    onMustLogin: PropTypes.func.isRequired,
    finishOrder: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    onFinishOrder: PropTypes.func.isRequired,
    onViewProduct: PropTypes.func,
    cartItems: PropTypes.array,
    onViewHome: PropTypes.func,
  };

  static defaultProps = {
    cartItems: [],
  };

  constructor(props) {
    console.debug('In cart view');
    super(props);

    this.shouldShowReadyToGoMessage = true;
    this.shouldShowAgeRestrictionMessage = true;
    this.deliveryOptionsCycleLock = false;
    this.outerRefreshLoopTimer = -1;
    this.innerRefreshLoopTimer = -1;

    this.hasLoaded = false;
    this.state = {
      currentIndex: 0,
      // createdOrder: {},
      validatedDelivery: false,
      userInfo: null,
      order: '',
      isLoading: false,
      orderId: null,
      //added for filtered cart
      myNetworks: [{StoreName: 'All networks', networkId: -1}], //networks available in picker
      deliveryOptions: zeroDeliveryOptions,
      selectedDeliveryOption: defaultDeliveryOption,
      isDeliveryInHouse: true,
      refreshDeliveryOptionsAttempts: 0,
      driverNote: '',
      storeNote: '',
    };
  }

  // checkPaymentCustomerExistsAndCreateOrder = async orderDestinationLatLng => {
  //   try {
  //     const apiKey = Config.HopprStripe.PKTest;
  //     const client = new Stripe(apiKey);

  //     toast("Attempting to make payment request");
  //     //send token to server
  //     let exstingCustomerbool = await this.doesStripeCustomerExistInApi();
  //     if (exstingCustomerbool == false) {
  //       console.debug("there is no customer in API");
  //       //doesn't exist, need to create token and create new customer
  //       // Create a Stripe token with new card infos
  //       // const token = await client.createToken({
  //       //   number: "4242424242424242",
  //       //   exp_month: "09",
  //       //   exp_year: "21",
  //       //   cvc: "111",
  //       //   address_zip: "12345"
  //       // });

  //       //then create customer - this is working in the webapp
  //       console.debug("HELLO");
  //       console.debug("got token: " + token);
  //       var customerResult = await HopprWorker.createExternalPaymentCustomerNOTALLOWED(
  //         this.props.user.user.id,
  //         token.id
  //       );

  //       console.debug("Created customer");
  //       if (customerResult.code != 201) {
  //         // should return created at rpite
  //         alert(
  //           "We couldn't create a payment customer for you in the payment provider!"
  //         );
  //         throw new Error(
  //           "We were unable to create a customer in the API - therefore we can't accept a Stripe payment! Sorry"
  //         );
  //       }
  //     }
  //     toast(
  //       "About to create order request going to: " +
  //         this.props.location.latestPickerDestinationText
  //     );
  //     //check default payment source is set
  //     console.debug("checking default payment src set");
  //     let isPaymentSourceSet = await this.isDefaultPaymentSourceSet();
  //     if (isPaymentSourceSet) {
  //       //now customer deffo exists, place order - the charge will be created by the server
  //       console.debug("found default payment source");
  //       //check there is a default payment source in the api
  //       //then create order request
  //       await this.createOrderRequest(orderDestinationLatLng);
  //     } else {
  //       //tell them it's not set and open the modal to set a card
  //       toast(
  //         "You have no default payment source set!! Here you go - set one please!"
  //       );
  //       this.updateModalActive("addRemoveCardModal", true);
  //     }
  //   } catch (error) {
  //     console.debug(error);
  //   }
  // };

  componentWillMount = () => {
    console.debug('In cart');
    this.props.navigation.setParams({title: Languages.ShoppingCart});
  };

  _startAgeRestrctionMessageTimer = () => {
    setTimeout(() => (this.shouldShowAgeRestrictionMessage = true), 8000);
  };

  _generateUpdatedNetworkPickerArray = availableNets => {
    //add 'all' to picker and insert
    let optToAdd = {StoreName: 'All networks', networkId: -1};
    availableNets.unshift(optToAdd);
    this.setState({myNetworks: availableNets});
  };

  _refreshNetworksForCartItems = async () => {
    //get distinct network Ids
    //toast("Refreshing cart networks");
    if (this.props.cartItems.length > 0) {
      let allnetowrkIds = this.props.cartItems.map(x => x.product.networkId);
      console.debug('ogt it');
      let distinctNetworkIds = [...new Set(allnetowrkIds)];
      //get networks for those Ids from API
      console.debug('ogt it');

      try {
        EventRegister.emit('showSpinner');
        let networksForThoseIdsReponse = await HopprWorker.getNetworks(
          distinctNetworkIds,
        );
        if (networksForThoseIdsReponse.status == 200) {
          let networksForThoseIds = networksForThoseIdsReponse.data.value;
          //add to list
          this._generateUpdatedNetworkPickerArray(networksForThoseIds);
        } else {
          alert("Couldn't refresh networks!!!");
        }
      } catch (error) {
        alert("Couldn't refresh networks!!! - Errored out.");
      } finally {
        EventRegister.emit('hideSpinner');
      }
    } else {
      //there were zero items in the cart!!!
    }
  };

  _setCartToLastAddedItem = () => {
    //default to last added item's network
    let lastAddedItem = this.props.cartItems.find(
      item => item.product._id === this.props.lastAddedItemId,
    );

    if (typeof lastAddedItem === 'undefined') {
      lastAddedItem = this.props.cartItems[this.props.cartItems.length - 1];
    }

    const lastAddedItemNetwork = this.state.myNetworks.find(
      network => network.networkId === lastAddedItem.product.networkId,
    );

    this.props.filterMyCart(
      lastAddedItemNetwork.networkId,
      lastAddedItemNetwork.StoreName,
      lastAddedItemNetwork,
      //this.props.cartItems
    );
  };

  load = async () => {
    try {
      HopprWorker.init({
        username: this.props.user.user.email,
        password: this.props.user.successPassword,
        token: this.props.user.token,
      });
      this._openLocationPickerModalIfLocationUndefined();
      await this._refreshNetworksForCartItems();
      try {
        this._setCartToLastAddedItem();
      } catch (error) {}
    } catch (error) {}

    if (!this.hasLoaded) {
      this.hasLoaded = true;
      console.debug('Hit cart');
      //get networks for cart items network
      if (
        this.props.user == null ||
        typeof this.props.user === 'undefined' ||
        this.props.user.user == null ||
        typeof this.props.user.user === 'undefined'
      ) {
        // showMessage({
        //   style: {
        //     borderBottomLeftRadius:8,
        //     borderBottomRightRadius: 8
        //   },
        //   position:"center",
        //   message: "Sorry, you'll need to log in at this point" ,
        //   description: '\n' + "...why not create an account?",
        //   backgroundColor: "orange", // background color
        //   color: "white", // text color,
        //   duration: 5000,
        //   autoHide: true,
        // });

        this.props.navigation.navigate('LoginScreen');
      } else {
        //toast("Hit cart");

        //get location incase they need to use it

        // //TODO:
        // //if cart not set to anything i.e. 'All items', set to first 'real' cart
        // //that way they can just 'click click click' to finish
        // if (
        //   this.props.filteredNetworkId == -1 &&
        //   this.props.cartItems.length > 0 &&
        //   this.state.myNetworks.length > 1
        // ) {

        //EventRegister.emit("savePingerStateAndCorner");
        try {
          // if (await MapWorker.requestLocationPermission()) {
          //   navigator.geolocation.getCurrentPosition(
          //     async position => {},
          //     () =>
          //       Alert.alert(
          //         'No location',
          //         'Error getting location - please make sure location is enabled!',
          //       ),
          //     {timeout: 30000, enableHighAccuracy: true, maximumAge: 15000},
          //   );
          // }
        } catch (error) {
          alert('Failed to get location, sorry!');
        }
        // } else {
        //   //filter it on current values just to refresh
        //   console.debug("ok");
        //   this.props.filterMyCart(
        //     this.props.filteredNetworkId,
        //     this.props.filteredNetworkName,
        //     this.props.filteredCartNetwork,
        //     this.props.cartItems
        //   );
        // }

        // await this._changeCartPickerValue(-1); //ALL NETWORKS

        //await this._refreshDeliveryOptions();

        //IN THE BACKGROUND SET CURRENT LOCATION AS PICKED IF UNDEFINED
        // if(typeof this.props.orderDestinationLatLng.lat == "undefined")
        // {
        //   EventRegister.emit("setHereAsCurrentOrderDestination");
        // }
      }
    }
  };

  componentWillUnmount = () => {
    try {
      this.unload();
      EventRegister.removeEventListener(this.refreshDeliveryOptionsHandler);
      this.unsubscribeWillFocus();
    } catch (error) {
      
    }  
  };

  unload = () => {
    this.hasLoaded = false;
    this._cancelAllRefreshDeliveryOptionsTimers();
    this._resetRefreshDeliveryOptionAttempts();
    EventRegister.emit('returnPingersToPreviousState');
  };

  componentDidMount = async () => {
    this.refreshDeliveryOptionsHandler = EventRegister.addEventListener(
      'refreshDeliveryOptions',
      async () => await this._refreshDeliveryOptions(),
    );
    console.debug('stop');

    this.unsubscribeWillFocus = this.props.navigation.addListener(
      'willFocus',
      this.load,
    );
    this.unsubscribeLoseFocus = this.props.navigation.addListener(
      'willBlur',
      this.unload,
    );
    await this.load();
  };

  componentWillReceiveProps(nextProps) {
    // reset current index when update cart item
    if (this.props.cartItems && nextProps.cartItems) {
      if (nextProps.cartItems.length !== 0) {
        if (this.props.cartItems.length !== nextProps.cartItems.length) {
          this.updatePageIndex(0);
          this.onChangeTabIndex(0);

          //refilter cart items to whatever set network in state is
        }
      }
    }
  }

  requestStripePayment = async () => {
    const params = {
      // mandatory
      number: '4242424242424242',
      expMonth: 11,
      expYear: 17,
      cvc: '223',
      // optional
      name: 'Test User',
      currency: 'usd',
      addressLine1: '123 Test Street',
      addressLine2: 'Apt. 5',
      addressCity: 'Test City',
      addressState: 'Test State',
      addressCountry: 'Test Country',
      addressZip: '55555',
    };

    return await stripe.createTokenWithCard(params);
  };

  /**switches network*/
  _changeCartPickerValue = async itemValue => {
    //do filter operation
    if (itemValue == -1) {
      //
      showMessage({
        message: "All networks isn't an option right now",
        description:
          'You need to pick a cart you want to check out with, sorry champ!',
        backgroundColor: 'orange', // background color
        color: 'white', // text color,
        position: 'center',
        style: {
          borderRadius: 20,
        },
        duration: 3200,
        autoHide: true,
      });
      //if default filter all;
      // this.props.filterMyCart(
      //   itemValue,
      //   "All Networks",
      //   undefined,
      //   //this.props.cartItems
      // );
    } else {
      //we know it's not default, try and filter
      let networkToFilterTo = this.state.myNetworks.find(
        x => x.networkId == itemValue,
      );

      this.props.filterMyCart(
        itemValue,
        networkToFilterTo.StoreName,
        networkToFilterTo,
        // this.props.cartItems
      );

      try {
        let ageRestrictionResponse = await HopprWorker.getNetworkAgeRestriction(
          itemValue,
        );
        if (ageRestrictionResponse.status == 200) {
          let ageResultJson = ageRestrictionResponse.data;
          if (
            ageResultJson.isAgeRestricted &&
            this.shouldShowAgeRestrictionMessage
          ) {
            this.shouldShowAgeRestrictionMessage = false;
            // showMessage({
            //   style: {
            //     borderBottomLeftRadius:8,
            //     borderBottomRightRadius: 8
            //   },
            //   position:"center",
            //   message: `Age Restricted - Over ${ageResultJson.age}`,
            //   description: '\n' + `You won't be allowed to purchase from this network if you're under ${ageResultJson.age}. If you appear under ${ageResultJson.age + 7}, you will be asked to show proof of age by your driver before receipt of any goods.`,
            //   backgroundColor: "black", // background color
            //   color: "white", // text color,
            //   duration: 3000,
            //   autoHide: true,
            // });
            this._startAgeRestrctionMessageTimer();
          }
        } else {
          // alert("Couldn't age verify network")
        }
      } catch (error) {
        // alert("Couldn't age verify network")
      }

      //display message

      //await this._refreshDeliveryOptions();
    }
    //change whatever is gui and state
    //make sure there is inital filter happening in load that filters to 'all'
  };

  _resetRefreshDeliveryOptionAttempts = () => {
    setTimeout(async () => {
      this.setState({refreshDeliveryOptionsAttempts: 0});
    }, 5000);
  };

  /** Cancels all looped timeouts */
  _cancelAllRefreshDeliveryOptionsTimers = () => {
    if (this.outerRefreshLoopTimer != -1)
      clearTimeout(this.outerRefreshLoopTimer);

    if (this.innerRefreshLoopTimer != -1)
      clearTimeout(this.innerRefreshLoopTimer);
  };

  _incrementRefreshDeliveryOptionAttempts = () => {
    let newNoOfAttempts = this.state.refreshDeliveryOptionsAttempts + 1;
    this.setState({refreshDeliveryOptionsAttempts: newNoOfAttempts});
  };

  _setTimeoutToRefreshDeliveryOptionsOrQuit = async noOfmilliseconds => {
    if (this.state.refreshDeliveryOptionsAttempts < 1) {
      // showMessage({
      //   message: "We are trying again",
      //   description:
      //     "Attempting to put your delivery together again for you... hang tight!",
      //   backgroundColor: "orange", // background color
      //   color: "white", // text color,
      //   position:"top",
      //   style: {
      //     borderBottomLeftRadius:8,
      //     borderBottomRightRadius: 8
      //   },
      //   duration: 3200,
      //   autoHide: true,
      // });
      this.innerRefreshLoopTimer = setTimeout(async () => {
        this._incrementRefreshDeliveryOptionAttempts();
        await this._refreshDeliveryOptions();
      }, noOfmilliseconds);
    } else {
      //we tried x times - forget it
      showMessage({
        message: 'We gave up trying to match your delivery',
        description:
          "But you can retry at any time yourself by clicking the 'retry delivery' button above.",
        backgroundColor: 'red', // background color
        color: 'white', // text color,
        position: 'center',
        duration: 5000,
        autoHide: true,
      });
      this._resetRefreshDeliveryOptionAttempts();
    }
  };

  _refreshDeliveryOptions = async () => {
    //dont run if in a cycle already
    if (!this.deliveryOptionsCycleLock) {
      if (this.props.cartItems.length > 0) {
        this.deliveryOptionsCycleLock = true;
        //delete list so options are closed!!
        //check there is something set to query!!
        console.log('stop');
        this.setState({
          validatedDelivery: false,
          selectedDeliveryOption: defaultDeliveryOption,
          deliveryOptions: zeroDeliveryOptions,
        }); //so we know it's false until set true
        try {
          if (typeof this.props.fullGeoDestinationAddress !== 'undefined') {
            if (typeof this.props.filteredNetworkCartItems !== 'undefined') {
              //map filtered items into proper ItemArray and pass in
              let smoosheditemsArray = [];
              typeof this.props.filteredNetworkCartItems.map(cartItem => {
                smoosheditemsArray.push({
                  productId: cartItem.product._id,
                  amount: cartItem.quantity,
                });
              });

              const theDeliveryUrl = DeliveryHelper.generateDeliveryOptionsUrl(
                this.props.fullGeoDestinationAddress.streetNumber,
                this.props.fullGeoDestinationAddress.streetName,
                this.props.fullGeoDestinationAddress.subAdminArea,
                this.props.fullGeoDestinationAddress.postalCode,
                smoosheditemsArray,
                'small',
                this.props.filteredNetworkId,
              );

              console.log('Stop');
              let deliveryOptions =
                await HopprWorker.getAvailableDeliveryOptions(theDeliveryUrl);
              toast(
                'Response for delivery request was: ' + deliveryOptions.status,
              );
              if (deliveryOptions.status == 200) {
                this.setState({deliveryOptions: deliveryOptions.data}, () => {
                  if (deliveryOptions.data.deliveryMethods.length > 0) {
                    this._changeSelectedDeliveryOption(
                      deliveryOptions.data.deliveryMethods[0],
                    );
                    this.setState({validatedDelivery: true});
                    //visually reset the carousel to the new first option
                    setTimeout(() => {
                      EventRegister.emit('resetCarouselToFirstItem');
                    }, 100);

                    if (
                      this.props.cartItems.length > 0 &&
                      this.shouldShowReadyToGoMessage
                    ) {
                      this.shouldShowReadyToGoMessage = false;
                      // showMessage({
                      //   style: {
                      //     borderBottomLeftRadius:8,
                      //     borderBottomRightRadius: 8
                      //   },
                      //   message: "Ready to go!",
                      //   description:
                      //     "Pick your courier and let's do this!",
                      //   backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                      //   color: "white", // text color,
                      //   duration: 1000,
                      //   autoHide: true,
                      //   position:"center"
                      // });
                      setTimeout(
                        () => (this.shouldShowReadyToGoMessage = true),
                        20000,
                      );
                    }

                    //SoundPlayer.playSoundFile("smb1up", "mp3");
                  } else {
                    this.setState({
                      selectedDeliveryOption: defaultDeliveryOption,
                      validatedDelivery: false,
                    });
                  }
                });
              } else if (deliveryOptions.status == 412) {
                //it failed due to no store stocks- play bad noise and reset seleceted options to zero
                //SoundPlayer.playSoundFile("negative1", "mp3");
                Alert.alert(
                  'No stores / store stocks available!',
                  'Sorry, there are no nearby stores that stock all your items, maybe try something else!!',
                );
                this.setState({selectedDeliveryOption: defaultDeliveryOption});
              } else if (deliveryOptions.status == 404) {
                //it failed due to no store stocks - play bad noise and reset seleceted options to zero
                //SoundPlayer.playSoundFile("negative1", "mp3");
                //Alert.alert("No online drivers!", "Sorry, there are no nearby drivers to deliver your order at this time!!");
                showMessage({
                  style: {
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                  message: 'No online drivers!',
                  description:
                    'Sorry, there are no nearby drivers to deliver your order at this time!!',
                  backgroundColor: 'red', // background color
                  color: 'white', // text color,
                  duration: 5000,
                  autoHide: true,
                });
                this.setState({selectedDeliveryOption: defaultDeliveryOption});

                //try again after a few secs
                setTimeout(async () => {
                  await this._setTimeoutToRefreshDeliveryOptionsOrQuit(5000);
                }, 5000);
              } else if (deliveryOptions.status == 400) {
                // SoundPlayer.playSoundFile("negative1", "mp3");
                //Alert.alert("No online drivers!", "Sorry, there are no nearby drivers to deliver your order at this time!!");
                showMessage({
                  style: {
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                  message: "Sorry, we couldn't put that together for you",
                  description:
                    deliveryOptions.data.message +
                    '\nWe will try again momentarily.',
                  backgroundColor: 'orange', // background color
                  color: 'white', // text color,
                  duration: 6200,
                  autoHide: true,
                });
                this.setState({selectedDeliveryOption: defaultDeliveryOption});

                //wait a few seconds first
                this.outerRefreshLoopTimer = setTimeout(async () => {
                  await this._setTimeoutToRefreshDeliveryOptionsOrQuit(5000);
                }, 10000);
              } else if (deliveryOptions.status == 500) {
                //show exception message
                // showMessage({
                //   style: {
                //     borderBottomLeftRadius:8,
                //     borderBottomRightRadius: 8
                //   },
                //   message: "Sorry, we couldn't put that together for you: " + deliveryOptions.data.message,
                //   description: deliveryOptions.data.message,
                //   backgroundColor: "red", // background color
                //   color: "white", // text color,
                //   duration: 5000,
                //   autoHide: true,
                // });
              } else {
                //it failed - play bad noise and reset seleceted options to zero
                // Alert.alert("Delivery Options Failed!", "This is embarassing - we couldn't put together your delivery.");
                // SoundPlayer.playSoundFile("negative1", "mp3");
                this.setState({selectedDeliveryOption: defaultDeliveryOption});
              }
            }
          }
        } catch (error) {
          //SoundPlayer.playSoundFile("negative1", "mp3");
          //Alert.alert("No online drivers!", "Sorry, there are no nearby drivers to deliver your order at this time!!");
          showMessage({
            message: "Couldn't put your order together",
            description: 'Message was: ' + error.message,
            backgroundColor: 'red', // background color
            color: 'white', // text color,
            duration: 5000,
            autoHide: true,
          });

          toast(
            "Couldn't refresh delivery options!! Failed." +
              JSON.stringify(error),
          );
          this.setState({selectedDeliveryOption: defaultDeliveryOption});
        } finally {
          this.deliveryOptionsCycleLock = false;
        }
      }
    }
  };

  _renderCartPickerRow = () => {
    if (this.props.cartItems.length > 0) {
      const networkItems = this.state.myNetworks.map((item, index) => {
        const itemsString =
          typeof this.props.filteredCartItems !== 'undefined'
            ? ' - ' + this.props.filteredCartItems.length + ' items'
            : ''; //TODO FIX THIS LINE

        const label = `${item.StoreName} ${itemsString}`;
        return {value: item.networkId, label: label};
      });

      return (
        <View
          style={{
            flex: 1,
            borderWidth: 0,
            backgroundColor: GlobalStyle.cartDropdown.backgroundColor,
            // borderColor:
            //   this.state.selectedNetwork.networkSettings[0]
            //     .cssMainScreenBarColor || "hotpink",
            borderRadius: 30,
            maxHeight: 50,
            height: 50,
            marginHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            style={{
              flex: 1,
              borderWidth: 0,
              color: GlobalStyle.cartPickerText.color,
              height: 20,
              alignItems: 'center',
              inputIOS: {
                textAlign: 'center',
                padding: 4,
                fontFamily: Constants.fontFamily,
                overflow: 'hidden',
                color: GlobalStyle.cartPickerText.color,
              },
              inputAndroid: {
                textAlign: 'center',
                fontFamily: Constants.fontFamily,
                padding: 4,
                overflow: 'hidden',
                color: GlobalStyle.cartPickerText.color,
              },
            }}
            inputStyle={{
              textAlign: 'center',
              fontFamily: Constants.fontFamily,
              color: GlobalStyle.cartPickerText.color,
              padding: 4,
              overflow: 'hidden',
            }}
            onValueChange={async (itemValue, itemIndex) =>
              await this._changeCartPickerValue(itemValue)
            }
            value={this.props.filteredNetworkId}
            items={networkItems}
          />
        </View>
      );
    }
  };

  // _renderCartPickerRowOld = () => {
  //   if (this.props.cartItems.length > 0) {
  //     return (
  //       <View
  //         style={{
  //           flex: 1,
  //           borderWidth: 1,
  //           borderColor: "grey",
  //           borderRadius: 8,
  //           maxHeight: 250,
  //           height: 250,
  //         }}
  //       >
  //         <Picker
  //           style={{
  //             // alignSelf: "flex-end",
  //             // justifyContent: "center",
  //             flex: 1,
  //             margin: 2,
  //             paddingLeft: 18,
  //             borderWidth: 2,
  //             borderRadius: 15,
  //             borderColor: "orange",
  //             color: "black",
  //             maxHeight: 250,
  //             height: 250,
  //             // width: undefined,
  //             color: "black",
  //           }}
  //           mode="dropdown"
  //           selectedValue={this.props.filteredNetworkId}
  //           onValueChange={(itemValue, itemIndex) =>
  //             this._changeCartPickerValue(itemValue)
  //           }
  //         >
  //           {this.state.myNetworks.map((item, index) => {
  //             let itemsString = "";
  //             if (typeof this.state.filteredCartItems !== "undefined") {
  //               itemsString =
  //                 " - " + this.state.filteredCartItems.length + " items";
  //             }

  //             console.debug("network: ");
  //             console.debug(item);

  //             return (
  //               <Picker.Item
  //                 label={item.StoreName + itemsString}
  //                 value={item.networkId}
  //                 key={index}
  //               />
  //             );
  //           })}
  //         </Picker>
  //       </View>
  //     );
  //   }
  // };

  _filterCartItems = async filtNetId => {};

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
      let customerResponse =
        await HopprWorker.doesStripeCustomerExistOnHopprServerForUser('STRIPE');
      return customerResponse;
    } catch (error) {
      console.debug("Couldn't check if payment customer existed");
    }
  };

  isDefaultPaymentSourceSet = async () => {
    let defaulPsReponse =
      await HopprWorker.isStripeCustomerDefaultPaymentSourceSet('STRIPE');
    return defaulPsReponse;
  };

  _openLocationPickerModalIfLocationUndefined = () => {
    if (
      typeof this.props.orderDestinationLatLng.lat == 'undefined' ||
      typeof this.props.orderDestinationLatLng.lng == 'undefined'
    ) {
      showMessage({
        style: {
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        },
        message: 'No destination chosen',
        description:
          'Please select an order destination! We will then be able to calculate an accurate menu for you.',
        backgroundColor: 'orange', // background color
        color: 'white', // text color,
        duration: 4500,
        autoHide: true,
        position: 'bottom',
      });

      this.props.updateModalState('locationPickerModal', true);
      valid = this.checkUserLogin();
    }
  };

  //create a charge in stripe then redeeem it later
  createNewStripeChargeWithoutRedeem = () => {};
  //maps the cart to an orderRequest and sends it to the API
  createOrderRequest = async orderDestinationLatLng => {
    //open order request modal

    //do some checks - items, payment etc before we put the order in
    if (this.props.filteredNetworkCartItems < 1) {
      toast("You dont' have any items in your basket");
    } else {
      this.props.updateModalState('orderRequestedModal', true);
      let dest = new LocationRequest(
        orderDestinationLatLng.lat,
        orderDestinationLatLng.lng,
      );
      let itemsReq = new Array();

      this.props.filteredNetworkCartItems.map(x => {
        itemsReq.push(new ItemRequest(x.product._id, x.quantity));
      });

      let request = new OrderRequest(
        Config._2yu.networkIdOnHopprServer,
        this.props.user.user.customerId,
        dest,
        itemsReq,
      );

      let payload = new AppOrderRequest(request, dest);

      try {
        //post the request
        console.debug('About to create order');
        HopprWorker.createNewOrder(JSON.stringify(payload))
          .then(x => {
            console.debug('We created an order!!');

            //activate the modal
            //push to redux if successful, if not tell the customer it failed
            if (x.status == 200) {
              showMessage({
                message: 'Our servers have got your order!',
                description: 'Just wait a sec....',
                backgroundColor: '#2EC281', // background color
                color: 'white', // text color,
                duration: 20000,
              });
              toast('Order was created!!!!');
              let tetsts = this.props;
              //clear order specific stuff - location address etc
              this.props.updateManualAddressPrefixInput('');
            } else {
              toast('Server response was:' + x.status);
              showMessage({
                message: "Your order didn't go through...",
                description:
                  "Are you sure you don't have an existing order active...? Else... do you have a card registered?",
                backgroundColor: 'red', // background color
                color: 'white', // text color,
                duration: 20000,
              });
            }
          })
          .catch(err => {
            toast('Error in order creation');
            console.debug(err);
          });

        //redirect to order tracking view
      } catch (error) {
        toast('Error in order creation');
        console.debug(error);
      }
    }
  };

  checkUserLogin = () => {
    const {user} = this.props.user;
    if (user === null) {
      this.props.onMustLogin();
      return false;
    }
    return true;
  };

  onNext = () => {
    // check validate before moving next
    let valid = true;
    switch (this.state.currentIndex) {
      case 0:
        this._openLocationPickerModalIfLocationUndefined();
        break;
      default:
        break;
    }
    if (valid && typeof this.tabCartView !== 'undefined') {
      const nextPage = this.state.currentIndex + 1;
      this.tabCartView.goToPage(nextPage);
    }
  };

  _renderLogisticsButton = () => {
    return (
      <View style={{padding: 6}}>
        {/* LOGISTICS BUTTON */}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            margin: 3,
            paddingTop: 3,
            paddingBottom: 3,
          }}>
          {/* LAUNCH LOGISTICS */}
          <TouchableOpacity
            onPress={() => {
              if (this.props.filteredNetworkId != -1) {
                this.props.navigation.navigate(
                  'OrderLogisticsCreateUserProfileScreen',
                );
              } else {
                alert('You need to select a brand first to enter logistics!');
              }
            }}>
            <NoFlickerImage
              style={{
                alignSelf: 'center',
                margin: 0,
                maxHeight: 45,
                height: 45,
                width: 45,
              }}
              source={Images.DroneLogistics1}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            paddingBottom: 2,
            textAlign: 'center',
            fontSize: 8,
            color: 'black',
          }}>
          {'Logistics'}
        </Text>
      </View>
    );
  };

  _renderClearCartButton = () => {
    return (
      <View style={{padding: 6}}>
        {/* LOGISTICS BUTTON */}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            top: 2,
            margin: 3,
            paddingTop: 3,
            paddingBottom: 3,
          }}>
          {/* LAUNCH LOGISTICS */}
          <TouchableOpacity
            onPress={async () => {
              this.props.emptyCart();
              this.props.navigation.navigate('Cart');
            }}>
            <NoFlickerImage
              style={{
                alignSelf: 'center',
                maxHeight: iconWidth - 1,
                height: iconWidth - 1,
                width: iconWidth - 1,
              }}
              source={Images.NewAppReskinIcon.ClearCart}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            marginTop: 4,
            paddingBottom: 2,
            textAlign: 'center',
            fontFamily: Constants.fontFamilyBold,
            fontSize: 12,
            color: GlobalStyle.cartDropdown.backgroundColor,
          }}>
          {'Clear'}
        </Text>
      </View>
    );
  };

  _renderAdjustPaymentButton = () => {
    //differnet card images
    let defaultImgCards = Images.CreditCards2;
    let rnd = Math.random();
    if (rnd >= 0.5) {
      defaultImgCards = Images.CreditCards4;
    }
    return (
      <View style={{padding: 6}}>
        {/* LOGISTICS BUTTON */}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            margin: 3,
            paddingTop: 3,
            paddingBottom: 3,
          }}>
          {/* LAUNCH LOGISTICS */}
          <TouchableOpacity
            onPress={async () => {
              this.props.updateModalState('addRemoveCardModal', true);
            }}>
            <NoFlickerImage
              style={{
                alignSelf: 'center',
                margin: 0,
                maxHeight: iconWidth,
                height: iconWidth,
                width: iconWidth,
              }}
              source={Images.NewAppReskinIcon.Payment1}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            paddingBottom: 2,
            textAlign: 'center',
            fontFamily: Constants.fontFamilyBold,
            fontSize: 12,
            color: GlobalStyle.cartDropdown.backgroundColor,
          }}>
          {'Payment'}
        </Text>
      </View>
    );
  };

  _renderRetryDeliveryOptionsButton = () => {
    //differnet card images
    return (
      <View style={{padding: 6}}>
        {/* Retry  BUTTON */}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            margin: 3,
            paddingTop: 3,
            paddingBottom: 3,
          }}>
          {/* retry delivery */}
          <TouchableOpacity
            onPress={async () => {
              showMessage({
                style: {
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                },
                message: 'Retrying delivery match',
                description: 'Give us a few seconds to work some magic...',
                backgroundColor: 'orange', // background color
                color: 'white', // text color,
                duration: 1500,
                autoHide: true,
                position: 'center',
              });
              this._cancelAllRefreshDeliveryOptionsTimers();
              await this._refreshDeliveryOptions();
              //this.props.updateModalState("addRemoveCardModal", true);
            }}>
            <NoFlickerImage
              style={{
                alignSelf: 'center',
                margin: 0,
                maxHeight: iconWidth,
                height: iconWidth,
                width: iconWidth,
              }}
              source={Images.NewAppReskinIcon.Retry}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            paddingBottom: 2,
            textAlign: 'center',
            fontFamily: Constants.fontFamilyBold,
            fontSize: 12,
            color: GlobalStyle.cartDropdown.backgroundColor,
          }}>
          {'Retry'}
        </Text>
      </View>
    );
  };

  renderCheckOut = () => {
    const params = base64.encode(
      encodeURIComponent(JSON.stringify(this.state.order)),
    );
    const userAgentAndroid =
      'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30';

    const checkOutUrl = `${Config.WooCommerce.url}/${Constants.WordPress.checkout}/?order=${params}`;

    warn(['fd', checkOutUrl, this.state.order]);
    return (
      <Modal
        ref={modal => (this.checkoutModal = modal)}
        backdropPressToClose={false}
        backButtonClose
        backdropColor="#fff"
        swipeToClose={false}
        onClosed={this._onClosedModal}>
        <WebView
          useWebKit={true}
          style={styles.webView}
          source={{uri: checkOutUrl}}
          userAgent={userAgentAndroid}
          onNavigationStateChange={status =>
            this._onNavigationStateChange(status)
          }
          scalesPageToFit
        />
        <TouchableOpacity
          style={styles.iconZoom}
          onPress={() => this.checkoutModal.close()}>
          <Text style={styles.textClose}>{Languages.close}</Text>
        </TouchableOpacity>
      </Modal>
    );
  };

  _onClosedModal = () => {
    if (this.state.orderId !== null) {
      this.props.finishOrder();
      this.checkoutModal.close();
    }
    this.setState({isLoading: false});
  };

  _onNavigationStateChange = status => {
    const {url} = status;
    if (
      url.indexOf(Config.WooCommerce.url) == 0 &&
      url.indexOf('order-received') != -1
    ) {
      let params = status.url.split('?');
      if (params.length > 1) {
        params = params[1].split('&');
        params.forEach(val => {
          const now = val.split('=');
          if (now[0] == 'key' && now['1'].indexOf('wc_order') == 0) {
            this.setState({orderId: now['1'].indexOf('wc_order')});
          }
        });
      }
    }
  };

  onShowCheckOut = async order => {
    await this.setState({order});
    this.checkoutModal.open();
  };

  onPrevious = () => {
    if (this.state.currentIndex === 0) {
      this.props.onBack();
      return;
    }
    this.tabCartView.goToPage(this.state.currentIndex - 1);
  };

  updatePageIndex = page => {
    this.setState({currentIndex: isObject(page) ? page.i : page});
  };

  onChangeTabIndex = page => {
    if (this.tabCartView) {
      this.tabCartView.goToPage(page);
    }
  };

  /**pass in a 'deliveryMethod */
  _changeSelectedDeliveryOption = newSelectedOption => {
    let valToSet = false;
    newSelectedOption.deliveryOrderProviderType === 'In_House'
      ? (valToSet = true)
      : (valToSet = false);
    this.setState({
      isDeliveryInHouse: valToSet,
      selectedDeliveryOption: newSelectedOption,
    });
  };

  finishOrder = () => {
    // const { onFinishOrder } = this.props;
    // onFinishOrder();
    this.updatePageIndex(0);
    this.onChangeTabIndex(0);
    this.props.navigation.navigate('Cart');
    // BlockTimer.execute(() => {
    //   this.props.navigation.navigate("Home");
    //   //this.tabCartView.goToPage(0);
    // }, 1500);
  };

  onCartUpdated = async () => {};

  render() {
    const {onViewProduct, navigation, cartItems, onViewHome} = this.props;
    const {currentIndex} = this.state;
    const {
      theme: {
        colors: {background, text},
      },
    } = this.props;

    if (cartItems && cartItems.length === 0) {
      return <PaymentEmpty onViewHome={onViewHome} />;
    }
    const steps = [
      {label: 'CART', icon: Images.NewAppReskinIcon.Cart},
      {label: 'DELIVERY', icon: Images.IconPin},
      {label: 'PAY', icon: Images.IconMoney},
      {label: 'COMPLETE', icon: Images.IconFlag},
    ];
    return (
      <View style={[styles.fill, {backgroundColor: background}]}>
        {this.renderCheckOut()}
        <View style={styles.indicator}>
          <StepIndicator
            steps={steps}
            onChangeTab={this.onChangeTabIndex}
            currentIndex={currentIndex}
          />
        </View>
        <View style={styles.content}>
          <View
            style={{
              width: width,
              backgroundColor: GlobalStyle.primaryBackgroundColor.color,
            }}>
            <View
              style={{
                border: 6,
                borderColor: 'black',
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: 'white',
                borderBottomLeftRadius: 26,
                borderBottomRightRadius: 26,
                minHeight: iconWidth + 50,
                height: iconWidth + 50,
                width: width,
              }}>
              <View style={{minWidth: '40%', width: '50%', maxWidth: '50%'}}>
                {this._renderCartPickerRow()}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  flex: 1,
                  marginLeft: 20,
                  marginTop: 6,
                  width: '50%',
                }}>
                {this._renderRetryDeliveryOptionsButton()}
                {this._renderAdjustPaymentButton()}
                {/* {this._renderLogisticsButton()} */}
                {this._renderClearCartButton()}
              </View>
            </View>
          </View>
          <ScrollableTabView
            ref={tabView => {
              this.tabCartView = tabView;
            }}
            locked
            onChangeTab={this.updatePageIndex}
            style={{backgroundColor: background}}
            initialPage={0}
            tabBarPosition="overlayTop"
            prerenderingSiblingsNumber={1}
            renderTabBar={() => <View style={{padding: 0, margin: 0}} />}>
            <MyCart
              key="cart"
              onNext={this.onNext}
              onPrevious={this.onPrevious}
              navigation={navigation}
              setCartToLastAddedItem={this._setCartToLastAddedItem}
              onViewProduct={onViewProduct}
              onCartUpdated={async () => {
                if (this.props.filteredNetworkCartItems.length === 0) {
                  await this._refreshNetworksForCartItems();
                  await this._changeCartPickerValue(-1); // ALL NETWORKS;
                }
              }}
            />

            <Delivery
              cancelAllRefreshDeliveryOptionsTimers={
                this._cancelAllRefreshDeliveryOptionsTimers
              }
              validatedDelivery={this.state.validatedDelivery}
              isDeliveryInHouse={this.state.isDeliveryInHouse}
              selectedDeliveryOption={this.state.selectedDeliveryOption}
              deliveryOptions={this.state.deliveryOptions}
              driverNote={this.state.driverNote}
              storeNote={this.state.storeNote}
              updateDriverNote={newNote => {
                this.setState({driverNote: newNote});
              }}
              updateStoreNote={newNote => {
                this.setState({storeNote: newNote});
              }}
              key="delivery"
              onNext={formValues => {
                this.setState({userInfo: formValues});
                this.onNext();
              }}
              onPrevious={this.onPrevious}
              navigation={navigation}
            />
            <Payment
              setCartToLastAddedItem={this._setCartToLastAddedItem}
              key="payment"
              networks={this.state.myNetworks}
              resetCartFilter={this.props.resetCartFilter}
              filterCart={this.props.filterMyCart}
              validatedDelivery={this.state.validatedDelivery}
              isDeliveryInHouse={this.state.isDeliveryInHouse}
              selectedDeliveryOption={this.state.selectedDeliveryOption}
              deliveryOptions={this.state.deliveryOptions}
              driverNote={this.state.driverNote}
              storeNote={this.state.storeNote}
              clearNotes={() => {
                this.setState({driverNote: '', storeNote: ''});
              }}
              changeSelectedDeliveryOption={this._changeSelectedDeliveryOption}
              onPrevious={this.onPrevious}
              clearManualAddressInput={() =>
                this.props.updateManualAddressPrefixInput('')
              }
              onNext={this.onNext}
              userInfo={this.state.userInfo}
              isLoading={this.state.isLoading}
              onShowCheckOut={this.onShowCheckOut}
              navigation={navigation}
            />

            {/* <FinishOrder updatePageIndex={this.updatePageIndex} key="finishOrder" finishOrder={this.finishOrder} /> */}
          </ScrollableTabView>

          {currentIndex === 0 && (
            <View style={{zIndex: 99999, borderWidth: 0}}>
              <Buttons onPrevious={this.onPrevious} onNext={this.onNext} />
            </View>
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({carts, user, location}) => ({
  cartItems: carts.cartItems,
  filteredNetworkCartItems: carts.filteredCartItems,
  filteredNetworkId: carts.filteredNetworkId,
  filteredNetworkName: carts.filteredNetworkName,
  filteredItemsTotal: carts.filteredItemsTotal,
  filteredCartNetwork: carts.filteredCartNetwork,
  lastAddedItemId: carts.lastAddedItemId,
  user,
  location,
  orderDestinationLatLng: location.mostRecentOrderDestinationLatLng,
  fullGeoDestinationAddress: location.fullGeoDestinationAddress, //to query delivery methods
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {dispatch} = dispatchProps;
  const CartRedux = require('@redux/CartRedux');
  const modalActions = require('@redux/ModalsRedux');
  const {actions} = require('@redux/LocationRedux');

  return {
    ...ownProps,
    ...stateProps,
    updateManualAddressPrefixInput: newText => {
      dispatch(actions.updateManualAddressPrefixField(dispatch, newText));
    },
    filterMyCart: (netId, netName, netItself) => {
      CartRedux.actions.filterCart(dispatch, netId, netName, netItself);
      console.log('done');
    },
    resetCartFilter: entireCart => {
      CartRedux.actions.resetFilterCart(dispatch, entireCart);
      console.log('done');
    },
    emptyCart: () => CartRedux.actions.emptyCart(dispatch),
    finishOrder: () => CartRedux.actions.finishOrder(dispatch),
    updateModalState: (modalName, modalState) => {
      console.debug('About to update modals');
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState,
          ),
        );
      } catch (error) {
        console.debug(error);
      }
    },
  };
}

export default connect(mapStateToProps, null, mergeProps)(withTheme(Cart));
