import React, { PureComponent, Component } from "react";
import { toast } from "@app/Omni";
import {
  Color,
  Images,
  Languages,
  Styles,
  Constants,
  withTheme
} from "@common";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Dimensions
} from "react-native";
import { connect } from "react-redux";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import HopprWorker from "@services/HopprWorker";
import ProductURLHelper from "../../services/ProductURLHelper";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },
  storeFrontimageStyle: {
    height: 160,
    minHeight: 160,
    flex: 1,
    width: null
  }
});


/**Allows the adjustment of product stocks */
export default class ProductStockProductDrilldown extends Component {
  constructor(props) {
    console.debug("In product stock drill down view");
    super(props);

    const { navigation } = this.props;

    this.networkName = navigation.getParam("networkName", "None");
    this.networkCssColor = navigation.getParam("networkCssColor", "silver");
    this.classId = navigation.getParam("classId", "-1");
    this.classAndProds = navigation.getParam("classAndProds", []);
  }

  componentDidFocus = async () => {
    const { navigation } = this.props;

    toast("Component did focus");
    // await this.getStockAndAmendments();
  };

  componentDidMount = async () => {
    const { navigation } = this.props;

    //refresh stocks

    //add event listeners
    //this.props.navigation.addListener("didFocus", this.componentDidFocus);
    // this.subs = [
    //   this.props.navigation.addListener("didFocus", this.componentDidFocus)
    //   //this.props.navigation.addListener("willBlur", this.componentWillBlur)
    // ];
  };

  renderProductRow = ({ item }) => {
    let toggleValue = false;
    let adjPrice = "N/A";

    let imageUrl = ProductURLHelper.generateProductURL(item.images[0]);

    if (typeof item.basePrice !== "undefined") {
      adjPrice = item.basePrice;
    }

    if (typeof this.props.stockAndAmendments[0].productStocks !== "undefined") {
      //get relevant stock
      let stock = this.props.stockAndAmendments[0].productStocks.find(
        x => x.productId == item._id
      );
      // let adjustment
      if (stock) {
        toggleValue = stock.inStock;
        adjPrice = parseFloat(stock.newPrice).toString();
        // toggleValue = stock.
      }
    }

    return (
      <ListItem
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          marginBottom: 15,
          backgroundColor: "white",
          borderRadius: 20,
          minHeight: 70,
          alignItems: "center",
          justifyContent: "center"
        }}
        roundAvatar
        rightIcon={
          <Image
            style={{
              maxHeight: 34,
              height: 34,
              width: 34,
              maxWidth: 34
            }}
            source={imageUrl}
            resizeMode='contain'
          />
        }
        // textInput={true}
        // textInputStyle={{ color: "black", marginRight: 6, maxWidth:14 }}
        // textInputValue={adjPrice}
        subtitleNumberOfLines={4}
        leftIconOnPress={() => toast("Pressed left icon")}
        // title={item.name}
        title={
          <View
            style={{
              marginHorizontal: 5
            }}
          >
            <Text
              style={{
                fontFamily: Constants.fontFamilyMedium,
                fontSize: 14
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7986A0",
                fontFamily: Constants.fontFamily
              }}
            >{`SIZE: ${item.size}`}</Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7986A0",
                fontFamily: Constants.fontFamily
              }}
            >{`YOU GET: £${item.basePrice}`}</Text>
          </View>
        }
        // subtitle={"Size: " + item.size + "\nYou get:£" + item.basePrice}
        avatar={{
          uri: imageUrl,
          style: { marginRight: 5 }
        }}
        switched={toggleValue}
        onSwitch={() => {
          console.debug("About to toggle");
          this._toggleProductSwitch(item._id);
        }}
        switchButton={true}
        hideChevron={true}
        switchTintColor={"grey"}
        switchOnTintColor={"#DEE5EE"}
        switchThumbTintColor={
          toggleValue === false ? "white" : Color.reskin.primary
        }
        switch={{
          ios_backgroundColor: "#DEE5EE"
        }}
        onPress={() => {
          console.debug("Is this going to do anything");
          this.props.navigation.navigate("ProductCreateAndEditScreen", {item: {...item, image: imageUrl, classId: this.classId}});
        }}
      />
    );
  };

  _updateStockAfterToggle = async newStock => {
    //update the array if the item exists, if not, add it
    let stock = this.props.stockAndAmendments[0].productStocks.find(
      x => x.productId == newStock.productId
    );

    let storeParentArray = [...this.props.stockAndAmendments];
    let parentObject = storeParentArray[0];
    let copiedArray = [...parentObject.productStocks];

    if (stock) {
      //replace
      let indexOfItem = copiedArray.findIndex(
        el => el.productId === newStock.productId
      );
      copiedArray[indexOfItem] = newStock;
    } else {
      //just push into array
      copiedArray.push(newStock);
    }

    parentObject.productStocks = copiedArray;
    storeParentArray[0] = parentObject;
    this.props.updateStockCollection(storeParentArray);
  };

  _toggleProductSwitch = async productId => {
    let toggleValue = false;
    let stockId = undefined;
    let stock = this.props.stockAndAmendments[0].productStocks.find(
      x => x.productId == productId
    );

    if (stock) {
      toggleValue = stock.inStock;
      stockId = stock._id;
    }

    //check value and take action
    if (toggleValue == true) {
      console.debug("Turning off");
      //is true, we want to turn off
      var newStock = await HopprWorker.turnProductStockOff(productId, stockId);
      console.debug("updated stock in api");
      newStock.inStock = false; //now set it
      this._updateStockAfterToggle(newStock);
    } else {
      console.debug("Turning on");
      var newStock = await HopprWorker.turnProductStockOn(productId, stockId);
      newStock.inStock = true;
      console.debug("Got updatd stock");
      this._updateStockAfterToggle(newStock);
      //was false, let's turn it on
    }
  };

  showProductList = () => {
    if (this.classAndProds.Products.length > 0) {
      return (
        <FlatList
          style={{
            flexGrow: 1,
            padding: 10,
            backgroundColor: "#F1F2F6",
          }}
          data={this.classAndProds.Products}
          renderItem={this.renderProductRow}
          keyExtractor={item => item._id}
        />
      );
    } else {
      return (
        <View>
          <Image
            style={{
              flex: 1,
              maxHeight: 140,
              height: 140,
              width: undefined
            }}
            source={Images.whereisIt}
            resizeMode='contain'
          />
          <Text style={{ color: "black", fontSize: 20, textAlign: "center" }}>
            {"There were no products to show!"}
          </Text>
        </View>
      );
    }
  };

  render = () => {
    const { navigation } = this.props;

    let className = "Unknown";
    if (this.classAndProds) {
      className = this.classAndProds.name;
    }

    return (
      <View
        style={{
          flexGrow: 1,
          backgroundColor: "#F1F2F6"
        }}
      >
        <Header
          backgroundColor={this.networkCssColor}
          outerContainerStyles={{
            height: "20%",
            marginTop: -(Dimensions.get("window").height / 100) * 3.5,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          }}
          centerComponent={{
            text: this.networkName + " - " + className.replace(/_/g, " "),
            style: {
              fontFamily: Constants.fontFamilyBold,
              fontSize: 18,
              color: "#FFFFFF"
            }
          }}
          leftComponent={{
            icon: "arrow-back",
            color: "#fff",
            onPress: () => navigation.goBack()
          }}
        />
        <View style={{ height: "85%" }}>
          <TouchableOpacity 
            style={{ alignSelf: 'flex-end', marginRight: 24, marginTop: 10}}
            activeOpacity={0.6}
            onPress={()=>this.props.navigation.navigate('ProductCreateAndEditScreen', {classId: this.classId})}
          >
            <Image
              style={{
                height: 35,
                width: 35,
              }}
              source={Images.Add2}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <ScrollView style={{ flexGrow: 1 }}>
            {this.showProductList()}
          </ScrollView>
        </View>
      </View>
    );
  };
}

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/StoreRedux");
  return {
    updateStockCollection: async stockArray => {
      console.debug("Updating store collection");
      dispatch(actions.updateStockCollection(dispatch, stockArray));
    },
    updateIndividualStock: async individualStock => {
      console.debug("Updating store collection");
      dispatch(actions.updateStockItem(dispatch, individualStock));
    }
  };
};

const mapStateToProps = state => ({
  language: state.language,
  user: state.user,
  stockAndAmendments: state.store.myStoreStocksAndAmendments
});

// function mergeProps(stateProps, dispatchProps, ownProps) {
//   return {
//     ...ownProps,
//     ...stateProps
//   };
// }

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
  // mergeProps
)(ProductStockProductDrilldown);
