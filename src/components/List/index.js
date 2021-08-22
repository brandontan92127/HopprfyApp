import styles from "./style";
import detailsStyle from "./details_style";
import storeStyle from "./store_style";
import miscStyle from "./misc_style";

import React from "react";
import { View, Text, FlatList } from "react-native";

class List extends React.Component {
  constructor(props) {
    super(props);
    this.views = this.views.bind(this);
  }  

  views = (item) => {
    if (this.props.type === 1) {
      return (
        <View style={styles.listContainer}>
          <View style={[styles.leftSide, {paddingRight: 5}]}>
            <Text style={styles.leftSideFonts}>{item.delivery}</Text>
            <Text style={styles.leftSideFonts}>{item.orders}</Text>
          </View>
          <View style={styles.rightSide}>
            <Text style={styles.rightSideFonts}>{item.address}</Text>
          </View>
        </View>
      );
    }
    // if (this.props.type === 2) {
    //   return (
    //     <View style={styles.listContainer}>
    //       <View style={detailsStyle.leftSide}>
    //         <Text style={styles.leftSideFonts}>{item.delivery}</Text>
    //       </View>
    //       <View style={detailsStyle.rightSide}>
    //         <Text style={styles.rightSideFonts}>
    //           Orders to Deliver {item.toDeliver}
    //         </Text>
    //       </View>
    //     </View>
    //   );
    // }
    if (this.props.type === 0) {
      return (
        <View style={styles.listContainer}>
          <Text style={storeStyle.row}>
            {item.storeName + " @ " + item.storeAddress}
          </Text>
        </View>
      );
    }
    if (this.props.type === 2) {
      return (
        <View style={styles.listContainer}>
        <View style={detailsStyle.leftSide}>
        <Text style={styles.leftSideFonts}>{`Order: #${item.orderId}`}</Text>
        </View>
        <View style={detailsStyle.rightSide}>
          <Text style={styles.rightSideFonts}>
           <Text style={styles.rightSideFonts}>{item.itemDesc}</Text>
          </Text>
        </View>
      </View>    
      );
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={this.props.data}
          renderItem={({ item }) => (
            <View style={styles.listMain}>
              {this.views(item)}
              <View style={styles.divider}></View>
            </View>
          )}
        />
      </View>
    );
  }
}

export default List;
