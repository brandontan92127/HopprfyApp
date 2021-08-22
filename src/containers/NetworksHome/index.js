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
import { showMessage, hideMessage } from "react-native-flash-message";

import { EventRegister } from "react-native-event-listeners";
import { NoFlickerImage } from 'react-native-no-flicker-image';

const { width, height } = Dimensions.get("window");

class NetworksHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      myNetworks: [],
      tabIndex: 0,
    };

    console.debug("In permissions home");
  }

  _updateToggledItemInState(toggledNetwork) {
    //spread the exsiting array
    let copyArray = [...this.state.myNetworks];
    let index = copyArray.findIndex(
      (el) => el.networkId === toggledNetwork.networkId
    );
    copyArray[index] = { ...copyArray[index], active: toggledNetwork.active };
    this.setState({ myNetworks: copyArray });
  }

  _deleteNetwork=async(net)=>{
    await HopprWorker.deleteNetwork(net.networkId);
    showMessage({
      message: "Your network was deleted",
      autoHide: true,
      duration: 5000,
      position: "bottom",
      description:
        `No more ${net.storeName}! C'est la vie!`,
      backgroundColor: "orange", // background color
      color: "white", // text color
    });
    console.debug("ok")
    await this._getMyNetworksFromApi();
    console.debug("ok")


  }

  _toggleNetwork = async (toggledNetwork) => {
    if (toggledNetwork.active == true) {
      await this._disableNetwork(toggledNetwork.networkId);
      toggledNetwork.active = false;
    } else {
      await this._enableNetwork(toggledNetwork.networkId);
      toggledNetwork.active = true;
    }

    this._updateToggledItemInState(toggledNetwork);
  };

  _enableNetwork = async (selectedNetworkId) => {
    console.debug("abot to enable");
    await HopprWorker.enableNetwork(selectedNetworkId);
  };

  _disableNetwork = async (selectedNetworkId) => {
    console.debug("abot to disable");
    await HopprWorker.disableNetwork(selectedNetworkId);
  }; //pass netowrk ID so get all classes

  _navigateToProductClassMutexScreen = (selectedNetworkId) => {
    const { navigation } = this.props;
    //toast("we did it:" + selectedNetworkId);
    navigation.navigate("ProductClassMutexScreen", {
      networkId: selectedNetworkId,
    });
  };

  _getMyNetworksFromApi = async () => {
    try {
      EventRegister.emit("showSpinner");
      console.debug("Gettings netowrks");
      let myNets = await HopprWorker.getNetworksIOwn();
      console.debug("got my nets");
      this.setState({ myNetworks: myNets });  
    } catch (error) {
      
    }
    finally
    {
      EventRegister.emit("hideSpinner");
    }    
  };

  _renderNetworkList = () => { };

  _renderRow = ({ item, i }) => {
    let networkImageUrl = Config.NetworkImageBaseUrl + item.storeLogoUrl;
    let iconSize = width * 0.09;

    return (
      <ListItem
        subtitleNumberOfLines={2}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.storeName}
        subtitle={item.name}
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 90,
              height: 90,
              width: 90,
              maxWidth: 90,
              padding: 5,
              marginRight: 5
              //   width: undefined
            }}
            source={{ uri: networkImageUrl }}
            resizeMode="contain"
          />
        }
        switched={item.active}
        onSwitch={async () => {
          console.debug("About to toggle");
          await this._toggleNetwork(item);
        }}
        rightIcon={
          <View
            style={{
              flex: 1,
              padding: 6,
              minWidth:width * 0.22,
              marginRight: 10,         
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >

            {/* FIRST */}
            <View style={{ padding: 1 }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  margin: 3,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}
              >
                {/* LAUNCH LOGISTICS */}
                <TouchableOpacity
                  onPress={async () => {
                    console.debug("stop");
                    this.props.navigation.navigate("ProductCreateAndEditScreen", {
                      network: item,
                    });
                  }}
                >
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: iconSize,
                      height: iconSize,
                      width: iconSize,
                    }}
                    source={Images.AddShopper1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
                {"Add\nProduct"}
              </Text>
            </View>

            <View style={{ padding: 1 }}>
              {/* LOGISTICS BUTTON */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  margin: 3,                  
                  paddingTop: 3,
                  paddingBottom: 3,
                }}
              >
                {/* LAUNCH LOGISTICS */}
                <TouchableOpacity
                  onPress={async () => {
                    console.debug("stop");
                    this.props.navigation.navigate("ProductClassCreateAndEditScreen", {
                      networkId: item.networkId,
                    });
                  }}
                >
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: iconSize,
                      height: iconSize,
                      width: iconSize,
                    }}
                    source={Images.AddCat}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
                {"Add\nCategory"}
              </Text>
            </View>

            {/* SECOND */}
            <View style={{ padding: 1 }}>
              {/* LOGISTICS BUTTON */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  margin: 3,                  
                  paddingTop: 3,
                  paddingBottom: 3,
                }}
              >
                {/* LAUNCH LOGISTICS */}
                <TouchableOpacity
                  onPress={async () => {
                    console.debug("stop");
                    this.props.navigation.navigate("ProductClassMutexScreen", {
                      networkId: item.networkId,
                    });
                  }}
                >
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: iconSize,
                      height: iconSize,
                      width: iconSize,
                    }}
                    source={Images.ShowCategories1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
                {"Show\nCategories"}
              </Text>
            </View>

            {/* THIRD */}
            <View style={{ padding: 1 }}>
              {/* LOGISTICS BUTTON */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  margin: 3,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}
              >
                {/* LAUNCH LOGISTICS */}
                <TouchableOpacity
                  onPress={async () => {
                    console.debug("stop");
                    this.props.navigation.navigate("NetworkSplitsHomeScreen", {
                      network: item,
                    });
                  }}
                >
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: iconSize,
                      height: iconSize,
                      width: iconSize,
                    }}
                    source={Images.Settings1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
                {"Splits\n / Fees"}
              </Text>
            </View>
            
            {/* END */}

                  {/* THIRD */}
                  <View style={{ padding: 1 }}>
              {/* LOGISTICS BUTTON */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                  margin: 3,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}
              >
                {/* DELETE */}
                <TouchableOpacity
                  onPress={async () => {
                    console.debug("stop");
                   await this._deleteNetwork(item)
                  }}
                >
                  <Image
                    style={{
                      alignSelf: "center",
                      margin: 0,
                      maxHeight: iconSize,
                      height: iconSize,
                      width: iconSize,
                    }}
                    source={Images.Delete1}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
                {"Delete"}
              </Text>
            </View>            
            {/* END */}          
          </View>
        }
        switchButton={true}
        switchTintColor={"grey"}
        // onPress={() => this.deletePermissions(item.permission.id)}
        // onLongPress={() => this.deletePermissions(item.permission.id)}
        onPress={() => this._navigateToProductClassMutexScreen(item.networkId)}
        onLongPress={() => toast("ok")}
      />
    );
  };

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = (user) => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        return true;
      }
    }

    const { navigation } = this.props;
    this.props.navigation.navigate("LoginScreen");

    alert(
      "You are not in the correct role, or not logged in. Please register to become a network owner!!"
    );

    return false;
  };

  load = async () => {
    if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)) {
      try {       
        await this._getMyNetworksFromApi();
      } catch (error) {
        alert("Couldn't get networks - no connectivity?");
      } finally {        
      }
    }
  };

  _renderNetworkList = () => {
    if (this.state.myNetworks && this.state.myNetworks.length > 0) {
      return (
        <List style={{ flexGrow: 1 }}>
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.myNetworks}
            renderItem={this._renderRow}
            keyExtractor={(item) => item.networkId}
            refreshing={this.state.refreshing}
          />
        </List>
      );
    }
    else {
      return (
        <View style={{
          flex: 1,
          paddingTop: 18,
          minHeight: 180,
          height: 180
        }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 160,
              height: 160,
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
            {"There were no\n networks to show!"}
          </Text>
        </View>);
    }
  }

  componentWillUnmount=()=>{
    try {
     if(typeof this.unsubscribeWillFocus !=="undefined")
      this.unsubscribeWillFocus();    
    } catch (error) {
      
    }    
  }  

  componentDidMount = async () => {
    console.debug("in networks home");    
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);

    await this.load();

    showMessage({
      message: "This is the brand networks view",
      autoHide: true,
      duration: 5000,
      position: "bottom",
      description:
        "You can add new products and categories to your brands here, and create new networks.",
      backgroundColor: "orange", // background color
      color: "white", // text color
    });
  };

  render = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ height: 146, borderRadius: 6, marginBottom: 10 }}>
          <Image
            source={Images.NetworksHome3}
            style={{
              height: 140,
              minHeight: 140,
              flex: 1,
              width: null,
            }}
          />
        </View>

        <Text
          style={{
            color: "black",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 14,
            textShadowColor: "lightblue",
            // textShadowRadius: 1,
            // shadowOffset: 1,
          }}
        >
          {"Brand Networks:"}
        </Text>
        {/* NETWORK ADD BUTTON */}
        <TouchableOpacity
          style={{ paddingTop: 10 }}
          onPress={async () => {
            console.debug("stop");
            this.props.navigation.navigate("RegisterNetworkScreen")
          }}
        >
          <Image
            style={{
              alignSelf: "center",
              margin: 0,
              maxHeight: 50,
              height: 50,
              width: 50,
            }}
            source={Images.Add5}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={{ textAlign: "center", fontSize: 10, color: "black" }}>
          {"Add"}
        </Text>
        <ScrollView>

          {this._renderNetworkList()}


        </ScrollView>
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
)(withTheme(NetworksHome));
