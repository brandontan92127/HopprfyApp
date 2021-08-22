import styles from "./style";

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Keyboard,
} from "react-native";

const NewOrder = ({ visible }) => {
  return (
    <Modal transparent={true} visible={visible}>
      <View style={styles.modalMain}>
        <View style={styles.body}>
          <View
            style={{
              backgroundColor: "#DEE5EE",
              height: "8%",
              padding: "4%",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "800",
              }}
            >
              Fullfillment : New Order
            </Text>
            <TouchableOpacity style={{ position: "absolute", right: 20 }}>
              <Image
                source={require("../../../../assets/icons/Close.png")}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: "gray",
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15 }}
            >
              Your store has a new order!
            </Text>
            <Image
              source={require("../../../../assets/images/OrderConfirmation_TwoColor-21.png")}
              style={{
                width: 300,
                height: 200,
                marginBottom: 40,
              }}
            />
            <Text
              style={{ textAlign: "center", maxWidth: "85%", marginBottom: 20 }}
            >
              Please fulfill this order ASAP, the driver is inbound to your
              location.{"\n"}Go to the screen to see full details
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#3559A2",
                width: "85%",
                borderRadius: 50,
                height: "10%",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "15%",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
              >
                Okay, Thanks
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#091924",
          width: "100%",
          height: "100%",
          zIndex: -1,
          opacity: 0.6,
          position: "absolute",
        }}
      ></View>
    </Modal>
  );
};

export default NewOrder;
