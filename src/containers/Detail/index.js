/** @format */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  Animated,
  Image,
  Share
} from "react-native";
import { connect } from "react-redux";
import { Timer, getProductImage, currencyFormatter, warn } from "@app/Omni";
import {
  Button,
  AdMob,
  WebView,
  ProductSize as ProductAttribute,
  ProductColor,
  ProductRelated,
  Rating
} from "@components";
import Swiper from "react-native-swiper";
import {
  Styles,
  Languages,
  Color,
  Config,
  Device,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
import Modal from "react-native-modalbox";
import { find, filter } from "lodash";
import * as Animatable from "react-native-animatable";
import AttributesView from "./AttributesView";
import ReviewTab from "./ReviewTab.js";
import styles from "./ProductDetail_Style";
import ProductURLHelper from "../../services/ProductURLHelper";
import { showMessage, hideMessage } from "react-native-flash-message";
import FastImage from "react-native-fast-image";

const PRODUCT_IMAGE_HEIGHT = 300;
const NAVI_HEIGHT = 64;

class Detail extends PureComponent {
  static propTypes = {
    product: PropTypes.any,
    getProductVariations: PropTypes.func,
    productVariations: PropTypes.any,
    onViewCart: PropTypes.func,
    addCartItem: PropTypes.func,
    removeWishListItem: PropTypes.func,
    addWishListItem: PropTypes.func,
    cartItems: PropTypes.any,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      scrollY: new Animated.Value(0),
      tabIndex: 0,
      selectedAttribute: [],
      selectedColor: 0,
      selectVariation: null
    };

    this.productInfoHeight = PRODUCT_IMAGE_HEIGHT;
    this.inCartTotal = 0;
    this.isInWishList = false;
  }

  componentDidMount() {
    this.getCartTotal(this.props);
    this.getWishList(this.props);

    this.getProductAttribute(this.props.product);
  }

  componentWillReceiveProps(nextProps) {
    this.getCartTotal(nextProps, true);
    this.getWishList(nextProps, true);

    // this important to update the variations from the product as the Life cycle is not run again !!!

    if (this.props.product._id != nextProps.product._id) {
      this.props.getProductVariations(nextProps.product);
      this.getProductAttribute(nextProps.product);
      this.forceUpdate();
    }

    if (this.props.productVariations !== nextProps.productVariations) {
      this.updateSelectedVariant(nextProps.productVariations);
    }
  }

  getProductAttribute = product => {
    this.productAttributes = product.attributes;
    const defaultAttribute = product.default_attributes;

    if (typeof this.productAttributes !== "undefined") {
      this.productAttributes.map(attribute => {
        const selectedAttribute = defaultAttribute.find(
          item => item.name === attribute.name
        );
        attribute.selectedOption =
          typeof selectedAttribute !== "undefined"
            ? selectedAttribute.option.toLowerCase()
            : "";
      });
    }
  };

  closePhoto = () => {
    this._modalPhoto.close();
  };

  openPhoto = () => {
    this._modalPhoto.open();
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
    Timer.setTimeout(() => this.state.scrollY.setValue(0), 50);
  }

  getColor = value => {
    const color = value.toLowerCase();
    if (typeof Color.attributes[color] !== "undefined") {
      return Color.attributes[color];
    }
    return "#333";
  };

  share = () => {
    Share.share({
      message: this.props.product.description.replace(/(<([^>]+)>)/gi, ""),
      url: this.props.product.permalink,
      title: this.props.product.name
    });
  };

  addToCart = (go = false) => {
    const { addCartItem, product, onViewCart } = this.props;

    if (this.inCartTotal < Constants.LimitAddToCart) {
      addCartItem(product, this.state.selectVariation);
    } else {
      alert(Languages.ProductLimitWaring);
    }
    if (go) onViewCart();
  };

  addToWishList = isAddWishList => {
    if (isAddWishList) {
      this.props.removeWishListItem(this.props.product);
    } else this.props.addWishListItem(this.props.product);
  };

  getCartTotal = (props, check = false) => {
    const { cartItems } = props;

    if (cartItems != null) {
      if (check === true && props.cartItems === this.props.cartItems) {
        return;
      }

      this.inCartTotal = cartItems.reduce((accumulator, currentValue) => {
        if (currentValue.product._id == this.props.product._id) {
          return accumulator + currentValue.quantity;
        }
        return 0;
      }, 0);

      const sum = cartItems.reduce(
        (accumulator, currentValue) => accumulator + currentValue.quantity,
        0
      );
      const params = this.props.navigation.state.params;
      params.cartTotal = sum;
      this.props.navigation.setParams(params);
    }
  };

  getWishList = (props, check = false) => {
    const { product, navigation, wishListItems } = props;

    if (props.hasOwnProperty("wishListItems")) {
      if (check == true && props.wishListItems == this.props.wishListItems) {
        return;
      }
      this.isInWishList =
        find(props.wishListItems, item => item.product.id == product.id) !=
        "undefined";

      const sum = wishListItems.length;
      const params = navigation.state.params;
      params.wistListTotal = sum;
      this.props.navigation.setParams(params);
    }
  };

  onSelectAttribute = (attributeName, option) => {
    const selectedAttribute = this.productAttributes.find(
      item => item.name === attributeName
    );
    selectedAttribute.selectedOption = option.toLowerCase();

    this.updateSelectedVariant(this.props.productVariations);
  };

  updateSelectedVariant = productVariations => {
    const selectedAttribute = filter(
      this.productAttributes,
      item => typeof item.selectedOption !== "undefined"
    );

    productVariations &&
      productVariations.map(variant => {
        let matchCount = 0;
        selectedAttribute.map(selectAttribute => {
          const isMatch = find(
            variant.attributes,
            item =>
              item.name === selectAttribute.name &&
              item.option.toLowerCase() ===
                selectAttribute.selectedOption.toLowerCase()
          );
          if (isMatch !== undefined) {
            matchCount += 1;
          }
        });
        if (matchCount === selectedAttribute.length) {
          this.setState({ selectVariation: variant });
        }
      });
    this.forceUpdate();
  };

  /**
   * render Image top
   */
  _renderImages = () => {
    const imageScale = this.state.scrollY.interpolate({
      inputRange: [-300, 0, NAVI_HEIGHT, this.productInfoHeight / 2],
      outputRange: [2, 1, 1, 0.7],
      extrapolate: "clamp"
    });
    return (
      <ScrollView
        style={{ height: PRODUCT_IMAGE_HEIGHT, width: Constants.Window.width }}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        {this.props.product.images.map((image, index) => (
          <TouchableOpacity
            activeOpacity={1}
            key={index}
            onPress={this.openPhoto.bind(this)}
          >
            <Animated.Image
              source={{
                uri: getProductImage(
                  ProductURLHelper.generateProductURL(image),
                  Styles.width
                )
              }}
              style={[
                styles.imageProduct,
                { transform: [{ scale: imageScale }] }
              ]}
              resizeMode='contain'
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  /**
   * Render tabview detail
   */
  _renderTabView = () => {
    const {
      theme: {
        colors: { background, text, lineColor }
      }
    } = this.props;

    return (
      <View style={[styles.tabView, { backgroundColor: background }]}>
        {/* <View
          style={[
            styles.tabButton,
            { backgroundColor: lineColor },
            { borderTopColor: lineColor },
            { borderBottomColor: lineColor },
            Constants.RTL && { flexDirection: "row-reverse" }
          ]}
        >
          <View style={[styles.tabItem, { backgroundColor: lineColor }]}>
            <Button
              type="tab"
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={Languages.AdditionalInformation}
              onPress={() => this.handleClickTab(0)}
              selected={this.state.tabIndex == 0}
            />
          </View>
        </View> */}
        {this.state.tabIndex === 0 && (
          <View style={[styles.description, { backgroundColor: lineColor }]}>
            <Text style={styles.descriptionHeader}>Description</Text>
            <WebView
              useWebKit={true}
              textColor={text}
              html={`<p>${this.props.product.description}</p>`}
            />
          </View>
        )}
        {this.state.tabIndex === 1 && (
          <AttributesView attributes={this.props.product.attributes} />
        )}
        {this.state.tabIndex === 2 && (
          <ReviewTab product={this.props.product} />
        )}
      </View>
    );
  };

  _writeReview = () => {
    showMessage({
      duration: 5000,
      message: "Coming soon",
      autoHide: true,
      style: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      },
      position: "bottom",
      description: "This feature will be released shortly. Just wait for us!",
      backgroundColor: GlobalStyle.primaryColorDark.color,
      color: "white" // text color
    });

    // const { product, userData, onLogin } = this.props;
    // if (userData) {
    //   Events.openModalReview(product);
    // } else {
    //   onLogin();
    // }
  };

  render() {
    const { selectVariation } = this.state;
    const {
      wishListItems,
      onViewProductScreen,
      product,
      cartItems,
      theme: {
        colors: { background, text, lineColor }
      }
    } = this.props;

    const isAddToCart = !!(
      cartItems &&
      cartItems.filter(item => item.product._id === product._id).length > 0
    );
    const isAddWishList =
      wishListItems.filter(item => item.product._id === product._id).length > 0;
    const productPrice = currencyFormatter(
      selectVariation ? selectVariation.price : product.price
    );
    const productRegularPrice = currencyFormatter(
      selectVariation ? selectVariation.regular_price : product.regular_price
    );
    const isOnSale = selectVariation
      ? selectVariation.on_sale
      : product.on_sale;

    const renderButtons = () => (
      <View
        style={[
          styles.bottomView,
          Config.Theme.isDark && { borderTopColor: lineColor },
          Constants.RTL && { flexDirection: "row-reverse" }
        ]}
      >
        {!Config.HideCartAndCheckout && (
          <Button
            text={product.active ? Languages.ADDTOCART : Languages.OutOfStock}
            style={[
              styles.btnAddToCart,
              !product.active && styles.outOfStock,
              { zIndex: 9999 }
            ]}
            textStyle={styles.btnAddToCartText}
            disabled={!product.active}
            onPress={() => {
              product.active && this.addToCart(false);
            }}
          />
        )}
        {!Config.HideCartAndCheckout && (
          <Button
            text={product.active ? Languages.BUYNOW : Languages.OutOfStock}
            style={[
              styles.btnBuy,
              !product.active && styles.outOfStock,
              { zIndex: 9999 }
            ]}
            textStyle={styles.btnBuyText}
            disabled={!product.active}
            onPress={() => {
              product.active && this.addToCart(true);
            }}
          />
        )}
      </View>
    );

    const renderRating = () => {
      let howMany = Math.random() * 100.0;
      let noOfRatinghs = howMany.toFixed(0);
      return (
        <View style={styles.price_wrapper}>
          <Rating rating={Number(4)} size={12} />

          <View style={styles.price_wrapper}>
            <Text style={[styles.textRating, { color: text }]}>
              {`(${noOfRatinghs})`}
            </Text>

            <TouchableOpacity onPress={this._writeReview}>
              <Text style={[styles.textRating, { color: text }]}>
                {"ratings"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const renderTitle = () => (
      <View style={{ justifyContent: "center", marginTop: 6, marginBottom: 8 }}>
        <Text style={[styles.productName, { color: text }]}>
          {product.name}
        </Text>
        <Text style={[styles.productSize, { color: text }]}>
          {product.size}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 2,
            marginBottom: 4
          }}
        >
          <Animatable.Text
            animation='fadeInDown'
            style={[styles.productPrice, { color: text }]}
          >
            {productPrice}
          </Animatable.Text>
          {isOnSale && (
            <Animatable.Text
              animation='fadeInDown'
              style={[styles.sale_price, { color: text }]}
            >
              {productRegularPrice}
            </Animatable.Text>
          )}
        </View>
      </View>
    );

    const renderAttributes = () => (
      <View>
        {typeof this.productAttributes !== "undefined" &&
          this.productAttributes.map((attribute, attrIndex) => (
            <View
              key={`attr${attrIndex}`}
              style={[
                styles.productSizeContainer,
                Constants.RTL && { flexDirection: "row-reverse" }
              ]}
            >
              {attribute.name !== Constants.productAttributeColor &&
                attribute.options.map((option, index) => (
                  <ProductAttribute
                    key={index}
                    text={option}
                    style={styles.productSize}
                    onPress={() =>
                      this.onSelectAttribute(attribute.name, option)
                    }
                    selected={
                      attribute.selectedOption.toLowerCase() ===
                      option.toLowerCase()
                    }
                  />
                ))}
            </View>
          ))}
      </View>
    );

    const renderProductColor = () => {
      if (typeof this.productAttributes === "undefined") {
        return;
      }

      const productColor = this.productAttributes.find(
        item => item.name === Constants.productAttributeColor
      );
      if (productColor) {
        const translateY = this.state.scrollY.interpolate({
          inputRange: [0, PRODUCT_IMAGE_HEIGHT / 2, PRODUCT_IMAGE_HEIGHT],
          outputRange: [0, -PRODUCT_IMAGE_HEIGHT / 3, -PRODUCT_IMAGE_HEIGHT],
          extrapolate: "clamp"
        });

        return (
          <Animated.View
            style={[
              styles.productColorContainer,
              { transform: [{ translateY }] }
            ]}
          >
            {productColor.options.map((option, index) => (
              <ProductColor
                key={index}
                color={this.getColor(option)}
                onPress={() =>
                  this.onSelectAttribute(
                    Constants.productAttributeColor,
                    option
                  )
                }
                selected={
                  productColor.selectedOption.toLowerCase() ===
                  option.toLowerCase()
                }
              />
            ))}
          </Animated.View>
        );
      }
    };

    const renderProductRelated = () => (
      <ProductRelated
        onViewProductScreen={product => {
          this.list.getNode().scrollTo({ x: 0, y: 0, animated: true });
          onViewProductScreen(product);
        }}
        product={product}
        //tags={product.related_ids}
      />
    );

    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: Device.getCorrectIphoneXViewBasePadding(44),
            backgroundColor: background
          }
        ]}
      >
        <Animated.ScrollView
          ref={c => (this.list = c)}
          style={styles.listContainer}
          scrollEventThrottle={1}
          onScroll={event => {
            this.state.scrollY.setValue(event.nativeEvent.contentOffset.y);
          }}
        >
          <View
            style={[styles.productInfo, { backgroundColor: background }]}
            onLayout={event =>
              (this.productInfoHeight = event.nativeEvent.layout.height)
            }
          >
            {this._renderImages()}
            {renderAttributes()}
            {renderTitle()}
            {renderRating()}
          </View>
          {this._renderTabView()}
          {renderProductRelated()}
        </Animated.ScrollView>
        {renderProductColor()}

        {Config.showAdmobAds && <AdMob />}
        {renderButtons()}

        <Modal
          ref={com => (this._modalPhoto = com)}
          swipeToClose={false}
          animationDuration={200}
          style={styles.modalBoxWrap}
        >
          <Swiper
            height={Constants.Window.height - 40}
            activeDotStyle={styles.dotActive}
            removeClippedSubviews={false}
            dotStyle={styles.dot}
            paginationStyle={{ zIndex: 9999, bottom: -15 }}
          >
            {product.images.map((image, index) => (
              <FastImage
                key={image}
                source={{
                  uri: getProductImage(
                    ProductURLHelper.generateProductURL(image),
                    Styles.width
                  )
                }}
                style={styles.imageProductFull}
              />
            ))}
          </Swiper>

          <TouchableOpacity
            style={styles.iconZoom}
            onPress={this.closePhoto.bind(this)}
          >
            <Text style={styles.textClose}>{Languages.close}</Text>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    cartItems: state.carts.cartItems,
    wishListItems: state.wishList.wishListItems,
    productVariations: state.products.productVariations,
    userData: state.user.user
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const CartRedux = require("@redux/CartRedux");
  const WishListRedux = require("@redux/WishListRedux");
  const ProductRedux = require("@redux/ProductRedux");
  return {
    ...ownProps,
    ...stateProps,
    addCartItem: (product, variation) => {
      CartRedux.actions.addCartItem(dispatch, product, variation);
    },
    addWishListItem: product => {
      WishListRedux.actions.addWishListItem(dispatch, product);
    },
    removeWishListItem: product => {
      WishListRedux.actions.removeWishListItem(dispatch, product);
    },
    getProductVariations: product => {
      ProductRedux.actions.getProductVariations(dispatch, product);
    }
  };
}

export default withTheme(
  connect(mapStateToProps, undefined, mergeProps)(Detail)
);
