/** @format */

import React, { PureComponent } from "react";
import { Login } from "@containers";
import { Color, Styles } from "@common";
import { Back, EmptyView, Logo, Menu, HeaderHomeRight } from "./IconNav";

export default class LoginScreen extends PureComponent {
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
    const { navigate, state, goBack } = this.props.navigation;
    const isLogout = state.params ? state.params.isLogout : false;

    return (
      <Login
        statusBar
        navigation={this.props.navigation}
        onBack={goBack}
        isLogout={isLogout}
        // onViewSignUp={(user) => navigate("SignUpScreen", user)}
        onViewRegisterAsVendor={()=>navigate("RegisterAsStoreScreen")}
        onViewSignUp={() => navigate("RegisterAsCustomerScreen")}
        onViewCartScreen={() => navigate("CartScreen")}
        onViewHomeScreen={() => navigate("Default")}
      />
    );
  }
}
