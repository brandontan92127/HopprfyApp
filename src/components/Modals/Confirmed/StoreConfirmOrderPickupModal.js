//THIS IS SHOWN TO THE CUSTOMER WHEN THE STORE HAS CONFIRMED THE PICKUP

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
    height: 300,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

export default class StoreConfirmOrderPickupModal extends React.PureComponent {
  render() {
    const {
      headerText,
      openClosed,
      goToScreen,
      openMe,
      closeMe,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    this.goToScreen = goToScreen;
    console.debug(
      "THIS IS storeConfirmOrderPickupModal! Tells the driver that the store has confirmed the pickup"
    );

    return (
      <Modal
        style={{
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          width: width - 15,
        }}      
        position={"center"}
        ref={"storeConfirmOrderPickupModal"}        
        isOpen={this.openClosed}
        onClosed={()=>this.closeMe()}
        swipeToClose={true}
        backdropPressToClose={true}
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
            onPress: () => this.closeMe(),
          }}
          centerComponent={{
            text: "Order pickup confirmed" ,
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
                fontSize: 34,
                textAlign: "center",
              }}
            >
              {"The store has confirmed you have picked up the order"}
            </Text>

            <View>
              <Image
                style={{
                  alignSelf:"center",
                  flex: 1,
                  maxHeight: 140,
                  height: 140,
                  width: 140,
                }}
                source={Images.NewAppReskinGraphics.Transaction}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                 margin: 20, textAlign: "center" }}>
              {
                "If you could also confirm the pickup, that would be amazing! Do it from driver controls or below"
              }
            </Text>          
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}
              // icon={{ name: "sync" }}
              title="Take me there"
              onPress={() => {                
                this.props.goToScreen("DriverHomeScreen");
                this.closeMe();
              }}
            />
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalSecondaryButton.backgroundColor}
              borderRadius={30}
              // icon={{ name: "sync" }}
              title="Thanks"
              onPress={() => this.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
