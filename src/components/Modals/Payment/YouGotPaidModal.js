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
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
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
    backgroundColor: "white"
  },
  driverControlsModal: {
    height: 300,
    backgroundColor: "#fff"
  },
  driverButtonViewContainer: {
    padding: 5
  },
  containerCentered: {
    backgroundColor: "white",
    justifyContent: "center"
  }
});

export default class YouGotPaidModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    console.debug("THIS IS YOU GOT PAID MODAL!");

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 0,
          borderColor: "#2EB176",
          width: width - 16
        }}
        backdrop={true}
        position={"center"}
        ref={"youGotPaidModal"}
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
            text: "You got paid!",
            style: {
              fontSize: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily: Constants.fontHeader
            }
          }}
        />
        <View style={{ flexGrow: 1 }}>
          <ScrollView>
            <Text
              style={{
                fontFamily: Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 34,
                textAlign: "center",
                padding: 8
              }}
            >
              {"You got paid!"}
            </Text>

            <View style={{ borderRadius: 13 }}>
              <FastImage
                style={{
                  flex: 1,
                  maxHeight: 140,
                  height: 140,
                  width: undefined
                }}
                source={Images.NewAppReskinGraphics.YouGotPaid}
                resizeMode='contain'
              />
            </View>
            <Text
              style={{
                fontFamily: Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 20,
                textAlign: "center"
              }}
            >
              {"The money will show up in your account balance shortly."}
            </Text>
            {/* <Divider style={{ backgroundColor: "#2EB176" }} /> */}
            <ElButton
              buttonStyle={{
                fontFamily: Constants.fontFamily,
                padding: 10,
                margin: 5,
                marginTop: 10
              }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={20}
              icon={{ name: "sync" }}
              title='Thanks'
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
