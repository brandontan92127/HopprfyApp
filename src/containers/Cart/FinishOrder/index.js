/** @format */

import React, { PureComponent } from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@components";
import { Languages, Color, Images, withTheme, Config } from "@common";
import styles from "./styles";
import FastImage from "react-native-fast-image";

class FinishOrder extends PureComponent {
  render() {
    const {
      theme:{
        colors:{
          background, text
        }
      }
    } = this.props

    return (
      <View style={styles.container}>
      
      
      <FastImage
          source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
          resizeMode={"contain"}
          style={{maxHeight: 140, width:140, flex:1, alignSelf:"center",
            margin:6, marginTop:14,}}
          />

      
        {/* <View style={styles.iconContainer}> */}
                
          {/* <Ionicons
            name="ios-checkmark-circle"
            size={80}
            color={Color.accent}
          /> */}
        {/* </View> */}

        <Text style={[styles.title, {color: text}]}>{Languages.ThankYou}</Text>
        <Text style={[styles.message, {color: text}]}>{Languages.FinishOrder}</Text>

        <View style={styles.btnNextContainer}>
          <Button
            text={"Keep shopping!"}
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={()=>
              {
                this.props.navigation.navigate("Cart");
                this.props.navigation.navigate("Home");
              }
              }
          />
        </View>
      </View>
    );
  }
}

export default withTheme(FinishOrder)
