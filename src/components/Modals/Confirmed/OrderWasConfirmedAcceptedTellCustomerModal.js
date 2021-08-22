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
  Dimensions
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import FastImage from "react-native-fast-image";

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff"
  },
  driverButtonViewContainer: {
    padding: 5
  },
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: "center"
  },

});

export default class OrderWasConfirmedAcceptedTellCustomerModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: "white",
          height: null,
          paddingBottom: 10,                 
          borderWidth: 0,
          borderColor: "#FFC300",
          borderRadius: 20,
          width: width - 16
        }}
        backdrop={true}
        position={"center"}
        backdropPressToClose={true}
        swipeToClose={true}
        ref={"orderWasConfirmedAcceptedTellCustomerModal"}
        isOpen={this.props.openClosed}
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
            onPress: () => this.props.closeMe()
          }}
          centerComponent={{
            text: "Order en route",
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
                paddingLeft:8,
                paddingRight:8,
                fontSize: 30,
                textAlign: "center"
              }}
            >
              {"Order on its way!"}
            </Text>

            <View>
              <FastImage
                style={{
                  flex: 1,
                  maxHeight: 165,
                  height: 165,
                  width: undefined
                }}
                source={Images.deliveringToMany}
                resizeMode={"contain"}
              />
            </View>
            <Text style={{  fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                 paddingLeft:4,
                paddingRight:4, margin: 8, textAlign: "center" }}>
              {
                "Sit back and relax! Your order is being serviced and delivered by some highly trained professionals."
              }
            </Text>
            <Text style={{ paddingLeft:8, paddingRight:8, color: "black", margin: 8, textAlign: "center" }}>
              {"We're going to show you its progress right now!!!"}
            </Text>
            
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}
              icon={{ name: "sync" }}
              title="Thanks"
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
