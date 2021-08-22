import React, { Component } from "react";
import { Color, Styles } from "@common";
import { Menu, Logo, EmptyView, HeaderHomeRight } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import BIMap from "../containers/BIMap/index"

export default class BIMapScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Menu(),
    headerRight: HeaderHomeRight(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return <BIMap navigation={navigation} />;
  }
}
