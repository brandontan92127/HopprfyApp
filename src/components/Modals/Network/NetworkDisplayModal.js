import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { NetworkDisplay } from "@components";
import { Images, Config } from "@common";
import { toast } from "../../../Omni";
import { connect } from "react-redux";
import { StackActions, NavigationActions } from 'react-navigation';
import { EventRegister } from "react-native-event-listeners";
import { toHsv } from "react-native-color-picker";

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
  },
});

class NetworkDisplayModal extends Component {
  constructor(props) {
    super(props);

    console.debug("network display modal constructor");
  }

  componentDidMount = async () => { };

  componentWillMount = async () => { };

  _renderNetworkDisplay() {
    if (typeof this.props.latestQueriedNetwork === "undefined") {
      return <View style={{ height: 180 }} />; //return blank
    } else {
      return (
        <View
          style={{
            flex: 1,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 10,
            alignContent: "center",
            textAlign: "center",
            justifyContent: "center"
          }}
        >
          <NetworkDisplay
            otherVideoDisplayActions={()=>this.closeMe()}
            onPressShopNow={this._shopNow}
            network={this.props.latestQueriedNetwork}
            baseImageUrl={Config.NetworkImageBaseUrl}
          />
        </View>
      );
    }
  }


  _shopNow= async (net)=>{
    if(typeof net !== "undefined")
    {
      //close off modals
      this.closeMe();      
      if(typeof this.props.closeOtherModals !== "undefined")
      {
        this.props.closeOtherModals();      }

      //add net to picker if not exists
      this.props.addNetworkToLocalPickerIfNotExists(net);
      //this.props.goToScreen("HomeScreen", null);
      EventRegister.emit("resetStacksAndGo");
      //changes network picker
      await this.props.changeNetwork(net.networkId);
      //redirect to cart                
    }
  }
  onBuffer = () => { };
  videoError = () => { };

  //added to 'shop and go'
   /**We want to add network */
   _addNetwork_RefreshNetworks_AndGoToHomeWithNewNetworkSelected = async (
    user,
    network,
    permType
  ) => {
    console.debug("hgit the actions");
    //send request anyway if user is logged in - whatever
    if (typeof user.user !== "undefined" && user.user != null) {
      let permRes = await this._requestNewPermission(
        user.user.userId,
        network.networkId,
        permType
      );
      console.debug("perm request sent - now go to network?");
    }

    //is public or private
    if (network.visibility.toLowerCase() === "private") {
      alert(
        "We will request your addition to this private network, you'll have to wait to be accepted"
      );
    } else {
      //is public, redirect
      if (typeof user.user !== "undefined" && user.user != null) {
        console.debug("user is logged in");
        //change network then go!
        this.props.changeNetwork(network.networkId).then(() => {
          this.props.goToScreen("HomeScreen");
          this.closeMe();
          //end logged in 'IF'
        });
      } else {
        //USER NOT LOGGED IN

        //JUST ADD TO THE CURRENT PERMISSIONS AVAILABLE

        alert(
          "User is not logged in - just get the netowrk anyway and er.. dunno!!"
        );
      }
    }
  };


  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    console.debug("In network display modal");
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: 430,
          paddingBottom: 10,
          borderRadius: 60,
          width: width - 15,
          borderWidth: 2,
          borderColor: "silver",
          zIndex:2
        }}
        backdrop={true}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={true}
        position={"center"}
        ref={"networkDisplayModal"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        {/* <Header
          backgroundColor={"silver"}
          outerContainerStyles={{ height: 49, borderRadius: 8 }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Network Details",
            style: { color: "#fff" },
          }}
        /> */}
        <View style={{ borderRadius: 8, flex: 1 }}>
          {this._renderNetworkDisplay(this.props.latestQueriedNetwork)}
        </View>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  // const modalActions = require("@redux/ModalsRedux");
  // const locationActions = require("@redux/LocationRedux");
  const CartRedux = require("@redux/CartRedux");
  const networkActions = require("@redux/CategoryRedux"); //saves latest picked network
  const modalActions = require("@redux/ModalsRedux");

  return {
    addNetworkToLocalPickerIfNotExists:(newNet)=>{ //this is not async!
      console.debug("getting picker data");
      networkActions.actions.addNetworkToLocalPickerIfNotExists(dispatch, newNet);
    },
    changeNetwork: async (passedNetworkId) => {
      try {
        EventRegister.emit("resetStacksAndGo");
        console.debug("Chnaging netowrk");
        await networkActions.actions.resetCategories(dispatch); //cleans out cats
        await networkActions.actions.fetchCategories(dispatch, passedNetworkId);
      } catch (error) {
        console.debug("Couldn't change network");
      }
    },
  };
};

const mapStateToProps = (state) => {
  console.debug("test state");
  return {
    latestQueriedNetwork: state.categories.latestQueriedNetwork,
  };
};

export default connect(mapStateToProps,
   mapDispatchToProps,
    null)(withTheme(NetworkDisplayModal));
