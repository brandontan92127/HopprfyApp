import styles from "./style";

import React from "react";
import { Text, TouchableOpacity, Image } from "react-native";

class Button extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity style={styles.container}>
        <Image source={this.props.image} style={styles.image} />
        <Text style={styles.text}>{this.props.label}</Text>
      </TouchableOpacity>
    );
  }
}
export default Button;
