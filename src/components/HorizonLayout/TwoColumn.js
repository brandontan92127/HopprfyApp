/** @format */

import React, { PureComponent } from "react";
import { Text, TouchableOpacity, View , I18nManager, Dimensions} from "react-native";
import { Images, Styles, withTheme } from "@common";
import { ImageCache, ProductPrice } from "@components";
import { getProductImage } from "@app/Omni";
import css from "./style";
import FastImage from "react-native-fast-image"
import { LinearGradient } from "@expo";
import ProductURLHelper from "../../services/ProductURLHelper"
const { width, height } = Dimensions.get("window");
class TwoColumn extends PureComponent {
  render() {
    const {
      title,
      product,
      viewPost,
      theme: {
        colors: { text },
      },
    } = this.props;
    const imageURI =
      typeof product.images[0] !== "undefined"
        ? getProductImage(ProductURLHelper.generateProductURL(product.images[0]), 180)
        : Images.PlaceHolderURL;

    return (
      <View style={{backgroundColor: "white", 
      borderRadius: 20, margin: 10, paddingTop: 10,
      //added for shading
      shadowOffset: { width: 3, height: 3 },
      shadowColor: "#59769C",
      //backgroundColor: "transparent",
      shadowOpacity: 0.7,
      shadowRadius: 7,
      elevation: 5,
      }}>                
      <TouchableOpacity
        activeOpacity={0.9}
        style={css.panelTwo}
        onPress={viewPost}>          
        <View style={{overflow:"hidden", borderRadius:8}}>
        <FastImage source={{uri : imageURI}} style={css.imagePanelTwo} />
        </View>
        <Text numberOfLines={2} style={[css.nameTwo, { color: text }]}>
          {title}
        </Text>
        <ProductPrice product={product} hideDisCount />
      </TouchableOpacity>      
      </View>

    );
  }
}

export default withTheme(TwoColumn);
