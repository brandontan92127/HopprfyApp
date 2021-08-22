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

export default class StoreReceivesNewOrderModal extends React.PureComponent {
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
          borderWidth: 0,
          borderColor: "#ED8C48",
          width: width - 16
        }}
        backdrop={true}
        swipeToClose={true}
        backdropPressToClose={true}
        position={"center"}
        ref={"storeReceivesNewOrderModal"}
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
            text: "Fullfillment: New Order",
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
                marginTop:11,
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily:Constants.fontHeader ,
                margin: 5,
                fontSize: 24,
                textAlign: "center",
              }}
            >
              {"Your store has a new order!"}
            </Text>

            <View style={{ borderRadius: 5, marginBottom: 20 }}>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 200,
                  height: 200,
                  width: undefined
                }}
                source={Images.NewAppReskinGraphics.StoreNewOrder}
                //source={Images.newOrder}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                color: GlobalStyle.storeModal.color,
                fontFamily:Constants.fontFamilyMedium ,
                fontSize: 16,
                margin: 20,
                textAlign: "center"
              }}
            >
              {"Please fulfil this order asap, the driver is\ninbound to your location.\nGo to the store screen to see full details! "}
            </Text>
            <ElButton
              buttonStyle={{                
                fontFamily:Constants.fontHeader,
                padding: 10, margin: 5, marginTop: 10 }}
              raised
              backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
              borderRadius={20}
              icon={{ name: "check" }}
              title="Thanks"
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
