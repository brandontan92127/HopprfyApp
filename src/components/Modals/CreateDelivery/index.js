import styles from "./style";

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modalbox";
import List from "./List";
import Map from "./Map";
import Button from "./Button";

class CreateDelivery extends React.Component {
  render() {
    const data = [
      {
        pickup: "141 Drummond St, Kings Cross, London NW12PB, UK",
        goingTo: "141 Drummond St, Kings Cross, London NW12PB, UK",
        price: 4.8,
        time: 0
      }
    ];

    return (
      <Modal isOpen={true}>
        <View style={styles.modalMain}>
          <View style={styles.body}>
            <View
              style={{
                backgroundColor: "#DEE5EE",
                height: "8%",
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
                Create Delivery
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
              <View style={{ height: "35%", marginTop: "2%" }}>
                <List data={data} />
              </View>
              <Map />
              <View>
                <View style={styles.row}>
                  <Button
                    label='Extra Small'
                    image={require("../../../../assets/icons/Track.png")}
                  />
                  <Button
                    label='In-House'
                    image={require("../../../../assets/icons/Driver.png")}
                  />
                </View>
                <View style={styles.row}>
                  <Button
                    label='Pickup Phone'
                    image={require("../../../../assets/icons/Track.png")}
                  />
                  <Button
                    label='Drop-off Phone'
                    image={require("../../../../assets/icons/Track.png")}
                  />
                </View>
                <View style={styles.row}>
                  <Button
                    label='Pickup Note'
                    image={require("../../../../assets/icons/Browse.png")}
                  />
                  <Button
                    label='Drop-off Note'
                    image={require("../../../../assets/icons/Browse.png")}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3559A2",
                  width: "85%",
                  borderRadius: 50,
                  height: "8%",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: "2%"
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "RedHatDisplay-Bold",
                    fontSize: 20
                  }}
                >
                  Let's Go
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
            position: "absolute"
          }}
        ></View>
      </Modal>
    );
  }
}

export default CreateDelivery;
