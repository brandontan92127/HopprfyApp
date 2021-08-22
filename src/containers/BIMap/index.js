/** @format */
import React, {Component} from 'react';
import RandomMarkerHelper from '../../helper/RandomMarkerHelper';
import {
  Image,
  Platform,
  View,
  Dimensions,
  I18nManager,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
  FlatList,
  SectionList,
  TouchableHighlight,
  Alert,
  Picker,
  TouchableOpacity,
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import {connect} from 'react-redux';
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker,
  Button,
  FullOrderDisplayModal,
  DriverProfileModal,
} from '@components';
import {
  Languages,
  Color,
  Constants,
  Tools,
  Config,
  withTheme,
  Images,
} from '@common';
import {getNotification, toast} from '@app/Omni';
import _ from 'lodash';
import HopprWorker from '../../services/HopprWorker';
import Modal from 'react-native-modalbox';
import {
  Button as ElButton,
  List,
  ListItem,
  Header,
  Icon,
  Divider,
} from 'react-native-elements';
import MapView, {
  ProviderPropType,
  Marker,
  AnimatedRegion,
  PROVIDER_GOOGLE,
  UrlTile,
  Callout,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {EventRegister} from 'react-native-event-listeners';
import RNPickerSelect from 'react-native-picker-select';
import {setIntervalAsync} from 'set-interval-async/dynamic';
import {clearIntervalAsync} from 'set-interval-async';
import GeoWorker from '../../services/GeoWorker';
import DoubleClick from 'react-native-double-tap';
import {showMessage, hideMessage} from 'react-native-flash-message';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 51.5397691;
const LONGITUDE = -0.2175712;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    //justifyContent: "flex-end",
    //alignItems: "center",
    position: 'absolute',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  storeFrontimageStyle: {
    height: 160,
    minHeight: 160,
    flex: 1,
    width: null,
  },
  weAreOpenimageStyle: {
    height: 40,
    // flex: 1,
    // width: null
  },
  whereIsItImageStyle: {
    height: 30,
    flex: 1,
    width: null,
  },
  headline: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: 'red',
    paddingTop: 10,
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
  tabView: {
    minHeight: height,
    marginTop: 3,
  },
});

const getDefaultState = () => {
  return {
    tracksViewChanges: true,
    tabIndex: 0,
    tabViewModalOpen: false,
    biMapTimers: null,
    isLoading: true,
    myNetworks: [],
    selectedNetworkId: undefined,
    selectedNetwork: undefined,
    fullOrderModalOpenClosed: false,
    fullDriverModalOpenClosed: false,
    selectedOrder: undefined,
    selectedOrderAddress: undefined,
    selectedDriver: undefined,
    biStores: [],
    biOrders: [],
    biDrivers: [],
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
    }),
    driverImgUrl: Images.MapIconDriver,
    storeImgUrl: Images.MapIconStore12,
  };
};

/**Shows user transactions / external account payments */
class BIMap extends Component {
  constructor(props) {
    super(props);

    this.hasLoaded = false;
    console.debug('in BI map');
    this.state = getDefaultState();

    console.debug('In BIMap ');
  }

  /**Hook into this on load */
  _enableSingleUserChatMode = () => {
    EventRegister.emit('setSingleUserChatMode', true);
  };

  /**Hook into this on close */
  _disableSingleUserChatMode = () => {
    EventRegister.emit('setSingleUserChatMode', false);
  };

  _setNewSelectedChatterIdAndOpenModal = newChatterId => {
    EventRegister.emit('setLatestChatterId', newChatterId);
    this.closeTabViewModal();
  };

  getStoreMarkers = async () => {
    let stores = await HopprWorker.getBIStores(this.state.selectedNetworkId);
    if (typeof stores !== 'undefined') this.setState({biStores: stores});
  };

  getOrderMarkers = async () => {
    let activeOrders = await HopprWorker.getBIOrders(
      this.state.selectedNetworkId,
    );
    if (typeof activeOrders !== 'undefined')
      this.setState({biOrders: activeOrders});
  };

  getDriverMarkers = async () => {
    let drivers = await HopprWorker.getBIDrivers(this.state.selectedNetworkId);

    if (typeof drivers !== 'undefined') this.setState({biDrivers: drivers});
  };

  handleClickTab(tabIndex) {
    this.setState({tabIndex: tabIndex});
  }

  openTabViewModal = () => {
    this.setState({tabViewModalOpen: true});
  };

  closeTabViewModal = () => {
    this.setState({tabViewModalOpen: false});
  };

  //this is for list
  renderRow = ({item}) => {
    let imgToShow = Images.DeliveryDestination1;
    return (
      <ListItem
        roundAvatar
        onPress={() => this._getFullOrder_SetState_ShowModal(item._id)}
        //chat shortcuts
        rightIcon={
          <View style={{flexDirection: 'column'}}>
            {/* ICON 1 */}
            <View style={{alignContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this._setNewSelectedChatterIdAndOpenModal(
                    item.customerUserId,
                  );
                }}>
                <Image
                  style={{
                    maxHeight: 34,
                    height: 34,
                    width: 34,
                    maxWidth: 34,
                  }}
                  source={Images.ChatCustomer2}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontStyle: 'italic',
                  color: 'grey',
                  fontSize: 10,
                  textAlign: 'center',
                }}>
                {'Chat Shopper'}
              </Text>
            </View>

            {/* ICON 2 */}
            <View style={{alignContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this._setNewSelectedChatterIdAndOpenModal(item.driverUserId);
                }}>
                <Image
                  style={{
                    maxHeight: 34,
                    height: 34,
                    width: 34,
                    maxWidth: 34,
                  }}
                  source={Images.DeliveryDriver3}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontStyle: 'italic',
                  color: 'grey',
                  fontSize: 10,
                  textAlign: 'center',
                }}>
                {'Chat Driver'}
              </Text>
            </View>

            {/* ICON 3 */}
            <View style={{alignContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this._setNewSelectedChatterIdAndOpenModal(item.storeUserId);
                }}>
                <Image
                  style={{
                    maxHeight: 34,
                    height: 34,
                    width: 34,
                    maxWidth: 34,
                  }}
                  source={Images.MapIconStore11}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontStyle: 'italic',
                  color: 'grey',
                  fontSize: 10,
                  textAlign: 'center',
                }}>
                {'Chat Store'}
              </Text>
            </View>
          </View>
        }
        subtitleNumberOfLines={6}
        titleNumberOfLines={2}
        title={
          '#' + item._id.substring(0, 4) + ': ' + '£' + item.total.toFixed(2)
        }
        subtitle={
          'Driver: ' +
          item.driverName +
          '\nCustomer: ' +
          item.customerName +
          '\nStore: ' +
          item.storeName +
          '\nStatus: ' +
          item.state.replace(/_/g, ' ')
        }
        // avatar={{
        //   uri: imageUrl,
        //   style: { marginRight: 5 }
        // }}
        leftIcon={
          <DoubleClick
            doubleTap={async () => {
              await this._findMarker(item.deliveryDestination);
            }}
            delay={200}>
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 22,
              }}>
              <View
                style={{
                  paddingRight: 2,
                  marginRight: 2,
                  overflow: 'hidden',
                  borderRadius: 22,
                }}>
                <Image
                  style={{
                    flex: 1,
                    maxHeight: 45,
                    height: 45,
                    width: 45,
                    maxWidth: 45,
                    padding: 3,
                    margin: 3,
                    overflow: 'hidden',
                  }}
                  source={Images.DeliveryDestination3}
                  resizeMode="contain"
                />
              </View>
            </View>
          </DoubleClick>
        }
        // onPress={() => this.showOrderLongPressMenu(item._id)}
        // onLongPress={() => this.showOrderLongPressMenu(item._id)}
      />
    );
  };

  renderRowDrivers = ({item}) => {
    let imgToShow = RandomMarkerHelper.GetCorrectMarkerForVehicleType(
      item.vehicleType,
    );

    let vehicleType = item.vehicleType;
    vehicleType = item.vehicleType.replace(/_/g, ' '); //format
    vehicleType =
      vehicleType.charAt(0).toUpperCase() + vehicleType.substring(1); //uppercase

    return (
      <ListItem
        onPress={async () => {
          console.debug('');
          await this._getFullDriver_SetState_ShowModal(item._id);
        }}
        onLongPress={() => {
          this._setNewSelectedChatterIdAndOpenModal(item.userId);
        }}
        roundAvatar
        // rightIcon={
        //   <Image
        //     style={{
        //       marginRight: 5,
        //       maxHeight: 50,
        //       height: 50,
        //       width: 50,
        //       maxWidth: 50
        //     }}
        //     source={imgToShow}
        //     resizeMode="contain"
        //   />
        // }
        leftIcon={
          <DoubleClick
            doubleTap={async () => {
              await this._findMarker(item.location);
            }}
            delay={200}>
            <Image
              style={{
                marginRight: 5,
                maxHeight: 50,
                height: 50,
                width: 50,
                maxWidth: 50,
              }}
              source={imgToShow}
              resizeMode="contain"
            />
          </DoubleClick>
        }
        subtitleNumberOfLines={4}
        leftIconOnPress={() => toast('Pressed left icon')}
        titleNumberOfLines={2}
        title={
          item.firstName + ' ' + item.lastName
          //  + " " + item.email
        }
        subtitle={
          vehicleType.toUpperCase() + '\n' + item.state.replace(/_/g, ' ')
        }
        // avatar={{
        //   uri: imageUrl,
        //   style: { marginRight: 5 }
        // }}
        // leftIcon={
        // <View style={{
        //   overflow: "hidden",
        //   borderRadius: 22
        // }}>
        //   <View
        //     style={{
        //       paddingRight: 2,
        //       marginRight: 2,
        //       overflow: "hidden",
        //       borderRadius: 22
        //     }}
        //   >
        //     <Image
        //       style={{
        //         flex: 1,
        //         maxHeight: 140,
        //         height: 120,
        //         width: 100,
        //         maxWidth: 120,
        //         padding: 5,
        //         margin: 5,
        //         overflow: "hidden",
        //         borderRadius: 22
        //         //   width: undefined
        //       }}
        //       source={{ uri: imageUrl }}
        //       resizeMode="contain"
        //     />
        //   </View>
        // </View>
        // }
        // onPress={() => this.showOrderLongPressMenu(item._id)}
        // onLongPress={() => this.showOrderLongPressMenu(item._id)}
      />
    );
  };

  renderRowStores = ({item}) => {
    try {
      let noOfOrdersWThisStore = this.state.biOrders.filter(
        x => x.storeId == item._id,
      );
      let orderCount = noOfOrdersWThisStore.length;

      return (
        <ListItem
          roundAvatar
          onLongPress={() => {
            this._setNewSelectedChatterIdAndOpenModal(item.userId);
          }}
          rightIcon={
            <DoubleClick
              doubleTap={async () => {
                await this._findMarker(item.location);
              }}
              delay={200}>
              <Image
                style={{
                  marginRight: 5,
                  maxHeight: 50,
                  height: 50,
                  width: 50,
                  maxWidth: 50,
                }}
                source={Images.MapIconStore12}
                resizeMode="contain"
              />
            </DoubleClick>
          }
          subtitleNumberOfLines={4}
          leftIconOnPress={() => toast('Pressed left icon')}
          titleNumberOfLines={2}
          title={item.markerDescription}
          subtitle={item.contact + ' | ' + orderCount + ' active orders'}
          // avatar={{
          //   uri: imageUrl,
          //   style: { marginRight: 5 }
          // }}
          // leftIcon={
          // <View style={{
          //   overflow: "hidden",
          //   borderRadius: 22
          // }}>
          //   <View
          //     style={{
          //       paddingRight: 2,
          //       marginRight: 2,
          //       overflow: "hidden",
          //       borderRadius: 22
          //     }}
          //   >
          //     <Image
          //       style={{
          //         flex: 1,
          //         maxHeight: 140,
          //         height: 120,
          //         width: 100,
          //         maxWidth: 120,
          //         padding: 5,
          //         margin: 5,
          //         overflow: "hidden",
          //         borderRadius: 22
          //         //   width: undefined
          //       }}
          //       source={{ uri: imageUrl }}
          //       resizeMode="contain"
          //     />
          //   </View>
          // </View>
          // }
          // onPress={() => this.showOrderLongPressMenu(item._id)}
          // onLongPress={() => this.showOrderLongPressMenu(item._id)}
        />
      );
    } catch (error) {}
  };

  showOrderList = () => {
    try {
      if (this.state.biOrders && this.state.biOrders.length > 0) {
        return (
          <List style={{flexGrow: 1}}>
            <FlatList
              style={{flexGrow: 1}}
              data={this.state.biOrders}
              renderItem={this.renderRow}
              keyExtractor={item => item._id}
            />
          </List>
        );
      } else {
        return (
          <View>
            <Image
              style={{
                flex: 1,
                maxHeight: 180,
                minHeight: 180,
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
              {'There were no orders to show!'}
            </Text>
          </View>
        );
      }
    } catch (error) {}
  };

  showDriverList = () => {
    if (this.state.biDrivers && this.state.biDrivers.length > 0) {
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.biDrivers}
            renderItem={this.renderRowDrivers}
            keyExtractor={item => item._id}
          />
        </List>
      );
    } else {
      return (
        <View>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              minHeight: 180,
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
            {'There were no drivers to show!'}
          </Text>
        </View>
      );
    }
  };

  showStoreList = () => {
    if (this.state.biStores && this.state.biStores.length > 0) {
      return (
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.biStores}
            renderItem={this.renderRowStores}
            keyExtractor={item => item._id}
          />
        </List>
      );
    } else {
      return (
        <View>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              minHeight: 180,
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
            {'There were no stores to show!'}
          </Text>
        </View>
      );
    }
  };

  /**Call this at start */
  _renderTabViewModal = () => {
    return (
      <Modal
        style={{
          flex: 1,
          height: null,
          backgroundColor: '#fff',
          //paddingBottom: 10,
          borderRadius: 20,
          width: width - 8,
        }}
        isOpen={this.state.tabViewModalOpen}
        onClosed={() => this.closeTabViewModal()}
        ref={'tabModal'}
        backdrop={true}
        coverScreen={false}
        position={'top'}>
        <Header
          backgroundColor={'#990147'}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          rightComponent={{
            icon: 'close',
            color: '#fff',
            onPress: () => this.closeTabViewModal(),
          }}
          centerComponent={{
            text: 'Active Now:',
            style: {color: '#fff'},
          }}
        />
        <View
          style={{
            flexGrow: 1,
          }}>
          {this._renderTabView()}
        </View>
      </Modal>
    );
  };

  _renderTabView = () => {
    try {
      let currentOrderTotal = 0;
      this.state.biOrders.map(x => {
        currentOrderTotal += x.total;
      });
      let background = 'white';
      let text = 'black';
      let lineColor = 'silver';

      console.debug('stop');
      return (
        <View
          style={[
            //styles.tabView,
            {flex: 1, paddingBottom: 20, backgroundColor: 'white'},
          ]}>
          <View
            style={[
              styles.tabButton,
              {backgroundColor: background},
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
                lineColor={'#990147'}
                icon={Images.DeliveryDestination3}
                textStyle={[
                  styles.textTab,
                  {alignContent: 'center', color: text},
                ]}
                selectedStyle={{color: text}}
                text={'Orders:'}
                onPress={() => {
                  this.handleClickTab(0);
                }}
                selected={this.state.tabIndex == 0}
              />
            </View>
            <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
              <Button
                type="tabimage"
                lineColor={'#990147'}
                icon={Images.DeliveryDriver3}
                textStyle={[styles.textTab, {color: text}]}
                selectedStyle={{color: text}}
                text={'Drivers:'}
                onPress={() => {
                  this.handleClickTab(1);
                }}
                selected={this.state.tabIndex == 1}
              />
            </View>
            <View style={[styles.tabItem, {backgroundColor: 'white'}]}>
              <Button
                type="tabimage"
                lineColor={'#990147'}
                icon={Images.MapIconStore12}
                textStyle={[styles.textTab, {color: text}]}
                selectedStyle={{color: text}}
                text={'Stores:'}
                onPress={() => {
                  this.handleClickTab(2);
                }}
                selected={this.state.tabIndex == 2}
              />
            </View>
          </View>
          {this.state.tabIndex === 0 && (
            <View
              style={{
                flex: 1,
                paddingTop: 5,
                paddingLeft: 10,
                paddingRight: 10,
                alignContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingTop: 5,
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'silver',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadowColor: 'black',
                    textShadowRadius: 2,
                  }}>
                  {'Order WIP: '}
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    color: 'silver',
                    textAlign: 'center',
                    textShadowRadius: 1,
                  }}>
                  {'£' + currentOrderTotal.toFixed(2)}
                </Text>
              </View>
              {this.showOrderList()}
            </View>
          )}
          {this.state.tabIndex === 1 && (
            // <View style={[styles.description, { backgroundColor: "white" }]}>
            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
              {this.showDriverList()}
            </View>
            // </View>
          )}
          {this.state.tabIndex === 2 && (
            // <View style={[styles.description, { backgroundColor: "white" }]}>
            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
              {this.showStoreList()}
            </View>
          )}
        </View>
      );
    } catch (error) {}
  };

  getCompletedOrdersTable = () => {};

  getActiveOrderTable = () => {};

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = user => {
    if (typeof user !== 'undefined') {
      if (typeof user.user !== 'undefined' && user.user !== null) {
        // return true;
        if (user.user.roles.find(x => x === 'Logistics')) {
          //we are allowed
          return true;
        }
      }
    }

    const {navigation} = this.props;
    this.props.navigation.pop();
    this.props.navigation.navigate('LoginScreen');
    return false;
  };

  load = async () => {
    if (!this.hasLoaded) {
      this.hasLoaded = true;
      //only show those networks where we have permissions to how
      console.debug('BI home');

      //sets random store URL
      //this.setState({ storeImgUrl: RandomMarkerHelper.GetRandomMarker(RandomMarkerHelper.useStoreMarkers()), driverImgUrl: RandomMarkerHelper.GetRandomMarker(RandomMarkerHelper.useDriverMarkers()) });
      try {
        if (
          this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)
        ) {
          EventRegister.emit('showSpinner');
          this._enableSingleUserChatMode(); //switch chat mode
          // const { username, password } = this.state;
          HopprWorker.init({
            username: this.props.user.user.email,
            password: this.props.user.successPassword,
            token: this.props.user.token,
          });

          let logisticsPerms = await HopprWorker.getAllNetworksAndPermissions(
            this.props.user.user.id,
            'OrderLogistics',
          );

          let networksInPerms = [];
          logisticsPerms.map(x => {
            networksInPerms.push(x.network);
          });

          await this._setAvailableNetworksAndAndStartTimers(networksInPerms);
        } else {
          alert(
            'You are not in the correct role, or not logged in. Please register to view your network traffic!!',
          );
          this.props.navigation.navigate('LoginScreen');
        }
      } catch (error) {
        console.log(error);
      } finally {
        EventRegister.emit('hideSpinner');
      }
    }
  };

  unload = async () => {
    this.stopTimers();
    this._disableSingleUserChatMode(); //switch chat mode
    //toast("Timers stopped");
    this.setState(getDefaultState());
    this.hasLoaded = false;
  };

  _reverseGeoCodeOrderDestinationAndSave = async order => {
    try {
      let address = await GeoWorker.reverseGeocode(
        order.location.lat,
        order.location.long,
      );

      this.setState({selectedOrderAddress: address.formattedAddress}, () => {});
    } catch (error) {
      alert("Couldn't geocode address!");
    }
  };

  _closeFullDriverModal = () => {
    this.setState({fullDriverModalOpenClosed: false});
  };

  _openFullDriverModal = () => {
    this.setState({fullDriverModalOpenClosed: true});
  };

  _closeFullOrderModal = () => {
    this.setState({fullOrderModalOpenClosed: false});
  };

  _openFullOrderModal = () => {
    this.setState({fullOrderModalOpenClosed: true});
  };

  _renderFullDriverDisplayModal = () => {
    //  if (typeof this.state.selectedDriver !== "undefined") {
    return (
      <DriverProfileModal
        closeMe={this._closeFullDriverModal}
        openClosed={this.state.fullDriverModalOpenClosed}
        ref={'fullDriverDisplayModal'}
        driver={this.state.selectedDriver}
      />
    );
    //  }
  };

  _renderFullOrderDisplayModal = () => {
    //if (typeof this.state.selectedOrder !== "undefined") {
    if (typeof this.state.selectedNetwork !== 'undefined') {
      return (
        <FullOrderDisplayModal
          mode={'manager'}
          closeMe={this._closeFullOrderModal}
          openClosed={this.state.fullOrderModalOpenClosed}
          ref={'fullOrderDisplayModal'}
          orderNetwork={this.state.selectedNetwork}
          orderAndItems={this.state.selectedOrder}
          fullAddress={this.state.selectedOrderAddress}
        />
      );
    }
    //    }
  };

  _getFullDriver_SetState_ShowModal = async driverGuid => {
    try {
      EventRegister.emit('showSpinner');
      console.debug('');
      let newDriverResponse = await HopprWorker.getDriver(driverGuid);

      if (newDriverResponse.status == 200) {
        this.setState({selectedDriver: newDriverResponse.data.value[0]});
        //this.closeTabViewModal();
        this._openFullDriverModal();
      } else {
        alert("Ahh that didn't work!");
      }
    } catch (error) {
      alert("Ahh that didn't work!");
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  _getFullOrder_SetState_ShowModal = async orderGuid => {
    try {
      EventRegister.emit('showSpinner');
      console.debug('');
      let newOrderResopnse = await HopprWorker.getOrderInfo(orderGuid);

      console.debug('');
      if (newOrderResopnse.status == 200) {
        this.setState({selectedOrder: newOrderResopnse.data});
        //get the full order and save
        await this._reverseGeoCodeOrderDestinationAndSave(
          newOrderResopnse.data,
        );
        //gecode the destaion / network etc
        //open the modal
        //this.closeTabViewModal();
        this._openFullOrderModal();
      } else {
        alert("Sorry that didn't work! Check connectivity!");
      }
    } catch (error) {
      alert("Sorry that didn't work! Check connectivity!");
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  //get my networks
  _setAvailableNetworksAndAndStartTimers = async myNets => {
    console.debug('Gettings netowrks');
    if (myNets.length > 0) {
      this.setState(
        {
          myNetworks: myNets,
          selectedNetworkId: myNets[0].networkId,
          selectedNetwork: myNets[0],
        },

        async () => {
          this.startTimers();
          toast('Timers started');
        },
      );
    } else {
      alert("You don't have any networks! Create one then come back!!");
    }
  };

  componentWillUnmount = () => {
    this.unload();

    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();
    } catch (error) {}
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

    showMessage({
      message: 'This is the network traffic monitor map view',
      autoHide: false,
      position: 'bottom',
      description: 'You can monitor all traffic for networks you own here.',
      backgroundColor: 'black', // background color
      color: 'white', // text color
    });
  };

  startTimers = () => {
    let biMapTimers = setIntervalAsync(async () => {
      await this.getDriverMarkers();
      await this.getStoreMarkers();
      await this.getOrderMarkers();
      //toast("Updated!");
    }, 5000);

    this.setState({biMapTimers: biMapTimers});
    setTimeout(() => {
      this.stopTrackingViewChanges();
    }, 1000);
  };

  stopTimers = () => {
    clearIntervalAsync(this.state.biMapTimers);
  };

  _renderNetworkLogo = () => {
    if (typeof this.state.selectedNetwork !== 'undefined') {
      let imgUrl =
        Config.NetworkImageBaseUrl + this.state.selectedNetwork.storeLogoUrl;
      return (
        <Image
          style={{
            alignSelf: 'flex-start',
            flex: 1,
            maxHeight: 55,
            height: 55,
            width: undefined,
            maxWidth: 90,
            paddingRight: 3,
            marginRight: 3,
          }}
          source={{
            uri: imgUrl,
          }}
          resizeMode="contain"
        />
      );
    }
  };

  _changeNetworkPickerValue = itemValue => {
    let selNet = this.state.myNetworks.find(x => x.networkId == itemValue);
    this.setState({selectedNetworkId: itemValue, selectedNetwork: selNet});
  };

  _renderNetworkPickerRow = () => {
    const myNetworkItems = this.state.myNetworks.map(network => ({
      label: network.storeName,
      value: network.networkId,
    }));

    if (
      this.state.myNetworks.length > 0 &&
      typeof this.state.selectedNetwork !== 'undefined'
    ) {
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 2,
            paddingLeft: 4,
            marginLeft: 4,
            borderColor: 'red',
            // borderColor:
            //   this.state.selectedNetwork.networkSettings[0].cssMainScreenBarColor || "hotpink",
            borderRadius: 8,
            maxHeight: 50,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RNPickerSelect
            placeholder={{
              label: 'Select Network',
              value: -1,
            }}
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: 'orange',
              height: 20,
              alignItems: 'center',
              inputIOS: {
                textAlign: 'center',
                color: 'silver',
              },
              inputAndroid: {
                textAlign: 'center',
                color: 'silver',
              },
            }}
            inputStyle={{
              textAlign: 'center',
              color: 'silver',
            }}
            onValueChange={(itemValue, index) =>
              itemValue && this._changeNetworkPickerValue(itemValue)
            }
            value={this.state.selectedNetworkId}
            items={myNetworkItems}
          />
        </View>
      );
      // return (
      //   <View
      //     style={{
      //       flex: 1,
      //       borderWidth: 1,
      //       borderColor:
      //         this.state.selectedNetwork.networkSettings[0]
      //           .cssMainScreenBarColor || "hotpink",
      //       borderRadius: 8,
      //       maxHeight: 50,
      //       height: 50
      //     }}
      //   >
      //     <Picker
      //       style={{
      //         // alignSelf: "flex-end",
      //         // justifyContent: "center",
      //         flex: 1,
      //         margin: 2,
      //         paddingLeft: 18,
      //         borderWidth: 2,
      //         borderRadius: 15,
      //         borderColor: "orange",
      //         color: "black",
      //         maxHeight: 50,
      //         height: 50,
      //         // width: undefined,
      //         color: "black"
      //       }}
      //       mode="dropdown"
      //       selectedValue={this.state.selectedNetworkId}
      //       onValueChange={(itemValue, itemIndex) =>
      //         this._changeNetworkPickerValue(itemValue)
      //       }
      //     >
      //       {this.state.myNetworks.map((item, index) => {
      //         return (
      //           <Picker.Item
      //             label={item.storeName}
      //             value={item.networkId}
      //             key={index}
      //           />
      //         );
      //       })}
      //     </Picker>
      //   </View>
      // );
    }
  };

  _renderDriverMarkers = () => {
    try {
      if (typeof this.state.biDrivers !== 'undefined')
        return this.state.biDrivers.map(marker => {
          return (
            <Marker.Animated
              //tracksViewChanges={this.state.tracksViewChanges}
              description={marker.state.replace(/_/g, ' ')}
              zIndex={RandomMarkerHelper.GetRandomZIndexforMarker(1001, 2000)}
              title={
                marker.firstName + ' ' + marker.lastName + ' | ' + marker.email
              }
              onCalloutPress={async () => {
                console.debug('');
                await this._getFullDriver_SetState_ShowModal(marker._id);
              }}
              coordinate={{
                latitude: marker.location.lat,
                longitude: marker.location.long,
              }}>
              <Callout
                style={{flex: 1, position: 'relative'}}
                onPress={async () => {
                  await this._getFullDriver_SetState_ShowModal(marker._id);
                }}>
                <View>
                  <Text style={{fontSize: 18}}>
                    {marker.firstName +
                      ' ' +
                      marker.lastName +
                      ' | ' +
                      marker.email}
                  </Text>
                  <Text style={{color: 'silver', fontSize: 12}}>
                    {marker.state.replace(/_/g, ' ')}
                  </Text>
                </View>
              </Callout>
              <Image
                source={RandomMarkerHelper.GetCorrectMarkerForVehicleType(
                  marker.vehicleType,
                )}
                style={{width: 45, height: 45}}
              />
            </Marker.Animated>
          );
        });
    } catch (error) {
      console.debug('driver markers errored out');
    }
  };

  _renderOrderMarkers = () => {
    try {
      if (typeof this.state.biOrders !== 'undefined') {
        return this.state.biOrders.map(marker => {
          return (
            <Marker.Animated
              tracksViewChanges={this.state.tracksViewChanges}
              description={marker.state.replace(/_/g, ' ')}
              title={
                '£' +
                marker.total.toFixed(2) +
                ' | #' +
                marker._id.substring(0, 4)
              }
              zIndex={RandomMarkerHelper.GetRandomZIndexforMarker(2001, 3000)}
              coordinate={{
                latitude: marker.deliveryDestination.lat,
                longitude: marker.deliveryDestination.long,
              }}
              onCalloutPress={async () => {
                await this._getFullOrder_SetState_ShowModal(marker._id);
              }}>
              <Callout
                style={{flex: 1, position: 'relative'}}
                onPress={async () => {
                  await this._getFullOrder_SetState_ShowModal(marker._id);
                }}>
                <View>
                  <Text style={{fontSize: 18}}>
                    {'£' +
                      marker.total.toFixed(2) +
                      ' | #' +
                      marker._id.substring(0, 4)}
                  </Text>
                  <Text style={{color: 'silver', fontSize: 12}}>
                    {marker.state.replace(/_/g, ' ')}
                  </Text>
                </View>
              </Callout>
              <Image
                //source={RandomMarkerHelper.GetRandomMarker(RandomMarkerHelper.useHopprMarkers())}
                source={Images.HopprLogoMapPin4Filled}
                style={{width: 65, height: 75, maxHeight: 95}}
              />
            </Marker.Animated>
          );
        });
      }
    } catch (error) {
      console.debug('order markers errored out');
    }
  };

  _renderStoreMarkers = () => {
    try {
      if (typeof this.state.biStores !== 'undefined')
        return this.state.biStores.map(marker => {
          return (
            <Marker.Animated
              zIndex={RandomMarkerHelper.GetRandomZIndexforMarker(10, 1000)}
              tracksViewChanges={this.state.tracksViewChanges}
              description={'ONLINE'}
              title={marker.markerDescription}
              coordinate={{
                latitude: marker.location.lat,
                longitude: marker.location.long,
              }}>
              <Image
                source={this.state.storeImgUrl}
                style={{width: 45, height: 45}}
              />
            </Marker.Animated>
          );
        });
    } catch (error) {
      console.debug('Store markers errrored out in BI Map');
    }
  };

  _findMarker = async location => {
    try {
      this.closeTabViewModal();
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
        message: 'That entity is currently at:',
        autoHide: true,
        position: 'top',
        description: address.formattedAddress,
        backgroundColor: 'black', // background color
        color: 'white', // text color
      });
    } catch (error) {
      console.debug(error);
    }
  };

  displayMarkerLines = () => {
    try {
      return this.state.biOrders.map(order => {
        let storeForOrder = this.state.biStores.find(
          x => x._id == order.storeId,
        );
        let driverForOrder = this.state.biDrivers.find(
          x => x._id == order.driverId,
        );
        return (
          <MapViewDirections
            style={{zIndex: 100}}
            origin={{
              latitude: driverForOrder.location.lat,
              longitude: driverForOrder.location.long,
            }}
            destination={{
              latitude: order.deliveryDestination.lat,
              longitude: order.deliveryDestination.long,
            }}
            waypoints={[
              {
                latitude: storeForOrder.location.lat,
                longitude: storeForOrder.location.long,
              },
            ]}
            mode={'DRIVING'}
            apikey={Config.GoogleMapsDirectionAPIKey}
            strokeWidth={6}
            strokeColor={
              this.state.selectedNetwork.networkSettings[0]
                .cssMainScreenBarColor || 'hotpink'
            }
          />
        );
      });
    } catch (error) {}
  };

  stopTrackingViewChanges = () => {
    this.setState(() => ({
      tracksViewChanges: false,
    }));
  };

  /**Shows the tabbed modal */
  _renderListModal = () => {};

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            height: 60,
            maxHeight: 60,
            margin: 4,
            // borderWidth: 1,
            // borderColor: "hotpink",
            // borderRadius: 8
          }}>
          {this._renderNetworkLogo()}
          {this._renderNetworkPickerRow()}
          <TouchableOpacity onPress={() => this.openTabViewModal()}>
            <Image
              style={{
                paddingLeft: 5,
                marginLeft: 5,
                paddingRight: 3,
                marginRight: 3,
                flex: 1,
                maxHeight: 45,
                height: 45,
                width: 45,
                maxWidth: 45,
              }}
              source={Images.ViewProduct2}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              try {
                console.debug('ok');
                console.debug('ok');
                this.props.updateModalState('salesBIModal', true);
              } catch (error) {
                toast("Couldn't launch modal");
              }
            }}>
            <Image
              style={{
                paddingLeft: 5,
                marginLeft: 5,
                flex: 1,
                maxHeight: 45,
                height: 45,
                width: 45,
                maxWidth: 45,
              }}
              source={Images.TabBIIcon2}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {/* <Picker
          selectedValue={"1"}
          style={{
            justifyContent: "center",
            flex: 1,
            margin: 2,
            borderWidth: 2,
            borderRadius: 15,
            borderColor: "orange",
            color: "black",
            maxHeight: 50,
            height: 50,
            width: undefined,
            color: "black"
          }}
          // onValueChange={(itemValue, itemIndex) =>
          //   (this.pickerValue = itemValue)
          // }
        >
          <Picker.Item label="Delivered Directly to Customer" value="1" />
          <Picker.Item label="Delivered To Customer Address" value="2" />
          <Picker.Item label="Left Nearby" value="3" />
          <Picker.Item label="Other" value="4" />
        </Picker> */}
        <View
          style={{
            // justifyContent: "flex-start",
            // flexDirection: "column",
            position: 'absolute', //use absolute position to show button on top of the map
            top: 5, //for center align
            zIndex: 100,
            // alignSelf: "flex-start" //for align to top
          }}>
          {/* {this._renderNetworkPickerRow()} */}
          {/* <Text style={{ fontSize: 22, color: "black" }}>{"TeST"}</Text> */}
        </View>
        {/* <Header
          backgroundColor={"red"}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: "Ecosystem",
            style: { color: "#fff" }
          }}
          rightComponent={
            <View style={{ flexDirection: "row", paddingTop: 8, marginTop: 8 }}>
              <TouchableHighlight>
                <Image
                  source={Images.MapIconDriver5}
                  style={{ margin: 2, marginTop: 5, height: 30, width: 30 }}
                />
              </TouchableHighlight>
            </View>
          }
          leftComponent={
            <View style={{ flexDirection: "row", paddingTop: 8, marginTop: 8 }}>
              <TouchableHighlight>
                <Image
                  source={Images.MapIconStore3}
                  style={{ margin: 2, marginTop: 5, height: 30, width: 30 }}
                />
              </TouchableHighlight>
            </View>
          }
        /> */}
        <View style={{flexGrow: 1}}>
          <View style={styles.container}>
            {/* //END PICKER */}

            <View
              style={{
                // justifyContent: "flex-start",
                // flexDirection: "column",
                position: 'absolute', //use absolute position to show button on top of the map
                bottom: 5, //for center align
                zIndex: 1,
                // alignSelf: "flex-start" //for align to top
              }}>
              <ElButton
                buttonStyle={styles.driverControlsButton}
                raised
                backgroundColor={'#D30000'}
                borderRadius={20}
                icon={{name: 'map'}}
                title="Set current location as delivery destination"
                onPress={() => {
                  this.SetCurrentLocationAsPickedLocation();
                }}
              />
            </View>

            <MapView
              // onMapReady={() =>
              //   setTimeout(() => {
              //     this.stopTrackingViewChanges()
              //   }, 10000)
              // }
              ref={el => (this._mapView = el)}
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              customMapStyle={Config.MapThemes.SecondaryMapTheme}
              initialRegion={{
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}>
              {/* <UrlTile
                urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                zIndex={-10}
              /> */}
              {this._renderStoreMarkers()}
              {/* //DRIVER MARKERS */}
              {this._renderDriverMarkers()}
              {/* //ORDER MARKERS */}
              {this._renderOrderMarkers()}

              {this.displayMarkerLines()}

              {/* ORDER / DRIVER LINE */}
              {/* {this.state.biOrders.map((marker) => (
                <MapView.Polyline
                  key={marker._id}
                  coordinates={[
                    {
                      latitude: marker.currentLocation.lat,
                      longitude: marker.currentLocation.long,
                    },
                    {
                      latitude: marker.deliveryDestination.lat,
                      longitude: marker.deliveryDestination.long,
                    },
                  ]}
                  strokeColor="#000"
                  fillColor="red"
                  strokeWidth={3}
                />
              ))} */}
            </MapView>
          </View>
        </View>
        {this._renderTabViewModal()}
        {this._renderFullDriverDisplayModal()}
        {this._renderFullOrderDisplayModal()}
      </View>
    );
  }
}
const mapStateToProps = ({user}) => ({
  user: user,
});

const mapDispatchToProps = dispatch => {
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(BIMap));
