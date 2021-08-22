import styles from "./style";

import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

class List extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={this.props.data}
          renderItem={({ item }) => (
            <View style={styles.listMain}>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>PiICKUP FROM:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>{item.pickup}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>GOING TO:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>{item.goingTo}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>PRICE:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>${item.price}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>PICKUP IN:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>{item.time} min(s)</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
            </View>
          )}
        />
      </View>
    );
  }
}

export default List;
