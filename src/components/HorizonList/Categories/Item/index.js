/** @format */

import React, { PureComponent } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from "@expo";
import { withTheme } from "@common";
import styles from "./styles";
import { Config } from "@common";
import FastImage from "react-native-fast-image";

class Item extends PureComponent {
  render() {
    console.debug("inside category item render");
    //generate full circle item icon path based on what's set in config

    const {
      item,
      label,
      onPress,
      theme: {
        colors: { text },
      },
    } = this.props;

    let fullIconPath = Config.ProductClassIconDefault;
    if (typeof item != "undefined" && item.image !== "") {
      fullIconPath = Config.ProductClassIconBaseUrl + item.image;
    }

    let colorsWDefaults = ["#D042E6", "#FFFFFF"];
    if (typeof item.colors !== "undefined") {
      if (item.colors !== null) {
        if (
          item.colors.length > 1 &&
          item.colors[0] !== null &&
          item.colors[1] !== null
        ) {
          colorsWDefaults = item.colors;
          //assign the passed colors, else use defaults
        }
      }
    }

    return (
      <View style={[styles.container, { alignItems:"center", alignContent:"center", justifyContent:"center", maxWidth:70, overflow:"hidden"}]}>
        <TouchableOpacity
          style={styles.wrap}
          activeOpacity={0.75}
          onPress={() => onPress({ ...item, circle: true })}
        >
          <LinearGradient colors={colorsWDefaults} style={styles.button}>
            <FastImage source={{ uri: fullIconPath }} style={styles.icon} />
          </LinearGradient>
          <Text numberOfLines={1} style={[styles.title, { color: text }]}>{label}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default withTheme(Item);
