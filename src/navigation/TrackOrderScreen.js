import React, { Component } from "react";
import { Color, Styles } from "@common";
import { TrackOrder } from "@containers";
import { Menu, Logo, EmptyView, HeaderHomeRight } from "./IconNav";

export default class TrackOrderScreen extends Component {
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
    return <TrackOrder navigation={navigation} />;
  }
}
