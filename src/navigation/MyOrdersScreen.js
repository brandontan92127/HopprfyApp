/** @format */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Color, Styles, Images } from "@common";
import { Menu, Logo, EmptyView, HeaderHomeRight, Back } from "./IconNav";
import { TabBarIcon } from "@components";
import { MyOrders } from "@containers";

export default class MyOrdersScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: HeaderHomeRight(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle,
    headerTransparent: true,

  });

  static propTypes = {
    navigation: PropTypes.object,
  };

  render() {
    const { navigation } = this.props;
    return (
      <MyOrders
        navigation={navigation}
        onViewHomeScreen={() => navigate("Default")}
      />
    );
  }
}
