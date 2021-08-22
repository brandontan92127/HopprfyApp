/** @format */

import React from "react";
import {
  View,
  Platform,
  Image,
  TouchableOpacity,
  I18nManager,
  Animated,
  Text
} from "react-native";
import { isEmpty } from "lodash";
import { Styles, Images, Constants, Config } from "@common";
import { NavigationBarIcon, CartIcons } from "@components";
import { toggleDrawer } from "@app/Omni";
import { EventRegister } from 'react-native-event-listeners';

const iconBarTop  = Platform.OS == "android" ? 0 : -6;
const iconTextMinusTop = Platform.OS == "android" ? -18 : -11;
const iconMinusTop= 0;
const headerIconShiftRight = Platform.OS === "ios" ? 4: -4;
const isDark = Config.Theme.isDark;

const NavBarLogo = props => {
  const scrollAnimation =
    props && !isEmpty(props.navigation)
      ? props.navigation.getParam("animatedHeader")
      : new Animated.Value(1);

  //OLD IMAGE WAS Config.LogoImage
  return (
    <Image
      source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
      style={[
        Styles.Common.logo
      ]}
    />
  );
};

const NavBarText = props => {
  const scrollAnimation =
    props && !isEmpty(props.navigation)
      ? props.navigation.getParam("animatedHeader")
      : new Animated.Value(1);

  return (
    <Animated.Text
      style={[
        Styles.Common.headerText,
        { opacity: scrollAnimation },
        isDark ? { color: "#fff" } : { color: "#333" }
      ]}
    >
      {props.text}
    </Animated.Text>
  );
};

// Icons for HeaderBar
const Logo = () => (
  <Image source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo} style={Styles.Common.logo} />
);

const hitSlop = { top: 20, right: 20, bottom: 20, left: 20 };
const Menu = () => (
  <TouchableOpacity style={{top:-2}} hitSlop={hitSlop} onPress={toggleDrawer} >
    <Image
      source={Images.icons.home}
      style={[
        Styles.Common.toolbarIcon,
        { tintColor: "#fff" },
        I18nManager.isRTL && {
          transform: [{ rotate: "180deg" }]
        }
      ]}
    />
  </TouchableOpacity>
);

const EmptyView = () => (
  <View
    style={[
      Styles.Common.Row,
      I18nManager.isRTL ? { left: -10 } : { right: -5 },
      Platform.OS !== "ios" && { right: -12 }
    ]}
  />
);

const HeaderRight = navigation => (
  <View
    style={[
      Styles.Common.Row,
        I18nManager.isRTL ? { left: -10 } : { right: -5 },
        Platform.OS !== "ios" && { right: -12 }
    ]}
  >
    <NavigationBarIcon
      icon={Images.HeaderMenuSearchIcon}
      size={18}
      onPress={() => navigation.navigate("Search")}
    />
  </View>
);

const HeaderHomeRight = (navigation, onPressNetworkPicker, onPressActionMessages) => (  
  <View
    style={[
      Styles.Common.Row,
      // I18nManager.isRTL ? { left: -10 } : { right: 5 },
     // Platform.OS !== "ios" && { right: -12 }
     {
       top : iconBarTop,
       right: headerIconShiftRight
      }
    ]}
  >
  <TouchableOpacity activeOpacity={0.6} onPress={() => EventRegister.emit("openLocationPickerModal")} onLongPress={()=>{ navigation.navigate("NetworksHomeScreen")}}>
   <View style={{ marginLeft: 2 , top:iconMinusTop }}>
    <NavigationBarIcon
      icon={Images.NewWhiteIcons.pin3}
      size={18}
      //  onPress={Events.openModalLayout}
      onPress={() => EventRegister.emit("openLocationPickerModal")}
      onLongPress={()=>  EventRegister.emit("showStoreLocationPickerModal")}
      
      //onLongPress={()=>{ navigation.navigate("PaymentsHomeScreen")}}
      //onLongPress={()=>{ navigation.navigate("NetworksHomeScreen")}}      
    />
      <Text
                  style={{
                    top: iconTextMinusTop,
                   // fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"To"}
                </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity activeOpacity={0.6} onPress={() => EventRegister.emit("openNetworkPickerModal")} onLongPress={()=>EventRegister.emit("showNetworkPicker")}>
    <View style={{ top:iconMinusTop }}>
      <NavigationBarIcon
        icon={Images.NewWhiteIcons.search1}
        size={18}
        onPress={() => EventRegister.emit("openNetworkPickerModal")}
        //onLongPress={()=>EventRegister.emit("showLocationPickerModal")}
        onLongPress={()=>EventRegister.emit("showNetworkPicker")}
      />
                 <Text
                   style={{
                    top: iconTextMinusTop,
                  //  fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Find"}
                </Text>
    </View>  
    </TouchableOpacity>
 
    <TouchableOpacity activeOpacity={0.6} onPress={() => EventRegister.emit("openCourierControlsModal")} onLongPress={()=> EventRegister.emit("toggleDraggablePingersCornerOrCenter")}>
    <View style={{  top:iconMinusTop }}>
    <NavigationBarIcon
      icon={Images.NewWhiteIcons.send1}
      size={18}
      onPress={() => EventRegister.emit("openCourierControlsModal")}
      //onPress={()=>alert("Send features coming June 2021")}
      onLongPress={()=> EventRegister.emit("toggleDraggablePingersCornerOrCenter")}
    />
      <Text
                style={{
                  top: iconTextMinusTop,
                //  fontStyle: "italic",
                  fontFamily:Constants.fontFamily,
                  color: "white",
                  fontSize: 10,
                  textAlign: "center",
                }}
                >
                  {"Send"}
                </Text>
      </View>
  </TouchableOpacity>
  </View>
);

const StoreAndDriverHeader = (navigation, onPressNetworkPicker, onPressActionMessages) => (
  <View
    style={[
      Styles.Common.Row,
      // I18nManager.isRTL ? { left: -10 } : { right: 5 },
      {
        top : iconBarTop,
        right: headerIconShiftRight
       }
    ]}
  >
   <View style={{ marginLeft: 2,top:iconMinusTop }}>
    <NavigationBarIcon
      icon={Images.NewWhiteIcons.pin3}
      size={18}
      //  onPress={Events.openModalLayout}
      onPress={() => EventRegister.emit("showLocationPickerModal")}
      onLongPress={()=>  EventRegister.emit("showStoreLocationPickerModal")}
      
      //onLongPress={()=>{ navigation.navigate("PaymentsHomeScreen")}}
      //onLongPress={()=>{ navigation.navigate("NetworksHomeScreen")}}      
    />
      <Text
                  style={{
                    top: iconTextMinusTop,
                  //  fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"To"}
                </Text>
      </View>

    <View style={{  top:iconMinusTop }}>
      <NavigationBarIcon
        icon={Images.NewWhiteIcons.search1}
        size={18}
        onPress={() => EventRegister.emit("openNetworkPickerModal")}
        onLongPress={()=>EventRegister.emit("showLocationPickerModal")}
        //onLongPress={()=>EventRegister.emit("showNetworkPicker")}
      />
                 <Text
                  style={{
                    top: iconTextMinusTop,
                 //   fontStyle: "italic",
                    fontFamily:Constants.fontFamily,
                    color: "white",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Find"}
                </Text>
    </View>  
 
    <View style={{  top:iconMinusTop }}>
    <NavigationBarIcon
      icon={Images.NewWhiteIcons.Settings1}
      size={18}
      onPress={() => EventRegister.emit("showQuickControlsModal")}
      onLongPress={()=> EventRegister.emit("toggleDraggablePingersCornerOrCenter")}
    />
      <Text
                 style={{
                  top: iconTextMinusTop,
                //  fontStyle: "italic",
                  fontFamily:Constants.fontFamily,
                  color: "white",
                  fontSize: 10,
                  textAlign: "center",
                }}
                >
                  {"On"}
                </Text>
      </View>
  
  </View>
);

const CartWishListIcons = navigation => <CartIcons navigation={navigation} />;

const Back = (navigation, iconBack) => (
  <TouchableOpacity
    hitSlop={hitSlop}
    onPress={() => {
      navigation.goBack(null);
    }}
  >
    <Image
      source={iconBack || Images.icons.back}
      style={[
        Styles.Common.toolbarIcon,
        iconBack && Styles.Common.iconBack,
        {tintColor: "#fff"},
        I18nManager.isRTL && {
          transform: [{ rotate: "180deg" }]
        }
      ]}
    />
  </TouchableOpacity>
);

const RightIcon = (icon, onPress) => (
  <View style={[Styles.Common.Row]}>
    <NavigationBarIcon
      icon={icon}
      size={24}
      onPress={onPress}
      color={isDark ? "#fff" : "#000"}
    />
  </View>
);

export {
  Logo,
  Menu,
  HeaderRight,
  EmptyView,
  CartWishListIcons,
  HeaderHomeRight,
  StoreAndDriverHeader,
  Back,
  NavBarLogo,
  RightIcon,
  NavBarText
};
