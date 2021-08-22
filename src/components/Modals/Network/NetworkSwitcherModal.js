import Modal from "react-native-modalbox";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Image,
  View,
  Animated,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList
} from "react-native";
import { Color,Device, Languages, Styles, Constants, withTheme, GlobalStyle, Config } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import FastImage from "react-native-fast-image";

const baseViewHeaderPadding = 30;
const correctPhoneBaseHeaderPadding = Device.getCorrectIphoneXBaseHeaderPadding(baseViewHeaderPadding);
const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  flatListStyle: {  
    paddingBottom:10,
    backgroundColor:GlobalStyle.primaryColorDark.color,
   },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

class NetworkSwitcherModal extends React.PureComponent {
  constructor(props) {
    super(props);
    console.debug("CourierControlsModal modal constructor");
    this.state = {
      //scrollPosition:0
      latestLayoutHeight:0
    };
  }
  _flatListItemSeparator(itemSeparatorStyle) {
    return (
      <View
        style={itemSeparatorStyle}
      />
    );
  }

  _renderItemListValues(item, index) {
    let fullNetworkImgUrl = Config.NetworkImageBaseUrl + item.storeLogoUrl;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.listRowClickTouchStyle}
        onPress={() => this._setSelectedIndex(index, item)}
      >
        <View style={[styles.listRowContainerStyle, { backgroundColor:GlobalStyle.primaryColorDark.color}]}>
          <View style={{ paddingLeft:3,paddingRight:3,
           flex: 1, 
          flexDirection: "row", 
          alignContent:"center",
          backgroundColor:GlobalStyle.primaryColorDark.color,
          alignItems:"center",
          justifyContent:"center"          
          }}>
          <FastImage
              style={{
                marginLeft:8,
                padding: 8,
                maxHeight: 105,
                height: 105,
                width: 105,
                maxWidth: 105
                //   width: undefined
              }}
              source={{
                uri: fullNetworkImgUrl
              }}
              resizeMode="contain"
            />
            <View style={{flex:1, 
              alignContent:"center",
              alignItems:"center",paddingLeft:4, paddingTop:4, paddingRight:2,
              justifyContent:"center",   overflow:"visible"  }}>
            <Text numberOfLines={1} 
            style={{ color: "white", fontFamily:Constants.fontHeader,fontSize:16, textAlignVertical:"center"}}>{item.name}  
            </Text>            
            <Text style={{ textAlign:"center", color: "white", textAlignVertical:"center", fontSize:12, fontFamily:Constants.fontFamilyItalic}}>{item.description}</Text>
            </View>            
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  _setSelectedIndex(index, item) {
    this.props.selectedValue(index, item);
    this.setState({ selectedFlag: true});
    this.closeMe()
  }

  load = async () => {
    console.debug("in quick controls");
          
  }

  componentDidMount= async ()=>{
    
  }
  componentWillUnmount=()=>{
    
  }

  handleScroll=(event)=> {
    this.props.updateCurrentScrollPosition(event.nativeEvent.contentOffset.y)
    //this.setState({ scrollPosition: event.nativeEvent.contentOffset.y });
   };

  _renderFlatListOrEmptyPlaceholder=()=>{
    if(this.props.dataSource.length > 0)
      return(
      <FlatList
        ref={(ref)=>this.flatList = ref}
        onScroll={this.handleScroll} 
        style={styles.flatListStyle}
        onLayout={(event) => {
          var {x, y, width, height} = event.nativeEvent.layout;          
          //now scrollTO, or not if too high
          //check total height of flatLIst now compared to previous - if it's differnt, reset the scrollTo to zero
          let scrollTo = this.props.currentNetworkSwitchScrollOffset;
          if(height != this.state.latestLayoutHeight)
          {     
            //it was reset
            this.props.updateCurrentScrollPosition(0);
            this.flatList.scrollToOffset({ offset: 0, animated: false })
          }else{
            this.flatList.scrollToOffset({ offset: scrollTo, animated: false })
          }
          //update for next time
          this.setState({latestLayoutHeight:height });                            
        }}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        extraData={this.state}
        overScrollMode="never"
        ItemSeparatorComponent={() => this._flatListItemSeparator({height:10})}
        keyboardShouldPersistTaps="always"
        numColumns={1}
        data={this.props.dataSource}
        renderItem={({ item, index }) =>
          this._renderItemListValues(item, index)
        }
      />
      )

      return (
      <View style={{padding:14, paddingTop:50}}>
      <Image resizeMode={"contain"} style={{alignSelf:"center"}} 
      source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}/>      
      <Text     
      style={{textAlign:"center", paddingTop:20,fontFamily:Constants.fontFamilyBold, color:"white"}} 
      >{"Sorry, there were no networks nearby!"}</Text>
      </View>)
  }
 
  render() {
    console.debug("in network switcher");
    const {
      headerText,
      openClosed,   
      closeMe,
      dataSource,
      selectedValue,
      marginToSubtract,
      ...props
    } = this.props;

    this.openClosed = openClosed;
 
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          zIndex:99999,          
          marginTop:correctPhoneBaseHeaderPadding,
          backgroundColor: GlobalStyle.primaryColorDark.color,        
          height: null,        
          maxHeight:height* 0.69,         
       //   paddingBottom: 10,      
          borderRadius: 30,
          //overflow:"hidden",
          width: width - 14,                       
        }}  
        backdropColor={"black"}
        backdropOpacity={0.6}
        backdrop={true}
        entry={"bottom"}
        position={"center"}
        ref={"networkSwitcherModal"}
        isOpen={this.props.openClosed}
        backdropPressToClose={true}
        swipeToClose={true}
        onOpened={()=>this.load()}
        onClosed={() => this.closeMe()}
      >   
            <View style={{   
              backgroundColor:GlobalStyle.primaryBackgroundColor.color,
              zIndex:99999, borderRadius:30, maxHeight:0,  top :-8,
          alignItems:"center", alignContent:"center",justifyContent:"center"
          }}>
            <Image
              source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
              style={{ minHeight: 70, zIndex:99999,maxHeight:70, maxWidth:70, minWidth: 70 }}
            />            
          </View>           
                           
           <View style={{minHeight:6}}></View>
          <View style={{borderRadius:30,           
            overflow:"hidden", backgroundColor:GlobalStyle.primaryBackgroundColor.color}}>
         {/* <Text
              style={{
                fontFamily:Constants.fontFamily,
                color: GlobalStyle.modalTextBlackish.color,
                margin: 5,
                fontSize: 22,
                textAlign: "center",
              }}
            >
              {"Hop away..."}
            </Text> */}

            {/* <View
              style={{
                border: 1,
                borderColor: "orange",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity onPress={() => toast("Show photo")}>
                <Image
                  style={{
                    flex: 1,
                    borderRadius: 5,
                    maxHeight: 40,
                    height: 40,
                    width: undefined,
                  }}             
                  source={Config.InstanceDeploymentVariables.Hopperfy.MainAppLogo}
                  resizeMode="contain"
                />              
              </TouchableOpacity>
            </View>            */}
    
            {this._renderFlatListOrEmptyPlaceholder()}
        

       
          </View>    
         
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    currentNetworkSwitchScrollOffset: state.modals.currentNetworkSwitchScrollOffset    
  };
};

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/StoreRedux");
  const modalActions = require("@redux/ModalsRedux");
  const locationActions = require("@redux/LocationRedux");
  const driverStateActions = require("@redux/DriverRedux");
  return {
    updateCurrentScrollPosition:(newOffset)=>{
         dispatch(modalActions.actions.updateNetworkSwitcherScrollOffset(newOffset));
    },
   
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(NetworkSwitcherModal));

