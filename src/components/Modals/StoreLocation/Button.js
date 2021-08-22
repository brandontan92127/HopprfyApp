import styles from "./button_style";

import React from "react";
import { View, Text, Image } from "react-native";

const Button = ({ image, text }) => {
  return (
    <View style={styles.btn}>
      <Image source={image} style={styles.btnImage} />
      <Text style={styles.btnText}>{text}</Text>
    </View>
  );
};

export default Button;
