import Modal from "react-native-modalbox";
import React, { Component } from "react";
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

export default class WasOrderCompletedModal extends React.PureComponent {
  render() {
    console.debug("in order completed modal");
    const {
      headerText,
      openClosed,
      customerConfirmsDeliverySuccessful,
      customerSaysDeliveryFailed,
      closeMe,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.customerConfirmsDeliverySuccessful = customerConfirmsDeliverySuccessful;
    this.customerSaysDeliveryFailed = customerSaysDeliveryFailed;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          width: width - 14,
        }}
        backdrop={true}
        position={"center"}
        ref={"wasOrderCompletedModal"}
        isOpen={this.props.openClosed}
        backdropPressToClose={false}
        swipeToClose={false}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          centerComponent={{
            text: "Order complete?",
            style: { 
              fontSize:14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily:Constants.fontHeader,          
            },
          }}
        />
        <View>
          <ScrollView>
            <Text
              style={{
                fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 22,
                textAlign: "center",
              }}
            >
              {"The driver has indicated\nthe order was completed!"}
            </Text>

            <View
              style={{
                border: 1,
                borderColor: "orange",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity onPress={() => toast("Show photo")}>
                <Image
                  style={{
                    flex: 1,
                    borderRadius: 5,
                    maxHeight: 40,
                    height: 40,
                    width: undefined,
                  }}
                  ref={"deliveryConfirmImage"}
                  source={Images.NewAppReskinGraphics.Camera}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontFamily:Constants.fontFamily,
                    color: GlobalStyle.modalTextBlackish.color,
                    margin: 5,
                    fontSize: 9,
                    textAlign: "center",
                  }}
                >
                  {"View Delivery Photo"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {"Please confirm he is not telling porkies..."}
            </Text>

            <View style={{ margin: 10 }}>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 140,
                  height: 140,
                  width: undefined,
                }}
                source={Images.thumbsUp}
                resizeMode="contain"
              />
            </View>
            {/* <Text
              style={{
                color: "black",
                margin: 5,
                fontSize: 12
              }}
            >
              {"Note"}
            </Text> */}

            <View style={{ margin: 10,
             borderRadius: 30,                
             backgroundColor:"white",
             marginLeft: 18,
             marginRight: 18,
             height:50,
             minHeight:50,
             marginBottom:14,            
             //borderColor: "lightblue",
             borderWidth: 0,
             overflow: "hidden",
             justifyContent:"center",
             alignContent:"center"
            }}>
              <TextInput
                style={{
                  flex: 1,     
                  fontStyle:"italic",
                  fontFamily:Constants.fontFamily,
                  borderWidth: 0,    
                  height:50,              
                  borderRadius: 30,                
                  color: GlobalStyle.modalTextBlackish.color,
                }}
                placeholderTextColor={GlobalStyle.modalTextBlackish.color}
                placeholder={
                  "  Tell us your experience if you like...no pressure!"
                }
              />
            </View>
            <ElButton
              buttonStyle={{ fontFamily:Constants.fontFamily, padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}
              icon={{ name: "check" }}
              title="Yes, delivered!!"
              onPress={async () => {
                try {
                  console.debug("ok");
                  await this.customerConfirmsDeliverySuccessful();
                } catch (error) {
                  alert(
                    "We couldn't complete that order: " + JSON.stringify(error)
                  );
                }
              }}
            />
            <ElButton
              buttonStyle={{  fontFamily:Constants.fontFamily, padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalSecondaryButton.backgroundColor}
              borderRadius={30}
              icon={{ name: "close" }}
              title="No, I want to complain!!"              
              onPress={() => this.customerSaysDeliveryFailed()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
