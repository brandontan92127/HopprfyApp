import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Button,
  ShopButton,
  CashOutModal,
  PermissionsList,
  InboundPermissionsModal,
} from "@components";
import { List, ListItem, Header, Icon } from "react-native-elements";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  Config,
} from "@common";
import { Images } from "@common";
import { toast } from "@app/Omni";
import { connect } from "react-redux";
import HopprWorker from "../../services/HopprWorker";
import DraggableFlatList from "react-native-draggable-flatlist";

class ProductClassListingOrderSort extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cats: [],
      data: [...Array(20)].map((d, index) => ({
        key: `item-${index}`,
        label: index,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${
          index * 5
        }, ${132})`,
      })),
    };
  }

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();      
    } catch (error) {
      
    }       
  }

  componentDidMount = async () => {
    console.debug("ProductClassListingOrderSort");    
    this.unsubscribeWillFocus =  this.props.navigation.addListener("willFocus", this.load);

    await this.load();
  };

  load = () => {
    const { navigation } = this.props;
    var catsPassed = this.props.navigation.getParam("cats", []);
    // alert("we navigat3ed here - triggered:" + networkIdPassed);
    this.setState({ cats: catsPassed });
    toast("updated cats:" + catsPassed.length);
  };

  _processOnMoveEnd = async (data) => {
    this.setState({ data });
    toast("move has ended");
  };
  _updateListingOrderInApi = async (catId, newSortingOrder) => {
    toast("update in API");
  };

  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 100,
          backgroundColor: isActive ? "blue" : "",
          alignItems: "center",
          justifyContent: "center",
        }}
        onLongPress={move}
        onPressOut={moveEnd}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 32,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  render = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Text
          style={{
            color: "black",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
            textShadowColor: "lightblue",
          }}
        >
          {"Sort Categories:"}
        </Text>
        <DraggableFlatList
          data={this.state.cats}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `draggable-item-${item._id}`}
          //keyExtractor={(item, index) => `${item._id} || ${index}`}
          scrollPercent={5}
          onMoveEnd={({ data }) => this.setState({ cats: data })}
        />
      </View>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    modalsArray: state.modals.modalsArray,
  };
};

/**Needs to save permissions here */
const mapDispatchToProps = (dispatch) => {
  const userActions = require("@redux/UserRedux");
  const modalActions = require("@redux/ModalsRedux");
  return {
    updateModalState: (modalName, modalState) => {
      console.debug("About to update modals");
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState
          )
        );
      } catch (error) {
        console.debug(error);
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ProductClassListingOrderSort));
