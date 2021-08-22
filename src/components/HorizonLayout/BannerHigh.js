import React, { PureComponent } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Images, Styles } from "@common";
import { ImageCache, TouchableScale } from "@components";
import { getProductImage, currencyFormatter } from "@app/Omni";
import { LinearGradient } from "@expo";
import css from "./style";
import FastImage from "react-native-fast-image"
import ProductURLHelper from "../../services/ProductURLHelper";

export default class BannerLarge extends PureComponent {
  render() {
    const { viewPost, title, product } = this.props;

    console.debug("in bannerLarge about to render image for:" + product);
    const imageURI =
      typeof product.images[0] !== "undefined"
        ? getProductImage(
            ProductURLHelper.generateProductURL(product.images[0]),
            Styles.width * 0.7
          )
        : Images.PlaceHolderURL;

    const productPrice = `${currencyFormatter(product.price)} `;

    const productPriceSale = product.on_sale
      ? `${currencyFormatter(product.regular_price)} `
      : null;

    return (
      <TouchableScale onPress={viewPost} style={css.bannerHighShadow}>
        <View activeOpacity={1} style={css.bannerHighView}>
          <FastImage source={{ uri: imageURI}} style={css.bannerHighImage} />

          <LinearGradient
            colors={["rgba(0,26,64,0)", "rgba(0,14,34,1)"]}
            style={css.bannerOverlay}
          >
            <Text numberOfLines={2} style={css.bannerHighTitle}>{title}</Text>
            <View style={css.priceView}>
              <Text style={[css.price]}>{productPrice}</Text>
              <Text style={[css.price, product.on_sale && css.sale_price]}>
                {productPriceSale}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableScale>
    );
  }
}
