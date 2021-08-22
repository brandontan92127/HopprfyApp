import React, { Component } from "react";
import { Color, Styles } from "@common";
import { Menu, Logo, EmptyView, HeaderHomeRight, Back , StoreAndDriverHeader} from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import StoreHome from "../containers/StoreHome";

export default class StoreHomeScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: StoreAndDriverHeader(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return <StoreHome navigation={navigation} />;
  }
}
