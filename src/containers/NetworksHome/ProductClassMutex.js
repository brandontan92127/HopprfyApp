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

class ProductClassMutex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      cats: [],
      network: undefined,
    };

    console.debug("ProductClassMutex");
  }

  _deleteProductClass = async (productClassId) => {
    await HopprWorker.deleteProductClass(productClassId);
    toast("Product Class was deleted");
  };

  _editProductClass = (classId) => {
    _navigateToProductClassCreateAndEditScreen(classId);
  };

  _getJustCategoriesForNetwork = async (netId) => {
    let stop = "";
    let catIDsAndNameEtcForNet = await HopprWorker.getCategoriesJustIdAndName(
      netId
    );
    this.setState({ cats: catIDsAndNameEtcForNet });
  };

  //each product class
  renderCategoryRow = ({ item }) => {
    const { user, navigation } = this.props;
    //item is category
    //get product image
    let catImageBaseUrl = Config.ProductClassImageBaseUrl;
    //set image URL depending on what type of link it is
    if (
      item.image != null &&
      typeof item.image !== "undefined"
    ) {
      if (
        item.image.indexOf("http://") == 0 ||
        item.image.indexOf("https://") == 0
      ) {
        //it's already an HTTP link, don't add anything
        catImageBaseUrl = "";
      }
    }

    const imageCategory =
    item.image !== null
        ? { uri: catImageBaseUrl + item.image }
        : Images.categoryPlaceholder;

    //listing order
    let listingOrder = 5000;
    if (
      typeof item.ProductClassClientConfigs !== "undefined" &&
      item.ProductClassClientConfigs.length > 0
    ) {
      listingOrder = item.ProductClassClientConfigs[0].listingOrder;
    }

    return (
      <ListItem
        // roundAvatar
        rightIcon={
          <View>
            <Image
              style={{
                maxHeight: 74,
                height: 74,
                width: 74,
                maxWidth: 74,
              }}
              source={imageCategory}
              resizeMode="contain"
            />
          </View>
        }
        subtitleNumberOfLines={1}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={"Category: " + item.name.replace(/_/g, " ")}
        subtitle={
          "Listing Order: " +
          listingOrder +
          "\n" +
          "Sorting Order: " +
          item.sorting
        }
        // avatar={{
        //   uri: imageUrl,
        //   style: { marginRight: 5 }
        // }}
        leftIcon={
          <View style={{ paddingRight: 4, marginRight: 4 }}>
            <Image
              style={{
                flex: 1,
                maxHeight: 120,
                height: 100,
                width: 100,
                maxWidth: 120,
                //   width: undefined
              }}
              source={imageCategory}
              resizeMode="contain"
            />
          </View>
        }
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
        onPress={() => this._navigateToProductMutexScreen(item._id)}
        switchButton={true}
        hideChevron={true}
        switchTintColor={"grey"}
      />
    );
  };

  showCategoryList = () => {
    if (this.state.cats.length > 0) {
      return (
        <List style={{ flexGrow: 1 }}>
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.cats}
            renderItem={this.renderCategoryRow}
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
            {"There were no categories to show!"}
          </Text>
        </View>
      );
    }
  };

  //This lists all prods in a class
  _navigateToProductMutexScreen = (classId) => {
    const { navigation } = this.props;
    //toast("we did it:" + selectedNetworkId);
    navigation.navigate("ProductMutexScreen", {
      productClassId: classId,
      networkID: this.state.network,
    });
  };

  //pass netowrk ID so get all classes
  _navigateToProductClassCreateAndEditScreen = (selectedClassId) => {
    const { navigation } = this.props;
    //toast("we did it:" + selectedNetworkId);
    navigation.navigate("ProductClassCreateAndEditScreen", {
      productClassId: selectedClassId, //if it's an existing class
      networkId: this.state.network, //if we're creating new
    });
  };

  _navigateToProductClassOrderingScreen = (networkId) => {
    const { navigation } = this.props;
    //toast("we did it:" + selectedNetworkId);
    navigation.navigate("ProductClassListingOrderSortScreen", {
      cats: this.state.cats, //all categories
    });
  };

  load = async () => {
    const { navigation } = this.props;
    var networkIdPassed = this.props.navigation.getParam(
      "networkId",
      undefined
    );
    // alert("we navigat3ed here - triggered:" + networkIdPassed);
    this.setState({ network: networkIdPassed });

    await this._getJustCategoriesForNetwork(networkIdPassed);
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

  render = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flex: 1,
            height: 160,
            maxHeight: 160,
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => this._navigateToProductClassCreateAndEditScreen()}
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
                  source={Images.AddCat}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <Text style={{ color: "grey", textAlign: "center" }}>
              {"Add New Category"}
            </Text>
          </View>

          {/* SECOND */}
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => this._navigateToProductClassOrderingScreen()}
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
                  source={Images.Sort1}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <Text style={{ color: "grey", textAlign: "center" }}>
              {"Edit Listing Order"}
            </Text>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }}>{this.showCategoryList()}</ScrollView>
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
)(withTheme(ProductClassMutex));
