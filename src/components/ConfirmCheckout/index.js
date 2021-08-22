/** @format */

import React, { PureComponent } from "react";
import { TouchableOpacity, Text, View, Image, Dimensions } from "react-native";
import styles from "./styles";
import {
  Styles,
  getProductImage,
  currencyFormatter,
  warn,
  Images,
} from "@app/Omni";
import { Languages, withTheme } from "@common";

//update by Nadav to add new rows of charges :)
class ConfirmCheckout extends PureComponent {
  render() {
    console.debug("confirm checkout");
    // let {
    //   discountType,
    //   couponAmount,
    //   shippingMethod,
    //   totalPrice,
    //   networkForOrder
    // } = this.props;
    // let shippingPrice = shippingMethod[0].total;
    // let discount =
    //   discountType == "percent"
    //     ? this.getExistCoupon() * totalPrice
    //     : this.getExistCoupon();
    // let total =
    //   parseFloat(totalPrice) +
    //   parseFloat(shippingPrice) -
    //   parseFloat(discount ? discount : 0);

    // let itemCharge = total;

    // let baseCurrency = 0;
    // const networkFee = 0;
    // const platformFee = 0;
    // const driverCharge = 0;
    // const finalTotal = 0;
    // if (typeof networkForOrder !== "undefined") {
    //   //now start the calcs
    //   baseCurrency = networkForOrder.BaseCurrency;
    //   networkFee = networkForOrder.NetworkCommissionBaseRate * itemCharge;
    //   platformFee = networkForOrder.PlatformCommissionBaseRate;
    //   driverCharge = networkForOrder.DriverDeliveryFiatBaseRate;

    //   finalTotal = itemCharge + networkFee + platformFee + driverCharge;
    // }

    // const {
    //   theme: {
    //     colors: { background, text }
    //   }
    // } = this.props;

    return (
      <View style={styles.container}>
        {/* <View style={styles.row}>
          <Text style={styles.label}>{Languages.Subtotal}</Text>
          <Text style={[styles.value, { color: text }]}>
            {currencyFormatter(itemCharge)}
          </Text>
        </View>
        {couponAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>{Languages.Discount}</Text>
            <Text style={[styles.value, { color: text }]}>
              {discountType == "percent"
                ? `${parseFloat(couponAmount)}%`
                : currencyFormatter(couponAmount)}
            </Text>
          </View>
        )} */}
        {/* <View style={styles.row}>
          <Text style={styles.label}>{"Delivery Charge"}</Text>
          <Text style={[styles.value, { color: text }]}>
            {currencyFormatter(driverCharge)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{"Network Fee"}</Text>
          <Text style={[styles.value, { color: text }]}>
            {currencyFormatter(networkFee)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{"Platform Fee"}</Text>
          <Text style={[styles.value, { color: text }]}>
            {currencyFormatter(platformFee)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>{Languages.Total}</Text>
          <Text style={[styles.value, { color: text }]}>
            {currencyFormatter(finalTotal)}
          </Text>
        </View> */}
      </View>
    );
  }

  // getExistCoupon = () => {
  //   const { couponAmount, discountType } = this.props;
  //   if (discountType == "percent") {
  //     return couponAmount / 100.0;
  //   }
  //   return couponAmount;
  // };
}

export default withTheme(ConfirmCheckout);
