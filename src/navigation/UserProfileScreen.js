/** @format */

import React, { PureComponent } from "react";
import { Logo, Menu, StoreAndDriverHeader, Back } from "./IconNav";
import { Color, Constants, Images, Config, Styles } from "@common";
import { UserProfile } from "@containers";
import { warn } from "@app/Omni";

export default class UserProfileScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),
    headerRight: StoreAndDriverHeader(navigation),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle
  });

  render() {
    const { navigation } = this.props;

    return <UserProfile navigation={navigation} />;
  }
}
