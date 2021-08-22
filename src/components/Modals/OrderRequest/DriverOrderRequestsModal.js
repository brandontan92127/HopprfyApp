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
  FlatList
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  ListItem,
  Divider
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import FastImage from "react-native-fast-image";
import HopprWorker from "@services/HopprWorker";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10
  },
  container: {
    flexGrow: 1,
    backgroundColor: "white"
  },
  driverControlsModal: {
    height: 300,
    backgroundColor: "#fff"
  },
  driverButtonViewContainer: {
    padding: 5
  },
  containerCentered: {
    backgroundColor: "white",
    justifyContent: "center"
  }
});

export default class DriverOrderRequestsModal extends React.PureComponent {
  _renderOrderRequestListItem = ({ item }) => {
    let items = "";
    item.items.map(x => {
      let toAdd = x.amount + " " + x.productName + ",";
      items += toAdd;
    });

    items = items.slice(0, -1);
    let maxWidth = width / 3;
    return (
      <ListItem
        titleNumberOfLines={2}
        subtitleNumberOfLines={5}
        title={"*" + item.networkName + "*" + "\n" + item.driverName}
        subtitle={items}
        hideChevron={false}
        leftIcon={
          <View style={{ minWidth: maxWidth, marginRight: 4 }}>
            <FastImage
              style={{
                flex: 1,
                maxWidth: maxWidth,
                minHeight: 80,
                minWidth: 80
              }}
              source={{ uri: item.networkLogo }}
              resizeMode={"contain"}
            />
            <Text
              style={{
                color: "silver",
                marginTop: 2,
                fontSize: 11,
                flexShrink: 1,
                textAlign: "center"
              }}
            >
              {"#" + item._id.substring(0, 4)}
            </Text>
          </View>
        }
        rightIcon={
          <View>
            <TouchableOpacity
              style={{ marginBottom: 2 }}
              onPress={async () => {
                let reszzult =
                  await HopprWorker.actionMessageAction_DriverAcceptOrderRequest(
                    this.props.driverId,
                    item._id
                  );
                this.props.closeMe();
                //if it works send to driver tracking via navigation
                if (reszzult.status == 200) {
                  await this.props.refreshAllRequests();
                  this.props.goToScreen("HomeScreen"); //just to trigger driver home
                  this.props.goToScreen("DriverHomeScreen");
                  this.props.closeOrderRequestModal();
                  //should close any open order request modeal
                  console.debug("great");
                } else {
                  alert("Sorry, couldn't accept that order!");
                }
              }}
            >
              <FastImage
                style={{ height: 90, width: 90, marginLeft: 2 }}
                source={Images.Tick4}
              />
            </TouchableOpacity>
            {/* NO */}
            {/* <TouchableOpacity style={{marginTop:2}}
onPress={async () => {
  let reszzult = await this.props.rejectOrderRequest(    
    item._id,
    this.props.driverId,
  );
  //if it works send to driver tracking via navigation
  if (reszzult.status == 200) {
    await this.props.refreshAllRequests();        
    console.debug("great");
  } else {
    alert("Sorry, couldn't reject that order!");
  }

}}
> */}
            {/* <FastImage                        
    style={{height:60,width:60, marginLeft:2}}
    source={Images.Cross1}
  />           
</TouchableOpacity> */}
          </View>
        }
        // onPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
        // onLongPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
      />
    );
  };

  _renderFlatList = () => {
    if (this.props.orderRequests.length == 0) {
      return (
        <View style={{ padding: 12 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              minHeight: 180,
              height: 180,
              width: undefined
            }}
            source={Images.NoOrderClipboard}
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
            {"There were no requests to show!"}
          </Text>
        </View>
      );
    } else {
      return (
        <FlatList
          style={{ flex: 1, paddingBottom: 40 }}
          data={this.props.orderRequests}
          renderItem={this._renderOrderRequestListItem}
          keyExtractor={item => item._id}
        />
      );
    }
  };

  render() {
    const {
      headerText,
      orderRequests,
      cancelOrderRequest,
      openClosed,
      openMe,
      closeMe,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    this.orderRequests = orderRequests;
    this.cancelOrderRequest = cancelOrderRequest;

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: "90%",
          paddingBottom: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          width: "100%",
          zIndex: 99999
        }}
        backdrop={true}
        position={"bottom"}
        coverScreen={true}
        ref={this.props.refString}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        <Header
          // backgroundColor={this.props.mainColor}
          backgroundColor={"#00b2be"}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe()
          }}
          centerComponent={{
            text: this.props.title,
            style: { color: "#fff", fontFamily: Constants.fontFamilyBlack }
          }}
        />
        <View style={{ flexGrow: 1 }}>
          <ScrollView>
            <TouchableOpacity>{this._renderFlatList()}</TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
