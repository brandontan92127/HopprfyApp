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
import UserSignupScreen from "../containers/RegisterAsDriverOrStore/UserSignup"

export default class RegisterAsCustomerScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Menu(),
    headerRight: HeaderHomeRight(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle,
    headerTransparent: true,

  });

  render() {
    const { navigation } = this.props;
    //return  <RegisterAsDriverOrStore mode="customer"/>;
    return  <UserSignupScreen navigation={navigation}/>;
    
  }
}

