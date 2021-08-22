/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React from 'react';
import Toast from 'react-native-easy-toast';
import PropTypes from 'prop-types';
import {
  Button,
  AdMob,
  ModalBox,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating,
  AppIntro,
  ModalReview,
  VideoDisplayModal,
  NetworkImageList,
} from '@components';
import {
  View,
  StatusBar,
  WebView,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Vibration,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
//import { WooWorker } from "api-ecommerce";
import {
  Color,
  Languages,
  Device,
  Config,
  Styles,
  Constants,
  withTheme,
  Images,
  Events,
  GlobalStyle,
} from '@common';
import {MyToast, MyNetInfo} from '@containers';
import Navigation from '@navigation';
import {connect} from 'react-redux';
import MenuSide from '@components/LeftMenu/MenuOverlay';
import FastImage from 'react-native-fast-image';
import {toast, closeDrawer} from './Omni';
import HopprWorker from './services/HopprWorker';
import WS from 'react-native-websocket';
import Modal from 'react-native-modalbox';
import {Header, Icon, Divider} from 'react-native-elements';
import SoundPlayer from 'react-native-sound-player';
import {Button as ElButton} from 'react-native-elements';
import MyWebView from 'react-native-webview-autoheight';
// import FadeInOut from 'react-native-fade-in-out';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, UrlTile} from 'react-native-maps';
import {
  YouGotPaidModal,
  OrderWasCancelledTellDriverModal,
  StoreConfirmOrderPickupModal,
  OrderWasCancelledTellCustomerModal,
  OrderWasConfirmedAcceptedTellCustomerModal,
  WasOrderCompletedModal,
  StoreReceivesNewOrderModal,
  OneMoreStepModal,
  DriverCompleteOrderModal,
  OrderWasConfirmedPickedUpTellCustomerModal,
  OrderRequestedModal,
  AddRemoveCardModal,
  LocationPickerModal,
  StoreLocationPickerModal,
  SalesBIModal,
  ChatModal,
  CashOutModal,
  NetworkPickerModal,
  NetworkSearchAndAddModal,
  NearestVendorsModal,
  RequestPermissionModal,
  NearestStoresAndNetworksSearchModal,
  NetworkDisplayModal,
  StartingHelpModal,
  QuickControlsModal,
  LogisticsCreatorOrderAcceptedModal,
  TellDriverUpdatedLogisticsModal,
  ActionMessageAndQuickControlsModal,
  CustomerOrderRequestsModal,
  DriverOrderRequestsModal,
  CourierControlsModal,
} from '@components';
import HtmlViewToNavigationComponentURLService from '@services/HtmlViewToNavigationComponentURLService.js';
import Stripe from 'react-native-stripe-api';
import MapWorker from '@services/MapWorker';
import GeoWorker from '@services/GeoWorker';
import OneSignal from 'react-native-onesignal';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import {EventRegister} from 'react-native-event-listeners';
import Spinner from 'react-native-spinkit';
import {setIntervalAsync} from 'set-interval-async/dynamic';
import {clearIntervalAsync} from 'set-interval-async';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import StackHelper from './services/StackHelper';
import LogoSpinner from '@components/LogoSpinner';
import Draggable from 'react-native-draggable';
/////////////////////
import RequestsCard from './components/RequestsCard';
/////////////////////

const {width, height} = Dimensions.get('window');
const DURATION = 3000;
const PATTERN = [1000, 2000];

const ASPECT_RATIO = width / 200;
const LATITUDE_DELTA = 0.0024;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
    margin: 5,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: '#fff',
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 50,
    alignSelf: 'center',
  },
  spinnerContainer: {
    // flex: 1,
    zIndex: 999999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#d35400',
    backgroundColor: 'rgba(0.0,69.8,74.5, 0.2)',
    // backgroundColor: 'transparent'
  },
});

const spinnerConfig = {
  color: 'white',
  type: '9CubeGrid',
  size: 180,
};

const draggableBaseSize = 120;
const draggableCornerOffset = 162;
const draggableCornerOffsetBottom = 22;
const minusForCenterPostion = 70;

class Router extends React.Component {
  static propTypes = {
    introStatus: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const {user} = this.props;
    this.refreshOrderRequestsTimer = 0; //used for sound
    this.textFadeTimerId = -1;
    this.state = {
      resetPasswordEmail: '',
      resetPasswordModalOpen: false,
      draggablePingersPositionCorner: true,
      draggablesHaveBeenMovedSinceStateChange: false,
      //top left
      x: 0 - 162,
      y: 0 - 162,
      //bottom left
      driverx: width + 230,
      drivery: height + 230,
      //bottom right
      storex: width - 250,
      storey: 38,
      currentFade: false,
      currentFadeTextIsItems: false,
      showLogoSpinner: false,
      spinnerVisible: false,
      notificationWebsocketRendered: false,
      websocketClosedFailureCount: 0,
      orderRequestTimerWatchId: 0,
      user: user,
      paymentCards: [],
      paymentCustomer: null,
      defaultPaymentSource: null,
      //customer order
      latestCustomerOrderIdToConfirm: undefined,

      //modals
      orderRequestModalOpen: false,
      nearestVendorModalOpen: false,
      logisticsCreatorOrderAcceptedModalOpen: false,
      orderLogisticsRequestModalOpen: false,

      resetWebsocketEveryXMinutesTimerId: -1,
      actionMessageRefreshTimerId: -1,
      orderRequestsRefreshTimerId: -1,
      latestChatterId: -1,
      singleUserChatMode: false, //this is toggled via eventRegister

      activeCustomerOrderRequests: [],
      activeDriverOrderRequests: [],
      storeOrderCount: 0,

      //previous request count
      driverNotifyRequests: 0,
      customerNotifyRequests: 0,
      storeNotifyRequests: 0,
    };

    if (__DEV__) {
      XMLHttpRequest = GLOBAL.originalXMLHttpRequest
        ? GLOBAL.originalXMLHttpRequest
        : GLOBAL.XMLHttpRequest;
      console.debug('set http header visible in chrome');
    }

    // HopprWorker.init({ username: null, password: null });
    // //update the playerId on device to api
    // //todo: move to router.js init methods
  }

  //do we ever use this?

  /**gets onesignal status and sends to api */
  _updateOneSignalSubscriptionState = async () => {
    await OneSignal.getPermissionSubscriptionState(async status => {
      console.debug(status);

      if (status.userId != null) {
        console.debug('we got an id');
      } else {
        toast(
          'Onesignnal failed to register!!! there was no userID returned in getPermissionSubscriptionState()',
        );
      }
    });
  };

  /**Adds new card in Stripe via Hoppr*/
  _getAllPaymentCards = async userId => {
    console.debug('Going to get cards');
    let theCardsResponse = await HopprWorker.getPaymentCards(userId);
    if (theCardsResponse) {
      this.setState({paymentCards: theCardsResponse.data}, () =>
        this.triggerAddRemoveCardModal(),
      );
    }
  };

  /**Adds new card in Stripe via Hoppr*/
  _setNewDefaultPaymentCard = async cardId => {
    console.debug('Going to get cards');
    let theDefaultCardResponse = await HopprWorker.setNewCardAsDefaultSource(
      cardId,
      this.props.user.user.id,
    );

    if (theDefaultCardResponse.status == 204) {
      toast('Card default set successfully!');

      //need to refresh customer when completed
      await this._getPaymentCustomer();
    }
  };

  /**Gets the full stripe customer with default card source*/
  _getPaymentCustomer = async () => {
    console.debug('Going to get payment customer');
    let theCardsResponse = await HopprWorker.getStripeCustomer();

    if (theCardsResponse) {
      this.setState(
        {
          paymentCards: theCardsResponse.sources.data,
          paymentCustomer: theCardsResponse,
          defaultPaymentSource: theCardsResponse.default_source,
        },
        // () => this.triggerAddRemoveCardModal()
      );
    }
  };

  /**Adds new card in Stripe via Hoppr */
  _addNewPaymentCard = async (number, exp_month, exp_year, cvc) => {
    //get token from card details, then use that token in api
    try {
      const apiKey = Config.HopprStripe.PKLive;
      const client = new Stripe(apiKey);

      const token = await client.createToken({
        number: number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc,
      });

      let userId = this.props.user.user.id;
      //check token was created properly, else error
      let result = await HopprWorker.addNewStripeCardAsPaymentSource(
        token.id,
        userId,
      );

      //need to refresh cards when complete
      await this._getAllPaymentCards(userId);
      //set state for cards and customer

      return result;
    } catch (err) {
      console.debug('Error adding card');
    } finally {
    }
  };

  /**Adds new card in Stripe via Hoppr*/
  _removeExistingPaymentCard = async cardId => {
    console.debug('removing existing payment card:' + cardId);
    let result = await HopprWorker.removeStripeCardAsPaymentSource(
      cardId,
      this.props.user.user.id,
    );

    //need to refresh cards when complete
    this._getAllPaymentCards(this.props.user.user.id);
  };

  _getOrderRequestDetails = async orderRequestId => {
    let requestDetail = await HopprWorker.getOrderRequest(orderRequestId);
    this.setState({orderRequest: requestDetail});
  };

  _acceptOrderRequest = async (orderRequestId, driverId) => {
    try {
      EventRegister.emit('showSpinner');
      let acceptResult = await HopprWorker.driverAcceptOrderRequest(
        orderRequestId,
        driverId,
      );
      if (acceptResult.status == 200) {
        toast('Order was accepted - off you go!');
        //redirect to driver screen
        this.hideOrderRequestModal();
        clearTimeout(this.orderRequestTimerWatchId);

        showMessage({
          message: 'You are now on an order pickup',
          duration: 10000,
          backgroundColor: 'lightblue', // background color
          description:
            'Please go to the store and collect the order, then deliver it to the destination. You can link to Waze via the driver menu if you click the HUD.',
          color: 'white', // text color
          autoHide: true,
        });

        this.props.checkForNewOrderAndEnableOrderModeIfExists(driverId);
        SoundPlayer.playSoundFile('notification5', 'mp3');

        this.goToScreen('DriverHomeScreen', null);
      } else {
        showMessage({
          message: "Couldn't take that order",
          duration: 2500,
          position: 'top',
          backgroundColor: 'red', // background color
          description:
            'Sorry, the customer cancelled or it was already taken. There will be another one along soon!',
          color: 'white', // text color
          autoHide: true,
          style: {
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
        });

        this.hideOrderRequestModal();
      }
    } catch (error) {
      console.debug('error in accept order request: ' + error);
      toast('There was an error in accept order request');
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  _rejectOrderRequest = async (orderRequestId, driverId) => {
    toast('Order was rejected - you are available again');
    this.hideOrderRequestModal();
    try {
      await HopprWorker.driverRejectOrderRequest(orderRequestId, driverId);
    } catch (error) {
      console.debug(error);
    }
  };

  _driverAcceptOrderLogisticsRequest = async (orderRequestId, driverId) => {
    try {
      this.hideLogisticsOrderDriverRequestModal();
      let acceptanceResuslt =
        await HopprWorker.driverAcceptNewOrderLogisticsRequest(
          orderRequestId,
          driverId,
        );
      if (acceptanceResuslt.status == 200) {
        toast('Logistics order was accepted - off you go!');
        //redirect to driver screen

        showMessage({
          message: 'You are now on an order pickup',
          duration: 10000,
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          description:
            'Please go to the store and collect the order, then deliver it to the destination. You can link to Waze via the driver menu if you click the HUD.',
          color: 'white', // text color
          autoHide: true,
        });

        this.props.checkForNewOrderAndEnableOrderModeIfExists(driverId);
        SoundPlayer.playSoundFile('notification5', 'mp3');
      } else if (acceptanceResuslt.status == 400) {
        //show the api error
        alert('There was a problem: ' + acceptanceResuslt.data.message);
      }
      this.goToScreen('DriverHomeScreen', null);
    } catch (error) {
      console.debug('error in accept order request: ' + error);
      toast('There was an error in accept order request');
    }
  };

  _driverRejectOrderLogisticsRequest = async (orderRequestId, driverId) => {
    toast('Order was rejected - you are available again');
    this.hideLogisticsOrderDriverRequestModal();

    if (orderRequestId != null && typeof orderRequestId !== 'undefined') {
      try {
        await HopprWorker.driverRejectNewOrderLogisticsRequest(
          orderRequestId,
          driverId,
        );
      } catch (error) {
        console.debug(error);
      }
    }
  };

  _cancelCloseOrderRequestModalTimerAndClearVariable = () => {
    //cancel exsiting times
    clearTimeout(this.state.orderRequestTimerWatchId);
    this.setState({orderRequestTimerWatchId: 0});
  };

  _startCloseOrderRequestModalTimer = () => {
    let modalTimerId = setTimeout(() => {
      this.hideOrderRequestModal();
      this._rejectOrderRequest(
        this.props.latestOrderRequestId,
        this.props.user.user.driverId,
      );
    }, Config.DriverModals.requestModalWaitTime);
    // make a call to the API to end the request on behalf of this driver

    this.setState({orderRequestTimerWatchId: modalTimerId});
  };

  _showSpinner = () => {
    this.setState({spinnerVisible: true});
  };

  _hideSpinner = () => {
    this.setState({spinnerVisible: false});
  };

  _showLogoSpinner = () => {
    this.setState({showLogoSpinner: true});
  };

  _hideLogoSpinner = () => {
    this.setState({showLogoSpinner: false});
  };

  ///////////////////
  // MODALS
  ///////////////////
  _renderOrderCancelledModal = () => {
    <Modal
      style={{
        backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
        height: 300,
        borderRadius: 20,
        backgroundColor: '#fff',
      }}
      backdrop={true}
      position={'center'}
      ref={'orderWasCancelledModal'}>
      <Header
        backgroundColor={GlobalStyle.modalHeader.backgroundColor}
        outerContainerStyles={{
          height: 49,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        rightComponent={{
          icon: 'close',
          color: '#fff',
          onPress: () => this.refs.orderWasCancelledModal.close(),
        }}
        centerComponent={{
          text: 'Your order was cancelled',
          style: {color: 'black'},
        }}
      />
      <Image
        style={{flex: 1, maxHeight: 130, height: 130, width: undefined}}
        source={Images.bike}
        resizeMode="contain"
      />
      <Text>{'We are really sorry, they cancelled your order'}</Text>
      <Divider color={'blue'} />
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <View style={styles.driverButtonViewContainer}>
          <ElButton
            buttonStyle={{padding: 10, margin: 5}}
            raised
            backgroundColor={'purple'}
            borderRadius={20}
            icon={{name: 'sync'}}
            title="OK"
            onPress={() => this.refs.orderWasCancelledModal.close()}
          />
        </View>
      </View>
    </Modal>;
  };

  _renderNotificationWebsocket = () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user != null &&
      this.state.notificationWebsocketRendered == false
    ) {
      this.setState({notificationWebsocketRendered: true}, () => {
        //only want one websocket it is global with no params passed
        this.rws = new WebSocket(
          Config.NotificationWebsocketURLLive +
            'username=' +
            this.props.user.user.email,
        );

        this.rws.onmessage = async evt => {
          let parsedMessage;
          try {
            parsedMessage = JSON.parse(evt.data);
            await this.receiveMessage(evt);
          } catch (e) {
            console.debug('Big error!!');
          }
        };

        this.rws.onerror = error => {
          toast('Websocket error: ' + error.error);
          showMessage({
            message: 'Websocket closed',
            description: 'You are no longer receieving messages',
            type: 'success',
            autoHide: true,
            duration: 1000,
            position: 'bottom',
            backgroundColor: 'red', // background color
            hideOnPress: true,
            style: {
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            },
          });
        };
        this.rws.addEventListener('open', () => {});
        this.rws.addEventListener('close', () => {
          toast('Websocket closed');
          showMessage({
            message: 'Resyncing with server',
            description:
              "If you just logged in, you're supposed to see this. If not, we can't establish connection with the server... do you have connectitvy?",
            type: 'success',
            autoHide: true,
            duration: 2000,
            position: 'bottom',
            backgroundColor: 'black', // background color
            hideOnPress: true,
            style: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          });
        });
        // rws.addEventListener("message", () => {
        //   console.debug("we got message");
        //   //this.receiveMessage(event)F
        // });

        // check use
        // return (
        //   <WS
        //     ref={ref => {
        //       this.notificationWebsocket = ref;
        //     }}
        //     url={
        //       Config.NotificationWebsocketURLLive +
        //       "username=" +
        //       this.state.websockUser
        //     }
        //     onOpen={() => {
        //       console.debug("Open!");
        //       toast("Websocket open for: " + this.state.websockUser);
        //       //this.notificationWebsocket.send("Hello");
        //     }}
        //     onMessage={event => this.receiveMessage(event)}
        //     onError={console.debug}
        //     onClose={console.debug}
        //     reconnect // Will try to reconnect onClose
        //   />
        // );
      }); //end after state method
    }
  };

  /**returns the websocket to it's default state */
  _cleanWebsocket = () => {
    this.rws.removeEventListener('close');
    this.rws.removeEventListener('open');
    this.rws.removeEventListener('error');
    this.rws.removeEventListener('message');
    this.rws.close();
    this.rws = null;
    this.rws = undefined;
    this.setState({notificationWebsocketRendered: false});
  };

  _renderOrderRequestHtmlModal = () => {
    let modalOpenValue = this.props.modalsArray.find(
      x => x.modalName === 'orderRequestModal',
    ).isOpenValue;

    let payload = {
      addressForDeliveryLocation:
        ' 201A Arlington Rd, Camden Town, London NW1 7HD, UK ',
      addressForStoreLocation: 'None',
      driverName: 'Abbey Road Station',
      driverFees: 0.0,
      networkImageUrl:
        'https://booza.store:44300/images/networklogos/f0709455-75bc-ea11-8122-00155d5eb736.png',
      productSelection:
        'Order is: 1 units of item: Luc Belaire Luxe Rose (...more)',
      storeName: 'Abbey Road Station  Mr Store Clerk',
    };

    let iconSize = 78;
    if (this.props.latestModalPayload) {
      payload = this.props.latestModalPayload;
    }

    let driverFee = 0.0;
    try {
      driverFee = this.props.latestModalDriverFees; //.toFixed(2);
    } catch (error) {}

    const styles = StyleSheet.create({
      leftText: {
        fontFamily: Constants.fontFamily,
        color: Color.reskin.text,
        fontSize: 14,
        textAlign: 'left',
        flex: 1,
      },
      rightText: {
        fontFamily: Constants.fontFamily,
        color: Color.reskin.dark,
        fontSize: 14,
        textAlign: 'right',
        maxWidth: '60%',
      },
      listRow: {
        flexDirection: 'row',
      },
      divider: {
        borderColor: Color.reskin.text,
        borderWidth: 0.5,
        width: '100%',
        marginTop: '2%',
        marginBottom: '8%',
      },
    });

    return (
      <Modal
        style={{
          backgroundColor: '#F8F8F8',
          height: null,
          borderRadius: 30,
          width: width - 14,
          zIndex: 1,
        }}
        coverScreen={false}
        backdrop={true}
        backdropPressToClose={false}
        onClosed={() => this.hideOrderRequestModal()}
        position={'center'}
        ref={'orderRequestModal'}
        swipeToClose={true}
        isOpen={this.state.orderRequestModalOpen}
        // isOpen={true}
      >
        <Header
          backgroundColor={Color.reskin.secondary}
          outerContainerStyles={{
            height: '8%',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          rightComponent={{
            icon: 'close',
            color: Color.reskin.text,
            onPress: async () =>
              await this._rejectOrderRequest(
                this.props.latestOrderRequestId,
                this.props.user.user.driverId,
              ),
          }}
          centerComponent={{
            text: 'Driver Request',
            style: {
              color: Color.reskin.dark,
              fontFamily: Constants.fontFamilyBlack,
              fontSize: 18,
            },
          }}
        />
        <View>
          <ScrollView>
            <TouchableOpacity>
              {/* LINE 1 */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderBottomLeftRadius: 30,
                  borderBottomRightRadius: 30,
                  paddingHorizontal: '5%',
                }}>
                <View style={{paddingTop: 10}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      textAlign: 'center',
                      color: Color.reskin.dark,
                      fontSize: 20,
                      fontFamily: Constants.fontFamilyBlack,
                      paddingVertical: '5%',
                    }}>
                    {/* {"Hello " + payload.driverName} */}
                    {'Hello Driver'}
                  </Text>
                </View>

                {/* LINE 2 */}
                <View>
                  <Text
                    numberOfLines={1}
                    style={{
                      textAlign: 'center',
                      color: Color.reskin.text,
                      fontSize: 18,
                      fontFamily: Constants.fontFamilyBlack,
                      paddingBottom: '5%',
                    }}>
                    {'YOU HAVE A NEW ORDER REQUEST!'}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    height: 180,
                    maxHeight: 180,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    style={{
                      flex: 1,
                      maxHeight: 150,
                      height: 150,
                      width: undefined,
                      maxWidth: width * 0.9,
                      marginBottom: '5%',
                    }}
                    source={{
                      uri: payload.networkImageUrl,
                    }}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.listRow}>
                  <Text numberOfLines={1} style={styles.leftText}>
                    YOU GET:
                  </Text>
                  <Text numberOfLines={1} style={styles.rightText}>
                    {'£' + driverFee}
                  </Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.listRow}>
                  <Text numberOfLines={2} style={styles.leftText}>
                    PICKUP FROM:
                  </Text>
                  <Text numberOfLines={2} style={styles.rightText}>
                    {payload.addressForStoreLocation}
                  </Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.listRow}>
                  <Text numberOfLines={2} style={styles.leftText}>
                    DELIVER TO:
                  </Text>
                  <Text numberOfLines={2} style={styles.rightText}>
                    {payload.addressForDeliveryLocation}
                  </Text>
                </View>
                <View style={styles.divider}></View>
              </View>
              <View style={{marginTop: 10, paddingBottom: 4, paddingTop: 14}}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: Color.reskin.text,
                    fontSize: 12,
                    fontFamily: Constants.fontFamily,
                  }}>
                  {'PICK AN OPTION:'}
                </Text>
              </View>
              {/* </TouchableOpacity>   */}

              <View
                style={{
                  flex: 1,
                  maxHeight: iconSize + 10,
                  minHeight: iconSize + 10,
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={async () =>
                    await this._rejectOrderRequest(
                      this.props.latestOrderRequestId,
                      this.props.user.user.driverId,
                    )
                  }>
                  <Image
                    style={{
                      maxHeight: iconSize - 30,
                      height: iconSize - 30,
                      width: iconSize - 30,
                      maxWidth: iconSize - 30,
                      tintColor: Color.reskin.secondary,
                    }}
                    source={Images.YesNoSet2_No}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: Color.reskin.secondary,
                      fontSize: 12,
                      textAlign: 'center',
                      fontFamily: Constants.fontFamilyBold,
                    }}>
                    {'NO'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () =>
                    await this._acceptOrderRequest(
                      this.props.latestOrderRequestId,
                      this.props.user.user.driverId,
                    )
                  }>
                  <Image
                    style={{
                      maxHeight: iconSize - 30,
                      height: iconSize - 30,
                      width: iconSize - 30,
                      maxWidth: iconSize - 30,
                      tintColor: Color.reskin.primary,
                    }}
                    source={Images.YesNoSet2_Yes}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: Color.reskin.primary,
                      fontSize: 12,
                      textAlign: 'center',
                      fontFamily: Constants.fontFamilyBold,
                    }}>
                    {'YES'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* <View
            style={{
              border: 5,
              paddingBottom: 5,
              flexDirection: "column",
              borderColor: "black",
              alignContent: "flex-end",
              //alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <ElButton
              buttonStyle={{ padding: 10, marginBottom:6, margin: 1 }}
              raised
              backgroundColor={this.props.latestModalColor}
              borderRadius={20}
              icon={{ name: "sync" }}
              title="Accept"
              onPress={() =>
                this._acceptOrderRequest(
                  this.props.latestOrderRequestId,
                  this.props.user.user.driverId
                )
              }
            />
            <ElButton
              buttonStyle={{ padding: 10, margin: 1 }}
              raised
              backgroundColor={"silver"}
              borderRadius={20}
              icon={{ name: "sync" }}
              title="Reject"
              onPress={async () =>
                await this._rejectOrderRequest(
                  this.props.latestOrderRequestId,
                  this.props.user.user.driverId
                )
              }
            />
          </View> */}
        </View>
      </Modal>
    );
  };

  _renderOrderLogisticsDriverRequestHtmlModal = () => {
    let iconSize = 78;

    const {
      latestModalHTML,
      latestModalColor,
      latestOrderRequestId,
      latestModalPayload,
    } = this.props;
    console.debug('stop');

    let payload = {
      addressForDeliveryLocation:
        ' 201A Arlington Rd, Camden Town, London NW1 7HD, UK ',
      addressForStoreLocation: 'None',
      driverName: 'Abbey Road Station',
      networkImageUrl:
        'https://booza.store:44300/images/networklogos/f0709455-75bc-ea11-8122-00155d5eb736.png',
      productSelection:
        'Order is: 1 units of item: Luc Belaire Luxe Rose (...more)',
      storeName: 'Abbey Road Station  Mr Store Clerk',
    };

    if (latestModalPayload) {
      payload = this.props.latestModalPayload;
    }

    return (
      <Modal
        style={{
          backgroundColor: '#fff',
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 0,
          borderColor: GlobalStyle.primaryColorDark.color,
          width: width - 14,
        }}
        backdrop={true}
        coverScreen={false}
        position={'center'}
        backdropPressToClose={false}
        ref={'orderLogisticsDriverRequestModal'}
        isOpen={
          this.props.modalsArray.find(
            x => x.modalName === 'orderLogisticsDriverRequestModal',
          ).isOpenValue
        }
        swipeToClose={false}>
        <Header
          backgroundColor={this.props.latestModalColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
          }}
          rightComponent={{
            icon: 'close',
            color: '#fff',
            onPress: async () =>
              await this._driverRejectOrderLogisticsRequest(
                this.props.latestOrderRequestId,
                this.props.user.user.driverId,
              ),
          }}
          centerComponent={{
            text: 'Order Logistics Request',
            style: {color: '#fff'},
          }}
        />

        <ScrollView
          style={{
            paddingLeft: 12,
            paddingRight: 12,
          }}>
          {/* LINE 1 */}
          <View style={{paddingTop: 10}}>
            <Text
              numberOfLines={1}
              style={{color: 'black', textAlign: 'center', fontSize: 18}}>
              {'Hello Driver'}
            </Text>
          </View>
          {/* LINE 2 */}
          <View style={{paddingTop: 10, paddingBottom: 14}}>
            <Text
              numberOfLines={1}
              style={{
                color: 'black',
                textAlign: 'center',
                fontStyle: 'italic',
                fontSize: 14,
              }}>
              {'You have a new logistics order request'}
            </Text>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              flex: 1,
            maxHeight: 175,
            height: 175,
            width: undefined,
            maxWidth: width * 0.90,      
            overflow:"hidden",
              
             alignContent:"center",
             justifyContent:"center",
              // borderWidth: 1,
              // borderColor: "hotpink",
            borderRadius: 20
            }}
        >         
         <Image
          style={{          
            flex: 1,
            maxHeight: 175,
            height: 175,
            width: undefined,
            maxWidth: width * 0.90,           
          }}
          source={{
            uri: payload.networkImageUrl,
          }}
          resizeMode="contain"
        />
        </View> */}
          <View style={{borderRadius: 20, overflow: 'hidden'}}>
            <Image
              style={{
                flex: 1,
                borderRadius: 20,
                maxHeight: 250,
                height: 250,
                width: undefined,
              }}
              borderRadius={20}
              // source={{
              //   uri: payload.networkImageUrl,
              // }}
              source={Images.HopprLogoPlaceholder}
              resizeMode="contain"
            />
          </View>

          <View style={{paddingTop: 2}}>
            <Text
              numberOfLines={2}
              style={{color: 'black', textAlign: 'center', fontSize: 18}}>
              {'Pickup from store:\n' + payload.storeName}
            </Text>
          </View>
          {/* <View style={{paddingTop:10}}>
              <Text numberOfLines={2} style={{textAlign:"center", fontSize:18}}>
              {"Deliver to:" + payload.addressForDeliveryLocation}
              </Text>
            </View>
            <View style={{paddingTop:10}}>
              <Text numberOfLines={2} style={{textAlign:"center", fontSize:14}}>
              {payload.productSelection}
              </Text>
                </View>   */}
          <View style={{paddingTop: 14}}>
            <Text style={{color: 'black', textAlign: 'center', fontSize: 12}}>
              {'Pick an option below:'}
            </Text>
          </View>
          <View
            style={{
              border: 5,
              paddingBottom: 5,
              flexDirection: 'column',
              borderColor: 'black',
              alignContent: 'flex-end',
              //alignItems: "flex-end",
              justifyContent: 'flex-end',
            }}>
            <View
              style={{
                flex: 1,
                minHeight: iconSize + 10,
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 3,
                margin: 3,
                marginTop: 20,
              }}>
              <TouchableOpacity
                onPress={async () =>
                  await this._driverAcceptOrderLogisticsRequest(
                    this.props.latestOrderRequestId,
                    this.props.user.user.driverId,
                  )
                }>
                <Image
                  style={{
                    maxHeight: iconSize,
                    height: iconSize,
                    width: iconSize,
                    maxWidth: iconSize,
                    marginRight: 10,
                  }}
                  source={Images.YesNoSet1_Yes}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontStyle: 'italic',
                    color: 'grey',
                    fontSize: 10,
                    textAlign: 'center',
                  }}>
                  {'Yes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () =>
                  await this._driverRejectOrderLogisticsRequest(
                    this.props.latestOrderRequestId,
                    this.props.user.user.driverId,
                  )
                }>
                <Image
                  style={{
                    maxHeight: iconSize,
                    height: iconSize,
                    width: iconSize,
                    maxWidth: iconSize,
                    marginLeft: 10,
                  }}
                  source={Images.YesNoSet1_No}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontStyle: 'italic',
                    color: 'grey',
                    fontSize: 10,
                    textAlign: 'center',
                  }}>
                  {'No'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* <View
              style={{
                border: 5,
                padding: 10,
                flexDirection: "column",
                borderColor: "black",
                alignContent: "flex-end",
                //alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              <ElButton
                buttonStyle={{ padding: 10,marginBottom:6, margin: 1 }}
                raised
                backgroundColor={this.props.latestModalColor}
                borderRadius={20}
                icon={{ name: "sync" }}
                title="Accept"
                onPress={async () =>
                  await this._driverAcceptOrderLogisticsRequest(
                    this.props.latestOrderRequestId,
                    this.props.user.user.driverId
                  )
                }
              />
              <ElButton
                buttonStyle={{ padding: 10, margin: 1 }}
                raised
                backgroundColor={"silver"}
                borderRadius={20}
                icon={{ name: "sync" }}
                title="Reject"
                onPress={async () =>
                  await this._driverRejectOrderLogisticsRequest(
                    this.props.latestOrderRequestId,
                    this.props.user.user.driverId
                  )
                }
              />
            </View>                   */}
        </ScrollView>
      </Modal>
    );
  };

  _cancelOrderRequest = async id => {
    try {
      let cancelResult = await HopprWorker.cancelOrderRequest(id);
      if (cancelResult.status == 200) {
        //refresh
        SoundPlayer.playSoundFile('notification6', 'mp3');
        showMessage({
          message: 'Request Cancelled!',
          description:
            'No sweat. Your order was cancelled without being charged.',
          type: 'success',
          autoHide: true,
          duration: 5000,
          position: 'bottom',
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          hideOnPress: true,
          style: {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        });
        await this._refreshActiveCustomerOrderRequests();
        this.hideCustomerOrderRequestsModal();
      } else {
        SoundPlayer.playSoundFile('negative1', 'mp3');
        showMessage({
          message: 'Wait a sec...',
          description:
            "The request didn't cancel, cochise. We need to wait for all the ducks to be in a row first.\n\nCan you try again in a couple of seconds??",
          type: 'success',
          autoHide: true,
          duration: 5000,
          position: 'bottom',
          backgroundColor: 'red', // background color
          hideOnPress: true,
          style: {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        });
      }
    } catch (error) {
      console.debug(error);
    }
  };

  _setSingleUserChatMode = newBoolValue => {
    this.setState({singleUserChatMode: newBoolValue});
  };

  /**sets the chatter who sent the latest message */
  _setlatestChatterId = (newChatterAccountId, callback = () => {}) => {
    this.setState({latestChatterId: newChatterAccountId}, () => {
      console.debug('exec');
      callback(); //callback opens modal when passed
    });
  };

  _resetlatestChatterId = () => {
    this.setState({latestChatterId: -1});
  };

  getActiveRouteName = navigationState => {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    return route.routeName;
  };

  //MODAL TRIGGERS

  /**See and respond to action messages! */
  triggerActionMessagesModal = () => {
    this.props.updateModalState('actionMessageModal', true);

    //hide pingers and save state
    this._savePingerState();
    this._setPingersCorner();
  };

  hideActionMessagesModal = () => {
    this.props.updateModalState('actionMessageModal', false);

    this._restorePingerState();
  };
  /**When driver gets itinerary updated */
  triggerTellDriverUpdatedLogisticsModal = () => {
    this.props.updateModalState('tellDriverUpdatedLogisticsModal', true);
  };

  hideTellDriverUpdatedLogisticsModal = () => {
    this.props.updateModalState('tellDriverUpdatedLogisticsModal', false);
  };

  triggerCourierControlsModal = () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user !== null
    ) {
      //check a location has been set
      if (this.props.latestPickerDestinationText !== '') {
        this.props.updateModalState('courierControlsModal', true);
      } else {
        this.triggerLocationPickerModal();
        showMessage({
          style: {borderBottomLeftRadius: 20, borderBottomRightRadius: 20},
          position: 'top',
          message: "We'd love to let you send something...",
          description: 'But we need a destination first. Please set one.',
          backgroundColor: 'hotpink', // background color
          color: 'white', // text color,
          duration: 8000,
          autoHide: true,
        });
      }
    } else {
      showMessage({
        style: {borderBottomLeftRadius: 20, borderBottomRightRadius: 20},
        position: 'top',
        message: "We'd love to let you send something...",
        description: 'But could you create an account or login first?',
        backgroundColor: 'hotpink', // background color
        color: 'white', // text color,
        duration: 8000,
        autoHide: true,
      });
    }
  };

  hideCourierControlsModal = () => {
    this.props.updateModalState('courierControlsModal', false);
  };

  /**When driver accepted new logistcs order */
  triggerTellOrderLogisticsCreatorOrderAcceptedModal = () => {
    console.debug('okay...');
    try {
      this.setState({logisticsCreatorOrderAcceptedModalOpen: true});
    } catch (error) {
      console.debug(error);
    }
  };

  hideTellOrderLogisticsCreatorOrderAcceptedModal = () => {
    this.setState({logisticsCreatorOrderAcceptedModalOpen: false});
  };

  triggerLocationPickerModal = async () => {
    console.debug('Requesting location permissions');
    await MapWorker.requestLocationPermission();
    this.props.updateModalState('locationPickerModal', true);
  };
  hideLocationPickerModal = () => {
    this.props.updateModalState('locationPickerModal', false);
  };

  triggerStoreLocationPickerModal = async () => {
    if (typeof this.props.user !== 'undefined') {
      if (
        typeof this.props.user.user !== 'undefined' &&
        this.props.user.user !== null
      ) {
        //CHECK WHICH ROLES IS IMPLEMENTED
        if (this.props.user.user.roles.find(x => x === 'Logistics')) {
          console.debug('Requesting storeLocationPickerModal');
          await MapWorker.requestLocationPermission();
          this.props.updateModalState('storeLocationPickerModal', true);
        }
      }
    }
  };

  hideStoreLocationPickerModal = () => {
    this.props.updateModalState('storeLocationPickerModal', false);
  };

  triggerSalesBIModal = () => {
    this.props.updateModalState('salesBIModal', true);
  };

  hideSalesBIModal = () => {
    this.props.updateModalState('salesBIModal', false);
  };

  triggerLogisticsOrderDriverRequestModal = async (
    orderRequestGuid,
    networkColor,
    message,
    latestModalPayload,
  ) => {
    try {
      await this.props.updateLatestInboundOrder(
        orderRequestGuid,
        networkColor,
        message,
        latestModalPayload,
      );
      //save network color param sent in websock
      this.props.updateModalState('orderLogisticsDriverRequestModal', true);
      SoundPlayer.playSoundFile('notification6', 'mp3');
      Vibration.vibrate(PATTERN);

      await this._getOrderRequestDetails(orderRequestGuid);

      //this._startCloseOrderRequestModalTimer();
    } catch (error) {
      console.debug(error);
    }
  };

  hideLogisticsOrderDriverRequestModal = () => {
    this.props.updateModalState('orderLogisticsDriverRequestModal', false);
    this._restorePingerState();
  };

  triggerChatModal = () => {
    this.props.updateModalState('chatModal', true);
  };

  hideChatModal = () => {
    this.props.updateModalState('chatModal', false);
  };
  //cashout
  triggerCashoutModal = () => {
    this.props.updateModalState('cashoutModal', true);
  };
  hideCashoutModal = () => {
    this.props.updateModalState('cashoutModal', false);
  };
  //network picker
  triggerNetworkPickerModal = () => {
    this.props.updateModalState('networkPickerModal', true);
  };

  hideNetworkPickerModal = () => {
    this.props.updateModalState('networkPickerModal', false);

    this._restorePingerState();
  };
  //network display modal
  triggerNetworkDisplayModal = () => {
    this.props.updateModalState('networkDisplayModal', true);
  };

  hideNetworkDisplayModal = () => {
    this.props.updateModalState('networkDisplayModal', false);
  };

  //video display modal
  triggerVideoDisplayModal = () => {
    this.props.updateModalState('videoDisplayModal', true);
  };

  hideVideoDisplayModal = () => {
    this.props.updateModalState('videoDisplayModal', false);
    this._restorePingerState();
  };

  //network info modal - don't think this is even used
  triggerNetworkInfoModal = () => {
    this.props.updateModalState('networkInfoModal', true);
  };

  hideNetworkInfoModal = () => {
    this.props.updateModalState('networkInfoModal', false);
  };

  //reset password

  triggerResetPasswordModal = () => {
    this.setState({resetPasswordModalOpen: true});
    //this.props.updateModalState("resetPasswordModal", true);
  };

  hideResetPasswordModal = () => {
    this.setState({resetPasswordModalOpen: false});
    //  this.props.updateModalState("resetPasswordModal", false);
  };
  //network search
  triggerNetworkAddAndSearchModal = () => {
    this.props.updateModalState('networkSearchAndAddModal', true);
  };

  hideNetworkAddAndSearchModal = () => {
    this.props.updateModalState('networkSearchAndAddModal', false);
  };
  //request permissions
  triggerRequestPermissionsModal = () => {
    this.props.updateModalState('requestPermissionsModal', true);

    //hide pingers and save state
    this._savePingerState();
    this._setPingersCorner();
  };

  hideRequestPermissionsModal = () => {
    this.props.updateModalState('requestPermissionsModal', false);

    this._restorePingerState();
  };
  //nearest stores
  triggerNearestStoresAndNetworksModal = () => {
    this.props.updateModalState('nearestStoresAndNetworksModal', true);

    //hide pingers and save state
    this._savePingerState();
    this._setPingersCorner();
  };

  hideNearestStoresAndNetworksModal = () => {
    this.props.updateModalState('nearestStoresAndNetworksModal', false);

    this._restorePingerState();
  };
  //cards
  triggerAddRemoveCardModal = () => {
    this.props.updateModalState('addRemoveCardModal', true);
  };

  hideAddRemoveCardModal = () => {
    this.props.updateModalState('addRemoveCardModal', false);
  };
  triggerOrderRequestedModal = () => {
    this.props.updateModalState('orderRequestedModal', true);
  };

  hideOrderRequestedModal = () => {
    this.props.updateModalState('orderRequestedModal', false);
  };

  triggerNearestStoresModal = () => {
    let isThereLatLng =
      HopprWorker.getDestinationPickedLatLngIfExistFromStoreOrNULL();
    if (isThereLatLng) {
      this.setState({nearestVendorModalOpen: true});
    } else {
      showMessage({
        style: {borderBottomLeftRadius: 20, borderBottomRightRadius: 20},
        position: 'center',
        message: "We'd love to show you nearby stores...",
        description: 'But could you set an order destination first?',
        backgroundColor: 'hotpink', // background color
        color: 'white', // text color,
        duration: 4000,
        autoHide: true,
      });
    }
  };

  hideNearestStoresModal = () => {
    this.setState({nearestVendorModalOpen: false});
  };

  //MODAL TRIGGERS
  triggerWasOrderCompletedModal = () => {
    this.props.updateModalState('wasOrderCompletedModal', true);
  };

  hideWasOrderCompletedModal = () => {
    this.props.updateModalState('wasOrderCompletedModal', false);
  };

  //ORDER REQUEST
  triggerCustomerOrderRequestsModal = () => {
    this.props.updateModalState('customerOrderRequestsModal', true);
    this.hideDriverOrderRequestsModal();
    this.hideOrderRequestedModal();

    //hide pingers and save state
    this._savePingerState();
    this._setPingersCorner();
  };

  hideCustomerOrderRequestsModal = () => {
    this.props.updateModalState('customerOrderRequestsModal', false);
    this._restorePingerState();
  };

  triggerDriverOrderRequestsModal = () => {
    console.log('Triggered Driver Order Request Modal');
    this.props.updateModalState('driverOrderRequestsModal', true);
    this.hideCustomerOrderRequestsModal();
    this.hideOrderRequestedModal();

    //hide pingers and save state
    this._savePingerState();
    this._setPingersCorner();
  };

  hideDriverOrderRequestsModal = () => {
    this.props.updateModalState('driverOrderRequestsModal', false);

    this._restorePingerState();
  };

  //PAYMENT
  triggerYouGotPaidModal = () => {
    this.props.updateModalState('youGotPaidModal', true);
    SoundPlayer.playSoundFile('cashregister', 'mp3');
  };

  hideYouGotPaidModal = () => {
    this.props.updateModalState('youGotPaidModal', false);
  };

  triggerOneMoreStepModal = () => {
    this.props.updateModalState('oneMoreStepModal', true);
  };

  hideOneMoreStepModal = () => {
    this.props.updateModalState('oneMoreStepModal', false);
  };

  triggerOrderWasCancelledTellDriverModal = () => {
    this.props.updateModalState('orderWasCancelledTellDriverModal', true);
  };

  hideOrderWasCancelledTellDriverModal = () => {
    this.props.updateModalState('orderWasCancelledTellDriverModal', false);
  };

  //ennd
  triggerStoreReceivesNewOrderModal = () => {
    this.props.updateModalState('storeReceivesNewOrderModal', true);

    //test message
    showMessage({
      message: 'New order inbound',
      description:
        'You have a new order inbound to your location. Please go to the store screen to check its details',
      type: 'success',
      autoHide: false,
      position: 'center',
      backgroundColor: '#ED8C48', // background color
      hideOnPress: true,
    });
  };
  hideStoreReceivesNewOrderModal = () => {
    this.props.updateModalState('storeReceivesNewOrderModal', false);
  };

  //end
  triggerStoreConfirmOrderPickupModal = () => {
    this.props.updateModalState('storeConfirmOrderPickupModal', true);
  };
  hideStoreConfirmOrderPickupModal = () => {
    this.props.updateModalState('storeConfirmOrderPickupModal', false);
  };

  //HELP
  triggerStartingHelpModal = () => {
    this.props.updateModalState('startingHelpModal', true);
  };
  hideStartingHelpModal = () => {
    this.props.updateModalState('startingHelpModal', false);
  };

  //QUICK CONTROLS
  triggerQuickControlsModal = () => {
    this.props.updateModalState('quickControlsModal', true);
  };
  hideQuickControlsModal = () => {
    this.props.updateModalState('quickControlsModal', false);
  };

  triggerOrderWasCancelledTellCustomerModal = async () => {
    toast('Order cancel triggered: show order modal');
    SoundPlayer.playSoundFile('negative1', 'mp3');
    this.props.updateModalState('orderWasCancelledTellCustomerModal', true);
  };

  hideOrderWasCancelledTellCustomerModal = () => {
    this.props.updateModalState('orderWasCancelledTellCustomerModal', false);
  };

  triggerOrderWasConfirmedAcceptedTellCustomerModal = () => {
    this.props.updateModalState(
      'orderWasConfirmedAcceptedTellCustomerModal',
      true,
    );
  };

  hideOrderWasConfirmedAcceptedTellCustomerModal = () => {
    this.props.updateModalState(
      'orderWasConfirmedAcceptedTellCustomerModal',
      false,
    );
  };

  triggerOrderWasConfirmedPickedUpTellCustomerModal = () => {
    this.props.updateModalState(
      'orderWasConfirmedPickedUpTellCustomerModal',
      true,
    );
  };

  hideOrderWasConfirmedPickedUpTellCustomerModal = () => {
    this.props.updateModalState(
      'orderWasConfirmedPickedUpTellCustomerModal',
      false,
    );
  };

  //ORDER REQUEST MODAL W EMIT AND EVENT
  triggerOrderRequestModal = () => {
    this.refs.orderRequestModal.open();
    this.setState({orderRequestModalOpen: true});
    //this is used to tell if modal is open or closed in toher componentents
    // this.props.updateModalState("orderRequestModal", true);
  };

  hideOrderRequestModal = () => {
    if (typeof this.refs.orderRequestModal !== 'undefined') {
      this.refs.orderRequestModal.close();
    }

    //if there's an active timer, cancel it
    if (this.state.orderRequestTimerWatchId != 0) {
      this._cancelCloseOrderRequestModalTimerAndClearVariable();
    }

    this.setState({orderRequestModalOpen: false});
    this._restorePingerState();

    this._refreshActiveDriverOrderRequests();
  };

  /**Get the address from lat/lng */
  reverseGeocode = async (lat, lng) => {
    try {
      let geoResult = await GeoWorker.reverseGeocode(lat, lng);
      console.debug('Got geo result');
      return geoResult.formattedAddress;
    } catch (error) {
      console.debug(error);
    }
  };

  reverseGeocodeFullPayload = async (lat, lng) => {
    try {
      let geoResult = await GeoWorker.reverseGeocode(lat, lng);
      console.debug('Got geo result');
      return geoResult;
      //return await HopprWorker.reverseGeocode(lat, lng);
    } catch (error) {
      console.debug(error);
    }
  };

  _resetWebsocket = () => {
    if (typeof this.rws !== 'undefined') {
      this.refs.toast.show('Websocket cleaned');
      //check counter value - if x then delete existing websocket and new one will be created automatically
      this._cleanWebsocket();
      this.setState({websocketClosedFailureCount: 0});
    }
  };

  _incrementWebsockFailedCountAndResetIfNeeded = () => {
    //check the state of the socket
    if (typeof this.rws !== 'undefined') {
      //if closed or closing increment counter
      let isItup = this.rws.readyState;
      //let isItup = 3;
      let currentFailCount = this.state.websocketClosedFailureCount;
      if (isItup == 2 || isItup == 3) {
        currentFailCount = currentFailCount + 1;
        if (currentFailCount >= 2) {
          // //pull the socket
          // showMessage({
          //   message: "Websocket cleaned",
          //   description:
          //     "Shalom",
          //   type: "success",
          //   autoHide: true,
          //   duration: 4000,
          //   backgroundColor: "orange", // background color
          //   hideOnPress: true,
          // });

          this._resetWebsocket();
        } else {
          //   showMessage({
          //   message: "Websocket fail count incremented",
          //   description:
          //     `State was ${isItup} current count is: ${currentFailCount}`,
          //   type: "success",
          //   autoHide: true,
          //   duration: 2000,
          //   backgroundColor: "brown", // background color
          //   hideOnPress: true,
          // });

          this.setState({websocketClosedFailureCount: currentFailCount});
        }
      } else {
        //reboot the counter if it's incremented - that was you need 2 fails in a ROW to trigger
        if (this.state.websocketClosedFailureCount > 0) {
          this.setState({websocketClosedFailureCount: 0});
        }
      }
    }
  };

  //**Get lat/lng from address text*/
  geocode = async addressText => {
    try {
      let geoResult = await GeoWorker.geocode(addressText);
      console.debug('Got geo result');
      return geoResult;
      //return await HopprWorker.reverseGeocode(lat, lng);
    } catch (error) {
      console.debug(error);
    }
  };

  /**When an order comes in, display this modal */
  triggerOrderRequestAcceptModal = async (
    orderRequestGuid,
    networkColor,
    driverFees,
    message,
    latestModalPayload,
  ) => {
    await this.props.updateLatestInboundOrder(
      orderRequestGuid,
      networkColor,
      driverFees,
      message,
      latestModalPayload,
    );
    //save network color param sent in websock
    //playSoundFile("notification6", "mp3");

    Vibration.vibrate(PATTERN);
    //push to modal redux - set state open
    this.triggerOrderRequestModal();
    this._startCloseOrderRequestModalTimer();

    showMessage({
      message: 'New delivery request',
      description:
        'Please respond to the request below, or ignore it and it will disappear',
      type: 'success',
      autoHide: true,
      style: {
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      },
      duration: 13000,
      backgroundColor: this.props.latestModalColor, // background color
      hideOnPress: true,
    });

    await this._getOrderRequestDetails(orderRequestGuid);

    this._savePingerState();
    this._setPingersCorner();
  };

  //other order process funcitonaltity
  customerConfirmsDeliverySuccessful = async () => {
    try {
      EventRegister.emit('showSpinner');
      console.debug('stop');
      this.hideWasOrderCompletedModal();
      if (typeof this.state.latestCustomerOrderIdToConfirm !== 'undefined') {
        let resultConfirm = await HopprWorker.customerConfirmsDeliveryPayDriver(
          this.state.latestCustomerOrderIdToConfirm,
        );

        if (resultConfirm.status == 200) {
          SoundPlayer.playSoundFile('cashregister', 'mp3');
          toast(`Thanks for shopping with ${Config.InAppName}!!!`);
          showMessage({
            style: {
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            },
            message: 'Your order is complete!',
            autoHide: false,

            description:
              'Please take a moment to review our app on the Play or App store if you liked it! See you again soon.',
            backgroundColor: GlobalStyle.primaryColorDark.color, // background color
            position: 'center',
            color: 'white', // text color
          });
        } else {
          // alert(
          //   "We could't confirm delivery: " + resultConfirm.data.exceptionMessage
          // );
        }
      } else {
        alert(
          'There was no latestCustomerOrderIdToConfirm' +
            resultConfirm.data.exceptionMessage,
        );
      }
      //this.goToScreen("Home", null);
    } catch (error) {
      showMessage({
        style: {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        },
        position: 'center',
        message: 'Cheers',
        autoHide: false,
        duration: 5000,
        description: 'I think that was already confirmed. Thanks!',
        //backgroundColor: "hotpink", // background color
        backgroundColor: GlobalStyle.primaryColorDark.color, // background color
        color: 'white', // text color
      });
      // alert("Sorry, that didn't work - no connectivity?");
    } finally {
      EventRegister.emit('hideSpinner');
    }
    //reset something?? go somewhere??
  };
  customerSaysDeliveryFailed = () => {
    alert(Constants.OrderHelpMessage);
    //this.hideWasOrderCompletedModal();
  };

  receiveMessage = async event => {
    var dataObject = event.data;
    console.debug(dataObject);
    //check if object has a hook - if so, implement that hook
    //toastr.success("we receieved a message with hook");
    var clientJSON = JSON.parse(dataObject);
    //check the event matrix to know what to trigger
    if (clientJSON.hook) {
      switch (clientJSON.hook) {
        case 'chatMessage':
          SoundPlayer.playSoundFile('smbfireball', 'mp3');

          if (
            this.props.modalsArray.find(x => x.modalName === 'chatModal')
              .isOpenValue != true
          ) {
            showMessage({
              position: 'center',
              message: 'Inbound Chat Message:',
              description: clientJSON.message,
              backgroundColor: GlobalStyle.primaryColorDark.color, // background color
              color: 'white', // text color,
              autoHide: false,
              duration: 4000,
              onLongPress: () => this.triggerChatModal(),
            });
          }

          //second param is their user ID
          let otherUserGuidz = clientJSON.paramaters[1].value;
          this._setlatestChatterId(otherUserGuidz);
          //you are the receipient
          this.props
            .addNewChatMessage(
              otherUserGuidz,
              otherUserGuidz,
              clientJSON.message,
              1,
            )
            .then(() => {
              this.props.filterMessagesToUser(otherUserGuidz);
            });

          break;
        case 'changeurl':
          let newUrl = HtmlViewToNavigationComponentURLService.Map(
            clientJSON.paramaters[0].value,
          );
          //any other actions based on the screen we are being sent to
          this.goToScreen(newUrl);
          break;
        case 'orderonitsway': //tells customer journey has begun
          this.hideOrderRequestedModal();
          this.triggerOrderWasConfirmedAcceptedTellCustomerModal();
          showMessage({
            message: 'Your order is on the way!',
            description: "Go to the 'track order' screen to view its progress",
            backgroundColor: 'orange', // background color
            color: 'white', // text color,
            duration: 4000,
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            autoHide: true,
          });

          //emptyCart: () => CartRedux.actions.emptyCart(dispatch),
          break;
        case 'orderbeenpickedupfromstore': //for customer, tells them not long to go, triggered by driver
          toast(
            "Your order has been collected from the store!! Won't be long now!!",
          );
          //should show modal telling customer order is on final phase
          SoundPlayer.playSoundFile('notification4', 'mp3');
          this.triggerOrderWasConfirmedPickedUpTellCustomerModal();
          break;
        case 'driveralmostreachedpickup':
          SoundPlayer.playSoundFile('doorbell1', 'mp3');
          SoundPlayer.playSoundFile('doorbell1', 'mp3');
          //this.triggerOrderWasConfirmedPickedUpTellCustomerModal();
          Vibration.vibrate(PATTERN);
          showMessage({
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            message: 'Your driver is almost here',
            autoHide: true,
            duration: 8000,
            description:
              'The driver is about to arrive to pick up the order - please go and meet him shortly.',
            //backgroundColor: "hotpink", // background color
            backgroundColor: 'lightblue', // background color
            color: 'white', // text color
          });
          break;
        case 'driverreachedpickup':
          SoundPlayer.playSoundFile('doorbell1', 'mp3');
          Vibration.vibrate(PATTERN);
          //this.triggerOrderWasConfirmedPickedUpTellCustomerModal();
          showMessage({
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            message: 'The driver is here',
            autoHide: false,
            duration: 8000,
            description: 'Please give them the order!!!!',
            //backgroundColor: "hotpink", // background color
            backgroundColor: 'black', // background color
            color: 'white', // text color
          });
          break;
        case 'driveralmostreacheddestination':
          Vibration.vibrate(PATTERN);
          SoundPlayer.playSoundFile('doorknock1', 'mp3');
          SoundPlayer.playSoundFile('doorknock1', 'mp3');
          showMessage({
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            message: 'Your driver is about to arrive',
            autoHide: true,
            duration: 8000,
            description: 'Exciting!!',
            //backgroundColor: "hotpink", // background color
            backgroundColor: 'black', // background color
            color: 'white', // text color
          });
          //this.triggerOrderWasConfirmedPickedUpTellCustomerModal();
          break;
        case 'drivercancelledorder': //for customers, when driver cancels
          //toast("Got cancel order triggered");
          this.triggerOrderWasCancelledTellCustomerModal();
          const currentRouteName = this.getActiveRouteName(
            this.navigator.state.nav,
          );
          if (currentRouteName === 'TrackOrderScreen') {
            this.goToScreen('Home');
          }
          break;
        case 'driverordercompleted':
          //get the ID as passed param
          let orderIdFromWebhook = clientJSON.paramaters[0].value;
          this.setState({latestCustomerOrderIdToConfirm: orderIdFromWebhook});
          this.triggerWasOrderCompletedModal();
          break;
        case 'yougotpaid':
          // toast("Got you got paid triggered");
          this.triggerYouGotPaidModal();
          break;
        case 'newpermissionadded':
          toast('Your permission was accepted!! Check the permissions screen');
          SoundPlayer.playSoundFile('storeneworder', 'mp3');
          break;
        case 'storereceivesneworder':
          // toast("Got new store order");
          SoundPlayer.playSoundFile('storeneworder', 'mp3');
          this.triggerStoreReceivesNewOrderModal();
          break;
        case 'customercancelledordertellstore':
          toast('The customer cancelled the order!!!');
          break;
        case 'storeconfirmorderpickup': //this tells the store the driver has confirmed the pickup
          //  toast(            "Got store confirm order pickup triggered - should tell store to confirm also if not done already");
          //should
          break;
        case 'openacceptordermodal':
          this.triggerOrderRequestAcceptModal(
            clientJSON.paramaters[0].value,
            clientJSON.paramaters[2].value, //this is color
            clientJSON.paramaters[3].value, //this is cost
            clientJSON.message,
            JSON.parse(clientJSON.paramaters[4].value),
          );

          //tell server we got message so no resends
          try {
            await HopprWorker.markOrderRequestAsRead(
              clientJSON.paramaters[1].value,
              clientJSON.paramaters[0].value,
            );
          } catch (error) {
            toast("Couldn't mark as read!!!");
          }
          break;
        case 'closeopenorderwaiting':
          //toast("Got close open modal triggered");
          if (
            clientJSON.paramaters[0].value == this.props.latestOrderRequestId
          ) {
            //shut down the modal
            this.hideOrderRequestModal();
            this._rejectOrderRequest(
              this.props.latestOrderRequestId,
              this.props.user.user.driverId,
            );
          }
          break;
        case 'customercancelledordertelldriver': //when customer cancels order, tell driver
          //  toast("Got customer cancel order triggered");
          this.triggerOrderWasCancelledTellDriverModal();
          this.props.resetDriverStateToDefault();
          break;
        case 'driverconfirmorderpickup': //when store confirms the pickup
          // toast("Got confirm order prickup triggered");
          this.triggerStoreConfirmOrderPickupModal();
          //this.hideStoreConfirmOrderPickupModal();
          break;
        case 'driveracceptsnewlogisticsorder':
          SoundPlayer.playSoundFile('smbpowerup', 'mp3');
          this.triggerTellOrderLogisticsCreatorOrderAcceptedModal();
          break;
        //LOGISTICS
        case 'newunpaidlogisticsorderrequest':
          this.triggerLogisticsOrderDriverRequestModal(
            clientJSON.paramaters[0].value,
            clientJSON.paramaters[2].value, //this is color
            clientJSON.message,
            JSON.parse(clientJSON.paramaters[3].value),
          );
          break;
        case 'driverorderwasaddedtoitinerary':
          this.triggerTellDriverUpdatedLogisticsModal();
          SoundPlayer.playSoundFile('notification2', 'mp3');
          showMessage({
            position: 'center',
            message: 'Your driver itinerary was updated!!!',
            autoHide: false,
            duration: 15000,
            description:
              'Switch to driver mode to see your updated orders and delivery destinations. A destination or order was added or removed.',
            //backgroundColor: "hotpink", // background color
            backgroundColor: '#761BF1', // background color
            color: 'white', // text color
          });
          break;
        case 'newntcpayment':
          SoundPlayer.playSoundFile('notification2', 'mp3');
          showMessage({
            style: {borderTopLeftRadius: 20, borderTopRightRadius: 20},
            position: 'bottom',
            message: 'You received a new NTC payment!',
            autoHide: false,
            duration: 5000,
            description: clientJSON.message,
            //backgroundColor: "hotpink", // background color
            backgroundColor: '#761BF1', // background color
            color: 'white', // text color
          });
          break;
      }
    } else {
      //we assume it's just a message - print it'
      toastr.success(clientJSON.message);
    }
  };

  goToScreen = (routeName, params) => {
    if (!this.navigator) {
      return toast('Cannot navigate');
    }
    console.debug('navigating to:' + routeName + ' with params ' + params);
    this.navigator.dispatch({type: 'Navigation/NAVIGATE', routeName, params});
    closeDrawer();
  };

  _renderActiveDriverRequestModal = () => {
    try {
      // if(typeof this.props.user.user.driverId !== "undefined")
      // {
      return (
        <DriverOrderRequestsModal
          title={'Driver Requests'}
          refString={'driverOrderRequestsModal'}
          mainColor={GlobalStyle.primaryColorDark.color}
          //cancelOrderRequest={this._cancelOrderRequest}
          refreshAllRequests={async () => {
            await this._refreshActiveCustomerOrderRequests();
            await this._refreshActiveDriverOrderRequests();
          }}
          orderRequests={this.state.activeDriverOrderRequests}
          openClosed={
            this.props.modalsArray.find(
              x => x.modalName === 'driverOrderRequestsModal',
            ).isOpenValue
          }
          driverId={this.props.user.user.driverId}
          openMe={this.triggerDriverOrderRequestsModal}
          closeMe={this.hideDriverOrderRequestsModal}
          rejectOrderRequest={this._rejectOrderRequest}
          goToScreen={this.goToScreen}
        />
      );
      //}
    } catch (error) {}
  };

  render() {
    const {
      theme: {
        colors: {background},
      },
    } = this.props;

    if (!this.props.introStatus) {
      return <AppIntro />;
    }
    let networkCssColor = this._getNetworkCssColor();

    return (
      <MenuSide
        goToScreen={this.goToScreen}
        routes={
          <View
            style={[
              Styles.app,
              {
                backgroundColor: networkCssColor, //GlobalStyle.primaryColorDark.color
              },
            ]}>
            <StatusBar
              hidden={Device.isIphoneX ? false : !Config.showStatusBar}
              barStyle="light-content"
            />
            {/* <StatusBar
            backgroundColor={"white"}
              // backgroundColor={"white"}
              // translucent={false}
              //barStyle={Config.Theme.isDark ? "light-content" : "dark-content"}
              animated
              hidden={true}
            //hidden={Device.isIphoneX ? false : !Config.showStatusBar}
            /> */}
            <MyToast />
            <Navigation ref={comp => (this.navigator = comp)} />
            <ModalReview />
            <MyNetInfo />
            {/* ADD MODALS HERE */}
            {this._renderNotificationWebsocket()}
            {
              <CustomerOrderRequestsModal
                title={'Live Order Requests'}
                refreshAllRequests={async () => {
                  await this._refreshActiveCustomerOrderRequests();
                  await this._refreshActiveDriverOrderRequests();
                }}
                mainColor={GlobalStyle.primaryColorDark.color}
                refString={'customerOrderRequestsModal'}
                cancelOrderRequest={this._cancelOrderRequest}
                orderRequests={this.state.activeCustomerOrderRequests}
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'customerOrderRequestsModal',
                  ).isOpenValue
                }
                openMe={this.triggerCustomerOrderRequestsModal}
                closeMe={this.hideCustomerOrderRequestsModal}
              />
            }

            {/* SPINNER */}
            {/* {this.state.spinnerVisible && (
              <View style={styles.spinnerContainer}>
                <Spinner
                  style={styles.spinner}
                  isVisible={this.state.spinnerVisible}
                  size={spinnerConfig.size}
                  onLongPress={() => this._hideSpinner()}
                  type={spinnerConfig.type}
                  color={spinnerConfig.color}
                />
              </View>
            )} */}
            {/* DRIVER REQUESTS */}

            {this.props.user.user != null &&
              this._renderActiveDriverRequestModal()}
            {this.props.user.user != null &&
              this._renderActiveDriverOrderRequestMenu()}
            {this.props.user.user != null &&
              this._renderActiveStoreInboundOrderMenu()}
            {this.props.user.user != null &&
              this._renderActiveCustomerOrderRequestMenu()}

            {
              <YouGotPaidModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'youGotPaidModal',
                  ).isOpenValue
                }
                openMe={this.triggerYouGotPaidModal}
                closeMe={this.hideYouGotPaidModal}
              />
            }
            {
              <OrderWasCancelledTellDriverModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'orderWasCancelledTellDriverModal',
                  ).isOpenValue
                }
                openMe={this.triggerOrderWasCancelledTellDriverModal}
                closeMe={this.hideOrderWasCancelledTellDriverModal}
              />
            }
            {
              <OrderWasCancelledTellCustomerModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'orderWasCancelledTellCustomerModal',
                  ).isOpenValue
                }
                openMe={this.triggerOrderWasCancelledTellCustomerModal}
                closeMe={this.hideOrderWasCancelledTellCustomerModal}
              />
            }
            {
              <StoreConfirmOrderPickupModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'storeConfirmOrderPickupModal',
                  ).isOpenValue
                }
                driverConfirmOrderPickup={this.driverConfirmOrderPickup}
                openMe={this.triggerStoreConfirmOrderPickupModal}
                closeMe={this.hideStoreConfirmOrderPickupModal}
                goToScreen={this.goToScreen}
              />
            }
            {
              <OrderWasConfirmedAcceptedTellCustomerModal
                openClosed={
                  this.props.modalsArray.find(
                    x =>
                      x.modalName ===
                      'orderWasConfirmedAcceptedTellCustomerModal',
                  ).isOpenValue
                }
                openMe={this.triggerOrderWasConfirmedAcceptedTellCustomerModal}
                closeMe={this.hideOrderWasConfirmedAcceptedTellCustomerModal}
              />
            }
            {
              <OrderRequestedModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'orderRequestedModal',
                  ).isOpenValue
                }
                openMe={this.triggerOrderRequestedModal}
                closeMe={this.hideOrderRequestedModal}
              />
            }
            {
              <WasOrderCompletedModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'wasOrderCompletedModal',
                  ).isOpenValue
                }
                closeMe={this.hideWasOrderCompletedModal}
                customerConfirmsDeliverySuccessful={
                  this.customerConfirmsDeliverySuccessful
                }
                customerSaysDeliveryFailed={this.customerSaysDeliveryFailed}
              />
            }
            {
              <StoreReceivesNewOrderModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'storeReceivesNewOrderModal',
                  ).isOpenValue
                }
                openMe={this.triggerStoreReceivesNewOrderModal}
                closeMe={this.hideStoreReceivesNewOrderModal}
              />
            }
            {
              <OneMoreStepModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'oneMoreStepModal',
                  ).isOpenValue
                }
                openMe={this.triggerOneMoreStepModal}
                closeMe={this.hideOneMoreStepModal}
              />
            }
            {
              <OrderWasConfirmedPickedUpTellCustomerModal
                openClosed={
                  this.props.modalsArray.find(
                    x =>
                      x.modalName ===
                      'orderWasConfirmedPickedUpTellCustomerModal',
                  ).isOpenValue
                }
                openMe={this.triggerOrderWasConfirmedPickedUpTellCustomerModal}
                closeMe={this.hideOrderWasConfirmedPickedUpTellCustomerModal}
              />
            }
            {
              <AddRemoveCardModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'addRemoveCardModal',
                  ).isOpenValue
                }
                openMe={this.triggerAddRemoveCardModal}
                closeMe={this.hideAddRemoveCardModal}
                cardList={this.state.paymentCards}
                addCard={this._addNewPaymentCard}
                refreshCards={this._getPaymentCustomer}
                removeCard={this._removeExistingPaymentCard}
                setCardAsDefault={this._setNewDefaultPaymentCard}
                defaultCardSource={this.state.defaultPaymentSource}
              />
            }

            {
              <StoreLocationPickerModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'storeLocationPickerModal',
                  ).isOpenValue
                }
                geocode={async addressText => {
                  await this.geocode(addressText);
                }}
                reverseGeocode={async (lat, lng) =>
                  await this.reverseGeocodeFullPayload(lat, lng)
                }
                openMe={() => toast('HellO!')}
                closeMe={this.hideStoreLocationPickerModal}
                pickLocation={(
                  latLng, //needs up
                ) =>
                  toast(
                    'Should fire redux location action to store orderDestination location',
                  )
                }
              />
            }
            {
              <SalesBIModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'salesBIModal',
                  ).isOpenValue
                }
                closeMe={this.hideSalesBIModal}
              />
            }
            {
              <ChatModal
                changeLatestSelectedChatter={this._setlatestChatterId}
                latestChatterId={this.state.latestChatterId}
                singleUserChatMode={this.state.singleUserChatMode}
                openClosed={
                  this.props.modalsArray.find(x => x.modalName === 'chatModal')
                    .isOpenValue
                }
                closeMe={this.hideChatModal}
              />
            }
            {
              <CashOutModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'cashoutModal',
                  ).isOpenValue
                }
                closeMe={this.hideCashoutModal}
              />
            }
            {
              <NetworkPickerModal
                navigation={this.navigator}
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'networkPickerModal',
                  ).isOpenValue
                }
                goToScreen={this.goToScreen}
                closeMe={this.hideNetworkPickerModal}
              />
            }
            {
              <NetworkSearchAndAddModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'networkSearchAndAddModal',
                  ).isOpenValue
                }
                closeMe={this.hideNetworkAddAndSearchModal}
              />
            }
            {
              <RequestPermissionModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'requestPermissionsModal',
                  ).isOpenValue
                }
                closeMe={this.hideRequestPermissionsModal}
              />
            }
            {
              <NearestStoresAndNetworksSearchModal
                navigation={this.navigator}
                goToScreen={this.goToScreen}
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'nearestStoresAndNetworksModal',
                  ).isOpenValue
                }
                closeMe={this.hideNearestStoresAndNetworksModal}
              />
            }
            {
              <NetworkDisplayModal
                navigation={this.navigator}
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'networkDisplayModal',
                  ).isOpenValue
                }
                closeMe={this.hideNetworkDisplayModal}
                closeOtherModals={() => {
                  this.hideNearestStoresAndNetworksModal(); //bit hacky right now
                  this.hideNetworkPickerModal();
                }}
              />
            }
            {
              <VideoDisplayModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'videoDisplayModal',
                  ).isOpenValue
                }
                closeMe={this.hideVideoDisplayModal}
              />
            }
            {
              <StartingHelpModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'startingHelpModal',
                  ).isOpenValue
                }
                closeMe={this.hideStartingHelpModal}
              />
            }
            {
              <QuickControlsModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'quickControlsModal',
                  ).isOpenValue
                }
                closeMe={this.hideQuickControlsModal}
              />
            }
            {
              <CourierControlsModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'courierControlsModal',
                  ).isOpenValue
                }
                closeMe={this.hideCourierControlsModal}
              />
            }
            {
              <NearestVendorsModal
                openClosed={this.state.nearestVendorModalOpen}
                closeMe={this.hideNearestStoresModal}
              />
            }
            {
              <LogisticsCreatorOrderAcceptedModal
                openClosed={this.state.logisticsCreatorOrderAcceptedModalOpen}
                closeMe={this.hideTellOrderLogisticsCreatorOrderAcceptedModal}
              />
            }
            {
              <TellDriverUpdatedLogisticsModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'tellDriverUpdatedLogisticsModal',
                  ).isOpenValue
                }
                closeMe={this.hideTellDriverUpdatedLogisticsModal}
              />
            }
            {
              <LocationPickerModal
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'locationPickerModal',
                  ).isOpenValue
                }
                geocode={async addressText => {
                  await this.geocode(addressText);
                }}
                reverseGeocode={async (lat, lng) =>
                  await this.reverseGeocodeFullPayload(lat, lng)
                }
                openMe={() => toast('HellO!')}
                closeMe={this.hideLocationPickerModal}
                pickLocation={latLng =>
                  toast(
                    'Should fire redux location action to store orderDestination location',
                  )
                }
              />
            }
            {
              <ActionMessageAndQuickControlsModal
                refreshMessages={() => 'put somethign here'}
                openClosed={
                  this.props.modalsArray.find(
                    x => x.modalName === 'actionMessageModal',
                  ).isOpenValue
                }
                closeOrderRequestModal={this.hideOrderRequestModal}
                closeConfirmOrderDeliveredModal={
                  this.hideWasOrderCompletedModal
                }
                closeMe={this.hideActionMessagesModal}
                goToScreen={this.goToScreen}
              />
            }
            {this._renderOrderLogisticsDriverRequestHtmlModal()}
            {this._renderOrderRequestHtmlModal()}
            {/* RESET PASSWOR DMODAL */}
            <Modal
              style={{
                backgroundColor: '#fff',
                height: null,
                paddingBottom: 10,
                borderRadius: 20,
                width: width - 35,
              }}
              onClosed={() => this.hideResetPasswordModal()}
              isOpen={this.state.resetPasswordModalOpen}
              backdrop={true}
              swipeToClose={false}
              // onClosed={()=>this.setState({warningModalOpen :false})}
              position={'center'}
              ref={'resetPasswordModal'}>
              <View
                style={{
                  paddingLeft: 2,
                  paddingRight: 2,
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingBottom: 14,
                }}>
                <Image
                  style={{
                    maxHeight: 60,
                    height: 60,
                    width: 60,
                    maxWidth: 60,
                    marginLeft: 5,
                  }}
                  source={
                    Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo
                  }
                  resizeMode="contain"
                />
                <Text
                  style={{
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 2,
                    fontFamily: Constants.fontHeader,
                    color: GlobalStyle.modalTextBlackish.color,
                    margin: 5,
                    paddingBottom: 10,
                    fontSize: 20,
                    textAlign: 'center',
                  }}>
                  {'Reset your password'}
                </Text>
              </View>
              <View style={{minHeight: 80}}>
                <TextInput
                  style={{
                    flex: 1,
                    //alignSelf: "stretch",
                    width: '80%',
                    alignSelf: 'center',
                    fontSize: 18,
                    borderRadius: 30,
                    minHeight: 55,
                    maxHeight: 55,
                    fontFamily: Constants.fontFamily,
                    color: GlobalStyle.modalTextBlackish.color,
                    //fontStyle:"italic",
                    paddingRight: 6,
                    paddingLeft: 6,
                    borderWidth: 1,
                    borderColor: GlobalStyle.primaryColorDark.color,
                    backgroundColor: 'white',
                  }}
                  //autoCorrect={true}
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCompleteType="email"
                  keyboardType="email-address"
                  //autoCapitalize={"sentences"}
                  placeholder={" Email you'd like to reset"}
                  placeholderTextColor={GlobalStyle.modalTextBlackish.color}
                  value={this.state.resetPasswordEmail}
                  onChangeText={text =>
                    this.setState({resetPasswordEmail: text})
                  }
                  ref={el => (this._addressTextInput = el)}
                />
              </View>
              {/* <Divider style={{ backgroundColor: "#C11F1F" }} /> */}
              <ElButton
                buttonStyle={{
                  width: '60%',
                  alignSelf: 'center',
                  padding: 10,
                  margin: 5,
                  height: 50,
                  marginTop: 2,
                }}
                raised
                backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
                borderRadius={30}
                title="Reset"
                onPress={async () => {
                  this.hideResetPasswordModal();
                  SoundPlayer.playSoundFile('notification2', 'mp3');
                  showMessage({
                    position: 'center',
                    message: 'Request sent',
                    autoHide: true,
                    duration: 4000,
                    description:
                      'You will recieve an email with further instructions to the address you specified.',
                    //backgroundColor: "hotpink", // background color
                    backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                    color: 'white', // text color
                  });
                  //send to API
                  let resetPassordResult =
                    await HopprWorker.getResetPasswordLink(
                      this.state.resetPasswordEmail,
                    );
                  if (resetPassordResult.status == 200) {
                    //reset state etc
                    this.setState({resetPasswordEmail: ''});
                  } else {
                    showMessage({
                      position: 'center',
                      message: 'Reset Request Failed',
                      autoHide: true,
                      duration: 4000,
                      description: 'Check the email address you provided',
                      //backgroundColor: "hotpink", // background color
                      backgroundColor: 'red', // background color
                      color: 'white', // text color
                    });
                    //alert("Sorry, that didn't work!")
                  }
                }}
              />
            </Modal>

            <Toast
              ref="toast"
              style={{backgroundColor: 'black'}}
              position="top"
              duration={2000}
              positionValue={200}
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={0.8}
              textStyle={{color: 'white'}}
            />

            {/* END MODALS */}
            {/* WEBSOCKETS */}
            {this._renderLogoSpinner()}
          </View>
        }
      />
    );
  }

  componentWillMount() {
    NetInfo.fetch().then(connectionInfo => {
      this.props.updateConnectionStatus(connectionInfo.type != 'none');
      // this.setState({ loading: false });
    });
  }

  _setupHopprworkerAndOtherUserFacilitiesIfNecessary = async (
    hopprUser,
    password,
  ) => {
    if (typeof hopprUser !== 'undefined') {
      if (hopprUser != null) {
        let isInitAlready = HopprWorker.initalisedWithCreds;
        let test = '';
        if (HopprWorker.initalisedWithCreds == false) {
          //set up all shit we need
          HopprWorker.initalisedWithCreds = true;

          //todo: get this from userpassworkd!!!

          console.debug('Init HopprWorker in router.js');

          try {
            //try setting up
            let tokenResponse = await HopprWorker.getUserTokenFromApi(
              hopprUser.email,
              password,
            );

            let token = tokenResponse.data.access_token;
            HopprWorker.init({
              username: hopprUser.email,
              password: password,
              token: token,
            });
          } catch (error) {
            console.debug(error);
          }
        }
      }
    } else {
      //do a basic setup if that hasn't been done
      if (HopprWorker.checkClientIsInitalised() != true) {
        HopprWorker.init({username: null, password: null});
      }
    }
  };

  componentDidUpdate = async () => {
    //SETUP HOPPRWORKER TOKEN AND WEBSOCKET
    let isInitAlready = HopprWorker.initalisedWithCreds;
    console.debug('Is init already:' + isInitAlready);
    if (!isInitAlready) {
      console.debug('Setting up user if not done already');
      await this._setupHopprworkerAndOtherUserFacilitiesIfNecessary(
        this.props.user.user,
        this.props.user.successPassword,
      );
      //await this._updateOneSignalSubscriptionState();
      toast('Subscription was updated!!');
    }
  };

  _renderMarker = (lat, lng, imgSrc, methodToTrigger) => {
    return (
      <Marker
        onPress={methodToTrigger}
        onLongPress={methodToTrigger}
        zIndex={101}
        coordinate={{
          latitude: lat,
          longitude: lng,
        }}
        // image={Images.MapIconStore}
        description={'Order Destination'}
        title={this.props.latestPickerDestinationText}>
        <Image source={imgSrc} style={{width: 40, maxWidth: 40, height: 40}} />
      </Marker>
    );
  };

  _renderMapOrDriverImg = parentHeightWidth => {
    let lat = this.state.activeDriverOrderRequests[0].deliveryLat;
    let lng = this.state.activeDriverOrderRequests[0].deliveryLng;

    let netImg = this.state.activeDriverOrderRequests[0].networkLogo;
    let imgSrc = {uri: netImg};

    if (this.state.currentFadeTextIsItems) {
      return (
        <View
          style={{
            height: 180,
            width: 180,
            overflow: 'hidden',
            borderRadius: parentHeightWidth / 2,
          }}>
          <MapView
            onPress={() => this.triggerDriverOrderRequestsModal()}
            onLongPress={() => this.triggerDriverOrderRequestsModal()}
            liteMode={true}
            onMapReady={() => {}}
            customMapStyle={Config.MapThemes.FifthMapTheme}
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{...StyleSheet.absoluteFillObject}}
            region={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            {/* <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
            {this._renderMarker(
              lat,
              lng,
              imgSrc,
              this.triggerDriverOrderRequestsModal,
            )}
          </MapView>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => this.triggerDriverOrderRequestsModal()}>
          <FastImage
            source={Images.NewAppReskinGraphics.PingerDriver}
            style={{
              margin: 10,
              minHeight: 180,
              maxHeight: 180,
              maxWidth: 180,
              minWidth: 180,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
  };

  _renderCountOrStoreImg = parentHeightWidth => {
    if (this.state.currentFadeTextIsItems) {
      return (
        <View style={{marginLeft: 8, marginRight: 8}}>
          <Text
            style={{
              fontSize: 90,
              fontFamily: Constants.fontHeader,
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
            }}>
            {this.state.storeOrderCount}
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontFamily: Constants.fontHeader,
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
            }}>
            {'Inbound'}
          </Text>
        </View>
        //  </FadeInOut>
      );
    } else {
      return (
        <FastImage
          source={Images.Intro.Page2}
          style={{
            minHeight: 180,
            maxHeight: 180,
            maxWidth: 180,
            minWidth: 180,
          }}
          resizeMode="contain"
        />
      );
    }
  };

  _renderMapOrLogo = parentHeightWidth => {
    let lat = this.state.activeCustomerOrderRequests[0].deliveryLat;
    let lng = this.state.activeCustomerOrderRequests[0].deliveryLng;

    let netImg = this.state.activeCustomerOrderRequests[0].networkLogo;
    let imgSrc = {uri: netImg};

    let minMaxWidth = parentHeightWidth - 60;
    if (this.state.currentFadeTextIsItems) {
      return (
        <View
          style={{
            minWidth: minMaxWidth,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            maxWidth: minMaxWidth,
            flex: 1,
            borderRadius: parentHeightWidth / 2,
            overflow: 'hidden',
            marginTop: 10,
            margin: 8,
            borderWidth: 1,
            borderColor: 'white',
            marginBottom: 4,
          }}>
          <MapView
            onPress={() => this.triggerCustomerOrderRequestsModal()}
            onLongPress={() => this.triggerCustomerOrderRequestsModal()}
            liteMode={true}
            onMapReady={() => {}}
            customMapStyle={Config.MapThemes.SecondaryMapTheme}
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{...StyleSheet.absoluteFillObject}}
            region={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            {this._renderMarker(
              lat,
              lng,
              Images.HopprLogoMapPin1Filled,
              this.triggerCustomerOrderRequestsModal,
            )}
          </MapView>

          <View
            style={{
              marginTop: 0,
              paddingTop: 0,
              position: 'absolute', //use absolute position to show button on top of the map
              bottom: 4,
              right: 7,
            }}>
            <FastImage
              source={imgSrc}
              style={{
                minHeight: 36,
                maxHeight: 36,
                maxWidth: 36,
                minWidth: 36,
              }}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => this.triggerCustomerOrderRequestsModal()}>
          <FastImage
            source={imgSrc}
            style={{
              margin: 10,
              minHeight: 140,
              maxHeight: 140,
              maxWidth: 190,
              minWidth: 140,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
  };

  _renderActiveDriverOrderRequestMenu = () => {
    let items = '';
    if (this.state.activeDriverOrderRequests.length > 0) {
      this.state.activeDriverOrderRequests[0].items.map(x => {
        let toAdd = x.amount + ' x ' + x.productName + ',';
        items += toAdd;
      });
    
    items = items.slice(0, -1);
    let searchText = this.state.currentFadeTextIsItems
      ? 'Click for options'
      : 'Searching now!';

    return (
      <RequestsCard
        type={'driver'}
        title={searchText}
        subtitle={`Total : ${this.state.activeDriverOrderRequests.length}`}
        image={Images.NewAppReskinGraphics.PingerDriver}
        count={this.state.activeDriverOrderRequests.length}
        textTitle={''}
        text={''}
        onPress={() => this.triggerDriverOrderRequestsModal()}
        containerStyle={{
          bottom: (Dimensions.get('window').height / 100) * 10,
        }}
        notifications={this.state.driverNotifyRequests}
      />
    );
      }
  };

  _savePingerState = () => {
    let obj = {
      x: this.state.x,
      y: this.state.y,
      driverx: this.state.driverx,
      drivery: this.state.drivery,
      storex: this.state.storex,
      storey: this.state.storey,
    };
    this.setState({
      pingersSaved: obj,
      draggablesHaveBeenMovedSinceStateChange: false,
    });
  };

  _restorePingerState = () => {
    if (typeof this.state.pingersSaved !== 'undefined') {
      //if there was an update since, don't restore!!
      if (!this.state.draggablesHaveBeenMovedSinceStateChange) {
        let prevState = this.state.pingersSaved;
        this.setState({
          x: prevState.x,
          y: prevState.y,
          driverx: prevState.driverx,
          drivery: prevState.drivery,
          storex: prevState.storex,
          storey: prevState.storey,
        });
      }
    }
  };

  _setPingersCenter = () => {
    this.setState({
      x: 0 - minusForCenterPostion,
      y: 48,
      driverx: 0 - minusForCenterPostion,
      drivery: 240,
      storex: 0 - minusForCenterPostion,
      storey: 450,
      draggablePingersPositionCorner: false,
    });
  };

  _setPingersCorner = () => {
    this.setState({
      x: width - draggableCornerOffsetBottom,
      y: height - draggableCornerOffsetBottom - 465,
      driverx: width - draggableCornerOffsetBottom,
      drivery: height - draggableCornerOffsetBottom - 340,
      storex: width - draggableCornerOffsetBottom,
      storey: height - draggableCornerOffsetBottom - 240,
      draggablePingersPositionCorner: true,
    });
  };

  _toggleDraggablePingersCornerOrCenter = () => {
    //they are already in corner, move to center
    if (this.state.draggablePingersPositionCorner) {
      this._setPingersCenter();
    } else {
      //they are in center, move to edge
      this._setPingersCorner();
    }
  };

  _renderActiveStoreInboundOrderMenu = () => {
    if (this.state.storeOrderCount > 0) {
      return (
        <RequestsCard
          type={'store'}
          title={'You Have Inbound Orders On Their Way!'}
          subtitle={`Click here for details.`}
          image={Images.Intro.Page2}
          count={this.state.storeOrderCount}
          textTitle={''}
          text={''}
          onPress={() => console.log(this.goToScreen('StoreHomeScreen'))}
          containerStyle={{
            bottom: (Dimensions.get('window').height / 100) * 19,
          }}
          notifications={this.state.storeNotifyRequests}
        />
      );
    }
  };

  _recenterAllPingers = () => {
    showMessage({
      position: 'bottom',
      message:
        'There are  ' +
        this.state.activeCustomerOrderRequests.length +
        '  customer req and driver req:' +
        this.state.activeDriverOrderRequests,
      description:
        'x/Y: ' +
        this.state.x +
        ' ' +
        this.state.y +
        ' --- driver x/y: ' +
        this.state.driverx +
        ' ' +
        this.state.drivery,
      backgroundColor: 'pink', // background color
      color: 'white', // text color,
      autoHide: false,
    });

    this.setState({x: 30, y: 30, driverx: 90, drivery: 90});
  };

  _renderActiveCustomerOrderRequestMenu = () => {
    let items = '';
    if (this.state.activeCustomerOrderRequests.length > 0) {
      this.state.activeCustomerOrderRequests[0].items.map(x => {
        let toAdd = x.amount + ' x ' + x.productName + ',';
        items += toAdd;
      });
    
    items = items.slice(0, -1);
    let searchText = this.state.currentFadeTextIsItems
      ? 'Click Map For Options'
      : 'Searching Now!';

    return (
      <RequestsCard
        type={'customer'}
        title={searchText}
        subtitle={`Total : ${this.state.activeCustomerOrderRequests.length}`}
        image={Images.NewAppReskinGraphics.PingerCustomer}
        textTitle={''}
        text={''}
        onPress={() => this.triggerCustomerOrderRequestsModal()}
        containerStyle={{
          bottom: (Dimensions.get('window').height / 100) * 28,
        }}
        notifications={this.state.customerNotifyRequests}
      />
    );
   }
  };

  _renderLogoSpinner = () => {
    if (this.state.showLogoSpinner) {
      return <LogoSpinner fullStretch />;
    }
  };

  componentWillUnmount = () => {
    this.unregisterModalEventHandlers();
    this._clearExistingDriverSync();
    this._stopRefreshActionMessagesTimer();
    this._stopOrderRequestsRefreshTimer();
    this._stopResetWebsocketEveryXMinutesTimer();
    //cancel this text change set interval
    clearInterval(this.textFadeTimerId);
  };

  /** resets driver to 'off' base state locally - NOT in the API*/
  _clearExistingDriverSync = async () => {
    if (typeof this.props.user !== 'undefined') {
      if (
        typeof this.props.user.user !== 'undefined' &&
        this.props.user.user !== null
      ) {
        if (this.props.user.user.roles.find(x => x === 'Driver'))
          if (
            typeof this.props.user.user.driverId !== 'undefined' &&
            this.props.user.user.driverId
          ) {
            this.props.disableKeepAliveCycle(this.props.keepAliveCycleTimerId);
            this.props.updateDriverState(false, this.props.orderIsActive);
            this.props.endLocationWatchWithApiLocationPush(
              this.props.locationWatchId,
            );

            toast('Driver was reset completely!!!');
          }
      }
    }
  };

  _autoredirectBasedOnRoles = () => {
    if (typeof this.props.user !== 'undefined') {
      if (
        typeof this.props.user.user !== 'undefined' &&
        this.props.user.user !== null
      ) {
        //CHECK WHICH ROLES IS IMPLEMENTED
        if (this.props.user.user.roles.find(x => x === 'Logistics')) {
        } else if (this.props.user.user.roles.find(x => x === 'Store')) {
          showMessage({
            position: 'center',
            message: 'Welcome back vendor!',
            autoHide: false,
            duration: 15000,
            description:
              'We will switch to vendor mode so you can see any inbound orders',
            backgroundColor: 'hotpink', // background color
            color: 'white',
          });
          this.goToScreen('StoreHomeScreen');
        } else if (this.props.user.user.roles.find(x => x === 'Driver')) {
          showMessage({
            position: 'center',
            message: 'Welcome back driver!',
            autoHide: false,
            duration: 15000,
            description:
              'We will switch to driver mode to get you started quickly!',
            //backgroundColor: "hotpink", // background color
            backgroundColor: GlobalStyle.primaryColorDark.color, // background color
            color: 'white', // text color
          });
          this.goToScreen('DriverHomeScreen');
        } else {
          setTimeout(() => {
            showMessage({
              style: {
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              },
              position: 'center',
              message: "Hope you don't mind...",
              description:
                'We used your current location to show you nearby stores and products, all available within 30 mins!',
              backgroundColor: '#a2349b', // background color
              color: 'white', // text color,
              autoHide: true,
              duration: 3100,
            });
          }, 300);
        }
      }
    }
  };

  _openOrderModal = () => {
    console.debug('BOGBOGBOG');
    alert('IN ROUTER.JS - this is working PARAM:');
  };

  _closeModal = () => {
    console.debug('BOGBOGBOG');
    alert('IN ROUTER.JS - this is working PARAM:');
  };

  _getLastLogisticsOrder = async () => {
    try {
      console.debug('let try');

      if (typeof this.props.user.user !== 'undefined') {
        console.debug('let try');
        let lastLogisticsOrderResponse =
          await HopprWorker.getLastLogisticsOrderRequest(
            this.props.user.user.driverId,
          );

        if (lastLogisticsOrderResponse.status == 200) {
          //do normal process for logistics modal order request
          let lastLogisticsOrder = lastLogisticsOrderResponse.data;
          await this.triggerLogisticsOrderDriverRequestModal(
            lastLogisticsOrder.orderRequestId,
            lastLogisticsOrder.cssMainScreenBarColor, //this is color
            lastLogisticsOrder.message,
          );
        } else {
          alert(
            'Tried to get logistics modal data but got status: ' +
              lastLogisticsOrderResponse.status,
          );
        }
      }
    } catch (error) {
      console.debug(error);
    }
  };

  /**this is actually all handlers */
  registerModalEventHandlers = async () => {
    this.triggerResetPasswordModalListener = EventRegister.addEventListener(
      'triggerResetPasswordModal',
      () => this.triggerResetPasswordModal(),
    );

    this.showNearbyStoresModal = EventRegister.addEventListener(
      'showNearbyStoresModal',
      () => this.triggerNearestStoresModal(),
    );

    this.hideOrderRequestModalListener = EventRegister.addEventListener(
      'hideOrderRequestModal',
      () => this.hideOrderRequestModal(),
    );

    this.updateOneSignalApiListener = EventRegister.addEventListener(
      'updateOnesignal',
      () => this._openModal(),
    );

    this.modalsOpenEventListener = EventRegister.addEventListener(
      'openModal',
      () => this._openModal(),
    );
    this.modalsCloseEventListener = EventRegister.addEventListener(
      'closeModal',
      () => this._closeModal(),
    );
    //this.modalsLastLogisticsOrder = EventRegister.addEventListener("getLastLogisticsOrder", () => this.showThatMOdal());
    this.modalsLastLogisticsOrderHandler = EventRegister.addEventListener(
      'getLastLogisticsOrder',
      () => this._getLastLogisticsOrder(),
    );
    //update latest chatter remotely
    this.setLatestChatterId = EventRegister.addEventListener(
      'setLatestChatterId',
      chatterId => this._setlatestChatterId(chatterId, this.triggerChatModal),
    );
    this.setSingleUserChatMode = EventRegister.addEventListener(
      'setSingleUserChatMode',
      newBoolValue => this._setSingleUserChatMode(newBoolValue),
    );
    //register spinner handlers
    this.showSpinnerHandler = EventRegister.addEventListener(
      'showSpinner',
      () => this._showSpinner(),
    );
    this.hideSpinnerHandler = EventRegister.addEventListener(
      'hideSpinner',
      () => this._hideSpinner(),
    );
    //logo spinner
    this.showLogoSpinnerHandler = EventRegister.addEventListener(
      'showLogoSpinner',
      () => this._showLogoSpinner(),
    );
    this.hideLogoSpinnerHandler = EventRegister.addEventListener(
      'hideLogoSpinner',
      () => this._hideLogoSpinner(),
    );

    this.cleanWebsocketHandler = EventRegister.addEventListener(
      'cleanWebsocket',
      () => this._cleanWebsocket(),
    );

    this.resetStacksAndGoHandler = EventRegister.addEventListener(
      'resetStacksAndGo',
      () => StackHelper.resetStacksAndGo(this.navigator),
    );

    this.showNearestStoresModal = EventRegister.addEventListener(
      'showNearestStoresModal',
      () => this.triggerNearestStoresAndNetworksModal(),
    );

    this.showCourierControlsModal = EventRegister.addEventListener(
      'showCourierControlsModal',
      () => this.triggerCourierControlsModal(),
    );

    this.showLocationPickerModal = EventRegister.addEventListener(
      'showLocationPickerModal',
      () => this.triggerLocationPickerModal(),
    );

    this.showStoreLocationPickerModal = EventRegister.addEventListener(
      'showStoreLocationPickerModal',
      () => this.triggerStoreLocationPickerModal(),
    );

    this.toggleDraggablePingersCornerOrCenter = EventRegister.addEventListener(
      'toggleDraggablePingersCornerOrCenter',
      () => this._toggleDraggablePingersCornerOrCenter(),
    );

    this.savePingerStateAndCorner ==
      EventRegister.addEventListener('savePingerStateAndCorner', () => {
        this._savePingerState();
        this._setPingersCorner();
      });

    this.setPingersCorner ==
      EventRegister.addEventListener('setPingersCorner', () => {
        this._setPingersCorner();
      });

    this.showQuickControlsModal = EventRegister.addEventListener(
      'showQuickControlsModal',
      () => this.triggerQuickControlsModal(),
    );

    this.returnPingersToPreviousState = EventRegister.addEventListener(
      'returnPingersToPreviousState',
      () => this._restorePingerState(),
    );

    //alert('handlers registered');
  };

  unregisterModalEventHandlers = () => {
    EventRegister.removeEventListener(this.hideOrderRequestModalListener);
    EventRegister.removeEventListener(this.modalsOpenEventListener);
    EventRegister.removeEventListener(this.modalsCloseEventListener);
    EventRegister.removeEventListener(this.modalsLastLogisticsOrderHandler);
    EventRegister.removeEventListener(this.setLatestChatterId);
    EventRegister.removeEventListener(this.setSingleUserChatMode);
    EventRegister.removeEventListener(this.showSpinnerHandler);
    EventRegister.removeEventListener(this.hideSpinnerHandler);

    EventRegister.removeEventListener(this.showLogoSpinnerHandler);
    EventRegister.removeEventListener(this.hideLogoSpinnerHandler);

    EventRegister.removeEventListener(this.cleanWebsocketHandler);
    EventRegister.removeEventListener(this.resetStacksAndGoHandler);
    EventRegister.removeEventListener(this.showNearestStoresModal);
    EventRegister.removeEventListener(this.showCourierControlsModal);
    EventRegister.removeEventListener(this.showQuickControlsModal);

    EventRegister.removeEventListener(this.showNearbyStoresModal);

    EventRegister.removeEventListener(
      this.toggleDraggablePingersCornerOrCenter,
    );
    EventRegister.removeEventListener(this.savePingerStateAndCorner);
    EventRegister.removeEventListener(this.returnPingersToPreviousState);
    EventRegister.removeEventListener(this.setPingersCorner);
    EventRegister.removeEventListener(this.showLocationPickerModal);
    EventRegister.removeEventListener(this.triggerResetPasswordModalListener);
    EventRegister.removeEventListener(this.showStoreLocationPickerModal);

    EventRegister.removeAllListeners();
  };

  _stopOrderRequestsRefreshTimer = async () => {
    clearIntervalAsync(this.state.orderRequestsRefreshTimerId);
  };

  _startRefreshOrderRequestsTimer = () => {
    let timerId = setIntervalAsync(async () => {
      this.refreshOrderRequestsTimer = this.refreshOrderRequestsTimer + 1;
      try {
        await this._refreshActiveCustomerOrderRequests();
        await this._refreshActiveDriverOrderRequests();
        await this._refreshStoreInboundOrderCount();
      } catch (error) {
        console.debug('refresh orderreqest crashed');
        alert('refresh orderrequest crashed');
      }
    }, 6000);

    this.setState({orderRequestsRefreshTimerId: timerId});
  };

  _stopRefreshActionMessagesTimer = async () => {
    clearIntervalAsync(this.state.actionMessageRefreshTimerId);
  };

  _startRefreshActionMessagesTimer = async () => {
    let timerId = setIntervalAsync(async () => {
      try {
        this._incrementWebsockFailedCountAndResetIfNeeded();
      } catch (error) {
        alert('Increment websocket failed');
      }

      try {
        await this._refreshActionMessagesAndBlockIfNeeded();
      } catch (error) {
        console.debug('refresh messages crashed');
        alert('refresh messages crashed');
      }
    }, 120000);

    this.setState({actionMessageRefreshTimerId: timerId});
  };

  _startResetWebsocketEveryXMinutesTimer = () => {
    let timerId = setInterval(() => {
      try {
        this._resetWebsocket();
      } catch (error) {
        console.debug('refresh messages crashed');
      }
    }, 1300000);

    this.setState({resetWebsocketEveryXMinutesTimerId: timerId});
  };

  _stopResetWebsocketEveryXMinutesTimer = () => {
    clearInterval(this.state.resetWebsocketEveryXMinutesTimerId);
  };

  _refreshActiveCustomerOrderRequests = async () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user != null
    ) {
      try {
        let activeCustomerOrderRequestResponse =
          await HopprWorker.getactiveCustomerOrderRequests(
            this.props.user.user.id,
          );

        console.debug('wait a sec');
        if (activeCustomerOrderRequestResponse.status == 200) {
          if (
            JSON.stringify(activeCustomerOrderRequestResponse.data) !==
            JSON.stringify(this.state.activeCustomerOrderRequests)
          ) {
            this.setState({
              customerNotifyRequests: Math.abs(
                this.state.activeCustomerOrderRequests -
                  activeCustomerOrderRequestResponse.data.length,
              ),
              activeCustomerOrderRequests:
                activeCustomerOrderRequestResponse.data,
            });
          }

          if (activeCustomerOrderRequestResponse.data.length > 0) {
          }
        }
        if (activeCustomerOrderRequestResponse.status == 404) {
          if (this.state.activeCustomerOrderRequests.length > 0) {
            this.setState({activeCustomerOrderRequests: []});
          }
        }
      } catch (error) {
        console.debug(error);
      } finally {
      }
    }
  };

  _refreshStoreInboundOrderCount = async () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user != null &&
      this.props.storeActive
    ) {
      if (this.props.user.user.roles.find(x => x === 'Store')) {
        try {
          let activeStoreInboundOrdersResponse =
            await HopprWorker.getStoreInboundOrderCount(
              this.props.user.user.storeId,
            );
          if (activeStoreInboundOrdersResponse.status == 200) {
            if (
              activeStoreInboundOrdersResponse.data.count !==
              this.state.storeOrderCount
            ) {
              this.setState({
                storeNotifyRequests: Math.abs(
                  activeStoreInboundOrdersResponse.data.count -
                    this.state.storeOrderCount,
                ),
                storeOrderCount: activeStoreInboundOrdersResponse.data.count,
              });
            }
            let modULoResult = this.refreshOrderRequestsTimer % 10;
            if (
              activeStoreInboundOrdersResponse.data.count > 0 &&
              modULoResult == 0
            ) {
              SoundPlayer.playSoundFile('storeneworder', 'mp3');
            }
          }
          if (activeStoreInboundOrdersResponse.status == 404) {
          }
        } catch (error) {
          console.debug(error);
        } finally {
        }
      }
    }
  };

  _refreshActiveDriverOrderRequests = async () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user != null &&
      this.props.driverActive
    ) {
      if (this.props.user.user.roles.find(x => x === 'Driver')) {
        try {
          let activeDriverOrderRequestResponse =
            await HopprWorker.getactiveDriverOrderRequests(
              this.props.user.user.id,
            );

          console.debug('wait a sec');
          if (activeDriverOrderRequestResponse.status == 200) {
            if (
              JSON.stringify(activeDriverOrderRequestResponse.data) !==
              JSON.stringify(this.state.activeDriverOrderRequests)
            ) {
              this.setState({
                driverNotifyRequests: Math.abs(
                  this.state.activeDriverOrderRequests -
                    activeDriverOrderRequestResponse.data.length,
                ),
                activeDriverOrderRequests:
                  activeDriverOrderRequestResponse.data,
              });
            }
            let modULoResult = this.refreshOrderRequestsTimer % 2;
            if (
              activeDriverOrderRequestResponse.data.length > 0 &&
              modULoResult == 0
            ) {
              SoundPlayer.playSoundFile('smbfireball', 'mp3');
            }
          }
          if (activeDriverOrderRequestResponse.status == 404) {
            if (this.state.activeDriverOrderRequests.length > 0) {
              this.setState({activeDriverOrderRequests: []});
            }
          }
        } catch (error) {
          console.debug(error);
        } finally {
        }
      }
    }
  };

  _refreshActionMessagesAndBlockIfNeeded = async () => {
    if (
      typeof this.props.user.user !== 'undefined' &&
      this.props.user.user != null
    ) {
      //DO MESSAGES
      try {
        let allMessagesResponse = await HopprWorker.getUnreadActionMessages(
          this.props.user.user.id,
        );
        console.debug('wait a sec');
        if (allMessagesResponse.status == 200) {
          await this.props.updateAllActionMessages(allMessagesResponse.data);
          let anyBlockesr = allMessagesResponse.data.filter(
            x => x.blockingRequest == true,
          );
          let anyOrderRequests = allMessagesResponse.data.filter(
            x => x.actionToTake == 'DriverOrderRequest',
          );

          if (anyBlockesr.length > 0) {
            if (
              this.props.modalsArray.find(
                x => x.modalName === 'actionMessageModal',
              ).isOpenValue == false
            ) {
              showMessage({
                style: {
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                },
                position: 'center',
                message: 'Blocking Action!',
                description:
                  "There are actions for you to complete that we need you to do - we'll stop bugging you if you could complete them?",
                backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                color: 'white', // text color,
                autoHide: false,
                onPress: () => this.triggerActionMessagesModal(),
                onLongPress: () => this.triggerActionMessagesModal(),
              });
            }
          }

          if (anyOrderRequests.length > 0) {
            if (true) {
            }
          } else {
            if (this.state.actionMessageRefreshTimerId != -1) {
            }
          }
        }
      } catch (error) {
        toast("Couldn't refresh action messages - maybe you're offline?");
      }
    }
  };

  _getDeviceAndUpdateOnesignalAPI = async () => {
    try {
      if (
        typeof this.props.user.user !== 'undefined' &&
        this.props.user.user != null
      ) {
        console.debug('stop');
        if (Platform.OS == 'ios') {
          //await this._setupHopprworkerAndOtherUserFacilitiesIfNecessary();
          const deviceState = await OneSignal.getDeviceState();
          //alert("Device state:" + JSON.stringify(deviceState));
          // HopprWorker.init({
          //   username: this.props.user.user.email,
          //   password: this.props.user.successPassword,
          //   token: this.props.user.token,
          // });
          let playerId = deviceState.userId;
          let playerIdResponse = await HopprWorker.addOrUpdateOnesignalPlayerId(
            this.props.user.user.id,
            playerId,
          );
          //alert("response was:" + JSON.stringify(playerIdResponse));
        } else {
          OneSignal.getPermissionSubscriptionState(async status => {
            let playerId = status.userId;
            let playerIdResponse =
              await HopprWorker.addOrUpdateOnesignalPlayerId(
                this.props.user.user.id,
                playerId,
              );
          });
        }
      } else {
        //alert("user was null didn't update onesignal");
      }
    } catch (error) {
      alert(
        "couldn't update onesignal playerId on Hopprfy: " +
          JSON.stringify(error),
      );
    }
  };

  _getNetworkCssColor = () => {
    return GlobalStyle.primaryColorDark.color;
    try {
      setTimeout(() => {
        let networkPickerData = this.props.networkPickerData;
        let currentlySelectedNetworkGuid =
          this.props.currentlySelectedNetworkGuid;
        let net = networkPickerData.find(
          x => x.id == currentlySelectedNetworkGuid,
        );
        return net.networkCssColor;
      }, 1000);
    } catch (error) {
      return GlobalStyle.primaryColorDark.color;
    }
  };

  _setUpBackgroundLocation = () => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 10,
      distanceFilter: 10,
      notificationTitle: `${Config.InAppName} Driver Tracking`,
      notificationText: 'Enabled',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 2500,
      fastestInterval: 1000,
      activitiesInterval: 1500,
      stopOnStillActivity: false,
      // customize post properties
    });
  };

  //DO WORK
  componentDidMount = async () => {
    //just get a default location
    //set default x/y for draggable
    // this.setState({x: width -10, y: height -10});
    this.props.updateFirstInstanceLoad(true);
    //SET EVERYTHING IN THE APP UP HERE

    HopprWorker.init({username: null, password: null});
    // setTimeout(()=>{
    //   this.triggerCourierControlsModal();
    // }, 7000)
    this._showSpinner();
    this.props.resetModalArrayToDefault();
    this._setUpBackgroundLocation();

    if (await MapWorker.requestLocationPermission()) {
      console.debug('stop in getLocation'); //TEST CODE

      BackgroundGeolocation.getCurrentLocation(async position => {
        console.debug('stop');
        let geoResult = await GeoWorker.reverseGeocode(
          position.latitude,
          position.longitude,
        );
        this.props.pushCurrentPickerLocationAsOrderDestination(
          {lat: position.latitude, lng: position.longitude},
          geoResult.formattedAddress,
          geoResult,
        );
        //updater redux for HorizonList/index location picker
        this.props.updateLatestLocationText(geoResult.formattedAddress);
        this.props.updateManualAddressPrefixInput('');
        EventRegister.emit(
          'getShoppingNetworksAndRefreshCurrentlySelectedNetwork',
        );
      });

      this._hideSpinner();
      setTimeout(() => {
        try {
        } catch (error) {
          showMessage({
            position: 'bottom',
            message: "Couldn't get location",
            description: 'Can you make sure location is enabled please?',
            backgroundColor: '#00b2be', // background color
            color: 'white', // text color,
            duration: 2000,
            autoHide: true,
          });
        }
      }, 7000);
    } else {
      //the didn't enable location
      showMessage({
        position: 'center',
        message: 'This app really needs location to work optimally',
        description: 'Please enable it in settings',
        backgroundColor: 'orange', // background color
        color: 'white', // text color,
        autoHide: false,
      });

      EventRegister.emit(
        'getShoppingNetworksAndRefreshCurrentlySelectedNetwork',
      );
    }

    changeNavigationBarColor('white', false);
    console.log('in router.js');

    //register events
    this.registerModalEventHandlers();
    //DO SETUP
    //setup client for Hoppr
    this._setupHopprworkerAndOtherUserFacilitiesIfNecessary(
      this.props.user.user,
      this.props.user.successPassword,
    );

    //remove driver push / handlers if exist
    this._clearExistingDriverSync();

    this._toggleDraggablePingersCornerOrCenter(); //just center first time

    await this._startRefreshActionMessagesTimer();
    await this._startRefreshOrderRequestsTimer();
    await this._refreshActiveCustomerOrderRequests();
    await this._refreshActiveDriverOrderRequests();
    await this._refreshStoreInboundOrderCount();
    this._startResetWebsocketEveryXMinutesTimer();

    //fade timer
    this.textFadeTimerId = setInterval(() => {
      let newVal = this.state.currentFade == true ? false : true;
      let textValue = this.state.currentFadeTextIsItems;
      if (newVal) {
        textValue = textValue == true ? false : true;
      }

      this.setState({currentFade: newVal, currentFadeTextIsItems: textValue});
    }, 3000);

    console.debug(this.textFadeTimerId);

    //do some firstime things
    setTimeout(async () => {
      EventRegister.emit('checkAndSetDriverState');
      EventRegister.emit('checkAndSetStoreState');

      await this._refreshActionMessagesAndBlockIfNeeded();
    }, 4000);

    // this.refs.orderLogisticsDriverRequestModal.open();
    // this.setState({ orderLogisticsRequestModalOpen: true });
    // try {
    //   this.showThatMOdal();
    // } catch (error) {
    //   console.debug(error);
    // }

    //+ "ref state is"+ this.refs.orderLogisticsDriverRequestModal.props.isOpen
    // setInterval(() => toast("modalOpenState is " + this.state.orderLogisticsRequestModalOpen), 3000);

    //EventRegister.emit("showLogoSpinner");

    //UPDATE ONESIGNAL REGISTRATION
    //alert("SET ONESIGNAL TIMEOUT");
    setTimeout(async () => {
      this._autoredirectBasedOnRoles();
    }, 1000);
    setTimeout(async () => {
      this._getDeviceAndUpdateOnesignalAPI();
    }, 4000);
  };
}
const mapStateToProps = ({
  user,
  language,
  netInfo,
  accountBalance,
  modals,
  driver,
  store,
  location,
  categories,
}) => ({
  user: user,
  introStatus: user.finishIntro,
  language,
  netInfo,
  accountBalance: accountBalance,
  modalsArray: modals.modalsArray,
  activeDriverOrder: driver.activeDriverOrder,
  driverActive: driver.driverActive,
  storeActive: store.storeActive,
  //modal fields for latest order
  latestOrderRequestId: driver.latestOrderRequestId,
  latestModalHTML: driver.latestModalHTML,
  latestModalColor: driver.latestModalColor,
  latestModalDriverFees: driver.latestModalDriverFees,
  latestModalPayload: driver.latestModalPayload,
  //driver fields
  keepAliveCycleTimerId: driver.keepAliveCycleTimerId,
  orderIsActive: driver.orderIsActive,
  locationWatchId: location.locationWatchId,
  networkPickerData: categories.networkPickerData,
  currentlySelectedNetworkGuid: categories.currentlySelectedNetworkGuid,
  //location
  latestPickerDestinationText: location.latestPickerDestinationText,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux/AccountBalanceRedux');
  const modalActions = require('@redux/ModalsRedux');
  const driverActions = require('@redux/DriverRedux');
  const locationActions = require('@redux/LocationRedux');
  const chatActions = require('@redux/ChatRedux');
  const CategoryActions = require('@redux/CategoryRedux');
  const actionMessageActions = require('@redux/ActionMessageRedux');

  return {
    updateLatestLocationText: newText => {
      dispatch(
        locationActions.actions.updateTextInputBackingField(dispatch, newText),
      );
    },
    updateManualAddressPrefixInput: newText => {
      dispatch(
        locationActions.actions.updateManualAddressPrefixField(
          dispatch,
          newText,
        ),
      );
    },
    pushCurrentPickerLocationAsOrderDestination: async (
      pickedLatLng,
      latestPickerDestinationText,
      fullGeoDestinationAddress,
    ) => {
      dispatch(
        locationActions.actions.setOrderDestination(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText,
          fullGeoDestinationAddress,
        ),
      );
    },
    resetModalArrayToDefault: () => {
      modalActions.actions.resetModalArrayToDefault(dispatch);
    },
    updateFirstInstanceLoad: newBool => {
      console.debug('getting picker data');
      return CategoryActions.actions.updateFirstInstanceLoad(dispatch, newBool);
    },
    updateAllActionMessages: async newActionMessage => {
      console.debug('give it a bash');
      return actionMessageActions.actions.updateAllActionMessages(
        dispatch,
        newActionMessage,
      );
    },
    updateLatestInboundOrder: async (
      latestOrderRequestId,
      latestModalColor,
      latestModalDriverFees,
      latestModalHTML,
      latestModalPayload,
    ) => {
      try {
        driverActions.actions.updateLatestInboundOrder(
          dispatch,
          latestOrderRequestId,
          latestModalColor,
          latestModalDriverFees,
          latestModalHTML,
          latestModalPayload,
        );
      } catch (error) {
        console.debug(error);
      }
    },
    //DRIVER ORDER
    checkForNewOrderAndEnableOrderModeIfExists: async driverId => {
      try {
        driverActions.actions.checkForNewOrderAndEnableOrderModeIfExists(
          dispatch,
          driverId,
        );
      } catch (error) {
        console.debug(error);
      }
    },
    resetDriverStateToDefault: async () => {
      driverActions.actions.resetDriverState(dispatch);
    },
    addNewChatMessage: async (
      whichMessageCollectionUserGuid,
      sideOfConversationGuid,
      message,
      sendStatus,
    ) => {
      console.debug('About to add message');
      chatActions.actions.addChatMessage(
        dispatch,
        whichMessageCollectionUserGuid,
        sideOfConversationGuid,
        message,
        sendStatus,
      );
    },
    filterMessagesToUser: async receipientUserGuid => {
      console.debug('About to filter message');
      return chatActions.actions.filterMessagesToUser(
        dispatch,
        receipientUserGuid,
      );
    },
    //ACCOUNTS / BALANCE
    updateMyBalance: balance => {
      console.debug('About to update balance');
      try {
        dispatch(actions.fetchAccountBalance(dispatch, balance));
      } catch (error) {
        console.debug(error);
      }
    },
    //MODALS
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
    startLocationWatchAndApiLocationPush: async (
      relationGuid,
      urlToPostTo,
      locationWatchId,
    ) => {
      dispatch(
        locationActions.actions.startLocationWatchWithApiLocationPush(
          dispatch,
          relationGuid,
          urlToPostTo,
          locationWatchId,
        ),
      );
    },
    endLocationWatchWithApiLocationPush: async locationWatchId => {
      dispatch(
        locationActions.actions.endLocationWatchWithApiLocationPush(
          dispatch,
          locationWatchId,
        ),
      );
    },
    updateDriverState: async (_driverActive, _orderIsActive) => {
      console.debug('driver active:' + _driverActive + ' ' + _orderIsActive);
      let activeDriverState = {
        driverActive: _driverActive,
        orderIsActive: _orderIsActive,
      };
      dispatch(
        driverActions.actions.updateDriverState(dispatch, activeDriverState),
      );
    },
    disableKeepAliveCycle: timerId => {
      try {
        driverActions.actions.disableKeepAliveCycle(dispatch, timerId);
      } catch (error) {
        console.debug(error);
      }
    },
  };
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(
    Router,
  ),
);
