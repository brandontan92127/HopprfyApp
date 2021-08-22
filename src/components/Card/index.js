import styles from "./style";
import { Config, Images, GlobalStyle } from "@common";
import React from "react";
import { View, Text, TouchableOpacity, Image,ScrollView, ImageBackgroundBase } from "react-native";
import { goingTo } from "../../../Sample_data";
import List from "../List";
import Accordion from 'react-native-collapsible/Accordion';

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      activeSections:[]
    };
    this.setActiveIndex = this.setActiveIndex.bind(this);
    this.DataList = this.DataList.bind(this);
  }

  _toggleSectionOpen=()=>{
    let newVal = this.state.activeSections.length == 0 ? [0] : [];
    this.setState({activeIndex:0, activeSections: newVal});
  }



  _renderHeader=()=>{
    let extraStyle={};
    if(this.props.tabsVisible == false)
    {
      extraStyle = {        
        borderRadius: 40,
        backgroundColor: GlobalStyle.primaryColorDark.color
      }
    }

    let onOrderMsg = this.props.goingToData.length == 0 ?  "Looking for orders..." : "On order:";
    if(this.props.driverState.toUpperCase() == "OFFLINE")
    {
      onOrderMsg = "You are offline"
    }
    let currentOrderMsg = this.props.currentOrderDirection;
    currentOrderMsg == "" ? "" : currentOrderMsg + " " + this.props.pickupAt

    return (      
      <TouchableOpacity 
      onPress={()=>{
        //this._toggleSectionOpen();
        this.props.toggleTabsVisible()
      }}
      style={[styles.cardHeader, extraStyle]}>
      <View style={{ paddingLeft: 3, overflow:"visible" ,paddingRight:13}}>
        <Image
        style={{height:46, width:46}}
        source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}></Image>
      </View>
      <View>
      <Text style={styles.order}>{(onOrderMsg).toUpperCase()}</Text>
        <Text style={styles.bold}>
          {currentOrderMsg}
        </Text>
      </View>
    </TouchableOpacity>
    );
  }

  _renderContent=()=>{
    return(
      <View style={styles.cardBody}>
      <View style={styles.tabs}>
        {this.props.items.map((tab, index) => (
          <TouchableOpacity
            key={index}
            disabled={this.state.activeIndex == index ? true : false}
            onPress={() => {
              this.setActiveIndex(index);
            }}
            style={{
              ...styles.activeTab,
              backgroundColor:
                this.state.activeIndex == index ? "#FFFFFF" : "#DEE5EE",
            }}
          >
            <Image
              style={styles.btnImage}
              source={tab.icon}
              resizeMode={"contain"}
            />
            <Text style={styles.text}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.list}>
        <ScrollView style={{flex:1}}>
          <View style={{flex:1, paddingBottom:20}}>
             {this.DataList(this.state.activeIndex)}
        </View>
        </ScrollView>
      </View>
    </View>
    )
  }
  DataList = (index) => {
    if (index === 1) {
      return <List data={this.props.goingToData} type={1} />;
    } 
    // else if (index === 2) {
    //   return <List data={this.props.detailsData} type={2} />;
    // } 
    else if (index === 0) {
      return <List data={this.props.storeData} type={0} />;
    } else if (index === 2) {
      return <List data={this.props.orderItemStrings} type={2} />;
    }
  };

  setActiveIndex = (index) => {
    this.setState({
      activeIndex: index,
    });
  };


  render() {   
    this.currentVariables = this.props.currentVariables;    
    return (
      <View style={styles.container}>
        {this._renderHeader()}
        {this.props.tabsVisible && this._renderContent()}
        
      {/* <Accordion
          activeSections={this.state.activeSections}
          sections={['Section 1']}
          //renderSectionTitle={this._renderSectionTitle}
          renderHeader={this._renderHeader}
          renderContent={this._renderContent}
          //onChange={this._updateSections}
        /> */}
      </View>
    );
  }
}

export default Card;
