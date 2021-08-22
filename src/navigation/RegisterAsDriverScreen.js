/** @format */

import React, { Component } from "react";
import { Back, Menu, Logo, EmptyView, HeaderRight, HeaderHomeRight } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";

import { Languages, Color, Styles} from "@common";
import { Setting } from "@containers";
import RegisterAsDriverOrStore from "../containers/RegisterAsDriverOrStore"


export default class RegisterAsDriverScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: EmptyView(),
    headerRight: HeaderHomeRight(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;
    return  <RegisterAsDriverOrStore mode="driver"/>;
  }
}

