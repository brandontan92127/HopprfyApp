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
  WebView
} from "react-native";
import {
  Color,
  Languages,
  Images,
  Config,
  Styles,
  Constants,
  withTheme,
} from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import HopprWorker from "../../../services/HopprWorker";
import { toast } from "../../../Omni";
import MyWebView from "react-native-webview-autoheight";

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

export default class CashOutModal extends Component {
  constructor(props) {
    console.debug("In cashout");
    super(props);

    this.state = {
      accountUrl: "",
    };
  }

  componentDidMount = async () => { };

  load = async () => {
    //you gotta be logged in and you gotta have an account!!
    console.debug("");
    let accountUrlResponse = await HopprWorker.getStripeConnectAccountUrl();
    if (accountUrlResponse.status != 200) {
      //fail, close
      this.closeMe();
    } else {
      //keep going, assign to state and
      console.debug("");
      let generatedUrl = accountUrlResponse.data.generatedUrl;
      this.setState({ accountUrl: generatedUrl });
    }
  };

  unload = async () => {
    //clear state
  };

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: height * 0.8,
          paddingBottom: 10,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          border: 1,
          borderColor: "lightblue",
          width: width - 15,
          // marginTop: 50,        
        }}       
        swipeToClose={true}
        backdrop={true}
        position={"center"}
        ref={"cashoutModal"}
        isOpen={this.props.openClosed}
        onOpened={this.load}
        onClosed={() => this.closeMe()}
      >
        {/* <Header
          backgroundColor={"#FFC300"}
          outerContainerStyles={{ height: 49 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe()
          }}
          centerComponent={{
            text: "Cash Out Modal",
            style: { color: "#fff" }
          }}
        /> */}
        <View style={{ flexGrow: 1, borderRadius: 8 }}>
          <ScrollView>
          <TouchableOpacity>
            <MyWebView
              source={{ uri: this.state.accountUrl }}
              startInLoadingState={true}
              style={{ borderRadius: 8 }}
            />
            </TouchableOpacity>
          {/* <WebView          
              useWebKit={true}             
              source={{ uri: this.state.accountUrl }}              
              //injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}              
            /> */}
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
