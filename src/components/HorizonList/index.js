/** @format */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  Text,
  Image,
  Animated,
  View,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  TouchableNativeFeedback,
  TouchableHighlightBase,
  Keyboard,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import moment from 'moment';
import {
  HorizonLayouts,
  Config,
  withTheme,
  withNavigation,
  Images,
  GlobalStyle,
  Device,
} from '@common';
import {isUndefined} from 'lodash';
import {connect} from 'react-redux';
import {makeGetCollections} from '@selectors/LayoutSelector';
import HList from './HList';
import {toast} from '@app/Omni';
import styles from './styles';
import HopprWorker from '../../services/HopprWorker';
import Constants from '../../common/Constants';
import circleRowConfig from '../../apiModels/productClass/circleRowConfig';
import circleRowConfigItem from '../../apiModels/productClass/circleRowConfigItem';
import ImageHelper from '../../helper/ImageHelper';
import {showMessage} from 'react-native-flash-message';
import Autocomplete from 'react-native-autocomplete-input';
import FastImage from 'react-native-fast-image';
import {EventRegister} from 'react-native-event-listeners';
import GeoWorker from '../../services/GeoWorker';
import SoundPlayer from 'react-native-sound-player';
import TextTicker from 'react-native-text-ticker';
import RNRestart from 'react-native-restart'; // Import package from node modules
import {NetworkSwitcherModal} from '@components';
// import { ScrollView } from "react-native-gesture-handler";

const fromEntries = require('fromentries');
const {width, height} = Dimensions.get('window');
const heightForTHeAutocompletes = 30;
const backgroundColorForDropdowns = 'rgba(255,255,255,0.2)';
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HEADER_EXPANDED_HEIGHT = 170;
const HEADER_COLLAPSED_HEIGHT = 0;
const baseViewHeaderPadding = 30;
const correctPhoneBaseHeaderPadding = Device.getCorrectIphoneXBaseHeaderPadding(
  baseViewHeaderPadding,
);
const listSuggestionPlacement =
  HEADER_EXPANDED_HEIGHT + correctPhoneBaseHeaderPadding - 17.8;
const defaultFilterText = '(Click logo to change)';
const networkPickerRowHeight = 84;

const defaultLoadingTextAndImage = {
  text: "We're building your\ncustom menus...",
  subtext: 'Perfection takes time!',
  image: Images.NewAppReskinGraphics.LoadingMenus,
};
const noMenuAvailableLoadingTextAndImage = {
  text: 'Seems like there are no\nvendors available in\nthis area...',
  subtext: 'You should be the first.\nOpen a store in this area now!',
  image: Images.NewAppReskinGraphics.RoadTrip,
};

class HorizonList extends Component {
  static propTypes = {
    fetchAllProductsLayout: PropTypes.func.isRequired,
    fetchProductsByCollections: PropTypes.func,
    list: PropTypes.array,
    onShowAll: PropTypes.func,
    onViewProductScreen: PropTypes.func,
    collections: PropTypes.array,
    setSelectedCategory: PropTypes.func,
    isFetching: PropTypes.bool.isRequired,
    showCategoriesScreen: PropTypes.func,
  };

  constructor(props) {
    console.debug('In horzion list nigga');
    super(props);

    this.firstLoad = true;
    const scrollY = new Animated.Value(0);

    this.state = {
      showNetworkLogo: false,
      currentDate: moment().format('dddd DD MMM'),
      autoloadHasHappened: false,
      placeHolderText: '',
      selectedText: '',
      currentSelectedNetworkColor: 'black', //use to change text color
      currentSelectedNetwork: {
        name: Config.InAppName,
        description: 'Unified Delivery Theory',
        storeLogoUrl: 'hopprLogoB.PNG', //default
        id: '-1',
      },
      locationAutocompletePossibleResults: [],
      scrollY,
      locationAutocompleteLatestSearchTerm: '',
      //transient fields for inputs
      currentProdAutoSearchTerm: '',
      currentLocationAutoSearchTerm: '',
      hideProductSuggestions: false,
      hideLocationSuggestions: false,
      wasMessageShown: -1,
      filterText: '(click to change)',
      loadingTextAndImage: defaultLoadingTextAndImage,
      showNetworkLogoImagePlaceHolder: true,
    };
  }

  /**changes selected network to first network in picker */

  componentWillMount() {}

  componentWillUnmount = () => {
    this._unregisterEventHandlers();
  };

  componentDidMount = async () => {
    try {
      this._registerEventHandlers();
      console.debug('in horizon list');
      //await this._getAvailableShoppingNetworks();
      this._startLoadingTextTimer();
      if (this.props.networkPickerData.length == 0) {
        // alert("ME LOADED");
        //only refresh if there's NO netowrks!
        // showMessage({
        //   description:"Welcome to Hopprfy!",
        //   message: "Buy anything and have it delivered instantly.",
        //   duration: 2000,
        //   backgroundColor: GlobalStyle.primaryColorDark.color, // background color
        //   //description: this.props.latestPickerDestinationText,
        //   color: "white", // text color
        //   style:{
        //     borderBottomLeftRadius: 20,
        //     borderBottomRightRadius: 20},
        //     position: "center",
        //   autoHide: true,

        // });

        setTimeout(() => {
          showMessage({
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            message: 'Welcome to Hopprfy',
            description:
              'We used your current location to show you nearby stores and products, all available within 30 mins!',
            backgroundColor: '#a2349b', // background color
            color: 'white', // text color,
            autoHide: true,
            duration: 3100,
          });
        }, 300);
        await this._getAvailableShoppingNetworks();
        this.firstLoad = false;
      }

      //this should only get cats for currently selected network!!!
      //if there isn't one, get for the first 'available' shopping network
      this._fetchAllPost();

      //DO ONE TIME STUFF!
      setTimeout(() => {
        try {
          if (this.props.firstInstanceAppLoad) {
            this.props.updateFirstInstanceLoad(false);
            // if(this.props.networkPickerData.length > 0)
            // {
            //   //don't show if no nets
            //   this._openNetworkSwitcherModal();
            // }
            // else{
            //   //show nearest stores map
            //   EventRegister.emit("showNearbyStoresModal")
            // }

            //SoundPlayer.playSoundFile("thereflexes2", "mp3");
          }
        } catch (error) {}
      }, 2000);
    } catch (error) {
      alert("Couldn't get data - no connectivty? Please try again.");
    } finally {
    }
  };

  _resetFilterTextToDefault = () => {
    this._setLoadingTextAndImage(defaultLoadingTextAndImage);
  };

  _setLoadingTextAndImage = newText => {
    this.setState({loadingTextAndImage: newText});
  };

  changeStateColorIfNewColorPassedIn(newColor) {
    if (typeof newColor !== 'undefined' && newColor !== '') {
      if (this.state.currentSelectedNetworkColor != newColor) {
        this.setState({currentSelectedNetworkColor: newColor});
      }
    }
  }

  _selectedNetworkPickerValue(index, selectedItem) {
    try {
      this.setState({selectedText: selectedItem.name});

      let indexNets = this.props.networkPickerData.findIndex(
        el => el.name === selectedItem.name,
      );
      let networkSelected = this.props.networkPickerData[indexNets];
      console.debug('about to change network');

      //change network text color in picker
      this.changeStateColorIfNewColorPassedIn(networkSelected.networkCssColor);
      //update the network info modal stored
      //this.props.updateLatestQueriedNetwork(networkSelected);
      //CHANGE THE NETWORK - CALL WHATEVER IT IS AND UPDATE THE REDUX
      this.props.changeNetwork(networkSelected.id).then(() => {
        console.debug('network was changed - resetting layouts');
      });
    } catch (error) {
      EventRegister.emit('hideSpinner');
    }
  }

  //wont' work if there's no selecte netowr
  _refreshCurrentlySelectedNetwork = async () => {
    let indexNets = this.props.networkPickerData
      .map(el => el.id)
      .indexOf(this.props.currentlySelectedNetworkGuid);

    let networkSelected = this.props.networkPickerData[indexNets];
    console.debug('about to refresh network');
    //CHANGE THE NETWORK - CALL WHATEVER IT IS AND UPDATE THE REDUX
    this.props.changeNetwork(networkSelected.id);
    this._startLoadingTextTimer();
    toast('Refreshed!');
  };

  //todo: this isn't working
  _autoloadFirstNetworkIfNothingLoaded = async () => {
    //autoload first network in picker if there is one, if there are no
    try {
      if (typeof this.props.list.length !== 'undefined') {
        if (this.props.list.length == 0) {
          if (this.props.networkPickerData.length > 0) {
            if (this.state.autoloadHasHappened == false) {
              //only want to do it once!
              this.setState({autoloadHasHappened: true}, async () => {
                let testId = this.props.networkPickerData[0].id;
                await this.props.changeNetwork(testId, false);
              });

              //set latest queried network also
              await this._getNetworkAndUpdateLatestQueriedNetwork(testId);
            }
          }
        }
      }
    } catch (error) {
      console.debug('Whatttt');
    }
  };

  _isFirstTimeUserShowMessageIfSo = async () => {
    var cssColor = this._getNetworkCssColor();
    //autoset first network if nothing is set - check existing cats.
    //put if message if first time user
    if (this.state.wasMessageShown == -1) {
      // this.props.updateModalState("startingHelpModal", true);
      // showMessage({
      //   message: `Welcome to ${Config.InAppName}!`,
      //   description:
      //     "We loaded you some brands and stores in your area to get you started.",
      //   type: "success",
      //   autoHide: true,
      //   duration: 6000,
      //   position: "center",
      //   backgroundColor: cssColor,
      //   //backgroundColor: "#ED8C48", // background color
      //   hideOnPress: true,
      //   floating: true,
      // });
      // this.setState({wasMessageShown : 0});
    }
  };

  //this refreshes the network picker
  _getAvailableShoppingNetworks = async () => {
    try {
      EventRegister.emit('showSpinner');
      await this.props.fetchNetworkPickerData();

      //preload Images for networks
      var imgUrls = this.props.networkPickerData.map(function (v) {
        return v.storeLogoUrl;
      });
      ImageHelper.cacheImages(imgUrls);
      await this._autoloadFirstNetworkIfNothingLoaded();
      toast('Networks refreshed');
      if ((this.props.user == null) | (typeof this.props.user == 'undefined')) {
        await this._isFirstTimeUserShowMessageIfSo();
      }
      //if the last network browsed isn't there, set to first network
      setTimeout(async () => {
        //chec if CURRENTLY selected network is in new data - if NOT, set to first
        let currentSelectedNetId = this.props.currentlySelectedNetworkGuid;
        let isthere = this.props.networkPickerData.find(
          x => x.id == currentSelectedNetId,
        );
        console.debug('stop');
        if (typeof isthere === 'undefined') {
          console.debug('stop');
          if (this.props.networkPickerData.length > 0) {
            let firstId = this.props.networkPickerData[0].id;
            await this.props.changeNetwork(firstId, false);
          } else {
            //clear categories, there's no network available
            this.props.resetLayouts();
          }
        }
      }, 800);

      setTimeout(() => {
        if (this.props.networkPickerData.length == 0) {
          EventRegister.emit('showNearbyStoresModal');
        }
      }, 300);
      // let netPickerResult = await HopprWorker.getAvailableShoppingNetworks();
      // this.setState({ networkPickerData: netPickerResult });
    } catch (error) {
      alert("Couldn't refresh networks... timed out?");
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  _registerEventHandlers = () => {
    this.setlocationInputToStartOfTextHandler ==
      EventRegister.addEventListener(
        'setlocationInputToStartOfText',
        async () => {
          //this._setlocationInputToStartOfText()
        },
      );

    this.getAvalilableShoppingNetworksHandler = EventRegister.addEventListener(
      'getAvailableShoppingNetworks',
      async () => await this._getAvailableShoppingNetworks(),
    );

    this.loadFirstNetworkHandler = EventRegister.addEventListener(
      'loadFirstNetwork',
      async () => await this._loadFirstNetwork(),
    );

    this.refreshCurrentlySelectedNetworkHandler =
      EventRegister.addEventListener(
        'getShoppingNetworksAndRefreshCurrentlySelectedNetwork',
        async () => {
          await this._getAvailableShoppingNetworks();
          await this._refreshCurrentlySelectedNetwork();
        },
      );

    this.showNetworkPickerHandler = EventRegister.addEventListener(
      'showNetworkPicker',
      async () => {
        try {
          if (this.props.networkPickerData.length > 0) {
            EventRegister.emit('showSpinner');
            EventRegister.emit('resetStacksAndGo');
            this._openNetworkSwitcherModal();
            this.props.navigate.navigate('Home');
          }
        } catch (error) {
        } finally {
          EventRegister.emit('hideSpinner');
        }
      },
    );
  };

  _openNetworkSwitcherModal = () => {
    this.clearProductInputSuggestions();
    this._clearAutocompleteLocationSuggestions();

    if (this.props.networkPickerData.length > 0) {
      this.props.updateModalState('networkSwitcherModal', true);
    } else {
      showMessage({
        style: {
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        },
        position: 'center',
        message: 'There are no networks to show  you!!',
        description:
          "Try changing your location, there is nothing in your area, I'm afraid.",
        backgroundColor: '#a2349b', // background color
        color: 'white', // text color,
        autoHide: true,
        duration: 3100,
      });
    }
  };

  _loadFirstNetwork = async () => {
    if (this.props.networkPickerData.length > 0) {
      let testId = this.props.networkPickerData[0].id;
      this.props.changeNetwork(testId, false);
      await this._getNetworkAndUpdateLatestQueriedNetwork(testId);
    }
  };

  _unregisterEventHandlers = () => {
    EventRegister.removeEventListener(
      this.getAvalilableShoppingNetworksHandler,
    );
    EventRegister.removeEventListener(this.loadFirstNetworkHandler);
    EventRegister.removeEventListener(this.showNetworkPickerHandler);
    EventRegister.removeEventListener(
      this.refreshCurrentlySelectedNetworkHandler,
    );
    EventRegister.removeEventListener(
      this.setlocationInputToStartOfTextHandler,
    );
  };

  /**
   * Fetch all products based on layouts
   */
  _fetchAllPost = () => {
    if (this.props.isConnected) {
      this.props.fetchAllProductsLayout();
    }
  };

  //config is a ProductClassClientConfig object (server side)
  _fetchPost = ({config, index, page}) => {
    const {fetchProductsByCollections} = this.props;
    fetchProductsByCollections(config.productClassId, config.tag, page, index);
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

  _setCurrentNetwork = currentNetwork => {
    if (typeof currentNetwork !== 'undefined') {
      if (this.state.currentSelectedNetwork.id !== currentNetwork.id) {
        this.setState({currentSelectedNetwork: currentNetwork});
      }
    }
  };

  _renderNetworkLogoImage() {
    let imgPayload = Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo;

    try {
      let indexOfItem = this.props.networkPickerData
        .map(el => el.id.toUpperCase())
        .indexOf(this.props.currentlySelectedNetworkGuid.toUpperCase());

      let networkSelect = this.props.networkPickerData[indexOfItem];
      let fullURl =
        'https://booza.store:44300/images/networklogos/fireworks.png';

      var cssColor = this._getNetworkCssColor();
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
    } catch (error) {}
    return this._renderNetworkPickerRow(imgPayload);

    return (
      <TouchableOpacity
        onLongPress={() => {
          // try {
          //   this.props.updateModalState("quickControlsModal", true);
          // } catch (error) {
          //   console.debug(error);
          // }
        }}
        onPress={() => {
          // try {
          //   this.props.updateModalState("quickControlsModal", true);
          //   //this.props.updateModalState("nearestStoresAndNetworksModal", true);
          // } catch (error) {
          //   console.debug(error);
          // }
        }}>
        {/* <FastImage
          resizeMode={"contain"}
          source={imgPayload}       
          style={{
            height:84,
            maxWidth:width*0.34,
            width:width*0.34,
          }}        
        /> */}
      </TouchableOpacity>
    );
  }

  _startLoadingTextTimer = () => {
    //  alert('start time');
    setTimeout(() => {
      this._setLoadingTextAndImage(noMenuAvailableLoadingTextAndImage);
    }, 9000);
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

  _showDriverStoreToggle = () => {
    this.props.updateModalState('quickControlsModal', true);

    // showMessage({
    //   message: "CONTROLS:",
    //   autoHide: true,
    //   duration: 12000,
    //   position: "top",
    //   description: "......................",
    //   //backgroundColor: "#FF5733 ", // background color
    //   color: "white", // text color
    //   renderCustomContent: () => {
    //     return (
    //       <View style={{ height: 200, minHeight: 200 }}>
    //         <Image
    //           source={Images.HopprLogo2}
    //           style={[
    //             styles.logo,
    //             Config.Theme.isDark && { tintColor: "#eee" }
    //           ]}
    //         />
    //         <Text>{"THIS IS A TEST"}</Text>
    //       </View>
    //     );
    //   }
    // });
  };

  _getNetworkAndUpdateLatestQueriedNetwork = async netId => {
    let newNetResultsData = await HopprWorker.getNetwork(netId);
    // let netsArray = [];
    // netsArray.push(newNetResultsData);

    //lowecase the result so it works
    let entries = Object.entries(newNetResultsData);
    let capsEntries = entries.map(entry => [
      entry[0][0].toLowerCase() + entry[0].slice(1),
      entry[1],
    ]);
    let netNets = fromEntries(capsEntries);

    console.log(netNets);
    //decaptialist all

    //push to redux
    this.props.updateLatestNetworkForInfoQuery(netNets);
  };

  showNetworkImagePlaceholder = () => {
    this.setState({showNetworkLogoImagePlaceHolder: true});
  };

  hideNetworkImagePlaceholder = () => {
    this.setState({showNetworkLogoImagePlaceHolder: false});
  };

  _verifyNetworkInfoModalAndShow = async () => {
    try {
      EventRegister.emit('showSpinner');

      //is selected network picker Id the same as what is being passed to the modal?
      if (
        typeof this.props.latestQueriedNetwork == 'undefined' ||
        this.props.currentlySelectedNetworkGuid !==
          this.props.latestQueriedNetwork.networkId
      ) {
        //if no, GET that network and send it to the redux that controls what powers the modal (e.g. the props)
        //get the new net
        await this._getNetworkAndUpdateLatestQueriedNetwork(
          this.props.currentlySelectedNetworkGuid,
        );
      }
      //pass it to redux action
      this.props.updateModalState('networkDisplayModal', true);
    } catch (error) {
      alert('That failed to work correctly:' + error.message);
    } finally {
      EventRegister.emit('hideSpinner');
    }
  };

  _renderNetworkPickerRow = imgPayload => {
    const selectedNetwork = this.props.networkPickerData.find(
      el => el.id === this.props.currentlySelectedNetworkGuid,
    );
    const networkName = selectedNetwork ? selectedNetwork.name : 'Choose...';

    let realimgPayload =
      typeof selectedNetwork === 'undefined'
        ? Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo
        : {uri: Config.NetworkImageBaseUrl + selectedNetwork.storeLogoUrl};

    //THERE IS MINUS VALUE HERE FOR CORRECT STYLING!!
    let pickerStyle = {
      height: networkPickerRowHeight,
      maxWidth: width * 0.34,
      width: width * 0.34,
    };

    //Clicmk to show picker
    return (
      <ImageBackground
        style={pickerStyle}
        resizeMode={'contain'}
        source={ null
          //this.state.showNetworkLogoImagePlaceHolder
          //  ? Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo
          //  : null
        }>
        <FastImage
          style={pickerStyle}
          resizeMode={'contain'}
          source={realimgPayload}
          onLoadEnd={() => this.hideNetworkImagePlaceholder()}></FastImage>
      </ImageBackground>
    );

    // <RNPicker
    //   ref={(el) => (this._networkPicker = el)}
    //   dataSource={this.props.networkPickerData}
    //   dummyDataSource={this.props.networkPickerData}
    //   defaultValue={false}
    //   disablePicker={false}
    //   changeAnimation={"slide"}
    //   pickerTitle={"Choose a Hopprfy Network:"}
    //   showSearchBar={true}
    //   showPickerTitle={true}
    //   pickerStyle={pickerStyle}
    //   selectedLabel={""}
    //   placeHolderLabel={this.state.placeHolderText}
    //   selectLabelTextStyle={[
    //     styles.selectLabelTextStyle,
    //     { color: "silver", fontFamily: Constants.fontHeader,  }, //this.state.currentSelectedNetworkColor }
    //   ]}
    //   pickerItemTextStyle={{
    //     fontFamily: Constants.fontHeader,
    //     fontSize:16
    //   }}
    //   searchBarContainerStyle={{
    //     borderColor: "black",
    //     border: 1,
    //   }}
    //   dropDownImageStyle={pickerStyle}
    //   dropDownImage={imgPayload}
    //   selectedValue={(index, item) =>
    //     this._selectedNetworkPickerValue(index, item)
    //   }
    // />
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

  _setlocationInputToStartOfText = () => {
    this._locationTextInput &&
      this._locationTextInput.setNativeProps({selection: {start: 0, end: 0}}); //set to start
  };

  _copyTextToLocationTExtInput = text => {
    this._locationTextInput &&
      this._locationTextInput.setNativeProps({text: text});
    setTimeout(() => {
      this._setlocationInputToStartOfText();
    }, 50);
  };

  _renderHeader = () => {
    this._checkRenderLogoImageStatus();

    let cssColor = this._getNetworkCssColor();
    let imgPayload = Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo;

    try {
      let indexOfItem = this.props.networkPickerData
        .map(el => el.id.toUpperCase())
        .indexOf(this.props.currentlySelectedNetworkGuid.toUpperCase());
      let networkSelect = this.props.networkPickerData[indexOfItem];

      if (typeof networkSelect !== 'undefined') {
        fullURl = Config.NetworkImageBaseUrl + networkSelect.storeLogoUrl;
        imgPayload = {uri: fullURl};
      }
    } catch (error) {}

    const {scrollY} = this.state;

    const headerHeight = scrollY.interpolate({
      inputRange: [0, 3 * (HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT)],
      outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      extrapolate: 'clamp',
    });

    const headerPaddingTop = scrollY.interpolate({
      inputRange: [0, 3 * (HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT)],
      outputRange: [40, 0],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange: [0, 3 * (HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT)],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    var placeHolderInfo = this._getPlaceHolderInfo();
    let currentLocaitonText = this.props.latestPickerTextInputBackingField;
    let amountOfPaddingTOAddToLocationPickerIcon =
      currentLocaitonText.length > 0 ? 0 : 40;

    return (
      <Animated.View
        scrollEventThrottle={0}
        onLayout={event => {
          var {x, y, width, height} = event.nativeEvent.layout;
          this.setState({currentHeaderHeight: height});
        }}
        style={{
          backgroundColor: cssColor,
          padding: 20,
          paddingTop: headerPaddingTop,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          // borderWidth: 1,
          // borderColor: "red",
          // borderWidth: 1,
          //position:"absolute",
          width: width,
          flexDirection: 'row',
          height: headerHeight,
          overflow: 'hidden',
          opacity,
          elevation: 9991,
          zIndex: 9991,
        }}>
        <View
          style={{
            maxWidth: width * 0.34,
            flexDirection: 'column',
            overflow: 'visible',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              maxHeight: 88,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{}}
              onLongPress={() => {
                EventRegister.emit('showNearbyStoresModal');
              }}
              onPress={() => {
                this._openNetworkSwitcherModal();
              }}>
              {this._renderLogoImage(imgPayload)}
            </TouchableOpacity>
          </View>
          <TextTicker
            numberOfLines={1}
            duration={16000}
            loop
            repeatSpacer={100}
            marqueeDelay={3000}
            style={[styles.headerNetworkName, {padding: 2}]}>
            {this.state.currentSelectedNetwork.name}
          </TextTicker>
          <Text
            style={{
              fontSize: 8,
              color: 'white',
              textAlign: 'center',
              paddingTop: 0,
              marginTop: 0,
              fontFamily: Constants.fontFamily,
            }}>
            {this.state.filterText}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'column',
            flexShrink: 1,
            marginLeft: 20,
            justifyContent: 'space-between',
            // borderWidth: 1,
            flexGrow: 1,
            paddingTop: 10,
          }}>
          <View style={{zIndex: 3, elevation: 3, marginBottom: 6}}>
            <View style={styles.quickSearchField}>
              {/* NEW AUTOCOMPLETE */}
              <TextInput
                style={{
                  flex: 1,
                  fontStyle: 'italic',
                  // paddingLeft:28,
                  color: 'white',
                  fontFamily: Constants.fontFamily,
                  backgroundColor: 'transparent',
                }}
                value={this.state.currentProdAutoSearchTerm}
                placeholder={'Search anything...'}
                placeHolderTextStyle={{fontStyle: 'italic'}}
                placeholderTextColor={styles.placeholderTextColor.color}
                onChangeText={async text => {
                  //wait a sec before firing, in case of other input
                  this.setState({currentProdAutoSearchTerm: text});
                  clearTimeout(this.productAutocompleteTimer);
                  this.productAutocompleteTimer = setTimeout(async () => {
                    await this.getProductAutocomplete(text);
                  }, 500);
                }}
                onFocus={() => this._clearAutocompleteLocationSuggestions()}
                ref={component => (this._productTextInput = component)}
              />
              {this.state.currentProdAutoSearchTerm.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    //clear latest searched value
                    this.clearProductInputSuggestions();
                    this.clearProductInputText();
                    this.props.updateManualAddressPrefixInput('');
                  }}>
                  <View style={styles.quickSearchClearButton}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: Constants.fontFamilyBold,
                      }}>
                      X
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{zIndex: 4, elevation: 4}}>
            <View style={[styles.quickSearchField]}>
              <TextInput
                style={{
                  flex: 1,
                  zIndex: 0,
                  fontStyle: 'italic',
                  color: 'white',
                  //paddingLeft:,
                  paddingRight: width * 0.109,
                  fontFamily: Constants.fontFamily,
                  backgroundColor: 'transparent',
                }}
                numberOfLines={1}
                multiline={false}
                autoCorrect={false}
                autoCapitalize={false}
                //autoCompleteType={false}
                selectionColor={'grey'}
                selectTextOnFocus={false}
                // value={currentLocaitonText}
                placeholder={placeHolderInfo.text}
                placeHolderTextStyle={{fontStyle: 'italic'}}
                placeholderTextColor={'silver'}
                onEndEditing={() => {
                  // this._setlocationInputToStartOfText()
                }}
                onFocus={() => {
                  if (
                    typeof this._locationTextInput._lastNativeText ===
                    'undefined'
                  ) {
                    this._copyTextToLocationTExtInput(
                      this.props.latestPickerTextInputBackingField,
                    );
                    this.clearProductInputSuggestions();
                  }
                }}
                onChangeText={async text => {
                  //this._locationTextInput.setNativeProps({ text: text})
                  this.props.updateLatestLocationText(text);
                  await this.getLocationAutocomplete(text);
                }}
                ref={component => (this._locationTextInput = component)}
              />

              {/* ROW OF BUTTONS */}
              <View
                style={{
                  alignContent: 'flex-end',
                  borderWidth: 0,
                  borderColor: 'white',
                  flexDirection: 'row',
                  position: 'absolute',
                  right: -1,
                  zIndex: 99998,
                  elevation: 99998,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                {/* <View style={{ 
        zIndex:99999,
        elevation:99999,
        left:-((width * 0.32) + amountOfPaddingTOAddToLocationPickerIcon) }}>
        <TouchableOpacity   
            onPress={()=>{
              this.props.updateModalState("locationPickerModal", true)
            }}
            >
          <View style={[styles.quickSearchClearButton]}>
            <Image source={Images.NewAppReskinIcon.Here} style={{height:30, width:30}}/>
          </View>
        </TouchableOpacity>       
        </View> */}

                {this.props.latestPickerTextInputBackingField.length > 0 && (
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={async () => {
                        this._clearAutocompleteLocationSuggestions();
                        // this.setState({ currentLocationAutoSearchTerm: "" });

                        this.props.resetCurrentPickedOrderDestination();
                        this.props.updateLatestLocationText('');
                        await this._getAvailableShoppingNetworks();
                        await this._refreshCurrentlySelectedNetwork();

                        showMessage({
                          message: 'Viewing global menus',
                          duration: 4000,
                          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                          description:
                            'We are showing all products nationwide. To see nearby products, choose a destination. ',
                          color: 'white', // text color
                          style: {
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                          },
                          position: 'center',
                          autoHide: true,
                        });
                      }}>
                      <View style={styles.quickSearchClearButton}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 16,
                            fontFamily: Constants.fontFamilyBold,
                          }}>
                          X
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View
            style={{
              zIndex: 1,
              paddingBottom: 2,
              elevation: 1,
              overflow: 'visible',
            }}>
            {this._renderDescriptionTextTicker()}
          </View>
        </View>
      </Animated.View>
    );
  };

  _renderDescriptionTextTicker = () => {
    if (
      (this.state.hideLocationSuggestions == true &&
        this.state.hideProductSuggestions == true) ||
      (this.props.latestProductAutocompleteSearchResults == 0 &&
        this.state.locationAutocompletePossibleResults == 0)
    ) {
      return (
        <TextTicker
          style={styles.headerNetworkDescription}
          loop
          repeatSpacer={50}
          numberOfLines={1}>
          {this.state.currentSelectedNetwork.description}
        </TextTicker>
      );
    }
    return (
      <View
        style={{
          backgroundColor: GlobalStyle.primaryColorDark.color,
          maxHeight: 25,
          minHeight: 25,
          top: listSuggestionPlacement - 10,
        }}></View>
    );
  };

  _renderHeaderOld = () => {
    console.debug('render header');
    //assign correct value to state for which image

    const {
      theme: {
        colors: {text},
      },
    } = this.props;

    var cssColor = this._getNetworkCssColor();

    // let mainControlRowHeight = 130;
    return (
      <View
        style={{
          backgroundColor: cssColor,
          padding: 20,
          paddingTop: 40,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
        <View style={{flexDirection: 'row', flex: 1}}>
          {this._renderLogoImage()}
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-end',
              // borderWidth: 2,
              // borderColor: "red",
              // minHeight: mainControlRowHeight,
              // maxHeight: mainControlRowHeight
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              {/* FIRST ROW GOES HERE */}
              {/* {this._renderNetworkPickerRow(imgPayload)} */}
            </View>

            {/* SECOND ROW GOES HERE */}
            <View
              style={{
                flex: 1,
                marginRight: 4,
                marginTop: 6,
                margin: 4,
                flexDirection: 'row',
                alignContent: 'flex-end',
              }}>
              <TouchableOpacity
                style={{marginRight: 4}}
                onPress={() => {
                  this.props.updateLocationAutocomplete(true);
                  this.props.updateProductAutocomplete(true);
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    padding: 7,
                    paddingBottom: 0,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                    //   width: undefined
                  }}
                  source={Images.ShowInputs2}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginRight: 4}}
                onPress={() => {
                  this.props.updateModalState('startingHelpModal', true);
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    padding: 7,
                    paddingBottom: 0,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                    //   width: undefined
                  }}
                  source={Images.HelpPhone}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginRight: 4}}
                onPress={() => {
                  this._showDriverStoreToggle();
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    padding: 7,
                    paddingBottom: 0,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                    //   width: undefined
                  }}
                  source={Images.Switch1}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginRight: 4}}
                onPress={() => {
                  this.props.updateModalState(
                    'nearestStoresAndNetworksModal',
                    true,
                  );
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    padding: 7,
                    paddingBottom: 0,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                    //   width: undefined
                  }}
                  source={Images.ShopLocation1}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.updateModalState('requestPermissionsModal', true);
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    padding: 7,
                    paddingBottom: 0,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                    //   width: undefined
                  }}
                  source={Images.GlobalNetwork}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {/* <View style={{ marginRight: 4 }}>
                <TouchableOpacity
                  onPress={() => {
                    alert("This is clearing all network items");
                    this.props.resetLayouts().then((x) => {
                      toast("CATS CLEANED!!!!");
                      this.forceUpdate();
                    });
                  }}
                >
                  <Image
                    style={{
                      resizeMode: "contain",
                      padding: 7,
                      paddingBottom: 0,
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30,
                      //   width: undefined
                    }}
                    source={Images.EmptyCart1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View> */}
              {/* <View style={{ marginRight: 4 }}>
                <TouchableOpacity onPress={this._getAvailableShoppingNetworks}>
                  <Image
                    style={{
                      resizeMode: 'contain',
                      padding: 7,
                      paddingBottom: 0,
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30
                      //   width: undefined
                    }}
                    source={Images.CloudSync1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View> */}
            </View>
            {/* END OF SECOND ROW */}
          </View>
        </View>
        <View style={{flexDirection: 'row', flex: 1}}>
          <Text
            style={[
              styles.headerDate,
              {
                fontFamily: Constants.fontFamily,
                color: this.state.currentSelectedNetworkColor,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2,
              },
            ]}>
            {/* {this.state.currentDate.toUpperCase()} */}
            {this.state.currentSelectedNetwork.name}
          </Text>
          {/* <Text
            numberOfLines={1}
            style={[styles.headerDate, { color: text }]}
          >
            {" | "}
          </Text> */}
          <TouchableOpacity
            onPress={async () => await this._verifyNetworkInfoModalAndShow()}>
            <View
              style={{
                width: 18,
                flexDirection: 'row',
                paddingLeft: 2,
                marginLeft: 4,
                marginRight: 1,
                paddingRight: 1,
                paddingTop: 2,
                marginTop: 2,
                alignContent: 'center',
                alignItems: 'center',
                //justifyContent: "flex-end",
                // alignSelf: "flex-end"
              }}>
              <Image
                style={{
                  maxHeight: 18,
                  height: 18,
                  width: 18,
                  maxWidth: 18,
                  marginRight: 0,
                  marginLeft: 0,
                  marginBottom: 0,
                }}
                source={Images.Info2}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={[
              styles.headerDate,
              {
                paddingLeft: 2,
                flex: 1,
                color: text,
                fontFamily: Constants.fontFamily,
              },
            ]}>
            {'| ' + this.state.currentSelectedNetwork.description}
          </Text>
        </View>
      </View>
    );
  };

  //this is for each ROW of items - which is set as enums CURRENTLY but should be the category.configs
  //ignore layout = 11 - that's the circle row - rendered seperately
  _renderItem = ({item, index}) => {
    const {
      list,
      onShowAll,
      onViewProductScreen,
      // collections, //THIS IS NOW IGNORED
      setSelectedCategory,
      fetchProductsByCollections,
      showCategoriesScreen,
    } = this.props;

    let newConfigCollection =
      this._generateCategoryConfigsFromProductClassListData(list);

    //TEST CODE
    // let configCollectionString = "";
    // newConfigCollection.map(x => (configCollectionString += x.name));
    // alert(
    //   "rendering item: " +
    //     item.name +
    //     " in HorizonList/index.js " +
    //     " -- config collection was: " +
    //     configCollectionString
    // );
    // console.debug("rendering item: " + item.name + " in HorizonList/index.js");
    //END TEST CODE
    return (
      <HList
        horizontal
        onViewProductScreen={onViewProductScreen}
        onShowAll={onShowAll}
        key={'taglist-' + item.id}
        config={item} //this is new config item
        index={index}
        collection={newConfigCollection[index]} //this is collection of new config items
        list={list}
        fetchPost={this._fetchPost}
        fetchProductsByCollections={fetchProductsByCollections}
        setSelectedCategory={setSelectedCategory}
        showCategoriesScreen={showCategoriesScreen}
      />
    );
  };

  _insertCircleRowAtSecondIndexToDisplayAllCats(listOfConfigs) {
    //create a new 'item' for every cat and insert into the 'items' array
    //then add this item into the list of configs at hardcoded position [1] so it gets picked up as second row
    //increment all other listingOrders by one AFTER position 0

    //GENERATE CIRCLE ROW
    if (listOfConfigs.length > 0) {
      let items = [];
      //create the configs from existisng classes
      listOfConfigs.map(x => {
        items.push(
          new circleRowConfigItem(
            x.productClassId,
            x.roundedIconUrl,
            [x.htmlClientColor1, x.htmlClientColor2],
            x.name,
          ),
        );
      });
      let circleRowToInsert = new circleRowConfig(items);

      //INCREMENT ALL THE config orders
      listOfConfigs.map(x => {
        if (x.listingOrder > 0) {
          x.listingOrder = ++x.listingOrder;
        }
      });

      //NOW INSERT THE ROW INTO the listOfConfigs at position 1
      listOfConfigs.splice(1, 0, circleRowToInsert);
      return listOfConfigs;
    }

    return listOfConfigs;
  }

  _generateCategoryConfigsFromProductClassListData = list => {
    if (list.length > 0) {
      let alltheCategoryConfigs = [];
      list.map(x => {
        let firstConfig = x.ProductClassClientConfigs[0];
        if (typeof firstConfig !== 'undefined') {
          alltheCategoryConfigs.push(firstConfig);
        }
      });

      //MUTATES AND ADDS IN FIXED ROW
      if (typeof list !== 'undefined')
        if (list.length > 0) {
          this._insertCircleRowAtSecondIndexToDisplayAllCats(
            alltheCategoryConfigs,
          );
        }

      let sorted = alltheCategoryConfigs.sort((a, b) =>
        a.listingOrder > b.listingOrder ? 1 : -1,
      );
      return sorted;
    }
  };

  _renderPageErrorButton = () => {
    return (
      <ScrollView style={{}}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            paddingTop: correctPhoneBaseHeaderPadding + height * 0.04,
            justifyContent: 'center',
          }}>
          <View
            style={{
              flex: 1,
              alignContent: 'center',
              paddingLeft: 8,
              paddingRight: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  RNRestart.Restart();
                  // EventRegister.emit("resetStacksAndGo");
                  // await this._getAvailableShoppingNetworks();
                  // this._fetchAllPost();
                } catch (error) {
                } finally {
                  EventRegister.emit('hideSpinner');
                }
              }}>
              <FastImage
                style={{
                  maxHeight: 200,
                  height: 200,
                  width: width,
                  maxWidth: width,
                }}
                source={this.state.loadingTextAndImage.image}
                //source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
                resizeMode="contain"
              />

              <Text
                style={{
                  textAlign: 'center',
                  color: 'silver',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  fontFamily: Constants.fontFamily,
                  fontSize: 11,
                  paddingTop: 3,
                }}>
                {'Click to refresh.'}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: GlobalStyle.primaryColorDark.color,
                  fontFamily: Constants.fontHeader,
                  fontSize: 22,
                  paddingTop: 18,
                }}>
                {this.state.loadingTextAndImage.text}
              </Text>
              {/* <Text style={{
          textAlign:"center", 
          color:"black",          
          fontFamily:Constants.fontFamily,           
          fontSize:12, paddingTop:8}}>{this.state.loadingTextAndImage.subtext}
          </Text>  */}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
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
    //cancel keyboard timer and start new one!
    this._cancelHideKeyboardTimer();
    this._startHideKeyboardTimer();

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
        style={
          (styles.quickSearchField,
          {
            fontStyle: 'italic',
            color: 'white',
            fontFamily: Constants.fontFamily,
            backgroundColor: 'transparent',
          })
        }
        value={this.state.currentProdAutoSearchTerm}
        placeholder={'Search anything...'}
        placeHolderTextStyle={{fontStyle: 'italic'}}
        placeholderTextColor={styles.placeholderTextColor.color}
        onChangeText={text => this.getProductAutocomplete(text)}
        ref={component => (this._productTextInput = component)}
      />
    );
  };

  _renderItemLocationAutocomplete = (item, i) => {
    return (
      <View
        style={{
          borderWidth: 0,
          //borderColor: GlobalStyle.primaryColorDark.color,
          borderRadius: 0,
          //maxWidth: locationAutocompleteWidth + 400,
        }}>
        <TouchableOpacity
          onPress={() => {
            try {
              this._reverseGeocodeTappedAddressAndUpdateLocationRedux(
                item.item,
              );
              //launch location picker modal once redux done
            } catch (error) {
            } finally {
              //clear suggestions box
            }
          }}>
          <Text
            style={{
              color: 'white',
              fontFamily: Constants.fontFamily,
              textAlign: 'center',
              // maxWidth: locationAutocompleteWidth + 400,
              fontSize: 18,
            }}>
            {' Update destination: ' + item.item}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  _renderItemProductAutocomplete = (item, i) => {
    return (
      <View
        style={{
          zIndex: 999999,
          borderWidth: 0,
          borderColor: 'white',
          borderRadius: 30,
          padding: 2,
          flex: 1,
          marginRight: 10,
          margin: 2,
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
                //alert("Sorry not sure what happened...?");
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
    );
  };

  /**For product Autocomplete */
  _renderProductAutocomplete = () => {
    let cssCOlor = this._getNetworkCssColor();
    return (
      <View
        style={{
          flexGrow: 1,
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
            maxHeight: heightForTHeAutocompletes,
          }}
          listStyle={{
            position: 'absolute',
            fontSize: 12,
            borderWidth: 0.5,
            borderColor: 'white',
            width: width * 0.54,
            paddingRight: 4,
            // borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: cssCOlor,
            borderTopWidth: 0.5,
            minWidth: width * 0.4,
            borderBottomWidth: 1,
            borderRadius: 0,
            marginTop: 13,
            marginLeft: 2,
            //  maxHeight: 500,
            padding: 8,
          }}
          clearButtonMode={'always'}
          onChangeText={text => this.getProductAutocomplete(text)}
          renderTextInput={() => this._renderTextInputForProductAutocomplete()}
          renderItem={(item, i) => this._renderItemProductAutocomplete(item, i)}
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
          style={{
            color: 'white',
            flex: 1,
            marginRight: 4,
            fontFamily: Constants.fontFamily,
            fontSize: fontSize,
          }}>
          {' ' + item.name + desc}
        </Text>
      );
    } else {
      return (
        <View style={{flexDirection: 'row', paddingRight: 20, marginRight: 20}}>
          <View
            style={{
              marginRight: 10,
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
                paddingRight: 5,
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
            style={{
              color: 'white',
              fontSize: fontSize,
              fontFamily: Constants.fontFamily,
              // marginLeft:10,
            }}>
            {' ' + item.name + desc}
          </Text>
        </View>
      );
    }
  };

  clearProductInputText = () => {
    this.setState({currentProdAutoSearchTerm: ''});
    console.debug('Cleared');
  };

  clearProductInputSuggestions = () => {
    this.props.updateProductAutocompleteSearchResults('', []);
    //this.setState({hideProductSuggestions:false});
  };

  clearLocationInputText() {
    if (
      typeof this._locationTextInput !== 'undefined' &&
      this._locationTextInput != null
    )
      try {
        this._locationTextInput.setNativeProps({text: ' '});
        setTimeout(() => {
          this._locationTextInput.setNativeProps({text: ''});
        }, 3);
      } catch (error) {}
  }

  _clearAutocompleteLocationSuggestions = () => {
    this.setState({locationAutocompletePossibleResults: []});
    // this.setState({hideLocationSuggestions:false});
  };

  _reverseGeocodeTappedAddressAndUpdateLocationRedux =
    async pickedAddressString => {
      this._clearAutocompleteLocationSuggestions();
      //this.clearLocationInputText();

      try {
        let tries = 6;
        let didItWork = false;
        let geoResult;

        do {
          geoResult = await GeoWorker.geocode(pickedAddressString.trim());
          tries = tries - 1;
          if (typeof geoResult !== 'undefined') {
            didItWork = true;
          }
        } while (!didItWork && tries > 0);

        if (typeof geoResult !== 'undefined') {
          let geoLatLng = {
            lat: geoResult.position.lat,
            lng: geoResult.position.lng,
          };
          //update redux with the string and the coords
          this.props.pushCurrentPickerLocationAsOrderDestination(
            geoLatLng,
            pickedAddressString,
            geoResult,
          );

          //update the backing field as well
          this.props.updateLatestLocationText(pickedAddressString);
          // this._setlocationInputToStartOfText();

          // //launch location modal
          // this.props.updateModalState("locationPickerModal", true);

          SoundPlayer.playSoundFile('notification5', 'mp3');
          showMessage({
            message: 'Your order destination was set!',
            duration: 2000,
            backgroundColor: GlobalStyle.primaryColorDark.color, // background color
            description:
              this.props.latestPickerDestinationText +
              '\nWe are generating your menus.',
            color: 'white', // text color
            style: {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
            position: 'center',
            autoHide: true,
          });

          await this._getAvailableShoppingNetworks();
          await this._refreshCurrentlySelectedNetwork();
        } else {
          alert("That didn't work!!");
        }
      } catch (error) {
      } finally {
      }
    };
  /**Destination Locaiton Autocomplete */
  _renderLocationAutocomplete = () => {
    let cssCOlor = this._getNetworkCssColor();
    return (
      <View
        style={{
          flexGrow: 1,
        }}>
        <Autocomplete
          //hideResults={false}
          data={this.state.locationAutocompletePossibleResults}
          containerStyle={{
            borderWidth: 0,
            borderColor: 'white',
          }}
          inputContainerStyle={{
            // color: "black",
            borderWidth: 0,
            maxHeight: heightForTHeAutocompletes,
          }}
          listStyle={{
            position: 'absolute',
            fontSize: 12,
            width: width * 0.54,
            borderWidth: 0.5,
            borderColor: 'white',
            // borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: cssCOlor,
            borderTopWidth: 0,
            borderBottomWidth: 1,
            borderRadius: 0,
            marginTop: 13,
            marginLeft: 4,
            paddingRight: 4,
            // maxHeight: 500,
            padding: 8,
          }}
          clearButtonMode={'always'}
          onChangeText={text => this.getLocationAutocomplete(text)}
          renderTextInput={() => this._renderTextInputForLocationAutocomplete()}
          renderItem={(item, i) => (
            <View
              style={{
                borderWidth: 0,
                //borderColor: GlobalStyle.primaryColorDark.color,
                borderRadius: 0,
                //maxWidth: locationAutocompleteWidth + 400,
              }}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    this._reverseGeocodeTappedAddressAndUpdateLocationRedux(
                      item.item,
                    );
                    //launch location picker modal once redux done
                  } catch (error) {
                  } finally {
                    //clear suggestions box
                  }
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: Constants.fontFamily,
                    // maxWidth: locationAutocompleteWidth + 400,
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
  _getPlaceHolderInfo = () => {
    let placeholderTExt = 'Where to...   ';
    let latestPickerDestinationText = this.props.latestPickerDestinationText;
    let colorOfPlaceHolder = styles.placeholderTextColor.color;

    if (
      typeof latestPickerDestinationText !== 'undefined' &&
      latestPickerDestinationText != null &&
      latestPickerDestinationText != 'None' &&
      this.latestPickerDestinationText != ''
    ) {
      let bundledDestination =
        this.props.manualAddressPrefixInput === ''
          ? latestPickerDestinationText
          : this.props.manualAddressPrefixInput +
            ' ' +
            latestPickerDestinationText;
      try {
        bundledDestination =
          bundledDestination.split(/\s+/).slice(0, 3).join(' ').slice(0, -1) +
          '...';
      } catch (error) {}

      placeholderTExt =
        latestPickerDestinationText == ''
          ? 'Where to..?'
          : 'To: ' + bundledDestination;
      colorOfPlaceHolder = 'white'; //GlobalStyle.primaryColorDark.color;
    }

    return {text: placeholderTExt, color: colorOfPlaceHolder};
    // <TextInput
    // style={{ flex:1, fontStyle:"italic", color:"white", fontFamily:Constants.fontFamily, backgroundColor: "transparent"}}
    //  value={this.state.currentProdAutoSearchTerm}
    //  placeholder={"Search anything..."}
    //  placeHolderTextStyle={{fontStyle: "italic"}}
    //  placeholderTextColor={styles.placeholderTextColor.color}
    //  onChangeText={(text) => this.getProductAutocomplete(text)}
    //  ref={(component) => (this._productTextInput = component)}
    // />
    {
      /* <View style={{flex:1}}>
    <TextInput
      style={{ flex:1, minWidth:100, fontStyle:"italic", color:"white", fontFamily:Constants.fontFamily, backgroundColor: "transparent"}}
        numberOfLines={1}        
        value={this.state.currentLocationAutoSearchTerm}
        placeholder={placeholderTExt}
        placeHolderTextStyle={{fontStyle: "italic"}}
        placeholderTextColor={colorOfPlaceHolder}
        onChangeText={(text) => this.getLocationAutocomplete(text)}
        ref={(component) => (this._locationTextInput = component)}
      />
      </View> */
    }
  };

  getLocationAutocomplete = async phrase => {
    this.setState({currentLocationAutoSearchTerm: phrase});
    if (phrase.length > 3) {
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

      // cancel keyboard timer and start new one!
      // this._cancelHideKeyboardTimer();
      // this._startHideKeyboardTimer();

      //then save the results to the place where dropdown is mapped
      //this.props.updateProductAutocompleteSearchResults(phrase, result);
    }
  };

  renderAutocompleteResultList() {
    const {
      data,
      listStyle,
      renderItem,
      keyExtractor,
      renderSeparator,
      keyboardShouldPersistTaps,
      flatListProps,
      onEndReached,
      onEndReachedThreshold,
    } = this.props;

    return (
      <FlatList
        ref={this.onRefListView}
        data={data}
        keyboardShouldPersistTaps={true}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        renderSeparator={renderSeparator}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        style={[styles.list, listStyle]}
        {...flatListProps}
      />
    );
  }

  _startHideKeyboardTimer = () => {
    this.hideKeyboardTimer = setTimeout(() => {
      Keyboard.dismiss();
    }, 1500);
  };

  _cancelHideKeyboardTimer = () => {
    try {
      clearTimeout(this.hideKeyboardTimer);
    } catch (error) {}
  };

  _renderListForLocationAutoComplete = () => {
    if (
      this.state.locationAutocompletePossibleResults.length > 0 &&
      !this.state.hideLocationSuggestions
    ) {
      return (
        <View
          style={{
            left: 0,
            right: 0,
            position: 'absolute',
            top: listSuggestionPlacement,
            paddingBottom: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            backgroundColor: GlobalStyle.primaryColorDark.color,
            elevation: 9999,
            zIndex: 9999,
          }}>
          <View
            style={{zIndex: 7, maxHeight: height - listSuggestionPlacement}}>
            <FlatList
              data={this.state.locationAutocompletePossibleResults}
              renderItem={this._renderItemLocationAutocomplete}
              //keyExtractor={(item) => item.item.}
            />
          </View>
        </View>
      );
      //     }else{
      //     return(
      //     <View style={{
      //       left: 0,
      //       right: 0,
      //       position:"absolute",
      //       top: listSuggestionPlacement,
      //       paddingBottom:20,
      //       borderBottomLeftRadius:30,
      //       borderBottomRightRadius:30,
      //       paddingLeft:4, paddingRight:4,
      //       overflow:"hidden",
      //       backgroundColor:GlobalStyle.primaryColorDark.color,
      //       elevation:9999,
      //       zIndex: 9999}}>
      //       <View style={{zIndex:7, maxHeight: height - listSuggestionPlacement}}>
      //       <View
      //   style={{
      //     borderWidth: 0,
      //     //borderColor: GlobalStyle.primaryColorDark.color,
      //     borderRadius: 0,
      //     //maxWidth: locationAutocompleteWidth + 400,
      //   }}
      // >
      //   <TouchableOpacity
      //     onPress={() => {
      //       try {
      //         this.props.updateModalState("locationPickerModal", true);
      //         //this._reverseGeocodeTappedAddressAndUpdateLocationRedux(item.item);
      //         //launch location picker modal once redux done
      //       } catch (error) {

      //       }
      //       finally{
      //         //clear suggestions box

      //       }
      //     }}
      //   >
      //     <Text
      //       style={{
      //         color: "white",
      //         fontFamily:Constants.fontFamily,
      //         textAlign:"center",
      //        // maxWidth: locationAutocompleteWidth + 400,
      //         fontSize: 18,
      //       }}
      //     >
      //       {" No results found for that address. Click here to launch the main picker."}
      //     </Text>
      //   </TouchableOpacity>
      // </View>
      // </View>
      // </View>);
    }
  };

  _renderListForProductAutoComplete = () => {
    if (
      this.props.latestProductAutocompleteSearchResults.length > 0 &&
      !this.state.hideProductSuggestions
    )
      return (
        <View
          style={{
            left: 0,
            right: 0,
            position: 'absolute',
            paddingLeft: 4,
            paddingRight: 4,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            top: listSuggestionPlacement,
            backgroundColor: GlobalStyle.primaryColorDark.color,
            elevation: 9999,
            zIndex: 9999,
          }}>
          <View
            style={{
              zIndex: 7,
              marginBottom: 20,
              maxHeight: height - listSuggestionPlacement - 74,
            }}>
            <FlatList
              data={this.props.latestProductAutocompleteSearchResults}
              renderItem={this._renderItemProductAutocomplete}
              //keyExtractor={(item) => item.item.}
            />
          </View>
        </View>
      );

    return null;
  };
  _showOrHideProductSuggestions = e => {
    if (
      e.nativeEvent.contentOffset.y > 0 &&
      this.state.hideProductSuggestions == false
    ) {
      this.setState({hideProductSuggestions: true});
    } else if (
      e.nativeEvent.contentOffset.y <= 0 &&
      this.state.hideProductSuggestions != false
    ) {
      this.setState({hideProductSuggestions: false});
    }
  };

  _showOrHideLocationSuggestions = e => {
    if (
      e.nativeEvent.contentOffset.y > 0 &&
      this.state.hideLocationSuggestions == false
    ) {
      this.setState({hideLocationSuggestions: true});
    } else if (
      e.nativeEvent.contentOffset.y <= 0 &&
      this.state.hideLocationSuggestions != false
    ) {
      this.setState({hideLocationSuggestions: false});
    }
  };

  _handleMainScroll = e => {
    //do tests and set shit
    this._showOrHideProductSuggestions(e);
    this._showOrHideLocationSuggestions(e);
  };

  _renderFlatListOrReload = alltheCategoryConfigs => {
    if (isUndefined(alltheCategoryConfigs) || alltheCategoryConfigs.length == 0)
      return this._renderPageErrorButton();

    return (
      <AnimatedFlatList
        data={alltheCategoryConfigs}
        keyExtractor={(item, index) =>
          `h_${item.layout}_${index}` || `h_${index}`
        }
        renderItem={this._renderItem}
        // ListHeaderComponent={this._renderHeader}
        scrollEventThrottle={1}
        refreshing={this.props.isFetching}
        //onScroll={this._handleMainScroll}
        // onScroll={Animated.event(
        //   [
        //     {
        //       nativeEvent: {
        //         contentOffset: {
        //           y: this.state.scrollY,
        //         },
        //       },
        //     },
        //   ],
        //   { useNativeDriver: false },
        // )}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: this.state.scrollY,
                },
              },
            },
          ],
          {
            listener: event => {
              this._handleMainScroll(event);
            },
          },
        )}
        scrollEventThrottle={16}
        // onScrollEndDrag={() => toast("end")}
        // onScrollBeginDrag={() => toast("start")}
        refreshControl={
          <RefreshControl
            refreshing={this.props.isFetching}
            onRefresh={async () => {
              this._refreshCurrentlySelectedNetwork();
              await this._getAvailableShoppingNetworks();
            }}
          />
        }
      />
    );
  };

  //modified by Nadav 27/04/2019 to update to dynamic layouts
  render = () => {
    const {isFetching, list} = this.props;

    const onScroll = Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              y: this.state.scrollY,
            },
          },
        },
      ],
      {useNativeDriver: true},
    );

    let currentPostion = this.state.scrollY;

    this.updateProductAutocomplete = newValue => {
      this.props.updateProductAutocomplete(newValue);
    };

    this.handleScrolling = event => {
      //toast("SCrolling: " + event.nativeEvent.contentOffset.y);

      //LOCATION AUTOCOMPLETE
      //fade out prod autocomplete
      if (event.nativeEvent.contentOffset.y > 1213) {
        if (this.props.locationAutocompleteVisible) {
          this.props.updateLocationAutocomplete(false);
        }
      }
      //fade in prod autocomplete
      if (event.nativeEvent.contentOffset.y <= 1213) {
        if (!this.props.locationAutocompleteVisible) {
          this.props.updateLocationAutocomplete(true);
        }
      }

      //PROD AUTOCOMPLETE
      //fade out prod autocomplete
      if (event.nativeEvent.contentOffset.y > 1213) {
        if (this.props.productAutocompleteVisible) {
          this.updateProductAutocomplete(false);
        }
      }
      //fade in prod autocomplete
      if (event.nativeEvent.contentOffset.y <= 1213) {
        if (!this.props.productAutocompleteVisible) {
          this.updateProductAutocomplete(true);
        }
      }
    };

    //we get the CONFIGS as an array then pass those configs
    //list is the category / productClass list
    let alltheCategoryConfigs = [];
    alltheCategoryConfigs =
      this._generateCategoryConfigsFromProductClassListData(list);

    let currentMarginHeight = HEADER_EXPANDED_HEIGHT;
    if (typeof this.state.currentHeaderHeight !== 'undefined') {
      currentMarginHeight = Number(Math.round(this.state.currentHeaderHeight));
    }

    return (
      <View
        style={{
          flex: 1,
          zIndex: 1,
          backgroundColor: GlobalStyle.primaryBackgroundColor.color,
        }}>
        {/* MODAL VIEW */}
        <View
          style={{
            flex: 1,
            zIndex: 1,
            backgroundColor: GlobalStyle.primaryBackgroundColor.color,
          }}>
          {/* INNER CONTAINER FOR LISTS */}
          <View
            style={{
              zIndex: 0,
              elevation: 0,
              marginTop: correctPhoneBaseHeaderPadding,
              backgroundColor: GlobalStyle.primaryBackgroundColor.color,
            }}>
            <View style={{zIndex: 99999}}>{this._renderHeader()}</View>

            <View
              style={{
                zIndex: 0,
                elevation: 0,
                //marginTop: currentMarginHeight, //THIS MAKES IT JERKY!!
                paddingBottom: 20,
                marginBottom: 0,
              }}>
              {this._renderFlatListOrReload(alltheCategoryConfigs)}
            </View>
            {/* MODAL */}
          </View>
          {/* LIST FOR PRODUCT AUTCOMPLETE - REMEMBER ELEMENT HEIRCACHY!! LOWER DOWN THE STACK RENDERS ON TOP*/}
          {this._renderListForLocationAutoComplete()}
          {this._renderListForProductAutoComplete()}
        </View>
        <NetworkSwitcherModal
          openClosed={
            this.props.modalsArray.find(
              x => x.modalName === 'networkSwitcherModal',
            ).isOpenValue
          }
          // openClosed={
          //   true
          // }
          selectedValue={(index, item) =>
            this._selectedNetworkPickerValue(index, item)
          }
          dataSource={this.props.networkPickerData}
          closeMe={() => {
            this.props.updateModalState('networkSwitcherModal', false);
          }}
        />
      </View>
    );
  };
}

const makeMapStateToProps = () => {
  const getCollections = makeGetCollections();
  const mapStateToProps = (state, props) => {
    return {
      collections: getCollections(state, props),
      // collections: state.layouts.layout,
      firstInstanceAppLoad: state.categories.firstInstanceAppLoad,
      isFetching: state.layouts.isFetching,
      list: state.categories.list,
      networkPickerData: state.categories.networkPickerData,
      currentlySelectedNetworkGuid:
        state.categories.currentlySelectedNetworkGuid,
      isConnected: state.netInfo.isConnected,
      productAutocompleteVisible: state.modals.productAutocompleteVisible,
      locationAutocompleteVisible: state.modals.locationAutocompleteVisible,
      latestQueriedNetwork: state.categories.latestQueriedNetwork,

      latestProductAutocompleteSearchTerm:
        state.modals.latestProductAutocompleteSearchTerm,
      latestProductAutocompleteSearchResults:
        state.modals.latestProductAutocompleteSearchResults,
      //latest set location text
      latestPickerDestinationText: state.location.latestPickerDestinationText,
      latestPickerTextInputBackingField:
        state.location.latestPickerTextInputBackingField,
      manualAddressPrefixInput: state.location.manualAddressPrefixInput,
      //this is fo compariosn for network display modal
      modalsArray: state.modals.modalsArray,
    };
  };
  return mapStateToProps;
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {dispatch} = dispatchProps;
  const {actions: LayoutActions} = require('@redux/LayoutRedux');
  const {actions: CategoryActions} = require('@redux/CategoryRedux');
  const modalActions = require('@redux/ModalsRedux');
  const locationActions = require('@redux/LocationRedux');
  return {
    ...ownProps,
    ...stateProps,
    //closes/opens the main whitebox autocomplete
    resetLayouts: async () => {
      //need to call this to clean up the layout!!!
      console.debug('resetting layouts');
      //LayoutActions.fetchAllProductsLayout(dispatch);
      return CategoryActions.resetCategories(dispatch); //cleans out cats
    },
    changeNetwork: async (
      passedNetworkId,
      showAgeRestrictionMessage = true,
      shouldResetStacksOnly = false,
    ) => {
      console.debug('Changing network');
      EventRegister.emit('showSpinner');
      if (shouldResetStacksOnly) {
        //StackHelper.
        //call a differnt method that doesn't 'go' - just call the stack helper directly
      } else {
        EventRegister.emit('resetStacksAndGo');
      }

      //CategoryActions.fetchCategories(dispatch, networkId);
      CategoryActions.resetCategories(dispatch)
        .then(() => {
          CategoryActions.fetchCategories(
            dispatch,
            passedNetworkId,
            showAgeRestrictionMessage,
          ).then(() => {
            let hereWeAre = '';
            EventRegister.emit('hideSpinner');
          });
        })
        .catch(err => {
          alert('there was an error resetting the categories');
          EventRegister.emit('hideSpinner');
        }); //cleans out cats
    },
    updateLatestNetworkForInfoQuery: network => {
      try {
        dispatch(CategoryActions.updateLatestQueriedNetwork(dispatch, network));
      } catch (error) {
        toast("Can't update latest network to redux");
        console.debug(error);
      }
    },
    fetchNetworkPickerData: async () => {
      console.debug('getting picker data');
      return CategoryActions.fetchNetworkPickerData(dispatch);
    },
    setSelectedCategory: category =>
      dispatch(CategoryActions.setSelectedCategory(category)),

    fetchProductsByCollections: (categoryId, tagId, page = 1, index) => {
      LayoutActions.fetchProductsLayoutTagId(
        dispatch,
        categoryId,
        tagId,
        page,
        index,
      );
    },
    fetchAllProductsLayout: () => {
      LayoutActions.fetchAllProductsLayout(dispatch);
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
    updateFirstInstanceLoad: newBool => {
      console.debug('getting picker data');
      return CategoryActions.updateFirstInstanceLoad(dispatch, newBool);
    },
    pushCurrentPickerLocationAsOrderDestination: async (
      pickedLatLng,
      latestPickerDestinationText,
      fullGeoResult,
    ) => {
      dispatch(
        locationActions.actions.setOrderDestination(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText,
          fullGeoResult,
        ),
      );
    },
    resetCurrentPickedOrderDestination: () => {
      dispatch(locationActions.actions.resetOrderDestination(dispatch));
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
  };
};

export default withNavigation(
  withTheme(
    connect(makeMapStateToProps, null, mergeProps, {forwardRef: true})(
      HorizonList,
    ),
  ),
);
