/** @format */

import React, { PureComponent } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  View,
  Text,
  Image,
  I18nManager,
  StatusBar
} from "react-native";
// import {LinearGradient} from '@expo';
import LinearGradient from "react-native-linear-gradient";
import AppIntroSlider from "react-native-app-intro-slider";
import styles from "./styles";
import { Config } from "@common";
import { connect } from "react-redux";
import GlobalStyle from "../../common/GlobalStyle";

class AppIntro extends PureComponent {
  _renderItem = props => (
    <LinearGradient
      style={[
        styles.mainContent,
        {
          paddingTop: props.topSpacer,
          paddingBottom: props.bottomSpacer,
          width: props.width,
          height: props.height
        }
      ]}
      colors={["#3680EE", "#62007A"]}
      start={{ x: 0, y: 0.1 }}
      end={{ x: 0.1, y: 1 }}
    >
      {!props.useImage ? (
        <Image
          source={props.item.imageSource}
          style={styles.mainImage}
          resizeMode='contain'
        />
      ) : (
        <Ionicons
          style={{ backgroundColor: "transparent" }}
          name={props.icon}
          size={200}
          color='white'
        />
      )}
      <View>
        <Image
          source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
          style={[styles.logo]}
          resizeMode='contain'
        />
        <Text style={styles.title}>{props.item.title}</Text>
        <Text style={styles.text}>{props.item.text}</Text>
      </View>
    </LinearGradient>
  );

  _renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name={I18nManager.isRTL ? "arrow-forward" : "arrow-forward"}
          color={GlobalStyle.introColorPink.color}
          size={24}
        />
      </View>
    );
  };

  _renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name='md-checkmark'
          color={GlobalStyle.introColorPink}
          size={24}
        />
      </View>
    );
  };

  render() {
    return (
      <>
        <StatusBar barStyle='light-content' />
        <AppIntroSlider
          data={Config.intro}
          renderItem={this._renderItem}
          renderDoneButton={this._renderDoneButton}
          renderNextButton={this._renderNextButton}
          onDone={this.props.finishIntro}
        />
      </>
    );
  }
}

AppIntro.defaultProps = {
  useImage: false
};

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/UserRedux");
  return {
    finishIntro: () => dispatch(actions.finishIntro())
  };
};

export default connect(null, mapDispatchToProps)(AppIntro);
