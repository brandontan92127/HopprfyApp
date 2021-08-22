//THIS IS SHOWN TO THE CUSTOMER WHEN THE STORE HAS CONFIRMED THE PICKUP

import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { Button, ShopButton } from "@components";
import {
  Color,
  Languages,
  Styles,
  Images,
  Constants,
  withTheme,
  Config,
} from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
  List,
  ListItem,
} from "react-native-elements";
import { toast } from "@app/Omni";

const screen = Dimensions.get("window");
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  //TABS
  tabButton: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "rgba(255,255,255,1)",
  },
  textTab: {
    fontFamily: Constants.fontHeader,
    color: "rgba(183, 196, 203, 1)",
    fontSize: 16,
  },
  tabButtonHead: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    opacity: 0,
  },
  tabItem: {
    flex: 0.32,
    backgroundColor: "rgba(255,255,255,1)",
  },
  bottomView: {
    height: 50,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f7f9",
  },
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
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

export default class InboundPermissionsModal extends Component {
  constructor(props) {
    super(props);

    const {
      pullToRefresh,
      closeMe,
      approvePermissionRequest,
      deletePermissionRequest,
      acceptAllRequests,
    } = this.props;

    this.pullToRefresh = pullToRefresh;
    this.closeMe = closeMe;
    this.approvePermissionRequest = approvePermissionRequest;
    this.deletePermissionRequest = deletePermissionRequest;
    this.acceptAllRequests = acceptAllRequests;

    this.state = {
      tabIndex: 0,
      data: [], //permissions requests
      headerBgColor: "#a719ff",
      refreshing: false,
    };
  }

  changeHeaderBgColor = (newHexValue) => {
    this.setState({ headerBgColor: newHexValue });
  };

  changeTabAndHeaderBgColor = (tabIndex, newHexValue) => {
    this.changeHeaderBgColor(newHexValue);
    this.handleClickTab(tabIndex);
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }
  /**
   * Render tabview detail
   */

  _renderTabView = () => {
    let background = "white";
    let text = "black";
    let lineColor = "silver";

    const screenWidth = Dimensions.get("window").width;

    return (
      <View
        style={[
          styles.tabView,
          { paddingBottom: 20, backgroundColor: "white" },
        ]}
      >
        <View
          style={[
            styles.tabButton,
            { backgroundColor: background },
            { borderTopColor: lineColor },
            { borderBottomColor: lineColor },
            Constants.RTL && { flexDirection: "row-reverse" },
          ]}
        >
          <View
            style={[
              styles.tabItem,
              { alignContent: "center", backgroundColor: "white" },
            ]}
          >
            <Button
              type="tab"
              textStyle={[
                styles.textTab,
                { alignContent: "center", color: text },
              ]}
              selectedStyle={{ color: text }}
              text={"Store Sales:"}
              onPress={() => {
                this.handleClickTab(0);
              }}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tab"
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Driver Sales:"}
              onPress={() => {
                this.handleClickTab(1);
              }}
              selected={this.state.tabIndex == 1}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tab"
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Purchases:"}
              onPress={() => {
                this.handleClickTab(2);
              }}
              selected={this.state.tabIndex == 2}
            />
          </View>
        </View>
        {this.state.tabIndex === 0 && (
          // STORE NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                {"One:"}
              </Text>
            </View>
          </View>
        )}
        {this.state.tabIndex === 1 && (
          // DRIVER NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Days worked / £ earned:"}
              </Text>
            </View>
          </View>
        )}
        {this.state.tabIndex === 2 && (
          // <View style={[styles.description, { backgroundColor: "white" }]}>
          // STORE NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Most popular items:"}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  renderRow = ({ item }) => {
    let networkImageUrl = Config.NetworkImageBaseUrl + item.storeLogoUrl;

    return (
      <ListItem
        subtitleNumberOfLines={2}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.request.type + " for " + item.storeName}
        subtitle={
          "User: " + item.requestUsername + "\n" + item.requestUserEmail
        }
        avatar={
          <Image
            style={{
              flex: 1,
              maxHeight: 50,
              height: 50,
              width: 50,
              maxWidth: 50,
              //   width: undefined
            }}
            source={{ uri: networkImageUrl }}
            resizeMode="contain"
          />
        }
        onPress={() => alert("ok")}
        // onLongPress={() => this.showOrderLongPressMenu(item._id)}
        rightIcon={
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await this.approvePermissionRequest(item.request.id);
                toast("Approved!");
              }}
            >
              <Image
                style={{
                  maxHeight: 30,
                  height: 30,
                  width: 30,
                  maxWidth: 30,
                }}
                source={Images.Tick1}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={{ marginRight: 1, marginLeft: 3, color: "silver" }}>
              {"|"}
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await this.deletePermissionRequest(item.request.id);
                toast("Deleted!");
              }}
            >
              <Image
                style={{
                  maxHeight: 30,
                  height: 30,
                  width: 30,
                  maxWidth: 30,
                }}
                source={Images.Delete1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  _renderFlatList = (propsdata) => {
    if (typeof propsdata !== "undefined") {
      if (propsdata.length > 0) {
        return (
          <View style={{ flexGrow: 1 }}>
            <Text style={{ color: "black", fontSize: 16, textAlign: "center" }}>
              {"People who want to join your network:"}
            </Text>
            <ShopButton
              css={{ backgroundColor: this.state.headerBgColor, marginTop: 15 }}
              text="Accept All"
              onPress={() => this.acceptAllRequests()}
            />

            <List style={{ flexGrow: 1 }}>
              <FlatList
                style={{ flexGrow: 1 }}
                data={propsdata}
                renderItem={this.renderRow}
                keyExtractor={(item) => item.request.id}
                onRefresh={() => this.pullToRefresh()}
                refreshing={this.state.refreshing}
              />
            </List>
          </View>
        );
      }
    } else {
      return (
        <View style={{ flexGrow: 1 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 200,
              height: 200,
              width: undefined,
            }}
            source={Images.NoOrderClipboard}
            resizeMode="contain"
          />
          <Text style={{ color: "black", fontSize: 14, textAlign: "center" }}>
            {"There were no inbound permissions for you to review."}
          </Text>
        </View>
      );
    }
  };

  render = () => {
    console.debug("THIS inbound permissions modal!");

    const {
      headerText,
      openClosed,
      goToScreen,
      openMe,
      closeMe,
      data,
      ...props
    } = this.props;

    this.openClosed = openClosed;

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: this.state.headerBgColor,
          width: width - 15,
        }}
        backdrop={true}
        position={"center"}
        ref={"inboundPermissionsModal"}
        isOpen={this.openClosed}
        coverScreen={true}
        backdropPressToClose={false}
        swipeToClose={false}
        onClosed={() => this.closeMe()}
      >
        <Header
          backgroundColor={this.state.headerBgColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.closeMe(),
          }}
          centerComponent={{
            text: "Inbound Permissions",
            style: { color: "#fff" },
          }}
        />
        <View style={{ flexGrow: 1, marginBottom: 40 }}>
          <ShopButton
            css={{ backgroundColor: "blue", marginTop: 5 }}
            text="Refresh"
            onPress={() => this.pullToRefresh()}
          />

          {/* ALL PERMISSION REQUEST */}
          {this._renderFlatList(data)}

          {/* TABS */}
          {/* <View>{this._renderTabView()}</View> */}
        </View>
      </Modal>
    );
  };
}
