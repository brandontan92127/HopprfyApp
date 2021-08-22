import React, { Component } from "react";
import { Color, Styles } from "@common";
import AnimatedMarkers from "../containers/AnimatedMapTest/index.js";
import { Menu, Logo, EmptyView } from "./IconNav";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";

export default class AnimatedMapTestScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Menu(),
    headerRight: EmptyView(),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigate } = this.props.navigation;
    return (     
      <AnimatedMarkers />
    );
  }
}
