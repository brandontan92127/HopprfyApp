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
            <View style={[styles.listMain, this.props.containerStyle]}>
              <View style={[styles.listContainer, this.props.rowStyle]}>
                <View style={styles.leftSide}>
                  <Text
                    style={[styles.leftSideFonts, this.props.leftSideFonts]}
                  >
                    {item.left}
                  </Text>
                </View>
                <View style={styles.rightSide}>
                  <Text
                    style={[styles.rightSideFonts, this.props.rightSideFonts]}
                  >
                    {item.right}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, this.props.dividerStyle]}></View>
            </View>
          )}
        />
      </View>
    );
  }
}

export default List;
