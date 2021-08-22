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
import { Color, Languages, Styles, Constants, withTheme } from "@common";
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
    backgroundColor: "white",
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
  containerCentered: {
    backgroundColor: "white",
    justifyContent: "center",
  },
});

export default class OrderWasCancelledTellDriverModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    console.debug("THIS IS OrderWasCancelledTellDriverModal!");

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: null,
          paddingBottom: 10,
          borderRadius:20,
          overflow:"hidden",        
          width: width - 14,
          borderWidth: 1,
          borderColor: "red",
        }}
        backdrop={true}
        position={"center"}
        ref={"orderWasCancelledTellDriverModal"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={"red"}
          outerContainerStyles={{ height: 49, borderRadius: 8 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Order was cancelled",
            style: { color: "#fff" },
          }}
        />
        <View>
          <ScrollView>
            <Text
              style={{
                color: "black",
                margin: 5,
                fontSize: 34,
                textAlign: "center",
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
                  width: undefined,
                }}
                source={Images.sadFace}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: "black", margin: 20, textAlign: "center" }}>
              {
                "We are super sorry - but the customer or store has decided they can no longer fulfil or want the order. Don't worry bro / madam - you're still gonnna get paid!"
              }
            </Text>
            <Divider style={{ backgroundColor: "red" }} />
            <ElButton
              buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={"red"}
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
