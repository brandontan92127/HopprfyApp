/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity
} from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import {
  Icons,
  Color,
  Languages,
  Styles,
  Config,
  withTheme,
  Theme,
  Device
} from "@common";
import { Icon, toast, warn, FacebookAPI } from "@app/Omni";
import { Spinner, ButtonIndex } from "@components";
import { Images, GlobalStyle } from "@common";
// import { WooWorker } from "api-ecommerce";
import WPUserAPI from "@services/WPUserAPI";
import PlatformApiClient from "../../services/PlatformApiClient";
import FlashMessage, {
  showMessage,
  hideMessage
} from "react-native-flash-message";
import styles from "./styles";
import HopprWorker from "../../services/HopprWorker";
import { EventRegister } from "react-native-event-listeners";

const isDark = Config.Theme.isDark;

class LoginScreen extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
    isLogout: PropTypes.bool,
    onViewCartScreen: PropTypes.func,
    onViewHomeScreen: PropTypes.func,
    onViewSignUp: PropTypes.func,
    logout: PropTypes.func,
    navigation: PropTypes.object,
    onBack: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isLoading: false,
      logInFB: false,

      hidePassword: true,
    };

    if (typeof this.props.user !== "undefined") {
      if (this.props.user.user != null) {
        this.setState({ username: this.props.user.user.email });
      }

      if (this.props.user.user != null) {
        this.setState({ username: this.props.user.user.email });
      }
    }

    this.onUsernameEditHandle = username => this.setState({ username });
    this.onPasswordEditHandle = password => this.setState({ password });

    this.focusPassword = () => this.password && this.password.focus();
  }

  _autoredirectBasedOnRoles = () => {
    if (typeof this.props.user !== "undefined") {
      if (
        typeof this.props.user.user !== "undefined" &&
        this.props.user.user !== null
      ) {
        //CHECK WHICH ROLES IS IMPLEMENTED
        if (this.props.user.user.roles.find(x => x === "Store")) {
          showMessage({
            position: "center",
            message: "Welcome back vendor!",
            autoHide: false,
            duration: 15000,
            description:
              "We will switch to vendor mode so you can see any inbound orders",
            backgroundColor: "hotpink", // background color
            //backgroundColor: GlobalStyle.primaryColorDark.color, // background color
            color: "white" // text color
          });
          return this.props.navigation.navigate("StoreHomeScreen");
        } else if (this.props.user.user.roles.find(x => x === "Driver")) {
          showMessage({
            position: "center",
            message: "Welcome back driver!",
            autoHide: false,
            duration: 15000,
            description:
              "We will switch to driver mode to get you started quickly!",
            //backgroundColor: "hotpink", // background color
            backgroundColor: GlobalStyle.primaryColorDark.color, // background color
            color: "white" // text color
          });
          return this.props.navigation.navigate("DriverHomeScreen");
        } else {
          this.props.onViewHomeScreen();
        }
      }
    }
  };

  componentDidMount() {
    const { user, isLogout } = this.props;

    // check case after logout
    if (user && isLogout) {
      this._handleLogout();
    }
  }

  componentWillMount = () => {
    // OneSignal.addEventListener("ids", this.onIds);
  };
  componentWillUnmount = () => {
    //  OneSignal.removeEventListener("ids", this.onIds);
  };

  onIds(device) {
    console.log("Device info: ", device);
  }

  // handle the logout screen and navigate to cart page if the new user login object exist
  componentWillReceiveProps(nextProps) {
    const { onViewCartScreen, user: oldUser, onViewHomeScreen } = this.props;

    const { user } = nextProps.user;
    const { params } = nextProps.navigation.state;

    // check case after logout
    if (user) {
      if (nextProps.isLogout) {
        this._handleLogout();
      } else if (!oldUser.user) {
        // check case after login
        this.setState({ isLoading: false });

        if (params && typeof params.onCart !== "undefined") {
          onViewCartScreen();
        } else {
          onViewHomeScreen();
        }

        const uName =
          user.userDetail.lastName != null || user.userDetail.firstName != null
            ? `${user.userDetail.firstName} ${user.userDetail.lastName}`
            : user.userDetail.name;
        toast(`${Languages.welcomeBack}`);
        this.props.initAddresses(user.userDetail);
      }
    }
  }

  _handleLogout = () => {
    const { logout, onViewHomeScreen } = this.props;
    EventRegister.emit("cleanWebsocket");
    logout();
    if (this.state.logInFB) {
      if (FacebookAPI.getAccessToken()) {
        FacebookAPI.logout();
      }
    }
    console.log("IS LOGGED OUT :) :) :) :D XD");
    //logout stuff
    //clear hopprworker token etc do default
    HopprWorker.init({ username: null, password: null });

    //refresh networks w cleared hopprworker
    EventRegister.emit("getAvailableShoppingNetworks");
    EventRegister.emit("loadFirstNetwork");
    //todo: should set selectedNetwork to new [0] network in picker after logout!!
    //todo: CLEAN THE WEBSOCKET!!!
    onViewHomeScreen();
  };

  _onBack = () => {
    const { onBack, goBack } = this.props;
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  _showErrorLoginAlert = () => {
    alert(
      "There was a problem logging in. Please check username and password."
    );
  };

  oneSignalCallback = status => {
    console.debug("here");
    console.debug("oioi" + status);
  };

  onLoginPressHandle = async () => {
    const { login, netInfo } = this.props;

    console.debug("Login was pressed");
    if (!netInfo.isConnected) {
      return toast(Languages.noConnection);
    }

    let test = "";
    this.setState({ isLoading: true });

    const { username, password } = this.state;

    //set up do a call with no creds
    HopprWorker.init({ username: null, password: null });
    let tokenResponse = await HopprWorker.getUserTokenFromApi(
      username,
      password
    );
    if (tokenResponse.status != 200) {
      this._showErrorLoginAlert();
      this.setState({ isLoading: false });
    }

    HopprWorker.init({
      username: username,
      password: password,
      token: tokenResponse.data.access_token
    });
    //done

    let loginResult = await HopprWorker.login();
    if (tokenResponse.status == 200) {
      showMessage({
        style: { borderRadius: 20 },
        position: "center",
        message: "You're logged in",
        autoHide: true,
        duration: 5000,
        description:
          "You can now place an order, deliver, sell, or create your own delivery!",
        //backgroundColor: "hotpink", // background color
        backgroundColor: "hotpink", // background color
        color: "white" // text color
      });
      console.debug("Log in successded");
      console.debug("API token is: " + HopprWorker.getCurrentToken());
      //make the call to redux:

      let theUserInfo = await HopprWorker.getUserInfo();
      console.debug("We got our user's info:" + JSON.stringify(theUserInfo));

      let expiry = tokenResponse.data[".expires"];
      let token = HopprWorker.getCurrentToken();
      login(theUserInfo, username, password, token, expiry);
      EventRegister.emit("cleanWebsocket");

      //do setup stuff for new logged in user
      //get their networks for network picker
      EventRegister.emit("getAvailableShoppingNetworks");
      EventRegister.emit("loadFirstNetwork");

      EventRegister.emit("updateOnesignalApi");

      this._autoredirectBasedOnRoles();
    } else {
      //it failed - throw error messages and let them try again
      alert("Sorry, login failed!! Please check your details.");
      this.setState({ isLoading: false });
      console.debug("Log in failed");
    }

    this.setState({ isLoading: false });
  };

  onFBLoginPressHandle = () => {
    const { login } = this.props;
    this.setState({ isLoading: true });
    FacebookAPI.login()
      .then(async token => {
        if (token) {
          const json = await WPUserAPI.loginFacebook(token);
          warn(["json", json]);
          if (json === undefined) {
            this.stopAndToast(Languages.GetDataError);
          } else if (json.error) {
            this.stopAndToast(json.error);
          } else {
            // let customers = await WooWorker.getCustomerById(json.wp_user_id);
            customers = { ...customers, token, picture: json.user.picture };
            this._onBack();
            login(customers, json.cookie);
          }
        }
      })
      .catch(err => {
        alert("Login failed: " + JSON.stringify(err));
        this.setState({ isLoading: false });
      });
  };

  onSignUpHandle = () => {
    this.props.onViewSignUp();
  };

  checkConnection = () => {
    const { netInfo } = this.props;
    if (!netInfo.isConnected) toast(Languages.noConnection);
    return netInfo.isConnected;
  };

  stopAndToast = msg => {
    toast(msg);
    this.setState({ isLoading: false });
  };

  render() {
    const { username, password, isLoading, hidePassword } = this.state;
    const {
      theme: {
        colors: { background, text }
      }
    } = this.props;

    console.debug("ARE WE HERE");
    return (
      <ScrollView
        style={{ backgroundColor: background }}
        contentContainerStyle={styles.container}
      >
        <View
          style={{
            paddingTop: 68,
            flex: 1,
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            //source={Config.NewHopprCenteredLogoExtended}
            source={Config.InstanceDeploymentVariables.Hopperfy.LoginLogo}
            style={{
              flex: 1,
              maxWidth: Styles.width * 0.8,
              height: undefined
            }}
            resizeMode='contain'
          />
        </View>

        {/* <View style={styles.logoWrap}>
          <Image
            source={Config.BoozaLogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}
        <View style={styles.subContain}>
          <View style={styles.loginForm}>
            <View style={styles.inputWrap}>
              <Icon
                name={Icons.MaterialCommunityIcons.Email}
                size={Styles.IconSize.TextInput}
                color={text}
              />
              <TextInput
                {...commonInputProps}
                ref={comp => (this.username = comp)}
                placeholder={Languages.UserOrEmail}
                keyboardType='email-address'
                onChangeText={this.onUsernameEditHandle}
                onSubmitEditing={this.focusPassword}
                returnKeyType='next'
                autoCapitalize='none'
                autoCompleteType='email'
                value={username}
              />
            </View>
            <View style={styles.inputWrap}>
              <Icon
                name={Icons.MaterialCommunityIcons.Lock}
                size={Styles.IconSize.TextInput}
                color={text}
              />
              {
                hidePassword ? 
                <TextInput
                  {...commonInputProps}
                  ref={comp => (this.password = comp)}
                  placeholder={Languages.password}
                  onChangeText={this.onPasswordEditHandle}
                  secureTextEntry
                  returnKeyType='go'
                  value={password} 
                /> :
                <TextInput
                  {...commonInputProps}
                  ref={comp => (this.password = comp)}
                  placeholder={Languages.password}
                  onChangeText={this.onPasswordEditHandle}
                  returnKeyType='go'
                  value={password}
                />
              }
              {
                hidePassword ? 
                <TouchableOpacity activeOpacity={0.6} onPress={()=> this.setState({ hidePassword: !hidePassword})}>
                  <Icon
                    name={Icons.MaterialCommunityIcons.EyeOff}
                    size={Styles.IconSize.TextInput}
                    color={text}
                  />
                </TouchableOpacity> :
                <TouchableOpacity activeOpacity={0.6} onPress={()=> this.setState({ hidePassword: !hidePassword})}>
                  <Icon
                    name={Icons.MaterialCommunityIcons.Eye}
                    size={Styles.IconSize.TextInput}
                    color={text}
                  />
                </TouchableOpacity>
              }
            </View>
            <ButtonIndex
              text={Languages.Login.toUpperCase()}
              containerStyle={styles.loginButton}
              onPress={this.onLoginPressHandle}
            />
          </View>
          <View style={styles.separatorWrap}>
            <View style={styles.separator} />
            <Text style={styles.separatorText}>{Languages.Or}</Text>
            <View style={styles.separator} />
          </View>

          <ButtonIndex
            text={"FACEBOOK LOGIN"}
            icon={Icons.MaterialCommunityIcons.Facebook}
            containerStyle={styles.fbButton}
            onPress={() => alert("Coming soon!")}
            //    onPress={this.onFBLoginPressHandle}
            //onPress={()=>this.props.onViewRegisterAsVendor()}
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              width: "100%",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              //style={Styles.Common.ColumnCenter}
              onPress={() => this.props.onViewSignUp()}
            >
              <Text style={[styles.signUp, { color: text }]}>
                {"New?"}{" "}
                <Text style={styles.highlight}>{Languages.signup}</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              //style={{}}
              onPress={() => EventRegister.emit("triggerResetPasswordModal")}
            >
              <Text style={[styles.signUp, { color: text }]}>
                {" Or "}
                <Text style={[styles.highlight, { color: "#9844a0" }]}>
                  {"Reset Password"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? <Spinner mode='overlay' /> : null}
      </ScrollView>
    );
  }
}

const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: "transparent",
  placeholderTextColor: isDark
    ? Theme.dark.colors.text
    : Theme.light.colors.text
};

LoginScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
};

const mapStateToProps = ({ netInfo, user }) => ({ netInfo, user });

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/UserRedux");
  const AddressRedux = require("@redux/AddressRedux");
  const backAction = NavigationActions.back({
    key: null
  });
  return {
    login: (user, successUsername, successPassword, token, tokenExpiry) =>
      dispatch(
        actions.login(
          user,
          successUsername,
          successPassword,
          token,
          tokenExpiry
        )
      ),
    logout: () => dispatch(actions.logout()),
    initAddresses: customerInfo => {
      AddressRedux.actions.initAddresses(dispatch, customerInfo);
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(LoginScreen));
