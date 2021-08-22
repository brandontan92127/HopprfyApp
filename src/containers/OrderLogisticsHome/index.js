import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
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
} from 'react-native';
import {
  Button,
  ShopButton,
  CashOutModal,
  PermissionsList,
  InboundPermissionsModal,
} from '@components';
import {List, ListItem, Header, Icon, Divider} from 'react-native-elements';
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  GlobalStyle,
} from '@common';
import {Images} from '@common';
import {toast} from '@app/Omni';
import {connect} from 'react-redux';
import HopprWorker from '../../services/HopprWorker';
import GeoWorker from '../../services/GeoWorker';
import MapWorker from '../../services/MapWorker';
import LayoutHelper from '../../services/LayoutHelper';
import {showMessage, hideMessage} from 'react-native-flash-message';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Marker} from 'react-native-maps';

//SETUPS VARS
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 51.5397824;
const LONGITUDE = -0.1435601;
const LATITUDE_DELTA = 0.0405;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Device = require('react-native-device-detection');
const isTabletResult = LayoutHelper.isTabletOrPhone(
  Device.pixelDensity,
  height,
  width,
);
const mapSize = isTabletResult === 'TABLET' ? 340 : 130;

//STYLES
const styles = StyleSheet.create({
  //TABS
  tabView: {
    minHeight: height / 5,
    marginTop: 3,
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
    flex: 0.32,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  bottomView: {
    height: 50,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f7f9',
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: 'center',
  },
});

const getDefaultState = () => {
  return {
    refreshing: false,
    logisticsPermissionsAndNetworks: [], //all perms and their brand nets
    networksWithLogisticsAccess: [], //all extracted nets from the perms
    selectedNetwork: undefined,
    selectedNetworkId: undefined,
    selectedNetworkLogoPayload: Images.YourBrandHere3,
    tabIndex: 0,
    //drivers, stores, orders + schedules
    networkStores: [], //BI stores
    networkDrivers: [], //BI drivers
    filteredAllOtherStatusDrivers: [],
    filteredInboundDrivers: [],
    filteredInboundDriversJustMyStore: [],
    selectedStore: undefined,
    selectedStoreId: undefined,
    currentStoreAddress: 'None',
    cuurentStoreName: 'None',
    entireNetworkOrderItineries: [],
    activeOrderItineriesForStore: [],
    currentDestinations: [], // this is delivery dest.
    refreshAllTimerId: -1,
  };
};

class OrderLogisticsHome extends Component {
  constructor(props) {
    super(props);

    this.state = getDefaultState();

    console.debug('In OrderLogistics home');
  }

  handleClickTab(tabIndex) {
    this.setState({tabIndex: tabIndex});
  }

  /** this gets ALL orders on the nework now! */
  _getFullNetworkOrderItinaries = async networkId => {
    let inboundActive = await HopprWorker.getOrderItineraryByNetwork(networkId);
    this.setState({entireNetworkOrderItineries: inboundActive});

    //filter inbound active for store
    console.debug('test');
    await this._getAddressesForDeliveryDestinations(inboundActive);
  };

  _getMyLogisticsPermissions = async () => {
    let logisticsPerms = await HopprWorker.getAllNetworksAndPermissions(
      this.props.user.user.id,
      'OrderLogistics',
    );

    let networksInPerms = [];
    logisticsPerms.map(x => {
      networksInPerms.push(x.network);
    });

    this.setState({
      logisticsPermissions: logisticsPerms,
      networksWithLogisticsAccess: networksInPerms,
    });

    //set default first item if there is one
    if (networksInPerms.length > 0) {
      this.setState({
        selectedNetwork: networksInPerms[0],
        selectedNetworkId: networksInPerms[0].networkId,
      });

      this._setNetworkUrl(networksInPerms[0].storeLogoUrl);

      //get stores if it's unassigned and in default state (i.e. on first load)
      //get drivers too
      if (typeof this.state.selectedStore == 'undefined') {
        await this._getActiveStoresForNetwork(networksInPerms[0].networkId);
        await this._getActiveDriversForNetwork(networksInPerms[0].networkId);
        //get current active orders for network, inc schedules etc
        await this._getFullNetworkOrderItinaries(networksInPerms[0].networkId);
      }
    }
  };

  load = async () => {
    //test code
    //let testReuslt = await HopprWorker.getLastLogisticsOrderRequest(this.props.user.user.driverId);

    console.debug('Test');
    await MapWorker.requestLocationPermission();
    await this._getMyLogisticsPermissions();
    //set timers for refresh
    let refreshAllTimerId = setInterval(async () => {
      toast('fired timer');
      if (typeof this.state.selectedNetworkId !== 'undefined') {
        try {
          await this._getActiveStoresForNetwork(this.state.selectedNetworkId);
          //get current active drivers for network
          await this._getActiveDriversForNetwork(this.state.selectedNetworkId);
          //get current active orders for network, inc schedules etc
          await this._getFullNetworkOrderItinaries(
            this.state.selectedNetworkId,
          );
          toast('completed time routine');
        } catch (error) {
          console.debug("Couldn't load logisticshome");
          console.debug(error);
        }
      }
    }, 5000);
    this.setState({refreshAllTimerId: refreshAllTimerId});
  };

  unload = async () => {
    //clear timer
    if (this.state.refreshAllTimerId != -1) {
      clearInterval(this.state.refreshAllTimerId);
      toast('UNLOADED');
    }

    this.setState(getDefaultState());
  };

  componentWillUnmount = () => {
    this.unsubscribeWillFocus();
    this.unsubscribeLoseFocus();
  };

  componentDidMount = async () => {
    console.debug('in logistics home');

    console.debug('in logistics home');
    this.unsubscribeWillFocus = this.props.navigation.addListener(
      'willFocus',
      this.load,
    );
    this.unsubscribeLoseFocus = this.props.navigation.addListener(
      'willBlur',
      this.unload,
    );
    await this.load();

    showMessage({
      message: 'This is the logistics view',
      autoHide: true,
      position: 'bottom',
      description: 'Create orders for your stores and assign them to drivers!',
      backgroundColor: 'blue', // background color
      color: 'white', // text color
    });
  };

  _getAddressesForDeliveryDestinations = async listOfIteneraries => {
    let postcodesAndIds = [];
    for (const itenerary of listOfIteneraries) {
      let deliveryDestsForItineray = itenerary.orderDeliveryDestinations;
      for (const dest of deliveryDestsForItineray) {
        try {
          let thisAddress = await GeoWorker.reverseGeocode(
            dest.location.lat,
            dest.location.long,
          );

          postcodesAndIds.push({
            _id: dest._id,
            lat: dest.location.lat,
            lng: dest.location.long,
            orderDeliveryItineraryId: dest.orderDeliveryItineraryId,
            driverId: dest.assignedDriverId,
            text: thisAddress.postalCode,
          });
          console.debug('pushed');
        } catch (error) {
          toast("Couldn't get postcode for destiation");
        }
      }
    }

    console.debug("Shouldn't get here until completed");
    this.setState({currentDestinations: postcodesAndIds});
  };

  _setNetworkUrl = newImageUrl => {
    let baseURl = Config.NetworkImageBaseUrl;
    let comboUrl = baseURl + newImageUrl;
    this.setState({selectedNetworkLogoPayload: {uri: comboUrl}});
  };

  _changeNetworkPickerValue = async itemValue => {
    let selNet = this.state.networksWithLogisticsAccess.find(
      x => x.networkId == itemValue,
    );
    this.setState({selectedNetworkId: itemValue, selectedNetwork: selNet});
    this._setNetworkUrl(selNet.storeLogoUrl);
    //get all open stores for network
    await this._getActiveStoresForNetwork(itemValue);
    //get current active drivers for network
    await this._getActiveDriversForNetwork(itemValue);
    //get current active orders for network, inc schedules etc
    await this._getFullNetworkOrderItinaries(this.state.selectedNetworkId);
  };

  _changeStorePickerValue = async itemValue => {
    console.debug('stop');
    if (typeof itemValue !== 'undefined') {
      let selStore = this.state.networkStores.find(x => x._id == itemValue);
      this.setState({selectedStore: selStore, selectedStoreId: itemValue});

      //set current store address
      let currentStoreAddress = await GeoWorker.reverseGeocode(
        selStore.location.lat,
        selStore.location.long,
      );

      console.debug('deon');

      //do filtering now to split the whole network orders for the store
      //itemValue
      let filteredItineraries = this.state.entireNetworkOrderItineries.filter(
        x => x.storeId == itemValue,
      );
      this.setState({
        currentStoreName: selStore.markerDescription,
        currentStoreAddress: currentStoreAddress.formattedAddress,
        activeOrderItineriesForStore: filteredItineraries,
      });

      //filter drivers to just the ones in the stores itinerary
      let newFilteredDriversInboundForStore = [];
      filteredItineraries.map(eachInin => {
        eachInin.orderDeliveryDestinations.map(eachDest => {
          console.debug('checking driver');
          //try and match driver Id
          let datDriver = this.state.networkDrivers.find(
            x => x._id == eachDest.assignedDriverId,
          );
          console.debug('got driver');
          //now check if it's in array if not add him
          if (!newFilteredDriversInboundForStore.includes(datDriver)) {
            newFilteredDriversInboundForStore.push(datDriver);
          }
        });
      });

      this.setState({
        filteredInboundDriversJustMyStore: newFilteredDriversInboundForStore,
      });
    }
  };

  /**This gets BI stores, not full models */
  _getActiveStoresForNetwork = async selectedNetId => {
    let biStores = await HopprWorker.getBIStores(selectedNetId);
    this.setState({networkStores: biStores});

    //if there's a first store, set it as default
    if (biStores.length > 0) {
      this._changeStorePickerValue(biStores[0]._id);
    }
  };

  /**This gets BI model, not full model */
  _getActiveDriversForNetwork = async selectedNetId => {
    let biDrivers = await HopprWorker.getBIDrivers(selectedNetId);

    //filter into groups needed
    let inboundDrivers = biDrivers.filter(
      x =>
        x.state == 'ON_DELIVERY_ORDER_PICKUP' ||
        x.state == 'ON_DELIVERY_OUT_FOR_DELIVERY',
    );
    //this should just be ONLINE drivers
    let otherDrivers = biDrivers.filter(
      x =>
        x.state != 'ON_DELIVERY_ORDER_PICKUP' ||
        x.state == 'ON_DELIVERY_OUT_FOR_DELIVERY',
    );

    this.setState({
      networkDrivers: biDrivers,
      filteredInboundDrivers: inboundDrivers,
      filteredAllOtherStatusDrivers: otherDrivers,
    });
  };

  _renderActiveDriverListViewRow = ({item}) => {
    console.debug('in driver view');

    var desitnationsGoingto = this.state.currentDestinations.filter(
      x => x.driverId == item._id,
    );
    let goingTo = 'None';
    let driversString = '';
    let storeString = 'None';

    if (desitnationsGoingto.length > 0) {
      goingTo = '';
      desitnationsGoingto.map(aDest => {
        console.debug('stop');
        goingTo += aDest.text + ' | ';

        if (this.state.entireNetworkOrderItineries.length > 0) {
          let iteneraryForDest = this.state.entireNetworkOrderItineries.find(
            x => x._id == aDest.orderDeliveryItineraryId,
          );
          let storeForItinerary = this.state.networkStores.find(
            x => x._id == iteneraryForDest.storeId,
          );
          storeString = storeForItinerary.markerDescription;
        }
      });
    }

    //generate image
    var driverImage = Images.DeliveryDriver2;
    if (this.state.tabIndex % 2 == 0) {
      driverImage = Images.DeliveryDriver4;
    }

    return (
      <ListItem
        leftIconOnPress={() => toast('Pressed left icon')}
        titleNumberOfLines={2}
        subtitleNumberOfLines={4}
        title={item.firstName + ' ' + item.lastName + '\n' + item.email}
        subtitle={
          item.state.replace(/_/g, ' ') +
          '\n' +
          'Going to: ' +
          goingTo +
          '\n' +
          'Picking up from: ' +
          storeString
        }
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 120,
              height: 100,
              width: 100,
              maxWidth: 120,
              padding: 5,
              //   width: undefined
            }}
            source={driverImage}
            resizeMode="contain"
          />
        }
        hideChevron={false}
        onPress={() => toast('Test')}
        onLongPress={() => toast('Test')}
      />
    );
  };

  /**renders list of OrderDeliveryItinerary */
  _renderInboundOrderItineraryListViewRow = (anImage, {item}) => {
    let deliveryDestsForItineray = item.orderDeliveryDestinations;
    let destString = '';
    let driversString = '';

    deliveryDestsForItineray.map(dest => {
      let addressInfo = this.state.currentDestinations.find(
        x => x._id == dest._id,
      );
      if (typeof addressInfo !== 'undefined') {
        destString += addressInfo.text + ' | ';
      } else {
        destString += 'Unknown';
      }

      let driverFordest = this.state.networkDrivers.find(
        x => x._id == dest.assignedDriverId,
      );
      driversString +=
        driverFordest.firstName + ' ' + driverFordest.lastName + ' | ';
    });

    let goingToStore = 'None';
    if (this.state.networkStores.length > 0) {
      let daStore = this.state.networkStores.find(x => x._id == item.storeId);
      goingToStore = daStore.markerDescription;
    }

    let orderString = 'Itinerary: #' + item._id.substring(0, 4);
    let titleString = 'Destinations: ' + deliveryDestsForItineray.length;
    return (
      <ListItem
        subtitleNumberOfLines={3}
        leftIconOnPress={() => toast('Pressed left icon')}
        title={
          orderString +
          ', ' +
          titleString +
          '\n' +
          'Picking up from: ' +
          goingToStore
        }
        titleNumberOfLines={3}
        subtitle={
          'Going to: ' + destString + '\n' + 'Drivers: ' + driversString
        }
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 120,
              height: 100,
              width: 100,
              maxWidth: 120,
              padding: 5,
              //   width: undefined
            }}
            source={anImage}
            resizeMode="contain"
          />
        }
        hideChevron={false}
        onPress={() => toast('Test')}
        onLongPress={() => toast('Test')}
      />
    );
  };

  /**Shows inbound drivers to a store in first order phase on the network */
  _renderActiveDriverListView = () => {
    console.debug('stop');
    if (this.state.filteredInboundDrivers.length > 0) {
      console.debug('stop again');
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.filteredInboundDrivers}
            renderItem={this._renderActiveDriverListViewRow}
            keyExtractor={item => item._id}
            //onRefresh={() => this.pullToRefresh()}
            //refreshing={this.state.refreshing}
          />
        </List>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.DeliveryDriver5}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 4,
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {'There were no drivers to show!'}
          </Text>
        </View>
      );
    }
  };

  /**Shows inbound drivers to a store in first order phase on the network */
  _renderAllOtherDriverListView = () => {
    console.debug('stop');
    if (this.state.filteredAllOtherStatusDrivers.length > 0) {
      console.debug('stop again');
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.filteredAllOtherStatusDrivers}
            renderItem={this._renderActiveDriverListViewRow}
            keyExtractor={item => item._id}
            //onRefresh={() => this.pullToRefresh()}
            //refreshing={this.state.refreshing}
          />
        </List>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.DeliveryDriver1}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 4,
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {'There were no drivers to show!'}
          </Text>
        </View>
      );
    }
  };
  /**Shows inbound drivers to a store in first order phase on the network */
  _renderJustDriversInboundToMyStoreListView = () => {
    console.debug('stop');
    if (this.state.filteredInboundDriversJustMyStore.length > 0) {
      console.debug('stop again');
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.filteredInboundDriversJustMyStore}
            renderItem={this._renderActiveDriverListViewRow}
            keyExtractor={item => item._id}
            //onRefresh={() => this.pullToRefresh()}
            //refreshing={this.state.refreshing}
          />
        </List>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.questionMark}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 4,
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {'There were no drivers to show!'}
          </Text>
        </View>
      );
    }
  };

  /**Shows itinerary listview - inbound orders to store currently */
  _renderInboundOrderItineraryListView = () => {
    if (this.state.activeOrderItineriesForStore.length > 0) {
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.activeOrderItineriesForStore}
            renderItem={item =>
              this._renderInboundOrderItineraryListViewRow(Images.MapPin4, item)
            }
            keyExtractor={item => item._id}
            //onRefresh={() => this.pullToRefresh()}
            //refreshing={this.state.refreshing}
          />
        </List>
      );
    } else {
      return (
        <View style={{flex: 1}}>
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
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {'There were no itineraries to show!'}
          </Text>
        </View>
      );
    }
  };

  _renderEntireNetworkOrderItineraryListView = () => {
    if (this.state.entireNetworkOrderItineries.length > 0) {
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.entireNetworkOrderItineries}
            renderItem={item =>
              this._renderInboundOrderItineraryListViewRow(Images.MapPin1, item)
            }
            keyExtractor={item => item._id}
            //onRefresh={() => this.pullToRefresh()}
            //refreshing={this.state.refreshing}
          />
        </List>
      );
    } else {
      return (
        <View style={{flex: 1}}>
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
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {'There were no itineraries to show!'}
          </Text>
        </View>
      );
    }
  };

  _renderStorePickerRow = () => {
    if (
      this.state.networkStores.length > 0
      //&& typeof this.state.selectedStore !== "undefined"
    ) {
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 3,
            borderRadius: 20,
            padding: 4,
            margin: 5,
            borderColor: GlobalStyle.primaryColorDark.color,
            maxHeight: 50,
            height: 50,
          }}>
          <Picker
            style={{
              // alignSelf: "flex-end",
              // justifyContent: "center",
              flex: 1,
              margin: 2,
              paddingLeft: 18,
              borderWidth: 3,
              borderRadius: 20,
              color: 'black',
              maxHeight: 50,
              height: 50,
              // width: undefined,
              color: 'black',
            }}
            mode="dropdown"
            selectedValue={this.state.selectedStoreId}
            onValueChange={(itemValue, itemIndex) => {
              console.debug('lets do it');
              this._changeStorePickerValue(itemValue);
            }}>
            {this.state.networkStores.map((item, index) => {
              return (
                <Picker.Item
                  label={item.markerDescription}
                  value={item._id}
                  key={index}
                />
              );
            })}
          </Picker>
        </View>
      );
    }
  };

  _renderNetworkPickerRow = () => {
    if (
      this.state.networksWithLogisticsAccess.length > 0 &&
      typeof this.state.selectedNetwork !== 'undefined'
    ) {
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 3,
            borderRadius: 20,
            padding: 5,
            margin: 5,
            borderColor: 'grey',
            maxHeight: 50,
            height: 50,
          }}>
          <Picker
            style={{
              // alignSelf: "flex-end",
              // justifyContent: "center",
              flex: 1,
              margin: 2,
              paddingLeft: 18,
              borderWidth: 2,
              borderRadius: 15,
              color: 'black',
              maxHeight: 50,
              height: 50,
              // width: undefined,
              color: 'black',
            }}
            mode="dropdown"
            selectedValue={this.state.selectedNetworkId}
            onValueChange={async (itemValue, itemIndex) =>
              await this._changeNetworkPickerValue(itemValue)
            }>
            {this.state.networksWithLogisticsAccess.map((item, index) => {
              return (
                <Picker.Item
                  label={item.storeName}
                  value={item.networkId}
                  key={index}
                />
              );
            })}
          </Picker>
        </View>
      );
    }
  };

  _renderTabView = () => {
    const {
      theme: {
        colors: {background, text, lineColor},
      },
    } = this.props;

    // let background = "white";
    // let text = "black";
    // let lineColor = "silver";

    const screenWidth = Dimensions.get('window').width;

    return (
      <View
        style={[
          //styles.tabView,
          {flex: 1, paddingBottom: 10, backgroundColor: 'white'},
        ]}>
        {this.state.tabIndex === 0 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: 'flex-start',
            }}>
            {this._renderEntireNetworkOrderItineraryListView()}
          </View>
        )}
        {this.state.tabIndex === 1 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: 'flex-start',
            }}>
            {this._renderInboundOrderItineraryListView()}
          </View>
        )}
        {this.state.tabIndex === 2 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: 'flex-start',
            }}>
            {this._renderJustDriversInboundToMyStoreListView()}
          </View>
        )}
        {this.state.tabIndex === 3 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: 'flex-start',
            }}>
            {/* {this._renderInboundOrderItineraryListView()} */}

            {this._renderActiveDriverListView()}
          </View>
        )}
        {this.state.tabIndex === 4 && (
          //ORDERS INBOUND TO STORE
          <View
            style={{
              flex: 1,
              alignContent: 'flex-start',
            }}>
            {this._renderAllOtherDriverListView()}
          </View>
        )}
      </View>
    );
  };

  _renderMapView = () => {
    if (
      typeof this.state.selectedStore !== 'undefined' &&
      typeof this.state.selectedStore.location !== 'undefined'
    ) {
      return (
        <View
          style={{
            flex: 1,
            minHeight: mapSize,
            maxHeight: mapSize,
            height: mapSize,
            paddingLeft: 30,
            paddingRight: 30,
            padding: 10,
            margin: 10,
            paddingTop: 3,
            marginTop: 3,
            borderWidth: 1,
            borderColor: 'lightblue',
            borderRadius: 15,
            marginBottom: 4,
            paddingBottom: 4,
            overflow: 'hidden',
          }}>
          <MapView
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{...StyleSheet.absoluteFillObject}}
            initialRegion={{
              latitude: this.state.selectedStore.location.lat,
              longitude: this.state.selectedStore.location.long,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            <Marker
              coordinate={{
                latitude: this.state.selectedStore.location.lat,
                longitude: this.state.selectedStore.location.long,
              }}
              // image={Images.MapIconStore}
              description={'The Selected Store'}
              title={this.state.cuurentStoreName}>
              <Image
                source={Images.MapIconStore8}
                style={{width: 50, maxWidth: 50, height: 50}}
              />
            </Marker>

            {this.state.networkDrivers
              .filter(x => x.state.toUpperCase() === 'ONLINE')
              .map(marker => (
                <Marker.Animated
                  description={marker.state.replace(/_/g, ' ')}
                  title={
                    marker.firstName +
                    ' ' +
                    marker.lastName +
                    ' | ' +
                    marker.email
                  }
                  coordinate={{
                    latitude: marker.location.lat,
                    longitude: marker.location.long,
                  }}>
                  <Image
                    source={Images.MapIconDriver}
                    style={{width: 45, height: 45}}
                  />
                </Marker.Animated>
              ))}

            {/* THIS IS ON ORDER DRIVERS */}
            {this.state.networkDrivers
              .filter(x => x.state.toUpperCase() !== 'ONLINE')
              .map(marker => (
                <Marker.Animated
                  description={marker.state.replace(/_/g, ' ')}
                  title={
                    marker.firstName +
                    ' ' +
                    marker.lastName +
                    ' | ' +
                    marker.email
                  }
                  coordinate={{
                    latitude: marker.location.lat,
                    longitude: marker.location.long,
                  }}>
                  <Image
                    source={Images.DeliveryDriver2}
                    style={{width: 45, height: 45}}
                  />
                </Marker.Animated>
              ))}

            {this.state.currentDestinations.map(marker => (
              <Marker.Animated
                description={
                  '#' + marker.orderDeliveryItineraryId.substring(0, 4)
                }
                title={marker.text}
                coordinate={{
                  latitude: marker.lat,
                  longitude: marker.lng,
                }}>
                <Image
                  source={Images.TabDestIcon1}
                  style={{width: 45, height: 45}}
                />
              </Marker.Animated>
            ))}
          </MapView>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            minHeight: mapSize,
            maxHeight: mapSize,
            height: mapSize,
            padding: 10,
            margin: 10,
            paddingTop: 3,
            marginTop: 3,
            borderWidth: 1,
            borderColor: 'lightblue',
            borderRadius: 15,
            marginBottom: 4,
            paddingBottom: 4,
            overflow: 'hidden',
          }}>
          <MapView
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{...StyleSheet.absoluteFillObject}}
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

  _renderStorePickerElementIfStoresPopulated = () => {
    if (this.state.networkStores.length > 0) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 36,
              height: 36,
              width: 36,
              maxWidth: 36,
              padding: 5,
            }}
            source={Images.MapIconStore7}
            resizeMode="contain"
          />
          {this._renderStorePickerRow()}
        </View>
      );
    }

    return null;
  };

  render = () => {
    const {
      theme: {
        colors: {background, text, lineColor},
      },
    } = this.props;

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this._renderMapView()}
        {/* NETWORK LOGO IMAGE */}
        <View
          style={{
            alignContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 10,
          }}>
          <Text style={{textAlign: 'center', color: 'black', fontSize: 14}}>
            {this.state.currentStoreName}
          </Text>
          {/* CURRENT STORE LOCATION TEXT */}
          <Text style={{textAlign: 'center', color: 'grey', fontSize: 12}}>
            {'Location: ' + this.state.currentStoreAddress}
          </Text>
          {/* <Image
                    style={{
                        flex: 1,
                        maxHeight: 60,
                        minHeight: 60,
                        height: 60,
                        //width: undefined,
                        //maxWidth: undefined,
                        padding: 5
                    }}
                    source={{ uri: this.state.selectedNetworkLogoUrl }}
                    resizeMode="contain"
                /> */}
        </View>

        <View style={{flex: 1}}>
          {/* PICKERS ROW */}
          <View
            style={{
              flex: 1,
              border: 1,
              borderColor: 'black',
              flexDirection: 'row',
              paddingTop: 2,
              height: 100,
              maxHeight: 100,
              minHeight: 100,
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 40,
                  height: 40,
                  width: 40,
                  maxWidth: 40,
                  padding: 5,
                }}
                source={this.state.selectedNetworkLogoPayload}
                resizeMode="contain"
              />
              {this._renderNetworkPickerRow()}
            </View>
            {this._renderStorePickerElementIfStoresPopulated()}
          </View>
          {/* LABEL  */}
          <View
            style={{
              paddingLeft: 35,
              paddingRight: 35,
              paddingBottom: 4,
            }}>
            <Text
              style={{
                borderWidth: 1,
                paddingLeft: 35,
                paddingRight: 35,
                borderColor: GlobalStyle.primaryColorDark.color,
                borderRadius: 15,
                textShadowOffset: {
                  width: 2,
                  height: 2,
                },
                textShadowColor: 'black',
                textShadowRadius: 6,
                color: GlobalStyle.primaryColorDark.color,
                textAlign: 'center',
                fontSize: 20,
              }}>
              {'Logistics:'}
            </Text>
          </View>
          <Divider
            style={{
              backgroundColor: GlobalStyle.primaryColorDark.color,
              padding: 4,
              borderRadius: 8,
              marginLeft: 10,
              marginRight: 10,
              marginBottom: 10,
            }}
          />
          {/* TAB HEADERS */}
          <View style={[{paddingBottom: 3, backgroundColor: 'white'}]}>
            <View
              style={[
                styles.tabButton,
                {backgroundColor: lineColor},
                {borderTopColor: lineColor},
                {borderBottomColor: lineColor},
                Constants.RTL && {flexDirection: 'row-reverse'},
              ]}>
              <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
                <Button
                  type="tabimage"
                  icon={Images.GetNearby2}
                  textStyle={[styles.textTab, {color: text}]}
                  selectedStyle={{color: text}}
                  text={'Orders Brand:'}
                  onPress={() => this.handleClickTab(0)}
                  selected={this.state.tabIndex == 0}
                />
              </View>
              <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
                <Button
                  type="tabimage"
                  icon={Images.GenerateHud2}
                  textStyle={[styles.textTab, {color: text}]}
                  selectedStyle={{color: text}}
                  text={'This Store:'}
                  onPress={() => this.handleClickTab(1)}
                  selected={this.state.tabIndex == 1}
                />
              </View>
              <View style={{backgroundColor: 'white'}}>
                <Divider
                  style={{
                    width: 8,
                    maxWidth: 8,
                    height: 50,
                    maxHeight: 50,
                    flex: 1,
                    backgroundColor: 'grey',
                    padding: 0,
                    margin: 0,
                    borderRadius: 8,
                  }}
                />
              </View>
              <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
                <Button
                  type="tabimage"
                  icon={Images.DeliveryDriver4}
                  textStyle={[styles.textTab, {color: text}]}
                  selectedStyle={{color: text}}
                  text={'Drivers Inbound:'}
                  onPress={() => this.handleClickTab(2)}
                  selected={this.state.tabIndex == 2}
                />
              </View>
              <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
                <Button
                  type="tabimage"
                  icon={Images.DeliveryDriver2}
                  textStyle={[styles.textTab, {color: text}]}
                  selectedStyle={{color: text}}
                  text={'Working:'}
                  onPress={() => this.handleClickTab(3)}
                  selected={this.state.tabIndex == 3}
                />
              </View>
              <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
                <Button
                  type="tabimage"
                  icon={Images.MapIconDriver6}
                  text={'Available:'}
                  defaultSource={Images.MapIconDriver6}
                  textStyle={[styles.textTab, {color: text}]}
                  selectedStyle={{color: text}}
                  onPress={() => this.handleClickTab(4)}
                  selected={this.state.tabIndex == 4}
                />
              </View>
            </View>
          </View>
          {this._renderTabView()}
          {/* <ScrollView> */}
          {/* TABS */}

          {/* </ScrollView> */}
        </View>
      </View>
    );
  };
}

const mapStateToProps = state => {
  return {
    user: state.user,
    modalsArray: state.modals.modalsArray,
  };
};

const mapDispatchToProps = dispatch => {
  const userActions = require('@redux/UserRedux');
  const modalActions = require('@redux/ModalsRedux');
  return {
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
)(withTheme(OrderLogisticsHome));
