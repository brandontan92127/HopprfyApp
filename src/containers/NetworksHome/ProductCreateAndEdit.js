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
  TextInput,
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
import { ButtonIndex } from "@components";
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
import CheckBox from '@react-native-community/checkbox';
import RNPickerSelect from "react-native-picker-select";

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
import { Config, Theme } from "@common";
import { Button as ElButton, Header, Icon } from "react-native-elements";
import Modal from "react-native-modalbox";
import BlinkView from "react-native-blink-view";
import Picker from "react-native-image-crop-picker";
import t from "tcomb-form-native";
import { ColorPicker, TriangleColorPicker } from "react-native-color-picker";
import { EventRegister } from "react-native-event-listeners";

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
    fontFamily: Constants.fontFamily
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

const itemsFOrPicker = [
  { label:"cl", value: "cl"},
  { label:"ml", value: "ml"},
  { label:"kg", value: "kg"}, 
  { label:"g", value: "g"}, 
  { label:"unit", value: "unit"}, 
  { label:"pack", value: "pack"}, 
]

class ProductCreateAndEdit extends Component {
  constructor(props) {
    console.debug("In product create and edit");
    super(props);

    this.state = {

      productImage: undefined,
      productImageSrc: Config.IconImage1PlaceholderBaseUrl,

      id: undefined,
      accountId: undefined,
      classId: undefined,
      name: "",
      description: "",
      price: "",
      sizeUnit: "cl",
      sizeMeasurement: "",
      isGlobal: false,
      sku: "",
    };

    this.options = {};
  }

  resetFormState = () => {
    this.setState({ 
      productImage: undefined,
      productImageSrc: Config.IconImage1PlaceholderBaseUrl,

      id: undefined,
      accountId: undefined,
      classId: undefined,
      name: "",
      description: "",
      price: "",
      sizeUnit: "cl",
      sizeMeasurement: "",
      isGlobal: false,
      sku: "",
    })
  }

  selectProductImageGallery() {
    Picker.openPicker({
      //   width: 400,
      //   height: 400,
      //   cropping: true,
      includeBase64: true,
    }).then((image) => {
      console.debug("image was picked");
      this.setState({ productImage: image, productImageSrc: image.path });
    });
  }

  _createNewProduct = async () => {
    console.debug("trying to create new product");
    const { name, description ,sizeMeasurement, sizeUnit, price, sku, accountId, classId, isGlobal, id} = this.state;

    try {
      EventRegister.emit("showSpinner");

      let combinedPayload = {
        accountId,
        productClassId: classId,
        name,
        price,
        sizeMeasurement,
        sizeUnit,
        barcode: "",
        description,
        sku,
      };


      if (typeof this.state.productImage !== "undefined") {
        combinedPayload.imageRequest = {};
        combinedPayload.imageRequest.logoImageMimeData = this.state.productImage.data;
        combinedPayload.imageRequest.logoImageMimeType = this.state.productImage.mime;
        combinedPayload.imageRequest.height = this.state.productImage.height;
        combinedPayload.imageRequest.width = this.state.productImage.width;
        combinedPayload.imageRequest.filename = "product";

        console.debug("Trying to create product");
        try {
          if(id === undefined)
            await HopprWorker.createProduct(combinedPayload);
          else
            await HopprWorker.editProduct({...combinedPayload, id: id});
          toast("should create new class!!!");
          showMessage({
            style:{    
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20
            },            
            position: "top",
            message: "Product Created!",
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
          toast("Couldn't create new product! Please try again later" + error);
        }
      } else {
        alert("You haven't attached an image! Please make sure you do so.");
      }

    } catch (error) {
      alert("Sorry that didn\'t work");
    }
    finally {
      EventRegister.emit("hideSpinner");
    }

  };

  componentDidMount = async () => {    
    Picker.clean();
    this.setState({ accountId: this.props.user.user.id });
    const product = this.props.navigation.getParam('item');
    if(product) {
      console.log("+++++++",product);
      this.setState({ 
        id: product._id, 
        name: product.name, 
        sizeMeasurement: product.size.split(' ')[0], 
        sizeUnit: product.size.split(' ')[1], 
        price: product.basePrice.toString(), 
        productImageSrc: product.image, 
        description: product.description,
        sku: product.sku,
        classId: product.classId,
      });
    } else {
      const classId = this.props.navigation.getParam('classId');
      if(classId) {
        this.setState({ classId: classId });
      }
    }
  };

  render = () => {

    const { id, name, description, price, sizeMeasurement, sizeUnit, sku, classId, accountId, isGlobal } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Text style={{ color: "grey", textAlign: "center" }}>
          {"Product - Create And Edit"}
        </Text>

        <ScrollView style={{ padding: 16, paddingBottom: 40, flex: 1 }}>
          {/* SELECT IMAGE */}
          <TouchableOpacity onPress={() => this.selectProductImageGallery()}>
            <View
              style={{
                padding: 5,
                height: 180,
              }}
            >
              <Text style={{ color: "#1A2C47", marginTop: 10, fontSize: 15 }}>
                {"Pick your product image:"}
              </Text>
              <Image
                style={{
                  height: 180,
                  width: undefined,
                  flex: 1,
                }}
                resizeMode="contain"
                source={{
                  uri: this.state.productImageSrc,
                }}
              />
            </View>
            {
              /*
            <Form
              ref="productCreationForm"
              type={this.productStruct}
              placeholderTextColor={"silver"}
              options={this.productOptions}
              value={this.state.formValue}
              onChange={this.onProductFormChange}
            />
              */
            }
            {/* Name */}       
          </TouchableOpacity>
  
          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Product Name"}
            onChangeText={(val)=>this.setState({name: val})}             
            returnKeyType="next"
            value={name}
          />

          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            multiline
            placeholder={"Description"}
            onChangeText={(val)=>this.setState({description: val})}             
            returnKeyType="next"
            value={description}
          />

          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            multiline
            placeholder={"Price"}
            onChangeText={(val)=>this.setState({price: val})}             
            returnKeyType="next"
            value={price}
          />


          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"Size"}
            onChangeText={(val)=>this.setState({sizeMeasurement: val})}             
            returnKeyType="next"
            keyboardType="numeric"
            value={sizeMeasurement}
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
              this.setState({sizeUnit: itemValue})                
            }
            value={sizeUnit}
            items={itemsFOrPicker}
          />

          <TextInput
            {...commonInputProps}
            style={styles.textinput}
            placeholderTextColor={'#CCD0D6'}
            autoCorrect={false}
            placeholder={"SKU"}
            onChangeText={(val)=>this.setState({sku: val})}             
            returnKeyType="next"
            value={sku}
          />
          {/* CREATE BUTTON */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              alignItems: 'center',
              marginBottom: 40
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CheckBox
                value={isGlobal}
                onValueChange={(val)=>this.setState({isGlobal: val})}
                style={styles.checkbox}
                tintColors={ "#f00", "#0f0" }
              />
              <Text style={styles.label}>{"Global Product"}</Text>
            </View>
          <ButtonIndex
            textColor={"white"}
            text={id===undefined? "Add" : "SAVE"}
            containerStyle={styles.btn}
            onPress={()=>this._createNewProduct()}
          />  
            {/*
            <TouchableOpacity onPress={() => this._createNewProduct()}>
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
            */}
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

export default connect(mapStateToProps, null)(withTheme(ProductCreateAndEdit));
