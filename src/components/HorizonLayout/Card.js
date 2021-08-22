/** @format */

import React, { PureComponent } from "react";
import { Text, TouchableOpacity, Image } from "react-native";
import css from "./style";
import { Images, Styles, withTheme } from "@common";
import { ProductPrice, ImageCache } from "@components";
import { getProductImage } from "@app/Omni";
import ProductURLHelper from "../../services/ProductURLHelper";

class CardLayout extends PureComponent {
  render() {
    const {
      product,
      title,
      viewPost,
      theme: {
        colors: { text },
      },
    } = this.props;

    console.debug("rendering cardLayout:" + product.name);

    const imageURI =
      typeof product.images[0] !== "undefined"
        ? getProductImage(
            ProductURLHelper.generateProductURL(product.images[0]),
            Styles.width - 50
          )
        : Images.PlaceHolderURL;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={css.panelCard}
        onPress={viewPost}
      >
        <ImageCache uri={imageURI} style={css.imagePanelCard} />
        <Text numberOfLines={2} style={[css.nameCard, { color: text }]}>
          {title}
        </Text>
        <ProductPrice product={product} hideDisCount />
      </TouchableOpacity>
    );
  }
}

export default withTheme(CardLayout);
