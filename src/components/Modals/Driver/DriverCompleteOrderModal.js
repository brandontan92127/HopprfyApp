import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Picker as DropdownPicker,
  Dimensions,
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import Picker from "react-native-image-crop-picker";
import FastImage from "react-native-fast-image"
import { EventRegister } from "react-native-event-listeners";
import RNPickerSelect from "react-native-picker-select";
import { NoFlickerImage } from "react-native-no-flicker-image";

const completionReasons = [
  { label: "Delivered Directly to Customer", value: "1" },
  { label: "Delivered To Customer Address", value: "2" },
  { label: "Left Nearby (take photo)", value: "3" },
  { label: "Other", value: "4" },
]

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

const defaultState = {
  selectedCompletionId: 1,
  deliveryConfirmImage: undefined
}

export default class DriverCompleteOrderModal extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    console.debug("driver order complete");
    const {
      headerText,
      openClosed,
      orderCompleted,
      closeMe,
      orderDeliveryDestinationId,
    } = this.props;

    this.openClosed = openClosed;
    this.orderCompleted = orderCompleted;
    this.closeMe = closeMe;
    this.pickerValue = "";
    this.orderDeliveryDestinationId = orderDeliveryDestinationId;

    console.debug("take photo debug");
  }

  selectProfileImage() {
    Picker.openCamera({
      width: 800,
      height: 800,
      resizeMode: "contain",
      includeBase64: true,
      cropping: true,
    }).then((image) => {
      console.debug(image);
      //toast("We got your image:" + image);
      this.setState(
        {
          deliveryConfirmImage: image,
        },
        () => {
          this.refs.deliveryConfirmImage.source = {
            uri: this.state.deliveryConfirmImage.path,
          };
        }
      );
    });
  }

  _renderDeliveryConfirmImage() {
    if (typeof this.state.deliveryConfirmImage !== "undefined") {
      return (
        <View style={{ alignSelf:"center", borderRadius: 8, overflow: "hidden", height:180, width:180 }}>
          <FastImage
            style={{
              flex: 1,
              borderRadius: 14,
              maxHeight: 210,
               maxHeight: 210,
              width: width* 0.9,
            }}
            ref={"deliveryConfirmImage"}
            source={{ uri: this.state.deliveryConfirmImage.path }}            
          />
        </View>
      );
    } else {
      return (
        <Image
          style={{
            flex: 1,
            borderRadius: 8,
            maxHeight: 210,
            maxHeight: 210,
            width: width* 0.9,
          }}
          ref={"deliveryConfirmImage"}
          source={Images.NewAppReskinGraphics.Camera}
          resizeMode="contain"
        />
      );
    }
  }

  orderCompletedLocal = async (pickerValue, orderDeliveryDestinationId) => {
    //upload iimage make sure attached and taken
    //toast("Image uploaded!");
    try {
      EventRegister.emit("showSpinner");
      await this.props.orderCompleted(pickerValue, orderDeliveryDestinationId);
      this._resetStateAfterUserCompletes();
    } catch (error) {
      alert("sorry, that didn't work");
    }
    finally {
      EventRegister.emit("hideSpinner");
    }
  };

  _resetStateAfterUserCompletes = () => {
    this.setState(defaultState);
  }

  _changeCompletionPickerValue = (itemValue) => {
    this.setState({ selectedCompletionId: itemValue });
  };

  render() {
    return (
      <Modal
        style={{
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          width: width - 16,
          borderWidth: 0,
        //sborderColor: "lightblue",
        }}
        backdrop={true}
        position={"center"}
        ref={"driverCompleteOrderModal"}
        isOpen={this.props.openClosed}
        onOpened={
          () => this._changeCompletionPickerValue(1)
        }
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Order Complete?",
            style: { 
            fontSize:14,
            color: "white",
            fontFamily:Constants.fontHeader 
          },
          }}
        />
        <View style={{ flexGrow: 1 }}>
          <ScrollView>
            <Text
              style={{
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily:Constants.fontHeader ,
                margin: 5,
                fontSize: 22,
                textAlign: "center",
              }}
            >
              {"Thanks so much!"}
            </Text>   
            <View
              style={{
                marginTop:4,
                marginBottom:4,        
                borderRadius: 10,
                overflow: "hidden",
                alignSelf:"center",
                alignContent:"center",
                justifyContent:"center",
                alignItems:"center"
              }}
            >
              <TouchableOpacity  onPress={this.selectProfileImage.bind(this)}>
                {this._renderDeliveryConfirmImage()}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily:Constants.fontFamilyMedium ,
                margin: 0,
                paddingBottom:0,
                fontSize: 14,
                paddingLeft: 5,
                paddingRight: 5,
                marginBottom:14,
                textAlign: "center",
              }}
            >
              {"Please attach a delivery photo\nand pick a completion outcome!"}
            </Text>
            <View
              style={{
                borderRadius: 20,                
                backgroundColor:"white",
                marginLeft: 18,
                marginRight: 18,
                height:40,
                minHeight:40,
                marginBottom:14,            
                //borderColor: "lightblue",
                borderWidth: 0,
                overflow: "hidden",
                justifyContent:"center",
                alignContent:"center"
              }}
            >
              <RNPickerSelect
                placeholder={{
                  label: "Select completion state",
                  value: -1,
                }}
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderRadius:20,
                  fontFamily:Constants.fontFamily,
                  borderColor: "orange",
                  height: 80,
                  alignItems: "left",
                  inputIOS: {
                    marginLeft:10,
                    textAlign: "left",
                    color: "silver",
                    fontFamily:Constants.fontFamily,
                  },
                  inputAndroid: {
                    marginLeft:10,
                    textAlign: "left",
                    color: "silver",
                    fontFamily:Constants.fontFamily,
                  },
                }}
                inputStyle={{
                  marginLeft:10,
                  textAlign: "left",
                  color: "silver",
                  height:80,
                  minHeight:80,
                  fontFamily:Constants.fontFamily,
                }}
                onValueChange={(itemValue, index) =>
                  itemValue && this._changeCompletionPickerValue(itemValue)
                }
                value={this.state.selectedCompletionId}
                items={completionReasons}
              />



              {/* <DropdownPicker
                selectedValue={"1"}
                style={{
                  justifyContent: "center",
                  flex: 1,
                  margin: 2,
                  borderWidth: 2,
                  borderRadius: 15,
                  borderColor: "orange",
                  color: "black",
                  maxHeight: 50,
                  height: 50,
                  width: undefined,
                  color: "black",
                }}
                onChangeItem={item => this.setState({
                  country: item.value
                })}
                onValueChange={(itemValue, itemIndex) =>
                  (this.pickerValue = itemValue)
                }
              >
                <DropdownPicker.Item
                  label="Delivered Directly to Customer"
                  value="1"
                />
                <DropdownPicker.Item
                  label="Delivered To Customer Address"
                  value="2"
                />
                <DropdownPicker.Item label="Left Nearby" value="3" />
                <DropdownPicker.Item label="Other" value="4" />
              </DropdownPicker> */}
            </View>
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}
              icon={{ name: "add-circle" }}
              title="I'm done!"
              onPress={async () => {
                await this.orderCompletedLocal(
                  this.state.selectedCompletionId,
                  this.props.orderDeliveryDestinationId
                )
              }
              }
            />
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalSecondaryButton.backgroundColor}
              borderRadius={30}
              icon={{ name: "cancel" }}
              title="Incomplete"
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal >
    );
  }
}
