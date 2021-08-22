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

const OrderComplete = ({ visible }) => {
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
              Order Complete?
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
              style={{ fontSize: 25, fontWeight: "bold", marginBottom: 15 }}
            >
              Thanks so much!
            </Text>
            <Image
              source={require("../../../../assets/images/Camera_TwoColor1.png")}
              style={{
                width: 300,
                height: 200,
                marginBottom: 20,
              }}
            />
            <Text
              style={{ textAlign: "center", maxWidth: "70%", marginBottom: 20 }}
            >
              Please attach a delivery photo and completion outcome.
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                width: "85%",
                backgroundColor: "#FFFFFF",
                borderRadius: 50,
                height: "10%",
                padding: 18,
                marginBottom: "10%",
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#3559A2",
                width: "85%",
                borderRadius: 50,
                height: "8%",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                I'm done!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#DEE5EE",
                width: "85%",
                borderRadius: 50,
                height: "8%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                Incomplete
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

export default OrderComplete;
