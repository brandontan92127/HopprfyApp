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
  Dimensions
} from "react-native";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider
} from "react-native-elements";
import { NetworkDisplay, Button } from "@components";
import { Images, Config } from "@common";
import { toast } from "../../../Omni";
import { connect } from "react-redux";
import Carousel from "react-native-snap-carousel";
import List from "../../../components/DetailsList";
import GeoWorker from "../../../services/GeoWorker";
import LayoutHelper from "../../../services/LayoutHelper";
import moment from "moment";

const { width, height } = Dimensions.get("window");
const modalWidth = width - 8;
const modalContentMaxWidth = modalWidth - 14;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderBottomWidth: 0
  },
  tabButton: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#AFBECD",
    paddingLeft: 10,
    paddingRight: 10
  },
  textTab: {
    fontFamily: Constants.fontFamilyBold,
    color: "#95A4AF"
  },
  tabButtonHead: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0
  },
  tabItem: {
    flex: 0.5
  },
  tabView: {
    minHeight: height / 5,
    marginTop: 3
  }
});

class FullOrderDisplayModal extends Component {
  constructor(props) {
    super(props);

    this.orderNetwork = this.props.orderNetwork;
    this.orderAndItems = this.props.orderAndItems;

    this.state = {
      tabIndex: 0
    };

    console.debug("network display modal constructor");
  }

  _updateCurrentImageHeightWidth(newHeight, newWidth) {
    this.setState({
      currentImageHeight: newHeight,
      currentImageWidth: newWidth
    });
  }

  componentDidMount = async () => {};

  componentWillMount = async () => {};

  _renderNetworkDisplay() {
    if (typeof this.props.orderNetwork === "undefined") {
      return <View style={{ height: 180 }} />; //return blank
    } else {
      return (
        <View
          style={{
            flex: 1,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 10,
            alignContent: "center",
            textAlign: "center",
            justifyContent: "center"
          }}
        >
          <NetworkDisplay
            network={this.props.orderNetwork}
            baseImageUrl={Config.NetworkImageBaseUrl}
          />
        </View>
      );
    }
  }

  _renderProfilePic = () => {
    if (typeof this.props.orderAndItems !== "undefined") {
      return (
        <Image
          style={{
            height: 85,
            width: 85,
            borderRadius: 85 / 2,
            resizeMode: "cover",
            overflow: "hidden",
            marginTop: "5%",
            alignSelf: "center"
          }}
          resizeMode='cover'
          source={{ uri: this.props.orderAndItems.driver.profileImageUrl }}
        />
      );
    }
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }

  _renderDeliveryLocationAsString = () => {
    try {
      let result = `${this.props.orderAndItems.deliveryLocationAsString}`;
      return result;
    } catch (err) {
      return "";
    }
  };

  /**
   * Render tabview detail
   */
  _renderTabView = () => {
    let background = "#f8f8f8";
    let text = "black";
    let lineColor = "silver";

    const screenWidth = Dimensions.get("window").width;

    let itemString = "";
    let totalItemsCount = 0;
    let fullDriver = "None";
    let fullStore = "None";
    let networkImageUrl = "";
    let pickupCode = "None";
    if (typeof this.props.orderAndItems !== "undefined") {
      if (typeof this.props.orderNetwork !== "undefined") {
        networkImageUrl =
          Config.NetworkImageBaseUrl + this.props.orderNetwork.storeLogoUrl;
      }
      this.props.orderAndItems.items.map(x => {
        itemString += " " + x.amount + " of " + x.productName + "\n";
        totalItemsCount += x.amount;
      });
      itemString = itemString.slice(0, -1);
      fullDriver =
        this.props.orderAndItems.driver.firstName +
        " " +
        this.props.orderAndItems.driver.lastName;
      fullStore = this.props.orderAndItems.store.storeName;
      pickupCode = this.props.orderAndItems._id.substring(0, 4);
    }

    let data = [
      {
        left: "ITEMS:",
        right: itemString
      },
      {
        left: "NO. OF ITEMS:",
        right: totalItemsCount
      },
      {
        left: "DRIVER:",
        right: fullDriver
      },
      {
        left: "STORE:",
        right: fullStore
      }
    ];

    let driverData = [
      {
        left: "DELIVERED BY:",
        right: fullDriver
      },
      {
        left: "DELIVERED TO:",
        right: this._renderDeliveryLocationAsString()
      }
    ];

    return (
      <View
        style={[
          styles.tabView,
          {
            paddingBottom: 1,
            paddingTop: 5,
            backgroundColor: "#f8f8f8"
          }
        ]}
      >
        <View
          style={[
            styles.tabButton,
            Constants.RTL && { flexDirection: "row-reverse" },
            {
              backgroundColor: "#f8f8f8"
            }
          ]}
        >
          <View style={[styles.tabItem, { alignContent: "center" }]}>
            <Button
              type='reskintabimage'
              icon={{
                uri:
                  networkImageUrl === ""
                    ? "../../../../assets/icons/Order.png"
                    : networkImageUrl
              }}
              textStyle={[
                styles.textTab,
                {
                  alignContent: "center",
                  color: this.state.tabIndex == 0 ? "black" : "#AFBECD"
                }
              ]}
              lineColor={"#f8f8f8"}
              selectedStyle={{ color: text, borderBottomWidth: 0 }}
              text={"DETAILS"}
              onPress={() => {
                this.handleClickTab(0);
              }}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View style={styles.tabItem}>
            <Button
              type='reskintabimage'
              icon={Images.NewAppReskinIcon.LocationBlue}
              lineColor={"#f8f8f8"}
              textStyle={[
                styles.textTab,
                { color: this.state.tabIndex == 1 ? "black" : "#AFBECD" }
              ]}
              selectedStyle={{ color: text }}
              text={"DELIVERY"}
              onPress={() => {
                this.handleClickTab(1);
              }}
              selected={this.state.tabIndex == 1}
            />
          </View>
        </View>
        {this.state.tabIndex === 0 && (
          // DRIVER NUMBERS
          <View style={{ paddingBottom: height < 890 ? 10 : 0, height: "60%" }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <TouchableOpacity>
                <View
                  style={{
                    marginLeft: 20,
                    marginRight: 20
                  }}
                >
                  <View style={{ paddingBottom: 2 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          fontFamily: Constants.fontFamily,
                          marginTop: 4,
                          color: "black",
                          marginBottom: 0,
                          paddingBottom: 0,
                          fontSize: 15,
                          textAlign: "left"
                        }}
                      >
                        {"Pickup code: "}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Constants.fontFamilyBlack,
                          marginTop: 4,
                          color: "black",
                          marginBottom: 0,
                          paddingBottom: 0,
                          fontSize: 15,
                          textAlign: "left"
                        }}
                      >
                        {pickupCode ?? "None"}
                      </Text>
                    </View>
                    <List
                      leftSideFonts={{ fontSize: 14, paddingBottom: 2 }}
                      rightSideFonts={{
                        fontSize: 14,
                        paddingBottom: 2
                      }}
                      rowStyle={{ paddingTop: 10 }}
                      containerStyle={{ marginTop: 5 }}
                      data={data}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {this.state.tabIndex === 1 && (
          // DRIVER NUMBERS
          <View style={{ paddingBottom: height < 890 ? 10 : 0, height: "60%" }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <TouchableOpacity>
                <View
                  style={{
                    marginLeft: 20,
                    marginRight: 20
                  }}
                >
                  {this._renderProfilePic()}
                  <List
                    data={driverData}
                    leftSideFonts={{ fontSize: 14, paddingBottom: 2 }}
                    rightSideFonts={{
                      fontSize: 14,
                      paddingBottom: 2
                    }}
                    rowStyle={{ paddingTop: 10 }}
                    containerStyle={{ marginTop: 5 }}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  _getImageSizesForCarousel = imageLayout => {
    switch (imageLayout) {
      case "portrait":
        return {
          flex: 1,
          minHeight: 230,
          height: 230,
          width: undefined,
          overflow: "hidden"
        };
        break;
      case "landscape":
        return {
          flex: 1,
          minWidth: 230,
          width: 230,
          height: undefined,
          overflow: "hidden"
        };
        break;
      case "square":
        return {
          flex: 1,
          minWidth: 230,
          minHeight: 230,
          width: 230,
          height: 230,
          overflow: "hidden"
        };
        break;

        throw new Error(
          "Couldnt' identify image layout type (portrait / landscape etc)"
        );
    }
  };

  _renderCarouselItem = ({ item, index }) => {
    let name = item.product.name;
    let size = item.product.size;
    let price = item.product.price;

    let amount = item.amount;
    let catImageBaseUrl = Config.ProductBaseUrl;
    if (
      item.product.images[0].indexOf("http://") == 0 ||
      item.product.images[0].indexOf("https://") == 0
    ) {
      //it's already an HTTP link, don't add anything
      catImageBaseUrl = "";
    }

    let imageUrl =
      catImageBaseUrl + item.product.images[0] ||
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Choice_toxicity_icon.png";

    return (
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 5,
          flex: 1,
          marginTop: "15%",
          borderBottomWidth: 0
        }}
      >
        <View
          style={{
            flex: 1,
            paddingLeft: 2,
            paddingRight: 2,
            borderRadius: 10,
            overflow: "hidden",
            borderBottomWidth: 0
          }}
        >
          <Image
            style={{
              flex: 1,
              borderRadius: 10
            }}
            resizeMode='contain'
            source={{ uri: imageUrl }}
          />
        </View>
      </View>
    );

    LayoutHelper.isImagePortraintOrLandscape(imageUrl).then(whichIsIt => {
      console.log("");
      let heightWidthStyle = this._getImageSizesForCarousel(whichIsIt);
      console.log("");

      return (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 5,
            flex: 1
          }}
        >
          <View
            style={{
              flex: 1,
              paddingLeft: 2,
              paddingRight: 2,
              borderRadius: 10,
              overflow: "hidden"
            }}
          >
            <Image
              style={{
                flex: 1,
                height: undefined,
                borderRadius: 10,
                width: 180
              }}
              resizeMode='contain'
              source={{ uri: "https://i.stack.imgur.com/sPruf.jpg" }}
            />
          </View>
        </View>
      );
    });
  };

  _renderCarousel = () => {
    if (typeof this.props.orderAndItems !== "undefined") {
      return (
        <Carousel
          ref={c => {
            this._carousel = c;
          }}
          layout={"stack"}
          layoutCardOffset={`18`}
          data={this.props.orderAndItems.items}
          renderItem={this._renderCarouselItem}
          sliderWidth={modalContentMaxWidth}
          itemWidth={modalContentMaxWidth}
          useScrollView={true}
          autoplay={true}
          loop={true}
        />
      );
    }

    return null;
  };

  onBuffer = () => {};
  videoError = () => {};

  _renderCarouselHeaderText = () => {
    if (typeof this.props.orderAndItems !== "undefined") {
      return (
        <View style={{}}>
          <Text
            style={{
              fontFamily: Constants.fontHeader,
              color: GlobalStyle.headerTextColor.color,
              margin: 2,
              fontSize: 20,
              textAlign: "center"
            }}
          >
            {`Id: #${this.props.orderAndItems._id.substring(0, 4)}`}
          </Text>
        </View>
      );
    }
    return null;
  };

  _getCorrectPriceDependingOnMode = orderAndItems => {
    switch (this.props.mode) {
      case "customer":
        return orderAndItems.total;
      case "store":
        return orderAndItems.itemMerchantSubTotal;
      case "driver":
        return orderAndItems.deliveryCharge;
      default:
        return orderAndItems.total;
    }
  };

  _renderFooterText = () => {
    if (typeof this.props.orderAndItems !== "undefined") {
      //map item string
      let itemString = "";
      let totalItemsCount = 0;
      this.props.orderAndItems.items.map(x => {
        itemString += " " + x.amount + " of " + x.productName + ",\n";
        totalItemsCount += x.amount;
      });

      itemString = itemString.slice(0, -1);

      let networkImageUrl = "";
      if (typeof this.props.orderNetwork !== "undefined") {
        networkImageUrl =
          Config.NetworkImageBaseUrl + this.props.orderNetwork.storeLogoUrl;
      }

      let correctPriceTOSHow = this._getCorrectPriceDependingOnMode(
        this.props.orderAndItems
      );

      return (
        <View
          style={{
            paddingLeft: 25,
            paddingRight: 25
          }}
        >
          <Text
            style={{
              paddingTop: 10,
              marginBottom: 4,
              color: "#A2C3F5",
              fontFamily: Constants.fontFamilyBlack,
              margin: 1,
              fontSize: 16,
              textAlign: "center"
            }}
          >
            {this.props.orderAndItems.state.replace(/_/g, " ")}
          </Text>
          <Text
            style={{
              color: "black",
              margin: 1,
              fontFamily: Constants.fontFamilyBlack,
              fontSize: 20,
              textAlign: "center"
            }}
          >
            {`£${correctPriceTOSHow.toFixed(2)}`}
          </Text>
          <Text
            style={{
              color: "#AFBECD",
              margin: 1,
              fontFamily: Constants.fontFamily,
              fontSize: 16,
              textAlign: "center"
            }}
          >
            {`Order:#${this.props.orderAndItems._id.substring(0, 4)}`}
          </Text>
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              marginBottom: 4,
              color: "#AFBECD",
              margin: 1,
              fontSize: 12,
              textAlign: "center"
            }}
          >
            {moment
              .parseZone(this.props.orderAndItems.creationDate)
              .format("MMMM DD, YYYY - H:mm")}
          </Text>
        </View>
      );
    }
    return null;
  };

  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    console.debug("In full order display modal");
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          backgroundColor: "#f8f8f8",
          zIndex: 999999,
          height: height < 890 ? "95%" : "75%",
          borderRadius: 20,
          width: "95%",
          overflow: "hidden"
        }}
        ref={this.props.ref}
        //ref={"fullOrderDisplayModal"}
        backdrop={true}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={true}
        position={"center"}
        isOpen={this.props.openClosed}
        // isOpen={true}
        onClosed={() => this.closeMe()}
      >
        {/* CLOSE BUTTON ABSOULTE */}
        <View
          style={{
            paddingTop: "5%",
            position: "absolute", //use absolute position to show button on top of the map
            top: 10,
            right: 10,
            paddingRight: 3,
            marginRight: 3,
            zIndex: 100,
            backgroundColor: "white",
            borderBottomWidth: 0
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: GlobalStyle.secondaryColor.color,
              borderRadius: 50,
              padding: 8
            }}
            onPress={this.closeMe}
          >
            <Image
              source={Images.NewAppReskinIcon.Close}
              style={{
                minHeight: 20,
                maxHeight: 20,
                maxWidth: 20,
                minWidth: 20,
                tintColor: "#95A4AF"
              }}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            overflow: "hidden",
            height: "55%",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            backgroundColor: "white"
          }}
        >
          {this._renderCarousel()}
          {this._renderFooterText()}
        </View>
        <View>{this._renderTabView()}</View>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  console.debug("test state");
  return {};
};

export default connect(mapStateToProps, null)(withTheme(FullOrderDisplayModal));
