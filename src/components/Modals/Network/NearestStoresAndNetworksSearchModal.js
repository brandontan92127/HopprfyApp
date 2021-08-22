import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
import {ModalBox, NetworkDisplay, NetworkSearchAndAddModal} from '@components';
import {
  Image,
  View,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  I18nManager,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableHighlight,
} from 'react-native';
import {connect} from 'react-redux';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  AnimatedRegion,
  UrlTile,
} from 'react-native-maps';
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  Images,
} from '@common';
import {Header, Icon, Divider, List, ListItem} from 'react-native-elements';
import {toast} from '../../../Omni';
import HopprWorker from '../../../services/HopprWorker';
import Autocomplete from 'react-native-autocomplete-input';
import ShopButton from '@components';
import Toast, {DURATION} from 'react-native-easy-toast';
import {NetworkDisplayModal, NetworkImageList} from '@components';
import MapWorker from '../../../services/MapWorker';
import GeoWorker from '../../../services/GeoWorker';
import LayoutHelper from '../../../services/LayoutHelper';
import * as Animatable from 'react-native-animatable';
import RandomMarkerHelper from '../../../helper/RandomMarkerHelper';
// import { TouchableHighlight } from "react-native-gesture-handler";
import {isIphoneX} from 'react-native-iphone-x-helper';
import {StackActions, NavigationActions} from 'react-navigation';
import {EventRegister} from 'react-native-event-listeners';
import FastImage from 'react-native-fast-image';
import {showMessage, hideMessage} from 'react-native-flash-message';

const {width, height} = Dimensions.get('window');
const modalWidth = width - 14;
const maxContentWidth = modalWidth - 12;
const halfmodalContentMaxWidth = maxContentWidth / 2;

const mapHeight = height / 3;
const filterDefaultText = 'EVERYTHING\n NEARBY';

const initalModalState = {};
const widthOFEverythingForAutocomplete = width - 205;
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    color: 'black',
  },
  wrap: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255, 1)',
    borderRadius: 6,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  modalBoxWrap: {
    position: 'absolute',
    borderRadius: 6,
    top: 40, //(height * 35) / 100,
    width: (width * 96) / 100,
    height: height - 100, //(height * 70) / 100,
    flex: 1,
    backgroundColor: 'transparent',
    right: I18nManager.isRTL ? 0 : null,
  },
  layoutBox: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    marginTop: 10,
  },

  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
});

const normalFilterImageStyle = {
  paddingLeft: 0,
  paddingRight: 5,
  minHeight: 40,
  maxHeight: 40,
  maxWidth: 55,
  minWidth: 40,
};

const landscapeFilterImageStyle = {
  paddingLeft: 4,
  marginLeft: 4,
  paddingRight: 5,
  height: 32,
  minHeight: 30,
  minWidth: 68,
};

const INITIAL_LATITUDE = 51.5397824;
const INITIAL_LONGITUDE = -0.1435601;
const ASPECT_RATIO = width / 250;
const LATITUDE_DELTA = 0.3502;
const LATITUDE_DELTA_ZOOMED = 0.0502;

const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const LONGITUDE_DELTA_ZOOMED = LATITUDE_DELTA_ZOOMED * ASPECT_RATIO;

class NearestStoresAndNetworksSearchModal extends Component {
  constructor(props) {
    super(props);
    console.debug('In nearest stores and networks modal');

    this.networkImageBaseUrl = Config.NetworkImageBaseUrl;
    this.state = this.getInitalState();
  }

  getInitalState = () => {
    return {
      coordinate: new AnimatedRegion({
        latitude: INITIAL_LATITUDE,
        longitude: INITIAL_LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }),
      pickedLatLngForSearch: {
        lat: 51.5407134,
        lng: -0.1676347,
      },
      kmToSearch: 50,
      pickedLatLngStreetNameAndAddress: 'None',
      latestNetworkAndStoresSearchResults: [], //base records
      filteredlatestNetworkAndStoresSearchResults: [], //filtered records actually used
      filteredNetworkName: 'All',
      filterText: filterDefaultText,
      filterImage: Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo,
      filterColor: 'lightblue',
      filterImageStyle: landscapeFilterImageStyle,
      latestNetworkAndStoresMarkerObjects: [],
      filteredLatestNetworkAndStoresMarkerObjects: [], //this is one filtered network

      hideAutocompleteResults: true,
      latestNetworkTagsAutocompleteSearchResults: [],
      latestTagSearchTerm: '',

      loadFired: false,
    };
  };

  onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  _renderStoreMarkers = () => {
    let uniqueMarkers = [];
    this.state.filteredLatestNetworkAndStoresMarkerObjects.map(x => {
      let isAlreadyThere = uniqueMarkers.filter(
        existingInArray => x.name == existingInArray.name,
      );
      console.log('stop');
      if (isAlreadyThere.length == 0) {
        uniqueMarkers.push(x);
      }
    });
    //filter only unique markers
    console.log('Stop');
    return uniqueMarkers.map(netStoreMarkerObj => (
      <Marker
        coordinate={{
          latitude: netStoreMarkerObj.lat,
          longitude: netStoreMarkerObj.lng,
        }}
        // image={Images.MapIconStore}
        description={'Open now!'}
        title={netStoreMarkerObj.name}
        onPress={() => {
          this._filterToClickedStoreMarkersNetworks(netStoreMarkerObj._id);
        }}>
        <Image
          // source={{
          //   uri:
          //     this.networkImageBaseUrl + netStoreMarkerObj.storeLogoUrl
          // }}
          source={netStoreMarkerObj.url}
          style={{width: 45, maxWidth: 45, height: 45}}
        />
      </Marker>
    ));
  };

  _filterlatestNetworkAndStoresMarkerObjects = networkId => {
    //save records with networkId - one network
    let recordsFiltered = this.state.latestNetworkAndStoresMarkerObjects.filter(
      x => x.networkId === networkId,
    );

    //let realNetwork = this.state.latestNetworkAndStoresSearchResults.filter(X=>X.network.networkId === networkId);

    this.setState({
      filteredLatestNetworkAndStoresMarkerObjects: recordsFiltered,
      filteredNetworkName: recordsFiltered[0].storeName,
    });
  };

  _getCurrentLocationAndUpdatePickedLocationIfSuccessful = async () => {
    if (await MapWorker.requestLocationPermission()) {
      console.debug('stop in getLocation'); //TEST CODE
      EventRegister.emit('showSpinner');
      navigator.geolocation.getCurrentPosition(
        async position => {
          //success
          let newPOs = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          let streetAddress = await GeoWorker.reverseGeocode(
            newPOs.lat,
            newPOs.lng,
          );

          this.setState({
            pickedLatLngForSearch: newPOs,
            pickedLatLngStreetNameAndAddress: streetAddress.formattedAddress,
          });

          await this.searchNearestNetworksAndStores(
            newPOs.lat,
            newPOs.lng,
            this.state.kmToSearch,
          );
          Keyboard.dismiss();
          EventRegister.emit('hideSpinner');
        },
        error => {
          console.debug('Error getting location:' + JSON.stringify(error));
          EventRegister.emit('hideSpinner');
        },
      );
      //END TEST
    } else {
      alert('Please enable location!!!');
    }
    //trigger updating results?
  };

  componentDidUpdate = (prevProps, prevState) => {};

  componentDidMount = async () => {
    console.debug('stop in modal');

    // setTimeout(async () => await this.load(), 5000);
  };

  //delete state - calledOn close
  unload = () => {};

  load = async () => {
    if (!this.state.loadFired) {
      this.setState({loadFired: true});
      await this._getCurrentLocationAndUpdatePickedLocationIfSuccessful();
      Keyboard.dismiss();
    }
  };

  componentWillMount = async () => {};

  addPermissionAndTellUser = async (userId, networkId, type) => {
    let test123 = '';
    let permRes = await this._requestNewPermission(userId, networkId, type);
    if (typeof permRes === 'undefined') {
      this.showToast(
        "That didn't work - sorry - maybe you already added that network?",
      );
    }
    if (permRes.status == 200) {
      this.showToast('Yay - you added successfully');
      //was it private or public - then tell user what happened
    } else {
      //it failed
      this.showToast(
        "That didn't work - sorry - maybe you already added that network?",
      );
    }
  };

  _updateLatestSelectedNetworkAndShowNetDisplayModal = item => {
    this.props.updateLatestNetworkForInfoQuery(item);
    this.openNetworkDisplayModal();
  };

  _updateLatestSelectedNetworkAndFilter = item => {
    this.props.updateLatestNetworkForInfoQuery(item);
    this._filterlatestNetworkAndStoresMarkerObjects(item.network.networkId);

    this.setState({
      filterText: 'STORES SELLING:\n' + item.network.storeName,
      filterImage: Images.HopprLogoMapPin1Filled,
      filterColor: 'lightblue',
      filterImageStyle: normalFilterImageStyle,
    });

    let cssColor = item.network.networkSettings[0].cssMainScreenBarColor;

    showMessage({
      duration: 1400,
      message: 'Filtered to: ' + item.network.storeName,
      autoHide: true,
      position: 'bottom',
      description:
        'Showing you all stores that stock ' + item.network.storeName,
      backgroundColor: cssColor, // background color
      color: 'white', // text color
    });
  };

  _renderNetworkResultsRow = ({item}) => {
    let networkImageUrl = this.networkImageBaseUrl + item.network.storeLogoUrl;

    if (item.nearestStores.length > 0) {
      let storesOrderByDistance = item.nearestStores.sort((a, b) =>
        parseFloat(a.distance) > parseFloat(b.distance) ? 1 : -1,
      );

      //do tags array
      var numberOfTags =
        item.network.networkTags >= 3 ? 3 : item.network.networkTags.length;
      let tagString = '';
      item.network.networkTags.slice(0, numberOfTags - 1).map(tag => {
        tagString += '#' + tag.tag + '\n';
      });

      return (
        <ListItem
          rightIcon={
            <View
              style={{
                alignContent: 'center',
                alignItems: 'center',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}>
              {/* FINAL BIG ONE TO ADD AND GO */}
              <View style={{alignContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={async () => {
                    console.debug('add and go');
                    await this._addNetwork_RefreshNetworks_AndGoToHomeWithNewNetworkSelected(
                      this.props.user,
                      item.network,
                      'Customer',
                    );
                  }}>
                  <Image
                    style={{
                      marginTop: 3,
                      maxHeight: 80,
                      height: 60,
                      width: 90,
                      maxWidth: 90,
                    }}
                    source={Images.ShopAndGoNow}
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
                  {'Shop Now!'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                  padding: 3,
                  margin: 3,
                }}>
                <TouchableOpacity
                  onPress={async () => {
                    console.debug('test');
                    await this.addPermissionAndTellUser(
                      this.props.user.user.id,
                      item.network.networkId,
                      'Customer',
                    );
                  }}>
                  <Image
                    style={{
                      maxHeight: 28,
                      height: 28,
                      width: 28,
                      maxWidth: 28,
                    }}
                    source={Images.AddShopper1}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontStyle: 'italic',
                      color: 'grey',
                      fontSize: 10,
                      textAlign: 'center',
                    }}>
                    {'Fave'}
                  </Text>
                </TouchableOpacity>
                <Text style={{marginRight: 3, marginLeft: 3, color: 'silver'}}>
                  {'|'}
                </Text>
                <TouchableOpacity
                  onPress={async () =>
                    await this.addPermissionAndTellUser(
                      this.props.user.user.id,
                      item.network.networkId,
                      'Driver',
                    )
                  }>
                  <Image
                    style={{
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30,
                    }}
                    source={Images.AddDriver2}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontStyle: 'italic',
                      color: 'grey',
                      fontSize: 10,
                      textAlign: 'center',
                    }}>
                    {'Drive'}
                  </Text>
                </TouchableOpacity>
                <Text style={{marginRight: 3, marginLeft: 3, color: 'silver'}}>
                  {'|'}
                </Text>
                <TouchableOpacity
                  onPress={async () =>
                    await this.addPermissionAndTellUser(
                      this.props.user.user.id,
                      item.network.networkId,
                      'Store',
                    )
                  }>
                  <Image
                    style={{
                      paddingRight: 10,
                      paddingLeft: 3,
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30,
                    }}
                    source={Images.MapIconStore11}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontStyle: 'italic',
                      color: 'grey',
                      fontSize: 10,
                      textAlign: 'center',
                    }}>
                    {'Shop'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          onPress={() =>
            this._updateLatestSelectedNetworkAndShowNetDisplayModal(item)
          }
          subtitleNumberOfLines={4}
          leftIcon={
            <View
              style={{
                margin: 4,
                alignContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
              <TouchableOpacity
                onPress={() =>
                  this._updateLatestSelectedNetworkAndShowNetDisplayModal(item)
                }>
                <Image
                  style={{
                    maxHeight: 64,
                    height: 64,
                    width: 64,
                    maxWidth: 64,
                    margin: 2,
                    marginRight: 5,
                  }}
                  source={{uri: networkImageUrl}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    flex: 1,
                    flexWrap: 'wrap',
                    color: 'grey',
                    fontSize: 11,
                    textAlign: 'center',
                  }}>
                  {item.network.storeName}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  flexWrap: 'wrap',
                  numberOfLines: 4,
                  color: 'grey',
                  fontSize: 8,
                  textAlign: 'center',
                }}>
                {tagString}
              </Text>
            </View>
          }
          title={
            item.network.storeName +
            '\n' +
            'Store ' +
            storesOrderByDistance[0].distance.substring(0, 4) +
            'km away'
            // +
            // " - " +
            // storesOrderByDistance[0].name
          }
          titleNumberOfLines={3}
          subtitle={
            item.network.description +
            ' | ' +
            storesOrderByDistance.length +
            ' stores open now'
          }
          //onPress={() => { }}
          onLongPress={() => this._updateLatestSelectedNetworkAndFilter(item)}
        />
      );
    } else {
      return null;
    }
  };

  _showNetworkList = () => {
    if (this.state.filteredlatestNetworkAndStoresSearchResults.length > 0) {
      return (
        <List
          style={{
            zIndex: 1,
            flexGrow: 1,
            borderRadius: 30,
            overflow: 'hidden',
          }}>
          <FlatList
            style={{
              flexGrow: 1,
              borderRadius: 30,
              zIndex: 1,
              overflow: 'hidden',
            }}
            data={this.state.filteredlatestNetworkAndStoresSearchResults}
            renderItem={this._renderNetworkResultsRow}
            keyExtractor={item => item.networkId}
          />
        </List>
      );
    } else {
      return (
        <View
          style={{
            height: 200,
            width: modalWidth,
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            style={{
              maxHeight: 140,
              minHeight: 140,
              height: 140,
              width: 140,
              minWidth: 100,
            }}
            source={Images.NoOrderClipboard}
            resizeMode="contain"
          />
          <Text
            style={{
              color: 'black',
              fontSize: 12,
              textAlign: 'center',
              marginTop: 5,
            }}>
            {
              'There were no products / networks to show! \nPlease revise your search.'
            }
          </Text>
        </View>
      );
    }
  };

  /**After map is clicked, get results */
  moveMarkerAndPickLocation = async coordAndPick => {
    if (Platform.OS === 'android') {
      this.currentLocationMarker.animateMarkerToCoordinate(
        coordAndPick.coordinate,
      );
    } else {
      this.state.coordinate
        .timing({...coordAndPick.coordinate, duration: 250})
        .start();
    }

    this._mapView.animateToRegion({
      latitude: coordAndPick.coordinate.latitude,
      longitude: coordAndPick.coordinate.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });

    //reverse geocode address
    let streetAddress = await GeoWorker.reverseGeocode(
      coordAndPick.coordinate.latitude,
      coordAndPick.coordinate.longitude,
    );

    //update last picked - set text to defaul
    this.setState({
      pickedLatLngForSearch: {
        lat: coordAndPick.coordinate.latitude,
        lng: coordAndPick.coordinate.longitude,
      },
      pickedLatLngStreetNameAndAddress: streetAddress.formattedAddress,
      filterText: filterDefaultText,
      filterImage: Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo,
      filterColor: 'lightblue',
      filterImageStyle: landscapeFilterImageStyle,
    });

    console.debug('About to make search for nets/Stores');
    //run search based on picked
    await this.searchNearestNetworksAndStores(
      coordAndPick.coordinate.latitude,
      coordAndPick.coordinate.longitude,
      this.state.kmToSearch,
    );

    console.debug('Got search for nets/Stores');
  };

  /**We want to add network */
  _addNetwork_RefreshNetworks_AndGoToHomeWithNewNetworkSelected = async (
    user,
    network,
    permType,
  ) => {
    try {
      EventRegister.emit('showSpinner');
      console.debug('hgit the actions');
      //send request anyway if user is logged in - whatever
      if (typeof user.user !== 'undefined' && user.user != null) {
        let permRes = await this._requestNewPermission(
          user.user.userId,
          network.networkId,
          permType,
        );
        console.debug('perm request sent - now go to network?');
      }

      //is public or private
      if (network.visibility.toLowerCase() === 'private') {
        alert(
          "We will request your addition to this private network, you'll have to wait to be accepted",
        );
      } else {
        //is public, redirect
        //change network then go!
        this.props.changeNetwork(network.networkId).then(() => {
          this._resetHomeStackAndGo('Home');
          this.closeMe();
          //end logged in 'IF'
        });
      }
    } catch (error) {
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  _requestNewPermission = async (userId, networkId, type) => {
    let test123 = '';
    var addReslt = await HopprWorker.addNetworkUserPermissionRequest(
      userId,
      networkId,
      type,
    );
    return addReslt;
  };

  _renderFilterText = () => {
    if (
      typeof this.state.filteredlatestNetworkAndStoresSearchResults !==
      'undefined'
    ) {
      if (this.state.filteredlatestNetworkAndStoresSearchResults.length > 0) {
        return (
          <View
            style={{
              borderWidth: 1,
              borderColor: 'lightblue',
              borderStyle: 'dotted',
              borderRadius: 30,
            }}>
            <View
              style={{
                flex: 1,
                padding: 4,
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              <Text
                style={{
                  paddingLeft: 10,
                  paddingRight: 0,
                  margin: 3,
                  flexWrap: 'wrap',
                  // padding: 3,
                  // paddingLeft: 6,
                  // margin: 4,
                  textAlign: 'center',
                  color: this.state.filterColor,
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
                numberOfLines={4}>
                {this.state.filterText}
              </Text>
              <FastImage
                source={this.state.filterImage}
                style={this.state.filterImageStyle}
                resizeMode="contain"
              />
            </View>
          </View>
        );
      }
    }
  };

  /**click on a store and it filters to only the networks supported by that network */
  _filterToClickedStoreMarkersNetworks = storeId => {
    //zoom to that store

    //get all individual 'stores' (there's one for each network that the store is on)
    //let allTheStoreNetsForThisStore = this.latestNetworkAndStoresMarkerObjects.filter(x => x._id == storeId);
    //now filter the networks in the list to only the distinct ones in the variable
    this._filterNetworkResultsToSingleStore(storeId);
  };

  /**Connects to api and gets data */
  searchNearestNetworksAndStores = async (lat, lng, distanceKM) => {
    try {
      //move map to marker and zoom in
      this._mapView.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });

      let resultData = await HopprWorker.getNearestStoresOnAllNetworks(
        lat,
        lng,
        distanceKM,
      );

      console.debug('got result');
      this.setState({
        latestNetworkAndStoresSearchResults: resultData,
        filteredlatestNetworkAndStoresSearchResults: resultData,
      });

      //create the marker array out of these obects
      let netsStoresMarkerArray = [];
      resultData.map(netStore => {
        //loop thorough each network / store
        netStore.nearestStores.map(st => {
          let splitContact = st.name;
          try {
            splitContact = st.name.split('contact')[0];
          } catch (error) {
            console.debug("couldn't split");
          }

          let marker = RandomMarkerHelper.GetRandomMarker(
            RandomMarkerHelper.useStoreMarkers(),
          );
          netsStoresMarkerArray.push({
            name: splitContact,
            _id: st.relatedGuid,
            networkId: netStore.network.networkId,
            storeName: netStore.network.storeName,
            storeLogoUrl: netStore.network.storeLogoUrl,
            lat: st.lat,
            lng: st.long,
            url: marker,
          });
        });
      });

      this.setState({
        latestNetworkAndStoresMarkerObjects: netsStoresMarkerArray,
        filteredLatestNetworkAndStoresMarkerObjects: netsStoresMarkerArray,
        filteredNetworkName: 'All',
      });
    } catch (error) {
      alert("That didn't work, sorry!");
    } finally {
      //to stop multiple requests
    }
  };

  _renderMapView = () => {
    return (
      <View
        style={{
          minHeight: mapHeight,
          height: mapHeight,
          borderWidth: 1,
          borderColor: '#ff6c52',
          borderRadius: 20,
          marginBottom: 20,
          overflow: 'hidden',
        }}>
        {/* MAP ICON TOP LEFT */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
          }}>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={async () => {
                await this._getCurrentLocationAndUpdatePickedLocationIfSuccessful();
                //this.props.getCurrentLocation();
              }}>
              <Image
                style={{
                  maxHeight: 70,
                  height: 70,
                  width: 70,
                  maxWidth: 70,
                }}
                source={Images.GetNearby1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          ref={el => (this._mapView = el)}
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              paddingBottom: 0,
              marginBottom: 0,
            },
          ]}
          customMapStyle={Config.MapThemes.FourthMapTheme}
          onLongPress={e => this.moveMarkerAndPickLocation(e.nativeEvent)}
          initialRegion={{
            latitude: this.state.pickedLatLngForSearch.lat,
            longitude: this.state.pickedLatLngForSearch.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}>
          <Marker
            zIndex={99999}
            ref={marker => {
              this.currentLocationMarker = marker;
            }}
            coordinate={{
              latitude: this.state.pickedLatLngForSearch.lat,
              longitude: this.state.pickedLatLngForSearch.lng,
            }}
            // image={Images.MapIconStore}
            description={'Location'}
            title={'Nearest Stores'}>
            <Image
              source={Images.PickAndGo1}
              style={{width: 60, maxWidth: 60, height: 60, maxHeight: 60}}
            />
          </Marker>
          {/* ALL NEAREST STORES MARKERS */}
          {this._renderStoreMarkers()}
        </MapView>

        {/* NETWORKS IM OPERATING ON  */}
        {/* <View
          style={{
            backgroundColor: 'transparent',
            position: "absolute",
            justifyContent: "flex-end",
            top: 0,
            minHeight: mapHeight,
            height: mapHeight,
            width: 50,
            right: -5,
            zIndex: 200,
          }}
        > */}

        {/* <NetworkImageList listOfImages={    
          }
            baseImageUrl={"testurl.com"} /> */}
        {/* </View> */}
        {/* BUTTON ABSOULTE */}
        <View
          style={{
            marginTop: 0,
            paddingTop: 0,
            position: 'absolute', //use absolute position to show button on top of the map
            //top: '100%', //for center align
            bottom: '1%',
            alignSelf: 'flex-end', //for align to right
            paddingRight: 3,
            marginRight: 3,
          }}>
          {this._renderCornerLogoImage()}
        </View>

        {/* CLOSE BUTTON ABSOULTE */}
        <View
          style={{
            marginTop: 0,
            paddingTop: 0,
            position: 'absolute', //use absolute position to show button on top of the map
            //top: '100%', //for center align
            top: 3,
            right: 2,
            // alignSelf: "flex-end", //for align to right
            paddingRight: 3,
            marginRight: 3,
          }}>
          <TouchableOpacity onPress={this.closeMe}>
            <Image
              source={Images.Close2}
              style={{
                minHeight: 50,
                maxHeight: 50,
                maxWidth: 50,
                minWidth: 50,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderCornerLogoImage = () => {
    let imgSrc = Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo;

    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    };

    const distinctNets = [
      ...new Set(
        this.state.filteredLatestNetworkAndStoresMarkerObjects.map(
          x => x.networkId,
        ),
      ),
    ];
    let howManyDistinctNets = distinctNets.filter(distinct);

    if (howManyDistinctNets.length == 1) {
      let theNetsWeWant =
        this.state.filteredLatestNetworkAndStoresMarkerObjects.filter(
          x => x.networkId == howManyDistinctNets[0],
        );
      let ourUrl = Config.NetworkImageBaseUrl + theNetsWeWant[0].storeLogoUrl;
      return (
        <Image
          source={{uri: ourUrl}}
          style={{minHeight: 70, maxHeight: 70, maxWidth: 150, minWidth: 70}}
          resizeMode="contain"
        />
      );
    }
    //return
    else {
      return (
        <Image
          source={Images.HopprLogoPlaceholder}
          style={{
            minHeight: 60,
            maxHeight: 60,
            maxWidth: 60,
            minWidth: 60,
          }}
          resizeMode="contain"
        />
      );
    }

    //latestQueriedNetwork.storeImgUrl;
  };

  getTagAutocomplete = async passedTag => {
    let tagResults = [];
    if (passedTag.length > 0) {
      //save what we searched for and show search
      //reset to all nets
      this.setState({
        latestTagSearchTerm: passedTag,
        hideAutocompleteResults: false,
      });

      // //filter networks to whatever contains the partial tag
      this.state.latestNetworkAndStoresSearchResults.map(net => {
        net.network.networkTags.map(tag => {
          if (tag.tag.toLowerCase().includes(passedTag.toLowerCase())) {
            if (!tagResults.includes(tag.tag)) {
              tagResults.push(tag.tag);
            }
          }
        });
      });
      // //then save the result
      this.setState({
        latestNetworkTagsAutocompleteSearchResults: tagResults,
        hideAutocompleteResults: false,
      });
      console.debug('got result');
    } else {
      //reset filtered networks and tags
      console.debug('got result');
      //hide result
      this.setState({
        filteredlatestNetworkAndStoresSearchResults:
          this.state.latestNetworkAndStoresSearchResults,
        hideAutocompleteResults: true,
        latestNetworkTagsAutocompleteSearchResults: [],
        //filters
        filterText: filterDefaultText,
        filterImage: Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo,
        filterColor: 'lightblue',
        filterImageStyle: landscapeFilterImageStyle,
      });
    }
  };

  _filterNetworkResultsToSingleStore = storeId => {
    let netsWeWant = [];
    let filterText = '';
    this.state.latestNetworkAndStoresSearchResults.map(net => {
      net.nearestStores.map(store => {
        if (store.relatedGuid == storeId) {
          filterText = 'THIS STORE\nRETAILS:';
          netsWeWant.push(net);
          return;
        }
      });
    });

    console.log('stop');
    this.setState({
      filteredlatestNetworkAndStoresSearchResults: netsWeWant,
      filterText: filterText,
      filterImage: Images.MapIconStore11,
      filterColor: '#ff6c52',
      filterImageStyle: landscapeFilterImageStyle,
    });
  };

  //* filter base set to passed network Ids */
  _filterNetworkResults = passedTag => {
    let filteredResults = [];

    //go through all nets and take the ones with any matching tag / break
    this.state.latestNetworkAndStoresSearchResults.map(net => {
      net.network.networkTags.map(tag => {
        if (tag.tag.toLowerCase().includes(passedTag.toLowerCase())) {
          if (!filteredResults.includes(net)) {
            filteredResults.push(net);
          }
        }
      });
    });

    this.setState({
      filteredlatestNetworkAndStoresSearchResults: filteredResults,
      filterText: 'FILTERED BY\nTAG: #' + passedTag.toUpperCase(),
      filterImage: Images.HopprLogoPlaceholder,
      filterColor: 'lightblue',
      filterImageStyle: normalFilterImageStyle,
    });

    Keyboard.dismiss();
  };

  _renderTextInputForAutocomplete = () => {
    return (
      <TextInput
        autoFocus={true}
        style={{
          zIndex: 99999,
          color: 'white',
          borderRadius: 30,
          border: 0.5,
          paddingLeft: 3,
          flex: 1,
        }}
        placeholder={' Search tags...'}
        placeholderTextColor={'white'}
        onChangeText={text => this.getTagAutocomplete(text)}
        ref={component => (this._textInput = component)}
      />
    );
  };

  _renderTagFilterAutocomplete = () => {
    if (
      typeof this.state.filteredlatestNetworkAndStoresSearchResults !==
      'undefined'
    ) {
      if (this.state.filteredlatestNetworkAndStoresSearchResults.length > 0) {
        return (
          <View style={{flex: 1}}>
            <Autocomplete
              ref={'tagAutocomplete'}
              hideResults={this.state.hideAutocompleteResults}
              data={this.state.latestNetworkTagsAutocompleteSearchResults}
              //defaultValue={this.state.latestTagSearchTerm}
              inputContainerStyle={{
                backgroundColor: 'silver',
                color: 'black',
                maxHeight: 40,
                width: halfmodalContentMaxWidth - 24,
                height: 34,
                minHeight: 50,
                borderWidth: 0.5,
                borderRadius: 30,
                borderColor: '#ff6c52',
              }}
              listStyle={{
                zIndex: 99999,
                position: 'absolute',
                borderTopWidth: 1,
                top: 0,
                left: 12,
                maxWidth: halfmodalContentMaxWidth - 48,
                borderColor: '#ff6c52',
                borderRadius: 8,
                border: 1,
                backgroundColor: 'silver',
              }}
              onChangeText={text => this.getTagAutocomplete(text)}
              renderTextInput={() => this._renderTextInputForAutocomplete()}
              renderItem={(item, i) => (
                <TouchableHighlight
                  onPress={() => {
                    //alert("wjattt");
                    this._filterNetworkResults(item);
                    this.setState({hideAutocompleteResults: true});
                  }}>
                  <Text style={{zIndex: 99999, color: 'white', fontSize: 18}}>
                    {' ' + '#' + item}
                  </Text>
                </TouchableHighlight>
              )}
            />

            {/* RENDER FIRST CART BUTTON */}
            <View
              style={{
                position: 'absolute',
                top: 5,
                right: Platform.OS == 'android' ? 8 : 4,
                zIndex: 99996,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignContent: 'center',
                  zIndex: 99997,
                }}>
                <View
                  style={
                    {
                      // alignItems: "center",
                      // alignContent: "center",
                    }
                  }>
                  <TouchableOpacity
                    onPress={async () => {
                      this.clearAllStateData();
                      await this._getCurrentLocationAndUpdatePickedLocationIfSuccessful();
                    }}>
                    <Image
                      style={{
                        alignSelf: 'center',
                        margin: 0,
                        maxHeight: 38,
                        height: 38,
                        width: 38,
                        zIndex: 99999,
                      }}
                      source={Images.Close3}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      }
    }
  };

  showToast = message => {
    this.refs.nearestStoresToast.show(message, DURATION.LENGTH_LONG);
  };

  openNetworkDisplayModal = () => {
    this.props.updateModalState('networkDisplayModal', true);
  };

  closeNetworkDisplayModal = () => {
    this.props.updateModalState('networkDisplayModal', false);
  };

  clearAllStateData = () => {
    this.setState(this.getInitalState());
  };

  _resetHomeStackAndGo = routeName => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: routeName})],
    });
    this.props.navigation.dispatch(resetAction);
  };

  render = () => {
    const {headerText, openClosed, openMe, closeMe, css, ...props} = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    console.debug('In nearest stores and networks modal');
    return (
      <Modal
        style={{
          height: isIphoneX() ? height - 100 : height - 30,
          backgroundColor: '#fff',
          borderRadius: 20,
          width: modalWidth,
          borderWidth: 1,
          borderColor: '#ff8873',
        }}
        position={'center'}
        animationDuration={100}
        ref={'nearestStoresAndNetworksModal'}
        isOpen={this.props.openClosed}
        onClosed={() => {
          this.clearAllStateData();
          this.closeMe();
        }}
        swipeToClose={false}
        backdropPressToClose={true}
        onOpened={async () => {
          await this.load();
        }}>
        <View
          style={{
            flex: 1,
            borderRadius: 8,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: 'hidden',
          }}>
          {this._renderMapView()}
          <View
            style={{
              flex: 1,
              zIndex: 10,
              maxHeight: 48,
              minHeight: 48,
              width: maxContentWidth,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'pink',
                paddingBottom: 0,
                flex: 1,
                paddingRight: 3,
                marginRight: 3,
                width: halfmodalContentMaxWidth - 24,
                left: 22,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                borderWidth: 0,
              }}>
              {this._renderTagFilterAutocomplete()}
            </View>

            {/* END BUTTONS */}

            <View
              style={{
                borderWidth: 1,
                borderColor: 'pink',
                paddingBottom: 0,
                paddingRight: 3,
                marginRight: 3,
                width: halfmodalContentMaxWidth - 10,
                right: 0,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                borderWidth: 0,
              }}>
              {this._renderFilterText()}
            </View>
          </View>

          <ScrollView
            style={{
              flex: 1,
              marginTop: 5,
              overflow: 'hidden',
            }}>
            {this._showNetworkList()}
          </ScrollView>

          {/* NETWORK INFO VIEW */}
          {/* <View style={{ flex: 1, marginTop: 10 }}>
              {this._renderNetworkDisplay(this.state.currentlySelectedNetwork)}
            </View> */}
        </View>
        <Toast
          ref="nearestStoresToast"
          style={{backgroundColor: 'black'}}
          position="bottom"
          positionValue={200}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={0.8}
          textStyle={{color: 'white'}}
        />
      </Modal>
    );
  };
}

const mapDispatchToProps = dispatch => {
  const modalActions = require('@redux/ModalsRedux');
  const locationActions = require('@redux/LocationRedux');
  const networkActions = require('@redux/CategoryRedux'); //saves latest picked network
  return {
    changeNetwork: async passedNetworkId => {
      try {
        EventRegister.emit('resetStacksAndGo');
        console.debug('Chnaging netowrk');
        networkActions.actions.resetCategories(dispatch); //cleans out cats
        networkActions.actions.fetchCategories(dispatch, passedNetworkId);
      } catch (error) {
        console.debug("Couldn't change network");
      }
    },
    //UPDATE NEAREST LOCATION
    getCurrentLocation: async () => {
      console.debug('gettign current location');
      try {
        dispatch(locationActions.actions.getCurrentLocation(dispatch));
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
    /**This updates the network that they queries 'info' about (netwrok details) for the network display modal - takes Network / NetworkDTO */
    updateLatestNetworkForInfoQuery: network => {
      try {
        dispatch(
          networkActions.actions.updateLatestQueriedNetwork(
            dispatch,
            network.network,
          ),
        );
      } catch (error) {
        toast("Can't update latest network to redux");
        console.debug(error);
      }
    },
  };
};

const mapStateToProps = state => {
  return {
    user: state.user,
    modalsArray: state.modals.modalsArray,
    currrentPosition: state.location.currentPosition,
    latestQueriedNetwork: state.categories.latestQueriedNetwork,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(withTheme(NearestStoresAndNetworksSearchModal));
