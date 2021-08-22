import React, { Component } from "react";
import { Color, Styles } from "@common";
import { Menu, Logo, EmptyView } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import ProductClassMutex from "../containers/NetworksHome/ProductClassMutex.js"

export default class ProductClassMutexScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Menu(),
    headerRight: EmptyView(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return <ProductClassMutex navigation={navigation} />;
  }
}
