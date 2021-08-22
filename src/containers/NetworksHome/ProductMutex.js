import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Button,
  ShopButton,
  CashOutModal,
  PermissionsList,
  InboundPermissionsModal,
} from "@components";
import { List, ListItem, Header, Icon } from "react-native-elements";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
} from "@common";
import { Images } from "@common";
import { toast } from "@app/Omni";
import { connect } from "react-redux";
import HopprWorker from "../../services/HopprWorker";
import ProductURLHelper from "../../services/ProductURLHelper";

class ProductMutex extends Component {
  constructor(props) {
    super(props);

    this.productBaseUrl = Config.ProductClassIconBaseUrl;

    this.state = {
      refreshing: false,
      productClassId: undefined,
      networkId: undefined,
      products: [],
      tabIndex: 0,
    };

    console.debug("In ProductMutex");
  }

  _navigateToProductCreateAndEditScreen = (selectedClassId) => {
    const { navigation } = this.props;
    //toast("we did it:" + selectedNetworkId);
    navigation.navigate("ProductCreateAndEditScreen", {
      productClassId: selectedClassId,
    });
  };

  _getProductsForClass = async (classId, lat, lng) => {
    console.debug("Gonna get class for:" + classId);
    var prods = await HopprWorker.productsByClassIdJustNameAndId(classId, lat = null, lng = null);
    if (typeof prods !== "undefined") {
      this.setState({ products: prods });
    }
  };

  load = async () => {
    const { navigation } = this.props;
    let productClassIdPassed = this.props.navigation.getParam(
      "productClassId",
      undefined
    );

    let networkIdPassed = this.props.navigation.getParam(
      "networkId",
      undefined
    );
    this.setState({
      productClassId: productClassIdPassed,
      networkId: networkIdPassed,
    });

    await this._getProductsForClass(productClassIdPassed);
  };

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();      
    } catch (error) {
      
    }    
  }


  componentDidMount = async () => {    
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    await this.load();
  };

  renderProductRow = ({ item }) => {
    const { user, navigation } = this.props;
    //item is category
    let imageUrl = "https://ieee.nitk.ac.in/res/img/placeh.jpg";
    if (typeof item.images !== "undefined") {
      imageUrl = ProductURLHelper.generateProductURL(item.images[0]);

      //   if (
      //     item.images[0].includes("https:") ||
      //     item.images[0].includes("http:")
      //   ) {
      //     //see if it's full or relative path
      //     imageUrl = item.images[0];
      //   } else {
      //     imageUrl = this.productBaseUrl + item.images[0];
      //   }
    }

    return (
      <ListItem
        // roundAvatar
        rightIcon={
          <View>
            <Image
              style={{
                maxHeight: 94,
                height: 94,
                width: 94,
                maxWidth: 94,
              }}
              source={imageUrl}
              resizeMode="contain"
            />
          </View>
        }
        subtitleNumberOfLines={1}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.name}
        subtitle={item.price}
        leftIcon={
          <View style={{ paddingRight: 2, marginRight: 2 }}>
            <Image
              style={{
                flex: 1,
                maxHeight: 120,
                height: 100,
                width: 100,
                maxWidth: 120,
                padding: 5,
                margin: 5,
                //   width: undefined
              }}
              source={{ uri: imageUrl }}
              resizeMode="contain"
            />
          </View>
        }
        // avatar={{
        //   uri: imageUrl,
        //   style: { marginRight: 5 }
        // }}
        switched={item.active}
        // onSwitch={() => {
        //   console.debug("About to toggle");
        //   this._toggleCategorySwitch(item._id);
        // }}
        // badge={{
        //   value: numberOfProds,
        //   textStyle: { color: "orange" },
        //   style: { marginRight: 10 }
        // }}
        //onPress={() => this._navigateToProductMutexScreen(item._id)}
        onPress={() => alert("OK")}
        switchButton={true}
        hideChevron={true}
        switchTintColor={"grey"}
      />
    );
  };

  showProductList = () => {
    if (this.state.products.length > 0) {
      return (
        <List style={{ flexGrow: 1 }}>
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.products}
            renderItem={this.renderProductRow}
            keyExtractor={(item) => item._id}
          />
        </List>
      );
    } else {
      return (
        <View>
          <Image
            style={{
              flex: 1,
              maxHeight: 140,
              height: 140,
              width: undefined,
            }}
            source={Images.whereisIt}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "black",
              fontSize: 20,
              paddingTop: 20,
              textAlign: "center",
            }}
          >
            {"There were no products to show!"}
          </Text>
        </View>
      );
    }
  };

  render = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <TouchableHighlight
          onPress={() =>
            this._navigateToProductCreateAndEditScreen(
              this.state.productClassId
            )
          }
        >
          <View style={{ minHeight: 150, height: 150 }}>
            <Image
              style={{
                flex: 1,
                maxHeight: 140,
                minHeight: 140,
                height: 140,
                width: undefined,
              }}
              source={Images.AddProduct}
              resizeMode="contain"
            />
          </View>
        </TouchableHighlight>

        <Text style={{ color: "grey", textAlign: "center" }}>
          {"Products:"}
        </Text>
        <ScrollView style={{ flex: 1 }}>{this.showProductList()}</ScrollView>
      </View>
    );
  };
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    modalsArray: state.modals.modalsArray,
  };
};

/**Needs to save permissions here */
const mapDispatchToProps = (dispatch) => {
  const userActions = require("@redux/UserRedux");
  const modalActions = require("@redux/ModalsRedux");
  return {
    updateModalState: (modalName, modalState) => {
      console.debug("About to update modals");
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState
          )
        );
      } catch (error) {
        console.debug(error);
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ProductMutex));
