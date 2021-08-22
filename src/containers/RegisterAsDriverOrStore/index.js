import React, { PureComponent, Component } from "react";
import MyWebView from "react-native-webview-autoheight";
import { toast } from "@app/Omni";
import {
  Color,
  Images,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
} from "@common";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { connect } from "react-redux";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import HopprWorker from "@services/HopprWorker";
import Picker from "react-native-image-crop-picker";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  storeFrontimageStyle: {
    height: 160,
    minHeight: 160,
    flex: 1,
    width: null,
  },
});

/**Allows user to sign up as driver or store */

//TODO: different states depending on sign up state -- pre sign up, pending approval, approved

class RegisterAsDriverOrStore extends Component {
  constructor(props) {
    console.debug("In register as driver or storeview");
    super(props);

    this.basePlatformUrl = Config.CustomerWebPlatformBaseUrl;
    this.signupUrls = Config.RegistrationEndpoints;

    this.state = {};
  }

  /* Can be driver, store, customer*/
  getCorrectSignupUrl = (passedPageType) => {
    console.debug(passedPageType);
    switch (passedPageType) {
      case "driver":
        return this.signupUrls.driver;
        break;
      case "store":
        return this.signupUrls.store;
        break;
      case "customer":
        return this.signupUrls.customer;
        break;
      default:
        return this.signupUrls.customer;
        break;
    }
  };

  componentDidMount = async () => {};

  selectProfileImage() {
    Picker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      console.debug(image);
    });
  }

  selectProfileImageGallery() {
    Picker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      console.debug(image);
    });
  }

  render = () => {
    let pageType = this.props.mode;
    let completedURl =
      this.basePlatformUrl + this.getCorrectSignupUrl(pageType);

    console.debug("in register");
    return (
      <View
        style={{
          flexGrow: 1,
          backgroundColor: Color.background,
        }}
      >
        {/* <Header
          backgroundColor={"orange"}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: "Register as Driver or Store",
            style: { color: "#fff" }
          }}
          rightComponent={{
            icon: "help",
            color: "#fff",
            onPress: () => this.refs.modal2.open()
          }}
        /> */}
        <View style={{ flexGrow: 1 }}>
          <ScrollView
            style={{
              flex: 1,
            }}
          >
            <MyWebView
              source={{ uri: completedURl }}
              startInLoadingState={true}
            />
          </ScrollView>
          {/* <TouchableOpacity onPress={this.selectProfileImage.bind(this)}>
          <View><Text>Select Profile Image</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.selectProfileImageGallery.bind(this)}>
          <View><Text>Select Profile Image From Gallery</Text></View>
          </TouchableOpacity>

          <Image source={this.state.avatarSource} style={styles.uploadAvatar} /> */}
        </View>
      </View>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    store: state.store,
  };
};

export default connect(
  mapStateToProps,
  null
)(withTheme(RegisterAsDriverOrStore));
