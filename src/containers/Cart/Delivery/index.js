/** @format */

import React, {PureComponent} from 'react';
import {
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  StyleSheet,
  Keyboard,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import css from '@cart/styles';
import {ShippingMethod} from '@components';
import {
  Config,
  Validator,
  Languages,
  Constants,
  withTheme,
  Theme,
  Images,
  Color,
  GlobalStyle,
} from '@common';
import MapViewDirections from 'react-native-maps-directions';
import {connect} from 'react-redux';
import Buttons from '@cart/Buttons';
import {toast} from '@app/Omni';
import Tcomb from 'tcomb-form-native';
import {cloneDeep} from 'lodash';
import styles from './styles';
import {TextInputMask} from 'react-native-masked-text';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
const Form = Tcomb.form.Form;
import CountryPicker, {
  getAllCountries,
} from 'react-native-country-picker-modal';
import MapView, {PROVIDER_GOOGLE, Marker, UrlTile} from 'react-native-maps';

import RandomMarkerHelper from '../../../helper/RandomMarkerHelper';
import FastImage from 'react-native-fast-image';

const customStyle = cloneDeep(Tcomb.form.Form.stylesheet);
const customInputStyle = cloneDeep(Tcomb.form.Form.stylesheet);
const labelStyle = cloneDeep(Tcomb.form.Form.stylesheet);
const {width, height} = Dimensions.get('window');
const isDark = Config.Theme.isDark;

const newStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

// Customize Form Stylesheet
customStyle.textbox.normal = {
  ...customStyle.textbox.normal,
  height: 150,
  marginBottom: 200,
  color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
};
customStyle.controlLabel.normal = {
  ...customStyle.controlLabel.normal,
  fontSize: 15,
  color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
};
labelStyle.controlLabel.normal = {
  ...customStyle.controlLabel.normal,
  fontSize: 14,
  color: '#999',
  color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
};
customInputStyle.textbox.normal = {
  ...customInputStyle.textbox.normal,
  color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
};
customInputStyle.controlLabel.normal = {
  ...customInputStyle.controlLabel.normal,
  fontSize: 15,
  color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
};

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / 200;
const LATITUDE_DELTA = 0.1029;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const driverImg = RandomMarkerHelper.GetRandomMarker(
  RandomMarkerHelper.useDriverMarkers(),
);
const storeImg = RandomMarkerHelper.GetRandomMarker(
  RandomMarkerHelper.useStoreMarkers(),
);

class Delivery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: {
        firstName: '',
        lastName: '',
        streetNumber: '',
        street: '',
        state: '',
        city: '',
        zip: '',
        country: '',
        email: '',
        telephone: '',
        note: '',
      },
      cca2: 'FR',
      countryName: '',
    };

    this.initFormValues();
  }

  load = async () => {};

  unload = () => {};

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
    // const { getShippingMethod } = this.props;

    this.fetchCustomer(this.props);
    // getShippingMethod();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.user != this.props.user) {
      this.fetchCustomer(nextProps);
    }
  }

  onChange = value => this.setState({value});

  onPress = () => this.refs.form.getValue();

  initFormValues = () => {
    const countries = this.props.countries;
    // override the validate method of Tcomb lib for multi validate requirement.
    const Countries = Tcomb.enums(countries);
    const Email = Tcomb.refinement(
      Tcomb.String,
      s => Validator.checkEmail(s) === undefined,
    );
    Email.getValidationErrorMessage = s => Validator.checkEmail(s);
    const Phone = Tcomb.refinement(
      Tcomb.String,
      s => Validator.checkPhone(s) === undefined,
    );
    Phone.getValidationErrorMessage = s => Validator.checkPhone(s);

    // define customer form
    this.Customer = Tcomb.struct({
      firstName: Tcomb.String,
      last_name: Tcomb.String,
      address_1: Tcomb.String,
      ...(Config.DefaultCountry.hideCountryList ? {} : {country: Tcomb.String}),
      state: Tcomb.String,
      city: Tcomb.String,
      postcode: Tcomb.String,
      email: Email,
      phone: Tcomb.String,
      note: Tcomb.maybe(Tcomb.String), // maybe = optional
    });

    // form options
    this.options = {
      auto: 'none', // we have labels and placeholders as option here (in Engrish, ofcourse).
      // stylesheet: css,
      fields: {
        first_name: {
          label: Languages.first_name,
          placeholder: Languages.Typefirst_name,
          error: Languages.EmptyError, // for simple empty error warning.
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
        },
        last_name: {
          label: Languages.LastName,
          placeholder: Languages.TypeLastName,
          error: Languages.EmptyError,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
        },
        address_1: {
          label: Languages.Address,
          placeholder: Languages.TypeAddress,
          error: Languages.EmptyError,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
        },
        ...(Config.DefaultCountry.hideCountryList
          ? {}
          : {
              country: {
                label: Languages.TypeCountry,
                placeholder: Languages.Country,
                error: Languages.NotSelectedError,
                stylesheet: customInputStyle,
                template: this.renderCountry,
              },
            }),
        state: {
          label: Languages.State,
          placeholder: Languages.TypeState,
          error: Languages.EmptyError,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
          autoCorrect: false,
        },
        city: {
          label: Languages.City,
          placeholder: Languages.TypeCity,
          error: Languages.EmptyError,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
          autoCorrect: false,
        },
        postcode: {
          label: Languages.Postcode,
          placeholder: Languages.TypePostcode,
          error: Languages.EmptyError,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
          autoCorrect: false,
        },
        email: {
          label: Languages.Email,
          placeholder: Languages.TypeEmail,
          underlineColorAndroid: 'transparent',
          stylesheet: customInputStyle,
          autoCorrect: false,
        },
        phone: {
          label: Languages.Phone,
          placeholder: Languages.TypePhone,
          underlineColorAndroid: 'transparent',
          error: Languages.EmptyError,
          stylesheet: customInputStyle,
          template: this.renderPhoneInput,
          autoCorrect: false,
        },
        note: {
          label: Languages.Note,
          placeholder: Languages.TypeNote,
          underlineColorAndroid: 'transparent',
          multiline: true,
          stylesheet: customStyle,
          autoCorrect: false,
        },
      },
    };
  };

  renderPhoneInput = locals => {
    const stylesheet = locals.stylesheet;
    let formGroupStyle = stylesheet.formGroup.normal;
    let controlLabelStyle = stylesheet.controlLabel.normal;
    let textboxStyle = stylesheet.textbox.normal;
    let helpBlockStyle = stylesheet.helpBlock.normal;
    const errorBlockStyle = stylesheet.errorBlock;

    if (locals.hasError) {
      formGroupStyle = stylesheet.formGroup.error;
      controlLabelStyle = stylesheet.controlLabel.error;
      textboxStyle = stylesheet.textbox.error;
      helpBlockStyle = stylesheet.helpBlock.error;
    }

    const label = locals.label ? (
      <Text style={controlLabelStyle}>{locals.label}</Text>
    ) : null;
    const help = locals.help ? (
      <Text style={helpBlockStyle}>{locals.help}</Text>
    ) : null;
    const error =
      locals.hasError && locals.error ? (
        <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
          {locals.error}
        </Text>
      ) : null;

    return (
      <View style={formGroupStyle}>
        {label}
        <TextInputMask
          type={'cel-phone'}
          style={textboxStyle}
          onChangeText={value => locals.onChange(value)}
          onChange={locals.onChangeNative}
          placeholder={locals.placeholder}
          value={locals.value}
        />
        {help}
        {error}
      </View>
    );
  };

  renderCountry = locals => {
    const stylesheet = locals.stylesheet;
    let formGroupStyle = stylesheet.formGroup.normal;
    let controlLabelStyle = stylesheet.controlLabel.normal;
    let textboxStyle = stylesheet.textbox.normal;
    let helpBlockStyle = stylesheet.helpBlock.normal;
    const errorBlockStyle = stylesheet.errorBlock;

    if (locals.hasError) {
      formGroupStyle = stylesheet.formGroup.error;
      controlLabelStyle = stylesheet.controlLabel.error;
      textboxStyle = stylesheet.textbox.error;
      helpBlockStyle = stylesheet.helpBlock.error;
    }

    const label = locals.label ? (
      <Text style={controlLabelStyle}>{locals.label}</Text>
    ) : null;
    const help = locals.help ? (
      <Text style={helpBlockStyle}>{locals.help}</Text>
    ) : null;
    const error =
      locals.hasError && locals.error ? (
        <Text accessibilityLiveRegion="polite" style={errorBlockStyle}>
          {locals.error}
        </Text>
      ) : null;

    return (
      <View style={formGroupStyle}>
        {label}
        <CountryPicker
          onChange={value => {
            this.setState({cca2: value.cca2});
            locals.onChange(value.name);
          }}
          cca2={this.state.cca2}
          filterable>
          <Text
            style={[textboxStyle, locals.value == '' && {color: '#c6c6cc'}]}>
            {locals.value == '' ? locals.placeholder : locals.value}
          </Text>
        </CountryPicker>
        {help}
        {error}
      </View>
    );
  };

  fetchCustomer = async props => {
    console.debug('In fetchCustomer');
    const {selectedAddress} = props;
    const {user: customer} = props.user;

    var value = selectedAddress;
    if (!selectedAddress && customer) {
      value = {
        first_name:
          customer.billing.first_name == ''
            ? customer.first_name
            : customer.billing.first_name,
        last_name:
          customer.billing.last_name == ''
            ? customer.last_name
            : customer.billing.last_name,
        email:
          customer.email.first_name == ''
            ? customer.email
            : customer.billing.email,
        address_1: customer.billing.address_1,
        city: customer.billing.city,
        state: customer.billing.state,
        postcode: customer.billing.postcode,
        country: customer.billing.country,
        phone: customer.billing.phone,
      };
    }

    this.setState({value});
  };

  validateCustomer = async customerInfo => {
    await this.props.validateCustomerInfo(customerInfo);
    if (this.props.type === 'INVALIDATE_CUSTOMER_INFO') {
      toast(this.props.message);
      return false;
    }
    this.props.onNext();
  };

  saveUserData = async userInfo => {
    this.props.updateSelectedAddress(userInfo);
    try {
      await AsyncStorage.setItem('@userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.debug('error save user data', error);
    }
  };

  selectShippingMethod = item => {
    this.props.selectShippingMethod(item);
  };

  nextStep = () => {
    //const value = this.refs.form.getValue();
    // if (value) {
    //   var country = "";
    //   if (Config.DefaultCountry.hideCountryList == true) {
    //     country = this.props.countries[
    //       Config.DefaultCountry.countryCode.toUpperCase()
    //     ];
    //   } else {
    //     country = this.state.value.country;
    //   }
    //   // if validation fails, value will be null
    //   this.props.onNext({ ...this.state.value, country });

    //   // save user info for next use
    //   this.saveUserData({ ...this.state.value, country });
    // }
    // this.props.validateCustomerInfo(this.customerInfo);
    this.props.onNext();
    //this.validateCustomer(this.customerInfo);
  };

  _renderMarker = () => {
    if (
      typeof this.props.orderDestinationLatLng !== 'undefined' &&
      this.props.orderDestinationLatLng.lat != null &&
      this.props.orderDestinationLatLng.lng != null
    )
      return (
        <Marker
          zIndex={101}
          coordinate={{
            latitude: this.props.orderDestinationLatLng.lat,
            longitude: this.props.orderDestinationLatLng.lng,
          }}
          // image={Images.MapIconStore}
          description={'Order Destination'}
          title={this.props.latestPickerDestinationText}>
          <Image
            source={Images.NewAppReskinIcon.UserPinWhite}
            style={{width: 60, maxWidth: 70, height: 70}}
          />
        </Marker>
      );
  };

  displayMarkerLines = () => {
    if (
      typeof this.props.deliveryOptions !== 'undefined' &&
      this.props.deliveryOptions.deliveryMethods.length > 0
    ) {
      return (
        <MapViewDirections
          style={{zIndex: 100}}
          origin={{
            latitude:
              this.props.deliveryOptions.whichInHouseDriverMightBeDriving
                .deliveryLatLng.lat,
            longitude:
              this.props.deliveryOptions.whichInHouseDriverMightBeDriving
                .deliveryLatLng.lng,
          }}
          destination={{
            latitude: this.props.orderDestinationLatLng.lat,
            longitude: this.props.orderDestinationLatLng.lng,
          }}
          waypoints={[
            {
              latitude:
                this.props.deliveryOptions.whichStoreIsClosestSelling
                  .deliveryLatLng.lat,
              longitude:
                this.props.deliveryOptions.whichStoreIsClosestSelling
                  .deliveryLatLng.lng,
            },
          ]}
          mode={'DRIVING'}
          apikey={Config.GoogleMapsDirectionAPIKey}
          strokeWidth={6}
          strokeColor="lightblue"
        />
      );
    } else {
      return null;
    }
  };

  _renderStoreMarker = () => {
    if (typeof this.props.deliveryOptions !== 'undefined')
      return (
        <Marker
          zIndex={102}
          coordinate={{
            latitude:
              this.props.deliveryOptions.whichStoreIsClosestSelling
                .deliveryLatLng.lat,
            longitude:
              this.props.deliveryOptions.whichStoreIsClosestSelling
                .deliveryLatLng.lng,
          }}
          // image={Images.MapIconStore}
          description={
            this.props.deliveryOptions.whichStoreIsClosestSelling.address
          }
          title={this.props.deliveryOptions.whichStoreIsClosestSelling.name}>
          <Image
            source={Images.MapIconStore6}
            style={{width: 50, height: 50}}
          />
        </Marker>
      );
  };

  stopTrackingViewChanges = () => {
    this.setState(() => ({
      tracksViewChanges: false,
    }));
  };

  _renderDriverMarker = () => {
    if (typeof this.props.deliveryOptions !== 'undefined') {
      if (
        this.props.deliveryOptions.deliveryMethods.length > 0 &&
        this.props.selectedDeliveryOption.deliveryOrderProviderType ===
          'In_House'
      ) {
        return (
          <Marker
            zIndex={103}
            coordinate={{
              latitude:
                this.props.deliveryOptions.whichInHouseDriverMightBeDriving
                  .deliveryLatLng.lat,
              longitude:
                this.props.deliveryOptions.whichInHouseDriverMightBeDriving
                  .deliveryLatLng.lng,
            }}
            description={'Driver'}
            title={'Your possible driver'}>
            <Image
              source={Images.MapIconDriver10}
              style={{width: 50, height: 50}}
            />
          </Marker>
        );
      }
    }
  };
  _renderChangeDestination = () => {
    return (
      <TouchableHighlight
        onPress={async () => {
          this.props.cancelAllRefreshDeliveryOptionsTimers(); //cancel any running refreshes
          this.props.updateModalState('locationPickerModal', true);
          //               Keyboard.dismiss();
        }}>
        <View
          style={{
            borderRadius: 30,
            backgroundColor: 'white',
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            paddingLeft: 14,
            paddingRight: 18,
          }}>
          <Image
            source={Images.NewAppReskinIcon.CenterLine}
            style={{
              width: 34,
              height: 34,
              margin: 4,
            }}
          />
          <Text
            style={{
              textAlignVertical: 'center',
              fontFamily: Constants.fontFamilyBold,
              color: GlobalStyle.primaryColorDark.color,
              fontSize: 14,
              textAlign: 'center',
            }}>
            {'ADJUST'}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  _renderRetryGetDeliveryOptions = () => {
    return (
      <TouchableHighlight
        onPress={async () => {
          //  this.props.cancelAllRefreshDeliveryOptionsTimers(); //cancel any running refreshes
        }}>
        <View>
          <Image
            source={Images.CloudSync1}
            style={{
              width: 50,
              height: 50,
              margin: 4,
            }}
          />
          <Text
            style={{
              fontStyle: 'italic',
              color: 'black',
              fontSize: 10,
              textAlign: 'center',
            }}>
            {'Retry Delivery'}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  _renderTickOrCross = () => {
    let imgURl =
      this.props.validatedDelivery == false ? Images.NoDelivery1 : Images.Tick1;
    return (
      <Image
        source={imgURl}
        style={{minHeight: 60, maxHeight: 60, maxWidth: 60, minWidth: 60}}
      />
    );
  };
  _renderMapView = () => {
    if (
      this.props.orderDestinationLatLng &&
      typeof this.props.orderDestinationLatLng.lat !== 'undefined' &&
      this.props.orderDestinationLatLng.lng !== 'undefined'
    ) {
      return (
        <View
          style={{
            flex: 1,
            minHeight: 100,
            borderWidth: 1,
            marginLeft: 4,
            marginRight: 4,
            borderColor: 'lightblue',
            borderRadius: 15,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
          <MapView
            onMapReady={() =>
              setTimeout(() => {
                this.stopTrackingViewChanges();
              }, 2000)
            }
            customMapStyle={Config.MapThemes.ThirdMapTheme}
            ref={el => (this._mapView = el)}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={newStyles.map}
            region={{
              latitude: this.props.orderDestinationLatLng.lat,
              longitude: this.props.orderDestinationLatLng.lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            {/* <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
            {this._renderMarker()}
            {this._renderStoreMarker()}
            {this._renderDriverMarker()}
            {this.displayMarkerLines()}
          </MapView>
          <View
            style={{
              position: 'absolute', //use absolute position to show button on top of the map
              //top: '100%', //for center align
              bottom: '0%',
              alignSelf: 'flex-end', //for align to right
              paddingRight: 3,
              marginRight: 3,
            }}>
            {this._renderTickOrCross()}
          </View>
          {/* <View
              style={{
                position: 'absolute',//use absolute position to show button on top of the map
                //top: '100%', //for center align
                top: 12,
                left: 6,                                           
              }}
            >
              {this._renderChangeDestination()}
            </View> */}
          {/* <View
              style={{
                position: 'absolute',//use absolute position to show button on top of the map
                //top: '100%', //for center align
                top: 62,
                left: 6,                                           
              }}
            >
              {this._renderRetryGetDeliveryOptions()}
            </View>    */}
        </View>
      );
      // let region = {
      //   latitude: this.props.orderDestinationLatLng.lat,
      //   longitude: this.props.orderDestinationLatLng.lng,
      //   latitudeDelta: 0.8,
      //   longitudeDelta: 0.8
      // };
    } else {
      return (
        <View
          style={{
            flex: 1,
            minHeight: 100,
            borderWidth: 1,
            marginLeft: 4,
            marginRight: 4,
            borderColor: 'lightblue',
            borderRadius: 15,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
          <MapView
            ref={el => (this._mapView = el)}
            customMapStyle={Config.MapThemes.SecondaryMapTheme}
            // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={newStyles.map}
            region={{
              latitude: 51.5407134,
              longitude: -0.1676347,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}></MapView>
          <View
            style={{
              position: 'absolute', //use absolute position to show button on top of the map
              //top: '100%', //for center align
              bottom: '0%',
              alignSelf: 'flex-end', //for align to right
              paddingRight: 3,
              marginRight: 3,
            }}>
            {this._renderTickOrCross()}
          </View>
          {/* <View
              style={{
                position: 'absolute',//use absolute position to show button on top of the map
                //top: '100%', //for center align
                top: 12,
                left: 6,                                           
              }}
            >
              {this._renderChangeDestination()}
            </View>    */}
          {/* <View
              style={{
                position: 'absolute',//use absolute position to show button on top of the map
                //top: '100%', //for center align
                top: 62,
                left: 6,                                           
              }}
            >
              {this._renderRetryGetDeliveryOptions()}
            </View>    */}
        </View>
      );
    }
  };

  render() {
    const heightForTHeAutocompletes = height * 0.05 + 4;
    const heightForTHeAutocompleteImage = heightForTHeAutocompletes - 14;

    console.debug('In delivery');
    const {shippings, shippingMethod} = this.props;
    const isShippingEmpty = typeof shippingMethod.id === 'undefined';
    const {
      theme: {
        colors: {background, text},
      },
    } = this.props;

    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
            paddingTop: 14,
            paddingBottom: 40,
          }}>
          {/* DELIVERY DESTINATION BIT */}
          <View
            style={{flexDirection: 'row', overflow: 'hidden', paddingRight: 4}}>
            <Text
              style={[
                css.label,
                {color: text, paddingLeft: 4, paddingRight: 2},
              ]}
              numberOfLines={1}>
              {'Going to: '}
            </Text>
            <View
              style={{
                flex: 1,
                alignContent: 'flex-end',
                marginLeft: 1,
                marginRight: 6,
              }}>
              <Text
                numberOfLines={1}
                style={[
                  css.label,
                  {
                    marginLeft: 2,
                    textAlign: 'right',
                    color: GlobalStyle.primaryColorDark.color,
                  },
                ]}>
                {this.props.latestPickerDestinationText}
              </Text>
            </View>
          </View>

          <View
            style={{flexDirection: 'row', overflow: 'hidden', paddingRight: 4}}>
            <Text
              style={[
                css.label,
                {color: text, paddingLeft: 4, paddingRight: 2},
              ]}
              numberOfLines={1}>
              {'Probable Vendor: '}
            </Text>
            <View
              style={{
                flex: 1,
                alignContent: 'flex-end',
                marginLeft: 1,
                marginRight: 6,
              }}>
              <Text
                numberOfLines={1}
                style={[
                  css.label,
                  {
                    marginLeft: 2,
                    textAlign: 'right',
                    color: GlobalStyle.primaryColorDark.color,
                  },
                ]}>
                {this.props.deliveryOptions.whichStoreIsClosestSelling.name}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              maxHeight: 56,
              marginBottom: 12,
              marginTop: 8,
              flex: 1,
              backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'white',
                padding: 2,
                paddingTop: 2,
                marginLeft: 13,
                marginRight: 13,
                borderRadius: 30,
                flex: 1,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <FastImage
                style={{
                  margin: 0,
                  marginLeft: 6,
                  marginRight: 2,
                  maxHeight: heightForTHeAutocompleteImage,
                  height: heightForTHeAutocompleteImage,
                  width: heightForTHeAutocompleteImage,
                }}
                source={Images.NewAppReskinIcon.Driver}
                resizeMode="contain"
              />
              <TextInput
                style={{
                  height: heightForTHeAutocompletes,
                  fontSize: 14,
                  flex: 1,
                  padding: 4,
                  margin: 4,
                  borderWidth: 0,
                  borderRadius: 30,
                  backgroundColor: 'white',
                  borderColor: 'lightblue',
                  color: 'black',
                }}
                value={this.props.driverNote}
                onChangeText={text => this.props.updateDriverNote(text)}
                placeholderTextColor={'silver'}
                placeholder={" Note for driver: e.g. 'Leave by side gate.'"}
              />
            </View>
            {/* 
              <View style={{ flexDirection: "row",  padding:2,
            flex: 1, 
            alignContent:"center", alignItems:"center", justifyContent:"center" }}>   
              <FastImage
              style={{                
                margin: 0,                
                marginLeft:2,
                marginRight:2,
                maxHeight: 40,
                height: 40,
                width: 40,
              }}
              source={Images.MapIconStore6}
              resizeMode="contain"
            />
           <TextInput
                style={{
                  height:50,
                  fontSize: 13,
                  flex: 1,
                  padding:4,
                  margin: 4,                  
                  borderWidth: 1,
                  borderRadius: 20,
                  borderColor: "hotpink",
                  color: "black",
                }}
                placeholderTextColor={"silver"}
                placeholder={"  No onion, extra hot."}
                value={this.props.storeNote}
                onChangeText={(text) => this.props.updateStoreNote(text)}
              />
              </View> */}

            {/* NOTE            */}
          </View>

          <View style={{flex: 1, paddingTop: 6}}>{this._renderMapView()}</View>

          {/* {this._renderMapView()} */}

          {/* <View style={{ marginTop: 12, paddingTop: 12 }}>
            <Text style={[css.label, { color: text }]} numberOfLines={2}>
              {"Going to: " + this.props.latestPickerDestinationText}
            </Text>          
          </View>         */}
        </View>
        <Buttons
          isAbsolute
          onPrevious={this.props.onPrevious}
          onNext={this.nextStep}
        />
      </View>
    );
  }
}

Delivery.defaultProps = {
  shippings: [],
  shippingMethod: {},
  selectedAddress: {},
};

const mapStateToProps = ({carts, user, countries, addresses, location}) => {
  return {
    user,
    customerInfo: carts.customerInfo,
    message: carts.message,
    type: carts.type,
    isFetching: carts.isFetching,
    shippings: carts.shippings,
    shippingMethod: carts.shippingMethod,
    countries: countries.list,
    selectedAddress: addresses.selectedAddress,
    latestPickerDestinationText: location.latestPickerDestinationText,
    orderDestinationLatLng: location.mostRecentOrderDestinationLatLng,
    location: location,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {dispatch} = dispatchProps;
  const CartRedux = require('@redux/CartRedux');
  const AddressRedux = require('@redux/AddressRedux');
  const modalActions = require('@redux/ModalsRedux');
  //const locationRedux = require("@redux/LocationRedux")

  return {
    ...ownProps,
    ...stateProps,
    validateCustomerInfo: customerInfo => {
      CartRedux.actions.validateCustomerInfo(dispatch, customerInfo);
    },
    // getShippingMethod: () => {
    //   CartRedux.actions.getShippingMethod(dispatch);
    // },
    selectShippingMethod: shippingMethod => {
      CartRedux.actions.selectShippingMethod(dispatch, shippingMethod);
    },
    updateSelectedAddress: address => {
      AddressRedux.actions.updateSelectedAddress(dispatch, address);
    },
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

export default connect(
  mapStateToProps,
  undefined,
  mergeProps,
)(withTheme(Delivery));
