/** @format */

import React, { PureComponent } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import css from "@cart/styles";
import { currencyFormatter, toast } from "@app/Omni";
import { ProductItem } from "@components";
import { connect } from "react-redux";
import { SwipeRow } from "react-native-swipe-list-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Languages, Color, withTheme, Images } from "@common";
import { LinearGradient } from "@expo";
import styles from "./styles";

class MyCart extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      coupon: props.couponCode,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.hasOwnProperty("type") &&
      nextProps.type == "GET_COUPON_CODE_FAIL"
    ) {
      toast(nextProps.message);
    }

    if (
      nextProps.filteredCartItems.length != this.props.filteredCartItems.length
    ) {
      this.props.onCartUpdated();
    }
  }

  render() {
    console.debug("in my cart");
    const {
      cartItems,
      totalPrice,
      filteredCartItems,
      filteredItemsTotal,
      isFetching,
      discountType,
    } = this.props;
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    let couponBtn = Languages.ApplyCoupon;
    let colors = [Color.darkOrange, Color.darkYellow, Color.yellow];
    const finalPrice =
      discountType == "percent"
        ? filteredItemsTotal - this.getExistCoupon() * filteredItemsTotal
        : filteredItemsTotal - this.getExistCoupon();

    if (isFetching) {
      couponBtn = Languages.ApplyCoupon;
    } else if (this.getExistCoupon() > 0) {
      colors = [Color.darkRed, Color.red];
      couponBtn = Languages.remove;
    }

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={css.row}>
            <Text style={[css.label, { color: text }]}>
              {Languages.TotalPrice}
            </Text>
            <Text style={css.value}>{currencyFormatter(finalPrice)}</Text>
          </View>
          <View style={styles.list}>
            {filteredCartItems &&
              filteredCartItems.map((item, index) => (
                <SwipeRow
                  key={"cart" + item.product._id}
                  disableRightSwipe
                  leftOpenValue={75}
                  rightOpenValue={-75}
                >
                  {this.renderHiddenRow(item, index)}
                  <ProductItem
                    theme={this.props.theme}
                    key={item.product._id}
                    viewQuantity
                    item={item}
                    onPress={() =>
                      this.props.onViewProduct({ product: item.product })
                    }
                    onChangeQuantity={(item, quantity) =>
                      this._onChangeItemQuantity(item, quantity)
                    }
                    onRemove={this._removeCartItemAndFilterCart}
                  />
                </SwipeRow>
              ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  _removeCartItemAndFilterCart = async  (item) => {
    //round up other vars and call original method
    for (let i = 0; i < item.quantity; i++) {
      await this.props.removeCartItem(item.product, item.variation);
    }

    //if this is the last item, move to the next cart! Remember these are still at the old values
    if(this.props.filteredCartItems.length <= 1)
    {
      if(this.props.cartItems.length >= 1)
      {
        this.props.setCartToLastAddedItem();
      }
    }

    //check if there are any more items in this network left in the cart 
    //- if NOT find the next most recently added item, and filter to that!

    this.props.filterCart(
      this.props.filteredNetworkId,
      this.props.filteredNetworkName,
      this.props.filteredCartNetwork
    );

    this.props.onCartUpdated();
  };

  _onChangeItemQuantity(item, newQuantity) {
    if (newQuantity > item.quantity) {
      this.props.addCartItem(item.product, item.variation);
    } else {
      this.props.removeCartItem(item.product, item.variation);
    }

    this.props.filterCart(
      this.props.filteredNetworkId,
      this.props.filteredNetworkName,
      this.props.filteredCartNetwork
    );

    this.props.onCartUpdated();
  }

  renderHiddenRow = (item, index) => {
    return (
      <TouchableOpacity
        key={"hiddenRow" + item.product._id}
        style={styles.hiddenRow}
        onPress={async () => 
          {
          let stop = "";
          await this._removeCartItemAndFilterCart(item);
          }
        }
      >
        <View style={{ marginRight: 23 }}>
          <FontAwesome name="trash" size={30} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  checkCouponCode = () => {
    if (this.getExistCoupon() == 0) {
      this.props.getCouponAmount(this.state.coupon);
    } else {
      this.props.cleanOldCoupon();
    }
  };

  getCouponString = () => {
    const { discountType } = this.props;
    const couponValue = this.getExistCoupon();
    if (discountType == "percent") {
      return `${couponValue * 100}%`;
    }
    return currencyFormatter(couponValue);
  };

  getExistCoupon = () => {
    const { couponCode, couponAmount, discountType } = this.props;
    if (couponCode == this.state.coupon) {
      if (discountType == "percent") {
        return couponAmount / 100.0;
      }
      return couponAmount;
    }
    return 0;
  };
}

MyCart.defaultProps = {
  couponCode: "",
  couponAmount: 0,
};

const mapStateToProps = ({ carts, products }) => {
  return {
    filteredNetworkName: carts.filteredNetworkName,
    filteredNetworkId: carts.filteredNetworkId,
    filteredCartItems: carts.filteredCartItems,
    filteredItemsTotal: carts.filteredItemsTotal,
    filteredCartNetwork: carts.filteredCartNetwork,
    cartItems: carts.cartItems,
    totalPrice: carts.totalPrice,
    couponCode: products.coupon && products.coupon.code,
    couponAmount: products.coupon && products.coupon.amount,
    discountType: products.coupon && products.coupon.type,

    isFetching: products.isFetching,
    type: products.type,
    message: products.message,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const { actions } = require("@redux/CartRedux");
  const productActions = require("@redux/ProductRedux").actions;
  return {
    ...ownProps,
    ...stateProps,
    removeCartItem: (product, variation) => {
      return actions.removeCartItem(dispatch, product, variation);
    },
    cleanOldCoupon: () => {
      productActions.cleanOldCoupon(dispatch);
    },
    addCartItem: (product, variation) => {
      actions.addCartItem(dispatch, product, variation);
    },
    getCouponAmount: (coupon) => {
      productActions.getCouponAmount(dispatch, coupon);
    },
    filterCart: (filtNetId, filtNetName, filtNetwork, cartItems) =>
      {
        actions.filterCart(dispatch, filtNetId, filtNetName, filtNetwork);
        //click to sort image flickr
      }
      ,
  };
}

export default connect(
  mapStateToProps,
  undefined,
  mergeProps
)(withTheme(MyCart));
