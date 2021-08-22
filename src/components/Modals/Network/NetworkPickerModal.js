import Modal from "react-native-modalbox";
import React, { PureComponent } from "react";
import { ModalBox, NetworkDisplay } from "@components";
import {
  Image,
  View,
  Animated,
  Keyboard,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  I18nManager,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  GlobalStyle
} from "@common";
import { Header, Icon, Divider, List, ListItem } from "react-native-elements";
import { Images } from "@common";
import { toast, currencyFormatter } from "@app/Omni";
import HopprWorker from "../../../services/HopprWorker";
import Autocomplete from "react-native-autocomplete-input";
import Toast, { DURATION } from "react-native-easy-toast";
import ProductURLHelper from "../../../services/ProductURLHelper";
import LayoutHelper from "../../../services/LayoutHelper"
import { connect } from "react-redux";
import SoundPlayer from "react-native-sound-player";
import SizedImageItem from "../../ListItems/SizedImageItem";
import { EventRegister } from "react-native-event-listeners";
import { isIphoneX } from "react-native-iphone-x-helper";
import { showMessage, hideMessage } from "react-native-flash-message";

const { width, height } = Dimensions.get("window");
const modalWidth = width - 14;
const modalContentMaxWidth = modalWidth - 8;
const modalHeight = LayoutHelper.getDynamicModalHeight();

const styles = StyleSheet.create({
  autocompleteContainer: {
    width: modalWidth - 2,
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 2,
    paddingTop: 2,
    paddingLeft: 1,
    zIndex: 1,
    color: "black",
    borderWidth: 0,
    flexDirection: "row",
  },
  iconZoom: {
    position: "absolute",
    right: 8,
    top: 10,
    backgroundColor: "transparent",
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    marginRight: 10,
    zIndex: 9999,
  },
  wrap: {
    flex: 1,
    zIndex: 9999,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255, 1)",
    borderRadius: 6,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  modalBoxWrap: {
    position: "absolute",
    borderRadius: 6,
    top: 40, //(height * 35) / 100,
    width: (width * 96) / 100,
    height: height, //(height * 70) / 100,
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 10,
    right: I18nManager.isRTL ? 0 : null,
  },
  layoutBox: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    marginTop: 10,
  },

  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
});

class NetworkPickerModal extends PureComponent {
  constructor(props) {
    super(props);
    console.debug("In network searches modal");

    this.state = {
      latestSearchTermLocal: undefined,

      searchResult : null,
    }

    this.networkImageBaseUrl = Config.NetworkImageBaseUrl;
  }

  _updateLatestSearchTermLocal = (newTerm) => {
    this.setState({ latestSearchTermLocal: newTerm })
  }

  componentDidMount = async () => {
    console.debug("Network prod picker");
    //trigger updating results?
    //nearest products search
    //nearest products search
  };

  componentWillMount = async () => { };

  searchNetworksForNearestStores = async (lat, lng) => {
    EventRegister.emit("showSpinner");
    let nearestStores = await HopprWorker.getNearestStoresOnAllNetworks(
      lat,
      lng,
      500
    );
    EventRegister.emit("hideSpinner");
  };

  getProductAutocomplete = async (phrase) => {
    this._updateLatestSearchTermLocal(phrase);
    let test = "";
    if (phrase.length > 1) {
      //EventRegister.emit("showSpinner");
      //save what we searched for
      let result = await HopprWorker.getProductAutocomplete(phrase);
      this.setState({ searchResult: result });
      //then save the result
      this.props.updateProductAutocompleteSearchResults(phrase, result);
      this._resetCurrentlySelectedNetwork(); //make sure the bottom network bit doesn't show
      //EventRegister.emit("hideSpinner");
    }
  };

  searchNetworkForProductByName = async (phrase) => {
    EventRegister.emit("showSpinner");
    let resultData = await HopprWorker.searchNetworkForProductByName(phrase);

    console.debug("got result");
    //todo:
    //same in home view for method there
    //needs to go to redux now! - needs to be cleared when modal shuts!!!!
    this.props.updateProductAndNetworkSearchResults(resultData);
    //we want a full screen list to start each autocomplete
    if (resultData.length !== 1) {
      this._setfullScreenList(true);
      this._resetCurrentlySelectedNetwork();
    } else {
      this._setfullScreenList(false);
      this._setCurrentlySelectedNetwork(resultData[0].network);
    }
    //set autoshow the network info if there's only one row, cos there's loads of space


    EventRegister.emit("hideSpinner");
    Keyboard.dismiss();
  };

  _renderAutocompleteItem = (item, i) => {
    console.debug("Rendering item:" + item);
    return (
      <View>
        <TouchableOpacity
          onPress={() => alert("trigger main serach: item" + item)}
        >
          <Text style={{ color: "black" }}>{item}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  //FLATLIST
  _showProductAndNetworkList = () => {
    if (this.props.latestProductAndNetworkResults.length > 0) {
      console.log("+++++++products+++++++");
      console.log(this.props.latestProductAndNetworkResults);
      return (
        <FlatList
          style={{
            flexGrow: 1,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          }}
          data={this.props.latestProductAndNetworkResults}
          renderItem={(item) =>
            this._renderProductAndNetworkResultsRow(item.item)
          }
        //keyExtractor={(item) => item.product._id}
        />
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 140,
              height: 140,
              width: undefined,
            }}
            source={Images.NoOrderClipboard}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "black",
              fontSize: 12,
              textAlign: "center",
              marginTop: 5,
            }}
          >
            {
              "There were no products / networks to show! \nPlease revise your search."
            }
          </Text>
        </View>
      );
    }
  };
  _resetCurrentlySelectedNetwork = () => {
    this.props.updateCurrentlySelectedNetworkInNetworkPickerModal(undefined);
    //this.setState({ currentlySelectedNetwork: undefined });
  };

  _setCurrentlySelectedNetwork = (network) => {
    this.props.updateCurrentlySelectedNetworkInNetworkPickerModal(network);
    //this.setState({ currentlySelectedNetwork: network })
  };

  _shopNow = async () => {
    this.props.addNetworkToLocalPickerIfNotExists(this.props.currentlySelectedNetwork);
    //changes network picker ('real network')    
    await this.props.changeNetwork(this.props.currentlySelectedNetwork.networkId);
    this.closeMe();
  }

  _renderNetworkDisplay() {
    let test1 = "";

    if (typeof this.props.currentlySelectedNetwork === "undefined") {
      return null;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{
              flex: 1,
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 10,
              alignContent: "center",
              textAlign: "center",
            }}
          >
            <TouchableOpacity>
              <View style={{ flex: 1, paddingBottom: 30 }}>
                <NetworkDisplay
                  onPressShopNow={async () => await this._shopNow()}
                  network={this.props.currentlySelectedNetwork}
                  baseImageUrl={this.networkImageBaseUrl}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
  }

  _requestNewPermission = async (userId, networkId, type) => {
    let test123 = "";
    var addReslt = await HopprWorker.addNetworkUserPermissionRequest(
      userId,
      networkId,
      type
    );
    return addReslt;
  };

  addNetworkPermission = async (networkId, permType) => {
    if (
      typeof this.props.user.user !== "undefined" &&
      this.props.user.user != null
    ) {
      let permRes = await this._requestNewPermission(
        this.props.user.user.userId,
        networkId,
        permType
      );

      if (permRes.status == 200 || permRes.status == 201) {
        showMessage({
          message: "Added",
          duration: 1200,
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          description: "We added to your favourites",
          color: "white", // text color          
          autoHide: true,
          style: {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          },
          position: "top",
        });

        return permRes;
      }
      else {
        showMessage({
          message: "Sorry",
          duration: 2200,
          backgroundColor: "red", // background color
          description: "That didn't work. Please make sure you have network connectivity.",
          color: "white", // text color      
          autoHide: true,
          style: {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          },
          position: "top",
        });
      }


    }
    else {
      alert("You can't do that if you're not logged in!")
    }
  }

  /**when they click 'add' button */
  addNetworkPermissionThenNavigateToCorrectNetworkAndProduct = async (
    network,
    product,
    permType
  ) => {
    try {
      EventRegister.emit("showSpinner");
      //make sure they have an account - or redirect them to signup / login - check how it's done at cart
      console.debug("hit the actions");
      //send request anyway if user is logged in - whatever
      if (
        typeof this.props.user.user !== "undefined" &&
        this.props.user.user != null
      ) {
        let permRes = await this._requestNewPermission(
          this.props.user.user.userId,
          network.networkId,
          permType
        );
        console.debug("perm request sent - now go to network?");
      }

      if (network.visibility.toLowerCase() === "private") {
        alert(
          "We will request your addition to this private network, you'll have to wait to be accepted"
        );
      } else {
        console.debug("Logged in GO PUBLIC NETWORK");
        //update selected network to this new network

        // this.props.fetchNetworkPickerData().then(y => {
        console.debug("refresh network picker");
        this.props.changeNetwork(network.networkId).then((x) => {
          this.closeMe();
          this.props.goToScreen("DetailScreen", { product: product });
        });
        //nativate to detail view and pass product
        // });
      }
    } catch (error) {
      toast("Sorry there was an error");
    }
    finally {
      EventRegister.emit("hideSpinner");
    }

    //if successful
    //if public network then relocate:
    // - close this modal
    // - relocate to 'Home' or whatever screen is main screen - refresh available netowrks, then set current network to this new network
    // - drill down into the product that was selected
    // -

    //if private network, show toast and do nothing
  };

  /**TODO: need to add persimssion like above */
  addNetworkPermissionThenAddToCart = async (network, product, permType) => {
    //do rest of whatever

    try {
      await this.props.addCartItem(product);
      this.showToast("Added to cart!");
    } catch (error) {
      toast("Sorry there was an error adding perm.");
    }

    SoundPlayer.playSoundFile("notification1", "mp3");
  };

  _renderProductAndNetworkResultsRow = (item) => {
   if(item.id) {
     console.log(item);
     
      return (
        <SizedImageItem
          navigation={this.props.navigation}
          item={item}
          setSelectedCategory={this.props.setSelectedCategory}
          closeParentModal={this.closeMe}
          goToScreen={this.props.goToScreen}
          setCurrentlySelectedLOCALNetwork={this._setCurrentlySelectedNetwork} //this only lets the LOCAL network, not change the picker
          changeNetwork={this.props.changeNetwork}
          addNetworkPermissionThenAddToCart={
            this.addNetworkPermissionThenAddToCart
          }
          addNetworkPermissionThenNavigateToCorrectNetworkAndProduct={
            this.addNetworkPermissionThenNavigateToCorrectNetworkAndProduct
          }
          //this is just to add the network locally if they don't have an account. Will be gone when data resets
          addNetworkToLocalPickerIfNotExists={
            this.props.addNetworkToLocalPickerIfNotExists
          }
          addNetworkPermission={
            this.addNetworkPermission
          }
        />
      );

    
    }
  };

  _renderTextInputForAutocomplete = () => {
    return (
      <TextInput
        style={{
          color: "black",
          paddingLeft: 3,
          marginLeft: 3,
          paddingRight: 3,
          fontFamily: Constants.fontFamily,
          fontStyle: "italic",
          marginRight: 3,
          borderWidth: 1,
          borderColor: GlobalStyle.modalHeader.backgroundColor,
          borderRadius: 30,
          height: 50,
          backgroundColor: "white",
          width: modalContentMaxWidth
        }}
        placeholder={" What would you like?"}
        placeholderTextColor={"silver"}
        value={this.state.latestSearchTermLocal} //bound to state for quicker feel
        onChangeText={(text) => this.getProductAutocomplete(text)}
        ref={(component) => (this._textInput = component)}
      />
    );
  };

  _setfullScreenList = (newBoolValue) => {
    this.props.updateFullScreenListInNetworkPickerModal(newBoolValue);
  };

  showToast = (message) => {
    this.refs.networkPickerToast.show(message, DURATION.LENGTH_LONG);
  };
  _renderProductAutocompleteTextBox = (item) => {
    let imgSize = 30;
    let fontSize = 18;

    let desc = "";
    let imageResizeMode = "cover";

    if (item.description) {
      desc = " - " + item.description;
    }
    if (item.type == "Network") {
      imageResizeMode = "contain";
    }

    if (item.image == null || item.image == "") {
      return <Text
        style={{
          fontFamily: Constants.fontFamily,
          color: "black",
          fontSize: fontSize,
        }}
      >
        {" " + item.name + desc}
      </Text>
    }
    else {
      return (
        <View style={{ flexDirection: "row", }}>
          <View style={{
            maxHeight: imgSize,
            height: imgSize,
            width: imgSize,
            maxWidth: imgSize, borderRadius: 8, overflow: "hidden"
          }}>
            <Image
              style={{
                padding: 2,
                paddingRight: 3,
                paddingBottom: 0,
                maxHeight: imgSize,
                height: imgSize,
                width: imgSize,
                maxWidth: imgSize,
                borderRadius: 4,
              }}
              source={{ uri: item.image }}
              resizeMode={imageResizeMode}
            />
          </View>
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              color: "black",
              fontSize: fontSize,
            }}
          >
            {" " + item.name + desc}
          </Text>
        </View>
      )
    }
  }


  render = () => {
    const {
      headerText,
      openClosed,
      openMe,
      closeMe,
      css,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    //set listview height / style based on if it's 1 item or m  ore than that..
    let listViewStyle =
      this.props.latestProductAndNetworkResults.length == 1
        ? { marginTop: 45, height: 240, minHeight: 240 }
        : { marginTop: 40, height: 232, maxHeight: 232 };

    if (
      this.props.fullScreenList == true &&
      this.props.latestProductAndNetworkResults.length != 1
    ) {
      //set fullscreen
      listViewStyle = {
        marginTop: 45,
        flex: 1,
      };
    }

    return (
      //   <Modal
      //     ref={"networkPickerModal"}
      //     swipeToClose={false}
      //     animationDuration={100}
      //     backdropOpacity={Platform.OS === "android" ? 0.9 : 0.5}
      //     position="top"
      //     isOpen={this.props.openClosed}
      //     style={[styles.modalBoxWrap, css]}
      //   >
      //     <Header
      //       backgroundColor={"#FFC300"}
      //       outerContainerStyles={{ height: 45 }}
      //       rightComponent={{
      //         icon: "close",
      //         color: "#fff",
      //         onPress: () => this.props.closeMe()
      //       }}
      //       centerComponent={{
      //         text: "Network Picker Modal",
      //         style: { color: "#fff" }
      //       }}
      //     />
      //     <View style={[styles.wrap, { backgroundColor: "white" }]} />

      //     <TouchableOpacity style={styles.iconZoom} onPress={this.closeMe}>
      //       <Icon
      //         style={styles.textClose}
      //         name="close"
      //         size={22}
      //         color={"red"}
      //         backgroundColor="transparent"
      //       />
      //     </TouchableOpacity>
      //   </Modal>

      <Modal
        style={{
          height: modalHeight,
          backgroundColor: "#fff",
          borderRadius: 20,
          borderWidth: 0,
          borderColor: "hotpink",
          zIndex: 10,
          overflow: "hidden",
          width: modalWidth,
        }}

        position={"center"}
        animationDuration={100}
        ref={"networkPickerModal"}
        isOpen={this.props.openClosed}
        swipeToClose={true}
        backdrop={true}
        backdropPressToClose={true}
        onClosed={this.closeMe}
      >
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Super Search",
            style: {
              fontSize: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily: Constants.fontHeader,
            },
          }}
        />

        <View style={{ flexGrow: 1, paddingBottom: 0 }}>
          <View style={styles.autocompleteContainer}>
            <Autocomplete
              ref={"productAndNetworkAutocomplete"}
              //hideResults={false}
              listStyle={{
                fontSize: 12,
                marginLeft: 20,
                paddingBottom: 20,
                borderTopWidth: 0.5,
                maxHeight: modalHeight - 80,
                borderWidth: 1.2,
                backgroundColor: "white",
                borderColor: GlobalStyle.modalBGcolor.backgroundColor,
                overflow: "hidden",
                width: modalWidth - 20,
              }}
              placeholder="Enter your search..."
              data={this.props.latestProductAutocompleteSearchResults}
              defaultValue={this.state.latestSearchTermLocal}
              inputContainerStyle={{
                // color: "black",
                fontSize: 18,
                borderWidth: 0,
              }}
              containerStyle={{
                borderWidth: 0,
                borderColor: "white",
              }}
              clearButtonMode={"always"}
              onChangeText={async (text) => {
                this._updateLatestSearchTermLocal(text);
                clearTimeout(this.productAutocompleteTimer);
                this.productAutocompleteTimer = setTimeout(async () => {
                  await this.getProductAutocomplete(text);
                }, 500);
              }
              }
              renderTextInput={() => this._renderTextInputForAutocomplete()}
              flatListProps={{
                keyExtractor: (_, idx) => idx,
                renderItem: (item) => (
                  <View style={{ backgroundColor: "white" }}>
                    <TouchableOpacity
                      onPress={async () => {
                        //get prods and nets
                        try {
                          EventRegister.emit("showSpinner");
                          if (item.item.type == "Product") {
                            console.log("++++++++product clicked++++", item.item);
                            if(!item.item.id && this.state.searchResult) {
                              console.log("showing whole list+++");
                              this.props.updateProductAndNetworkSearchResults(this.state.searchResult);
                            } else {
                              this.searchNetworkForProductByName(item.item.name);
                            }
                            console.debug("that's done");
                            //clear results                        
                          }
                          else if (item.item.type == "Class") {
                            console.log("++++++++class clicked");
                            try {
                              let singleClassResult = await HopprWorker.getCategory(item.item.id);
                              //go to category scren                                           
                              this.props.changeNetwork(singleClassResult[0].networkId).then((x) => {
                                //EventRegister.emit("resetStacksAndGo")
                                this.closeMe();
                                this.props.setSelectedCategory(singleClassResult[0]);
                                setTimeout(() => {
                                  this.props.goToScreen("CategoryScreen", { selectedCategory: singleClassResult[0] });
                                }, 500);

                              });
                            } catch (error) {
                              alert("Sorry, we couldn't do that!");
                            }
                          }
                          else if (item.item.type == "Network") { //just do same as product for now
                            console.log("++++++++network clicked");
                            this.searchNetworkForProductByName(item.item.name);
                          }
                          else {
                            // alert("Sorry not sure what happened...?");
                            console.log("+++++++++++++nothing clicked");
                          }
                        } catch (error) {
                          toast(
                            "Couldn't get autocomplete data - maybe no connection?"
                          );
                        }
                        finally {
                          this.props.updateProductAutocompleteSearchResults(
                            this.props.latestProductAutocompleteSearchTerm,
                            [] //clear results for choice list once a selection is made, but keep same search tems to show in modal
                          );
                          EventRegister.emit("hideSpinner");
                        }
                      }} 
                    >
                      {this._renderProductAutocompleteTextBox(item.item)}
                    </TouchableOpacity>
                  </View>
                ),
              }}
            />

            {/* RENDER FIRST CART BUTTON */}
            <View
              style={{
                postion: "absolute",
                top: 5,
                right: Platform.OS == "android" ? 8 : 92,
                zIndex: 99996
              }}
            >
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                zIndex: 99997
              }}>
                <View
                  style={{
                    paddingRight: 3,
                    marginRight: 4,
                    zIndex: 99998
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      this.props.goToScreen("CartScreen", null);
                      this.closeMe();
                    }}
                  >
                    <Image
                      style={{
                        alignSelf: "center",
                        margin: 0,
                        maxHeight: 38,
                        height: 38,
                        width: 38,
                        zIndex: 99999
                      }}
                      source={Images.NewAppReskinIcon.Cart}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    // alignItems: "center",
                    // alignContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      this._updateLatestSearchTermLocal("");
                      this.props.clearProductAutocompleteSearchTerm();
                      this.props.updateProductAndNetworkSearchResults([]);
                      this.props.updateProductAutocompleteSearchResults("", []);
                      this._resetCurrentlySelectedNetwork();
                      this._setfullScreenList(true)
                    }}
                  >
                    {/* <Image
                      style={{
                        alignSelf: "center",
                        margin: 0,
                        maxHeight: 38,
                        height: 38,
                        width: 38,
                        zIndex:99999
                      }}
                      source={Images.Close3}
                      resizeMode="contain"
                    /> */}
                    <View style={GlobalStyle.quickSearchClearButton,
                    {
                      backgroundColor: GlobalStyle.modalHeader.backgroundColor,
                      borderRadius: 30,
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      zIndex: 99999
                    }}><Text style={{ color: "black", fontSize: 24, fontFamily: Constants.fontFamilyBold }}>X</Text></View>
                  </TouchableOpacity>
                </View>
                {/* <Text
                style={{ textAlign: "center", fontSize: 8, color: "black" }}
              >
                {"To Cart"}
              </Text> */}
              </View>
            </View>


          </View>
          {/* ITEM LISTING VIEW */}

          <ScrollView style={{ flex: 1, marginTop: 10 }}>
            <TouchableOpacity>
              <View style={listViewStyle}>
                <Text
                  style={{
                    color: "silver",
                    marginTop: 10,
                    margin: 5,
                    fontFamily: Constants.fontFamilyBold,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"SEARCH RESULTS: " +
                    (this.props.latestProductAndNetworkResults.length > 0 ? this.props.latestProductAndNetworkResults.length - 1 : "0")
                  }
                </Text>
                {this._showProductAndNetworkList()}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* NETWORK INFO VIEW */}
          {this._renderNetworkDisplay(this.props.currentlySelectedNetwork)}
        </View>
        <Toast
          ref="networkPickerToast"
          style={{ backgroundColor: "black" }}
          position="bottom"
          positionValue={200}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={0.8}
          textStyle={{ color: "white" }}
        />
      </Modal>
    );
  };
}
const mapDispatchToProps = (dispatch) => {
  // const modalActions = require("@redux/ModalsRedux");
  // const locationActions = require("@redux/LocationRedux");
  const CartRedux = require("@redux/CartRedux");
  const networkActions = require("@redux/CategoryRedux"); //saves latest picked network
  const modalActions = require("@redux/ModalsRedux");

  return {
    setSelectedCategory: (category) => {
      console.debug("stop");
      dispatch(networkActions.actions.setSelectedCategory(category))
    },
    clearProductAutocompleteSearchTerm: () => {
      modalActions.actions.clearProductAutocompleteSearchTerm(dispatch);
    },
    // updateProductAutocompleteSearchTerm: (newTerm) => {
    //   modalActions.actions.updateProductAutocompleteSearchTerm(dispatch, newTerm);
    // },
    addCartItem: (product) => {
      CartRedux.actions.addCartItem(dispatch, product, null);
    },
    changeNetwork: async (passedNetworkId) => {
      try {
        console.debug("Chnaging netowrk");
        EventRegister.emit("resetStacksAndGo");
        await networkActions.actions.resetCategories(dispatch); //cleans out cats
        await networkActions.actions.fetchCategories(dispatch, passedNetworkId);
      } catch (error) {
        console.debug("Couldn't change network");
      }
    },
    fetchNetworkPickerData: async () => {
      console.debug("getting picker data");
      networkActions.actions.fetchNetworkPickerData(dispatch);
    },
    addNetworkToLocalPickerIfNotExists: (newNet) => { //this is not async!
      console.debug("getting picker data");
      networkActions.actions.addNetworkToLocalPickerIfNotExists(dispatch, newNet);
    },
    updateProductAutocompleteSearchResults: (
      newSearchTerm,
      newSearchResults
    ) => {
      console.debug("About to update results");
      modalActions.actions.updateProductAutocompleteSearchResults(
        dispatch,
        newSearchTerm,
        newSearchResults
      );
    },
    updateProductAndNetworkSearchResults: (newResults) => {
      console.debug("About to update results++++++++");
      modalActions.actions.updateProductAndNetworkSearchResults(
        dispatch,
        newResults
      );
    },
    updateCurrentlySelectedNetworkInNetworkPickerModal: (newNet) => {
      console.debug("About to update results");
      modalActions.actions.updateCurrentlySelectedNetworkInNetworkPickerModal(
        dispatch,
        newNet
      );
    },
    updateFullScreenListInNetworkPickerModal: (fullScreenListBool) => {
      console.debug("About to update results");
      modalActions.actions.updateFullScreenListInNetworkPickerModal(
        dispatch,
        fullScreenListBool
      );
    },
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    modalsArray: state.modals.modalsArray,
    //super search modal fields
    latestProductAutocompleteSearchTerm:
      state.modals.latestProductAutocompleteSearchTerm,
    latestProductAutocompleteSearchResults:
      state.modals.latestProductAutocompleteSearchResults,
    latestProductAndNetworkResults: state.modals.latestProductAndNetworkResults,
    currentlySelectedNetwork: state.modals.currentlySelectedNetwork, //this is INFO network for NetworkDisplay
    fullScreenList: state.modals.fullScreenList, //bool - is open or not
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null
)(withTheme(NetworkPickerModal));
