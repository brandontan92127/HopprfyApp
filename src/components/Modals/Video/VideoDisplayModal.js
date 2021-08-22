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
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
} from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { NetworkDisplay } from "@components";
import { Images } from "@common";
import { toast } from "../../../Omni";
import { connect } from "react-redux";
import Video from "react-native-video";

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

export default class VideoDisplayModal extends Component {
  constructor(props) {
    super(props);

    console.debug("network display modal constructor");
  }

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    console.debug("Welcome to Hoppr.io Help");
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: "black",
          height: null,
          paddingBottom: 10,
          borderRadius: 8,
          width: width - 14,
          zIndex:3
        }}
        backdrop={true}
        backdropOpacity={0.9}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={false}        
        position={"center"}
        ref={"videoDisplayModal"}
        isOpen={this.props.openClosed}
        onClosed={this.closeMe}
      >
        {/* <Header
          //backgroundColor={"hotpink"}
          outerContainerStyles={{ height: 10 }}
          rightComponent={{
            icon: "close",
            color: "black",
            onPress: () => this.props.closeMe()
          }}
            centerComponent={{
              text: "Welcome to Hoppr.io",
              style: { color: "white" }
            }}
        /> */}
        {/* CLICK TO CLOSE ROW */}
        <View
          style={{
            border: 1,
            flex: 1,
            backgroundColor:"black",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignContent: "flex-end",
            height: 48,
            maxHeight: 48,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              this.props.closeMe();
            }}
          >
            <Image
              style={{
                padding: 1,
                maxHeight: 45,
                height: 45,
                width: 45,
                maxWidth: 45,
                alignSelf: "flex-end",
                //   width: undefined
              }}
              source={Images.Close2}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 320,
            borderRadius: 8,
            alignContent: "flex-start",
            justifyContent: "flex-start",
          }}
        >
         <Video
            style={{ height: 320 }}
            controls={true}
            source={{
              uri: "https://booza.store:44300/video/boozaExplainer.mp4",
            }} // Can be a URL or a local file.
          /> 
          {/* <BlinkView blinking={true} delay={1600}>
            <Text
              style={{
                color: "hotpink ",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {"Unified Delivery Theory"}
            </Text>
          </BlinkView> */}
        </View>
      </Modal>
    );
  }

}

componentDidMount = async () => { };

componentWillMount = async () => { };
