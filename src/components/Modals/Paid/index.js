import styles from "./style";

import React from "react";
import { View, Text, TouchableOpacity, Image, Modal } from "react-native";

const Paid = ({ visible }) => {
  return (
    <Modal transparent={true} visible={true}>
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
              justifyContent: "center"
            }}
          >
            <Text
              style={{
                fontWeight: "800"
              }}
            >
              Payment Queued
            </Text>
            <TouchableOpacity style={{ position: "absolute", right: 20 }}>
              <Image
                source={require("../../../../assets/icons/Close.png")}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: "gray"
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15 }}
            >
              You <Text style={{ color: "#79879F" }}>almost</Text> got paid!
            </Text>
            <Text
              style={{ textAlign: "center", maxWidth: "85%", marginBottom: 20 }}
            >
              As soon as the customer confirms the order receipt, you'll be paid
            </Text>
            <Image
              source={require("../../../../assets/images/Transaction_TwoColor1.png")}
              style={{
                width: 300,
                height: 200,
                marginBottom: 20
              }}
            />
            <Text
              style={{ textAlign: "center", maxWidth: "85%", marginBottom: 20 }}
            >
              Meanwhile we'll get you up and running to take more orders
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#3559A2",
                width: "85%",
                borderRadius: 50,
                height: "10%",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "5%"
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>OK</Text>
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
          position: "absolute"
        }}
      ></View>
    </Modal>
  );
};

export default Paid;
