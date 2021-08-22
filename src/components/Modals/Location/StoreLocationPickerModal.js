import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
import {
  Image,
  View,
  Alert,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'; 
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {
  Color,
  Languages,
  Styles,
  Constants,
  GlobalStyle,
  withTheme,
  Config,
} from '@common';
import {Button as ElButton, Header, Icon, Divider} from 'react-native-elements';
import {Images} from '@common';
import {toast} from '../../../Omni';
import MapView, {
  ProviderPropType,
  Marker,
  AnimatedRegion,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {TextInput} from '@components';
import GeoWorker from '@services/GeoWorker';
import MapWorker from '@services/MapWorker';
import {connect} from 'react-redux';
import Toast, {DURATION} from 'react-native-easy-toast';
import HopprWorker from '../../../services/HopprWorker';

import Autocomplete from 'react-native-autocomplete-input';
import TextTicker from 'react-native-text-ticker';
import LayoutHelper from '../../../services/LayoutHelper';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';

const iconSize = 30;
const iconSize2 = 40;
const screen = Dimensions.get('window');
const width = screen.width;
const height = screen.height;
const ASPECT_RATIO = screen.width / screen.height;
const INITIAL_LATITUDE = 51.5397824;
const INITIAL_LONGITUDE = -0.1435601;
//const LATITUDE_DELTA = 0.0922;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const addressInputViewHeight = 105;
let positoinOfTextView = 30 + 53;
let heightOfTextView = addressInputViewHeight;

const styles = StyleSheet.create({
  autocompleteSuggestionTopPosition: Platform.OS === 'ios' ? 0 : 0,
  autocompleteSuggestionLeftPosition: Platform.OS === 'ios' ? 21 : 14,
  // DRIVER CONTROLS
  driverControlsButton: {
    margin: 1,
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
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  container: {
    backgroundColor: Color.background,
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

class StoreLocationPickerModal extends Component {
  constructor(props) {
    super(props);

    console.debug('In store location picker modal');

    console.debug('in store locaiton picker modal');
    this.state = {
      hasLoaded: false,
      currentLocation: {
        latitude: INITIAL_LATITUDE,
        longitude: INITIAL_LONGITUDE,
      },
      latestPickerDestinationText: 'Nowhere',
      pickedLatLng: undefined,
      //added when modal updated
      currentSearchAddressText: '',
      coordinate: new AnimatedRegion({
        latitude: INITIAL_LATITUDE,
        longitude: INITIAL_LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }),
      locationAutocompletePossibleResults: [], //for autocomplete
      currentLocationAutoSearchTerm: '', //for autocomplete
    };

    this.setUserStoreLocationAsPickedLocationIfExists = () => {
      //if the store HAS an existing location, pick that
      let lastSavedLoc = this.props.lastSavedCurrentLocation;
      if (
        typeof lastSavedLoc !== 'undefined' &&
        lastSavedLoc != null &&
        lastSavedLoc.lat != null
      ) {
        let cooord = {};
        cooord.coordinate = {};
        cooord.coordinate.latitude = lastSavedLoc.lat;
        cooord.coordinate.longitude = lastSavedLoc.lng;

        this.setState({
          currentLocation: {
            latitude: lastSavedLoc.lat,
            longitude: lastSavedLoc.lng,
          },
        });
        this.moveMarkerAndPickLocation(cooord);
      }
    };

    this.getCurrentLocation = async (
      shouldCenterMap = false,
      shouldSetMap = false,
    ) => {
      BackgroundGeolocation.getCurrentLocation(async position => {
        let newPOs = {
          latitude: position.latitude,
          longitude: position.longitude,
        };

        this.setState({currentLocation: newPOs}, async () => {
          if (shouldSetMap) {
            if (this.state.alertPickerShown == false) {
              this.setState({alertPickerShown: true});
            }
          }
        });

        return position;
      });
    };

    this.SetCurrentLocationAsPickedLocation = async () => {
      //get location then set
      await this.moveMapToCurrentLocation();

      const newCoordinate = {
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
      };

      if (Platform.OS === 'android') {
        if (this.currentLocationMarker) {
          this.currentLocationMarker.animateMarkerToCoordinate(
            newCoordinate,
            250,
          );
        }
      } else {
        this.state.coordinate.timing({...newCoordinate, duration: 250}).start();
      }

      //do geocode for whereever was clicked
      let geoResult = await this.reverseGeocode(
        this.state.currentLocation.latitude,
        this.state.currentLocation.longitude,
      );

      if (typeof geoResult !== 'undefined') {
        this.setState(
          {
            latestPickerDestinationText: geoResult.formattedAddress,
            pickedLatLng: {
              lat: this.state.currentLocation.latitude,
              lng: this.state.currentLocation.longitude,
            },
            fullGeoDestinationAddress: geoResult,
          },
          () => {
            //when you click, change textinput for easy edit
            this._copyLatestPickerDestinationTextToAddressInput(
              geoResult.formattedAddress,
            );
          },
        );
      } else {
        showMessage({
          message: 'Sorry...',
          description:
            "We couldn't get a geocode result for that address! Please pick another!",
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          color: 'white', // text color,
          autoHide: true,
          duration: 700,
          style: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          position: 'center',
        });
        //this.refs.toast.show("We couldn't get a geocode result for that address! Please pick another!");
        //alert("We couldn't get a geocode result for that address! Please pick another!")
      }
    };

    this.resetCurrentSearchAddressText = () => {
      this.setState({currentSearchAddressText: ''});
    };

    this.moveMapToCurrentLocation = async () => {
      let currentLocTest = await this.getCurrentLocation();
      console.debug('about to animate');
      this._pickerMapView.animateToRegion({
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    };

    this.makeSureLocationSetThenClose = async () => {
      if (typeof this.state.pickedLatLng === 'undefined') {
        this.refs.toast.show("You haven't actually picked anywhere!!");
      } else {
        this.refs.toast.show(
          'Location set as: ' + this.state.latestPickerDestinationText,
        );
        //send current lat/lng to redux then close

        this.props.pushCurrentPickerLocationAsStoreLocation(
          this.state.pickedLatLng,
          this.state.latestPickerDestinationText,
          this.state.fullGeoDestinationAddress,
        );

        this.closeMe();
      }
    };

    this.moveMarkerAndPickLocation = async (lat, lng) => {
      console.debug('clicked map');
      const newCoordinate = {
        latitude: lat,
        longitude: lng,
      };
      let geoResult = await this.reverseGeocode(lat, lng);
      this.setState(
        {
          latestPickerDestinationText: geoResult.formattedAddress,
          pickedLatLng: {
            lat: lat,
            lng: lng,
          },
          fullGeoDestinationAddress: geoResult,
        },
        () => {
          this._copyLatestPickerDestinationTextToAddressInput(
            this.state.latestPickerDestinationText,
          );
        },
      );
    };
    //end
  }

  _renderLocationAutocomplete = () => {
    let locationAutocompleteWidth = width;
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderColor: '#DEE5EE',
          borderWidth: 2,
          alignItems: 'center',
          borderRadius: 50,
          width: '90%',
          justifyContent: 'space-between',
          marginTop: 20,
        }}>
        <Autocomplete
          data={this.state.locationAutocompletePossibleResults}
          inputContainerStyle={{
            zIndex: 9998,
            borderWidth: 0,
            height: 40,
            width: '90%',
          }}
          containerStyle={{
            zIndex: 9998,
            width: '90%',
          }}
          //defaultValue={this.state.locationAutocompleteLatestSearchTerm}
          listStyle={{
            width: locationAutocompleteWidth - 100,
            borderWidth: 1,
            borderColor: 'grey',
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,1)',
            top: styles.autocompleteSuggestionTopPosition,
            zindex: 99998,
            left: styles.autocompleteSuggestionLeftPosition,
            borderTopWidth: 0,
            fontSize: 12,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          clearButtonMode={'always'}
          placeholder={' 14 Baker Street London W1U 3BU'}
          renderTextInput={() => this._renderTextInputForLocationAutocomplete()}
          renderItem={(item, i) => (
            <TouchableOpacity
              onPress={async () => {
                try {
                  console.debug('');
                  this.setState({
                    currentSearchAddressText: item.item,
                    locationAutocompletePossibleResults: [],
                  });
                  await this.getPossibleAddresses(item.item);
                  this._copyLatestPickerDestinationTextToAddressInput(
                    item.item,
                  );
                } catch (error) {
                  this.setState({
                    currentSearchAddressText: item.item,
                    locationAutocompletePossibleResults: [],
                  });
                } finally {
                }
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  borderWidth: 0,
                  padding: 5,
                  borderRadius: 20,
                  maxWidth: locationAutocompleteWidth + 900,
                  zIndex: 99999,
                  elevation: 99999,
                }}>
                <Text
                  style={{
                    fontFamily: Constants.fontFamily,
                    color: GlobalStyle.modalTextBlackish.color,
                    maxWidth: locationAutocompleteWidth + 500,
                    fontSize: 14,
                  }}>
                  {item.item}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#DEE5EE',
            width: 40,
            height: 40,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => this.getLocationAutocomplete('')}>
          <Image
            source={require('../../../../assets/icons/Close.png')}
            style={{width: 20, height: 20, tintColor: '#95A3AF'}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  _copyLatestPickerDestinationTextToAddressInput = latestText => {
    this.setState({currentSearchAddressText: latestText}, () => {
      console.debug('stop');
      //this._addressTextInput.setNativeProps({ selection: { start: 0, end: 0 } })
    });
  };

  getPossibleAddresses = async addressText => {
    console.debug('Searching for address text:' + addressText);
    if (addressText !== '') {
      let tries = 6;
      let didItWork = false;
      let geoResult;

      try {
        do {
          geoResult = await GeoWorker.geocode(addressText.trim());
          tries = tries - 1;
          if (typeof geoResult !== 'undefined') {
            didItWork = true;
          }
        } while (!didItWork && tries > 0);
        console.debug('we got the result');
        if (typeof geoResult !== 'undefined') {
          const newCoordinate = {
            latitude: geoResult.position.lat,
            longitude: geoResult.position.lng,
          };

          if (Platform.OS === 'android') {
            if (typeof this.currentLocationMarker !== 'undefined') {
              this.currentLocationMarker.animateMarkerToCoordinate(
                newCoordinate,
                250,
              );
            }
          } else {
            this.state.coordinate
              .timing({...newCoordinate, duration: 250})
              .start();
          }

          this._pickerMapView.animateToRegion({
            latitude: geoResult.position.lat,
            longitude: geoResult.position.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          this.setState({
            latestPickerDestinationText: geoResult.formattedAddress,
            pickedLatLng: {
              lat: geoResult.position.lat,
              lng: geoResult.position.lng,
            },
            fullGeoDestinationAddress: geoResult,
          });
        } else {
          this.refs.toast.show("Couldn't find an address!! Please try again.");
        }
      } catch (error) {
        this.refs.toast.show("Couldn't get any results for that!!");
      }
    } else {
      this.refs.toast.show(
        'You passed in a a blank address!! Please try again.',
      );
    }
  };

  _renderPickerMarker = () => {
    if (Platform.OS === 'android') {
      return (
        <Marker
          ref={marker => {
            this.currentLocationMarker = marker;
          }}
          coordinate={{
            latitude: INITIAL_LATITUDE,
            longitude: INITIAL_LONGITUDE,
          }}
          style={{width: 100, height: 100}}>
          <Image
            source={Images.NewAppReskinIcon.LocationBlue}
            style={{width: 90, height: 90}}
          />
        </Marker>
      );
    } else {
      return (
        <Marker.Animated
          ref={marker => {
            this.currentLocationMarker = marker;
          }}
          coordinate={this.state.coordinate}
          style={{width: 100, height: 100}}>
          <Image
            source={Images.NewAppReskinIcon.LocationBlue}
            style={{width: 90, height: 90}}
          />
        </Marker.Animated>
      );
    }
  };
  /**For location Autocomplete */
  _renderTextInputForLocationAutocomplete = () => {
    return (
      <TextInput
        style={{
          flex: 1,
          fontSize: 14,
          borderRadius: 50,
          fontFamily: Constants.fontFamily,
          color: GlobalStyle.modalTextBlackish.color,
          marginLeft: 4,
          backgroundColor: 'white',
          zIndex: 99999,
        }}
        //autoCorrect={true}
        autoFocus={true}
        // multiline={true}
        //autoCorrect={true}
        returnKeyType="next"
        //autoCapitalize={"sentences"}
        value={this.state.currentSearchAddressText}
        onChangeText={text => this.getLocationAutocomplete(text)}
        ref={el => (this._addressTextInput = el)}
      />
    );
  };

  getLocationAutocomplete = async phrase => {
    this.setState({currentSearchAddressText: phrase});
    if (phrase.length > 0) {
      //save what we searched for
      let test = '';
      let geoResults = await GeoWorker.geocodeAllResults(phrase);
      let ourGeoResult = [];

      //build result set single dimenson array of strings to return
      geoResults.map(x => {
        ourGeoResult.push(x.formattedAddress);
      });

      this.setState({locationAutocompletePossibleResults: ourGeoResult}, () => {
        console.debug('Yoooo');
      });
      //then save the results to the place where dropdown is mapped
      //this.props.updateProductAutocompleteSearchResults(phrase, result);
    }
  };

  render() {
    console.debug('Now in location modal render');
    const {
      headerText,
      openClosed,
      openMe,
      closeMe,
      pickLocation,
      reverseGeocode,
      geocode,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    this.pickLocation = pickLocation;
    this.reverseGeocode = reverseGeocode;
    this.geocode = geocode;

    return (
      <Modal
        style={{
          height: LayoutHelper.getDynamicModalHeight(),
          backgroundColor: 'white',
          borderRadius: 20,
          width: width - 8,
          overflow: 'hidden',
        }}
        backdrop={true}
        position={'center'}
        ref={'storeLocationPickerModal'}
        onOpened={async () => await this.load()}
        isOpen={this.props.openClosed}
        // isOpen={true}
        // swipeToClose={false}
        onClosed={() => {
          this.unload();
          this.closeMe();
        }}>
        <Header
          backgroundColor={'#DEE5EE'}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          centerComponent={{
            text: 'Pick a store location',
            style: {fontFamily: Constants.fontFamilyBold, fontSize: 18},
          }}
          leftComponent={{
            icon: 'close',
            onPress: () => this.props.closeMe(),
          }}
        />
        {/* START SEARCH BAR VIEW */}
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}>
          {/* COLUMN */}

          {this._renderLocationAutocomplete()}

          <View
            style={{
              width: '90%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 12,
                color: '#AFBECD',
                marginTop: '5%',
                marginBottom: '2%',
                fontFamily: Constants.fontFamily,
              }}>
              {'TRADING FROM : ' +
                this.state.latestPickerDestinationText.toUpperCase()}
            </Text>
          </View>
        </View>
        {/* SECOND VIEW - BUTTONS AT BOTTOM */}
        <KeyboardAvoidingView
          behavior={'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 60}
          style={{
            width: '100%',
            // justifyContent: "flex-start",
            // flexDirection: "column",
            position: 'absolute', //use absolute position to show button on top of the map
            bottom: 0, //for center alsign
            borderColor: 'black',
            zIndex: 99999,
            // alignSelf: "flex-start" //for align to top
          }}>
          <View
            style={{
              backgroundColor: GlobalStyle.primaryColorDark.color,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              width: '100%',
              borderRadius: 20,
              paddingVertical: 5,
            }}>
            {/* TRANSPOSE */}
            <TouchableOpacity
              onPress={() => {
                alert('coming soon');
                //this._toggleManualInput();
              }}>
              <View style={{alignContent: 'center', justifyContent: 'center'}}>
                <Image
                  source={Images.NewAppReskinIcon.Edit}
                  style={{
                    alignSelf: 'center',
                    width: iconSize,
                    height: iconSize,
                    margin: 4,
                  }}
                />
                <Text
                  style={{
                    fontFamily: Constants.fontFamilyMedium,
                    color: 'white',
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  {'EDIT'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* SEARCH */}
            <TouchableOpacity
              onPress={async () => {
                await this.SetCurrentLocationAsPickedLocation();
              }}>
              <View style={{alignContent: 'center', justifyContent: 'center'}}>
                <Image
                  source={Images.NewAppReskinIcon.Search1}
                  style={{
                    alignSelf: 'center',
                    width: iconSize,
                    height: iconSize,
                    margin: 4,
                  }}
                />
                <Text
                  style={{
                    fontFamily: Constants.fontFamilyMedium,
                    color: 'white',
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  {'SEARCH'}
                </Text>
              </View>
            </TouchableOpacity>
            {/* CENTER */}
            {/* <TouchableOpacity
              onPress={async () => {
                await this.c();
              }}
            >
              <View
                style={{ alignContent: "center", justifyContent: "center" }}
              >
                <Image
                  source={Images.NewAppReskinIcon.CenterLine}
                  style={{
                    alignSelf: "center",
                    width: iconSize,
                    height: iconSize,
                    margin: 4
                  }}
                />
                <Text
                  style={{
                    fontFamily: Constants.fontFamilyMedium,
                    color: "white",
                    fontSize: 12,
                    textAlign: "center"
                  }}
                >
                  {"CENTER"}
                </Text>
              </View>
            </TouchableOpacity> */}
            {/* SET CURRENT AND GO */}
            <TouchableOpacity
              onPress={async () => {
                await this.SetCurrentLocationAsPickedLocation();
              }}>
              <View style={{alignContent: 'center', justifyContent: 'center'}}>
                <Image
                  source={Images.NewAppReskinIcon.Here}
                  style={{
                    alignSelf: 'center',
                    width: iconSize,
                    height: iconSize,
                    margin: 4,
                  }}
                />
                <Text
                  style={{
                    fontFamily: Constants.fontFamilyMedium,
                    color: 'white',
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  {'HERE'}
                </Text>
              </View>
            </TouchableOpacity>
            {/* CLEAR*/}
            <TouchableOpacity
              onPress={() => {
                // this.props.updateManualAddressPrefixInput("");
                this.resetCurrentSearchAddressText();
                this.setState({locationAutocompletePossibleResults: []});
              }}>
              <View style={{alignContent: 'center', justifyContent: 'center'}}>
                <Image
                  source={Images.NewAppReskinIcon.Close}
                  style={{width: 40, height: 40, margin: 4}}
                />
              </View>
            </TouchableOpacity>

            {/* SET AND GO */}
            <TouchableOpacity
              onPress={() => {
                this.makeSureLocationSetThenClose();
              }}>
              <View style={{alignContent: 'center', justifyContent: 'center'}}>
                <Image
                  source={Images.NewAppReskinIcon.OKButton}
                  style={{width: 40, height: 40, margin: 4}}
                />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {/* END BUTTONS */}
        {/* SECOND VIEW - BUTTONS AT BOTTOM */}
        <View
          style={{
            zIndex: -1,
            ...StyleSheet.absoluteFillObject,
            //justifyContent: "flex-end",
            //alignItems: "center",
            position: 'absolute',
          }}>
          <MapView
            ref={el => (this._pickerMapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if
            onRegionChangeComplete={e => {
              this.setState(
                {locationAutocompletePossibleResults: [], dragRegion: e},
                () => {
                  this.moveMarkerAndPickLocation(e.latitude, e.longitude);
                },
              );
            }}
            onPress={e => {
              Keyboard.dismiss();
            }}
            //provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            initialRegion={{
              latitude: this.state.currentLocation.latitude,
              longitude: this.state.currentLocation.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            customMapStyle={Config.MapThemes.SecondaryMapTheme}>
            {/* {this._renderPickerMarker()} */}
          </MapView>
        </View>
        {/* <View style={{ borderRadius: 10 }}> */}
        <Toast
          ref="toast"
          style={{backgroundColor: 'black'}}
          position="top"
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{color: 'white'}}
        />
        {/* </View> */}
        <View
          style={{
            left: '50%',
            marginLeft: -54,
            marginTop: -58,
            zindex: -1,
            position: 'absolute',
            top: '50%',
          }}>
          <Image
            source={Images.NewAppReskinIcon.LocationBlue}
            style={{width: 90, height: 90}}
          />
        </View>
      </Modal>
    );
  }

  componentDidMount = async () => {
    this._pickerMapView.animateToViewingAngle(90, 300);
  };

  unload = () => {
    this.setState({hasLoaded: false});
  };

  load = async () => {
    if (!this.hasLoaded) {
      this.hasLoaded = true;
      if (await MapWorker.requestLocationPermission()) {
        console.debug('Permissions enabled');
        //just get location, don't set it or anything - in case they want to use it, it's already tehre
        navigator.geolocation.getCurrentPosition(
          async position => {
            this.refs.toast.show('New location address in state: ' + geoResult);
          },
          //() => Alert.alert("No location","Error getting location - please make sure location is enabled!"),
        );

        this.setUserStoreLocationAsPickedLocationIfExists();
        Keyboard.dismiss();
      } else {
        alert("Location permissions weren't enabled! This won't work.");
      }
    }
  };
}

const mapStateToProps = state => {
  return {
    user: state.user,
    lastSavedCurrentLocation: state.location.storeLocationLatLng,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux/LocationRedux');
  const storeActions = require('@redux/StoreRedux');
  return {
    //this sets the store location
    pushCurrentPickerLocationAsStoreLocation: async (
      pickedLatLng,
      latestPickerDestinationText,
    ) => {
      dispatch(
        actions.setStoreLocation(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText,
        ),
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(StoreLocationPickerModal));
