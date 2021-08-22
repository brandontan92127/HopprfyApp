import React, { Component } from "react";
import { Color, Styles } from "@common";
import { Menu, Logo, EmptyView, Back } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import PermissionsHome from "../containers/PermissionsHome/index"

export default class PermissionsHomeScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: EmptyView(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return <PermissionsHome navigation={navigation} />;
  }
}
