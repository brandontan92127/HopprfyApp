/** @format */

import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image } from "react-native";
import { Constants, Languages, Styles } from "@common";
import { currencyFormatter } from "@app/Omni";
import Swiper from "react-native-swiper";
import styles from "./index_style";
import { Button } from "../index";

class CategorySlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentProduct: props.products.length > 0 ? props.products[0] : {},
      currentIndex: 0,
    };
  }

  render() {
    var { products } = this.props;

    console.debug("Rendering category slider for products");
    return (
      <View style={styles.productView}>
        <Swiper
          height={Styles.width / 1.44}
          showsPagination={false}
          onMomentumScrollEnd={(e, state, context) =>
            this.onChangeProduct(state.index)
          }
        >
          {products.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={{ flex: 1 }}
              onPress={() => this.props.clickProduct(product)}
            >
              <Image
                source={{ uri: product.images[0] }}
                style={styles.imageProduct}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </Swiper>
        <Text style={styles.name}>{this.state.currentProduct.name}</Text>
        <Text style={styles.price}>
          {currencyFormatter(this.state.currentProduct.price)}
        </Text>

        <View style={{ backgroundColor: "white" }}>
          <View style={styles.indicatorView}>
            {products.map((product, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  this.state.currentIndex == index && styles.currentIndicator,
                ]}
              />
            ))}
          </View>

          <View style={styles.btnContainer}>
            <Button
              text={Languages.ShopNow.toUpperCase()}
              style={styles.btnShop}
              textStyle={styles.btnShopText}
              onPress={() => this.props.showAllProduct()}
            />
          </View>
        </View>
      </View>
    );
  }

  onChangeProduct(index) {
    var currentProduct = this.props.products[index];
    this.setState({ currentProduct, curSrentIndex: index });
  }
}

CategorySlider.defaultProps = {
  products: [],
};

export default CategorySlider;
