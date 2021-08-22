/** @format */

import React, { PureComponent } from "react";
import { TouchableOpacity, Text, View, Image, Dimensions } from "react-native";
import styles from "./styles";
import {
  Styles,
  getProductImage,
  currencyFormatter,
  warn,
  Languages,
  Images,
} from "@app/Omni";
import ChangeQuantity from "@components/ChangeQuantity";
import { connect } from "react-redux";
import { withTheme, Config } from "@common";
import ProductURLHelper from "../../services/ProductURLHelper";
import { NoFlickerImage } from 'react-native-no-flicker-image';
import FastImage from 'react-native-fast-image'

class ProductItem extends PureComponent {
  render() {
    const { item, viewQuantity } = this.props;
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    const { quantity, product, variation } = item;

    const price =
      variation === null || variation === undefined
        ? product.price
        : variation.price;

    console.debug("rendering product item" + product.name);
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: background },
          Config.Theme.isDark && { borderBottomColor: lineColor },
        ]}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => this.props.onPress({ product })}>
            <Image
              source={{
                uri: getProductImage(
                  ProductURLHelper.generateProductURL(product.images[0]),
                  100
                ),
              }}
              resizeMode={"cover"}
              style={styles.image}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.infoView,
              { width: Dimensions.get("window").width - 180 },
            ]}
          >
            <TouchableOpacity onPress={() => this.props.onPress({ product })}>
              <Text style={[styles.title, { color: text }]}>
                {product.name}
              </Text>
            </TouchableOpacity>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: text }]}>
                {currencyFormatter(price)}
              </Text>
              {variation &&
                typeof variation.attributes !== "undefined" &&
                variation.attributes.map((variant) => {
                  return (
                    <Text key={variant.name} style={styles.productVariant}>
                      {variant.option}
                    </Text>
                  );
                })}
            </View>
          </View>
          {viewQuantity && (
            <ChangeQuantity
              style={styles.quantity}
              quantity={quantity}
              onChangeQuantity={(newQuantity) =>
                this.props.onChangeQuantity(this.props.item, newQuantity)
              }
            />
          )}
        </View>

        {viewQuantity && (
          <TouchableOpacity
            style={styles.btnTrash}
            onPress={() => this.props.onRemove(item)}
          >
            <FastImage
              source={require("@images/ic_trash.png")}
              style={[styles.icon, { tintColor: text }]}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default ProductItem;
