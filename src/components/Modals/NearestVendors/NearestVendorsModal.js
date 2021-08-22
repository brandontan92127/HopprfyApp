import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Image,
  View,
  Animated,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {
  Color,
  Device,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle,
  Config,
} from '@common';
import {Button as ElButton, Header, Icon, Divider} from 'react-native-elements';
import {Images} from '@common';
import MapView, {PROVIDER_GOOGLE, Marker, UrlTile} from 'react-native-maps';
import {toast} from '../../../Omni';
import HopprWorker from '../../../services/HopprWorker';
import GeoWorker from '@services/GeoWorker';
import {showMessage, hideMessage} from 'react-native-flash-message';
import RandomMarkerHelper from '../../../helper/RandomMarkerHelper';
import {EventRegister} from 'react-native-event-listeners';

const baseViewHeaderPadding = 30;
const correctPhoneBaseHeaderPadding = Device.getCorrectIphoneXBaseHeaderPadding(
  baseViewHeaderPadding,
);
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / 200;
const LATITUDE_DELTA = 0.1029;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  flatListStyle: {
    paddingBottom: 10,
    backgroundColor: GlobalStyle.primaryColorDark.color,
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
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: 'center',
  },
});

class NearestVendorsModal extends React.PureComponent {
  constructor(props) {
    super(props);
    console.debug('CourierControlsModal modal constructor');
    this.state = {
      nearbyStores: [],
      //scrollPosition:0
    };
  }
  _flatListItemSeparator(itemSeparatorStyle) {
    return <View style={itemSeparatorStyle} />;
  }

  _renderItemListValues(item, index) {
    let fullNetworkImgUrl = Config.NetworkImageBaseUrl + item.storeLogoUrl;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.listRowClickTouchStyle}
        onPress={() => this._setSelectedIndex(index, item)}>
        <View
          style={[
            styles.listRowContainerStyle,
            {backgroundColor: GlobalStyle.primaryColorDark.color},
          ]}>
          <View
            style={{
              paddingLeft: 3,
              paddingRight: 3,
              flex: 1,
              flexDirection: 'row',
              alignContent: 'center',
              backgroundColor: GlobalStyle.primaryColorDark.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              style={{
                marginLeft: 8,
                padding: 8,
                maxHeight: 105,
                height: 105,
                width: 105,
                maxWidth: 105,
                //   width: undefined
              }}
              source={{
                uri: fullNetworkImgUrl,
              }}
              resizeMode="contain"
            />
            <View
              style={{
                flex: 1,
                alignContent: 'center',
                alignItems: 'center',
                paddingLeft: 4,
                paddingTop: 4,
                paddingRight: 2,
                justifyContent: 'center',
                overflow: 'visible',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: 'white',
                  fontFamily: Constants.fontHeader,
                  fontSize: 16,
                  textAlignVertical: 'center',
                }}>
                {item.name}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  textAlignVertical: 'center',
                  fontSize: 12,
                  fontFamily: Constants.fontFamilyItalic,
                }}>
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  _setSelectedIndex(index, item) {
    this.props.selectedValue(index, item);
    this.setState({selectedFlag: true});
    this.closeMe();
  }

  load = async () => {
    console.debug('in quick controls');

    let nearbyStoresRsponse = await HopprWorker.getActiveNearbyStores();
    if (nearbyStoresRsponse.status == 200) {
      this.setState({nearbyStores: nearbyStoresRsponse.data});
    }
  };

  componentDidMount = async () => {};
  componentWillUnmount = () => {};

  handleScroll = event => {
    this.props.updateCurrentScrollPosition(event.nativeEvent.contentOffset.y);
    //this.setState({ scrollPosition: event.nativeEvent.contentOffset.y });
  };

  _renderFlatListOrEmptyPlaceholder = () => {
    if (this.props.dataSource.length > 0)
      return (
        <FlatList
          ref={ref => (this.flatList = ref)}
          onScroll={this.handleScroll}
          style={styles.flatListStyle}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          extraData={this.state}
          overScrollMode="never"
          ItemSeparatorComponent={() =>
            this._flatListItemSeparator({height: 10})
          }
          keyboardShouldPersistTaps="always"
          numColumns={1}
          data={this.props.dataSource}
          renderItem={({item, index}) =>
            this._renderItemListValues(item, index)
          }
        />
      );

    return (
      <View style={{padding: 14, paddingTop: 50}}>
        <Image
          resizeMode={'contain'}
          style={{alignSelf: 'center'}}
          source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
        />
        <Text
          style={{
            textAlign: 'center',
            paddingTop: 20,
            fontFamily: Constants.fontFamilyBold,
            color: 'white',
          }}>
          {'Sorry, there were no networks nearby!'}
        </Text>
      </View>
    );
  };

  _renderMapView = () => {
    console.debug('stop');
    if (
      typeof this.props.orderDestinationLatLng !== 'undefined' &&
      typeof this.props.orderDestinationLatLng.lat !== 'undefined' &&
      typeof this.props.orderDestinationLatLng.lng !== 'undefined'
    ) {
      return (
        <View
          style={{
            flex: 1,
          }}>
          <View
            style={{
              minHeight: 180,
              flex: 1,
              marginBottom: 6,
              borderBottomRightRadius: 25,
              borderBottomLeftRadius: 25,
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              alignItems: 'center',
              backgroundColor: '#0000',
            }}>
            <MapView
              ref={el => (this._mapView = el)}
              // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 25,
              }}
              initialRegion={{
                latitude: this.props.orderDestinationLatLng.lat,
                longitude: this.props.orderDestinationLatLng.lng,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              customMapStyle={Config.MapThemes.SecondaryMapTheme}>
              {this.state.nearbyStores.map(marker => (
                <Marker
                  //   zIndex={RandomMarkerHelper.GetRandomZIndexforMarker()}
                  coordinate={{
                    latitude: marker.lat,
                    longitude: marker.long,
                  }}
                  onPress={async () => {
                    try {
                      let geoResult = await GeoWorker.reverseGeocode(
                        marker.lat,
                        marker.long,
                      );
                      // alert('this should set current destination as marker location and refresh networks')
                      showMessage({
                        position: 'center',
                        message: 'We changed your location',
                        autoHide: true,
                        duration: 3000,
                        description:
                          'Showing products available at: ' +
                          geoResult.formattedAddress, //backgroundColor: "hotpink", // background color
                        backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                        color: 'white', // text color
                      });

                      this.props.pushCurrentPickerLocationAsOrderDestination(
                        {lat: marker.lat, lng: marker.long},
                        geoResult.formattedAddress,
                        geoResult,
                      );
                      this.closeMe();
                      //updater redux for HorizonList/index location picker
                      this.props.updateLatestLocationText(
                        geoResult.formattedAddress,
                      );
                      this.props.updateManualAddressPrefixInput('');
                      EventRegister.emit(
                        'getShoppingNetworksAndRefreshCurrentlySelectedNetwork',
                      );
                    } catch (error) {}
                  }}
                  description={marker.distance.substring(0, 3) + ' km away'}
                  title={marker.name}>
                  <Image
                    source={RandomMarkerHelper.GetRandomMarker(
                      RandomMarkerHelper.useStoreMarkers(),
                    )}
                    style={{height: 50, width: 50}}></Image>
                </Marker>
              ))}

              {/* DRIVER MARKERS */}
              {/* <Marker           
                coordinate={{
                  latitude: this.props.mostRecentOrderDestinationLatLng.lat,
                  longitude: this.props.mostRecentOrderDestinationLatLng.lng
                }}                   
                description={"Your location"}
                title={"Now At:"}
              >
                <Image
                  source={Images.MapIconStore10}
                  style={{ width: 40, maxWidth: 40, height: 40 }}
                />
              </Marker> */}
            </MapView>
          </View>
          {/* <Text
            style={{
              marginTop: "2%",
              fontSize: 12,
              color: "#79879F",
              fontFamily: Constants.fontFamily,
              alignSelf: "center"
            }}
          >
            {"YOU ARE AT: " +
              this.props.latestPickerDestinationText.toUpperCase()}
          </Text> */}
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            minHeight: 40,
            height: 40,
            padding: 20,
            margin: 20,
            paddingTop: 3,
            marginTop: 3,
            borderWidth: 1,
            borderColor: 'lightblue',
            borderRadius: 15,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
          <MapView
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={{...StyleSheet.absoluteFillObject}}
            customMapStyle={Config.MapThemes.SecondaryMapTheme}
            region={{
              latitude: this.props.orderDestinationLatLng.lat,
              longitude: this.props.orderDestinationLatLng.lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          />
        </View>
      );
    }
  };

  render() {
    console.debug('in network switcher');
    const {
      headerText,
      openClosed,
      closeMe,
      dataSource,
      selectedValue,
      marginToSubtract,
      ...props
    } = this.props;

    this.openClosed = openClosed;

    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          // marginTop:correctPhoneBaseHeaderPadding,
          //backgroundColor: GlobalStyle.primaryColorDark.color,
          height: null,
          maxHeight: height * 0.9,
          //   paddingBottom: 10,
          borderRadius: 30,
          //overflow:"hidden",
          width: width - 14,
        }}
        backdropColor={'black'}
        backdropOpacity={0.6}
        backdrop={true}
        entry={'bottom'}
        position={'center'}
        ref={'nearestVendorsModal'}
        isOpen={this.props.openClosed}
        backdropPressToClose={true}
        swipeToClose={false}
        onOpened={() => this.load()}
        onClosed={() => this.closeMe()}>
        {/* CLOSE BUTTON ABSOULTE */}
        <View
          style={{
            position: 'absolute', //use absolute position to show button on top of the map
            top: 10,
            right: 10,
            paddingRight: 3,
            marginRight: 3,
            zIndex: 100,
            // backgroundColor: "white"
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                backgroundColor: GlobalStyle.secondaryColor.color,
                borderRadius: 50,
                padding: 8,
              }}
              onPress={this.closeMe}>
              <Image
                source={Images.NewAppReskinIcon.Close}
                style={{
                  minHeight: 20,
                  maxHeight: 20,
                  maxWidth: 20,
                  minWidth: 20,
                  tintColor: '#95A4AF',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* CLOSE BUTTON ABSOULTE */}
        <View
          style={{
            position: 'absolute', //use absolute position to show button on top of the map
            top: 80,
            left: 10,
            paddingRight: 3,
            marginRight: 3,
            zIndex: 100,
            //  backgroundColor: "tra"
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                backgroundColor: GlobalStyle.secondaryColor.color,
                borderRadius: 50,
                padding: 8,
              }}
              onPress={async () => {
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
                  this.props.updateLatestLocationText(
                    geoResult.formattedAddress,
                  );
                  this.props.updateManualAddressPrefixInput('');

                  this._mapView.animateToRegion({
                    latitude: position.latitude,
                    longitude: position.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  });
                  // EventRegister.emit(
                  //   "getShoppingNetworksAndRefreshCurrentlySelectedNetwork"
                  // );
                });
              }}>
              <Image
                source={Images.NewAppReskinIcon.Here}
                style={{
                  minHeight: 40,
                  maxHeight: 40,
                  maxWidth: 40,
                  minWidth: 40,
                  tintColor: '#95A4AF',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            //backgroundColor:GlobalStyle.primaryBackgroundColor.color,
            zIndex: 99999,
            borderRadius: 30,
            maxHeight: 0,
            top: -8,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
            style={{
              minHeight: 70,
              zIndex: 99999,
              maxHeight: 70,
              maxWidth: 70,
              minWidth: 70,
            }}
          />
        </View>

        <View
          style={{
            borderRadius: 30,
            overflow: 'hidden',
            minHeight: height * 0.79,
          }}>
          {this._renderMapView()}
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            borderRadius: 30,
            overflow: 'hidden',
            opacity: 0.8,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              //color: "#AFBECD",
              color: GlobalStyle.modalTextBlackish.color,
              marginTop: 30,
              marginBottom: 2,
              fontFamily: Constants.fontFamily,
            }}>
            {'Nearby Vendors'}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              //color: "#AFBECD",
              color: GlobalStyle.modalTextBlackish.color,
              marginTop: 4,
              marginBottom: '5%',
              fontFamily: Constants.fontFamily,
            }}>
            {'to: ' + this.props.latestPickerDestinationText}
          </Text>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    latestPickerDestinationText: state.location.latestPickerDestinationText,
    orderDestinationLatLng: state.location.mostRecentOrderDestinationLatLng,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux/StoreRedux');
  const modalActions = require('@redux/ModalsRedux');
  const locationActions = require('@redux/LocationRedux');
  const driverStateActions = require('@redux/DriverRedux');
  return {
    updateCurrentScrollPosition: newOffset => {
      dispatch(
        modalActions.actions.updateNetworkSwitcherScrollOffset(newOffset),
      );
    },
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(NearestVendorsModal));
