/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Languages, Tools, withTheme, Constants } from "@common";
import styles from "./styles";
import TextTicker from "react-native-text-ticker";

class UserProfileHeader extends PureComponent {
  //   constructor(props) {
  //     super(props)
  //   }
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    user: PropTypes.object
  };

  loginHandle = () => {
    if (this.props.user.name === Languages.Guest) {
      this.props.onLogin();
    } else {
      this.props.onLogout();
    }
  };

  render() {
    const { user, type, showStatus } = this.props;
    const avatar = Tools.getAvatar(user);
    const {
      theme: {
        colors: { background, text }
      }
    } = this.props;
    if (type == "" || type == null) {
      return (
        <View
          style={[
            styles.container,
            { backgroundColor: background, borderRadius: 40 }
          ]}
        >
          <View style={styles.header}>
            <Image source={avatar} style={styles.avatar} />
            <View style={styles.textContainer}>
              <TextTicker
                duration={8000}
                loop
                bounce
                repeatSpacer={1000}
                marqueeDelay={3000}
                style={[styles.fullName, { color: text }]}
              >
                {user.name}
              </TextTicker>
              <Text style={[styles.address, { color: text }]}>
                {user ? user.address : ""}
              </Text>
              <TouchableOpacity style={styles.btn} onPress={this.loginHandle}>
                <Text style={styles.loginText}>
                  {user.name === Languages.Guest
                    ? Languages.Login.toUpperCase()
                    : Languages.Logout.toUpperCase()}
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={()=>{}}>
              <Text style={[styles.loginText, {paddingLeft:18} ]}>
                {"Help"}
              </Text>
            </TouchableOpacity> */}
            </View>
          </View>
        </View>
      );
    } else if (type == "simple") {
      return (
        <View
          style={[
            styles.container,
            { backgroundColor: background, borderRadius: 40 }
          ]}
        >
          <View style={styles.header}>
            <Image source={avatar} style={styles.avatar} />
            <View style={styles.textContainer}>
              <TextTicker
                duration={8000}
                loop
                bounce
                repeatSpacer={1000}
                marqueeDelay={3000}
                style={[styles.fullName, { color: text }]}
              >
                {user.name}
              </TextTicker>
              <Text
                style={{
                  color: "#A5B5C7",
                  fontFamily: Constants.fontFamilyBold
                }}
              >{`1x28b-eaac`}</Text>
              {showStatus == true ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#2ed573",
                      height: 10,
                      width: 10,
                      borderRadius: 50
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "#A5B5C7",
                      marginLeft: 5,
                      fontFamily: Constants.fontFamily
                    }}
                  >
                    Connected
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      );
    }
  }
}

export default withTheme(UserProfileHeader);
