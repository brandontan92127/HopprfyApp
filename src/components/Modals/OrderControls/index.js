import styles from "./style";

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modalbox";
import Button from "./Button";
import List from "./List";
import { Constants, withTheme, GlobalStyle, Images } from "@common";

class OrderControls extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal
        style={{
          zIndex: 100,
          backgroundColor: "transparent",
          borderRadius: 20
        }}
        isOpen={this.props.visible}
        swipeToClose={false}
        onClosed={() => this.props.closeMe()}
        backdrop={true}
        coverScreen={true}
        //backdropColor={"transparent"}
        backdropOpacity={0.6}
        backdropPressToClose={true}
        position={"center"}
      >
        <View style={styles.modalMain}>
          <View style={styles.body}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => this.props.closeMe()}
                style={styles.backBtn}
              >
                <Image
                  source={require("../../../../assets/icons/Back.png")}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: GlobalStyle.modalTextBlackish.color,
                  fontFamily: "RedHatDisplay-Black"
                }}
              >
                In Order Controls
              </Text>
            </View>
            <View style={styles.content}>
              <View style={styles.btnGroup}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
                    if (typeof this.props.activeStore !== "undefined") {
                      this.props.openInWaze(
                        this.props.activeStore.location.lat,
                        this.props.activeStore.location.long
                      );
                    }
                  }}
                >
                  <Button
                    image={Images.NewBlueIcons.blueStore}
                    text={"Waze\nTo Store".toUpperCase()}
                    textColor={"black"}
                    fontSize={11}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => this.props.driverConfirmOrderPickup()}
                >
                  <Button
                    image={Images.NewBlueIcons.blueHandoverComplete}
                    text={"confirm pickup".toUpperCase()}
                    textColor={"black"}
                    fontSize={11}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => this.props.openChat()}
                >
                  <Button
                    image={Images.NewBlueIcons.chat1}
                    text={"chat".toUpperCase()}
                    textColor={"black"}
                    fontSize={11}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.jobList}>
                <List
                  pageStore={this.props.pageStore}
                  pageDest={this.props.pageDest}
                  cancelOrder={this.props.cancelOrder}
                  completeOrder={this.props.completeOrder}
                  openInWaze={this.props.openInWaze}
                  data={this.props.orderData}
                />
              </View>
            </View>
          </View>
        </View>
        {/* <TouchableOpacity           
          onPress={()=>this.props.closeMe()}
          style={{
            backgroundColor: "#091924",
            width: "100%",
            height: "100%",
            zIndex: -1,
            opacity: 0.5,
            position: "absolute",
          }}
        ></TouchableOpacity> */}
      </Modal>
    );
  }
}

export default OrderControls;
