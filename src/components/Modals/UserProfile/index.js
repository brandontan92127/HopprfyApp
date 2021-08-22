import styles from "./style";

import Modal from "react-native-modalbox";
import React from "react";
import { Image, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Images } from "@common";

export default class UserProfile extends React.PureComponent {
  render() {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={styles.container}
        backdrop={true}
        position={"center"}
        ref={"UserProfile"}
        isOpen={true}
        onClosed={() => this.closeMe()}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.btnClose}
            noPress={() => this.closeMe()}
          >
            <Image
              style={styles.imgClose}
              source={Images.NewAppReskinIcon.Close}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
        <View>
          <ScrollView>
            <View style={styles.scrollViewTop}>
              <Image
                style={styles.imgProfilePic}
                source={require("../../../../assets/dp.jpeg")}
                resizeMode='cover'
              />
              <Text style={styles.userName}>Walter "Heisenberg" White</Text>
              <Text style={styles.contactNumber}>+44 2345 666 877</Text>
              <Text style={styles.verified}>VERIFIED</Text>
            </View>
            <View style={styles.scrollViewBottom}>
              <View style={styles.detailsHeader}>
                <Image
                  source={Images.NewAppReskinIcon.Driver}
                  style={styles.imgDriver}
                  resizeMode='contain'
                />
                <Text style={styles.txtDetails}>DETAILS</Text>
                <View style={styles.divider}></View>
                <View style={styles.list}>
                  <View style={styles.row}>
                    <Text>EMAIL: </Text>
                    <Text style={styles.txtRightSide}>emailnadz@gmail.com</Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={styles.row}>
                    <Text>ACTIVE ORDERS: </Text>
                    <Text style={styles.txtRightSide}>1</Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={styles.row}>
                    <Text>VEHICLE TYPE: </Text>
                    <Text style={styles.txtRightSide}>None</Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={styles.row}>
                    <Text>ORDERS DELIVERED LAST 30 DAYS : </Text>
                    <Text style={styles.txtRightSide}>500</Text>
                  </View>
                  <View style={styles.divider}></View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
