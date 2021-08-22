/** @format */

import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import styles from "./styles";
import { Styles, Languages, Images, withTheme } from "@common";
import { Timer, getProductImage, currencyFormatter, toast } from "@app/Omni";
import { ShopButton } from "@components";

class PaymentEmpty extends Component {
  render() {
    const {
      theme:{
        colors:{
          background, text
        }
      }
    } = this.props

    return (
      <View style={[styles.container, {backgroundColor: background}]}>
        <View style={styles.content}>
          <View>
            <Image
              source={Images.IconHeart}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, {color: text}]}>{Languages.EmptyWishList}</Text>
          <Text style={[styles.message, {color: text}]}>{Languages.NoWishListItem}</Text>
        </View>

        <ShopButton onPress={this.props.onViewHome} />
      </View>
    );
  }
}

export default withTheme(PaymentEmpty)
