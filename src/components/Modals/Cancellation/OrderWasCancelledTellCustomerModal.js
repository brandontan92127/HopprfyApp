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
import { Color, Languages, Styles, Constants, withTheme } from "@common";
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
  }
});

export default class OrderWasCancelledTellCustomerModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;


    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: null,
          paddingBottom: 10,
          borderRadius:20,
          borderWidth: 1,
          borderColor: "#C160D0",
          width: width - 14,
          overflow:"hidden"
        }}
        backdrop={true}
        position={"center"}
        ref={"orderWasCancelledTellCustomerModal"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={"#C160D0"}
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
            text: "Order was cancelled",
            style: { color: "#fff" }
          }}
        />
        <View>
          <ScrollView>
            <Text
              style={{
                color: "black",
                margin: 5,
                fontSize: 34,
                textAlign: "center"
              }}
            >
              {"We are very sorry but the order was cancelled!!"}
            </Text>

            <View>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 140,
                  height: 140,
                  width: undefined
                }}
                source={Images.sadFace}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: "black", margin: 20, textAlign: "center" }}>
              {"We are super sorry - but the driver or store has decided they can no longer fulfil the order. Feel free to order something else and we'll get it to you asap! Sorry about that!!"}
            </Text>
            <Text style={{ color: "black", margin: 20, textAlign: "center" }}>
              {"We have refunded your money to your account and you will see it as a credit."}
            </Text>
            <Divider style={{ backgroundColor: "#C160D0" }} />
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={"#C160D0"}
              borderRadius={20}
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
