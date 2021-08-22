/** @format */

import React, { PureComponent } from "react";
import { Logo, Menu, EmptyView, HeaderHomeRight } from "./IconNav";

import { Color, Config, Constants, Images, Styles } from "@common";
import { TabBarIcon } from "@components";
import { Categories } from "@containers";

import {
  View,
  Text,
  Image,
  Animated,
  ScrollView,
  TouchableOpacity
} from "react-native";

export default class CategoriesScreen extends PureComponent {
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
    const { navigate } = this.props.navigation;    
    return (
      <View style={{flexGrow: 1, paddingTop: 50}}>
        <Categories
          onViewProductScreen={(item) => navigate("DetailScreen", item)}
          onViewCategory={(item) => {
            navigate("CategoryScreen", item);
          }}
        />
      </View>
    
    );

    // return (
    //   <View><Text>Test 100</Text></View>
    // );
  }
}
