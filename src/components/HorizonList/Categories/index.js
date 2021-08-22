/** @format */

import React, { PureComponent } from "react";
import { FlatList, View, Text } from "react-native";
import { withTheme } from "@common";

import Item from "./Item";

class Categories extends PureComponent {
  static defaultProps = {
    categories: [],
    items: []
  };

  render() {
    const { categories, items, onPress } = this.props;
    const mapping = {};
    categories.forEach(item => {
      mapping[item.id] = item.name;
    });

    return (
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={items}
        renderItem={({ item }) => (
          <View style={{overflow:"hidden"}}>
            {/* //Chop the category name on the first space */}
            <Item item={item} label={item.name.toUpperCase()} onPress={onPress} />
            {/* <Text style={{ textAlign: center, fontSize: 9 }}>{item.name}</Text> */}
          </View>
        )}
      />
    );
  }
}

export default withTheme(Categories);
