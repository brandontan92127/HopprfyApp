/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-native-draggable';
import {
  FlatList,
  Text,
  Image,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import moment from 'moment';
import {connect} from 'react-redux';
import {Constants, withTheme, Images, GlobalStyle, Config} from '@common';
import {HorizonList, ModalLayout, PostList} from '@components';
import HopprWorker from '@services/HopprWorker';
import {isEmpty} from 'lodash';
import Autocomplete from 'react-native-autocomplete-input';
import styles from './styles';
import GeoWorker from '../../services/GeoWorker';
import SoundPlayer from 'react-native-sound-player';
import {showMessage, hideMessage} from 'react-native-flash-message';
import TextTicker from 'react-native-text-ticker';

////

import DriverProfileModal from '../../components/Modals/Driver/DriverProfileModal';
import CourierControlsModal from '../../components/Modals/Controls/CourierControlsModal';
////

const AnimatedView = Animated.createAnimatedComponent(View);
const {width, height} = Dimensions.get('window');
const smallHeightForAutocompleteResultMax = 35;
const maxTabletAutocompleteSize = 39;

//imkported from HorizonList / header work
const fromEntries = require('fromentries');
const backgroundColorForDropdowns = 'rgba(255,255,255,0.2)';
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const HEADER_EXPANDED_HEIGHT = 170;
const HEADER_COLLAPSED_HEIGHT = 0;

const getHeightForTheAutocompletes = () => {
  return 60;
  let result = height * 0.05;
  if (result <= smallHeightForAutocompleteResultMax) {
    //small
    return result + 6;
  }
  if (result > maxTabletAutocompleteSize) {
    return maxTabletAutocompleteSize;
  } else {
    return result;
  }
};

const heightForTHeAutocompletes = getHeightForTheAutocompletes();
const autocompleteWidth = width * 0.5;
const clearIconSize = heightForTHeAutocompletes - 4;

const getTopModalPostion = () => {
  const firstModalTopPosition = height * 0.008 + heightForTHeAutocompletes;
  //alert(firstModalTopPosition);

  //if we hit max size, return fixed value
  if (heightForTHeAutocompletes >= maxTabletAutocompleteSize) {
    return 64;
  }

  if (firstModalTopPosition <= 49) {
    return 64;
  }
  if (firstModalTopPosition >= 50) {
    return 50;
  } else {
    return firstModalTopPosition;
  }
};

const firstModalTopPosition = getTopModalPostion();
const secondModalTopPostition =
  firstModalTopPosition + heightForTHeAutocompletes + height * 0.004;

class Home extends Component {
  static propTypes = {
    fetchAllCountries: PropTypes.func.isRequired,
    layoutHome: PropTypes.any,
    onViewProductScreen: PropTypes.func,
    onShowAll: PropTypes.func,
    showCategoriesScreen: PropTypes.func,
  };

  constructor(props) {
    console.debug('In horzion list nigga');
    super(props);
    const scrollY = new Animated.Value(0);

    this.state = {
      locationAutocompletePossibleResults: [],
      locationAutocompleteLatestSearchTerm: '',
      //transient fields for inputs
      currentProdAutoSearchTerm: '',
      currentLocationAutoSearchTerm: '',
      //iMPORT FROM HORIZONLIST
      showNetworkLogo: false,
      scrollY,
      currentSelectedNetwork: {
        name: Config.InAppName,
        description: 'Unified Delivery Theory',
        storeLogoUrl: 'hopprLogoB.PNG', //default
        id: '-1',
      },
      currentSelectedNetworkColor: 'black', //use to change text color
    };
  }

  changeStateColorIfNewColorPassedIn(newColor) {
    if (typeof newColor !== 'undefined' && newColor !== '') {
      if (this.state.currentSelectedNetworkColor != newColor) {
        this.setState({currentSelectedNetworkColor: newColor});
      }
    }
  }

  componentDidMount = () => {
    const {fetchAllCountries, isConnected, countries} = this.props;
    if (isConnected) {
      if (!countries || isEmpty(countries)) {
        fetchAllCountries();
      }
    }

    //set autocomplete states to 'true' / visible
    this.props.updateProductAutocomplete(true);
    this.props.updateLocationAutocomplete(true);
  };

  //this method rpelicated in NetworkPickerModal.js
  searchNetworkForProductByName = async phrase => {
    let resultData = await HopprWorker.searchNetworkForProductByName(phrase);
    console.debug('got result');

    this.props.updateProductAndNetworkSearchResults(resultData);

    //set the propties on the new modal view as you want them
    //we want a full screen list to start each autocomplete
    if (resultData.length !== 1) {
      //set as tall view in picker
      this.props.updateFullScreenListInNetworkPickerModal(true);
      this.props.updateCurrentlySelectedNetworkInNetworkPickerModal(undefined);
    } else {
      //set as short view in picker w/ autoselected network display showing
      this.props.updateFullScreenListInNetworkPickerModal(false);
      this.props.updateCurrentlySelectedNetworkInNetworkPickerModal(
        resultData[0].network,
      );
    }
  };

  /**For product Autocomplete */
  getProductAutocomplete = async phrase => {
    this.setState({currentProdAutoSearchTerm: phrase});
    if (phrase.length > 1) {
      //save what we searched for
      let result = await HopprWorker.getProductAutocomplete(phrase);
      //then save the result
      this.props.updateProductAutocompleteSearchResults(phrase, result);
    }
  };
  /**For product Autocomplete */
  _renderTextInputForProductAutocomplete = () => {
    return (
      <TextInput
        style={{
          fontFamily: Constants.fontFamily,
          height: 60,
          backgroundColor: 'transparent',
          borderRadius: 30,
          alignItems: 'center',
          paddingLeft: 16,
          zIndex: 9999,
        }}
        value={this.state.currentProdAutoSearchTerm}
        placeholder={'What would you like...   '}
        placeholderTextColor={'grey'}
        onChangeText={text => this.getProductAutocomplete(text)}
        ref={component => (this._productTextInput = component)}
      />
    );
  };

  _renderHopprLogoImage() {
    return (
      <Image
        source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
        style={[
          styles.logo,
          Config.Theme.isDark && {tintColor: '#eee', resizeMode: 'contain'},
        ]}
      />
    );
  }

  /**For product Autocomplete */
  _renderProductAutocomplete = () => {
    let prodAutocompleteWidth = autocompleteWidth;
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          zIndex: 9999,
          width: prodAutocompleteWidth,
          maxWidth: prodAutocompleteWidth,
          right: 8,
          top: firstModalTopPosition,
          opacity: 1,
        }}>
        <Autocomplete
          //hideResults={false}
          data={this.props.latestProductAutocompleteSearchResults}
          containerStyle={{
            borderWidth: 0,
            borderColor: 'white',
          }}
          inputContainerStyle={{
            // color: "black",
            borderWidth: 0,
            height: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 30,
            maxHeight: heightForTHeAutocompletes,
            fontSize: 18,
          }}
          listStyle={{
            fontSize: 12,
            borderWidth: 1,
            borderColor: 'hotpink',
            // borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: backgroundColorForDropdowns,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderRadius: 8,
            maxHeight: 500,
            padding: 5,
          }}
          clearButtonMode={'always'}
          onChangeText={text => this.getProductAutocomplete(text)}
          renderTextInput={() => this._renderTextInputForProductAutocomplete()}
          renderItem={(item, i) => (
            <View
              style={{
                zIndex: 99990,
                backgroundColor: 'white',
                borderWidth: 0,
                borderColor: GlobalStyle.primaryColorDark.color,
                borderRadius: 20,
                backgroundColor: backgroundColorForDropdowns,
              }}>
              <TouchableOpacity
                onPress={async () => {
                  //SEE WHAT TYPE OF RESULT IT IS
                  try {
                    console.debug('OK');
                    if (item.item.type == 'Product') {
                      this.searchNetworkForProductByName(item.item.name);
                      this.props.updateModalState('networkPickerModal', true);
                    } else if (item.item.type == 'Class') {
                      try {
                        let singleClassResult = await HopprWorker.getCategory(
                          item.item.id,
                        );
                        //go to category scren
                        //update latest selected
                        this.props.setSelectedCategory(singleClassResult[0]);
                        setTimeout(
                          () =>
                            this.props.onShowCategoryScreen({
                              selectedCategory: singleClassResult[0],
                            }),
                          500,
                        );
                        //this.props.navigate.navigate("CategoryScreen", {selectedCategory : singleClassResult[0]} );
                      } catch (error) {
                        alert("Sorry, we couldn't do that!");
                      }
                    } else if (item.item.type == 'Network') {
                      //just do same as product for now
                      this.searchNetworkForProductByName(item.item.name);
                      this.props.updateModalState('networkPickerModal', true);
                    } else {
                      alert(' sure what happened...?');
                    }
                  } catch (error) {
                  } finally {
                    this.props.updateProductAutocompleteSearchResults(
                      this.props.latestProductAutocompleteSearchTerm,
                      [], //clear results for choice list once a selection is made, but keep same search tems to show in modal
                    );
                  }
                }}>
                {this._renderProductAutocompleteTextBox(item.item)}
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  _renderProductAutocompleteTextBox = item => {
    let imgSize = 30;
    let fontSize = 18;
    let desc = '';
    let imageResizeMode = 'cover';

    if (item.description) {
      desc = ' - ' + item.description;
    }
    if (item.type == 'Network') {
      imageResizeMode = 'contain';
    }

    if (item.image == null || item.image == '') {
      return (
        <Text
          numberOfLines={3}
          style={{
            zIndex: 99991,
            fontFamily: Constants.fontFamily,
            color: 'white',
            maxWidth: autocompleteWidth,
            fontSize: fontSize,
          }}>
          {' ' + item.name + desc}
        </Text>
      );
    } else {
      return (
        <View style={{flexDirection: 'row', zIndex: 99991}}>
          <View
            style={{
              maxHeight: imgSize,
              height: imgSize,
              width: imgSize,
              maxWidth: imgSize,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
            <Image
              style={{
                padding: 2,
                paddingRight: 3,
                paddingBottom: 0,
                maxHeight: imgSize,
                height: imgSize,
                width: imgSize,
                maxWidth: imgSize,
                borderRadius: 4,
              }}
              source={{uri: item.image}}
              resizeMode={imageResizeMode}
            />
          </View>
          <Text
            numberOfLines={3}
            style={{
              fontFamily: Constants.fontFamily,
              color: 'white',
              maxWidth: autocompleteWidth,
              fontSize: fontSize,
            }}>
            {' ' + item.name + desc}
          </Text>
        </View>
      );
    }
  };

  clearLocationInputText() {
    this._locationTextInput.setNativeProps({text: ' '});

    setTimeout(() => {
      this._locationTextInput.setNativeProps({text: ''});
    }, 3);
  }

  _clearAutocompleteLocationSuggestions = () => {
    this.setState({locationAutocompletePossibleResults: []});
  };

  _reverseGeocodeTappedAddressAndUpdateLocationRedux =
    async pickedAddressString => {
      let geoResult = await GeoWorker.geocode(pickedAddressString);
      let geoLatLng = {
        lat: geoResult.position.lat,
        lng: geoResult.position.lng,
      };

      this.props.pushCurrentPickerLocationAsOrderDestination(
        geoLatLng,
        pickedAddressString,
        geoResult,
      );
      //update redux with the string and the coords

      // //launch location modal
      // this.props.updateModalState("locationPickerModal", true);

      this._clearAutocompleteLocationSuggestions();
      this.clearLocationInputText();

      SoundPlayer.playSoundFile('notification5', 'mp3');

      showMessage({
        message: 'Your order destination was set!',
        duration: 2000,
        backgroundColor: GlobalStyle.primaryColorDark.color, // background color
        description: this.props.latestPickerDestinationText,
        color: 'white', // text color
        autoHide: true,
        style: {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        },
        position: 'bottom',
      });
    };
  /**Destination Locaiton Autocomplete */
  _renderLocationAutocomplete = () => {
    let locationAutocompleteWidth = width * 0.5;
    return (
      <View
        style={{
          flex: 1,
          borderWidth: 0,
          borderColor: 'white',
          position: 'absolute',
          zIndex: 9997,
          width: locationAutocompleteWidth,
          maxWidth: locationAutocompleteWidth,
          right: 8,
          top: secondModalTopPostition,
          borderRadius: 20,
        }}>
        <Autocomplete
          //hideResults={false}
          data={this.state.locationAutocompletePossibleResults}
          containerStyle={{
            borderWidth: 0,
            borderColor: 'white',
          }}
          //defaultValue={this.state.locationAutocompleteLatestSearchTerm}
          inputContainerStyle={{
            // color: "black",
            borderWidth: 0,
            maxHeight: heightForTHeAutocompletes,
          }}
          listStyle={{
            fontSize: 12,
            borderWidth: 2,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: GlobalStyle.primaryColorDark.color,
            borderRadius: 8,
            backgroundColor: backgroundColorForDropdowns,
            overflow: 'visible',
            zIndex: 99991,
          }}
          clearButtonMode={'always'}
          onChangeText={text => this.getLocationAutocomplete(text)}
          renderTextInput={() => this._renderTextInputForLocationAutocomplete()}
          renderItem={(item, i) => (
            <View
              style={{
                backgroundColor: 'white',
                borderWidth: 0,
                borderColor: GlobalStyle.primaryColorDark.color,
                borderRadius: 20,
                maxWidth: locationAutocompleteWidth + 400,
                backgroundColor: backgroundColorForDropdowns,
              }}>
              <TouchableOpacity
                onPress={() => {
                  //clear suggestions box
                  this._clearAutocompleteLocationSuggestions();
                  this._reverseGeocodeTappedAddressAndUpdateLocationRedux(item);
                  //launch location picker modal once redux done

                  //clear suggestions box
                  //this._clearAutocompleteLocationSuggestions();
                }}>
                <Text
                  numberOfLines={3}
                  style={{
                    fontFamily: Constants.fontFamily,
                    color: 'white',
                    maxWidth: locationAutocompleteWidth + 400,
                    fontSize: 18,
                  }}>
                  {' ' + item}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  /**For location Autocomplete */
  _renderTextInputForLocationAutocomplete = () => {
    let placeholderTExt = 'Where to...   ';
    let latestPickerDestinationText = this.props.latestPickerDestinationText;
    let colorOfPlaceHolder = 'grey';

    if (
      typeof latestPickerDestinationText !== 'undefined' &&
      latestPickerDestinationText != null &&
      latestPickerDestinationText != 'None' &&
      this.latestPickerDestinationText != ''
    ) {
      placeholderTExt = 'To: ' + latestPickerDestinationText;
      colorOfPlaceHolder = GlobalStyle.primaryColorDark.color;
    }

    return (
      <TextInput
        style={{
          height: heightForTHeAutocompletes,
          maxHeight: heightForTHeAutocompletes,
          paddingHorizontal: 2,
          color: 'white',
          zIndex: 9999,
          borderWidth: 2,
          fontSize: 13,
          fontFamily: Constants.fontFamily,
          backgroundColor: backgroundColorForDropdowns,
          borderColor: GlobalStyle.primaryColorDark.color,
          textAlign: 'right',
          borderRadius: 20,
          paddingRight: 4,
          paddingLeft: clearIconSize * 2,
        }}
        numberOfLines={1}
        value={this.state.currentLocationAutoSearchTerm}
        placeholder={placeholderTExt}
        placeholderTextColor={colorOfPlaceHolder}
        onChangeText={text => this.getLocationAutocomplete(text)}
        ref={component => (this._locationTextInput = component)}
      />
    );
  };

  getLocationAutocomplete = async phrase => {
    this.setState({currentLocationAutoSearchTerm: phrase});
    if (phrase.length > 4) {
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

  renderWhitePanelCloseControl = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 101,
          right: 194,
          zIndex: 9997,
        }}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateLocationAutocomplete(false);
            this.props.updateProductAutocomplete(false);
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              padding: 2,
              paddingBottom: 0,
              maxHeight: 30,
              height: 30,
              width: 30,
              maxWidth: 30,
            }}
            source={Images.Close1}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderWhitePanelLaunchMapControl = () => {
    let size = clearIconSize;
    return (
      <View
        style={{
          position: 'absolute',
          top: secondModalTopPostition + 2,
          right: width * 0.5 - clearIconSize * 2 + 7,
          zIndex: 9998,
        }}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateModalState('locationPickerModal', true);
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              padding: 2,
              paddingBottom: 0,
              maxHeight: size,
              height: size,
              width: size,
              maxWidth: size,
            }}
            source={Images.LaunchMap3}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderLocationAutocompleteInputClearControl = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: secondModalTopPostition + 2,
          right: width * 0.5 - clearIconSize + 5,
          zIndex: 9998,
        }}>
        <TouchableOpacity
          onPress={() => {
            this._clearAutocompleteLocationSuggestions();
            this.setState({currentLocationAutoSearchTerm: ''});
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              padding: 2,
              paddingBottom: 0,
              maxHeight: clearIconSize,
              height: clearIconSize,
              width: clearIconSize,
              maxWidth: clearIconSize,
            }}
            source={Images.Close3}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderProductAutocompleteInputClearControl = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: firstModalTopPosition + 2,
          right: width * 0.5 - clearIconSize + 5,
          zIndex: 10000,
        }}>
        <TouchableOpacity
          onPress={() => {
            //clear latest searched value
            this.setState({currentProdAutoSearchTerm: ''});
            this.props.updateProductAutocompleteSearchResults('', []);
            console.debug('Cleared');
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              padding: 2,
              paddingBottom: 0,
              maxHeight: clearIconSize,
              height: clearIconSize,
              width: clearIconSize,
              maxWidth: clearIconSize,
            }}
            source={Images.Close3}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  _getWhitePanelHeight = () => {
    let result = height * 0.05;
    if (result <= smallHeightForAutocompleteResultMax) {
      //small
      result = heightForTHeAutocompletes * 2 + 25;
    } else {
      result = heightForTHeAutocompletes * 2 + 14;
    }

    return result; //normal
  };

  /**this is like for controls */
  renderWhitePanel = () => {
    let panelWidth = width * 0.5 + 12;
    let panelHeight = this._getWhitePanelHeight();

    //LIMIT PANEL HEIGHT IF AUTOS ARE AT MAX SIZE
    let heightForAutos = getHeightForTheAutocompletes();
    //alert(heightForAutos);
    if (heightForAutos >= maxTabletAutocompleteSize) {
      //we know its max so set white panel as max
      panelHeight = 102;
    }

    return (
      <View
        style={{
          borderWidth: 0,
          borderColor: 'lightblue',
          position: 'absolute',
          backgroundColor: GlobalStyle.primaryColorDark.color,
          zIndex: 1000,
          borderRadius: 20,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          width: panelWidth,
          maxWidth: panelWidth,
          minWidth: panelWidth,
          height: panelHeight,
          maxHeight: panelHeight,
          minHeight: panelHeight,
          right: 1,
          top: 46,
        }}></View>
    );
  };

  _checkRenderLogoImageStatus = () => {
    let isNetworkSet = this.props.currentlySelectedNetworkGuid;

    if (typeof isNetworkSet !== 'undefined') {
      if (this.props.networkPickerData.length > 0) {
        if (this.state.showNetworkLogo != true) {
          this.setState({showNetworkLogo: true});
        }
      }
    } else {
      if (this.state.showNetworkLogo != false) {
        this.setState({showNetworkLogo: false});
      }
    }
  };

  _renderLogoImage = imgPayload => {
    if (this.state.showNetworkLogo && this.props.networkPickerData.length > 0) {
      return this._renderNetworkLogoImage(imgPayload);
    } else {
      return this._renderHopprLogoImage();
    }
  };

  _getNetworkCssColor = () => {
    return GlobalStyle.primaryColorDark.color;
    let indexOfItem = this.props.networkPickerData
      .map(el => el.id.toUpperCase())
      .indexOf(this.props.currentlySelectedNetworkGuid.toUpperCase());

    var cssColorNet = this.props.networkPickerData[indexOfItem];
    var cssColor = GlobalStyle.primaryColorDark.color;
    if (typeof cssColorNet !== 'undefined') {
      cssColor = cssColorNet.networkCssColor;
    }

    return cssColor;
  };

  _renderHeader = () => {
    this._checkRenderLogoImageStatus();
    let cssColor = this._getNetworkCssColor();

    let indexOfItem = this.props.networkPickerData
      .map(el => el.id.toUpperCase())
      .indexOf(this.props.currentlySelectedNetworkGuid.toUpperCase());
    let networkSelect = this.props.networkPickerData[indexOfItem];
    let imgPayload = Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo;
    if (typeof networkSelect !== 'undefined') {
      fullURl = Config.NetworkImageBaseUrl + networkSelect.storeLogoUrl;
      imgPayload = {uri: fullURl};
    }

    const {scrollY} = this.state;

    const headerHeight = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      extrapolate: 'clamp',
    });

    const headerPaddingTop = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [40, 0],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <AnimatedView
        style={{
          zIndex: 100,
          backgroundColor: cssColor,
          padding: 20,
          paddingTop: headerPaddingTop,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          // borderWidth: 1,
          // borderColor: "red",
          // borderWidth: 1,
          flexDirection: 'row',
          height: headerHeight,

          overflow: 'visible',
          opacity,
        }}>
        {this._renderProductAutocomplete()}
      </AnimatedView>
    );
  };

  _renderNetworkLogoImage() {
    let indexOfItem = this.props.networkPickerData
      .map(el => el.id.toUpperCase())
      .indexOf(this.props.currentlySelectedNetworkGuid.toUpperCase());

    let networkSelect = this.props.networkPickerData[indexOfItem];
    let fullURl = 'https://booza.store:44300/images/networklogos/fireworks.png';

    var cssColor = this._getNetworkCssColor();
    let imgPayload = Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo;
    if (typeof networkSelect !== 'undefined') {
      fullURl = Config.NetworkImageBaseUrl + networkSelect.storeLogoUrl;
      imgPayload = {uri: fullURl};

      //only set state if different
      this._setCurrentNetwork(networkSelect);
      this.changeStateColorIfNewColorPassedIn(cssColor);
    } else {
      //we got a problem!!
      //alert('Sorry, that network image and css reload failed due to no network. We should turn this off in production.');
    }
    return this._renderNetworkPickerRow(imgPayload);
  }

  _setCurrentNetwork = currentNetwork => {
    if (typeof currentNetwork !== 'undefined') {
      if (this.state.currentSelectedNetwork.id !== currentNetwork.id) {
        this.setState({currentSelectedNetwork: currentNetwork});
      }
    }
  };

  _renderNetworkPickerRow = imgPayload => {
    const selectedNetwork = this.props.networkPickerData.find(
      el => el.id === this.props.currentlySelectedNetworkGuid,
    );
    const networkName = selectedNetwork ? selectedNetwork.name : 'Choose...';

    let fullNetImgURl =
      typeof selectedNetwork === 'undefined'
        ? 'https://booza.store:44300/images/networklogos/fireworks.png'
        : Config.NetworkImageBaseUrl + selectedNetwork.storeLogoUrl;

    //THERE IS MINUS VALUE HERE FOR CORRECT STYLING!!
    let pickerStyle = {
      height: 84,
      maxWidth: width * 0.34,
      width: width * 0.34,
    };

    //Clicmk to show picker
    return (
      <TouchableOpacity
        style={{flex: 1}}
        onPress={() => {
          this.props.updateModalState('networkSwitcherModal', true);
        }}>
        <Image
          style={pickerStyle}
          resizeMode={'contain'}
          source={{uri: fullNetImgURl}}></Image>
      </TouchableOpacity>
    );
  };

  render() {
    const {
      layoutHome,
      onViewProductScreen,
      showCategoriesScreen,
      onShowCategoryScreen,
      onShowAll,
      theme: {
        colors: {background},
      },
    } = this.props;

    const isHorizontal = layoutHome === Constants.Layout.horizon;

    return (
      <View style={[styles.container, {backgroundColor: background}]}>
        {/* {this._renderHeader()}  */}

        {/* <Draggable             
             renderSize={90} 
             x={this.state.x}
             y={this.state.y}
             shouldReverse={false}          
             pressDragRelease={(e) => {                      
             this.setState({x: e.nativeEvent.pageX - e.nativeEvent.locationX, y: e.nativeEvent.pageY - e.nativeEvent.locationY})
             // alert("pageX, pageY = " + e.nativeEvent.pageX + ", " + e.nativeEvent.pageY);
             alert("locX, locY = " + e.nativeEvent.locationX + ", " + e.nativeEvent.locationY)}}/>       */}

        {/* AUTOCOMPLETES + WHITE PANEL */}
        {/* {this.props.productAutocompleteVisible && this.renderWhitePanel()}
         {this.props.productAutocompleteVisible &&
           this._renderProductAutocomplete()}  
          {this.props.productAutocompleteVisible &&
           this.renderWhitePanelCloseControl()} 
          {this.props.productAutocompleteVisible &&
           this.renderWhitePanelLaunchMapControl()} 
          {this.props.productAutocompleteVisible &&
           this.renderProductAutocompleteInputClearControl()}    
         {this.props.locationAutocompleteVisible &&
           this._renderLocationAutocomplete()}    
          */}

        {isHorizontal && (
          <View style={{flex: 1, zIndex: -1}}>
            <View style={{flex: 1, zIndex: -1}}>
              <View style={{flex: 1, zIndex: -1}}>
                <HorizonList
                  navigate={this.props.navigate}
                  onShowAll={onShowAll}
                  onViewProductScreen={onViewProductScreen}
                  showCategoriesScreen={showCategoriesScreen}
                  onShowCategoryScreen={onShowCategoryScreen}
                />
              </View>
            </View>
          </View>
        )}
        {!isHorizontal && (
          <PostList onViewProductScreen={onViewProductScreen} />
        )}

        <ModalLayout />
      </View>
    );
  }
}

const mapStateToProps = ({
  products,
  countries,
  netInfo,
  modals,
  location,
  categories,
}) => ({
  layoutHome: products.layoutHome,
  countries,
  isConnected: netInfo.isConnected,
  productAutocompleteVisible: modals.productAutocompleteVisible,
  locationAutocompleteVisible: modals.locationAutocompleteVisible,
  latestProductAutocompleteSearchTerm:
    modals.latestProductAutocompleteSearchTerm,
  latestProductAutocompleteSearchResults:
    modals.latestProductAutocompleteSearchResults,
  //latest set location text
  latestPickerDestinationText: location.latestPickerDestinationText,
  //IMPORT FROM HORIZON LIST
  networkPickerData: categories.networkPickerData,
  currentlySelectedNetworkGuid: categories.currentlySelectedNetworkGuid,
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {dispatch} = dispatchProps;
  const {actions} = require('@redux/LocationRedux');
  const CountryRedux = require('@redux/CountryRedux');
  const modalActions = require('@redux/ModalsRedux');
  const categoryActions = require('@redux/CategoryRedux');

  return {
    ...ownProps,
    ...stateProps,
    setSelectedCategory: category => {
      dispatch(categoryActions.actions.setSelectedCategory(category));
    },
    fetchAllCountries: () => CountryRedux.actions.fetchAllCountries(dispatch),
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
    updateProductAutocomplete: newVisibleBoolValue => {
      modalActions.actions.updateProductAutocomplete(
        dispatch,
        newVisibleBoolValue,
      );
    },
    updateLocationAutocomplete: newVisibleBoolValue => {
      modalActions.actions.updateLocationAutocomplete(
        dispatch,
        newVisibleBoolValue,
      );
    },
    updateProductAutocompleteSearchResults: (
      newSearchTerm,
      newSearchResults,
    ) => {
      console.debug('About to update results');
      modalActions.actions.updateProductAutocompleteSearchResults(
        dispatch,
        newSearchTerm,
        newSearchResults,
      );
    },
    updateProductAndNetworkSearchResults: newResults => {
      console.debug('About to update results');
      modalActions.actions.updateProductAndNetworkSearchResults(
        dispatch,
        newResults,
      );
    },
    updateCurrentlySelectedNetworkInNetworkPickerModal: newNet => {
      console.debug('About to update results');
      modalActions.actions.updateCurrentlySelectedNetworkInNetworkPickerModal(
        dispatch,
        newNet,
      );
    },
    updateFullScreenListInNetworkPickerModal: fullScreenListBool => {
      console.debug('About to update results');
      modalActions.actions.updateFullScreenListInNetworkPickerModal(
        dispatch,
        fullScreenListBool,
      );
    },
    pushCurrentPickerLocationAsOrderDestination: async (
      pickedLatLng,
      latestPickerDestinationText,
      fullGeoResult,
    ) => {
      dispatch(
        actions.setOrderDestination(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText,
          fullGeoResult,
        ),
      );
    },
  };
}

export default withTheme(connect(mapStateToProps, undefined, mergeProps)(Home));
