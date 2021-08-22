import styles from "./list_style";
import { Constants, withTheme, Images, GlobalStyle } from "@common";
import React from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image
} from "react-native";
import Button from "./Button";
import { modalData } from "../../../../Sample_data";
import { ScrollView } from "react-native-gesture-handler";

class List extends React.Component {
  _renderItem = item => {
    //get address for destination
    let driverNote = item.orders[0].driverNote;
    let tryAndGetAddressForDesc = item.orders[0].deliveryLocationAsString;
    let ordersTODeliverString = item.orders.length + " order to deliver here";

    let amalgTitle =
      driverNote == ""
        ? tryAndGetAddressForDesc
        : driverNote + " | " + tryAndGetAddressForDesc;

    return (
      <View style={styles.container}>
        <View style={styles.description}>
          <Text
            style={{
              fontSize: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily: "RedHatDisplay-Regular"
            }}
          >
            {amalgTitle}
          </Text>
          <Text
            style={{
              color: GlobalStyle.modalTextBlackish.color,
              fontSize: 12,
              marginTop: 4,
              fontFamily: "RedHatDisplay-Regular"
            }}
          >
            {"PICKUP CODE: " +
              (item.orders[0]._id.substring(0, 4) ?? "NONE\n").toUpperCase()}
          </Text>
          <Text
            style={{
              color: "#AFBECD",
              fontSize: 13,
              marginTop: 4,
              fontFamily: "RedHatDisplay-Regular"
            }}
          >
            {ordersTODeliverString}
          </Text>
        </View>
        <View style={styles.btnGroup}>
          <Image
            source={require("../../../../assets/icons/Arrow.png")}
            style={{
              tintColor: "rgba(255,255,255,0.5)",
              width: 10,
              height: 10,
              position: "absolute",
              right: "5%",
              top: "45%"
            }}
          />
          <Image
            source={require("../../../../assets/icons/Arrow.png")}
            style={{
              tintColor: "rgba(255,255,255,0.5)",
              width: 10,
              height: 10,
              position: "absolute",
              left: "5%",
              top: "45%",
              transform: [{ scale: -1 }]
            }}
          />
          <ScrollView
            horizontal={true}
            style={styles.scrollViewBody}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() =>
                this.props.openInWaze(item.location.lat, item.location.long)
              }
              style={{ marginLeft: 4 }}
            >
              <Button
                image={require("../../../../assets/icons/Waze.png")}
                text={"Waze to\nDestination"}
                textColor={"white"}
                fontSize={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                let stop = "";
                await this.props.completeOrder(item._id);
              }}
            >
              <Button
                image={require("../../../../assets/icons/Store.png")}
                text={"Complete\nOrder"}
                textColor={"white"}
                fontSize={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                let stop = "";
                await this.props.pageStore(item._id);
              }}
            >
              <Button
                image={Images.NewWhiteIcons.page1}
                text={"Page\nStore"}
                textColor={"white"}
                fontSize={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                let stop = "";
                await this.props.pageDest(item._id);
              }}
            >
              <Button
                image={Images.NewWhiteIcons.page2}
                text={"Page\ndestination"}
                textColor={"white"}
                fontSize={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                let stop = "";
                await this.props.cancelOrder(item._id);
              }}
            >
              <Button
                image={Images.NewWhiteIcons.cancel}
                text={"Cancel\norder"}
                textColor={"white"}
                fontSize={10}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  };

  render() {
    return (
      <FlatList
        //data={modalData}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        data={this.props.data}
        renderItem={({ item }) => this._renderItem(item)}
      />
    );
  }
}

export default List;
