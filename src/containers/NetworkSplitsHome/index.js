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
  TouchableHighlight,
  Alert,
  TouchableOpacity,
  TextInput
} from "react-native";
import { connect } from "react-redux";
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker,
} from "@components";
import { Languages, Color, Tools, Config, withTheme, Images, GlobalStyle } from "@common";
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
import { ECharts } from "react-native-echarts-wrapper";
import EChartsOptions from "../../components/Modals/BI/EChartsOptions"
import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import { EventRegister } from "react-native-event-listeners";

//import styles from "./styles";

const { width, height } = Dimensions.get("window");
const defaultState = {
  networkSplits: [],
  network: undefined,
  splitPieChartJsonOptions: EChartsOptions.NetworkSplits,
  showAddNewSplitsBar: false,

  percentToAdd: 0,
  usernameToAdd: "",

}

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
    color: "red",
    paddingTop: 10,
  },
});

/**Shows user transactions / external account payments */
class NetworkSplitsHome extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    console.debug("In network splits ");
  }

  _reloadPageData = async (networkPassed) => {
    let splitResponse = await HopprWorker.getNetworkSplits(networkPassed.networkId);
    if (splitResponse.status == 200) {
      this.setState({ networkSplits: splitResponse.data, network: networkPassed }, () => {
        this._generatePieChartDataSet(splitResponse.data);
      })
      console.debug("stop");
    }
    else {
      alert("Sorry, that didn't work? Check connectivity.");
    }
  }

  load = async () => {
    const { navigation } = this.props;
    var networkPassed = this.props.navigation.getParam(
      "network",
      undefined
    );

    await this._reloadPageData(networkPassed);
  }

  _addNewNetworkSplit = async () => {

    //validate
    let netId = this.state.network.networkId;
    let userNameToAdd = this.state.usernameToAdd;
    let newPercent = this.state.percentToAdd;

    this.setState({ showAddNewSplitsBar: false })

    let afterDesc = `New ${newPercent}% split added for ${userNameToAdd}`;
    //end
    try {
      EventRegister.emit("showSpinner");
      let rezzy = await HopprWorker.addNetworkSplit(netId, newPercent, userNameToAdd);
      if (rezzy.status == 200) {
        showMessage({
          style:{    
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          },            
          position: "top",
          message: "Created!",
          description:
            afterDesc,
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          color: "white", // text color,
          duration: 4000,
          autoHide: true,
          // onPress: () => this.triggerActionMessagesModal()
        });

        await this._reloadPageData(this.state.network);
      } else {
        showMessage({
          message: "That failed!",
          duration: 8000,
          backgroundColor: "red", // background color
          description:
            "Are you trying to add more than the available %?",
          color: "white", // text color
          autoHide: true,
        });
        //alert("Sorry that didn't work!");
      }
    } catch (error) {
      alert("Whoa - that really didn't work!");
    }
    finally {
      EventRegister.emit("hideSpinner");
    }



  }

  onRef = (ref) => {
    if (ref) {
      this.chart = ref;
    }
  };

  unload = async () => {
    //clear up
    this.setState
    console.debug("stop");
  }

  _generatePieChartDataSet = (splitsData) => {
    let option = this.state.splitPieChartJsonOptions;

    let legendArrayData = [];
    let seriesArrayData = [];

    splitsData.map(eachSplit => {
      legendArrayData.push(eachSplit.userName);
      seriesArrayData.push({ value: eachSplit.splitPercentage, name: eachSplit.userName });
    });

    option.legend.data = legendArrayData;
    option.series[0].data = seriesArrayData;//[{ value: 1535, name: 'Booza.store' }]

    //set title
    let headerTitle = "Network Fees";
    if (typeof this.state.network !== "undefined") {
      headerTitle = this.state.network.storeName + " Fees";
    }
    option.title.text = headerTitle;

    this.setState({ splitPieChartJsonOptions: option }, () => {
      this.chart.setOption(option);
    })
  }

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
  };

  _renderDeleteSplitButton = (index, item) => {
    if (index != 0) { //can't delete own share which is returned first
      return (
        <View style={{ padding: 4 }}>
          {/* DELETE BUTTON */}
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
                EventRegister.emit("showSpinner");
                try {
                  let deleteResult = await HopprWorker.deleteNetworkSplit(item.id);
                  if (deleteResult.status = 204) {

                    showMessage({
                      style:{    
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20
                      },            
                      position: "top",
                      message: "Deleted!",
                      description: "More money for you.",
                      backgroundColor: GlobalStyle.primaryColorDark.color, // background color
                      color: "white", // text color,
                      duration: 4000,
                      autoHide: true,
                      // onPress: () => this.triggerActionMessagesModal()
                    });

                    await this._reloadPageData(this.state.network);
                  } else {
                    showMessage({
                      message: "That failed!",
                      duration: 8000,
                      backgroundColor: "red", // background color
                      description:
                        "Are you sure you have connectivity?",
                      color: "white", // text color
                      autoHide: true,
                    });
                    //alert("Sorry that didn't work!");
                  }
                } catch (error) {

                }
                finally {
                  EventRegister.emit("hideSpinner");
                }
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
                source={Images.Delete1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={{ textAlign: "center", fontSize: 8, color: "black" }}>
            {"Remove"}
          </Text>
        </View>
      );
    }

    return null;
  }

  _renderRow = ({ item, i }) => {
    const networkImageUrl = Config.NetworkImageBaseUrl + this.state.network.storeLogoUrl;
    return (
      <ListItem
        subtitleNumberOfLines={2}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={item.splitPercentage + "% share"}
        subtitle={item.userName}
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 120,
              height: 100,
              width: 100,
              maxWidth: 120,
              padding: 5,
              marginRight: 5
              //   width: undefined
            }}
            source={{ uri: networkImageUrl }}
            resizeMode="contain"
          />
        }
        //switched={item.active}
        // onSwitch={async () => {
        //   console.debug("About to toggle");

        // }}
        rightIcon={this._renderDeleteSplitButton(i, item)}
        switchTintColor={"grey"}
      // onPress={() => this.deletePermissions(item.permission.id)}
      // onLongPress={() => this.deletePermissions(item.permission.id)}        
      />
    );
  };

  _renderSplitsList = () => {
    if (typeof this.state.network !== "undefined") {
      if (this.state.networkSplits.length > 0) {
        return (<List style={{ flexGrow: 1 }}>
          <FlatList
            style={{ flexGrow: 1 }}
            data={this.state.networkSplits}
            renderItem={this._renderRow}
          //keyExtractor={(item) => item.networkId}
          // refreshing={this.state.refreshing}
          />
        </List>);
      }
    }
  }

  _rendershowAddNewSplitsBar = () => {
    if (this.state.showAddNewSplitsBar) {
      return <View style={{
        marginLeft: 4,
        marginRight: 4,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
      }}>

        <View style={{ margin: 4 }}>
          <Text
            style={{
              textAlignVertical: "center",
              margin: 3,
              textAlign: "center",
              fontSize: 11,
              color: "black",
            }}
          >
            {"Who:"}
          </Text>
          <TextInput
            style={{
              fontSize: 13,
              flex: 1,
              margin: 2,
              borderWidth: 2,
              borderRadius: 15,
              borderColor: "red",
              color: "black",
            }}
            placeholderTextColor={"silver"}
            placeholder={"e.g. jimbob@gmail.com"}
            onChangeText={(value) => this.setState({ usernameToAdd: value })}
            value={this.state.usernameToAdd}
          />
        </View>
        <View style={{ margin: 4 }}>
          <Text
            style={{
              textAlignVertical: "center",
              margin: 3,
              textAlign: "center",
              fontSize: 11,
              color: "black",
            }}
          >
            {"How much (in %):"}
          </Text>
          <TextInput
            style={{
              keyboardType: 'numeric',
              fontSize: 13,
              flex: 1,
              margin: 2,
              borderWidth: 2,
              borderRadius: 15,
              borderColor: "black",
              color: "black",
            }}
            placeholderTextColor={"silver"}
            placeholder={"   e.g. 10.8"}
            onChangeText={(value) => this.setState({ percentToAdd: value })}
            value={this.state.percentToAdd}
          />
        </View>
        {/* SET AND GO */}
        <View style={{ margin: 4 }}>
          <TouchableHighlight
            onPress={async () => {
              await this._addNewNetworkSplit();
            }}
          >
            <View style={{
              flex: 1,
              margin: 4
            }}>
              <Image
                source={Images.Tick3}
                style={{
                  paddingTop: 5,
                  height: 50,
                  width: 50,
                  bottom: 0
                }}
              />
              {/* <Text
                style={{
                  fontStyle: "italic",
                  color: "grey",
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                {"Go!"}
              </Text> */}
            </View>
          </TouchableHighlight>
        </View>
      </View>
    }

    return null;

  }

  _toggleNetworkSplitsBarShown = () => {
    let newShownVal = this.state.showAddNewSplitsBar == false ? true : false;
    this.setState({ showAddNewSplitsBar: newShownVal })
  }


  render() {
    const screenWidth = Dimensions.get("window").width;
    const piedata = [
      {
        name: "Seoul",
        population: 21500000,
        color: "rgba(131, 167, 234, 1)",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Toronto",
        population: 2800000,
        color: "#F00",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Beijing",
        population: 527612,
        color: "red",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "New York",
        population: 8538000,
        color: "#ffffff",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Moscow",
        population: 11920000,
        color: "rgb(0, 0, 255)",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];
    const chartConfig = {
      backgroundGradientFrom: "#1E2923",
      backgroundGradientTo: "#08130D",
      color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
      strokeWidth: 2, // optional, default 3
    };

    let headerTitle = "";
    if (typeof this.state.network !== "undefined") {
      headerTitle = this.state.network.storeName;
    }

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* <Header
          backgroundColor={"red"}
          outerContainerStyles={{ height: 49 }}
          centerComponent={{
            text: headerTitle + " splits:",
            style: { color: "#fff" },
          }}
          rightComponent={{
            icon: "help",
            color: "#fff",
            //onPress: () => this.props.updateModalState("salesBIModal", true)
          }}
        // leftComponent={this._renderStoreActiveIcon()}
        /> */}
        <View style={{ flexGrow: 1, marginBottom: 5 }}>
          {/* SPLITS */}
          <ScrollView style={{ flexGrow: 1 }} >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <View>
                {/* <Text
                  style={{
                    color: "black",
                    margin: 5,
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  {"Splits:"}
                </Text> */}
                <View style={{ height: 310, width: width }}>
                  <ECharts ref={this.onRef}
                    option={this.state.splitPieChartJsonOptions}
                    height={280} />
                </View>
              </View>
              {/* SPLIT ADD BUTTON */}
              <TouchableOpacity
                style={{ paddingTop: 10 }}
                onPress={async () => {
                  console.debug("stop");
                  this._toggleNetworkSplitsBarShown();
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
                  source={Images.Add1Pink}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={{ textAlign: "center", fontSize: 12, color: "black" }}>
                {"Add\nNTC split"}
              </Text>

              {/* ADD BAR */}
              {this._rendershowAddNewSplitsBar()}
              {/* LIST */}
              {this._renderSplitsList()}
            </View>
          </ScrollView>
        </View>
      </View >
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
)(withTheme(NetworkSplitsHome));
