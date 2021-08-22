/** @format */

import React, { PureComponent } from "react";
import { View, ScrollView, Text, Switch } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import { connect } from "react-redux";
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker
} from "@components";
import { Languages, Color, Tools, Config, withTheme, Images } from "@common";
import { getNotification, toast } from "@app/Omni";
import _ from "lodash";
import styles from "./styles";

class UserProfile extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pushNotification: false,
      isLoading: true
    };
  }

  async componentDidMount() {
    const notification = await getNotification();
    console.debug("notification", notification);
    this.setState({
      pushNotification: notification || false
    });
  }

  /**
   * TODO: refactor to config.js file
   */
  _getListItem = () => {
    const { currency, wishListTotal, userProfile } = this.props;

    let listItemLocal = [...Config.ProfileSettings];
    let items = [];
    for (var i = 0; i < listItemLocal.length; i++) {
      var item = listItemLocal[i];
      if (item.label == "PushNotification") {
        item.icon = () => (
          <Switch
            onValueChange={this._handleSwitch}
            value={this.state.pushNotification}
            tintColor={Color.blackDivide}
          />
        );
      }
      if (item.label == "Currency") {
        item.value = currency.code;
      }

      if (item.label == "WishList") {
        items.push({
          ...item,
          label: `${Languages.WishList} (${wishListTotal})`
        });
      } else {
        items.push({ ...item, label: Languages[item.label] });
      }
    }

    const listItem = [
      // {
      //   label: `${Languages.WishList} (${wishListTotal})`,
      //   routeName: "WishListScreen",
      // },
      // {
      //   label: Languages.Currency,
      //   value: currency.code,
      //   isActionSheet: true,
      // },
      // only support mstore pro
      // {
      //   label: Languages.Languages,
      //   routeName: "SettingScreen",
      //   value: Languages.LanguageName,
      // },
      // {
      //   label: Languages.PushNotification,
      //   icon: () => (
      //     <Switch
      //       onValueChange={this._handleSwitch}
      //       value={this.state.pushNotification}
      //       tintColor={Color.blackDivide}
      //     />
      //   ),
      // },
      // {
      //   label: Languages.contactus,
      //   routeName: "CustomPage",
      //   params: {
      //     id: 10941,
      //     title: Languages.contactus,
      //   },
      // },
      // {
      //   label: Languages.Privacy,
      //   routeName: "CustomPage",
      //   params: {
      //     id: 10941,
      //     title: Languages.Privacy,
      //   },
      // },
      // {
      //   label: Languages.About,
      //   routeName: "CustomPage",
      //   params: {
      //     url: "http://inspireui.com",
      //   },
      // },
    ];

    if (!userProfile.user) {
      var index = _.findIndex(items, item => item.label == Languages.Address);
      if (index > -1) {
        items.splice(index, 1);
      }
    }

    if (!userProfile.user || Config.HideCartAndCheckout) {
      var index = _.findIndex(items, item => item.label == Languages.MyOrder);
      if (index > -1) {
        items.splice(index, 1);
      }
    }
    return items;
  };

  _handleSwitch = value => {
    AsyncStorage.setItem("@notification", JSON.stringify(value), () => {
      this.setState({
        pushNotification: value
      });
    });
  };

  _handlePress = item => {
    const { navigation } = this.props;
    const { routeName, isActionSheet } = item;

    if (routeName && !isActionSheet) {
      navigation.navigate(routeName, item.params);
    }

    if (isActionSheet) {
      this.currencyPicker.openModal();
    }
  };

  render() {
    const { userProfile, language, navigation, currency, changeCurrency } =
      this.props;
    const user = userProfile.user || {};
    const name = user.customer
      ? `${user.customer.firstName} ${user.customer.lastName}`
      : "Guest";
    const listItem = this._getListItem(); //THfrecentIS IS IN FILE TWICE
    const {
      theme: {
        colors: { background, text, lineColor }
      }
    } = this.props;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: "#F8F8F8",
            marginTop: 18
          }
        ]}
      >
        <View style={{ width: "95%", alignSelf: "center" }}>
          <ScrollView ref='scrollView' showsVerticalScrollIndicator={false}>
            <UserProfileHeader
              onLogin={() => navigation.navigate("LoginScreen")}
              onLogout={() =>
                navigation.navigate("LoginScreen", { isLogout: true })
              }
              user={{
                ...user,
                name
              }}
            />
            <View>
              <Text style={styles.headerSection}>
                {`${Config.InAppName} help`.toUpperCase()}
              </Text>
              <UserProfileItem
                label={"Take The Tour"}
                onPress={() =>
                  this.props.updateModalState("startingHelpModal", true)
                }
                value={"(User guide)"}
                type={"image"}
                image={Images.InfoQuestion6}
              />
            </View>
            <View>
              <View style={[styles.profileSection, { borderColor: lineColor }]}>
                <Text style={styles.headerSection}>
                  {Languages.AccountInformations.toUpperCase()}
                </Text>
                <View style={styles.row}>
                  <UserProfileItem
                    label={"Name"}
                    value={name}
                    type={"subtitle"}
                  />
                  <UserProfileItem
                    label={Languages.Email}
                    value={user.email}
                    type={"subtitle"}
                  />
                </View>
                {userProfile.user && (
                  <View>
                    <View style={styles.row}>
                      {/* <UserProfileItem
                  label={Languages.Name}
                  onPress={this._handlePress}
                  value={name}
                />                 */}

                      {/* <UserProfileItem
                  label={Languages.Address}
                  value={user.address}
                /> */}
                      <UserProfileItem
                        label={"Your Orders"}
                        onPress={() => navigation.navigate("MyOrders")}
                        value={""}
                      />
                      <UserProfileItem
                        label={"Payment Card Details"}
                        onPress={() =>
                          this.props.updateModalState(
                            "addRemoveCardModal",
                            true
                          )
                        }
                        value={""}
                      />
                    </View>

                    {/* MY HOPPR */}
                    <View
                      style={[
                        styles.profileSection,
                        { borderColor: lineColor }
                      ]}
                    >
                      <Text style={styles.headerSection}>
                        {`${Config.InAppName} Role`.toUpperCase()}
                      </Text>
                      <View style={styles.row}>
                        <UserProfileItem
                          label={"Driver"}
                          onPress={() =>
                            navigation.navigate("DriverHomeScreen")
                          }
                          value={"Let's Go!"}
                          type={"subtitle"}
                        />
                        <UserProfileItem
                          label={"Vendor"}
                          onPress={() => navigation.navigate("StoreHomeScreen")}
                          value={"Enter Client"}
                          type={"subtitle"}
                        />
                      </View>
                      <View
                        style={{ ...styles.row, justifyContent: "flex-start" }}
                      >
                        <UserProfileItem
                          label={"Network Owner"}
                          onPress={() => navigation.navigate("BIMapScreen")}
                          value={"View Networks"}
                          type={"subtitle"}
                        />
                      </View>
                      <Text style={styles.headerSection}>
                        {`MY ${Config.InAppName.toUpperCase()}`}
                      </Text>
                      {/* <UserProfileItem
                  label={"Recents Payouts"}
                  onPress={() =>
                    this.props.updateModalState("cashoutModal", true)
                  }
                  value={"(Stores / Drivers)"}
                /> */}

                      <View style={styles.row}>
                        <UserProfileItem
                          label={"Payment History"}
                          onPress={() =>
                            navigation.navigate("PaymentsHomeScreen")
                          }
                          value={""}
                        />
                        {
                          <UserProfileItem
                            label={"My Networks"}
                            onPress={() =>
                              navigation.navigate("NetworksHomeScreen")
                            }
                            //  onPress={()=>alert("This has been disabled in your build! Sorry.")}
                            value={"Click to configure"}
                            type={"subtitle"}
                          />
                        }
                      </View>
                      {/* <UserProfileItem
                  label={"Create New Network"}
                  onPress={() => navigation.navigate("RegisterNetworkScreen")}
                /> */}
                      <View style={styles.row}>
                        <UserProfileItem
                          label={"My Permissions"}
                          onPress={() =>
                            navigation.navigate("PermissionsHomeScreen")
                          }
                          value={""}
                        />
                        <UserProfileItem
                          label={"My Store Stocks"}
                          onPress={() =>
                            navigation.navigate("ProductStockScreen")
                          }
                          value={"(Stores only)"}
                          type={"subtitle"}
                        />
                      </View>
                      <View style={styles.row}>
                        <UserProfileItem
                          label={"Logistics Management"}
                          onPress={() =>
                            navigation.navigate(
                              "OrderLogisticsCreateUserProfileScreen"
                            )
                          }
                          value={""}
                        />
                      </View>
                      {/* <UserProfileItem
                  label={"Shopify To Hopperfy"}
                  onPress={() => navigation.navigate("ShopifyCreateIntegration")}
                  //onPress={()=>alert("This has been disabled in your build! Sorry.")}
                  value={"Click to configure"}                  
                /> */}

                      <Text style={styles.headerSection}>
                        {`${Config.InAppName} Crypto`.toUpperCase()}
                      </Text>
                      <View style={{ ...styles.row, marginBottom: 20 }}>
                        <UserProfileItem
                          label={"Trading"}
                          onPress={() =>
                            console.log(navigation.navigate("TradingScreen"))
                          }
                          value={"Make money!"}
                          type={"subtitle"}
                        />
                      </View>
                    </View>

                    {/* COMMS */}
                    {/* <View style={[styles.profileSection, { borderColor: lineColor }]}>
                <Text style={styles.headerSection}>{"COMMUNICATIONS"}</Text>
                <UserProfileItem
                  label={"Email Notifications"}
                  icon={() => (
                    <Switch
                      onValueChange={() => toast("Do something")}
                      value={false}
                      tintColor={Color.blackDivide}
                      ios_backgroundColor={"blue"}
                    />
                  )}
                />
                <UserProfileItem
                  label={"SMS Notifications"}
                  icon={() => (
                    <Switch
                      onValueChange={() => toast("Do something")}
                      value={true}
                      tintColor={Color.blackDivide}
                      ios_backgroundColor={"blue"}
                    />
                  )}
                />
              </View> */}
                  </View>
                )}
              </View>
            </View>

            {/* <View style={[styles.profileSection, { borderColor: lineColor }]}>
            <Text style={styles.headerSection}>
              {"ORDERS, REGISTRATION AND MISC"}
            </Text>                 
            {listItem.map((item, index) => {
              return (
                item && (
                  <UserProfileItem
                    icon
                    key={index}
                    onPress={() => this._handlePress(item)}
                    {...item}
                  />
                )
              );
            })}
          </View> */}
          </ScrollView>
        </View>
        <ModalBox ref={c => (this.currencyPicker = c)}>
          <CurrencyPicker currency={currency} changeCurrency={changeCurrency} />
        </ModalBox>
      </View>
    );
  }
}

const mapStateToProps = ({ user, language, currency, wishList }) => ({
  userProfile: user,
  language,
  currency,
  wishListTotal: wishList.wishListItems.length
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const { actions } = require("@redux/CurrencyRedux");
  const modalActions = require("@redux/ModalsRedux");

  return {
    ...ownProps,
    ...stateProps,
    //MODALS
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
    changeCurrency: currnecy => actions.changeCurrency(dispatch, currnecy)
  };
}

export default connect(
  mapStateToProps,
  null,
  mergeProps
)(withTheme(UserProfile));
