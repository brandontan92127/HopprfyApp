/** @format */

import React, { Component } from "react";
import { View , Text, Platform} from "react-native";
import { Styles, Constants, Images, Config } from "@common";
import { connect } from "react-redux";
import { NavigationBarIcon } from "@components";
import { EventRegister } from "react-native-event-listeners";

const iconBarTop  = Platform.OS == "android" ? 0 : -6;
const iconTextMinusTop = Platform.OS == "android" ? -18 : -11;
const iconMinusTop= 0;
const headerIconShiftRight = Platform.OS === "ios" ? 4: -4;


class CartIcons extends Component {
  render() {
    const { carts, wishList, navigation } = this.props;
    // console.debug("carts:::", carts);
    // const totalCart = carts.cartItems.length;
    const totalCart = carts.total;
    const wishListTotal = wishList.wishListItems.length;

    return (
      <View
        style={[
          Styles.Common.Row,
          {
            top : iconBarTop,
            right: headerIconShiftRight
           }
          //Constants.RTL ? { left: -10 } : { right: 5 },
        ]}
      >

           <View style={{  top:iconMinusTop }}>
              <NavigationBarIcon
              icon={Images.NewWhiteIcons.pin3}
              size={17}
              onPress={() => EventRegister.emit("showLocationPickerModal")}
              onLongPress={()=>  EventRegister.emit("showStoreLocationPickerModal")}
            />
            <Text
                 style={{
                          top: iconTextMinusTop,
                      //    fontStyle: "italic",
                          fontFamily:Constants.fontFamily,
                          color: "white",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        {"To"}
                      </Text>
            </View>

       <View style={{ top:iconMinusTop }}>
      <NavigationBarIcon
        icon={Images.NewWhiteIcons.search1}
        size={17}
        onPress={() => EventRegister.emit("openNetworkPickerModal")}
        onLongPress={()=>EventRegister.emit("showLocationPickerModal")}
        //onLongPress={()=>EventRegister.emit("showNetworkPicker")}
      />
                 <Text
                   style={{
                    top:iconTextMinusTop,
                  // fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Find"}
                </Text>
       </View>  

       
        {!Config.HideCartAndCheckout && (
              <View style={{  top:iconMinusTop }}>
          <NavigationBarIcon
            icon={Images.NewWhiteIcons.cart1}
            number={totalCart}
            onPress={() => navigation.navigate("CartScreen")}
          />
          <Text
                  style={{
                    top:iconTextMinusTop,
                  //  fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Cart"}
                </Text>
           </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = ({ carts, wishList }) => ({ carts, wishList });
export default connect(mapStateToProps)(CartIcons);
