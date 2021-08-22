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
import { Color, Languages, Styles, Constants,GlobalStyle, withTheme } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";

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

export default class OrderWasConfirmedPickedUpTellCustomerModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 0,
          borderColor: "#C11F1F",
          width: width - 16
        }}
        backdrop={true}
        position={"center"}
        ref={"orderWasConfirmedPickedUpTellCustomerModal"}
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
            text: "Order has been collected",
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
                paddingLeft: 8,
                paddingRight: 8,
                fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 30,
                textAlign: "center"
              }}
            >
              {"Your order won't be long!"}
            </Text>

            <View>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 160,
                  height: 160,
                  width: undefined
                }}
                source={Images.NewAppReskinGraphics.OrderPickedUp}
                resizeMode="contain"
              />
            </View>
            <Text style={{
             fontFamily:Constants.fontFamily,
             color: GlobalStyle.modalTextBlackish.color,
              paddingLeft: 12,
              paddingRight: 12,
              margin: 8,
              textAlign: "center"
            }}>
              {
                "Your order has been collected from the store and is on it's way to you"
              }
            </Text>
            <Text style={{
              paddingLeft: 12,
              paddingRight: 12,
              fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color, margin: 2, textAlign: "center"
            }}>
              {
                "Track its progress on the track order screen"
              }
            </Text>
            {/* <Divider style={{ backgroundColor: "#C11F1F" }} /> */}
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={30}           
              title="Thanks"
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
