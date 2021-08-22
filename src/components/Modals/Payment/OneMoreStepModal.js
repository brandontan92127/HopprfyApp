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

const { width, height } = Dimensions.get("window");

let bodyHeight = null;
if (height > 800) {
  bodyHeight = "65%";
} else {
  bodyHeight = "75%";
}

const styles = StyleSheet.create({
  driverControlsButton: {
    padding: 10
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },
  driverControlsModal: {
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

export default class OneMoreStepModal extends React.PureComponent {
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
          borderRadius: 20,
          width: width - 14
        }}
        backdrop={true}
        position={"center"}
        ref={"oneMoreStepModal"}
        isOpen={this.props.openClosed}
        coverScreen={true}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          rightComponent={
            <TouchableOpacity
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <Image
                source={Images.NewAppReskinIcon.Close}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: "gray"
                }}
              />
            </TouchableOpacity>
          }
          centerComponent={{
            text: "Payment Queued",
            style: {
              fontSize: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily: Constants.fontFamilyBlack
            }
          }}
        />
        <View style={styles.content}>
          <ScrollView>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 15,
                fontFamily: Constants.fontFamilyBlack,
                alignSelf: "center",
                paddingTop: "5%"
              }}
            >
              {"You"}{" "}
              <Text
                style={{
                  color: "#79879F",
                  fontFamily: Constants.fontFamilyBlack
                }}
              >
                {"almost"}
              </Text>{" "}
              {"got paid!"}
            </Text>
            <Text
              style={{
                fontFamily: Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 14,
                textAlign: "center"
              }}
            >
              {
                "As soon as the customer confirms the order receipt, you'll be paid!"
              }
            </Text>

            <View style={{ overflow: "hidden" }}>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 200,
                  height: 200,
                  width: undefined
                }}
                source={Images.NewAppReskinGraphics.Transaction}
                resizeMode='contain'
              />
            </View>
            <Text
              style={{
                fontFamily: Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                fontSize: 14,
                marginTop: 8,
                margin: 20,
                textAlign: "center"
              }}
            >
              {
                "Meanwhile we'll get you back up and running to take more orders."
              }
            </Text>
            <ElButton
              buttonStyle={{
                fontFamily: Constants.fontFamily,
                padding: 15,
                margin: 5,
                marginTop: 10
              }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={50}
              // icon={{ name: "check", color: "white" }}
              title='OK'
              textStyle={{ fontFamily: Constants.fontFamilyBlack }}
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
