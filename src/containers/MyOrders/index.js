/** @format */

import React, { PureComponent, Component } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  FlatList,
  View,
  Text
} from "react-native";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { connect } from "react-redux";
import { AnimatedHeader, FullOrderDisplayModal } from "@components";
import { Languages, withTheme, Images, Config, GlobalStyle } from "@common";
import styles from "./styles";
import OrderEmpty from "./Empty";
import OrderItem from "./OrderItem";
import HopprWorker from "@services/HopprWorker";
import { showMessage, hideMessage } from "react-native-flash-message";

import Carousel from "react-native-snap-carousel";
import { EventRegister } from "react-native-event-listeners";
import { setIntervalAsync } from 'set-interval-async/dynamic'
import { clearIntervalAsync } from 'set-interval-async'
import moment from "moment";
import GeoWorker from "../../services/GeoWorker";
import { NoFlickerImage } from "react-native-no-flicker-image";
import FastImage from 'react-native-fast-image'

const fromEntries = require('fromentries')
//const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const defaultState = {
  scrollY: new Animated.Value(0),
  myOrders: [],
  fullOrderModalOpenClosed: false,
  selectedOrderAddress: undefined,
  selectedOrder: undefined,
  selectedOrderNetwork: undefined,
}
class MyOrders extends Component {
  state = defaultState;

  getMyOrdersFromApi = async (user) => {
    EventRegister.emit("showSpinner");
    var someOrders = await HopprWorker.ordersByCustomerId(
      user.customerId,
      200,
      1
    );

    this.setState({ myOrders: someOrders }, () => {
      console.debug("State udpate completed");
    });
    EventRegister.emit("hideSpinner");
  };

  _generateProductBaseUrl = (item) => {
    let catImageBaseUrl = Config.ProductBaseUrl;
    if (item.items[0] != null && typeof item.items[0] !== "undefined") {
      if (
        item.items[0].product.images[0].indexOf("http://") == 0 ||
        item.items[0].product.images[0].indexOf("https://") == 0
      ) {
        //it's already an HTTP link, don't add anything
        catImageBaseUrl = "";
      }
    }

    return catImageBaseUrl;
  };
  _resetStateToDefault = () => {
    this.setState(defaultState);
  }


  load = async () => {
    console.debug("in my orders component");    
    if(this.props.user != null)
    {
    this.getMyOrdersFromApi(this.props.user.user);
    }
  }

  unload = async () => {
    this._resetStateToDefault();
  }

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      
    }    
  }
  

  componentDidMount = async () => {
    console.debug("stop");
    await this.load();
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    this.unsubscribeLoseFocus = this.props.navigation.addListener("willBlur", this.unload);
    
    //this.fetchProductsData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.carts.cartItems != nextProps.carts.cartItems) {
      //this.fetchProductsData();
    }
  }

  fetchProductsData = async () => {
    const { user } = this.props.user;
    if (typeof user === "undefined" || user === null) return;

    //this.props.fetchMyOrder(user);
  };

  // renderError(error) {
  //   return (
  //     <OrderEmpty
  //       text={error}
  //       onReload={this.fetchProductsData}
  //       onViewHome={this.props.onViewHomeScreen}
  //     />
  //   );
  // }

  // renderRow = ({ item, index }) => {
  //   return (
  //     <OrderItem key={index.toString()} item={item} theme={this.props.theme} />
  //   );
  // };

  //this is for order list
  renderRow = ({ item }) => {
    let itemString = "";
    let totalItemsCount = 0;
    let prods = [];
    item.items.map((x) => {
      itemString += " " + x.amount + " of " + x.productName + ",";
      totalItemsCount += x.amount;
    });

    itemString = itemString.slice(0, -1);
    item.items.map((i) => {
      let p = i.product;
      prods.push(p);
    });
    //show different image based on state / outcome
    let stateImageUrl = Images.OrderCancelled;
    switch (item.state) {
      case "DRIVER_EN_ROUTE_TO_STORE":
        stateImageUrl = Images.MapIconStore8;
        break;
      case "ORDER_EN_ROUTE_TO_CUSTOMER":
        stateImageUrl = Images.AddDriver1;
        break;
      case "DELIVERED_TO_CUSTOMER":
        stateImageUrl = Images.ShowStripeAccount1;
        break;
      default:
        break;
    }

    //set image URL depending on what type of link it is

    let catImageBaseUrl = this._generateProductBaseUrl(item);

    let imageUrl =
      catImageBaseUrl + item.items[0].product.images[0] ||
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";
    return (
      <ListItem
        leftIcon={
          <View
            style={{
              // overflow: "hidden",
              borderRadius: 10,
            }}
          >
            <Carousel
              ref={(c) => {
                this._carousel = c;
              }}
              layout={"default"}
              layoutCardOffset={`9`}
              data={item.items}
              renderItem={this._renderCarouselItem}
              sliderWidth={130}
              itemWidth={130}
            />
          </View>
        }
        rightIcon={
          <FastImage
            style={{
              marginRight: 5,
              maxHeight: 50,
              height: 50,
              width: 50,
              maxWidth: 50,
            }}
            source={stateImageUrl}
            resizeMode="contain"
          />
        }
        subtitleNumberOfLines={8}
        leftIconOnPress={() => toast("Pressed left icon")}
        titleNumberOfLines={2}
        title={
          "Order:#" + item._id.substring(0, 4) + "\n" +
          totalItemsCount + " items / " + "£" + item.itemSubTotal.toFixed(2)
          //+
          // " - Pickup: " +
          // item.driver.email
        }
        subtitle={
          "Created: " +
          moment.parseZone(item.creationDate).format("MMMM DD, YYYY - H:mm") + "\n" +
          // "\nItems: " +
          // itemString.replace(/,\s*$/, "") +
          // "\nState: " +
          item.state.replace(/_/g, " ")
        }
        // leftIcon={
        //   <View style={{
        //     overflow: "hidden",
        //     borderRadius: 22
        //   }}>
        //     <View
        //       style={{
        //         paddingRight: 2,
        //         marginRight: 2,
        //         overflow: "hidden",
        //         borderRadius: 22
        //       }}
        //     >
        //       <FastImage
        //         style={{
        //           flex: 1,
        //           maxHeight: 140,
        //           height: 120,
        //           width: 100,
        //           maxWidth: 120,
        //           padding: 5,
        //           margin: 5,
        //           overflow: "hidden",
        //           borderRadius: 22
        //           //   width: undefined
        //         }}
        //         source={{ uri: imageUrl }}
        //         resizeMode="contain"
        //       />
        //     </View>
        //   </View>
        // }

        onPress={async () => {
          //get network in order, save
          await this._updateSelectedNetwork(item.networkId)
          await this._reverseGeoCodeOrderDestinationAndSave(item);
          //show full order modal w carousel
          this.setState({ selectedOrder: item });
          this._openFullOrderModal();

        }}
      />
    );
  };

  _reverseGeoCodeOrderDestinationAndSave = async (order) => {

    try {
      let address = await GeoWorker.reverseGeocode(
        order.location.lat,
        order.location.long
      );

      this.setState({ selectedOrderAddress: address.formattedAddress })
    } catch (error) {
     // alert("Couldn't geocode address!")
    }

  }

  _updateSelectedNetwork = async (netId) => {

    let newNetResultsData = await HopprWorker.getNetwork(netId);
    //lowecase the result so it works
    let entries = Object.entries(newNetResultsData);
    let capsEntries = entries.map((entry) => [entry[0][0].toLowerCase() + entry[0].slice(1), entry[1]]);
    let netNets = fromEntries(capsEntries);

    this.setState({ selectedOrderNetwork: netNets })
    console.log(netNets);
  }

  _closeFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: false })
  }

  _openFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: true });
  }
  //takes an order item
  _renderCarouselItem = ({ item, index }) => {
    let name = item.product.name;
    let size = item.product.size;
    let price = item.product.price;

    let amount = item.amount;
    let catImageBaseUrl = Config.ProductBaseUrl;
    if (
      item.product.images[0].indexOf("http://") == 0 ||
      item.product.images[0].indexOf("https://") == 0
    ) {
      //it's already an HTTP link, don't add anything
      catImageBaseUrl = "";
    }

    let imageUrl =
      catImageBaseUrl + item.product.images[0] ||
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";


    let concatText = size != null ? amount + " " + name + "\n@" + size : amount + " " + name;

    return (
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 5,
          // height: 95,
          // padding: 5,
          // marginLeft: 2,
          // marginRight: 2,
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            paddingLeft: 2,
            paddingRight: 2,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <View style={{height:120, width:120, borderRadius:8}}>
          <NoFlickerImage
            style={{
              flex: 1,
              height: 120,
              borderRadius: 10,
              width: 120,
            }}       
            source={{ uri: imageUrl }}
          />
        </View>  
        </View>
        <Text style={{
          paddingLeft: 3,
          paddingRight: 3,
          textAlign: "center",
          fontSize: 10,
          color: GlobalStyle.primaryColorDark.color
        }}>
          {concatText}
        </Text>
      </View>
    );
  };

  showOrderList = () => {
    if (this.state.myOrders && this.state.myOrders.length > 0) {
      return (
        <View style={{ flex: 1, minHeight: 300, height: 300 }}>
          <List style={{ flexGrow: 1 }}>
            <FlatList
              style={{ flexGrow: 1 }}
              data={this.state.myOrders}
              renderItem={this.renderRow}
              keyExtractor={(item) => item._id}
            />
          </List>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, minHeight: 200, height: 200 }}>
          <FastImage
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
              width: undefined,
            }}
            source={Images.NoOrderClipboard}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 4,
              color: "black",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {"There were no orders to show!"}
          </Text>
        </View>
      );
    }
  };

  render() {
    // const data = this.props.carts.myOrders;
    const data = this.state.myOrders;
    const {
      theme: {
        colors: { background },
      },
    } = this.props;

    if (typeof data === "undefined" || data.length == 0) {
      return (
        <OrderEmpty
          text={Languages.NoOrder}
          onReload={this.getMyOrdersFromApi}
          onViewHome={this.props.onViewHomeScreen}
        />
      );
    }

    return (
      <View style={[styles.listView, { backgroundColor: background }]}>
        <View style={{ flexGrow: 1, paddingTop:48 }}>
          {/* IMAGE */}
          <FastImage
            source={Images.OrderHomeAnimated1}
            style={{
              height: 130,
              minHeight: 130,
              flex: 1,
              width: null,
            }}
          />
          <Text h1 style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 20,
            color: GlobalStyle.primaryColorDark.color,
            paddingTop: 4,
          }}>
            {"Your Orders:"}
          </Text>

          {/* <ScrollView style={{ flexGrow: 1, paddingBottom: 140 }}> */}
          {this.showOrderList()}
          {/* {this.showStoreActiveToggle()} */}
          {/* </ScrollView> */}
        </View>


        {/* <AnimatedHeader
          scrollY={this.state.scrollY}
          label={Languages.MyOrder}
          activeSections={this.state.activeSection}
        />
        <AnimatedFlatList
          data={data}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: Platform.OS !== "android" }
          )}
          scrollEventThrottle={1}
          keyExtractor={(item, index) => `${item._id} || ${index}`}
          contentContainerStyle={styles.flatlist}
          renderItem={this.renderRow}
          refreshControl={
            <RefreshControl
              refreshing={this.props.carts.isFetching}
              onRefresh={this.fetchProductsData}
            />
          }
        /> */}

        <FullOrderDisplayModal
          mode={"customer"}
          closeMe={this._closeFullOrderModal}
          openClosed={this.state.fullOrderModalOpenClosed}
          ref={"fullOrderDisplayModal"}
          orderNetwork={this.state.selectedOrderNetwork}
          orderAndItems={this.state.selectedOrder}
          fullAddress={this.state.selectedOrderAddress}
        />
      </View>
    );
  }
}
const mapStateToProps = ({ user, carts }) => ({ user, carts });
function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const { actions } = require("@redux/CartRedux");
  return {
    ...ownProps,
    ...stateProps,
    fetchMyOrder: async (user) => {
      //get from API

      console.debug("Got some orders: ");
      actions.fetchMyOrder(dispatch, user);
    },
  };
}
export default connect(mapStateToProps, null, mergeProps)(withTheme(MyOrders));
