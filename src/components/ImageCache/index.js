/** @format */

import React from "react";
import PropTypes from "prop-types";
import { Image } from "react-native";

const ImageCache = ({ style, defaultSource, uri, resizeMode="cover" }) => {
  console.debug(
    "In imagecache processing URI:" +
      uri +
      "with default source:" +
      defaultSource
  );
  return <Image resizeMode={"cover"} style={style} defaultSource={defaultSource} source={{ uri: uri }} />;
};

ImageCache.propTypes = {
  style: PropTypes.any,
  uri: PropTypes.any,
};

export default ImageCache;
