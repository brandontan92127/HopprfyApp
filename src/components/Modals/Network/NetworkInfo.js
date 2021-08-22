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
  ScrollView
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
import NetworkDisplayModal from "@components";

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

export default class NetworkInfoModal extends Component {
  componentDidMount = async () => {
    
  }
  
  componentWillMount = async () => {
    
  };

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return null;
    return (
      <Modal
        style={{ backgroundColor: "#fff", height: 442 }}
        backdrop={true}
        position={"center"}
        ref={"networkInfoModal"}
        isOpen={this.props.openClosed}
        onClosed={()=>this.closeMe()}
      >
        <Header
          backgroundColor={"#AFC300"}
          outerContainerStyles={{ height: 49 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe()
          }}
          centerComponent={{
            text: "Network Info",
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
              {"Network Info:"}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
