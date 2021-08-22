import styles from "./styles";
import React, { PureComponent, Component } from "react";
import { toast } from "@app/Omni";
import {
  Color,
  Images,
  Languages,
  Config,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Switch,
  Picker,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
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

import Autocomplete from "react-native-autocomplete-input";
import { EventRegister } from "react-native-event-listeners";
import RNPickerSelect from "react-native-picker-select";
import { NoFlickerImage } from "react-native-no-flicker-image";
import FlashMessage, {
  showMessage,
  hideMessage
} from "react-native-flash-message";
import { forEach } from "lodash";

const defaultState = {
  productStockCount: 0, //to keep tabs on added stocks
  productClassList: [],
  filteredList: [],
  selectedNetwork: undefined,
  selectedNetworkId: undefined,
  myNetworks: [],
  storeStocksAndAmendments: undefined, //this is top level store with nested arrays
  categoryToggleList: []
};

const { width, height } = Dimensions.get("window");
/**Allows the adjustment of product stocks */
class ProductStock extends Component {
  constructor(props) {
    console.debug("In product stock view");
    super(props);

    // this.state = defaultState;

    this.state = {
      productStockCount: 0, //to keep tabs on added stocks
      productClassList: [],
      filteredList: [],
      selectedNetwork: undefined,
      selectedNetworkId: undefined,
      myNetworks: [],
      storeStocksAndAmendments: undefined, //this is top level store with nested arrays
      categoryToggleList: [],
      loadFired: false,
      latestPickerDestinationText: "Nowhere",
      pickedLatLng: undefined,
      currentSearchText: "",
      autocompletePossibleResults: [], //for autocomplete
      currentAutoSearchTerm: "" //for autocomplete
    };
  }

  _resetDefaultStateOnScreenLeave = (
    prevSelectedNetworkId,
    prevSelectedNetwork
  ) => {
    this.setState(defaultState, () => {
      this.setState({
        selectedNetwork: prevSelectedNetwork,
        selectedNetworkId: prevSelectedNetworkId
      });
    });
  };

  _generateClassCategoryToggleValues = (productClassList, storeStocks) => {
    let toggleArray = [];

    try {
      productClassList.map(x => {
        let toggleValue = false;
        //check if any proudcts have an enabled 'stock' - if they do, enable the category
        x.Products.map(prod => {
          let stockForThisProd = storeStocks[0].productStocks.find(
            stock => stock.productId == prod._id
          );
          if (stockForThisProd) {
            if (stockForThisProd.inStock) {
              toggleValue = true;
            }
          }
        });

        let aToggle = {
          classId: x._id,
          toggleValue: toggleValue
        };

        toggleArray.push(aToggle);
      });
    } catch (error) {
      console.debug(error);
    }

    //now add default entries for anything that wasn't created
    productClassList.map(x => {
      let togExist = toggleArray.find(x => x.classId == x._id);
      if (typeof togExist === "undefined") {
        toggleArray.push({
          classId: x._id,
          toggleValue: false
        });
      }
    });

    this.setState({ categoryToggleList: toggleArray });
  };

  _toggleCategorySwitch = async catId => {
    //ccheck if it's on or off
    let selectedCat = this.state.categoryToggleList.find(
      x => x.classId == catId
    );

    let currentValue = selectedCat.toggleValue;
    if (currentValue) {
      //it's currently on, turn it off
      let resopnse = await HopprWorker.turnProductStockCategoryOff(catId);
      this._updateCategoryToggleList(selectedCat, false); //this is our fake toggles
      this._updateCategoryOnOrOffInReduxProductStocks(false, catId);
    } else {
      //it's currently off, turn it on
      let resopnse = await HopprWorker.turnProductStockCategoryOn(catId);
      this._updateCategoryToggleList(selectedCat, true);
      this._updateCategoryOnOrOffInReduxProductStocks(true, catId);
    }

    //turn all items off or on, then push the entire list to redux
  };

  componentDidUpdate = (prevProps, prevState) => {
    //update our generated toggle list
    let firstCount = 0;
    if (
      this.state.productClassList &&
      typeof this.props.stockAndAmendments !== "undefined"
    ) {
      if (this.props.stockAndAmendments.length > 0) {
        //check if the count of the productStocks has been updated, if so, update our generated list
        if (this.state.productStockCount == 0) {
          //hasn't been set, set it

          if (
            this.props.stockAndAmendments[0].productStocks.length != 0 &&
            firstCount == 0
          ) {
            //will cause set state loop - check length is not zero
            let firstCount =
              this.props.stockAndAmendments[0].productStocks.length;
            this.setState({ productStockCount: firstCount });
          }
        }

        let newCOunt = this.props.stockAndAmendments[0].productStocks.length;
        if (newCOunt != this.state.productStockCount) {
          //regnereate and update count
          this._generateClassCategoryToggleValues(
            this.state.productClassList,
            this.props.stockAndAmendments
          );

          this.setState({ productStockCount: newCOunt });
        }
      }
    }
  };
  _updateCategoryOnOrOffInReduxProductStocks = (onOrOff, classId) => {
    //get all stocks for passed cat, copy whole store array, send to redux
    let productClass = this.state.productClassList.find(x => x._id == classId);
    let copiedStocksAndAmendments = [...this.props.stockAndAmendments];

    productClass.Products.map(product => {
      let prodIdToMatch = product._id;
      let stock = copiedStocksAndAmendments[0].productStocks.find(
        st => st.productId == prodIdToMatch
      );

      if (typeof stock !== "undefined") {
        stock.inStock = onOrOff; //set the bool
        //put in back in array
        let indexOfItem = copiedStocksAndAmendments[0].productStocks.findIndex(
          el => el._id === stock._id
        );
        copiedStocksAndAmendments[0].productStocks[indexOfItem] = stock;
      }
    });

    //push new values to redux
    this.props.updateStockCollection(copiedStocksAndAmendments);
  };

  _updateCategoryToggleList = async (
    selectedCat,
    newValue //original items
  ) => {
    let copiedArray = [...this.state.categoryToggleList];
    let indexOfItem = copiedArray.findIndex(
      el => el.classId === selectedCat.classId
    );
    copiedArray[indexOfItem].toggleValue = newValue;
    this.setState({ categoryToggleList: copiedArray });
    await this.getStockAndAmendments(this.props.user.user.storeId);
  };

  getClassesAndProducts = async () => {
    let categoriesResponse = await HopprWorker.getCategoriesAndNestedProducts(
      this.state.selectedNetworkId
    );
    let categories = categoriesResponse.data.value;
    let sortedCats = categories.sort((a, b) => (a.name > b.name ? 1 : -1));
    let evenMoreSortedCats = sortedCats.map(cat => {
      let sortedProds = cat.Products.sort((a, b) => (a.name > b.name ? 1 : -1));
      cat.Products = sortedProds;
      return cat;
    });
    this.setState(
      {
        productClassList: evenMoreSortedCats,
        filteredList: evenMoreSortedCats
      },
      () => console.debug("updated categories")
    );
  };

  getStockAndAmendments = async (storeId, networkId) => {
    let stockAndAmendments = await HopprWorker.getProductStockAndAmendments(
      storeId,
      networkId
    );
    this.props.updateStockCollection(stockAndAmendments);
    return stockAndAmendments;
  };

  renderCategoryRow = ({ item }) => {
    const { user, navigation } = this.props;
    let toggleCatValue = this.state.categoryToggleList.find(
      x => x.classId == item._id
    );

    let actualTogValu = false;
    if (typeof toggleCatValue !== "undefined") {
      actualTogValu = toggleCatValue.toggleValue;
    }

    let imageUrl =
      item.image === undefined || item.image === null || item.image === ""
        ? "https://booza.store:44300/images/clientcategoryicons/default/vegetables.png"
        : item.image;

    let numberOfProds = item.Products.length;
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
        key={item._id}
        roundAvatar
        subtitleNumberOfLines={1}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={
          <View
            style={{
              marginHorizontal: 5
            }}
          >
            <Text
              style={{
                fontFamily: Constants.fontFamilyMedium,
                color: '#7986A0',
                fontSize: 14
              }}
            >
              {`Category: ${item.name.replace(/_/g, " ")}`}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7986A0",
                fontFamily: Constants.fontFamily
              }}
            >{`PRODUCTS: ${numberOfProds}`}</Text>
          </View>
        }
        avatar={{
          uri: imageUrl,
          style: { marginRight: 5 }
        }}
        switched={actualTogValu}
        onSwitch={() => {
          console.debug("About to toggle");
          this._toggleCategorySwitch(item._id);
        }}
        badge={{
          value: numberOfProds,
          textStyle: { color: "#7986A0" },
          style: { marginRight: 10 },
          containerStyle: { marginRight: 10, backgroundColor: "#F1F2F6" }
        }}
        switchButton={true}
        hideChevron={true}
        switchTintColor={"grey"}
        switchThumbTintColor={
          actualTogValu === false ? "white" : Color.reskin.primary
        }
        switchOnTintColor={"#DEE5EE"}
        switch={{
          ios_backgroundColor: "#DEE5EE"
        }}
        onPress={() => {
          console.debug("Going to drill down");
          let classAndProds = this.state.productClassList.find(
            x => x._id == item._id
          );
          //get stocks in this category
          navigation.navigate("ProductStockProductDrillDownScreen", {
            classId: item._id,
            classAndProds: classAndProds,
            networkName: this.state.selectedNetwork.storeName,
            networkCssColor: this._getCurrentNetworkCssColorOrDefault()
          });
        }}
        onLongPress={()=> {
          console.log('on long press');
          navigation.navigate("ProductClassCreateAndEditScreen", {item: item});
        }}
      />
    );
  };

  updateStockAndAmendmentsFromServer = () => {
    this.getStockAndAmendments(
      this.props.user.user.storeId,
      this.state.selectedNetworkId
    ).then(apiStocksAndAmendments => {
      //generate temp toggles based on api stock data
      this._generateClassCategoryToggleValues(
        this.state.productClassList,
        apiStocksAndAmendments
      );
    });
  };

  _getProdsAndStocksFromApi = async () => {
    try {
      console.debug("Okayyyyyyyyyyy");
      await this.getClassesAndProducts();
      this.updateStockAndAmendmentsFromServer();
    } catch (error) {
      alert("couldnt load products and stocks");
    }
  };

  load = async () => {
    const { user } = this.props;

    try {
      EventRegister.emit("showSpinner");
      console.debug("Gettings netowrks");
      let myNetsAndPerms = await HopprWorker.getAllNetworksAndPermissions(
        this.props.user.user.id,
        "Store"
      );
      console.debug("got my nets");
      if (myNetsAndPerms.length > 0) {
        let networkArray = [];

        myNetsAndPerms.map(permAndNet => {
          networkArray.push(permAndNet.network);
        });

        //if it's first load, set to first network
        if (typeof this.state.selectedNetworkId == "undefined") {
          this.setState({
            selectedNetworkId: networkArray[0].networkId,
            selectedNetwork: networkArray[0]
          });
        }

        this.setState(
          {
            myNetworks: networkArray
          },
          async () => await this._getProdsAndStocksFromApi()
        );
      } else {
        alert(
          "There was a problem getting networks - doesn't look like you have any with store permisisons!"
        );
      }
    } catch (error) {
      alert("Couldn't load stocks, sorry. Try again with connectivity?");
    } finally {
      EventRegister.emit("hideSpinner");
    }
  };

  unload = async () => {
    //reset state!
    this._resetDefaultStateOnScreenLeave(
      this.state.selectedNetworkId,
      this.state.selectedNetwork
    );
  };

  componentWillUnmount = () => {
    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();
    } catch (error) {}
  };

  componentDidMount = async () => {
    this.unsubscribeWillFocus = this.props.navigation.addListener(
      "willFocus",
      this.load
    );
    this.unsubscribeLoseFocus = this.props.navigation.addListener(
      "willBlur",
      this.unload
    );

    await this.load();
  };

  //when category gets clicked
  showProductList = allProdsForSelectedClass => {
    if (allProdsForSelectedClass.length > 0) {
      return (
        <FlatList
          style={{ flexGrow: 1, backgroundColor: "#F1F2F6" }}
          data={allProdsForSelectedClass}
          renderItem={this.renderCategoryRow}
          keyExtractor={item => item._id}
        />
      );
    } else {
      return (
        <View style={{ flex: 1, minHeight: 200, height: 200 }}>
          <Image
            style={{
              maxHeight: 140,
              minHeight: 140,
              height: 140,
              width: 140,
              minWidth: 100
            }}
            source={Images.NewAppReskinGraphics.RoadTrip}
            resizeMode='contain'
          />
          <Text
            style={{
              marginTop: 4,
              color: "black",
              fontSize: 20,
              textAlign: "center"
            }}
          >
            {"There were no stocks to show!"}
          </Text>
        </View>
      );
    }
  };

  handleTextChange = text => {
    this.setState({
      currentSearchText: text
    });
    if (text === "") {
      this.setState({
        filteredList: this.state.productClassList,
        autocompletePossibleResults: []
      });
    } else {
      this.searchCategories(text);
    }
  };

  searchCategories = text => {
    let filtered = [];
    this.state.productClassList.filter(item => {
      if (item.name.toLowerCase().includes(text.toLowerCase())) {
        filtered.push(item.name);
        this.setState({
          autocompletePossibleResults: filtered
        });
      } else {
        item.Products.filter(item => {
          if (item.name.toLowerCase().includes(text.toLowerCase())) {
            filtered.push(item.name);
            this.setState({
              autocompletePossibleResults: filtered
            });
          }
        });
      }
    });
    if (this.state.currentSearchText === "") {
      this.setState({
        autocompletePossibleResults: []
      });
    }
  };

  getCategories = text => {
    let filtered = [];
    let classId = null;
    console.log(text);
    this.state.productClassList.filter(item => {
      if (
        item.name.toLowerCase().includes(text.toLowerCase()) &&
        filtered.indexOf(item) === -1
      ) {
        filtered.push(item);
        console.log(item.name);
        this.setState({
          filteredList: filtered
        });
      } else {
        item.Products.filter(item => {
          if (item.name.toLowerCase() == text.toLowerCase()) {
            classId = item.classId;
            this.state.productClassList.filter(item => {
              if (item._id == classId && filtered.indexOf(item) === -1) {
                filtered.push(item);
                this.setState({
                  filteredList: filtered
                });
              }
            });
          }
        });
      }
    });
    if (this.state.currentSearchText === "") {
      this.setState({
        filteredList: this.state.productClassList
      });
    }
  };

  showCategoryList = () => {
    if (this.state.filteredList.length > 0) {
      return (
        <FlatList
          style={{ flexGrow: 1, padding: 10, backgroundColor: "#F1F2F6" }}
          data={this.state.filteredList}
          renderItem={this.renderCategoryRow}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
        />
      );
    } else {
      return (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            style={{
              alignSelf: "center",
              minHeight: 140,
              height: 140,
              minWidth: 140
            }}
            source={Images.NewAppReskinGraphics.RoadTrip}
            resizeMode='contain'
          />
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              color: "black",
              fontSize: 20,
              textAlign: "center"
            }}
          >
            {"There were no categories to show!"}
          </Text>
        </View>
      );
    }
  };

  _renderNetworkLogo = () => {
    if (typeof this.state.selectedNetwork !== "undefined") {
      let imgUrl =
        Config.NetworkImageBaseUrl + this.state.selectedNetwork.storeLogoUrl;
      return (
        <NoFlickerImage
          style={{
            width: 40,
            height: 40,
            resizeMode: "contain"
          }}
          source={{
            uri: imgUrl
          }}
          resizeMode='contain'
        />
      );
    }
  };

  _changeNetworkPickerValue = itemValue => {
    let selNet = this.state.myNetworks.find(x => x.networkId == itemValue);
    this.setState(
      { selectedNetworkId: itemValue, selectedNetwork: selNet },
      () => this._getProdsAndStocksFromApi()
    );

    //update all permissions
  };

  _getCurrentNetworkCssColorOrDefault = () => {
    if (typeof this.state.selectedNetwork == "undefined") {
      return "hotpink";
    }

    return this.state.selectedNetwork.networkSettings[0].cssMainScreenBarColor;
  };

  _renderNetworkPickerRow = () => {
    if (
      this.state.myNetworks.length > 0 &&
      typeof this.state.selectedNetwork !== "undefined"
    ) {
      const pickerItems = this.state.myNetworks.map((item, index) => ({
        value: item.networkId,
        label: item.storeName
      }));

      return (
        <RNPickerSelect
          placeholder={{
            label: "Select Network...",
            value: -1
          }}
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: "orange",
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            inputIOS: {
              textAlign: "center",
              color: "silver"
            },
            inputAndroid: {
              textAlign: "center",
              color: "silver"
            }
          }}
          inputStyle={{
            textAlign: "center",
            color: "white"
          }}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue != -1) this._changeNetworkPickerValue(itemValue);
          }}
          value={this.state.selectedNetworkId}
          items={pickerItems}
        />
      );
    }
  };
  ////////////////////////////////////
  _renderTextInputForAutocomplete = () => {
    return (
      <TextInput
        style={{
          flex: 1,
          fontSize: 14,
          borderRadius: 50,
          fontFamily: Constants.fontFamily,
          color: GlobalStyle.modalTextBlackish.color,
          backgroundColor: "white",
          zIndex: 99999,
          marginLeft: 10,
          maxWidth: "90%"
        }}
        returnKeyType='next'
        placeholder={"What are you looking for?"}
        placeholderStyle={{ fontFamily: Constants.fontFamily }}
        value={this.state.currentSearchText}
        onChangeText={text => this.handleTextChange(text)}
        // ref={el => (this._addressTextInput = el)}
      />
    );
  };
  ////////////////////////////////////
  _renderAutocomplete = () => {
    let autocompleteWidth = width;
    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#FFFFFF",
          borderColor: "#DEE5EE",
          borderWidth: 1,
          alignItems: "center",
          borderRadius: 50,
          justifyContent: "center",
          marginVertical: 10
        }}
      >
        <Autocomplete
          data={this.state.autocompletePossibleResults}
          inputContainerStyle={{
            zIndex: 999,
            elevation: 999,
            borderWidth: 0,
            height: 40,
            width: "90%"
          }}
          containerStyle={{
            width: "90%"
          }}
          listStyle={{
            borderWidth: 1,
            borderColor: "#DEE5EE",
            backgroundColor: "rgba(255,255,255,1)",
            borderBottomWidth: 1,
            // paddingTop: "5%",
            borderTopWidth: 0,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            width: (Dimensions.get("window").width / 100) * 95,
            marginTop: "-5%",
            marginLeft: 2,
            maxHeight: 200
          }}
          clearButtonMode={"always"}
          placeholder={"What are you looking for?"}
          renderTextInput={() => this._renderTextInputForAutocomplete()}
          renderItem={(item, i) => (
            <TouchableOpacity
              onPress={async () => {
                try {
                  this.setState({
                    currentSearchText: item.item,
                    autocompletePossibleResults: []
                  });
                  this.getCategories(item.item);
                  await this.getPossibleAddresses(item.item);
                  this._copyLatestPickerDestinationTextToAddressInput(
                    item.item
                  );
                } catch (error) {
                  this.setState({
                    currentSearchAddressText: item.item,
                    autocompletePossibleResults: []
                  });
                } finally {
                }
              }}
            >
              <View
                style={{
                  borderBottomColor: "#DEE5EE",
                  borderBottomWidth: 1,
                  width: "100%",
                  marginVertical: 5
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  borderWidth: 0,
                  padding: 5,
                  borderRadius: 20,
                  maxWidth: autocompleteWidth + 900
                }}
              >
                <Text
                  style={{
                    fontFamily: Constants.fontFamily,
                    color: GlobalStyle.modalTextBlackish.color,
                    maxWidth: autocompleteWidth + 500,
                    fontSize: 14
                  }}
                >
                  {item.item}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#DEE5EE",
            width: 40,
            height: 40,
            borderRadius: 100,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
          onPress={() => this.getCategories(this.state.currentSearchText)}
        >
          <Image
            source={require("../../../assets/icons/Search.png")}
            style={{ width: 20, height: 20, tintColor: "#95A3AF" }}
          />
        </TouchableOpacity>
      </View>
    );
  };
  ///////////////////////////////////

  render() {
    const { navigation } = this.props;
    console.debug("In stocks");
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({
            autocompletePossibleResults: []
          });
          Keyboard.dismiss;
        }}
      >
        <View
          style={{
            flexGrow: 1,
            backgroundColor: "#F1F2F6"
            //paddingBottom: 150
          }}
        >
          <Header
            // backgroundColor={this._getCurrentNetworkCssColorOrDefault()}
            backgroundColor={GlobalStyle.primaryColorDark.color}
            outerContainerStyles={styles.headerContainer}
            centerComponent={
              <View>
                <Text
                  style={{
                    fontFamily: Constants.fontFamilyBold,
                    fontSize: 18,
                    color: "#FFFFFF"
                  }}
                >
                  Store: Product Stock
                </Text>
                <View style={styles.controls}>
                  {this._renderNetworkLogo()}
                  <TouchableOpacity style={styles.status}>
                    {this._renderNetworkPickerRow()}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ left: -2 }}
                    onPress={() => {
                      showMessage({
                        style: {
                          borderBottomLeftRadius: 20,
                          borderBottomRightRadius: 20
                        },
                        position: "top",
                        message: "These are your store stocks",
                        description:
                          "Adjust what you sell and don't sell here. Toggle on for 'selling' and off for 'out of stock'",
                        backgroundColor: "black", // background color
                        color: "white", // text color,
                        autoHide: true,
                        duration: 10000
                      });
                    }}
                  >
                    <Image
                      source={Images.NewAppReskinIcon.Info}
                      style={{ width: 25, height: 25 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ left: -6 }}
                    onPress={() => {
                      Platform.OS == "android"
                        ? alert("Not yet enabled")
                        : this.props.navigation.navigate(
                            "BarcodeScannerScreen"
                          );
                    }}
                  >
                    <Image
                      source={Images.NewWhiteIcons.Barcode}
                      style={{ width: 25, height: 25 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            }
            leftComponent={
              <NoFlickerImage
                source={require("../../../assets/img/OrderConfirm.png")}
                style={{
                  width: 90,
                  height: 90,
                  marginLeft: -10,
                  marginBottom: -15
                }}
              />
            }
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: (Dimensions.get("window").width / 100) * 95,
                alignSelf: "center",
                zIndex: 99999,
                elevation: 99999
              }}
            >
              {this._renderAutocomplete()}
            </View>
            <TouchableOpacity 
              style={{ alignSelf: 'flex-end', marginRight: 24, marginBottom: 10}}
              activeOpacity={0.6}
              onPress={()=>this.props.navigation.navigate('ProductClassCreateAndEditScreen')}
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
            <View style={{ flex: 1, zIndex: 1 }}>
              {this.showCategoryList()}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = state => {
  console.debug("what's coming from state");
  return {
    user: state.user,
    store: state.store,
    stockAndAmendments: state.store.myStoreStocksAndAmendments
  };
};

const mapDispatchToProps = dispatch => {
  const { actions } = require("@redux/StoreRedux");
  return {
    updateStockCollection: async stockArray => {
      console.debug("Updating store collection");
      dispatch(actions.updateStockCollection(dispatch, stockArray));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ProductStock));
