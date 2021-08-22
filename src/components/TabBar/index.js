/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  View,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { connect } from "react-redux";
import { Device, withTheme } from "@common";
const minMaxTabHeight = Device.isIphoneX ? 90 : 70
const styles = StyleSheet.create({
  tabbar: { 
    zIndex:0,
    minHeight:minMaxTabHeight,
    maxHeight:minMaxTabHeight,
    height:minMaxTabHeight,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    // borderTopWidth: 1,
    borderTopColor: "grey",
    backgroundColor: "white",
    paddingBottom:0,
    marginBottom:0,
  },
  tab: {
    alignSelf: "stretch",
    flex: 1,
    // borderWidth: 1,
    // borderColor: "red",
    alignItems: "center",
    ...Platform.select({
      ios: {
        // justifyContent: "flex-start",
        // paddingTop: 0,
        // paddingBottom:0,
        // marginBottom:0,
         marginTop: Device.isIphoneX  ?-20 : 0,
      },
      android: {
        justifyContent: "center",
      },
    }),
  },
});

class TabBar extends PureComponent {
  onPress = (index, route) => {
    // this.refs[`tabItem${index}`].flipInY(900);
    // this.props.jumpToIndex(index)
    this.props.jumpTo(route.key);
  };

  render() {
    const {
      navigation,
      renderIcon,
      activeTintColor,
      inactiveTintColor,
      theme: {
        colors: { background },
      },
    } = this.props;

    const { routes } = navigation.state;

    const ignoreScreen = [
      "DetailScreen",
      "SearchScreen",
      "Detail",
      "NewsScreen",
      "LoginScreen",
      "SignUpScreen",
      "CustomPage",
      "CategoryDetail",
      "SettingScreen",
      "WishListScreen",
      "LoginStack",
    ];

    return (  
      <View style={[styles.tabbar]}>
        {routes &&
          routes.map((route, index) => {
            const focused = index === navigation.state.index;
            const tintColor = focused ? activeTintColor : inactiveTintColor;

            if (ignoreScreen.indexOf(route.key) > -1) {
              return <View key={route.key} />;
            }

            if (this.props.user === null && route.key === "MyOrders") {
              return <View key={route.key} />;
            }

            return (
              <TouchableWithoutFeedback
                key={route.key}
                style={styles.tab}
                onPress={() => this.onPress(index, route)}>
                <View ref={`tabItem${index}`} style={styles.tab}>
                  {renderIcon({
                    route,
                    index,
                    focused,
                    tintColor,
                  })}
                </View>
              </TouchableWithoutFeedback>
            );
          })}
      </View>
    );
  }
}

TabBar.propTypes = {
  user: PropTypes.object,
  navigation: PropTypes.object,
  renderIcon: PropTypes.any,
  activeTintColor: PropTypes.string,
  inactiveTintColor: PropTypes.string,
  jumpTo: PropTypes.func,
};
const mapStateToProps = ({ user }) => ({ user: user.user });
export default withTheme(connect(mapStateToProps)(TabBar));
