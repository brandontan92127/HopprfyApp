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
import {
  Button,
  ShopButton,
  CashOutModal,
  PermissionsList,
  InboundPermissionsModal,
} from "@components";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
import { Header, Icon, Divider } from "react-native-elements";
import { Images } from "@common";
import { toast } from "@app/Omni";
import { connect } from "react-redux";
import HopprWorker from "../../services/HopprWorker";
import { showMessage, hideMessage } from "react-native-flash-message";

import { setIntervalAsync } from 'set-interval-async/dynamic'
import { clearIntervalAsync } from 'set-interval-async'

const hopprMainBlue = GlobalStyle.primaryColorDark.color;
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

const getDefaultState = () => {
  return {
    permissionTimerId: 0,
    inboundPermissionRequests: [],
    tabIndex: 0,
  };
};
/**Shows user transactions / external account payments */
class PermissionsHome extends Component {
  constructor(props) {
    super(props);

    this.hasLoaded = false;
    this.state = getDefaultState();

    console.debug("In permissions home");
  }

  //cashout
  triggerInboundPermissionsModal = () => {
    this.props.updateModalState("inboundPermissionsModal", true);
  };

  hideInboundPermissionsModal = () => {
    this.props.updateModalState("inboundPermissionsModal", false);
  };

  _updatePermInArrayAndSaveToRedux(perm, newboolActiveValue) {
    //which array is it?

    console.debug("in update");
    switch (perm.networkPermissionType) {
      case "Customer":
        console.debug("test");
        let custItem = this.props.user.customerNetworksAndPermissions.find(
          (x) => x.permissionId == perm.id
        );
        let indexCus = this.props.user.customerNetworksAndPermissions.indexOf(
          custItem
        );
        custItem.permission.active = newboolActiveValue;
        this.props.user.customerNetworksAndPermissions[indexCus] = custItem;
        this.props.updateCustomerPerms(
          this.props.user.customerNetworksAndPermissions
        );
        break;
      case "Driver":
        let driverItem = this.props.user.driverNetworksAndPermissions.find(
          (x) => x.permissionId == perm.id
        );
        let indexDriver = this.props.user.driverNetworksAndPermissions.indexOf(
          driverItem
        );
        driverItem.permission.active = newboolActiveValue;
        this.props.user.driverNetworksAndPermissions[indexDriver] = driverItem;
        this.props.updateDriverPerms(
          this.props.user.driverNetworksAndPermissions
        );
        break;
      case "Store":
        let storeItem = this.props.user.storeNetworksAndPermissions.find(
          (x) => x.permissionId == perm.id
        );
        let indexStore = this.props.user.storeNetworksAndPermissions.indexOf(
          storeItem
        );
        storeItem.permission.active = newboolActiveValue;
        this.props.user.storeNetworksAndPermissions[indexStore] = storeItem;
        this.props.updateStorePerms(
          this.props.user.storeNetworksAndPermissions
        );
        break;
      case "OrderLogistics":
        let orderLogisticsItem = this.props.user.logisticsNetworksAndPermissions.find(
          (x) => x.permissionId == perm.id
        );
        let indexLogistics = this.props.user.logisticsNetworksAndPermissions.indexOf(
          orderLogisticsItem
        );
        orderLogisticsItem.permission.active = newboolActiveValue;
        this.props.user.logisticsNetworksAndPermissions[
          indexLogistics
        ] = orderLogisticsItem;
        this.props.updateLogisticsPermissions(
          this.props.user.logisticsNetworksAndPermissions
        );
        break;
    }
  }

  enablePermissions = async (perm) => {
    let res = await HopprWorker.enableNetworkPermission(perm.id);
    console.debug("Should be done");
    if (res.status == 204) {
      console.debug("updaing perm");
      this._updatePermInArrayAndSaveToRedux(perm, true);
    }
  };

  disablePermissions = async (perm) => {
    let res = await HopprWorker.disableNetworkPermission(perm.id);
    console.debug("Should be done");
    if (res.status == 204) {
      console.debug("updaing perm");
      this._updatePermInArrayAndSaveToRedux(perm, false);
    }
  };

  deletePermissions = async (permission) => {
    console.debug("Trying delete perms");
    let res = await HopprWorker.deleteNetworkPermission(permission.id);
    console.debug("Should be done");
    if (res.status == 204) {
      toast("Deleted!");
      //refresh the list depending on perm type
      switch (permission.networkPermissionType) {
        case "Customer":
          await this._refreshCustomerPermissions();
          break;
        case "Driver":
          await this._refreshDriverPermissions();
          break;
        case "Store":
          await this._refreshStorePermissions();
          break;
        case "OrderLogistics":
          await this._refreshLogisticsPermissions();
          break;
      }
    } else {
      toast("Sorry that failed!!");
    }
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex: tabIndex });
  }

  _renderTabView = () => {
    const {
      theme: {
        colors: { background, text, lineColor },
      },
    } = this.props;

    // let background = "white";
    // let text = "black";
    // let lineColor = "silver";
    const screenWidth = Dimensions.get("window").width;

    let eachImgWidth = (screenWidth / 3) - 24;

    return (
      <View
        style={[
          styles.tabView,
          { paddingBottom: 10, backgroundColor: "white" },
        ]}
      >
        {this.state.tabIndex === 0 && (
          //CUSTOMER
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
              alignItems:"center"
            }}
          >
            <View style={{ marginTop: 10 }}>
              {/* <ShopButton
                text="Add Network"
                onPress={() =>
                  this.props.updateModalState("requestPermissionsModal", true)
                }
              />
              <ShopButton
                text="Inbound Requests"
                css={{ backgroundColor: "red" }}
                onPress={() => this.triggerInboundPermissionsModal()}
              /> */}
              {/* //ICONS BOX */}
              <View
                style={{
                  flex: 1,
                  marginRight: 4,
                  marginTop: 6,
                  margin: 4,
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {/* START CONTROLS */}
                {/* ICON BOX */}
                {/* //ICON 1 */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      this.props.updateModalState(
                        "requestPermissionsModal",
                        true
                      )
                    }
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        alignSelf: "center",
                        margin: 5,
                        marginRight: 15,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Add4}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginRight: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Add Networks"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* TOGGLE ITSETLF */}
                {/* //ICON 2 - SHOULD BE  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.triggerInboundPermissionsModal()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Permissions2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Inbound Requests"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* //ICON 3 - REFRESH  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this._refreshCustomerPermissions()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.CloudSync1}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <PermissionsList
                ref={"customerPermissionsList"}
                data={this.props.user.customerNetworksAndPermissions}
                pullToRefresh={this._refreshCustomerPermissions}
                enablePermissions={this.enablePermissions}
                disablePermissions={this.disablePermissions}
                deletePermissions={this.deletePermissions}
              />
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
            <View style={{ marginTop: 10 }}>
              {/* //ICONS BOX */}
              <View
                style={{
                  flex: 1,
                  marginRight: 4,
                  marginTop: 6,
                  margin: 4,
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {/* START CONTROLS */}
                {/* ICON BOX */}
                {/* //ICON 1 */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      this.props.updateModalState(
                        "requestPermissionsModal",
                        true
                      )
                    }
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        alignSelf: "center",
                        margin: 5,
                        marginRight: 15,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Add4}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginRight: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Add Networks"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* TOGGLE ITSETLF */}
                {/* //ICON 2 - SHOULD BE  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.triggerInboundPermissionsModal()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Permissions2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Inbound Requests"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* //ICON 3 - REFRESH  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this._refreshDriverPermissions()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.CloudSync2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <PermissionsList
                ref={"driverPermissionsList"}
                data={this.props.user.driverNetworksAndPermissions}
                pullToRefresh={this._refreshDriverPermissions}
                enablePermissions={this.enablePermissions}
                disablePermissions={this.disablePermissions}
                deletePermissions={this.deletePermissions}
              />
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
            <View style={{ marginTop: 10 }}>
              {/* //ICONS BOX */}
              <View
                style={{
                  flex: 1,
                  marginRight: 4,
                  marginTop: 6,
                  margin: 4,
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {/* START CONTROLS */}
                {/* ICON BOX */}
                {/* //ICON 1 */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      this.props.updateModalState(
                        "requestPermissionsModal",
                        true
                      )
                    }
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        alignSelf: "center",
                        margin: 5,
                        marginRight: 15,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Add4}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginRight: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Add Networks"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* TOGGLE ITSETLF */}
                {/* //ICON 2 - SHOULD BE  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.triggerInboundPermissionsModal()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Permissions2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Inbound Requests"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* //ICON 3 - REFRESH  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this._refreshStorePermissions()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.CloudSync2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <PermissionsList
                ref={"storePermissionsList"}
                data={this.props.user.storeNetworksAndPermissions}
                pullToRefresh={this._refreshStorePermissions}
                enablePermissions={this.enablePermissions}
                disablePermissions={this.disablePermissions}
                deletePermissions={this.deletePermissions}
              />
            </View>
          </View>
        )}
        {/* LOGISTICS */}
        {this.state.tabIndex === 3 && (
          // <View style={[styles.description, { backgroundColor: "white" }]}>
          // STORE NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View style={{ marginTop: 10 }}>
              {/* //ICONS BOX */}
              <View
                style={{
                  flex: 1,
                  marginRight: 4,
                  marginTop: 6,
                  margin: 4,
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {/* START CONTROLS */}
                {/* ICON BOX */}
                {/* //ICON 1 */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      this.props.updateModalState(
                        "requestPermissionsModal",
                        true
                      )
                    }
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        alignSelf: "center",
                        margin: 5,
                        marginRight: 15,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Add4}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginRight: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Add Networks"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* TOGGLE ITSETLF */}
                {/* //ICON 2 - SHOULD BE  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.triggerInboundPermissionsModal()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.Permissions2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Inbound Requests"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* //ICON 3 - REFRESH  */}
                <View
                  style={{
                    marginTop: 3,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this._refreshLogisticsPermissions()}
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      style={{
                        marginLeft: 15,
                        alignSelf: "center",
                        margin: 5,
                        maxHeight: eachImgWidth,
                        height: eachImgWidth,
                        width: eachImgWidth,
                        maxWidth: eachImgWidth,
                      }}
                      source={Images.CloudSync2}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 15,
                        color: "black",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      {"Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <PermissionsList
                ref={"logisticsPermissionsList"}
                data={this.props.user.logisticsNetworksAndPermissions}
                pullToRefresh={this._refreshLogisticsPermissions}
                enablePermissions={this.enablePermissions}
                disablePermissions={this.disablePermissions}
                deletePermissions={this.deletePermissions}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  _acceptAllRequests = async () => {
    this.state.inboundPermissionRequests.map(async (x) => {
      await approvePermissionRequest(x.request.id);
    });
  };

  _removeListItemFromLocalState = (permRequestId) => {
    let itemWeLookingFOr = this.state.inboundPermissionRequests.find(
      (x) => x.request.id == permRequestId
    );
    let copiedArray = [...this.state.inboundPermissionRequests];
    let indexOfItem = copiedArray.findIndex(
      (el) => el.request.id === permRequestId
    );
    //delete the item
    copiedArray.splice(indexOfItem, indexOfItem + 1);
    this.setState({ inboundPermissionRequests: copiedArray });
  };

  deletePermissionRequest = async (id) => {
    let tryingIt = "";
    let isSuccess = await HopprWorker.deletePermissionRequest(id);
    console.debug("done");

    if (isSuccess.status == 204) {
      //remove frmo local state
      this._removeListItemFromLocalState(id);
    }
  };

  approvePermissionRequest = async (id) => {
    let tryingIt = "";
    let isSuccess = await HopprWorker.approvePermissionRequest(id);
    console.debug("done");
    if (isSuccess.status == 204) {
      //remove frmo local state
      this._removeListItemFromLocalState(id);
    }
  };

  _refreshLogisticsPermissions = async () => {
    let logisticsPerms = await HopprWorker.getAllNetworksAndPermissions(
      this.props.user.user.id,
      "OrderLogistics"
    );
    this.props.updateLogisticsPerms(logisticsPerms);
  };

  _refreshCustomerPermissions = async () => {
    let customerPerms = await HopprWorker.getAllNetworksAndPermissions(
      this.props.user.user.id,
      "Customer"
    );
    this.props.updateCustomerPerms(customerPerms);
  };

  _refreshDriverPermissions = async () => {
    let driverPerms = await HopprWorker.getAllNetworksAndPermissions(
      this.props.user.user.id,
      "Driver"
    );
    this.props.updateDriverPerms(driverPerms);
  };

  _refreshStorePermissions = async () => {
    let storePerms = await HopprWorker.getAllNetworksAndPermissions(
      this.props.user.user.id,
      "Store"
    );
    this.props.updateStorePerms(storePerms);
  };

  //so you can approve them
  _getInboundPermissionRequests = async () => {
    console.debug("amazing");
    let inboundPermReqs = await HopprWorker.getNetworkPermissionsRequests();
    console.debug("amazing");

    this.setState({ inboundPermissionRequests: inboundPermReqs });
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
      "You are not in the correct role, or not logged in. Please register to view your permissions!!"
    );

    return false;
  };

  refreshAllPermission = async () => {
    if (typeof this.props.user.user !== "undefined") {
      toast("Refreshing permissions...");
      await this._refreshCustomerPermissions();
      await this._refreshDriverPermissions();
      await this._refreshStorePermissions();
      await this._refreshLogisticsPermissions();

      await this._getInboundPermissionRequests();
    }
  };

  unload = async () => {
    clearIntervalAsync(this.state.permissionTimerId);
    // toast(
    // "terminated update timer with timerID:" + this.state.permissionTimerId
    // );
    //clear state to speed up
    this.setState(getDefaultState());
    this.hasLoaded = false;
  };

  load = async () => {
    if(!this.hasLoaded)
    {
      this.hasLoaded = true;
    if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)) {

      await this.refreshAllPermission();
      let permsTimerId = setIntervalAsync(async () => {
        try {
          await this.refreshAllPermission();
        } catch (error) {
          toast("There was an error refreshing permissions");
        }
      }, 20000);

      this.setState({ permissionTimerId: permsTimerId });
      //test
    } else {
      alert("You're not logged in so you've got no permissions!!");
    }
   }
  };

  componentWillUnmount=()=>{
    try {
      this.unload();
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      console.debug("component didn't ummount propery");
    }    
  }

  componentDidMount = async () => {
    console.debug("");

    showMessage({
      message: "This is the brand permissions view",
      autoHide: true,
      duration: 5000,
      position: "bottom",
      description:
        "Add brands you want to shop / driver / sell on here! View your inbound requests for people to join your brand.",
      backgroundColor: "brown", // background color
      color: "white", // text color
    });
    
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    this.unsubscribeLoseFocus =this.props.navigation.addListener("willBlur", this.unload);

    await this.load();
    //if user is logged in get his perms
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
          style={[
            styles.tabView,
            { paddingBottom: 10, backgroundColor: "white" },
          ]}
        >
          <View
            style={[
              styles.tabButton,
              { backgroundColor: lineColor },
              { borderTopColor: lineColor },
              { borderBottomColor: lineColor },
              Constants.RTL && { flexDirection: "row-reverse" },
            ]}
          >
            <View style={[styles.tabItem, { backgroundColor: "white" }]}>
              <Button
                type="tabimage"
                lineColor={hopprMainBlue}
                icon={Images.TabShoppingIcon1}
                textStyle={[styles.textTab, { color: text }]}
                selectedStyle={{ color: text }}
                text={"Shopping:"}
                onPress={() => this.handleClickTab(0)}
                selected={this.state.tabIndex == 0}
              />
            </View>
            <View style={[styles.tabItem, { backgroundColor: "white" }]}>
              <Button
                type="tabimage"
                lineColor={hopprMainBlue}
                icon={Images.DeliveryDriver2}
                textStyle={[styles.textTab, { color: text }]}
                selectedStyle={{ color: text }}
                text={"Driving:"}
                onPress={() => this.handleClickTab(1)}
                selected={this.state.tabIndex == 1}
              />
            </View>
            <View style={[styles.tabItem, { backgroundColor: "white" }]}>
              <Button
                type="tabimage"
                lineColor={hopprMainBlue}
                icon={Images.TabStoreIcon2}
                text={"Selling:"}
                defaultSource={Images.MapIconStore2}
                textStyle={[styles.textTab, { color: text }]}
                selectedStyle={{ color: text }}
                onPress={() => this.handleClickTab(2)}
                selected={this.state.tabIndex == 2}
              />
            </View>
            <View style={[styles.tabItem, { backgroundColor: "white" }]}>
              <Button
                type="tabimage"
                lineColor={hopprMainBlue}
                icon={Images.GenerateHud1}
                text={"Logistics:"}
                defaultSource={Images.GenerateHud1}
                textStyle={[styles.textTab, { color: text }]}
                selectedStyle={{ color: text }}
                onPress={() => this.handleClickTab(3)}
                selected={this.state.tabIndex == 3}
              />
            </View>
          </View>
        </View>
        <ScrollView>
          {/* TABS */}
          <View>{this._renderTabView()}</View>
        </ScrollView>

        <InboundPermissionsModal
          openClosed={
            this.props.modalsArray.find(
              (x) => x.modalName === "inboundPermissionsModal"
            ).isOpenValue
          }
          data={this.state.inboundPermissionRequests}
          closeMe={this.hideInboundPermissionsModal}
          pullToRefresh={this._getInboundPermissionRequests}
          approvePermissionRequest={this.approvePermissionRequest}
          deletePermissionRequest={this.deletePermissionRequest}
          acceptAllRequests={this._acceptAllRequests}
        />
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
    updateLogisticsPerms: (newPermsArray) => {
      try {
        console.debug("trying to updat perms");
        userActions.actions.updateLogisticsPermissions(dispatch, newPermsArray);
      } catch (error) { }
    },
    updateCustomerPerms: (newPermsArray) => {
      try {
        console.debug("trying to updat perms");
        userActions.actions.updateCustomerPermissions(dispatch, newPermsArray);
      } catch (error) { }
    },
    updateDriverPerms: (newPermsArray) => {
      try {
        console.debug("trying to updat perms");
        userActions.actions.updateDriverPermissions(dispatch, newPermsArray);
      } catch (error) { }
    },
    updateStorePerms: (newPermsArray) => {
      try {
        console.debug("trying to updat perms");
        userActions.actions.updateStorePermissions(dispatch, newPermsArray);
      } catch (error) { }
    },
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
)(withTheme(PermissionsHome));
