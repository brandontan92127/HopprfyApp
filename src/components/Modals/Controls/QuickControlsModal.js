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
  Platform,
  Vibration,
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
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { NetworkDisplay } from "@components";
import { Images } from "@common";
import { toast } from "../../../Omni";
import { connect } from "react-redux";
import SwitchToggle from "react-native-switch-toggle";
import SoundPlayer from "react-native-sound-player";
import HopprWorker from "@services/HopprWorker";
import { showMessage, hideMessage } from "react-native-flash-message";
import { EventRegister } from "react-native-event-listeners";
import { isIphoneX } from "react-native-iphone-x-helper";

const { width, height } = Dimensions.get("window");
const outerSidePaddingForContainers = width * 0.13;
const sizeOfImageIcon = width* 0.1;

const styles = StyleSheet.create({  
  mainModalHeight:isIphoneX() ? 290 : 230,
  modalTopPadding: isIphoneX() ? 60 : 18,
  modalCloseIconTopPadding: isIphoneX() ? 18 : 1,
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

class QuickControlsModal extends Component {
  constructor(props) {
    super(props);
    console.debug("QuickControlsModal modal constructor");
    this.state = {};
  }

  componentDidMount= async ()=>{
    this.checkAndSetDriverState =  EventRegister.addEventListener(
      "checkAndSetDriverState",
      async () => await  this._checkAndSetDriverState()
    );

    this.checkAndSetStoreState =  EventRegister.addEventListener(
      "checkAndSetStoreState",
      async () => await this._checkAndSetStoreState()
    );
  }
  componentWillUnmount=()=>{
    EventRegister.removeEventListener(this.checkAndSetDriverState);
    EventRegister.removeEventListener(this.checkAndSetStoreState);
  }

  _checkAndSetStoreState=async ()=>{
    if (typeof this.props.user.user.storeId !== "undefined") {
      //update statuses if we're logged in
      await this.getStoreActiveState(this.props.user.user.storeId);
     
    }
  }

  _checkAndSetDriverState= async ()=>{
    if (typeof this.props.user.user.driverId !== "undefined") {
      //update statuses if we're logged in
      await this.getDriverActiveState(this.props.user.user.driverId);
    }
  }
  
  load = async () => {
    console.debug("in quick controls");
    //make sure logged in
    if (
      this.props.user.user != null &&
      typeof this.props.user.user !== "undefined"
    ) {

      if (this.props.user.user.roles.find((x) => x === "Driver")) {
        //we are allowed
        await this._checkAndSetDriverState();                
      }
     
      if (this.props.user.user.roles.find((x) => x === "Store")) {
        //we are allowed
        await this._checkAndSetStoreState();
      }
      
      if(!this.props.user.user.roles.find((x) => x === "Driver") && !this.props.user.user.roles.find((x) => x === "Store"))
      {
        this.closeMe();          
        showMessage({              
          message: "You're not a driver or a store!",
          description:
            "Why not sign up?",          
          autoHide: true,
          duration:6000,
          style:{    
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20},            
            position: "top",
          backgroundColor: GlobalStyle.primaryColorDark.color, // background color
          hideOnPress: true,
        });
      }
      
    } else {
      this.closeMe();
      setTimeout(()=>{
        alert("You're not logged in, so you can't access any controls!!");
      },2000);
      
    
    }
  };

  //DRIVER METHODS
  getDriverActiveState = async (driverId) => {
    console.debug("get driver state and set in redux");
    await this.props
      .checkDriverStatusInApiAndSetDriverActiveVariable(
        this.props.user.user.driverId,
        this.props.orderIsActive
      )
      .then((driverState) => {
        if (driverState != "OFFLINE") {
          //we're supposed to be online, so activate everything if we are
          this.turnDriverOn(driverId);                      
            //refresh
            showMessage({              
              style: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
              message: "Driver is on",
              description:
                "Based on your last settings. You are taking orders",
              type: "success",
              autoHide: true,
              duration:3000,
              position: "bottom",
              backgroundColor: GlobalStyle.primaryColorDark.color, // background color
              hideOnPress: true,
            });
        }
      })
      .catch((err) => {
        console.debug(err);
      });
  };

  toggleDriverActive = async () => {
    if (
      this.props.user.user != null &&
      typeof this.props.user.user !== "undefined"
    ) {
      if (typeof this.props.user.user.driverId !== "undefined") {
        //if there's no user tell them log in
        if (this.props.driverActive == true) {
          this.turnDriverOff(
            this.props.user.user.driverId,
            this.props.keepAliveCycleTimerId
          );
        } else {
          this.turnDriverOn(this.props.user.user.driverId);
        }
      } else {
        alert("There's no logged in driver to toggle!");
      }
    } else {
      alert("There's no logged in driver to toggle!");
    }
  };

  turnDriverOff = async (driverid) => {
    this.props.turnDriverOff(driverid, this.props.keepAliveCycleTimerId);
    this.props.updateDriverState(false, this.props.orderIsActive);
    this.props.endLocationWatchWithApiLocationPush(this.props.locationWatchId);
    toast("Driver Off");
  };
  turnDriverOn = async (driverid) => {
    this.props.turnDriverOn(driverid);
    this.props.updateDriverState(true, this.props.orderIsActive);
    this.props.startLocationWatchAndApiLocationPush(
      driverid,
      "locations/drivers",
      this.props.locationWatchId
    );

    SoundPlayer.playSoundFile("notification2", "mp3");
    Vibration.vibrate(500);
    toast("Driver On");
    showMessage({
      style:{    borderTopLeftRadius: 20,
        borderTopRightRadius: 20,},
      message: "You are driver active",
      autoHide: true,
      duration: 3000,
      position: "bottom",
      description: "You're now taking orders.",
      backgroundColor: GlobalStyle.primaryColorDark.color, // background color
      color: "white", // text color
    });
  };

  //STORE METHODS
  /**Asks the API if the store is on or not */
  getStoreActiveState = async (storeId) => {
    console.debug("get stores state");
    let storeState = await HopprWorker.getStoreActiveState(storeId);
    if (typeof storeState !== "undefined")
      if (storeState.length > 0) {
        let aStoreState = storeState[0];
        let isActive = aStoreState.active;
        this.props.updateStoreActive(storeState[0].active);

        // showMessage({
        //   style:{    borderTopLeftRadius: 20,
        //     borderTopRightRadius: 20,},
        //   message: "Your store is active",
        //   description:
        //     "Based on your API settings.",
        //   type: "success",
        //   autoHide: true,
        //   duration:3000,
        //   position: "bottom",
        //   backgroundColor: GlobalStyle.primaryColorDark.color, // background color
        //   hideOnPress: true,
        // });

      }
  };

  toggleStoreActive = async () => {
    if (this.props.storeActive == true) {
      this.turnStoreOff();
    } else {
      this.turnStoreOn();
    }
  };

  turnStoreOff = async () => {
    try {
      let activeResult = HopprWorker.turnStoreOff(this.props.user.user.storeId);
      //should only do this upon success
      this.props.updateStoreActive(false);
      toast("Store Off");
    } catch (error) {
      console.debug("Couldn't turn store off");
    }
  };

  turnStoreOn = async () => {
    try {
      await HopprWorker.turnStoreOn(this.props.user.user.storeId);
      this.props.updateStoreActive(true);
      SoundPlayer.playSoundFile("notification6", "mp3");
      Vibration.vibrate(500);
      toast("Store On");

      showMessage({
        style:{    borderTopLeftRadius: 20,
          borderTopRightRadius: 20,},
        message: "You are store active",
        autoHide: true,
        duration: 3000,
        position: "bottom",
        description: "You're now taking orders.",
        backgroundColor: GlobalStyle.primaryColorDark.color,
        color: "white", // text color
      });
    } catch (error) {
      console.debug("Couldn't turn store on");
    }
  };

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    console.debug("Welcome to quick controls modal");
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{ height: styles.mainModalHeight, backgroundColor: "white", borderRadius: 8 }}
        backdrop={true}
        backdropOpacity={0.2}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={true}
        position={"top"}
        ref={"quickControlsModal"}
        isOpen={this.props.openClosed}
        onOpened={async () => await this.load()}
        onClosed={() => this.closeMe()}
      >      
      <View style={{flex:1, 
        paddingTop:styles.modalTopPadding,
        backgroundColor : GlobalStyle.primaryColorDark.color,
        
        }}>        
        <Image
          style={{
            padding: 1,
            maxHeight: 55,
            height: 105,
            width: 155,
            maxWidth: 155,
            alignSelf: "center",
            marginBottom: 10
          }}
          source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
          resizeMode="contain"
        />
        {/* CLICK TO CLOSE ROW */}
        <View
          style={{
            position: "absolute",
            border: 1,
            right:1,
            top:styles.modalCloseIconTopPadding,
            paddingTop: 8,
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignContent: "flex-end",
            height: 130,
            maxHeight: 130,
          }}
        >
          <TouchableOpacity
            style={{
              maxHeight: 50,
              height: 50,
              width: 50,
              maxWidth: 50,
            }}
            onPress={() => {
              this.props.closeMe();
            }}
          >
            <Image
              style={{
                padding: 1,
                maxHeight: 50,
                height: 50,
                width: 50,
                maxWidth: 50,
                alignSelf: "flex-end",
              }}
              source={Images.NewAppReskinIcon.Close}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* COLUM FOR LOGO TEXT */}
        <View style={{
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          marginBottom:10,
        }}>

          {/* MAIN VIEW */}
          <Text
            style={{          
              fontFamily: Constants.fontFamilyItalic,
              color: "white",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {"QUICK CONTROLS:"}
          </Text>
        </View>
        <View
          style={{
            height: 100,
            borderRadius: 8,
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
            alignItems:"center"
          }}
        >
          {/* //ICONS BOX FOR STORE */}
          <View
            style={{            
              backgroundColor:GlobalStyle.switchBGColor.color, 
              padding:10,
              borderRadius:30,
              marginTop: 6,
              margin: 4,
              marginLeft:outerSidePaddingForContainers,
              marginRight:12,
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              alignItems:"center",
            }}
          >
            {/* START CONTROLS */}
            {/* ICON BOX */}
            {/* //ICON 1 */}
            <View
              style={{
                marginTop: 3,
                alignContent: "center",
                justifyContent: "center",
                alignItems:"center",
              }}
            >
              <TouchableOpacity>
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 5,
                    maxHeight: sizeOfImageIcon,
                    height: sizeOfImageIcon,
                    width: sizeOfImageIcon,
                    maxWidth: sizeOfImageIcon,
                  }}
                  source={Images.NewAppReskinIcon.Store}
                  resizeMode="contain"
                />
                <Text
                style={{
                  textAlign:"center",
                  fontFamily: Constants.fontHeader,
                  color: "white",
                  fontWeight:"bold",
                  fontSize: 16,
                }}
              >
                {"Shop"}
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
                justifyContent: "center",
                margin:10,
                marginLeft:14,
                marginRight:14,
              }}
            >
              <SwitchToggle
                backgroundColorOff={GlobalStyle.switchToggleColorOff.color}
                backgroundColorOn={GlobalStyle.switchToggleColorOn.color}
                containerStyle={{
                  width: 75,
                  height: 38,
                  borderRadius: 25,
                  backgroundColor: "hotpink",
                  backgroundColorOn: "hotpink",
                  backgroundColorOff: "hotpink",
                  padding: 5,
                }}
                circleStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 19,
                  backgroundColor: GlobalStyle.primaryColorDark.color
                }}
                switchOn={this.props.storeActive}
                onPress={() => this.toggleStoreActive()}
                circleColorOff={GlobalStyle.primaryColorDark.color}
                circleColorOn={GlobalStyle.primaryColorDark.color}
                duration={300}
              />              
            </View>
          </View>

          {/* SECOND DRIVER ICON AND TOGGLE */}
          <View
            style={{            
              backgroundColor:GlobalStyle.switchBGColor.color, 
              padding:10,
              borderRadius:30,
              marginTop: 6,
              margin: 4,
              marginLeft:12,
              marginRight:outerSidePaddingForContainers,
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              alignItems:"center",
            }}
          >
            {/* START CONTROLS */}
            {/* ICON BOX */}
            {/* //ICON 1 */}
            <View
              style={{
                marginTop: 3,
                alignContent: "center",
                justifyContent: "center",
                alignItems:"center",
              }}
            >
              <TouchableOpacity>
                <Image
                  style={{
                    alignSelf: "center",
                    margin: 5,
                    maxHeight: sizeOfImageIcon,
                    height: sizeOfImageIcon,
                    width: sizeOfImageIcon,
                    maxWidth: sizeOfImageIcon,
                  }}
                  source={Images.NewAppReskinIcon.Driver}
                  resizeMode="contain"
                />
                <Text
                style={{
                  textAlign:"center",
                  fontFamily: Constants.fontHeader,
                  color: "white",
                  fontWeight:"bold",
                  fontSize: 16,
                }}
              >
                {"Driver"}
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
                justifyContent: "center",
                margin:10,
                marginLeft:14,
                marginRight:14,
              }}
            >
              <SwitchToggle
                backgroundColorOff={GlobalStyle.switchToggleColorOff.color}
                backgroundColorOn={GlobalStyle.switchToggleColorOn.color}
                containerStyle={{
                  width: 75,
                  height: 38,
                  borderRadius: 25,
                  backgroundColor: "hotpink",
                  backgroundColorOn: "hotpink",
                  backgroundColorOff: "hotpink",
                  padding: 5,
                }}
                circleStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 19,
                  backgroundColor: GlobalStyle.primaryColorDark.color
                }}
                switchOn={this.props.driverActive}
                onPress={() => this.toggleDriverActive()}
                circleColorOff={GlobalStyle.primaryColorDark.color}
                circleColorOn={GlobalStyle.primaryColorDark.color}
                duration={300}
              />      
            </View>
          </View>
        </View>

        </View>  
      </Modal >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    locationWatchId: state.location.locationWatchId,
    storeActive: state.store.storeActive,
    driverActive: state.driver.driverActive,
    orderIsActive: state.driver.orderIsActive,
    keepAliveCycleTimerId: state.driver.keepAliveCycleTimerId,
    latestStorePickerLocationText: state.location.latestStorePickerLocationText,
  };
};

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/StoreRedux");
  const modalActions = require("@redux/ModalsRedux");
  const locationActions = require("@redux/LocationRedux");
  const driverStateActions = require("@redux/DriverRedux");
  return {
    checkDriverStatusInApiAndSetDriverActiveVariable: async (
      driverId,
      orderIsActive
    ) => {
      console.debug("let's check this shit");
      return driverStateActions.actions.checkDriverStatusInApiAndSetDriverActiveVariable(
        dispatch,
        driverId,
        orderIsActive
      );
    },
    turnDriverOn: (driverId) => {
      console.debug("About to turn driver on");
      try {
        // dispatch(
        driverStateActions.actions.turnDriverOn(dispatch, driverId);
      } catch (error) {
        console.debug(error);
      }
    },
    turnDriverOff: (driverId, timerId) => {
      try {
        driverStateActions.actions.turnDriverOff(dispatch, driverId, timerId);
      } catch (error) {
        console.debug(error);
      }
    },
    updateDriverState: async (_driverActive, _orderIsActive) => {
      console.debug("driver active:" + _driverActive + " " + _orderIsActive);
      let activeDriverState = {
        driverActive: _driverActive,
        orderIsActive: _orderIsActive,
      };
      dispatch(
        driverStateActions.actions.updateDriverState(
          dispatch,
          activeDriverState
        )
      );
    },
    updateStoreActive: async (storeActive) => {
      console.debug("Updating store active");
      dispatch(actions.updateStoreActive(dispatch, storeActive));
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
    //this sets the order location
    pushStoreLocation: async (pickedLatLng, latestPickerDestinationText) => {
      dispatch(
        locationActions.actions.setStoreLocation(
          dispatch,
          pickedLatLng,
          latestPickerDestinationText
        )
      );
    },
    startLocationWatchAndApiLocationPush: async (
      relationGuid,
      urlToPostTo,
      locationWatchId
    ) => {
      locationActions.actions.startLocationWatchWithApiLocationPush(
        dispatch,
        relationGuid,
        urlToPostTo,
        locationWatchId
      );
    },
    endLocationWatchWithApiLocationPush: async (locationWatchId) => {
      locationActions.actions.endLocationWatchWithApiLocationPush(
        dispatch,
        locationWatchId
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(QuickControlsModal));
