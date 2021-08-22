import React, { Component } from "react";
import { Color, Styles, Config, GlobalStyle } from "@common";
import {
  Menu,
  Logo,
  EmptyView,
  HeaderHomeRight,
  StoreAndDriverHeader,
  Back
} from "./IconNav";
import { Platform } from "react-native";
import TradingHome from "../containers/TradingHome";

const getCss = () => {
  return GlobalStyle.primaryColorDark.color;
};

export default class TradingScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: StoreAndDriverHeader(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: {
      backgroundColor: getCss(),
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      zIndex: 1,
      borderBottomWidth: Config.Theme.isDark ? 0 : 1,
      borderBottomColor: "transparent",
      ...Platform.select({
        ios: {
          height: 32
        },
        android: {
          height: 46,
          paddingTop: 0,
          marginTop: 0
        }
      })
    },
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return <TradingHome navigation={navigation} />;
  }
}
