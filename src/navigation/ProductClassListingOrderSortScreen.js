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
import ProductClassListingOrderSort from "../containers/NetworksHome/ProductClassListingOrderSort.js";

export default class ProductClassListingOrderSortScreen extends Component {
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
    return <ProductClassListingOrderSort navigation={navigation} />;
  }
}
