/** @format */

import React, { PureComponent } from "react";
import { Logo, Menu, EmptyView, HeaderHomeRight } from "./IconNav";

import { Color, Config, Constants, Images, Styles } from "@common";
import { TabBarIcon } from "@components";
import { FinishOrder } from "@containers";


import {
  View,
  Text,
  Image,
  Animated,
  ScrollView,
  TouchableOpacity
} from "react-native";

export default class FinishOrderScreen extends PureComponent {
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
    return (
      <View style={{flexGrow: 1, paddingTop: 50}}>
        <FinishOrder
            navigation={navigation}        
        />
      </View>
    
    );

    // return (
    //   <View><Text>Test 100</Text></View>
    // );
  }
}
