/** @format */

import React, { PureComponent } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ProductPrice, ImageCache, Rating } from "@components";
import { Images, Styles, withTheme } from "@common";
import { getProductImage } from "@app/Omni";
import css from "./style";
import ProductURLHelper from "../../services/ProductURLHelper";

class OneColumn extends PureComponent {
  render() {
    const {
      product,
      title,
      viewPost,
      theme: {
        colors: { text }
      }
    } = this.props;

    const imageURI =
      typeof product.images[0] !== "undefined"
        ? getProductImage(
            ProductURLHelper.generateProductURL(product.images[0]),
            180
          )
        : Images.PlaceHolderURL;

    return (
      <View style={{backgroundColor: "white", borderRadius: 20, margin: 10, paddingTop: 10,      
      shadowOffset: { width: 3, height: 6 },
      shadowColor: "#59769C",
      //backgroundColor: "transparent",
      shadowOpacity: 0.7,
      shadowRadius: 7,
      elevation: 5,}}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={css.panelTwoHigh}
        onPress={viewPost}
      >
          <ImageCache uri={imageURI} style={css.imagePanelTwoHigh} />
          <Text numberOfLines={2} style={[css.nameTwo, { color: text }]}>
            {title}
          </Text>
          <ProductPrice product={product} hideDisCount />
          <Rating rating={product.average_rating} />
      </TouchableOpacity>
      </View>
    );
  }
}

export default withTheme(OneColumn);
