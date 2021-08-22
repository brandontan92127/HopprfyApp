/** @format */

import React, { PureComponent } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Color, Config, Styles, Images, Constants } from "@common";
import { EventRegister } from "react-native-event-listeners";


export default class NetworkDisplay extends PureComponent {
  constructor(props) {
    super(props);

    console.debug("In network display");
    //cons net ={} = this.props
    this.triggerOnPress = this.doNothing;
    this.onPressShopNow = this.props.onPressShopNow;
  }

  doNothing = () => { };

  render = () => {
    const { network, baseImageUrl } = this.props;

    let theNetwork = network;
    let netBaseImageUrl = baseImageUrl;

    let networkImageUrl = netBaseImageUrl + theNetwork.storeLogoUrl;

    return (
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily:Constants.fontHeader,
            color: "black",
            margin: 5,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          {theNetwork.storeName + " Details:"}
        </Text>
        <Image
          style={{
            flex: 1,
            maxHeight: 200,
            minHeight: 200,
            height: 200,
            width: undefined,
          }}
          source={{ uri: networkImageUrl }}
          resizeMode="contain"
        />
        {/* <Text style={{ color: "black", fontSize: 16, textAlign: "center" }}>
          {theNetwork.visibility}
        </Text> */}
        <Text style={{
          color: "black",
          fontFamily:Constants.fontFamilyMedium,
          paddingLeft: 25,
          paddingRight: 25,
          fontSize: 14,
          textAlign: "center"
        }}>
          {theNetwork.description}
        </Text>
        <Text
          style={{
            color: "black",
            fontSize: 10,
            paddingTop:4,
            fontFamily:Constants.fontFamily,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          {"Delivery Charge (from): £" +
            theNetwork.driverDeliveryFiatBaseRate.toFixed(2)}
        </Text>
        {/* ICON ROW */}
        {/* <View
          style={{
            flexDirection: "row",
            borderWidth: 2,
            height: 70,
            flex: 1,
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            alignSelf: "center",
          }}
        > */}

        <View
          style={{
            flexDirection: "row",
            flex: 1,
            paddingTop: 2,
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            justifyContent: "center",
          }}>
          {/* //ICON 1 */}
          <View
            style={{
              marginTop: 3,
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity              
              onPress={async ()=>await this.onPressShopNow(theNetwork)}
            >
              <Image
                style={{
                  alignSelf: "center",
                  marginTop: 0,
                  margin: 5,
                  maxHeight: 55,
                  height: 55,
                  width: 55,
                  maxWidth: 55,
                }}
                source={Images.ShopAndGoNow}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text
              style={{
                fontStyle: "italic",
                color: "grey",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              {"Shop Now"}
            </Text>
          </View>

          {/* //ICON 2*/}
          <View
            style={{
              marginTop: 3,
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => 
                {
                  EventRegister.emit("openVideoDisplayModal")
                  if(typeof this.props.otherVideoDisplayActions !== "undefined")
                  {
                    this.props.otherVideoDisplayActions();
                  }                  
                }                
              }
            >
              <Image
                style={{
                  alignSelf: "center",
                  margin: 5,
                  marginTop: 0,
                  maxHeight: 55,
                  height: 55,
                  width: 55,
                  maxWidth: 55,
                }}
                source={Images.clapper_board_gif}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text
              style={{
                fontStyle: "italic",
                color: "grey",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              {"View Video"}
            </Text>
          </View>

        </View>
      </View>
      // </View>
    );
  };
}
