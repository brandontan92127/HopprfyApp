import React, {Component} from 'react';
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
  TouchableHighlight,
  TouchableOpacity,
  Picker,
  Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Device,
  GlobalStyle,
} from '@common';
import {Timer, toast, BlockTimer} from '@app/Omni';
import LogoSpinner from '@components/LogoSpinner';
import Empty from '@components/Empty';
import MapView, {PROVIDER_GOOGLE, AnimatedRegion} from 'react-native-maps';
import {Marker, MarkerAnimated, Callout, UrlTile} from 'react-native-maps';
import GeoWorker from '../../services/GeoWorker';
import MapWorker from '../../services/MapWorker';
import HopprWorker from '../../services/HopprWorker';
import {Images} from '@common';
import Permissions from 'react-native-permissions';
import {
  Button,
  AdMob,
  ModalBox,
  WebView,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating,
  FullOrderDisplayModal,
  DriverProfileModal,
} from '@components';
import MapViewDirections from 'react-native-maps-directions';
import {Config} from '@common';
import {Button as ElButton, Header, Icon, Divider} from 'react-native-elements';
import Modal from 'react-native-modalbox';
import BlinkView from 'react-native-blink-view';
import {TimeBetweenPointsRequestPayload} from '../../apiModels/Order/TimeToDeliveryRequest';
import {showMessage, hideMessage} from 'react-native-flash-message';
import {EventRegister} from 'react-native-event-listeners';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-snap-carousel';
import RNPickerSelect from 'react-native-picker-select';
import {setIntervalAsync} from 'set-interval-async/dynamic';
import {clearIntervalAsync} from 'set-interval-async';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import {NoFlickerImage} from 'react-native-no-flicker-image';
import DoubleClick from 'react-native-double-tap';

const fromEntries = require('fromentries');

const GOOGLE_MAPS_APIKEY = Config.GoogleMapsDirectionAPIKey;
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / 300;

const INITIAL_LATITUDE = 51.5397824;
const INITIAL_LONGITUDE = -0.1435601;

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
    paddingBottom: 40,
  },

  // container: {
  //   ...StyleSheet.absoluteFillObject,
  //   height: 400,
  //   width: 400,
  //   justifyContent: 'flex-end',
  //   alignItems: 'center',
  // },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  carimageStyle: {
    height: 200,
    flex: 1,
    width: null,
  },
  label: {
    fontWeight: 'bold',
    fontSize: Styles.FontSize.medium,
    color: Color.blackTextPrimary,
    fontFamily: Constants.fontFamily,
    marginTop: 20,
  },
  naviBar: {
    height: 64,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
  },
  naviTitle: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBack: {
    zIndex: 2,
    position: 'absolute',
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
    alignItems: 'center',
    backgroundColor: '#f6f6f8',
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
    resizeMode: 'contain',
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
    resizeMode: 'cover',
    height,
  },
  productSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  productSize: {
    marginLeft: 5,
    marginRight: 5,
  },
  productName: {
    textAlign: 'center',
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
    textDecorationLine: 'line-through',
    color: Color.blackTextDisable,
    marginLeft: 5,
    marginTop: 4,
    fontFamily: Constants.fontFamily,
  },
  tabButton: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  textTab: {
    fontFamily: Constants.fontHeader,
    color: 'rgba(183, 196, 203, 1)',
    fontSize: 16,
  },
  tabButtonHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    opacity: 0,
  },
  tabItem: {
    flex: 0.25,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  bottomView: {
    height: 50,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f7f9',
  },
  buttonContainer: {
    flex: 0.5,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    width: 20,
    height: 20,
    tintColor: '#ccc',
    flex: 1,
  },
  buttonStyle: {
    flex: 1 / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBuy: {
    flex: 0.5,
    backgroundColor: Color.product.BuyNowButton,
  },
  outOfStock: {
    backgroundColor: Color.product.OutOfStockButton,
  },
  btnBuyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Constants.fontHeader,
  },
  description: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,1)',
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
  productColorContainer: {
    position: 'absolute',
    top: 50,
    left: I18nManager.isRTL ? width - 50 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    width: 50,
  },

  modalBoxWrap: {
    position: 'absolute',
    borderRadius: 2,
    width,
    height,
    zIndex: 9999,
  },
  iconZoom: {
    position: 'absolute',
    right: 0,
    top: 10,
    backgroundColor: 'rgba(255,255,255,.9)',
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    zIndex: 9999,
  },
  textClose: {
    color: '#666',
    fontWeight: '600',
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
    backgroundColor: 'rgba(183, 196, 203, 1)',
    width: 10,
    height: 10,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(183, 196, 203, 1)',
  },
  tabView: {
    minHeight: height / 5,
    marginTop: 3,
  },
  price_wrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  textRating: {
    fontSize: 12,
    marginLeft: 4,
    paddingTop: 4,
  },

  attributeName: {
    color: '#aaa',
    fontFamily: Constants.fontFamily,
    fontSize: 11,
  },
  smallButtonContainer: {
    paddingTop: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  smallButton: {
    height: 40,
    width: 160,
    borderRadius: 20,
    backgroundColor: 'blue',
  },
  smallButtonText: {
    fontSize: 15,
    fontFamily: Constants.fontHeader,
  },

  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
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
});

const initalState = {
  initalDriverLocation: {
    lat: 0,
    lng: 0,
    isSet: false,
  },
  tracksViewChanges: true,
  tabIndex: 1,
  itemsAsText: 'None',
  destinationAddressText: 'Nowhere',
  timeToDelivery: {
    distanceAway: 0,
    timeAway: 0,
    unit: 'K',
  },
  driverName: 'None',
  storeName: 'None',
  storesTimerId: null,
  driversTimerId: null,
  deliveryTimerId: null,
  activeOrderTimerId: null,
  userInfo: null,
  activeCustomerOrder: [], //this is ALL orders
  selectedCustomerOrder: undefined, // this is the SELETED order via the picker
  selectedCustomerOrderId: -1,
  selectedCustomerOrderNetwork: undefined,
  fullOrderModalOpenClosed: false,
  fullDriverModalOpenClosed: false,
  activeOrderNumber: 'None',
  stores: [],
  drivers: [],
  orderStateImage: Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo,
  orderStageText: 'no order\n active',
  orderStageText2: 'None',
  orderStageText2Padding: -28,
  region: {
    latitude: INITIAL_LATITUDE,
    longitude: INITIAL_LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  },
  progressStage: 0,
  driverCoordinate: new AnimatedRegion({
    latitude: INITIAL_LATITUDE,
    longitude: INITIAL_LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  }),
};

const hotPink = 'hotpink';
const mainBlue = GlobalStyle.primaryColorDark.color;
const mainYellow = '#f8e86a';
const mainOrange = '#FD6301';

class TrackOrderScreen extends Component {
  constructor(props) {
    super(props);

    this.hasLoaded = false;
    this.state = initalState;

    this.mapView = null;

    this.getTimeToDelivery = (currentLat, currentLng, destLat, destLng) => {
      if (this.state.activeCustomerOrder.length > 0) {
        try {
          // let current = new TimeBetweenPointsRequestPayload(
          //   currentLat,
          //   currentLng
          // );
          // let dest = new TimeBetweenPointsRequestPayload(destLat, destLng);
          // let timeToDeliveryResult = await HopprWorker.getTimeBetweenLocations(
          //   current,
          //   dest
          // );

          const newGeoResult = GeoWorker.calculateTimeAndDistanceToDelivery(
            currentLat,
            currentLng,
            destLat,
            destLng,
          );
          // toast("Got time to delivery");
          this.setState(
            {
              timeToDelivery: newGeoResult,
            },
            () => {
              //   this._countdownTimer.forceUpdate();
              // showMessage({
              //   message:
              //     "set state as: " +
              //     Math.round(this.state.timeToDelivery.timeAway),
              //   description:
              //     "set state as: " +
              //     Math.round(this.state.timeToDelivery.timeAway),
              //   type: "success",
              //   autoHide: true,
              //   duration: 3400,
              //   position: "top",
              //   backgroundColor: "#ED8C48", // background color
              //   hideOnPress: true,
              // });
            },
          );
        } catch (error) {
          console.debug("Couldn't get time to delivery!");
        }
      }
    };

    //takes an order item
    this._renderCarouselItem = ({item, index}) => {
      let name = item.product.name;
      let size = item.product.size;
      let price = item.product.price;

      let amount = item.amount;
      let catImageBaseUrl = Config.ProductBaseUrl;
      if (
        item.product.images[0].indexOf('http://') == 0 ||
        item.product.images[0].indexOf('https://') == 0
      ) {
        //it's already an HTTP link, don't add anything
        catImageBaseUrl = '';
      }

      let imageUrl =
        catImageBaseUrl + item.product.images[0] ||
        'https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png';

      return (
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 5,
            flex: 1,
          }}>
          <View
            style={{
              flex: 1,
              paddingLeft: 2,
              paddingRight: 2,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: 180,
                width: 180,
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <NoFlickerImage
                style={{
                  flex: 1,
                  height: 180,
                  borderRadius: 10,
                  width: 180,
                }}
                source={{uri: imageUrl}}
              />
            </View>
          </View>
          {/* <Text
            style={{ textAlign: "center", fontSize: 10, color: "lightblue" }}
          >
            {amount + " " + name + "@" + size}
          </Text> */}
        </View>
      );
    };

    this.renderCarousel = () => {
      if (typeof this.state.selectedCustomerOrder !== 'undefined') {
        return (
          <View>
            <View
              style={{
                height: 194,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
              <View
                style={{
                  // overflow: "hidden",
                  flex: 1,
                  paddingTop: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                <Carousel
                  ref={c => {
                    this._carousel = c;
                  }}
                  layout={'default'}
                  layoutCardOffset={`9`}
                  data={this.state.selectedCustomerOrder.items}
                  renderItem={this._renderCarouselItem}
                  sliderWidth={190}
                  itemWidth={190}
                />
              </View>
            </View>
            <Text style={[styles.label, {textAlign: 'center'}]}>
              {this.state.itemsAsText}
            </Text>
          </View>
        );
      }

      return (
        <View
          style={{
            flex: 1,
            paddingLeft: 18,
            paddingRight: 18,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <Text style={[styles.label, {textAlign: 'center'}]}>
            {'No order\nactive'}
          </Text>
        </View>
      );
    };

    this.getTimeToDeliveryInMinutes = () => {
      try {
        let timeToDeliveryInMinutes = 0;
        let rnd = Math.floor(Math.random() * 100 + 1);
        if (this.state.activeCustomerOrder.length > 0) {
          if (typeof this.state.selectedCustomerOrder !== 'undefined') {
            if (
              this.state.timeToDelivery.timeAway > 0 &&
              !this.state.selectedCustomerOrder.driverMarkedAsComplete
            ) {
              timeToDeliveryInMinutes = Math.round(
                this.state.timeToDelivery.timeAway,
              );
            } else {
              let stop = '';
            }
          }
        }

        return Math.round(timeToDeliveryInMinutes);
      } catch (error) {}
    };

    this.updateActiveOrder = activeCustomerOrder => {
      if (typeof activeCustomerOrder !== 'undefined') {
        this.setState(activeCustomerOrder, function () {
          console.debug(
            'updated active order state:' + JSON.stringify(activeCustomerOrder),
          );
        });
        this.setState({activeOrderNumber: activeCustomerOrder[0]._id});
      }
    };
  }

  _renderOrderPickerRow = () => {
    try {
      if (typeof this.state.activeCustomerOrder !== 'undefined') {
        if (this.state.activeCustomerOrder) {
          const orderItems = this.state.activeCustomerOrder.map(
            (item, index) => ({
              value: item._id,
              label:
                'ID:#' +
                item._id.substring(0, 4) +
                ' - £' +
                item.total.toFixed(2) +
                ' - ' +
                moment.parseZone(item.creationDate).format('MMMM DD, YYYY'),
            }),
          );

          if (this.state.activeCustomerOrder.length > 0) {
            return (
              <View
                style={{
                  width: width * 0.7 - 4,
                  paddingLeft: 2,
                  borderWidth: 1,
                  backgroundColor: 'white',
                  opacity: 0.6,
                  borderColor: 'silver',
                  borderRadius: 20,
                  minHeight: 50,
                  maxHeight: 50,
                  height: 50,
                  margin: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <RNPickerSelect
                  useNativeAndroidPickerStyle={false}
                  placeholder={{
                    label: 'Select Order',
                    value: -1,
                  }}
                  style={{
                    flex: 1,
                    width: width - 10,
                    borderWidth: 2,
                    borderColor: 'orange',
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    inputIOS: {
                      textAlign: 'center',
                      color: mainBlue,
                    },
                    inputAndroid: {
                      textAlign: 'center',
                      color: mainBlue,
                    },
                  }}
                  inputStyle={{
                    textAlign: 'center',
                    color: hotPink,
                    width: width,
                  }}
                  onValueChange={async (itemValue, itemIndex) =>
                    await this._changeOrderPickerValue(itemValue)
                  }
                  value={this.state.selectedCustomerOrderId}
                  items={orderItems}
                />
              </View>
            );
          }
        }
      }
    } catch (error) {
      console.debug("couldn't render order picker row");
    }
  };

  _changeOrderPickerValue = async itemValue => {
    await this._changeOrder(itemValue);
  };

  handleClickTab(tabIndex) {
    this.setState({tabIndex});
  }

  getLocationIndex = async (relationGuid, urlToPostTo) => {
    console.debug('inside getLocationIndex');

    navigator.geolocation.watchPosition(
      async position => {
        //success

        let locationUpdateRequest = {
          relationGuid: relationGuid,
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };

        await HopprWorker.updateLocationOnApi(
          urlToPostTo,
          JSON.stringify(locationUpdateRequest),
        );

        let addressResult = await HopprWorker.reverseGeocode(
          position.coords.latitude,
          position.coords.longitude,
        );
        toast("You're at:" + addressResult.data);
      },
      error => {
        console.debug('Error getting location:' + JSON.stringify(error));
        // dispatch(
        //   actions.getCurrentLocationFailure("Couldn't get current position")
        // );
      },
      {enableHighAccuracy: true, distanceFilter: 5, maximumAge: 15000},
    );
  };

  /**
   * Render tabview detail
   */
  _renderTabView = () => {
    const {
      theme: {
        colors: {background, text, lineColor},
      },
    } = this.props;

    return (
      <View
        style={[styles.tabView, {paddingBottom: 20, backgroundColor: 'white'}]}>
        <View
          style={[
            styles.tabButton,
            {backgroundColor: lineColor},
            {borderTopColor: lineColor},
            {borderBottomColor: lineColor},
            Constants.RTL && {flexDirection: 'row-reverse'},
          ]}>
          <View
            style={[
              styles.tabItem,
              {alignContent: 'center', backgroundColor: 'white'},
            ]}>
            <Button
              type="tabimage"
              lineColor={'lightblue'}
              icon={Images.TabDestIcon1}
              textStyle={[
                styles.textTab,
                {alignContent: 'center', color: text},
              ]}
              selectedStyle={{color: text}}
              text={'Destination:'}
              onPress={() => this.handleClickTab(0)}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View
            style={[
              styles.tabItem,
              {alignContent: 'center', backgroundColor: 'white'},
            ]}>
            <Button
              type="tabimage"
              lineColor={'lightblue'}
              icon={Images.FilledCart2}
              textStyle={[
                styles.textTab,
                {alignContent: 'center', color: text},
              ]}
              selectedStyle={{color: text}}
              text={'Order:'}
              onPress={() => this.handleClickTab(1)}
              selected={this.state.tabIndex == 1}
            />
          </View>
          <View
            style={[
              styles.tabItem,
              {alignContent: 'center', backgroundColor: 'white'},
            ]}>
            <Button
              type="tabimage"
              lineColor={'lightblue'}
              icon={Images.HopprLogoMapPin1}
              textStyle={[
                styles.textTab,
                {alignContent: 'center', color: text},
              ]}
              selectedStyle={{color: text}}
              text={'Progress:'}
              onPress={() => this.handleClickTab(2)}
              selected={this.state.tabIndex == 2}
            />
          </View>
          <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
            <Button
              type="tabimage"
              lineColor={'lightblue'}
              icon={Images.AddDriver1}
              textStyle={[styles.textTab, {color: text}]}
              selectedStyle={{color: text}}
              text={'Driver:'}
              onPress={() => this.handleClickTab(3)}
              selected={this.state.tabIndex == 3}
            />
          </View>
          <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
            <Button
              type="tabimage"
              lineColor={'lightblue'}
              icon={Images.MapIconStore6}
              textStyle={[styles.textTab, {color: text}]}
              selectedStyle={{color: text}}
              text={'Store:'}
              onPress={() => this.handleClickTab(4)}
              selected={this.state.tabIndex == 4}
            />
          </View>
          {/* <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              icon={Images.TabBIIcon2}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Eta:"}
              onPress={() => this.handleClickTab(4)}
              selected={this.state.tabIndex == 4}
            />
          </View> */}
        </View>
        {this.state.tabIndex === 0 && (
          <View style={{flex: 1}}>
            <View
              style={{
                flex: 1,
                paddingLeft: 18,
                paddingRight: 18,
                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <Text style={[styles.label, {textAlign: 'center'}]}>
                {this.state.destinationAddressText}
              </Text>
            </View>
          </View>
        )}
        {this.state.tabIndex === 1 && (
          // <View
          //   style={[
          //     styles.description,
          //     { alignContent: "center", backgroundColor: "white" }
          //   ]}
          // >
          <View
            style={{
              flex: 1,
              paddingLeft: 18,
              paddingRight: 18,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            {this.renderCarousel()}
          </View>
          // </View>
        )}
        {this.state.tabIndex === 2 && (
          <View
            style={{
              borderRadius: 1,
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderRightWidth: 0,
              // borderWidth: 0.5,
              // borderStyle: "dashed",
              // borderColor: "hotpink",
              margin: 5,
              marginTop: 1,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                width: width,
                marginTop: 1,
                paddingTop: 1,
                padding: 4,
                paddingBottom: 5,
                marginBottom: 5,
              }}>
              <FastImage
                style={{
                  flex: 1,
                  height: 80,
                  width: width - 30,
                }}
                source={Images.orderProgress}
                resizeMode="contain"
              />

              <View
                style={{
                  paddingTop: 4,
                  marginTop: 6,
                }}>
                <Progress.Bar
                  color={'lightblue'}
                  animated={true}
                  progress={this.state.progressStage}
                  width={width - 90}
                />
              </View>
            </View>
          </View>
        )}
        {this.state.tabIndex === 3 && (
          // <View style={[styles.description, { backgroundColor: "white" }]}>
          <View
            style={{
              flex: 1,
              paddingLeft: 18,
              paddingRight: 18,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={[styles.label, {textAlign: 'center'}]}>
                {this.state.driverName}
              </Text>
              <TouchableOpacity onPress={() => this._openFullDriverModal()}>
                <View style={{padding: 2, paddingLeft: 5}}>
                  <FastImage
                    source={Images.Info2}
                    style={{
                      alignSelf: 'center',
                      width: 28,
                      height: 28,
                    }}
                  />
                  {/* <Text
                    style={{
                      fontSize: 8,
                      color: "silver",
                      textAlign: "center",
                    }}
                  >
                    {"Chat"}
                  </Text> */}
                </View>
              </TouchableOpacity>
            </View>
          </View>
          // </View>
        )}
        {this.state.tabIndex === 4 && (
          // <View style={[styles.description, { backgroundColor: "white" }]}>
          <View
            style={{
              flex: 1,
              paddingLeft: 18,
              paddingRight: 18,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Text style={[styles.label, {textAlign: 'center'}]}>
              {this.state.storeName}
            </Text>
          </View>
        )}

        {this.state.tabIndex === 5 && (
          // <View
          //   style={[
          //     styles.description,
          //     { alignContent: "center", backgroundColor: "white" }
          //   ]}
          // >
          <View
            style={{
              flex: 1,
              paddingLeft: 18,
              paddingRight: 18,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Text style={[styles.label, {textAlign: 'center'}]}>
              {'Distance away (km):  ' +
                parseFloat(this.state.timeToDelivery.distanceAway).toFixed(1)}
            </Text>
            <Text style={[styles.label, {textAlign: 'center'}]}>
              {'Estimated time to delivery: ' +
                parseFloat(this.state.timeToDelivery.timeAway).toFixed(1) +
                ' mins'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  displayMarkerLines = () => {
    if (typeof this.state.selectedCustomerOrder !== 'undefined') {
      return (
        <MapViewDirections
          style={{zIndex: 100}}
          origin={{
            latitude: this.state.selectedCustomerOrder.driver.location.lat,
            longitude: this.state.selectedCustomerOrder.driver.location.long,
          }}
          destination={{
            latitude: this.state.selectedCustomerOrder.location.lat,
            longitude: this.state.selectedCustomerOrder.location.long,
          }}
          waypoints={[
            {
              latitude: this.state.selectedCustomerOrder.store.location.lat,
              longitude: this.state.selectedCustomerOrder.store.location.long,
            },
          ]}
          mode={'DRIVING'}
          apikey={Config.GoogleMapsDirectionAPIKey}
          strokeWidth={6}
          strokeColor="#395877"
        />
      );
    } else {
      return null;
    }
  };

  _renderCornerLogoImage = () => {
    let imgSrc = Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo;
    //let ourUrl = Config.NetworkImageBaseUrl + theNetsWeWant[0].storeLogoUrl;
    if (typeof this.state.selectedCustomerOrderNetwork !== 'undefined') {
      imgSrc = {
        uri:
          Config.NetworkImageBaseUrl +
          this.state.selectedCustomerOrderNetwork.storeLogoUrl,
      };
    }

    return (
      <FastImage
        source={imgSrc}
        style={{minHeight: 70, maxHeight: 70, maxWidth: 120, minWidth: 70}}
        resizeMode="contain"
      />
    );
  };

  componentDidUpdate = async (prevProps, prevState) => {
    //calc variables for which / where the order is currently going based on it's state
    console.debug('In componewnt did update');
    if (typeof this.state.selectedCustomerOrder !== 'undefined') {
      let whichStageOfOrderText = 'no order\nactive';
      let whichStageOfOrderText2 = 'none';
      let whichImage = undefined;
      let currentProgressState = this.state.progressStage;
      let orderStageText2Padding = -28; //standard padding

      //do calcs
      switch (this.state.selectedCustomerOrder.state) {
        case 'DRIVER_EN_ROUTE_TO_STORE':
          whichStageOfOrderText = 'until pickup';
          whichStageOfOrderText2 = 'Picking up';
          currentProgressState = 0.33;
          // this.setState({progressStage: 0.25 });
          whichImage = Images.AnimatedStore5;
          orderStageText2Padding = -31;
          break;
        case 'ORDER_EN_ROUTE_TO_CUSTOMER':
          whichStageOfOrderText = 'to delivery';
          whichStageOfOrderText2 = 'En-route';
          currentProgressState = 0.75;
          whichImage = Images.bike;
          orderStageText2Padding = -28;
          break;
        default:
          whichStageOfOrderText = 'no order\nactive';
          whichStageOfOrderText2 = 'None';
          currentProgressState = 0.0;
          whichImage = Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo;
          orderStageText2Padding = -28;
          break;
      }

      //now add final case if driver has marked complete
      if (this.state.selectedCustomerOrder.driverMarkedAsComplete) {
        whichStageOfOrderText = 'order was\ndelivered';
        whichStageOfOrderText2 = 'Complete?';
        currentProgressState = 100.0;
        whichImage = Images.Celebration2;
        orderStageText2Padding = -14;
      }

      //update text if it's changed
      if (prevState.orderStageText !== whichStageOfOrderText)
        this.setState({
          orderStateImage: whichImage,
          orderStageText: whichStageOfOrderText,
          orderStageText2: whichStageOfOrderText2,
          orderStageText2Padding: orderStageText2Padding,
          progressStage: currentProgressState,
        });
    }
  };

  resetThisComponentState = () => {
    this.setState(initalState);
  };

  _updateActiveOrders = async () => {
    toast('Updated active orders!');
    HopprWorker.getActiveCustomerOrders(this.props.user.user.customerId).then(
      async customerOrders => {
        if (
          typeof customerOrders !== 'undefined' &&
          customerOrders !== '' &&
          customerOrders != null
        ) {
          //update all the orders

          let sortedOrdersNewestFirst = customerOrders.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.creationDate) - new Date(a.creationDate);
          });

          this.setState({
            activeCustomerOrder: sortedOrdersNewestFirst,
          });
          //then update the selected order (if there is one) as well (with any new state etc)
          if (typeof this.state.selectedCustomerOrder !== 'undefined') {
            let activeNewOrder = sortedOrdersNewestFirst.find(
              x => x._id == this.state.selectedCustomerOrder._id,
            );
            this.setState({selectedCustomerOrder: activeNewOrder});
          }

          console.debug('Tracing active customer order');
          toast('Tracking active customer order');
          if (
            sortedOrdersNewestFirst.length > 0 &&
            typeof this.state.selectedCustomerOrder == 'undefined'
          ) {
            await this._changeOrder(sortedOrdersNewestFirst[0]._id);
            console.debug('Updated active customer orders state');
            this._mapView.animateToViewingAngle(60, 100);
          }
        } else {
          toast('reset the component state');
          this.resetThisComponentState();
        }
      },
    );
  };

  _changeOrder = async newOrderId => {
    //close marker callouts
    //set the new order in state
    let newlySelectedOrder = this.state.activeCustomerOrder.find(
      x => x._id == newOrderId,
    );
    this.setState({
      selectedCustomerOrderId: newOrderId,
      selectedCustomerOrder: newlySelectedOrder,
    });

    //SHOULD BE START OF CHANGE ORDER HERE
    console.debug('made it here');
    //try get locations for some objects
    let fullStore = newlySelectedOrder.store;
    let fullDriver = newlySelectedOrder.driver;
    let fullCustoemr = newlySelectedOrder.customer;
    this.setState({activeOrderNumber: newlySelectedOrder._id});

    console.debug('Drivers' + JSON.stringify(fullDriver));
    console.debug('Stores' + JSON.stringify(fullStore));
    //convert objects into marker arrays

    let newSTore = fullStore;
    this.setState({stores: [...this.state.stores, newSTore]}, function () {
      console.debug('Updated stores state');
    });
    this.setState({storeName: newSTore.storeName});

    this.setState(
      {
        initalDriverLocation: {
          lat: fullDriver.location.lat,
          lng: fullDriver.location.long,
          isSet: true,
        },
        drivers: [...this.state.drivers, fullDriver],
      },
      function () {
        console.debug('Updated drivers state');
      },
    );

    this.setState({
      driverName: fullDriver.firstName + ' ' + fullDriver.lastName,
    });

    let latLng = {
      latitude: newlySelectedOrder.location.lat,
      longitude: newlySelectedOrder.location.long,
    };

    try {
      // let region = new AnimatedRegion({
      let region = {
        latitude: newlySelectedOrder.location.lat,
        longitude: newlySelectedOrder.location.long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }; //);

      this._mapView.animateToRegion(region);
      this.setState({region: region});
    } catch (error) {
      console.debug('there was a problem with the camera' + error);
    }

    //geocode destiantion
    let destinationAddressResult = await HopprWorker.reverseGeocode(
      newlySelectedOrder.location.lat,
      newlySelectedOrder.location.long,
    );

    let itemString = '';
    newlySelectedOrder.items.map(
      x => (itemString += ' ' + x.amount + ' of ' + x.productName + '\n\n'),
    );
    this.setState({destinationAddressText: destinationAddressResult});
    this.setState({itemsAsText: itemString});
    this._mapView.animateToViewingAngle(60, 100);

    this._updateSelectedNetwork(newlySelectedOrder.networkId);
  };

  _resolveTimeToDeliveryPayload = (driver, order, store) => {
    const payloadToReturn = {
      startLat: 0,
      startLng: 0,
      endLat: 0,
      endLng: 0,
    };

    //it's driver to store
    if (order.state === 'DRIVER_EN_ROUTE_TO_STORE') {
      payloadToReturn.startLat = driver.location.lat;
      payloadToReturn.startLng = driver.location.long;
      payloadToReturn.endLat = store.location.lat;
      payloadToReturn.endLng = store.location.long;
    }
    //it's driver to destination
    else {
      payloadToReturn.startLat = driver.location.lat;
      payloadToReturn.startLng = driver.location.long;
      payloadToReturn.endLat = order.location.lat;
      payloadToReturn.endLng = order.location.long;
      // } else {
      //   //default should never get here
      //   const errorMsgThrow =
      //     "Couldn't work out which destination state the order is at from driver state!!: " +
      //     driver.state;
      //   toast(errorMsgThrow);

      //   //just do a default
      //   payloadToReturn.startLat = driver.location.lat;
      //   payloadToReturn.startLng = driver.location.long;
      //   payloadToReturn.endLat = store.location.lat;
      //   payloadToReturn.endLng = store.location.long;
      //throw Error(errorMsgThrow);
    }

    return payloadToReturn;
  };

  unload = () => {
    //toast("Hit the unload function");
    //stop location updates
    clearIntervalAsync(this.state.driversTimerId);
    clearIntervalAsync(this.state.storesTimerId);
    clearIntervalAsync(this.state.deliveryTimerId);
    clearIntervalAsync(this.state.activeOrderTimerId);

    //reset component state
    this.resetThisComponentState();
    this.hasLoaded = false;
  };

  load = async () => {
    if (!this.hasLoaded) {
      this.hasLoaded = true;
      //reset any currently tracked order state
      //toast("Hit the load function");
      const {navigation} = this.props;

      //check that location is enabled cos we need it
      console.debug('ABOUT TO FIND GEOPOSITIONS');
      await MapWorker.requestLocationPermission();

      const {username, password} = this.state;

      if (!this.props.user.user) {
        showMessage({
          duration: 6000,
          message: "You're not logged in",
          autoHide: true,
          style: {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          },
          position: 'center',
          description:
            'Why not create an account - and get anything delivered, instantly!',
          backgroundColor: 'orange', // background color
          color: 'white', // text color
        });

        return;
      }

      HopprWorker.init({
        username: this.props.user.user.email,
        password: this.props.user.successPassword,
        token: this.props.user.token,
      });

      EventRegister.emit('showSpinner');
      try {
        await this._updateActiveOrders();
        //start all times
        this.enableStoreTracking();
        // console.debug("passed");
        this.enableDriverTracking();
        //start order update tracking

        // var deliveryTimerId = setInterval(() => {
        console.debug('About to get time to delivery');

        getTimeToDelivery = () => {
          if (typeof this.state.selectedCustomerOrder !== 'undefined') {
            try {
              //is it from driver current location to store, or from driver current location to DEST?
              console.log('');
              const timeToResolvePayloadAgain =
                this._resolveTimeToDeliveryPayload(
                  this.state.drivers[0],
                  this.state.selectedCustomerOrder,
                  this.state.stores[0],
                );

              this.getTimeToDelivery(
                timeToResolvePayloadAgain.startLat,
                timeToResolvePayloadAgain.startLng,
                timeToResolvePayloadAgain.endLat,
                timeToResolvePayloadAgain.endLng,
              );
            } catch (error) {
              toast("Couldn't get time to delivery!!!");
            }
          }
        };

        getTimeToDelivery();
        let deliveryTimerId = setIntervalAsync(getTimeToDelivery, 3000);
        this.setState({deliveryTimerId: deliveryTimerId});
        //try get the order details if any exist?

        const updateActiveOrders = async () => {
          try {
            await this._updateActiveOrders();
          } catch (error) {
            toast('Couldnt update active orders');
          }
        };
        updateActiveOrders();
        let activeOrderTimerId = setIntervalAsync(updateActiveOrders, 20000);
        this.setState({activeOrderTimerId: activeOrderTimerId});
        Keyboard.dismiss();
      } catch (error) {
        alert('There was an error:' + error);
      } finally {
        EventRegister.emit('hideSpinner');
      }
    }
  };

  componentWillUnmount = () => {
    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();
    } catch (error) {
      console.debug('unmount failed track order');
    }
  };

  componentDidMount = async () => {
    this.unsubscribeWillFocus = this.props.navigation.addListener(
      'willFocus',
      this.load,
    );
    this.unsubscribeLoseFocus = this.props.navigation.addListener(
      'willBlur',
      this.unload,
    );

    await this.load();
    // await HopprWorker.toCustomerMode();
    // await HopprWorker.toStoreMode();
    // await HopprWorker.toDriverMode();

    //this.props.getMyPosition();
    // this.props.startLocationWatch();
  };

  markerClick = () => {
    //pass map view to GeoWorker to add marker
  };

  //turns on store updates
  enableStoreTracking = async () => {
    //repulls store from API on timer
    var newStoreTImerId = setIntervalAsync(async () => {
      //get data
      if (typeof this.state.selectedCustomerOrder !== 'undefined') {
        try {
          let fullStore = await this.getStore(
            this.state.selectedCustomerOrder.store._id,
          );
          let newSTore = fullStore[0];
          this.setState({stores: fullStore}, function () {
            // toast("Treacking updated store location");
            console.debug('Updated stores state');
          });
        } catch (error) {
          toast("Couldn't update stores");
        }
      }
    }, 4000);

    this.setState({storesTimerId: newStoreTImerId});
  };

  disableStoreTracking = () => {
    clearTimeout(this.state.storesTimerId);
  };

  //turn on driver updates
  enableDriverTracking = async () => {
    trackDriver = async () => {
      //get data
      if (typeof this.state.selectedCustomerOrder !== 'undefined') {
        let allDriversResponse = await this.getDriver(
          this.state.selectedCustomerOrder.driver._id,
        );
        if (allDriversResponse.status == 200) {
          let allDrivers = allDriversResponse.data.value;
          let driver = allDrivers[0];

          const newCoordinate = {
            latitude: driver.location.lat,
            longitude: driver.location.long,
          };
          //animate marker
          if (Platform.OS === 'android') {
            if (this._driverMarker) {
              this._driverMarker.animateMarkerToCoordinate(newCoordinate, 8000);
            }
          } else {
            let duration = 8000;
            //this.setState({ driverCoordinate: newCoordinate})
            let timingCOnfig = {
              latitude: driver.location.lat,
              longitude: driver.location.long,
              duration,
            };

            this.state.driverCoordinate.timing(timingCOnfig).start();
            //.timing({ ...newCoordinate, duration: 8000 })
            // .start();
          }

          this.setState({drivers: allDrivers});
        }
      }
    };

    trackDriver();
    var newDriversTimerId = setIntervalAsync(trackDriver, 4000);

    this.setState({driversTimerId: newDriversTimerId});
  };

  disableDriverTracking = () => {
    clearTimeout(this.state.driversTimerId);
  };

  getStore = async storeId => {
    return await HopprWorker.getStore(storeId);
  };

  getDriver = async driverId => {
    return await HopprWorker.getDriver(driverId);
  };

  _renderStoresMarkers = () => {
    if (this.state.stores.length > 0) {
      return this.state.stores.map(marker => {
        // if (
        //   marker.location != null &&
        //   marker.location.lat != null &&
        //   marker.location.long != null
        // ) {
        <Marker
          tracksViewChanges={this.state.tracksViewChanges}
          ref={el => (this._storeMarker = el)}
          key={`${marker.storeName}`}
          identifier={marker.storeName}
          coordinate={{
            latitude: marker.location.lat,
            longitude: marker.location.long,
          }}
          // image={Images.MapIconStore}
          title={marker.storeName}>
          <FastImage
            source={Images.MapIconDriver8}
            style={{width: 50, height: 50}}
          />
        </Marker>;

        // }
      });
    }
  };

  _findMarker = async location => {
    try {
      this._mapView.animateToRegion(
        {
          latitude: location.lat,
          longitude: location.long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        4,
      );
      let address = await GeoWorker.reverseGeocode(location.lat, location.long);
      showMessage({
        duration: 5000,
        message: 'Your driver is currently at:',
        autoHide: true,
        style: {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        },
        position: 'center',
        description: address.formattedAddress,
        backgroundColor: 'orange', // background color
        color: 'white', // text color
      });
    } catch (error) {
      console.debug(error);
    }
  };

  _renderDriverMarkers = () => {
    if (typeof this.state.drivers != 'undefined') {
      return this.state.drivers.map(marker =>
        Platform.OS === 'android' ? (
          <Marker
            ref={el => (this._driverMarker = el)}
            coordinate={{
              latitude: this.state.initalDriverLocation.lat,
              longitude: this.state.initalDriverLocation.lng,
            }}
            description={'Delivering your order'}
            title={'Driver: ' + marker.firstName + ' ' + marker.lastName}
            onCalloutPress={() => {
              this._openFullDriverModal();
            }}>
            <FastImage
              source={Images.sport_utility_vehicle}
              style={{
                maxWidth: 90,
                width: 90,
                maxHeight: 90,
                height: 90,
              }}
            />
          </Marker>
        ) : (
          <Marker.Animated
            tracksViewChanges={this.state.tracksViewChanges}
            ref={el => (this._driverMarker = el)}
            coordinate={{
              latitude: marker.location.lat,
              longitude: marker.location.long,
            }}
            description={'Delivering your order'}
            title={'Driver: ' + marker.firstName + ' ' + marker.lastName}
            onCalloutPress={() => {
              this._openFullDriverModal();
            }}>
            {/* <Callout
              style={{flex: 1, position: 'relative'}}
              onPress={() => this._openFullDriverModal()}>
              <View>
                <Text style={{fontSize: 18, fontFamily: Constants.fontFamily}}>
                  {marker.firstName + ' ' + marker.lastName}
                </Text>
                <Text
                  style={{
                    color: 'silver',
                    fontFamily: Constants.fontFamily,
                    fontSize: 12,
                  }}>
                  {'Delivering your order'}
                </Text>
              </View>
            </Callout> */}
            <FastImage
              source={Images.sport_utility_vehicle}
              style={{
                maxWidth: 90,
                width: 90,
                maxHeight: 90,
                height: 90,
              }}
            />
          </Marker.Animated>
        ),
      );
    } else {
      return;
    }
  };

  _renderDestinationMarker = () => {
    if (
      typeof this.state.selectedCustomerOrder != 'undefined' &&
      typeof this.state.selectedCustomerOrder.location != 'undefined' &&
      this.state.selectedCustomerOrder.location.lat != null &&
      this.state.selectedCustomerOrder.location.long != null
    ) {
      return Platform.OS === 'android' ? (
        <Marker
          tracksViewChanges={this.state.tracksViewChanges}
          coordinate={{
            latitude: this.state.selectedCustomerOrder.location.lat,
            longitude: this.state.selectedCustomerOrder.location.long,
          }}
          title={'Order destination'}
          description={
            this.state.selectedCustomerOrder.deliveryLocationAsString
          }
          onCalloutPress={() => {
            try {
              EventRegister.emit('showSpinner');
              if (this.state.selectedCustomerOrderId != -1) {
                this._updateSelectedNetwork(
                  this.state.selectedCustomerOrder.networkId,
                );
                this._openFullOrderModal();
              }
            } catch (error) {
              console.debug(error);
            } finally {
              EventRegister.emit('hideSpinner');
            }
          }}>
          <FastImage
            source={Images.NewAppReskinIcon.LocationBlue}
            style={{
              width: 55,
              maxWidth: 90,
              minHeight: 70,
              height: 55,
            }}></FastImage>
        </Marker>
      ) : (
        <Marker.Animated
          tracksViewChanges={this.state.tracksViewChanges}
          coordinate={{
            latitude: this.state.selectedCustomerOrder.location.lat,
            longitude: this.state.selectedCustomerOrder.location.long,
          }}
          title={'Order destination'}
          description={this.state.destinationAddressText}
          onCalloutPress={() => {
            try {
              EventRegister.emit('showSpinner');
              if (this.state.selectedCustomerOrderId != -1) {
                this._updateSelectedNetwork(
                  this.state.selectedCustomerOrder.networkId,
                );
                this._openFullOrderModal();
              }
            } catch (error) {
              console.debug(error);
            } finally {
              EventRegister.emit('hideSpinner');
            }
          }}>
          {/* <Callout
            style={{flex: 1, position: 'relative'}}
            onPress={async () => {
              try {
                EventRegister.emit('showSpinner');
                if (this.state.selectedCustomerOrderId != -1) {
                  await this._updateSelectedNetwork(
                    this.state.selectedCustomerOrder.networkId,
                  );
                  this._openFullOrderModal();
                }
              } catch (error) {
                console.debug(error);
              } finally {
                EventRegister.emit('hideSpinner');
              }
            }}>
            <View>
              <Text style={{fontSize: 18, fontFamily: Constants.fontFamily}}>
                {'Order destination'}
              </Text>
              <Text
                style={{
                  color: 'silver',
                  fontSize: 12,
                  fontFamily: Constants.fontFamily,
                }}>
                {this.state.destinationAddressText}
              </Text>
            </View>
          </Callout> */}
          <FastImage
            source={Images.NewAppReskinIcon.LocationBlue}
            style={{
              width: 55,
              maxWidth: 90,
              minHeight: 70,
              height: 55,
            }}></FastImage>
        </Marker.Animated>
      );
    }
  };

  stopTrackingViewChanges = () => {
    this.setState(() => ({
      tracksViewChanges: false,
    }));
  };

  _renderStoreMarker = () => {
    if (this.state.stores.length > 0) {
      return Platform.OS === 'android' ? (
        <Marker
          tracksViewChanges={this.state.tracksViewChanges}
          coordinate={{
            latitude: this.state.stores[0].location.lat,
            longitude: this.state.stores[0].location.long,
          }}
          description={'Supplying your order'}
          title={'Store: ' + this.state.stores[0].storeName}>
          <FastImage
            source={Images.MapIconStore10}
            style={{
              maxWidth: 90,
              width: 50,
              height: 50,
            }}
          />
        </Marker>
      ) : (
        <Marker.Animated
          tracksViewChanges={this.state.tracksViewChanges}
          coordinate={{
            latitude: this.state.stores[0].location.lat,
            longitude: this.state.stores[0].location.long,
          }}
          description={'Supplying your order'}
          title={'Store: ' + this.state.stores[0].storeName}>
          <FastImage
            source={Images.MapIconStore10}
            style={{
              maxWidth: 90,
              width: 60,
              height: 60,
            }}
          />
        </Marker.Animated>
      );
    }
  };

  _renderMapView = () => {
    if (this.state.activeCustomerOrder.length > 0) {
      return (
        <MapView
          onMapReady={() =>
            setTimeout(() => {
              this.stopTrackingViewChanges();
            }, 400)
          }
          onPress={() => this.markerClick()}
          ref={el => (this._mapView = el)}
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          // customMapStyle={Config.MapThemes.SecondaryMapTheme}
          initialRegion={this.state.region}>
     
           {this._renderStoreMarker()}
           {this._renderDriverMarkers()}
          {/* //render maplines if there is an order */}
          {this._renderDestinationMarker()}
          {/* //render maplines if there is an order */}
          {this.displayMarkerLines()}

          {/* BUTTON ABSOULTE */}
        </MapView>
      );
    } else {
      return (
        <MapView
          onPress={() => this.markerClick()}
          ref={el => {
            this._mapView = el;
          }}
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          initialRegion={this.state.region}
          //customMapStyle={Config.MapThemes.SecondaryMapTheme}
        ></MapView>
      );
    }
  };

  _updateSelectedNetwork = async netId => {
    let newNetResultsData = await HopprWorker.getNetwork(netId);
    //lowecase the result so it works
    let entries = Object.entries(newNetResultsData);
    let capsEntries = entries.map(entry => [
      entry[0][0].toLowerCase() + entry[0].slice(1),
      entry[1],
    ]);
    let netNets = fromEntries(capsEntries);

    this.setState({selectedCustomerOrderNetwork: netNets});
    console.log(netNets);
    return;
  };

  _renderFullOrderDisplayModal = () => {
    if (typeof this.state.selectedCustomerOrder !== 'undefined') {
      if (typeof this.state.selectedCustomerOrderNetwork !== 'undefined') {
        return (
          <FullOrderDisplayModal
            mode={'customer'}
            closeMe={this._closeFullOrderModal}
            openClosed={this.state.fullOrderModalOpenClosed}
            ref={'fullOrderDisplayModal'}
            orderNetwork={this.state.selectedCustomerOrderNetwork}
            orderAndItems={this.state.selectedCustomerOrder}
            fullAddress={this.state.destinationAddressText}
          />
        );
      }
    }
  };

  _closeFullDriverModal = () => {
    EventRegister.emit('showSpinner');
    this.setState({fullDriverModalOpenClosed: false}, () => {
      EventRegister.emit('hideSpinner');
    });
  };

  _openFullDriverModal = () => {
    EventRegister.emit('showSpinner');
    this.setState({fullDriverModalOpenClosed: true}, () => {
      EventRegister.emit('hideSpinner');
    });
  };

  _renderFullDriverDisplayModal = () => {
    if (typeof this.state.selectedCustomerOrder !== 'undefined') {
      return (
        <DriverProfileModal
          closeMe={this._closeFullDriverModal}
          openClosed={this.state.fullDriverModalOpenClosed}
          ref={'fullDriverDisplayModal'}
          driver={this.state.selectedCustomerOrder.driver}
        />
      );
    }
  };

  _closeFullOrderModal = () => {
    this.setState({fullOrderModalOpenClosed: false});
  };

  _openFullOrderModal = () => {
    this.setState({fullOrderModalOpenClosed: true}, () => {});
  };

  render() {
    console.debug('In track order');
    let headerTitle =
      typeof this.state.activeOrderNumber === 'undefined'
        ? 'None'
        : this.state.activeOrderNumber.substring(0, 8);

    return (
      <View
        style={{
          flexGrow: 1,
          backgroundColor: Color.background,
          paddingTop: Device.getCorrectIphoneXViewBasePadding(44),
        }}>
        {/* <Header
          backgroundColor={mainBlue}
          outerContainerStyles={{ height: 49 }}         
          leftComponent={
            <View style={{ paddingTop: 10, marginTop: 10 }}>
              <FastImage
                source={Images.DroneLogistics1}
                style={{ maxHeight: 24, maxWidth: 24, height: 24, width: 24 }}
              />
            </View>
          }          
          rightComponent={            
              <TouchableOpacity
                style={{ paddingTop: 10, marginTop: 10 }}
                onPress={async() => {
                  try {

                    if(typeof this.state.selectedCustomerOrder !== "undefined")
                    {                                                       
                    EventRegister.emit("showSpinner");
                    await this._findMarker(this.state.selectedCustomerOrder.driver.location);                 
                    }                    
                  } catch (error) {
                    console.debug(error);
                  }
                  finally{
                    EventRegister.emit("hideSpinner");
                  }
                }
                }
              >
               <FastImage
                source={Images.InfoQuestion6}
                style={{ maxHeight: 24, maxWidth: 24, height: 24, width: 24 }}
              />
              </TouchableOpacity>         
          }
          centerComponent={{
            text: "#" + headerTitle.substring(0, 4).toUpperCase(),
            style: { color: "#fff" },
          }}
        />        */}

        {/* MAIN CONTAINER */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: 'silver',
            // borderBottomLeftRadius: 15,
            // borderBottomRightRadius: 15,
            overflow: 'hidden',
          }}>
          <View
            style={{
              position: 'absolute',
              top: 14,
              right: 1,
              flexDirection: 'row',
              height: 52,
              width: width * 0.7,
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              alignContent: 'center',
              paddingLeft: 5,
              paddingRight: 5,
              zIndex: 100,
            }}>
            {this._renderOrderPickerRow()}
          </View>
         {this._renderMapView()}

          <View
            style={{
              padding: 10,
              position: 'absolute', //use absolute position to show button on top of the map
              //top: '100%', //for center align
              width: width * 0.97,
              height: 102,
              bottom: 6,
              overflow: 'hidden',
              backgroundColor: mainBlue,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: 'white',
              alignSelf: 'center', //for align to right
            }}>
            {/* INNER ROW   */}
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                overflow: 'hidden',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{width: '16%'}}>
                {this._renderCornerLogoImage()}
              </View>

              <View
                style={{
                  minWidth: '40%',
                  overflow: 'hidden',
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{flex: 1, marginLeft: 4}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 24,
                      fontFamily: Constants.fontFamily,
                      fontWeight: 'bold',
                    }}>
                    {this.getTimeToDeliveryInMinutes() + ' Mins'}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontFamily: Constants.fontFamily,
                      fontSize: 16,
                    }}>
                    {this.state.orderStageText}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: '44%',
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={{margin: 8}}
                  onPress={() => {
                    try {
                      EventRegister.emit('showSpinner');
                      if (this.state.selectedCustomerOrderId != -1) {
                        this._updateSelectedNetwork(
                          this.state.selectedCustomerOrder.networkId,
                        );
                        this._openFullOrderModal();
                      }
                    } catch (error) {
                      console.debug(error);
                    } finally {
                      EventRegister.emit('hideSpinner');
                    }
                  }}>
                  <FastImage
                    source={Images.NewAppReskinIcon.Info}
                    style={{
                      alignSelf: 'center',
                      width: 34,
                      height: 34,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: Constants.fontFamily,
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    {'Info'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{margin: 8}}
                  //onPress={() => this._openFullDriverModal()}
                  onPress={() =>
                    this.props.updateModalState('chatModal', true)
                  }>
                  <FastImage
                    source={Images.NewAppReskinIcon.Chat}
                    style={{
                      alignSelf: 'center',
                      width: 34,
                      height: 34,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: Constants.fontFamily,
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    {'Chat'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{margin: 8}}
                  onPress={() => this._openFullDriverModal()}
                  //onPress={() => this.props.updateModalState("chatModal", true)}
                >
                  <FastImage
                    source={Images.HelmetWhite1}
                    style={{
                      alignSelf: 'center',
                      width: 32,
                      height: 32,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 'bold',
                      fontFamily: Constants.fontFamily,
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    {'Driver'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TWO PERCENT BASED HOLDERS */}
            </View>
          </View>

          {/* TOP LEFT ICON */}
          <View
            style={{
              marginTop: 1,
              marginLeft: 1,
              position: 'absolute', //use absolute position to show button on top of the map
              //top: '100%', //for center align
              top: 14,
              left: 2,
              alignSelf: 'flex-end', //for align to right
            }}>
            <TouchableOpacity
              style={{}}
              onPress={async () => {
                try {
                  if (typeof this.state.selectedCustomerOrder !== 'undefined') {
                    EventRegister.emit('showSpinner');
                    await this._findMarker(
                      this.state.selectedCustomerOrder.driver.location,
                    );
                  }
                } catch (error) {
                  console.debug(error);
                } finally {
                  EventRegister.emit('hideSpinner');
                }
              }}>
              <FastImage
                source={Images.InfoQuestion6}
                style={{maxHeight: 50, maxWidth: 50, height: 50, width: 50}}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* MODALS */}
        {/* FULL ORDER MODAL */}
        {this._renderFullOrderDisplayModal()}
        {this._renderFullDriverDisplayModal()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    location: state.location,
    user: state.user,
  };
};

const mapDispatchToProps = dispatch => {
  const modalActions = require('@redux/ModalsRedux');
  return {
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(TrackOrderScreen));
