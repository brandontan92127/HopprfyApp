/** @format */

import React from "react";
import { TouchableOpacity, FlatList, Text, View, Image } from "react-native";
import Accordion from "react-native-collapsible/Accordion";

import { Constants, Languages } from "@common";
import styles from "./styles";

const cardMargin = Constants.Dimension.ScreenWidth(0.05);

export default class OrderItem extends React.PureComponent {
  state = { activeSections: [] };

  _setSections = () => {
    this.setState({
      activeSections: this.state.activeSections.length ? [] : [0]
    });
  };

  _renderItemOrder = ({ item, index }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        {
          <Image
            style={{
              maxHeight: 22,
              height: 22,
              width: 22,
              maxWidth: 22
            }}
            source={{ uri: item.product.images[0] }}
            resizeMode="contain"
          />
        }
        <Text
          style={{
            margin: 4,
            color: "#333",
            width: Constants.Dimension.ScreenWidth(0.6)
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.productName}
        </Text>

        <Text
          style={{
            margin: 4,
            color: "#333",
            alignSelf: "center"
          }}
        >
          {`x${item.amount}`}
        </Text>

        <Text
          style={{
            margin: 4,
            color: "#333",
            alignSelf: "center"
          }}
        >
          {item.totalPrice}
        </Text>
      </View>
    );
  };

  render() {
    const {
      theme: {
        colors: { text }
      },
      item
    } = this.props;

    const order = item;

    if (typeof order.items === "undefined") {
      return this.renderError(Languages.NoOrder);
    }

    const renderAttribute = (label, context, _style) => {
      return (
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: text }]}>{label}</Text>
          <Text style={[styles.rowLabel, _style, { color: text }]}>
            {context}
          </Text>
        </View>
      );
    };

    const dateFormat = date => {
      const year = date.substr(0, 4);
      const month = date.substr(5, 2);
      const day = date.substr(8, 2);
      return `${day}/${month}/${year}`;
    };

    return (
      <View style={{ margin: cardMargin, marginBottom: 0 }}>
        <View style={styles.labelView}>
          <Text style={styles.label}>#{order._id}</Text>
        </View>
        <View style={{ padding: 5 }}>
          {renderAttribute(Languages.OrderDate, dateFormat(order.creationDate))}
          {renderAttribute(
            Languages.OrderStatus,
            order.state.toUpperCase().replace(/_/g, " ")
          )}
          {renderAttribute("Outcome:", order.outcome.replace(/_/g, " "))}
          {renderAttribute("Driver:", order.driver.email)}
          {renderAttribute("Store:", order.store.email)}
          {renderAttribute("Item Total:", order.itemSubTotal + " GBP")}
          {renderAttribute(Languages.OrderTotal, `${order.total} GBP`, {
            fontWeight: "bold",
            fontSize: 16,
            fontFamily: Constants.fontHeader,
            color: "#333"
          })}

          <Accordion
            activeSections={this.state.activeSections}
            underlayColor="transparent"
            sections={[{}]}
            onChange={this._setSections}
            renderHeader={() => {
              return (
                <TouchableOpacity
                  style={{ flex: 1, alignItems: "flex-end" }}
                  onPress={this._setSections}
                >
                  <Text style={styles.orderDetailLabel}>
                    {Languages.OrderDetails}
                  </Text>
                </TouchableOpacity>
              );
            }}
            renderContent={() => {
              return (
                <FlatList
                  contentContainerStyle={{ backgroundColor: "#FFF" }}
                  enableEmptySections
                  keyExtractor={(obj, i) => `${i}`}
                  data={order.items}
                  renderItem={this._renderItemOrder}
                />
              );
            }}
          />
        </View>
      </View>
    );
  }
}
