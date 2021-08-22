/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Text, Image } from "react-native";
import { Styles, Color, Constants,Device } from "@common";
import { connect } from "react-redux";


class TabBarIcon extends PureComponent {
  static propTypes = {
    textForTitle: PropTypes.string,
    icon: PropTypes.any,
    tintColor: PropTypes.string,
    css: PropTypes.any,
    carts: PropTypes.object,
    cartIcon: PropTypes.any,
    wishList: PropTypes.any,
  };

  _renderText(text, tintColor) {
    if (text !== "" && typeof text !== "undefined" && text != null) {
      {
        return
        (<Text style={{ fontSize: 6, textAlign: "center" }}>{"Test"}</Text>);
      }
    }
    return null;
  }
  render() {
    const {
      icon,
      tintColor,
      css,
      carts,
      cartIcon,
      wishList,
      textForTitle
    } = this.props;

    const numberWrap = (number = 0) => (
      <View style={styles.numberWrap}>
        <Text style={styles.number}>{number}</Text>
      </View>
    );
    return (
      <View style={{
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        flex: 1,
        paddingTop: 2
      }}>
        
           {/* <Text
          style={{
            paddingTop: 2,
            //color: tintColor,
            fontSize: 11,
            color:"black",
           // fontFamily: Constants.fontFamilyBlack,
            textTransform: "uppercase",
            textAlign: "center",
            // textShadowColor: "black",
            // textShadowRadius: 1
          }}>
          {"TEST"}
        </Text> */}
        <Image
          ref={(comp) => (this._image = comp)}
          source={icon}
          style={[styles.icon, { tintColor }, css]}
        />
        <Text style={{ paddingTop: 2,
            color: tintColor,
            textAlign: "center",
            fontSize: 11, fontFamily: Constants.fontHeader}}>{textForTitle}</Text>
        {cartIcon && carts.total > 0 && numberWrap(carts.total || 0)}
        {/* {this._renderText(textForTitle, tintColor)} */}
  
      </View>
    );
  }
}
const topPoitionForNumberWrap = Device.isIphoneX ? 24 : 6;
const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  numberWrap: {
    ...Styles.Common.ColumnCenter,
    position: "absolute",
    top: topPoitionForNumberWrap,
    right: -5,
    height: 18,
    minWidth: 18,
    backgroundColor: Color.error,
    borderRadius: 9,
  },
  number: {
    color: "white",
    fontSize: 12,
    marginLeft: 3,
    marginRight: 3,
  },
});

const mapStateToProps = ({ carts, wishList }) => ({ carts, wishList });
export default connect(
  mapStateToProps,
  null,
  null
)(TabBarIcon);
