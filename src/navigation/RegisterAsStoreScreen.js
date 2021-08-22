/** @format */

import React, { Component } from "react";
import { View, Text } from "react-native";

import { Back, Menu, Logo, EmptyView, HeaderRight, HeaderHomeRight } from "./IconNav";
import { Languages, Color, Styles} from "@common";
import { Setting } from "@containers";
import RegisterAsDriverOrStore from "../containers/RegisterAsDriverOrStore"

export default class RegisterAsStoreScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: EmptyView(),
    headerRight:HeaderHomeRight(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return  <RegisterAsDriverOrStore mode="store"/>;
  }
}

