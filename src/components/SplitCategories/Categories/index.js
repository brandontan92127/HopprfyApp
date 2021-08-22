/** @format */

import React, { Component } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
} from "react-native";
import { connect } from "react-redux";
import { toast, warn } from "@app/Omni";
import { Color, Constants, Tools, Languages, Images, Config } from "@common";
import styles from "./styles";
import Item from "./Item";

class Categories extends Component {
  render() {
    const { categories, selectedIndex, onPress } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView>
          {categories.map((item, index) => (
            <Item
              item={item}
              key={index}
              selected={index == selectedIndex}
              onPress={() => onPress(index)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  componentDidMount() {
    console.debug("In split categories");
    if (this.props.categories.length == 0) {
      this.props.fetchCategories(this.props.currentlySelectedNetworkGuid);
    }
  }
}

Categories.defaultProps = {
  categories: [],
};

const mapStateToProps = (state) => {
  return {
    categories: state.categories.list,
    netInfo: state.netInfo,
    currentlySelectedNetworkGuid: state.categories.currentlySelectedNetworkGuid,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { netInfo } = stateProps;
  const { dispatch } = dispatchProps;
  const { actions } = require("@redux/CategoryRedux");

  return {
    ...ownProps,
    ...stateProps,
    fetchCategories: (lastSeletedNetworkGuid) => {
      if (!netInfo.isConnected) return toast(Languages.noConnection);
      actions.fetchCategories(dispatch, lastSeletedNetworkGuid);
    },
  };
}

export default connect(mapStateToProps, undefined, mergeProps)(Categories);
