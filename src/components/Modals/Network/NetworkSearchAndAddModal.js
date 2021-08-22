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
import NetworkDisplayModal from "@components";

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

export default class NetworkSearchAndAddModal extends Component {
  componentDidMount = async () => {

  }

  componentWillMount = async () => {

  };

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          flex: 1,
          height: null,
          backgroundColor: "#fff",
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: GlobalStyle.primaryColorDark.color,
          width: width - 15
        }}
        backdrop={true}
        position={"center"}
        ref={"networkSearchAndAddModal"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={"#FFC300"}
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
            text: "Network Search And Add Modal",
            style: { color: "#fff" }
          }}
        />
        <View style={{ flexGrow: 1 }}>
          <ScrollView>
            <Text
              style={{
                color: "black",
                margin: 5,
                fontSize: 25,
                textAlign: "center"
              }}
            >
              {"Network Search And Add:"}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
