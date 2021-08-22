/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Text, TouchableOpacity, View } from "react-native";
import TimeAgo from "react-native-timeago";
import { ImageCache, ProductPrice, Rating } from "@components";
import { Constants, withTheme } from "@common";
import css from "./style";

class ColumnLayout extends PureComponent {
  static propTypes = {
    post: PropTypes.object,
    title: PropTypes.string,
    type: PropTypes.string,
    imageURL: PropTypes.string,
    date: PropTypes.any,
    viewPost: PropTypes.func,
  };

  render() {
    const { imageURL, post, type, title, date, viewPost } = this.props;
    const {
      theme:{
        colors:{
          background, text
        }
      }
    } = this.props

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={css.panelTwo}
        onPress={viewPost}>
              <View style={{backgroundColor: "white",
               borderRadius: 20, 
               overflow:"hidden",
               paddingVertical: 10}}>

        <ImageCache uri={imageURL} style={css.imagePanelTwo} />

        <Text numberOfLines={1} style={[css.nameTwo, {color: text}]}>{title}</Text>
        {typeof type !== "undefined" && (
          <Text numberOfLines={1} style={[css.timeTwo, { alignSelf: "center" }]}>
            <TimeAgo time={date} />
          </Text>
        )}
        {typeof type === "undefined" && (
          <ProductPrice product={post} hideDisCount />
        )}
        {typeof type === "undefined" && <Rating rating={post.average_rating} />}
        </View>
      </TouchableOpacity>
    );
  }
}

export default withTheme(ColumnLayout)
