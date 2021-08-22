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
import ProductStockProductDrillDown from "../containers/ProductStock/ProductStockProductDrillDown";

export default class ProductStockProductDrillDownScreen extends Component {
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
    return <ProductStockProductDrillDown navigation={navigation} />;
  }
}
