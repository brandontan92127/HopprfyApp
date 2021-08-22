/** @format */

import React, { PureComponent } from "react";
import { WebView } from "react-native-webview";
import { View } from "react-native";
import { Languages, Color, Styles } from "@common";
import { CustomPage } from "@containers";
import { AnimatedHeader } from "@components";
import { Menu, Logo, EmptyView, HeaderHomeRight, Back } from "./IconNav";
import { warn } from "@app/Omni";

export default class CustomPageScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: HeaderHomeRight(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { state } = this.props.navigation;
    if (typeof state.params == "undefined") {
      return <View />;
    }

    if (typeof state.params.url != "undefined") {
      return (
        <View style={{ flex: 1}}>
          {/* <AnimatedHeader /> */}
          <WebView useWebKit={true} source={{ uri: state.params.url }} />
        </View>
      );
    }

    return (
      <View>
        {/* <AnimatedHeader /> */}
        <CustomPage id={state.params.id} />
      </View>
    );
  }
}
