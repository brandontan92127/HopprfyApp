import styles from "./button_style";

import React from "react";
import { View, Text,  Image } from "react-native";

const Button = ({ image, text, textColor, fontWeight, fontSize }) => {
  return (
    <View style={styles.btn}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.btnImage} />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={{
            ...styles.btnText,
            color: textColor ?? "black",
            fontWeight: fontWeight,
            fontSize: fontSize,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

export default Button;
