import styles from "./styles.js";
import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Picker
} from "react-native";
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker
} from "@components";
import { ListItem, Header, Icon, Divider } from "react-native-elements";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
  GlobalStyle,
  Images
} from "@common";
import { toast } from "@app/Omni";
import { connect } from "react-redux";
import HopprWorker from "../../services/HopprWorker";
import { NetworkDisplay, Button } from "@components";
import List from "../../components/DetailsList";

class TradingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };

    this.data = [
      {
        hoppr: "0.24",
        usd: "123",
        id: 1
      },
      {
        hoppr: "0.24",
        usd: "123",
        id: 2
      },
      {
        hoppr: "0.24",
        usd: "123",
        id: 3
      },
      {
        hoppr: "0.24",
        usd: "123",
        id: 4
      },
      {
        hoppr: "0.24",
        usd: "123",
        id: 5
      },
      {
        hoppr: "0.24",
        usd: "123",
        id: 6
      }
    ];
  }

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }

  renderRow = ({ item }) => {
    return (
      <ListItem
        containerStyle={{
          backgroundColor: "white",
          minHeight: 70,
          alignItems: "center",
          justifyContent: "center"
        }}
        key={item.id}
        leftIcon={
          <Image
            style={{
              maxHeight: 30,
              height: 30,
              width: 30,
              maxWidth: 30,
              resizeMode: "contain",
              borderRadius: 15
            }}
            source={Images.NewAppReskinGraphics.AppLogo}
          />
        }
        subtitleNumberOfLines={1}
        title={
          <View style={{ marginLeft: 15 }}>
            <Text
              style={{
                fontFamily: Constants.fontFamilyMedium,
                fontSize: 14
              }}
            >
              {`${item.hoppr} HPR`}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7986A0",
                fontFamily: Constants.fontFamily
              }}
            >
              {`$${item.usd} USD`}
            </Text>
          </View>
        }
        hideChevron={false}
      />
    );
  };

  render() {
    return (
      <View style={{ backgroundColor: "#F8F8F8", flex: 1 }}>
        <View style={{ width: "95%", alignSelf: "center", flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <UserProfileHeader
              showStatus={true}
              type='simple'
              onLogin={() => navigation.navigate("LoginScreen")}
              onLogout={() =>
                navigation.navigate("LoginScreen", { isLogout: true })
              }
              user={{
                name: "Neo Ezio Auditore"
              }}
            />
            <View
              style={{
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: 40,
                marginTop: 20,
                height: "80%",
                paddingTop: "5%",
                overflow: "hidden"
              }}
            >
              <Image
                source={Images.NewAppReskinGraphics.AppLogo}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: "contain",
                  marginBottom: "5%",
                  borderRadius: 25
                }}
              />
              <Text
                style={{ fontFamily: Constants.fontFamilyBold, fontSize: 36 }}
              >
                0.4264 HPR
              </Text>
              <Text
                style={{
                  fontFamily: Constants.fontFamilyBold,
                  fontSize: 18,
                  color: "#A5B5C7"
                }}
              >
                {`$100.50 USD`}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  marginTop: "10%"
                }}
              >
                <TouchableOpacity style={styles.btnFilled}>
                  <Text
                    style={{
                      color: "white",
                      fontFamily: Constants.fontFamilyBold
                    }}
                  >
                    BUY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnOutlined}>
                  <Image
                    source={Images.NewAppReskinIcon.Send}
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: "contain"
                    }}
                  />
                  <Text
                    style={{
                      color: GlobalStyle.primaryColorDark.color,
                      fontFamily: Constants.fontFamilyBold,
                      marginLeft: 5
                    }}
                  >
                    SEND
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#AFBECD",
                  paddingLeft: 10,
                  paddingRight: 10
                }}
              >
                <View style={[styles.tabItem, { alignContent: "center" }]}>
                  <Button
                    type='reskintabimage'
                    textStyle={[
                      styles.textTab,
                      {
                        alignContent: "center",
                        color: this.state.tabIndex == 0 ? "black" : "#AFBECD"
                      }
                    ]}
                    lineColor={"#f8f8f8"}
                    selectedStyle={{ color: "black", borderBottomWidth: 0 }}
                    text={"ASSETS"}
                    selected={this.state.tabIndex == 0}
                    onPress={() => {
                      this.handleClickTab(0);
                    }}
                  />
                </View>
                <View style={[styles.tabItem, { alignContent: "center" }]}>
                  <Button
                    type='reskintabimage'
                    textStyle={[
                      styles.textTab,
                      {
                        alignContent: "center",
                        color: this.state.tabIndex == 1 ? "black" : "#AFBECD"
                      }
                    ]}
                    lineColor={"#f8f8f8"}
                    selectedStyle={{ color: "black", borderBottomWidth: 0 }}
                    text={"ACTIVITY"}
                    selected={this.state.tabIndex == 1}
                    onPress={() => {
                      this.handleClickTab(1);
                    }}
                  />
                </View>
              </View>
              {this.state.tabIndex === 0 && (
                <View
                  style={{
                    paddingBottom: Constants.Dimension.height < 890 ? 10 : 0,
                    width: "100%",
                    height: "60%"
                  }}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                  >
                    <FlatList
                      style={{ backgroundColor: "#F1F2F6" }}
                      data={this.data}
                      renderItem={this.renderRow}
                      keyExtractor={item => item.id}
                    />
                  </ScrollView>
                </View>
              )}
              {this.state.tabIndex === 1 && (
                <View
                  style={{
                    paddingBottom: Constants.Dimension.height < 890 ? 10 : 0,
                    width: "100%",
                    height: "60%"
                  }}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                  >
                    <FlatList
                      style={{ backgroundColor: "#F1F2F6" }}
                      data={this.data}
                      renderItem={this.renderRow}
                      keyExtractor={item => item.id}
                    />
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {};

const mapDispatchToProps = dispatch => {};

export default TradingHome;
