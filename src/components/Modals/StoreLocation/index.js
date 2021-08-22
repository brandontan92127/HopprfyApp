import styles from "./style";

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput
} from "react-native";
import Button from "./Button";
import MapView from "react-native-maps";

const StoreLocation = ({ visible }) => {
  return (
    <Modal transparent={true} visible={visible}>
      <View style={styles.modalMain}>
        <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={{ position: "absolute", left: 10 }}>
              <Image
                source={require("../../../../assets/icons/Back.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <Text style={{ fontWeight: "800" }}>Pick a Store Location</Text>
          </View>
          <View style={styles.content}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#FFFFFF",
                borderColor: "#DEE5EE",
                borderWidth: 2,
                alignItems: "center",
                borderRadius: 50,
                width: "90%",
                justifyContent: "space-between",
                position: "absolute",
                top: "2%"
              }}
            >
              <TextInput
                placeholder='Search Address'
                style={{
                  height: 40,
                  borderColor: "gray",
                  width: "85%",
                  padding: 10
                }}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: "#DEE5EE",
                  width: 40,
                  height: 40,
                  borderRadius: 100,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Image
                  source={require("../../../../assets/icons/Close.png")}
                  style={{ width: 20, height: 20, tintColor: "#95A3AF" }}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#AFBECD",
                marginTop: "5%",
                marginBottom: "2%"
              }}
            >
              TRADING FROM : MAIN STREET, 44335, LONDON, UK
            </Text>
            <MapView style={{ width: "100%", height: "75%" }} />
            <View
              style={{
                backgroundColor: "#3559A2",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "100%",
                borderRadius: 25,
                height: "10%",
                position: "absolute",
                bottom: 0
              }}
            >
              <TouchableOpacity>
                <Button
                  image={require("../../../../assets/icons/Edit.png")}
                  text='Edit'
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Button
                  image={require("../../../../assets/icons/Search-1.png")}
                  text='Search'
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Button
                  image={require("../../../../assets/icons/Center.png")}
                  text='Center'
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Button
                  image={require("../../../../assets/icons/Here.png")}
                  text='Here'
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#DEE5EE",
                  borderRadius: 100,
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../../../../assets/icons/Close.png")}
                  style={{ width: 25, height: 25, tintColor: "#3559A2" }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 100,
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../../../../assets/icons/Back.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: "#3559A2",
                    transform: [{ rotate: "-110deg" }]
                  }}
                />
              </TouchableOpacity>
            </View>
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

export default StoreLocation;
