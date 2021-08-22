import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  GlobalStyle,
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
import {EventRegister} from 'react-native-event-listeners';
import Autocomplete from 'react-native-autocomplete-input';
import {isIphoneX} from 'react-native-iphone-x-helper';
import LayoutHelper from '../../../services/LayoutHelper';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import {duration} from 'moment';
import SoundPlayer from 'react-native-sound-player';

const iconSize = 30;
const iconSize2 = 40;
const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const INITIAL_LATITUDE = 51.5397824;
const INITIAL_LONGITUDE = -0.1435601;
//const LATITUDE_DELTA = 0.0922;
const LATITUDE_DELTA = 0.005;
const addressInputViewHeight = 105;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const styles = StyleSheet.create({
  //where does the suggeston box go?
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

const {width, height} = Dimensions.get('window');

class LocationPickerModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showManualInput: false,
      alertPickerShown: false,
      loadFired: false,
      currentLocation: undefined,
      latestPickerDestinationText: 'Nowhere',
      pickedLatLng: undefined,
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

    this.resetCurrentSearchAddressText = () => {
      this.setState({currentSearchAddressText: ''});
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
          //this.refs.toast.show("locaiton state updated");

          // this.refs.toast.show(
          //   "New location address"// + geoResult.formattedAddress
          // );

          //            await this.moveMapToCurrentLocation();
          // if(shouldCenterMap)
          // {
          //   await this.moveMapToCurrentLocation();
          // }

          if (shouldSetMap) {
            if (this.state.alertPickerShown == false) {
              this.setState({alertPickerShown: true});
            }
          }
        });

        return position;
      });
    };

    this.getPossibleAddresses = async addressText => {
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
            this.refs.toast.show(
              "Couldn't find an address!! Please try again.",
            );
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

    this.moveMapToCurrentLocation = async () => {
      //just scroll the map to current location but don't
      //   this.currentLocationMarker.animateMarkerToCoordinate({
      //     latitude: this.state.currentLocation.latitude,
      //     longitude: this.state.currentLocation.longitude
      //   });
      //this updates current location
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

        this.props.pushCurrentPickerLocationAsOrderDestination(
          this.state.pickedLatLng,
          this.state.latestPickerDestinationText,
          this.state.fullGeoDestinationAddress,
        );

        //updater redux for HorizonList/index location picker
        this.props.updateLatestLocationText(
          this.state.latestPickerDestinationText,
        );

        //reset menu after completed!!
        EventRegister.emit(
          'getShoppingNetworksAndRefreshCurrentlySelectedNetwork',
        );
        EventRegister.emit('setlocationInputToStartOfText');
        this.closeMe();
      }
    };

    this.moveMarkerAndPickLocation = async (lat, lng) => {
      console.debug('clicked map');

      const newCoordinate = {
        latitude: lat,
        longitude: lng,
      };

      // if (Platform.OS === "android") {
      //   if (this.currentLocationMarker) {
      //     this.currentLocationMarker.animateMarkerToCoordinate(newCoordinate);
      //   }
      // } else {
      //   this.state.coordinate
      //     .timing({ ...newCoordinate, duration: 500 })
      //     .start();
      // }

      // this._pickerMapView.animateToRegion({
      //   latitude: lat,
      //   longitude: lng,
      //   latitudeDelta: LATITUDE_DELTA,
      //   longitudeDelta: LONGITUDE_DELTA,
      // });

      //do geocode for whereever was clicked
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
          //when you click, change textinput for easy edit
          this._copyLatestPickerDestinationTextToAddressInput(
            this.state.latestPickerDestinationText,
          );
        },
      );
      //this.currentLocationMarker.coordinate = coordAndPick.coordinate;
      //do a geolocation and put the address in a prop
    };

    //end class
  }

  _copyLatestPickerDestinationTextToAddressInput = latestText => {
    this.setState({currentSearchAddressText: latestText}, () => {
      console.debug('stop');
      //this._addressTextInput.setNativeProps({ selection: { start: 0, end: 0 } })
    });
  };

  load = async () => {
    if (!this.state.loadFired) {
      try {
        //EventRegister.emit("showSpinner");
        this.setState({alertPickerShown: false});
        this.setState({loadFired: true});
        if (await MapWorker.requestLocationPermission()) {
          BackgroundGeolocation.getCurrentLocation(async position => {
            this._pickerMapView.animateToRegion({
              latitude: position.latitude,
              longitude: position.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
            //ge
            let geoResult = await this.reverseGeocode(
              position.latitude,
              position.longitude,
            );

            if (typeof geoResult !== 'undefined') {
              this.setState({
                currentSearchAddressText: geoResult.formattedAddress,
                latestPickerDestinationText: geoResult.formattedAddress,
              });
            }
            // EventRegister.emit("hideSpinner");
            Alert.alert(
              'Friend, your current location...',
              'Set it as the delivery destination?',
              [
                {
                  text: 'Yes, please!',
                  onPress: async () => {
                    try {
                      EventRegister.emit('showSpinner');
                      await this.SetCurrentLocationAsPickedLocation();
                      await this.makeSureLocationSetThenClose();
                      showMessage({
                        message: "Let's do it!",
                        description: "You're ready to roll.",
                       // backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                       backgroundColor:"silver", 
                       color: 'white', // text color,
                        autoHide: true,
                        duration: 700,
                        style: {
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                        },
                        position: 'center',
                      });
                    } catch (error) {
                    } finally {
                      EventRegister.emit('hideSpinner');
                    }
                  },
                },
                {
                  text: 'Adjust',
                  onPress: async () => {
                    try {
                      EventRegister.emit('showSpinner');
                      await this.SetCurrentLocationAsPickedLocation();
                    } catch (error) {
                    } finally {
                      EventRegister.emit('hideSpinner');
                    }
                  },
                },
                {
                  text: 'Edit last set address',
                  onPress: async () => {
                    try {
                      EventRegister.emit('showSpinner');

                      this.setState({
                        currentSearchAddressText:
                          this.props.latestPickerDestinationText,
                        latestPickerDestinationText:
                          this.props.latestPickerDestinationText,
                      });

                      if (
                        typeof this.props.mostRecentOrderDestinationLatLng
                          .lat !== 'undefined' &&
                        typeof this.props.mostRecentOrderDestinationLatLng
                          .lng !== 'undefined'
                      ) {
                        this._pickerMapView.animateToRegion({
                          latitude:
                            this.props.mostRecentOrderDestinationLatLng.lat,
                          longitude:
                            this.props.mostRecentOrderDestinationLatLng.lng,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        });
                      }
                      //await this.SetCurrentLocationAsPickedLocation();
                    } catch (error) {
                    } finally {
                      EventRegister.emit('hideSpinner');
                    }
                  },
                },
                // { text: "Type it", onPress: () =>
                // {
                //   this.resetCurrentSearchAddressText();
                // }
                // },
              ],
              {cancelable: false},
            );

            await this.getCurrentLocation(true, true);
            console.debug('Permissions enabled');
            Keyboard.dismiss();
            // setTimeout(async ()=>{
            //   await this.moveMapToCurrentLocation();
            //   await this.SetCurrentLocationAsPickedLocation();
            // }, 200);
          });
        } else {
          alert("Location permissions weren't enabled! This won't work.");
        }
      } catch (error) {}
    }
  };

  ///HAVE to render differnet marker type depending on platform
  renderPickerMarker = () => {
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

  _renderLocationAutocomplete = () => {
    let locationAutocompleteWidth = width - 20;
    return (
      <View
        style={{
          zindex: 99998,
          elevation: 99998,
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderColor: '#DEE5EE',
          borderWidth: 2,
          alignItems: 'center',
          borderRadius: 50,
          width: '90%',
          justifyContent: 'space-between',
          marginTop: 10,
          marginBottom: 20,
        }}>
        <Autocomplete
          placeholder={' 14 Baker Street London W1U 3BU'}
          data={this.state.locationAutocompletePossibleResults}
          inputContainerStyle={{
            zIndex: 9998,
            borderWidth: 0,
            height: 40,
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
          renderTextInput={() => this._renderTextInputForLocationAutocomplete()}
          renderItem={(item, i) => (
            <TouchableOpacity
              onPress={async () => {
                console.debug('');
                //alert("Value in item was: " + item)
                this.setState({
                  currentSearchAddressText: item.item,
                  locationAutocompletePossibleResults: [],
                });
                await this.getPossibleAddresses(item.item);
                this._copyLatestPickerDestinationTextToAddressInput(item.item);
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  borderWidth: 0,
                  padding: 2,
                  paddingLeft: 3,
                  borderRadius: 20,
                  maxWidth: locationAutocompleteWidth + 400,
                  zIndex: 99999,
                  elevation: 99999,
                }}>
                <Text
                  style={{
                    fontFamily: Constants.fontFamily,
                    color: GlobalStyle.modalTextBlackish.color,
                    maxWidth: locationAutocompleteWidth + 400,
                    fontSize: 18,
                  }}>
                  {' Update destination: ' + item.item}
                </Text>
              </View>
            </TouchableOpacity>
          )}></Autocomplete>

        {this._renderManualADdressInput()}
        {/* RENDER A BUTTON TO SHOW Manual */}
      </View>
    );
  };

  _renderManualADdressInput = () => {
    if (this.state.showManualInput) {
      return (
        <View
          style={{
            zindex: 99999,
            elevation: 99999,
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderColor: '#DEE5EE',
            borderWidth: 2,
            alignItems: 'center',
            borderRadius: 50,
            width: '100%',
            padding: 6,
            justifyContent: 'space-between',
            //marginTop: 20,
            position: 'absolute',
            top: 50,
          }}>
          <TextInput
            style={{
              flex: 1,
              fontSize: 14,
              borderRadius: 50,
              minHeight: 50,
              fontFamily: Constants.fontFamily,
              color: GlobalStyle.modalTextBlackish.color,
              backgroundColor: 'white',
              zIndex: 99999,
              marginLeft: 4,
            }}
            //autoCorrect={true}
            //autoCapitalize={"sentences"}
            multiline={true}
            placeholder={
              ' Put your postcode in the address search above, then add any additional details here (e.g. flat 3, top floor)'
            }
            placeholderTextColor={GlobalStyle.modalTextBlackish.color}
            value={this.props.manualAddressPrefixInput}
            onChangeText={text =>
              this.props.updateManualAddressPrefixInput(text)
            }
            ref={el => (this._addressTextInput = el)}
          />
        </View>
      );
    }
  };

  /**For location Autocomplete */
  _renderTextInputForLocationAutocomplete = () => {
    let placeHolder = this.state.showManualInput
      ? 'Enter postcode'
      : 'Address search (or click icon for manual)';

    return (
      <TextInput
        style={{
          flex: 1,
          fontSize: 14,
          borderRadius: 50,
          fontFamily: Constants.fontFamily,
          color: GlobalStyle.modalTextBlackish.color,
          backgroundColor: 'white',
          zIndex: 99999,
          marginLeft: 4,
        }}
        // multiline={true}
        //autoCorrect={true}
        returnKeyType="next"
        //autoCapitalize={"sentences"}
        placeholder={' ' + placeHolder}
        placeholderTextColor={GlobalStyle.modalTextBlackish.color}
        value={this.state.currentSearchAddressText}
        onChangeText={text => this.getLocationAutocomplete(text)}
        ref={el => (this._addressTextInput = el)}
      />
    );
  };

  getLocationAutocomplete = async phrase => {
    try {
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

        this.setState(
          {locationAutocompletePossibleResults: ourGeoResult},
          () => {
            console.debug('Yoooo');
          },
        );
        //then save the results to the place where dropdown is mapped
        //this.props.updateProductAutocompleteSearchResults(phrase, result);
      }
    } catch (error) {}
  };

  _toggleManualInput = () => {
    let newVal = this.state.showManualInput == false ? true : false;
    this.setState({showManualInput: newVal});

    if (newVal == true) {
      SoundPlayer.playSoundFile('smbpowerup', 'mp3');
      showMessage({
        message:
          'Enter your postcode into the top address search (e.g. NW6 2QR) and confirm it.',
        description:
          'Then any specific address details into the new field provided (e.g. 72 Billington Tower, Discovery Yard)',
        backgroundColor: 'hotpink', // background color
        color: 'white', // text color,
        autoHide: true,
        duration: 25000,
        style: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        position: 'bottom',
      });
    }
  };

  render = () => {
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

    const addressInputViewHeight = 105;
    let positoinOfTextView =
      this.state.showManualInput == true ? 30 + 53 : 30 + 53;
    let heightOfTextView =
      this.state.showManualInput == true
        ? addressInputViewHeight + addressInputViewHeight
        : addressInputViewHeight;

    return (
      <TouchableWithoutFeedback>
        <Modal
          style={{
            zIndex: 9999,
            height: LayoutHelper.getDynamicModalHeight(),
            backgroundColor: '#fff',
            borderRadius: 20,
            width: width - 8,
            borderWidth: 1,
            overflow: 'hidden',
            borderColor: GlobalStyle.primaryColorDark.color,
          }}
          swipeToClose={false}
          position={'center'}
          animationDuration={100}
          onOpened={async () => await this.load()}
          ref={'locationPickerModal'}
          isOpen={this.props.openClosed}
          // isOpen={true}
          onClosed={() => {
            this.setState({loadFired: false});
            this.closeMe();
          }}>
          <Header
            backgroundColor={GlobalStyle.primaryColorDark.color}
            outerContainerStyles={{
              //height: isIphoneX() ? 79 : 49,
              height: 49,
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19,
              // marginTop: is,
            }}
            rightComponent={{
              icon: 'close',
              color: '#fff',
              onPress: () => this.props.closeMe(),
            }}
            centerComponent={{
              text: 'Choose your destination',
              style: {color: '#fff'},
            }}
          />

          {/* START SEARCH BAR VIEW */}
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              top: Platform.OS === 'android' ? 0 : 0, //for center align
            }}>
            {/* COLUMN */}

            {this._renderLocationAutocomplete()}
          </View>

          {/* END SEARCH */}

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
                width: '100%',
                borderRadius: 30,
                overflow: 'hidden',
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#AFBECD',
                  marginTop: '5%',
                  paddingLeft: 3,
                  paddingRight: 3,
                  marginBottom: '5%',
                  fontFamily: Constants.fontFamily,
                }}>
                {'Going to: ' + this.state.latestPickerDestinationText}
              </Text>
            </View>
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
                  this._toggleManualInput();
                }}>
                <View
                  style={{alignContent: 'center', justifyContent: 'center'}}>
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
                    {'Manual'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SET CURRENT AND GO */}
              <TouchableOpacity
                onPress={async () => {
                  await this.SetCurrentLocationAsPickedLocation();
                }}>
                <View
                  style={{alignContent: 'center', justifyContent: 'center'}}>
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
                    {'Here'}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* CLEAR*/}
              <TouchableOpacity
                onPress={() => {
                  this.props.updateManualAddressPrefixInput('');
                  this.resetCurrentSearchAddressText();
                  this.setState({locationAutocompletePossibleResults: []});
                }}>
                <View
                  style={{alignContent: 'center', justifyContent: 'center'}}>
                  <Image
                    source={Images.NewAppReskinIcon.Close}
                    style={{width: iconSize, height: iconSize, margin: 4}}
                  />
                  <Text
                    style={{
                      fontFamily: Constants.fontFamilyMedium,
                      color: 'white',
                      fontSize: 12,
                      textAlign: 'center',
                    }}>
                    {'Clear'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SET AND GO */}
              <TouchableOpacity
                onPress={() => {
                  this.makeSureLocationSetThenClose();
                }}>
                <View
                  style={{alignContent: 'center', justifyContent: 'center'}}>
                  <Image
                    source={Images.NewAppReskinIcon.OKButton}
                    style={{width: iconSize, height: iconSize, margin: 4}}
                  />
                  <Text
                    style={{
                      fontFamily: Constants.fontFamilyMedium,
                      color: 'white',
                      fontSize: 12,
                      textAlign: 'center',
                    }}>
                    {'Confirm'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          {/* END BUTTONS */}

          {/* START OF MAIN VIEW */}
          <View
            style={{
              zIndex: -1,
              ...StyleSheet.absoluteFillObject,
              //justifyContent: "flex-end",
              //alignItems: "center",
              position: 'absolute',
            }}>
            <MapView
              // provider={PROVIDER_GOOGLE} // remove if
              onRegionChangeComplete={e => {
                this.setState(
                  {locationAutocompletePossibleResults: [], dragRegion: e},
                  () => {
                    this.moveMarkerAndPickLocation(e.latitude, e.longitude);
                  },
                );
              }}
              ref={mapView => {
                this._pickerMapView = mapView;
              }}
              onPress={() => Keyboard.dismiss()}
              initialRegion={this.state.dragRegion}
              // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              customMapStyle={Config.MapThemes.SecondaryMapTheme}></MapView>
          </View>

          {/* <View style={{ borderRadius: 10 }}> */}
          <Toast
            ref="toast"
            style={{backgroundColor: 'black'}}
            position="top"
            duration={2200}
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
      </TouchableWithoutFeedback>
    );
  };

  componentWillUnmount = () => {
    try {
      EventRegister.removeEventListener(this.setHereAsCurrentOrderDestination);
      this.unsubscribeWillFocus();
    } catch (error) {}
  };

  componentDidMount = async () => {
    console.debug('in location picker modal');

    this.setHereAsCurrentOrderDestination = EventRegister.addEventListener(
      'setHereAsCurrentOrderDestination',
      async () => {
        await this.SetCurrentLocationAsPickedLocation();
        this.makeSureLocationSetThenClose();
      },
    );

    this.unsubscribeWillFocus = this.props.navigation.addListener(
      'willFocus',
      this.load,
    );
    this._pickerMapView.animateToViewingAngle(90, 300);

    // await this.load();
    await this.load();
  };
}

const mapStateToProps = state => {
  return {
    manualAddressPrefixInput: state.location.manualAddressPrefixInput,
    latestPickerDestinationText: state.location.latestPickerDestinationText,
    mostRecentOrderDestinationLatLng:
      state.location.mostRecentOrderDestinationLatLng,
    //currentLocation: state.location.currentPosition.coords,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux/LocationRedux');
  const storeActions = require('@redux/StoreRedux');
  return {
    updateManualAddressPrefixInput: newText => {
      dispatch(actions.updateManualAddressPrefixField(dispatch, newText));
    },
    //this sets the order location
    updateLatestLocationText: newText => {
      dispatch(actions.updateTextInputBackingField(dispatch, newText));
    },
    pushCurrentPickerLocationAsOrderDestination: async (
      pickedLatLng,
      latestPickerDestinationText,
      fullGeoDestinationAddress,
    ) => {
      dispatch(
        actions.setOrderDestination(
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
)(withTheme(LocationPickerModal));
