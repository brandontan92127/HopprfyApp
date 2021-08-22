/** @format */

import React, { PureComponent } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Styles, Images, withTheme } from "@common";
import { ProductPrice, ImageCache } from "@components";
import { getProductImage } from "@app/Omni";
import css from "./style";
import FastImage from "react-native-fast-image"
import ProductURLHelper from "../../services/ProductURLHelper";

class ThreeColumn extends PureComponent {
  render() {
    const {
      viewPost,
      title,
      product,
      theme: {
        colors: { text },
      },
    } = this.props;

    console.debug("in three column about to pass images for:" + product.name);
    const imageURI =
      typeof product.images[0] !== "undefined"
        ? getProductImage(
            ProductURLHelper.generateProductURL(product.images[0]),
            120
          )
        : Images.PlaceHolderURL;

    return (
      <View style={{backgroundColor: "white", borderRadius: 20, margin: 10, paddingTop: 10,
      shadowOffset: { width: 3, height: 3 },
      shadowColor: "#59769C",
      //backgroundColor: "transparent",
      shadowOpacity: 0.7,
      shadowRadius: 7,
      elevation: 5,
      }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={css.panelThree}
        onPress={viewPost}
      >
        <View style={{overflow:"hidden", borderRadius:8}}>
        <FastImage source={{ uri: imageURI}} style={css.imagePanelThree} />
        </View>
        <Text numberOfLines={2} style={[css.nameThree, { color: text }]}>
          {title}
        </Text>
        <ProductPrice product={product} hideDisCount />
      </TouchableOpacity>
      </View>
    );
  }
}

export default withTheme(ThreeColumn);
