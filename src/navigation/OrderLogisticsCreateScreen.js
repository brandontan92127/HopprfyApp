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
import OrderLogisticsCreate from "../containers/OrderLogisticsHome/OrderLogisticsCreate";

export default class OrderLogisticsCreateScreen extends Component {
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
    return <OrderLogisticsCreate navigation={navigation} />;
  }
}
