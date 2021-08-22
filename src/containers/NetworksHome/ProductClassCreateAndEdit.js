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
  TextInput
} from "react-native";
import { connect } from "react-redux";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  Theme,
  GlobalStyle
} from "@common";
import { Timer, toast, BlockTimer } from "@app/Omni";
import LogoSpinner from "@components/LogoSpinner";
import Empty from "@components/Empty";
import { ButtonIndex } from "@components";
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
import { Button as ElButton, Header, Icon } from "react-native-elements";
import Modal from "react-native-modalbox";
import BlinkView from "react-native-blink-view";
import Picker from "react-native-image-crop-picker";
import t from "tcomb-form-native";
import { ColorPicker, TriangleColorPicker } from "react-native-color-picker";
import { EventRegister } from "react-native-event-listeners";
import RNPickerSelect from "react-native-picker-select";

const { width, height } = Dimensions.get("window");


const isDark = Config.Theme.isDark
const styles = StyleSheet.create({
  textinput: {
    borderBottomColor: '#E6E8EB',
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
    marginVertical: '4%',    
    color: '#1A2C47',
    fontSize: 18,
    fontFamily: Constants.fontFamily,
    marginHorizontal: 10
  },
  input: {
    color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
    borderColor: "#9B9B9B",
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 8,
    flex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  btn: {
    height: 40,
    width: 160,
    borderRadius: 20,
    backgroundColor: "#2A467E",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    margin: 8,
    color: '#1A2C47'
  },
})

const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: "transparent",
  placeholderTextColor: isDark
    ? Theme.dark.colors.text
    : Theme.light.colors.text,
};

const ShoppingViewLayoutType = [
  { label:"Three Column", value: 6},
  { label:"Two Column", value: 2},
  { label:"Banner Large", value: 9}, 
  { label:"Simple", value: 3}, 
  { label:"Banner High", value: 12}, 
]

class ProductClassCreateAndEdit extends Component {
  constructor(props) {
    console.debug("In product class create and edit");
    super(props);

    this.state = {
      networkId: undefined,
      pickedColor1: "#F39627",
      pickedColor2: "#D827F3",
      productClassImage: undefined,
      productClassImageSrc: Config.IconImage1PlaceholderBaseUrl,

      roundedIconImage: undefined,
      roundedIconImageSrc: Config.IconImage3PlaceholderBaseUrl,

      id: undefined,
      name: "",
      order: "",
      iconOrder: "",
      iconName: "",
      layout: 6
    };
  }

  componentDidMount() {
    Picker.clean();
    const item = this.props.navigation.getParam('item');
    if(item) {
      this.setState({
        id: item._id,
        name: item.name,
        order: item.order,
        iconOrder: item.iconOrder,
        iconName: item.iconName,
        layout: item.layout,
      })
      if(item.image) {
        this.setState({ productClassImageSrc: item.image});
      }
      if(item.roundedIconImageSrc) {
        this.setState({ roundedIconImageSrc: item.roundedIconImageSrc});
      }
    }
  }
  _createNewProductClass = async () => {
    const { id, name, order, iconOrder, iconName, layout } = this.state;
    console.debug("trying to create new class");
    EventRegister.emit("showSpinner");
    //validate img

    let combinedPayload = {
      id,
      name,
      order,
      iconOrder,
      iconName,
      layout
    }
    //now attach images and colors if they have been set
    combinedPayload.networkId = this.state.networkId;
    combinedPayload.htmlColor1 = this.state.pickedColor1;
    combinedPayload.htmlColor2 = this.state.pickedColor2;
    combinedPayload.altIconName = name;
    combinedPayload.layout = layout;

    //images
    if (
      typeof this.state.productClassImage !== "undefined" &&
      typeof this.state.roundedIconImage !== "undefined"
    ) {
      //ok, finish setting up creation query and add
      //image
      combinedPayload.classimageRequest = {};
      combinedPayload.classimageRequest.logoImageMimeData = this.state.productClassImage.data;
      combinedPayload.classimageRequest.logoImageMimeType = this.state.productClassImage.mime;
      combinedPayload.classimageRequest.height = this.state.productClassImage.height;
      combinedPayload.classimageRequest.width = this.state.productClassImage.width;
      combinedPayload.classimageRequest.filename = "productClass";
      //icon
      combinedPayload.iconImageRequest = {};
      combinedPayload.iconImageRequest.logoImageMimeData = this.state.roundedIconImage.data;
      combinedPayload.iconImageRequest.logoImageMimeType = this.state.roundedIconImage.mime;
      combinedPayload.iconImageRequest.height = this.state.roundedIconImage.height;
      combinedPayload.iconImageRequest.width = this.state.roundedIconImage.width;
      combinedPayload.iconImageRequest.filename = "";

      //now we're setup - make the call
      console.debug("Trying to create prod class");
      try {
        let prCreateResult = await HopprWorker.createProductClass(
          combinedPayload
        );
        toast(prCreateResult.name + " was created!");
        showMessage({
          borderRadius: 8,
          style:{    
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          },            
          position: "top",
          message: "Category Created!",
          description:
            "Why not add a couple more?",
          type: "success",
          autoHide: true,
          duration: 5000,
          backgroundColor: "hotpink", // background color
          hideOnPress: true,
        });
        this.resetFormState();
      } catch (error) {
        toast(
          "Couldn't create new product class! Please try again later" + error
        );
      }
      finally{
        EventRegister.emit("hideSpinner");
      }
      toast("should create new class!!!");
    } else {
      alert("You haven't attached both images! Please make sure you do so.");
    }
  };


  /**Sets fields back to default after create */
  resetFormState = () => {
    this.setState({
      networkId: undefined,
      pickedColor1: "#F39627",
      pickedColor2: "#D827F3",
      productClassImage: undefined,
      productClassImageSrc: Config.IconImage1PlaceholderBaseUrl,

      roundedIconImage: undefined,
      roundedIconImageSrc: Config.IconImage3PlaceholderBaseUrl,

      id: undefined,
      name: "",
      order: "",
      iconOrder: "",
      iconName: "",
      layout: 6
    });
  };

  selectProductClassImageGallery() {
    Picker.openPicker({
      //   width: 400,
      //   height: 400,
      //   cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({
        productClassImage: image,
        productClassImageSrc: image.path,
      });
      console.debug("productClassImage was picked");
    });
  }

  selectProductClassIconImageGallery() {
    Picker.openPicker({
      //   width: 128,
      //   height: 128,
      //   cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({
        roundedIconImage: image,
        roundedIconImageSrc: image.path,
      });
      console.debug("icon image was picked");
    });
  }

  updatePickedColor1(color) {
    this.setState({ pickedColor1: color });
  }

  updatePickedColor2(color) {
    this.setState({ pickedColor2: color });
  }

  render = () => {
    const { id, name, order, iconOrder, iconName, layout } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView style={{ padding: 5, paddingBottom: 40, flex: 1 }}>
        <Text style={{ color: "grey", textAlign: "center" }}>
          {"Product Class - Create And Edit"}
        </Text>
        {/* PICKER 1 */}
        <View style={{ flexDirection: 'row', paddingTop: 10}}>
          <View
            style={{
              height: 180,
              padding: 10,
              backgroundColor: "white",
              flex: 0.5
            }}
          >
            <Text style={{ color: "#33435C", fontSize: 14, fontWeight: "bold", lineHeight: 18 }}>
              {"Pick a first color to suit your icon (click center): " +
                this.state.pickedColor1}
            </Text>
            <ColorPicker
              defaultColor={this.state.pickedColor1}
              onColorSelected={(color) => this.updatePickedColor1(color)}
              style={{ flex: 1, marginTop: 15 }}
              hideSliders
            />
          </View>

          {/* PICKER 2 */}
          <View
            style={{
              height: 180,
              padding: 10,
              backgroundColor: "white",
              flex: 0.5
            }}
          >
            <Text style={{ color: "#33435C", fontSize: 14, fontWeight: "bold", lineHeight: 18 }}>
              {"Pick a second color to suit your icon (click center): " +
                this.state.pickedColor2}
            </Text>
            <ColorPicker
              defaultColor={this.state.pickedColor2}
              onColorSelected={(color) => this.updatePickedColor2(color)}
              style={{ flex: 1, marginTop: 15 }}
              hideSliders
            />
          </View> 
        </View>       
          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Name"}
            onChangeText={(val)=>this.setState({name: val})}             
            returnKeyType="next"
            keyboardType="numeric"
            value={name}
          />        
          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Order (optional)"}
            onChangeText={(val)=>this.setState({order: val})}             
            returnKeyType="next"
            keyboardType="numeric"
            value={order}
          />        
          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Icon order (optional)"}
            onChangeText={(val)=>this.setState({iconOrder: val})}             
            returnKeyType="next"
            value={iconOrder}
          />        
          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Icon alternative name (optional)"}
            onChangeText={(val)=>this.setState({iconName: val})}             
            returnKeyType="next"
            value={iconName}
          />
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            style={{
              flex: 1,
              borderWidth: 0,
              color: GlobalStyle.cartPickerText.color,
              height: 20,
              alignItems: "center",
              inputIOS: {
                fontSize: 18,
                padding:4,
                marginVertical: '4%',
                fontFamily:Constants.fontFamily,
                overflow:"hidden",
                color: GlobalStyle.cartPickerText.color,
                marginHorizontal: 10,
              },
              inputAndroid: {
                fontSize: 18,
                fontFamily:Constants.fontFamily,
                padding:4,
                marginVertical: '4%',
                overflow:"hidden",
                color: GlobalStyle.cartPickerText.color,
                borderColor: 'white',
                borderBottomColor: '#E6E8EB',
                borderWidth: 1,
                marginHorizontal: 10,

              },
            }}
            inputStyle={{
              textAlign: "center",
              fontFamily:Constants.fontFamily,
              color: GlobalStyle.cartPickerText.color,
              padding:4,
              overflow:"hidden",   
            }}
            onValueChange={async (itemValue, itemIndex) =>
              this.setState({layout: itemValue})                
            }
            value={layout}
            items={ShoppingViewLayoutType}
          />
          {/* SELECT IMAGE */}
          <TouchableOpacity
            onPress={() => this.selectProductClassImageGallery()}
          >
            <View
              style={{
                padding: 5,
                height: 180,
              }}
            >
              <Text style={{ color: "#33435C" }}>
                {"Pick your category image:"}
              </Text>
              <Image
                style={{
                  height: 180,
                  width: undefined,
                  flex: 1,
                }}
                resizeMode="contain"
                source={{
                  uri: this.state.productClassImageSrc,
                }}
              />
            </View>
          </TouchableOpacity>
          {/* SELECT ICON IMAGE */}
          <TouchableOpacity
            onPress={() => this.selectProductClassIconImageGallery()}
          >
            <View
              style={{
                padding: 5,
                height: 180,
              }}
            >
              <Text style={{ color: "#33435C" }}>{"Attach your icon:"}</Text>
              <Image
                style={{
                  height: 180,
                  width: undefined,
                  flex: 1,
                }}
                resizeMode="contain"
                source={{
                  uri: this.state.roundedIconImageSrc,
                }}
              />
            </View>
          </TouchableOpacity>

          {/* CREATE BUTTON */}
          
          <View
            style={{
              flex: 1,
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 20,
              marginBottom: 40
            }}
          >
            <ButtonIndex
              textColor={"white"}
              text={id===undefined? "Add" : "SAVE"}
              containerStyle={styles.btn}
              onPress={()=>this._createNewProductClass()}
            />
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

export default connect(
  mapStateToProps,
  null
)(withTheme(ProductClassCreateAndEdit));
