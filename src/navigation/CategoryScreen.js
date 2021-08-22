/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Color, Images, Styles } from "@common";
import { TabBarIcon } from "@components";
import { Category } from "@containers";
import { Logo, Back, EmptyView, HeaderHomeRight } from "./IconNav";

export default class CategoryScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: Logo(),
    headerLeft: Back(navigation),    
    headerRight: HeaderHomeRight(navigation),
    tabBarIcon: ({ tintColor }) => (
      <TabBarIcon
        css={{ width: 18, height: 18 }}
        icon={Images.IconCategory}
        tintColor={tintColor}
      />
    ),

    headerTintColor: Color.headerTintColor,
    headerStyle: Styles.Common.toolbar,
    headerTitleStyle: Styles.Common.headerStyle,
  });

  static propTypes = {
    navigation: PropTypes.object.isRequired,
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Category
        navigation={this.props.navigation}
        onViewProductScreen={(item) => {
          navigate("DetailScreen", item);
        }}
      />
    );
  }
}
