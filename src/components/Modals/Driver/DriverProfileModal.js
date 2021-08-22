import styles from "./DriverProfileModal_styles";
import Modal from "react-native-modalbox";
import React, { Component } from "react";
import { Image, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Constants, withTheme, Images } from "@common";
import { connect } from "react-redux";
import RandomMarkerHelper from "../../../helper/RandomMarkerHelper";

const { width, height } = Dimensions.get("window");

class DriverProfileModal extends Component {
  constructor(props) {
    super(props);

    this.driver = this.props.driver;

    this.state = {
      tabIndex: 0,
    };

    console.debug("network display modal constructor");
  }

  _updateCurrentImageHeightWidth(newHeight, newWidth) {
    this.setState({
      currentImageHeight: newHeight,
      currentImageWidth: newWidth,
    });
  }

  componentDidMount = async () => {};

  componentWillMount = async () => {};

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }

  /**
   * Render tabview detail
   */
  _renderTabView = () => {
    let email = "emailnadz@gmail.com";
    let vehicleType = "SUV";
    let vehicleImg = Images.NewAppReskinIcon.Driver;
    let currentActiveOrders = 1;

    if (typeof this.props.driver !== "undefined") {
      email = this.props.driver.email;
      vehicleImg = RandomMarkerHelper.GetCorrectMarkerForVehicleType(
        this.props.driver.vehicleType
      );
      vehicleType = this.props.driver.vehicleType.replace(/_/g, " "); //format
      vehicleType =
        vehicleType.charAt(0).toUpperCase() + vehicleType.substring(1); //uppercase
    }

    return (
      <View style={{ marginTop: "10%", flex: 1 }}>
        <View style={[Constants.RTL && { flexDirection: "row-reverse" }]}>
          <View
            style={[
              styles.tabItem,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <Image
              source={vehicleImg}
              style={styles.imgDriver}
              resizeMode='contain'
            />
            <Text style={styles.txtDetails}>DETAILS</Text>
            <View style={styles.divider}></View>
          </View>
        </View>
        <ScrollView>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.list}>
              <View style={styles.row}>
                <Text style={{ ...styles.txtLeftSide, marginTop: "10%" }}>
                  EMAIL:{" "}
                </Text>
                <Text style={styles.txtRightSide}>{email}</Text>
              </View>
              <View style={styles.divider}></View>
              <View style={styles.row}>
                <Text style={styles.txtLeftSide}>ACTIVE ORDERS: </Text>
                <Text style={styles.txtRightSide}>{currentActiveOrders}</Text>
              </View>
              <View style={styles.divider}></View>
              <View style={styles.row}>
                <Text style={styles.txtLeftSide}>VEHICLE TYPE: </Text>
                <Text style={styles.txtRightSide}>{vehicleType}</Text>
              </View>
              <View style={styles.divider}></View>
              <View style={styles.row}>
                <Text style={styles.txtLeftSide}>
                  ORDERS DELIVERED LAST 30 DAYS :{" "}
                </Text>
                <Text style={styles.txtRightSide}>500</Text>
              </View>
              <View style={styles.divider}></View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  _renderFooterText = () => {
    if (typeof this.props.driver !== "undefined") {
      let email = "";
      let telephone = "07394 ";
      email = this.props.driver.email;
      telephone = this.props.driver.telephone;

      return (
        <View
          style={{
            flex: 1,
            paddingLeft: 25,
            paddingRight: 25,
          }}
        >
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              color: "black",
              margin: 1,
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {`${this.props.driver.firstName} ${this.props.driver.lastName} `}
          </Text>
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              marginBottom: 4,
              color: "lightblue",
              margin: 1,
              fontWeight: "bold",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {"delivering your order"}
          </Text>
          <Text
            style={{
              fontFamily: Constants.fontFamily,
              marginBottom: 4,
              color: "hotpink",
              margin: 1,
              fontWeight: "bold",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            {"VERIFIED"}
          </Text>
          <View
            style={{
              flex: 1,
              padding: 5,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flex: 0.5,
                width: width / 2 - 16,
                minHeight: 100,
                alignSelf: "center",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Rating
                disabled={false}
                maxStars={5}
                starSize={26}
                emptyStar='star-o'
                fullStar='star'
                halfStar={"star-half-o"}
                halfStarEnabled
                rating={3.5}
                starColor={"#FDF12C"}
                fullStarColor={"#FDF12C"}
                halfStarColor={"#FDF12C"}
                emptyStarColor='#ccc'
                //selectedStar={(rating) => this.onStarRatingPress(rating)}
              />
            </View>
          </View>
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

    const telephone = "+44 1234 56788 89";
    const firstName = "Walter";
    const lastName = "White";

    let picUrl = "";

    if (typeof this.props.driver !== "undefined") {
      picUrl = this.props.driver.profileImageUrl;
    }

    return (
      <Modal      
        style={styles.modal}
        ref={this.props.ref}
        backdrop={true}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={false}
        position={"center"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()}
      >
        {/* CLOSE BUTTON ABSOULTE */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.btnClose}
            onPress={() => this.closeMe()}
          >
            <Image
              style={styles.imgClose}
              source={Images.NewAppReskinIcon.Close}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollViewTop}>
          <Image
            style={styles.imgProfilePic}
            source={{ uri: picUrl }}
            resizeMode='cover'
          />
          <Text style={styles.userName}>{`${firstName} ${lastName} `}</Text>
          <Text style={styles.contactNumber}>{telephone}</Text>
          <Text style={styles.verified}>{"VERIFIED"}</Text>
        </View>
        {this._renderTabView()}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  console.debug("test state");
  return {};
};

export default connect(mapStateToProps, null)(withTheme(DriverProfileModal));
