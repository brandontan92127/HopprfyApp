import React, { Component } from "react";
import { Color, Styles } from "@common";
import { Back, Menu, Logo, EmptyView } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import BarcodeScanner from "../containers/ProductStock/BarcodeScanner";

export default class BarcodeScannerScreen extends Component {
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
    return <BarcodeScanner navigation={navigation} />;
  }
}
