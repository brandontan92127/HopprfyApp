import Modal from "react-native-modalbox";
import React, { Component } from "react";
import moment from "moment";
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme, Config,GlobalStyle } from "@common";
import {
  List,
  ListItem,
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import FastImage from 'react-native-fast-image';
import { connect } from "react-redux";
import { Images } from "@common";
import { toast } from "../../../Omni";
import HopprWorker from "../../../services/HopprWorker";

import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import SoundPlayer from "react-native-sound-player";
import { isIphoneX } from "react-native-iphone-x-helper";
import LayoutHelper from "../../../services/LayoutHelper"
import ErrorBoundary from "react-native-error-boundary";

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
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

class ActionMessageAndQuickControlsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionMessages:[]
    };
  }

  unload = () => {
    toast("UNLOADED");
  };

  load = async () => {
    console.debug("chiocken");
    if (
      typeof this.props.user.user != "undefined" &&
      this.props.user.user != null
    ) {
      console.debug("chiocken");
      let resssult = await HopprWorker.getAllActionMessages(
        this.props.user.user.id
      );
      this.setState({ actionMessages: resssult.data });
      console.debug("chiocken");
      let resssult2 = await HopprWorker.getUnreadActionMessages(
        this.props.user.user.id
      );
      console.debug("chiocken");
      //update action message redux
    }
  };

  _renderActionMessageFlatlist = () => {
    console.debug("stop");
    if (this.props.actionMessages.length > 0) {
      console.debug("stop again");
      return ( 
          <FlatList
            style={{
              flexGrow: 1,
              paddingBottom: 20,
              marginBottom: 20,
            }}
            data={this.props.actionMessages}
            renderItem={this._renderActionMessageListViewRow}
            keyExtractor={(item) => item._id}
          />       
      );
    } else {
      return (
        <View style={{ flex: 1, 
        paddingTop: 10 }}>
          <Image
            style={{
              flex: 1,
              maxHeight: 190,
              height: 190,
              width: null,
            }}
            source={Images.NewAppReskinGraphics.NoMessages}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontSize:Constants.fontFamilyMedium,
              fontSize: 20,              
              textAlign: "center",
            }}
          >
            {"There were no\nmessages to show!"}
          </Text>
        </View>
      );
    }
  };

  _renderCorrectActionsForRow = (
    actionMessageType,
    orderRequestId = undefined,
    orderId = undefined,
    messageId = undefined
  ) => {
    switch (actionMessageType) {
      case "Dismiss":
        return this._renderDismissActions();
        break;
      case "None":
        return this._renderDismissActions();
        break;
      case "DriverOrderRequest":
        return this._renderOrderRequestAcceptYesOrNo(
          this.props.user.user.driverId,
          orderRequestId,
          messageId
        );
        break;
      case "CustomerMustConfirmDelivery":
        return this._renderOrderCompleteYesOrNoActions(orderId);
        break;
      default:
        return this._renderDismissActions();
        break;
    }
  };

  /**Just get rid of the message and mark as read */
  _renderDismissActions = () => {
    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <View>
          <TouchableHighlight
          // onPress={() => this.driverConfirmOrderDelivery(item._id)}
          >
            <Image
              style={{
                margin: 5,
                padding: 5,
                maxHeight: 60,
                height: 60,
                width: 60,
              }}
              source={Images.Close1}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <Text style={{ textAlign: "center", color: "black", fontSize: 10 }}>
            {"Complete"}
          </Text>
        </View>
      </View>
    );
  };

  /** */
  _renderOrderRequestAcceptYesOrNo = (driverId, orderRequestId, messageId) => {
    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View>
          <TouchableHighlight
            onPress={async () => {
              let reszzult = await HopprWorker.actionMessageAction_DriverAcceptOrderRequest(
                driverId,
                orderRequestId
              );
              //if it works send to driver tracking via navigation
              if (reszzult.status == 200) {
                this.props.closeMe();
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
            <Image
              style={{
                margin: 5,
                padding: 5,
                maxHeight: 50,
                height: 50,
                width: 50,
              }}
              source={Images.ThumbsUp3}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <Text style={{ textAlign: "center", color: "black", fontSize: 10 }}>
            {"Accept"}
          </Text>
        </View>
        <View style={{ alignContent: "flex-end", alignItems: "flex-end" }}>
          <Text style={{ marginRight: 5, color: "silver" }}>{"|"}</Text>
        </View>
        <View>
          <TouchableHighlight
            onPress={async () => {
              let reszzult = await HopprWorker.markActionMessageAsComplete(
                messageId
              );
              //if it works send to driver tracking via navigation
              if (reszzult.status != 200 && reszzult.status != 204) {
                alert("That didn't work. No connectivity?");
              }
            }}
          >
            <Image
              style={{
                margin: 5,
                padding: 5,
                maxHeight: 50,
                height: 50,
                width: 50,
              }}
              source={Images.ThumbsDown1}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <Text style={{ textAlign: "center", color: "black", fontSize: 10 }}>
            {"Dismiss"}
          </Text>
        </View>
      </View>
    );
  };

  /** */
  _renderOrderCompleteYesOrNoActions = (orderId) => {
    return (
      <View
        style={{
          flexDirection: "column",
        }}
      >
          {/* START ROWS */}
          <TouchableOpacity
                  onPress={async () =>
                    {                     
                      alert(Constants.OrderHelpMessage);
                    }                    
                  }
                >
            <View style={[GlobalStyle.rowImageContainer]}>                
                  <Image
                    style={GlobalStyle.rowImageIcon}
                    source={Images.NewAppReskinIcon.Close}
                    resizeMode="contain"                    
                  />
              
                <View style={{flex:1, justifyContent:"center"}}>
                <Text
                  style={{
                    //fontStyle: "italic",
                    color: GlobalStyle.superSearchRowTextColor.color,                    
                    textAlignVertical:"center",
                    fontFamily:Constants.fontFamily,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"HELP"}
                </Text>
                </View>
                </View>
                </TouchableOpacity>

          
              <View style={GlobalStyle.rowImageContainerEmptyRow}></View>
              {/* SECOND ONE */}
              <TouchableOpacity
                onPress={() => this._action_CustomerConfirmOrderComplete(orderId)}
                >
              <View style={GlobalStyle.rowImageContainer}>             
                  <Image
                    style={GlobalStyle.rowImageIcon}
                    source={Images.NewAppReskinIcon.GoingTo}
                    resizeMode="contain"                   
                  />
            
                <View style={{flex:1, justifyContent:"center"}}>
                <Text
                  style={{
                    //fontStyle: "italic",
                    color: GlobalStyle.primaryColorDark.color,                    
                    textAlignVertical:"center",
                    fontFamily:Constants.fontFamily,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"OK"}
                </Text>
                </View>
                </View>
                </TouchableOpacity>
        {/* <View>
          <TouchableHighlight
            onPress={() => this._action_CustomerConfirmOrderComplete(orderId)}
          >
            <Image
              style={{
                margin: 5,
                padding: 5,
                maxHeight: 50,
                height: 50,
                width: 50,
              }}
              source={Images.ThumbsUp3}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <Text style={{ textAlign: "center", color: "black", fontSize: 10 }}>
            {"Complete"}
          </Text>
        </View>
        <Text style={{ marginRight: 5, alignSelf: "center", textAlign: "center", color: "silver" }}>{"|"}</Text>
        <View>
          <TouchableHighlight
          // onPress={() => this.cancelOrder(item._id)}
          >
            <Image
              style={{
                margin: 5,
                padding: 5,
                maxHeight: 50,
                height: 50,
                width: 50,
              }}
              source={Images.Complaint1}
              resizeMode="contain"
            />
          </TouchableHighlight>
          <Text style={{ textAlign: "center", color: "black", fontSize: 10 }}>
            {"Complain"}
          </Text>
        </View> */}
      </View>
    );
  };

  _clearAllBlockers = async () => {
    //clear all order completes

    try {
      let allBlockers = this.state.actionMessages.filter(x => x.actionToTake === "CustomerMustConfirmDelivery");
      allBlockers.map(async msg => {
        //call complete
        if (!msg.complete) {
          await this._action_CustomerConfirmOrderComplete(msg.orderId)
        }
  
      });
        
    } catch (error) {
      alert("Sorry, there was an error: " + error.message);      
    }
  }

  _renderControls = () => {
    if(this.state.actionMessages.length > 0)
    {
    return (
      <View style={{
        flex: 1,
        maxHeight: 70,
        paddingTop: 10,
        paddingLeft: 5,
        paddingRight: 5,
        height: 70,
        minHeight: 70,
        justifyContent: "flex-end",
        alignContent: "flex-end",
        alignItems: "flex-end"
      }}>
        <View style={{
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center"
        }}>
          <TouchableOpacity
            onPress={() => {
              this._clearAllBlockers();
              this.closeMe();
            }
            }
          >
            <Image
              style={{
                flex: 1,
                maxHeight: 40,
                minHeight: 40,
                height: 40,
                width: 40
              }}
              source={Images.Go1}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text
            style={{
              color: "black",
              fontSize: 8,
              textAlign: "center",
            }}
          >
            {"Complete\nall orders"}
          </Text>
        </View>
      </View>
    );
   }

   return null;
  }

  _renderActionMessageListViewRow = ({ item }) => {
    let orderRequestId = item.orderRequestId;
    let orderId = item.orderId;
    let formateedDate = item.whenCreatedShortString; // moment(item.whenCreatedUTC, momentFormat);
    let imgToShowMsgTypeUrl =
      item.blockingRequest == true
        ? Images.NewAppReskinIcon.Message
        : Images.ActionMessage2;
    console.debug("in listview");
    return (
      <ListItem
        leftIcon={
          <View>
            <View
              style={{
                paddingRight: 2,
                marginRight: 2,
                overflow: "hidden",
                borderRadius: 40,
              }}
            >
              <Image
                style={{
                  flex: 1,
                  maxHeight: 70,
                  height: 70,
                  width: 90,
                  maxWidth: 90,
                  padding: 5,
                  margin: 5,
                  borderRadius: 40,
                  //   width: undefined
                }}
                source={imgToShowMsgTypeUrl}
                resizeMode="contain"
              />
            </View>
            {/* <Text style={{ color: "#FFC300", fontSize: 10 }}>{formateedDate}</Text> */}
          </View>
        }
        titleNumberOfLines={1}        
        subtitleNumberOfLines={12}
        title={item.title}        
        titleStyle={{fontFamily:Constants.fontHeader}}
        subtitleStyle={{fontFamily:Constants.fontHeader}}
        subtitle={formateedDate + "\n" + item.message}
        hideChevron={false}
        // onPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
        // onLongPress={async () => await this._assignDestinationAsCurrentOrderDestination(item)}
        rightIcon={this._renderCorrectActionsForRow(
          item.actionToTake,
          orderRequestId,
          orderId,
          item._id
        )}
      />
    );
  };

  //ACTION MESSAGE ACTIONS
  _action_DriverAcceptOrderRequest = async (driverId, orderRequestId) => {
    try {
      await HopprWorker.actionMessageAction_DriverAcceptOrderRequest(
        driverId,
        orderRequestId
      );
      //this.props.navigation.navigate("DriverHomeScreen");
      this.closeMe();
    } catch (error) { }
  };

  _action_CustomerConfirmOrderComplete = async (orderId) => {
    try {
      console.debug("lets try");
      let cofnirmRes = await HopprWorker.actionMessageAction_CustomerConfirmOrderCompete(
        orderId
      );
      if (cofnirmRes.status == 200) {
        //worked
        SoundPlayer.playSoundFile("cashregister", "mp3");
        toast(`Thanks for shopping with ${Config.InAppName}!!!`);
        showMessage({
          position:"center",
          message: "Your order is complete!",
          autoHide: false,
          description:
            "Please take a moment to review our app on the Play or App store if you liked it! See you again soon.",
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          color: "white", // text color
        });

        this.props.closeConfirmOrderDeliveredModal();
        this.props.closeMe();
      } else {
        //alert("That didn't work");
      }
    } catch (error) {
     // alert("Couldn't confirm order complete");
    }
  };

  componentDidMount = async () => {
    console.debug("In action message");    
  };

  render() {
    const {
      completeActionHandler,
      refreshMessages,
      headerText,
      openClosed,
      openMe,
      closeMe,
      closeOrderRequestModal,
      ...props
    } = this.props;

    this.closeOrderRequestModal = closeOrderRequestModal;
    this.completeAction = completeActionHandler;
    this.refreshMessages = refreshMessages;
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        position={"center"}
        style={{
          height: LayoutHelper.getDynamicModalHeight(),
          borderRadius:20,
          overflow:"hidden",
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          paddingBottom: 10,
          width: width - 8,
          zIndex: 10,
          borderWidth: 0,        
          borderColor: "#FFC300",
        }}
        coverScreen={false}
        backdropPressToClose={false}
        swipeToClose={true}
        backdrop={true}        
        ref={"actionMessageModal"}
        isOpen={this.props.openClosed}
        onClosed={this.closeMe}
        onOpened={async () => await this.load()}
      >
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            overflow:"visible",           
            borderTopLeftRadius: 19,            
            borderTopRightRadius: 19
          }}
          rightComponent={
            <View style={{ paddingTop: 4, marginTop: 13 }}>
              <TouchableOpacity
                onPress={() => {
                  this._clearAllBlockers();
                  this.closeMe();
                }}>              
                <FastImage
                   source={Images.NewAppReskinIcon.ConfirmAll}
                  style={{ height: 36, width: 36,bottom:-10 }}
                />
              </TouchableOpacity>
            </View>
          }
          // rightComponent={
          //      <TouchableHighlight                
          //       onPress={() => {
          //         this._clearAllBlockers();
          //         this.closeMe();
          //       //  this.props.updateModalState("quickControlsModal", true);
          //       }}                
          //       >
          //       <Image
          //         source={Images.NewAppReskinIcon.ConfirmAll}
          //         style={{ position:"absolute", top:-40, left:-30, height: 40, width:40, paddingTop:10, marginTop:10, }}
          //       />
          //     </TouchableHighlight>          
          // }
          centerComponent={{
            text: "Action Messages",
            style: { 
              fontSize:14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily:Constants.fontHeader,          
            },
          }}
        />
        <View style={{ flexGrow: 1, 
         borderBottomRightRadius:20, 
          borderBottomLeftRadius:20, 
          paddingBottom:20,
          overflow:"hidden" }}>
          {/* {this._renderControls()} */}
          {this._renderActionMessageFlatlist()}
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    actionMessages: state.actionMessages.allActionMessages,
  };
};

const mapDispatchToProps = (dispatch) => {
  const driverStateActions = require("@redux/DriverRedux");
  const { actions } = require("@redux/LocationRedux");
  const modalActions = require("@redux/ModalsRedux");
  return {
    checkDriverStatusInApiAndSetDriverActiveVariable: (
      driverId,
      orderIsActive
    ) => {
      console.debug("let's check this shit");
      driverStateActions.actions.checkDriverStatusInApiAndSetDriverActiveVariable(
        dispatch,
        driverId,
        orderIsActive
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ActionMessageAndQuickControlsModal));

//wire up push and pull
