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

export default class OrdeRequestedModal extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          backgroundColor: "#fff",
          width: width - 16,
          borderWidth: 0,
          borderColor: "#ea89b0",
        }}
        backdrop={true}
        swipeToClose={true}
        backdropPressToClose={true}
        position={"center"}
        ref={"orderRequestedModal"}
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
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Order Requested",
            style: { 
              fontSize:14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily:Constants.fontHeader,          
            },
          }}
        />
        <View>
          <ScrollView>
            <View style={{ margin: 10 }}>
              <Text
                style={{
                  fontFamily:Constants.fontFamily,
                  color: GlobalStyle.modalTextBlackish.color,
                  margin: 5,
                  paddingBottom: 10,
                  fontSize: 24,
                  textAlign: "center",
                }}
              >
                {
                  "Processing..."
                }
              </Text>

              <View style={{ borderRadius: 20, overflow: "hidden" }}>
                <Image
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    maxHeight: 250,
                    height: 250,
                    width: undefined,
                  }}
                  borderRadius={20}
                  source={Images.NewAppReskinGraphics.Processing}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  fontFamily:Constants.fontFamily,
                  color: GlobalStyle.modalTextBlackish.color,
                  fontSize: 14,
                  margin: 20,
                  textAlign: "center",
                }}
              >
                {
                  "We will let you know as soon as we're done, just sit back and relax..."
                }
              </Text>              
              <ElButton
                buttonStyle={{ fontFamily:Constants.fontFamily, padding: 10, margin: 5, marginTop: 10 }}
                raised
                backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
                borderRadius={20}
                icon={{ name: "check" }}
                title="OK"
                onPress={() => this.props.closeMe()}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
