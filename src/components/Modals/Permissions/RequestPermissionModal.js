import Modal from "react-native-modalbox";
import React, { Component } from "react";
import { ModalBox, NetworkDisplay } from "@components";
import {
  Image,
  View,
  Animated,
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
import { connect } from "react-redux";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
} from "@common";
import { Header, Icon, Divider, List, ListItem } from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import HopprWorker from "../../../services/HopprWorker";
import Autocomplete from "react-native-autocomplete-input";
import ShopButton from "@components";
import Toast, { DURATION } from "react-native-easy-toast";
import LayoutHelper from "../../../services/LayoutHelper"
import { EventRegister } from "react-native-event-listeners";


const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  autocompleteContainer: {    
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 2,
    zIndex: 1,
    color: "black",
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

class RequestPermissionModal extends Component {
  constructor(props) {
    super(props);
    console.debug("In request permissions modal");

    this.networkImageBaseUrl = Config.NetworkImageBaseUrl;
    this.state = {
      userId: undefined,
      latestNetworkSearchResults: [],
      latestSearchTerm: "",
      latestNetworkAutocompleteSearchResults: [],
      currentlySelectedNetwork: undefined,
    };
  }

  componentDidUpdate = (prevProps, prevState) => { };

  componentDidMount = async () => {
    //trigger updating results?
    //nearest products search
    //nearest products search
  };

  componentWillMount = async () => { };


  _clearCurrentlySelectedNetwork=()=>{
    this.setState({currentlySelectedNetwork: undefined})
  }

  _shopNow = async (network)=>{
    EventRegister.emit("showSpinner");
    this.closeMe();
    this.props.addNetworkToLocalPickerIfNotExists(network);
    //changes network picker ('real network')    
    await this.props.changeNetwork(network.networkId);    
    EventRegister.emit("hideSpinner");
  }

  _renderNetworkDisplay() {
    let test1 = "";
    if (typeof this.state.currentlySelectedNetwork === "undefined") {
      return <View style={{ height: 180 }} />;
    } else {
      return (
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
        <View style={{flex:1, paddingBottom:40}}>
     
          <NetworkDisplay
            onPressShopNow={async ()=>await this._shopNow(this.state.currentlySelectedNetwork)}
            network={this.state.currentlySelectedNetwork}
            baseImageUrl={this.networkImageBaseUrl}
          />
          
        </View>
        </TouchableOpacity>
        </ScrollView>
      );
    }
  }

  addPermissionAndTellUser = async (userId, networkId, type) => {
    let permRes = await this._requestNewPermission(userId, networkId, type);
    if (typeof permRes === "undefined") {
      this.showToast(
        "That didn't work - sorry - maybe you already added that network?"
      );
    }
    if (permRes.status == 200) {
      this.showToast("Yay - you added successfully");
      //was it private or public - then tell user what happened
    } else {
      //it failed
      this.showToast("That didn't work - sorry");
    }
  };

  _requestNewPermission = async (userId, networkId, type) => {
    let test123 = "";
    var addReslt = await HopprWorker.addNetworkUserPermissionRequest(
      userId,
      networkId,
      type
    );
    return addReslt;
  };

  _renderNetworkResultsRow = ({ item }) => {
    let networkImageUrl = this.networkImageBaseUrl + item.storeLogoUrl;
    return (
      <ListItem
        rightIcon={
          <View style={{
            alignContent: "center", 
            alignItems: "center",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          }}>
               {/* FINAL BIG ONE TO ADD AND GO */}
               <View style={{ alignContent: "center", alignItems: "center" }}>
              <TouchableOpacity
                onPress={async () => {
                  console.debug("add and go");
                  await this._shopNow(item)
                }}
              >
                <Image
                  style={{
                    marginTop: 3,
                    maxHeight: 80,
                    height: 60,
                    width: 90,
                    maxWidth: 90,
                  }}
                  source={Images.ShopAndGoNow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontStyle: "italic",
                  color: "grey",
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                {"Shop Now!"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignContent: "center",
                alignItems: "center",
                padding: 3,
                margin: 3,
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  console.debug("test");
                  await this.addPermissionAndTellUser(
                    this.props.user.user.id,
                    item.networkId,
                    "Customer"
                  );
                }}
              >
                <Image
                  style={{
                    maxHeight: 28,
                    height: 28,
                    width: 28,
                    maxWidth: 28,
                  }}
                  source={Images.AddShopper1}
                  resizeMode="contain"
                />
                    <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Fave"}
                  </Text>
              </TouchableOpacity>
              <Text
                style={{ marginRight: 3, marginLeft: 3, color: "silver" }}
              >
                {"|"}
              </Text>
              <TouchableOpacity
                onPress={async () =>
                  await this.addPermissionAndTellUser(
                    this.props.user.user.id,
                    item.networkId,
                    "Driver"
                  )
                }
              >
                <Image
                  style={{
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                  }}
                  source={Images.AddDriver2}
                  resizeMode="contain"
                />
                    <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Drive"}
                  </Text>
              </TouchableOpacity>
              <Text
                style={{ marginRight: 3, marginLeft: 3, color: "silver" }}
              >
                {"|"}
              </Text>
              <TouchableOpacity
                onPress={async () =>
                  await this.addPermissionAndTellUser(
                    this.props.user.user.id,
                    item.networkId,
                    "Store"
                  )
                }
              >
                <Image
                  style={{
                    paddingRight: 10,
                    paddingLeft: 3,
                    maxHeight: 30,
                    height: 30,
                    width: 30,
                    maxWidth: 30,
                  }}
                  source={Images.MapIconStore11}
                  resizeMode="contain"
                />
                    <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Shop"}
                  </Text>
              </TouchableOpacity>
            </View>
         
            
          </View>
        }
        subtitleNumberOfLines={3}
        leftIcon={
          <View style={{flex:1, paddingRight:6}}>
          <Image
            style={{
              flex: 1,
              maxHeight: 100,
              height: 100,
              width: undefined,
              maxWidth: 120,
              padding: 4,              
            }}
            source={{ uri: networkImageUrl }}
            resizeMode="contain"
          />
          </View>
        }
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.storeName}
        titleNumberOfLines={2}
        subtitle={item.description}
        onPress={() => {
          this.setState({ currentlySelectedNetwork: item });
        }}
      />
    );
  };

  _showNetworkList = () => {
    if (this.state.latestNetworkSearchResults.length > 0) {
      return (       
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.latestNetworkSearchResults}
            renderItem={this._renderNetworkResultsRow}
            keyExtractor={(item) => item.networkId}
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
              "There were no products / networks to show! Please revise your search."
            }
          </Text>
        </View>
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
        marginRight: 3,
        borderWidth: 1,
        borderColor: "#42C0FF",
        borderRadius: 30,
        height: 50,
        backgroundColor:"white",
       }}
        placeholder={"Search all networks"}
        placeholderTextColor={"silver"}
        onChangeText={(text) => this.getNetworkAutocomplete(text)}
        ref={(component) => (this._textInput = component)}
      />
    );
  };

  searchNetworksByName = async (phrase) => {
    EventRegister.emit("showSpinner");
    this._clearCurrentlySelectedNetwork();
    let resultData = await HopprWorker.searchNetworksByName(phrase);
    console.debug("got result");
    this.setState({ latestNetworkSearchResults: resultData });
    EventRegister.emit("hideSpinner");
  };

  showToast = (message) => {
    this.refs.addPermsToast.show(message, DURATION.LENGTH_LONG);
  };

  getNetworkAutocomplete = async (phrase) => {
    let test = "";
    if (phrase.length > 0) {
      //save what we searched for
      this.setState({ latestSearchTerm: phrase });
      let result = await HopprWorker.getNetworkAutocomplete(phrase);
      //then save the result
      this.setState({ latestNetworkAutocompleteSearchResults: result });
      console.debug("got result");
    }
  };

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

    return (
      <Modal
        style={{
          zIndex:10,
          background: "white",
          backgroundColor: "#fff",
          borderRadius: 20,
          width: width - 20,
          height: LayoutHelper.getDynamicModalHeight(),
          borderWidth: 0.5,
          borderColor: "#42C0FF",
        }}
        // backdrop={true}
        position={"center"}
        animationDuration={100}
        ref={"requestPermissionsModal"}
        isOpen={this.props.openClosed}
        backdrop={true}
        backdropPressToClose={true}
        swipeToClose={true}        
        onClosed={() => this.closeMe()}
      >
        <Header
          style={{ borderRadius: 20 }}
          backgroundColor={"#42C0FF"}
          outerContainerStyles={{ height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Search a Network Name",
            style: { color: "#fff" },
          }}
        />
        <View style={{ flexGrow: 1 }}>
          <View style={styles.autocompleteContainer}>          
            <Autocomplete
              //hideResults={false}
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
              listStyle={{
                fontSize: 12,
                marginLeft: 20,
                borderTopWidth:0.5,
                borderWidth: 1.2,
                backgroundColor: "whiie",                
                borderColor: "#42C0FF",
                overflow:"hidden", 
                maxWidth: width - 44           
              }}
              placeholder="Enter name of a network / brand..."
              data={this.state.latestNetworkAutocompleteSearchResults}
              defaultValue={this.state.latestSearchTerm}
              // inputContainerStyle={{
              //   color: "black",
              //   borderRadius: 8,
              //   fontSize: 18,
              // }}
              onChangeText={(text) => this.getNetworkAutocomplete(text)}
              renderTextInput={() => this._renderTextInputForAutocomplete()}
              renderItem={(item, i) => (
                <View style={{ backgroundColor: "white" }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.searchNetworksByName(item.item);
                      this.setState({
                        latestNetworkAutocompleteSearchResults: [],
                      });
                    }}
                  >
                    <Text style={{ color: "black", fontSize: 20, width: width - 20 }}>
                      {" " + item.item}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />


            
          </View>

          {/* ITEM LISTING VIEW */}
          <View style={{ marginTop: 45, height: 222 }}>
            <ScrollView style={{ flex: 1, marginTop: 10 }}>
              <Text
                style={{
                  color: "black",
                  marginTop: 10,
                  margin: 5,
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {"Search Results: " +
                  this.state.latestNetworkSearchResults.length}
              </Text>
              {this._showNetworkList()}
            </ScrollView>
          </View>

          {/* NETWORK INFO VIEW */}
          <View style={{ flex: 1, marginTop: 10 }}>
            {this._renderNetworkDisplay(this.state.currentlySelectedNetwork)}
          </View>
        </View>

        <Toast
          ref="addPermsToast"
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

  return{
    addNetworkToLocalPickerIfNotExists:(newNet)=>{ //this is not async!
      console.debug("getting picker data");
      networkActions.actions.addNetworkToLocalPickerIfNotExists(dispatch, newNet);
    },
    changeNetwork: async (passedNetworkId) => {
      try {
        EventRegister.emit("showSpinner");
        console.debug("Chnaging netowrk");
        EventRegister.emit("resetStacksAndGo");
        await networkActions.actions.resetCategories(dispatch); //cleans out cats
        return networkActions.actions.fetchCategories(dispatch, passedNetworkId);
        EventRegister.emit("hideSpinner");
      } catch (error) {
        console.debug("Couldn't change network");
        EventRegister.emit("hideSpinner");
      }
    },
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,    
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(withTheme(RequestPermissionModal));
