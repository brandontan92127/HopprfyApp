/** @format */
import React, { Component } from "react";
import {
  Image,
  Platform,
  View,
  Dimensions,
  I18nManager,
  StyleSheet,
  ListView,
  ScrollView,
  Animated,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
} from "react-native";
import { connect } from "react-redux";
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker,
  CashOutModal,
  FullOrderDisplayModal
} from "@components";
import { Languages, Color, Tools, Config, withTheme, Images } from "@common";
import { getNotification, toast } from "@app/Omni";
import _ from "lodash";
import HopprWorker from "../../services/HopprWorker";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import moment from "moment";
//import styles from "./styles";
import { EventRegister } from "react-native-event-listeners";
import FastImage from 'react-native-fast-image'

const fromEntries = require('fromentries')

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
  },
  storeFrontimageStyle: {
    height: 160,
    minHeight: 160,
    flex: 1,
    width: null,
  },
  weAreOpenimageStyle: {
    height: 40,
    // flex: 1,
    // width: null
  },
  whereIsItImageStyle: {
    height: 30,
    flex: 1,
    width: null,
  },
  headline: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "#6495ED",
    paddingTop: 10,
  },
});
/**Shows user transactions / external account payments */
class PaymentsHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullOrderModalOpenClosed:false,
      selectedNetwork:undefined,
      selectedOrder:undefined,
      selectedOrderAddress: "(Restricted for security)",
      myUserAccountAndTransactions: [],
      inboundPayments: {
        totalIncRefunded: 0.00,
        externalOutboundPayments: [],
        externalOutboundPaymentsRefunds: []
      },
      balance: "0.00",
      pendingBalance: "0.00",
      isLoading: true,
      cashOutModalOpen: false,
    };

    console.debug("In payments home");
  }

  getInboundPayments = async () => {
    console.debug("stop");

    try {
      let pays = await HopprWorker.getOutboundPaymentLastXDays(30);
      if (pays.status == 200) {
        console.debug("stop");

        if (typeof pays !== "undefined") {
          this.setState({
            inboundPayments: pays.data
          });
        }

      }
      else {
        alert("We couldn't get nbound payments, sorry");
      }
    } catch (error) {
      alert("We couldn't get inbound payments, sorry. Exception " + JSON.stringify(error));
    }
  }


  getTransactions = async () => {
    console.debug("stop");
    let trans = await HopprWorker.getTransactionsForLast60Days();
    console.debug("stop");

    if (typeof trans !== "undefined") {
      this.setState({
        myUserAccountAndTransactions: trans.userAccount,
        balance: trans.userAccount.balance,
        pendingBalance: trans.pendingBalance,
      });
    }
  };

  _renderRefundRowIcon = (item) => {
    let isRefundForItem = this.state.inboundPayments.externalOutboundPaymentsRefunds.find(x => x.externalOutboundPaymentId == item.id);
    if (isRefundForItem) {
      return (<View
        style={{
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >

        <Image
          style={{
            margin: 13,
            maxHeight: 50,
            height: 50,
            width: 50,
            maxWidth: 50,
          }}
          source={Images.Close2}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 11,
            color: "silver",
            fontWeight: "bold",
            textAlign: "center",
            textShadowColor: "black",
          }}
        >
          {"Refunded:\n £" + (isRefundForItem.amountRefundedInCents / 100).toFixed(2)}
        </Text>
      </View>)
    } else {
      return (
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >

          <Image
            style={{
              margin: 13,
              maxHeight: 50,
              height: 50,
              width: 50,
              maxWidth: 50,
            }}
            source={Images.Tick1}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 11,
              color: "silver",
              fontWeight: "bold",
              textAlign: "center",
              textShadowColor: "black",
            }}
          >
            {"Cleared"}
          </Text>
        </View>)
    }
  }

  //this is for list
  renderRow = ({ item }) => {

    let networkImg = Images.MoneyBag;
    switch (item.individualPaymentType) {
      case "Driver_Connect_Charge":
        networkImg = Images.AddDriver2;
        break;
      case "Store_Connect_Charge":
        networkImg = Images.MapIconStore11;
        break;
      case "Network_Transaction_Charge":
        networkImg = Images.NetworkSearchAndAdd;
        break;
      case "Platform_Transaction_Charge":
        networkImg = Images.MoneyBag;
        break;
      default:
        networkImg = Images.MoneyBag;
        break;
    }

    //show different image based on state / outcome  
    return (
      <ListItem
        roundAvatar
        // rightIcon={
        //   <Image
        //     style={{
        //       maxHeight: 34,
        //       height: 34,
        //       width: 34,
        //       maxWidth: 34
        //     }}
        //     source={Images.superman1}
        //     resizeMode="contain"
        //   />
        // }
        onPress={async()=>{await this._getFullOrder_SetState_ShowModal(item.orderId)}}
        subtitleNumberOfLines={4}
        titleNumberOfLines={3}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.individualPaymentType.replace(/_/g, " ") + "\n"
          + "For: £" + (item.amountInCents / 100.00).toFixed(2)
        }
        subtitle={
          "Order Id: #" + item.orderId.substring(0, 4) + "\n" +
          "Created: " + moment.parseZone(item.createdDate).format("MMMM DD, YYYY - H:mm") + "\n"
        }
        rightIcon={this._renderRefundRowIcon(item)}
        avatar={
          <Image
            style={{
              maxHeight: 70,
              height: 70,
              width: 70,
              maxWidth: 70,
            }}
            source={networkImg}
            resizeMode="contain"
          />
        }
      // onPress={() => this.showOrderLongPressMenu(item._id)}
      // onLongPress={() => this.showOrderLongPressMenu(item._id)}
      />
    );
  };

  showPaymentsList = () => {
    if (
      this.state.myUserAccountAndTransactions &&
      this.state.myUserAccountAndTransactions.transactions
    ) {
      if(this.state.inboundPayments.externalOutboundPayments.length > 0)
      {
      return (  
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.inboundPayments.externalOutboundPayments}
            renderItem={this.renderRow}
            keyExtractor={(item) => item._id}
          />     
      );
      }
    } 
      return (
        <View>
          <Image
            style={{
              flex: 1,
              maxHeight: 180,
              height: 180,
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
            {"There were no payments to show!"}
          </Text>
        </View>
      );    
  };

  _redirectToLoginIfNotInCorrectRoleOrNotLoggedIn = (user) => {
    if (typeof user !== "undefined") {
      if (typeof user.user !== "undefined" && user.user !== null) {
        if (user.user.roles.find((x) => x === "Driver" || x === "Store")) {
          //we are allowed
          return true;
        }
      }
    }

    const { navigation } = this.props;
    this.props.navigation.navigate("LoginScreen");

    alert(
      "You are not in the correct role, or not logged in. Please register to become a driver or store to access your payments!!"
    );

    return false;
  };

  load = async () => {

    EventRegister.emit("showSpinner");

    try {      
    if (this._redirectToLoginIfNotInCorrectRoleOrNotLoggedIn(this.props.user)) {
      await this.getTransactions();
      await this.getInboundPayments();

      // setInterval(async () => {
      //   await this.getTransactions();
      // }, 18000);
    }
  } catch (error) {
      
  }
  finally{
    EventRegister.emit("hideSpinner");
  }
  };

  _closeFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: false })
  }

  _openFullOrderModal = () => {
    this.setState({ fullOrderModalOpenClosed: true });
  }

  _getFullOrder_SetState_ShowModal = async (orderGuid) => {

    try {
      EventRegister.emit("showSpinner");
      console.debug("");
      
      let newOrderResopnse = await HopprWorker.getOrderInfo(orderGuid);      
      console.debug("");
      if (newOrderResopnse.status == 200) {
        let netsResponse = await HopprWorker.getNetwork(newOrderResopnse.data.networkId)
       
        //lowecase the result so it works
        let entries = Object.entries(netsResponse);
        let capsEntries = entries.map((entry) => [entry[0][0].toLowerCase() + entry[0].slice(1), entry[1]]);
        let netNets = fromEntries(capsEntries);

        this.setState({ selectedOrder: newOrderResopnse.data, selectedNetwork: netNets });
        //get the full order and save       
        //gecode the destaion / network etc
        //open the modal
        //this.closeTabViewModal();
        this._openFullOrderModal();
      } else {
        alert("Sorry that didn't work! Check connectivity!")
      }
    } catch (error) {
      alert("Sorry that didn't work! Check connectivity!")
    }
    finally{
      EventRegister.emit("hideSpinner");
    }
  }

  _renderFullOrderDisplayModal = () => {
    //if (typeof this.state.selectedOrder !== "undefined") {
    if (typeof this.state.selectedNetwork !== "undefined") {
      return (
        <FullOrderDisplayModal
          mode={"customer"}
          closeMe={this._closeFullOrderModal}
          openClosed={this.state.fullOrderModalOpenClosed}
          ref={"fullOrderDisplayModal"}
          orderNetwork={this.state.selectedNetwork}
          orderAndItems={this.state.selectedOrder}
          fullAddress={this.state.selectedOrderAddress}
        />);
    }
    //    }
  }

  unload = async () => { };

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      
    }    
  }

  componentDidMount = async () => {    
    this.unsubscribeWillFocus = this.props.navigation.addListener("willFocus", this.load);
    this.unsubscribeLoseFocus =this.props.navigation.addListener("willBlur", this.unload);
    await this.load();
    showMessage({
      message: "This is the payments view",
      autoHide: true,
      position: "bottom",
      duration: 12000,
      description:
        "Check your inbound payments from selling and driving, how much, you're owed, when they clear, and withdraw the funds. ",
      backgroundColor: "brown", // background color
      color: "white", // text color
    });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Header
          backgroundColor={"#6495ED"}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: "Account Payments",
            style: { color: "#fff" },
          }}
          rightComponent={
            <TouchableOpacity
              onPress={() => this.props.updateModalState("cashoutModal", true)}
            >
              <Image
                source={Images.ShowStripeAccount1}
                style={{ height: 28, width: 28 }}
              />
            </TouchableOpacity>
          }
          leftComponent={{
            icon: "arrow-back",
            color: "#fff",
            onPress: () => this.props.navigation.goBack(),
          }}
        />
        <View style={{ flexGrow: 1}}>
          <FastImage
            source={Images.AnimatedMoney3}
            style={styles.storeFrontimageStyle}
          />
          <Text h1 style={styles.headline}>
            {"Last 30 days: £" + (this.state.inboundPayments.totalIncRefunded / 100.00).toFixed(2)}
          </Text>
          <ScrollView style={{ flexGrow: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "center",
                flex: 1,
              }}
            >
              {/* <Text
                h1
                style={[
                  styles.headline,
                  { fontSize: 11, color: "green", paddingRight: 3 },
                ]}
              >
                {"Cleared: £" +
                  (
                    parseFloat(this.state.balance) -
                    parseFloat(this.state.pendingBalance)
                  ).toFixed(2)}
              </Text> */}
              {/* <Text
                h1
                style={[
                  styles.headline,
                  { fontSize: 11, color: "orange", paddingLeft: 3 },
                ]}
              >
                {"Pending: £" + this.state.pendingBalance}
              </Text> */}
            </View>
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableHighlight
                onPress={() =>
                // this.props.updateModalState("cashoutModal", true)
                  this.props.updateModalState("salesBIModal", true)
                }
              >
                <Image
                  style={{
                    margin: 13,
                    maxHeight: 50,
                    height: 50,
                    width: 50,
                    maxWidth: 50,
                  }}
                  source={Images.CreditCards2}
                  resizeMode="contain"
                />
              </TouchableHighlight>
              <Text
                style={{
                  fontSize: 8,
                  color: "silver",
                  fontWeight: "bold",
                  textAlign: "center",
                  textShadowColor: "black",
                }}
              >
                {"Analytics"}
              </Text>
            </View>
            <Divider
              style={{
                margin: 18,
                marginLeft: 80,
                marginRight: 80,
                backgroundColor: "#6495ED",
              }}
            />
            <Text h1 style={styles.headline}>
              {"Recent payments"}
            </Text>
            <View style={{flex:1, paddingBottom:40}}>
              {this.showPaymentsList()}
            </View>
          </ScrollView>
        </View>

        {this._renderFullOrderDisplayModal()}
      </View>
    );
  }
}
const mapStateToProps = ({ user }) => ({
  user: user,
});

const mapDispatchToProps = (dispatch) => {
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
)(withTheme(PaymentsHome));
