import React, { Component } from "react";
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
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import { Color, Languages, Styles, Constants, withTheme } from "@common";
import { Timer, toast, BlockTimer } from "@app/Omni";
import LogoSpinner from "@components/LogoSpinner";
import Empty from "@components/Empty";
import MapView, { PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import { Marker, MarkerAnimated, UrlTile } from "react-native-maps";
import GeoWorker from "../../services/GeoWorker";
import MapWorker from "../../services/MapWorker";
import HopprWorker from "../../services/HopprWorker";
import { Images } from "@common";
import Permissions from "react-native-permissions";
import {
  Button,
  AdMob,
  ModalBox,
  WebView,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating,
} from "@components";
import MapViewDirections from "react-native-maps-directions";
import { Config } from "@common";
import { Button as ElButton, Header, Icon } from "react-native-elements";
import Modal from "react-native-modalbox";
import BlinkView from "react-native-blink-view";
import Picker from "react-native-image-crop-picker";
import t from "tcomb-form-native";
import { ColorPicker, TriangleColorPicker } from "react-native-color-picker";
import { EventRegister } from "react-native-event-listeners";
import { showMessage, hideMessage } from "react-native-flash-message";
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  storeFrontimageStyle: {
    height: 160,
    minHeight: 160,
    flex: 1,
    width: null,
  },
});



const defaultState = {
  networkLogoSrc: Config.YourBrandHere,
  networkLogo: undefined,
  pickedColor: "#006600",
  networksRegions: [],
  filteredNetworkRegion: {
    Id: 0,
    RegionName: "None",
  },
  filteredNetworkSubRegions: [],
}

class ShopifyCreateIntegration extends Component {
  constructor(props) {
    console.debug("In register network");
    super(props);

    this.state = defaultState;

    var Visibility = t.enums({
      PRIVATE: "Private",
      PUBLIC: "Public",
    });

    var FleetType = t.enums({
      BICYCLE: "BICYCLE",
      MOPED_AND_BIKE: "MOPED AND BIKE",
      CAR: "CAR",
      VAN: "VAN",
    });

    var Currency = t.enums({
      GBP: "GBP (U.K. Pounds)",
      USD: "U.S. Dollars",
      EUR: "Euros (E.U.)",
    });

    var Region = t.enums({
      UK: "UK",
    });

    var SubRegion = t.enums({
      LONDON: "LONDON",
    });

    this.networkFormDefaultValues = {
      networkDescription: "Quality premier sporting goods. Boxing specialists.  ",
      apikey:"40131b02630b2ef9f3c5b253d112db03",
      password: "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",
      shopifyBaseUrl: "greenfield-sports.myshopify.com",
      imageUrl : "https://booza.store:44300/Images/NetworkLogos/greenfield2.png"
    };

    this.networkStruct = t.struct({      
      networkDescription: t.String, // a required string
      apikey: t.String,
      password: t.String,
      shopifyBaseUrl: t.String,
      imageUrl : t.String     
    });

    this.networkSettingStruct = t.struct({
      CssMainScreenBarColor: t.String,
    });
    //END NETWORK
  }
  _filterNetworkRegionsAndSubRegion(regionId) {
    let regionYouChose = this.state.networksRegions.find(
      (x) => x.id == regionId
    );
    this.setState({
      filteredNetworkRegion: regionYouChose,
      filteredNetworkSubRegions: regionYouChose.NetworkSubRegions,
    });
  }

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = (user) => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        return true;
      }
    }

    const { navigation } = this.props;
    this.props.navigation.navigate("LoginScreen");

    alert(
      "You are not in the correct role, or not logged in. Please log in and then create your networks!!"
    );

    return false;
  };

  load = async () => {
    if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)) {
      Picker.clean();
    }

    //not enabled yet = uses static values for now
    // let networksRegions = await HopprWorker.getNetworkRegions();
    // this.state({ networksRegions: networksRegions });
  };

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();     
    } catch (error) {
      
    }    
  }

  componentDidMount = async () => {
    console.debug("in register network");    
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    await this.load();
  };

  _shopNow = async (network)=>{
    EventRegister.emit("showSpinner");    
    this.props.addNetworkToLocalPickerIfNotExists(network);
    //changes network picker ('real network')    
    await this.props.changeNetwork(network.networkId);    
    EventRegister.emit("hideSpinner");
    this.props.navigation.navigate("Home")
  }

  selectProfileImage() {
    Picker.openCamera({
      // width: 400,
      // height: 300,
      // cropping: true,
      includeBase64: true,
    }).then((image) => {
      console.debug(image);
    });
  }

  selectProfileImageGallery() {
    Picker.openPicker({
      // width: 400,
      // height: 400,
      // cropping: true,
      includeBase64: true,
    }).then((image) => {
      console.debug("image was picked");
      this.setState({ networkLogo: image, networkLogoSrc: image.path });
      this.refs.yourBrandImg.source = { uri: this.state.networkLogoSrc };
      console.debug(image);
    });
  }

  updatePickedColor(color) {
    this.setState({ pickedColor: color });
  }
  /**Attempts to create network on server, returns results */
  _createNewShopifyNetwork = async () => {
    console.debug("trying to create new network");
    try {
      EventRegister.emit("showSpinner");
      //validate img
      let networkFormData = this.refs.networkCreationForm.getValue();
      if (networkFormData) {
        let cssColor = this.state.pickedColor;
        // let selectedImage = this.state.networkLogo.data; //mime image
        // let seletectedImageFileType = this.state.networkLogo.mime;
        // let selectedImgHeight = this.state.networkLogo.height;
        // let selectedImgWidth = this.state.networkLogo.width;

        // let imageCreationRequest = {
        //   logoImageMimeData: selectedImage,
        //   logoImageMimeType: seletectedImageFileType,
        //   height: selectedImgHeight,
        //   width: selectedImgWidth,
        //   filename: "",
        // };

        // let networkCreationPayload = {
        //   networkDto: networkFormData,
        //   imageCreationRequest: imageCreationRequest,
        //   networkCssColor: cssColor,
        //   networkRegion: "UK",
        //   networkSubRegion: "LONDON",
        // };

        let shopifyPayload = {
          "apikey": networkFormData.apikey,
          "password": networkFormData.password,
          "shopifyBaseUrl": networkFormData.shopifyBaseUrl,
          "imageUrl": networkFormData.imageUrl,
          "networkDescription": networkFormData.networkDescription,
          "networkPrimaryColor": cssColor
        }   
        //validation fails, value will be null
        //post to server and try and create new net w/settings
        let networkResult = await HopprWorker.createShopifyToHoppr(
          shopifyPayload
        );


        showMessage({
          style:{    
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          },            
          position: "top",
          message: "Your network is being created...",
          description:
            "The magic is real. It's a 'kind' of magic...",
          type: "success",
          autoHide: true,
          duration: 5000,
          backgroundColor: cssColor, // background color
          hideOnPress: true,
        });

        if (networkResult.status == 201 || networkResult.status == 200) {
          //JUST TAKE THEM STRAIGHT THERE!!! Naviagtion pprops
          //created
          showMessage({
            borderRadius: 8,
            position: "center",
            message: "Boom! Network Created!",
            description:
              "Let's show you what we did...",
            type: "success",
            autoHide: true,
            duration: 5000,
            backgroundColor: "hotpink", // background color
            hideOnPress: true,
          });
          //clear state 
          this.setState(defaultState);
          //redirect to network Home List
         await this._shopNow(networkResult.data);           

        } else if (networkResult.status == 400) {
          //didn't work - save, or... fail??
          alert(
            "Network creation failed with BadRequest" + networkResult.message
          );
        } else {
          //failed completely
          alert("Failed with:" + networkResult.status + " error code, msg: " + networkResult.message);
        }
      }
    } catch (error) {
      alert("Failed");
    }
    finally {
      EventRegister.emit("hideSpinner");
    }
  };

  onFormChange = (value) => {
    //check if the value / feidld is region then filter if so
  };

  render = () => {
    var Form = t.form.Form;
    var options = {
      fields: {
        Name: {
          placeholder: "e.g. The Pork Chop Express",
          placeholderTextColor: "silver",
        },
        StoreName: {
          placeholder: "e.g. FirstNet",
          placeholderTextColor: "silver",
        },
        Description: {
          placeholder: "e.g. We sell wholefoods and vegan treats",
          placeholderTextColor: "silver",
        },
        NetworkCommissionBaseRate: {
          placeholder: "e.g. 0.1",
          placeholderTextColor: "silver",
        },
        BaseCurrency: {
          nullOption: false,
        },
        FleetType: {
          nullOption: false,
        },
        Visibility: {
          nullOption: false,
        },
      },
    }; // optional rendering options (see documentation)
    return (
      <View
        style={{
          flexGrow: 1,
          backgroundColor: Color.background,
        }}
      >
        <Header
          backgroundColor={"#F58F51"}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: "Shopify Integration",
            style: { color: "#fff" },
          }}
          rightComponent={{
            icon: "help",
            color: "#fff",
            onPress: () =>
              showMessage({
                message: "Register your network here",
                description:
                  "Create a new brand network and start selling products on it. The Shopify integration will do all the work!",
                type: "success",
                autoHide: false,
                backgroundColor: "#ED8C48", // background color
                hideOnPress: true,
              }),
          }}
        />
        

      


        {/* <TouchableOpacity onPress={() => this.selectProfileImageGallery()}>
          <View
            style={{
              padding: 5,
              height: 180,
            }}
          >
            <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
              {"Pick your network logo:"}
            </Text>
            <Image
              ref="yourBrandImg"
              style={{
                height: 180,
                width: undefined,
                flex: 1,
              }}
              resizeMode="contain"
              source={{ uri: this.state.networkLogoSrc }}
            />
          </View>
        </TouchableOpacity> */}

        <ScrollView style={{ padding: 5, paddingBottom: 40, flex: 1 }}>
        <Image
              ref="yourBrandImg"
              style={{ 
                minHeight:120, 
                width: width,              
                flex: 1,
              }}
              resizeMode="contain"
              source={{ uri: "https://help.shopify.com/assets/partners/logo/shopify-partner.jpg" }}
            />
          <View
            style={{
              height: 240,
              padding: 15,
              padding: 20,
              backgroundColor: "white",
            }}
          >
            <Text style={{ color: "black", fontSize: 14, fontWeight: "bold" }}>
              {"Pick a color to suit your network (click center): " +
                this.state.pickedColor}
            </Text>

            <ColorPicker
              defaultColor={this.state.pickedColor}
              onColorSelected={(color) => this.updatePickedColor(color)}
              style={{ flex: 1 }}
            />
          </View>
          <Form
            ref="networkCreationForm"
            type={this.networkStruct}
            placeholderTextColor={"silver"}
            options={options}
            value={this.networkFormDefaultValues}
            onChange={this.onFormChange}
          />

          {/* CREATE BUTTON */}
          <View
            style={{
              flex: 1,
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={async () => await this._createNewShopifyNetwork()}>
              <View
                style={{
                  flex: 1,
                  alignContent: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  style={{
                    maxHeight: 80,
                    height: 80,
                    width: 80,
                    maxWidth: 80,
                  }}
                  source={Images.CreateNew1}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginBottom: 10,
                    textAlign: "center",
                    color: "silver",
                  }}
                >
                  {"Create"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  // const modalActions = require("@redux/ModalsRedux");
  // const locationActions = require("@redux/LocationRedux");  
  const networkActions = require("@redux/CategoryRedux"); //saves latest picked network  
  return{
    addNetworkToLocalPickerIfNotExists:(newNet)=>{ //this is not async!
      console.debug("getting picker data");
      networkActions.actions.addNetworkToLocalPickerIfNotExists(dispatch, newNet);
    },
    changeNetwork: async (passedNetworkId) => {
      try {
        EventRegister.emit("showSpinner");
        console.debug("Chnaging netowrk");
        EventRegister.emit("resetStacksAndGo");
        await networkActions.actions.resetCategories(dispatch); //cleans out cats
        return networkActions.actions.fetchCategories(dispatch, passedNetworkId);
        EventRegister.emit("hideSpinner");
      } catch (error) {
        console.debug("Couldn't change network");
        EventRegister.emit("hideSpinner");
      }
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null)(withTheme(ShopifyCreateIntegration));
