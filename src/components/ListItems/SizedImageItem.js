import React, { Component } from "react";
import { Image, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Header, Icon, Divider, List, ListItem } from "react-native-elements";
import ProductURLHelper from "../../services/ProductURLHelper";
import { Config, Images, GlobalStyle, Constants } from "@common";
import { toast, currencyFormatter } from "@app/Omni";
import FastImage from "react-native-fast-image"
import { StackActions, NavigationActions } from 'react-navigation';
import { NoFlickerImage } from 'react-native-no-flicker-image';
import { EventRegister } from "react-native-event-listeners";
import HopprWorker from "@services/HopprWorker";

const { width, height } = Dimensions.get("window");
const rowIconWidth = width * 0.06;
//portrait
const portraitDefaultViewH_W = {
  viewHeight: 120,
  viewWidth: 80,
  imgHeight: 114,
  imgWidth: undefined,
};
//land
const landscapeDefaultImgH_W = {
  viewHeight: undefined,
  viewWidth: 146,
  imgHeight: undefined,
  imgWidth: 140,
};
//square
const squareDefaultImgH_W = {
  viewHeight: 138,
  viewWidth: 138,
  imgHeight: 132,
  imgWidth: 132,
};

const newSquareCoverImgH_W = {
  viewHeight: width / 4,
  viewWidth: width / 4,
  imgHeight: (width / 4),
  imgWidth: (width / 4),
};

export default class SizedImageItem extends React.Component {
  constructor(props) {
    super(props);
    console.debug("In sized image item");
    this.networkImageBaseUrl = Config.NetworkImageBaseUrl;

    //set a portrait default
    this.state = {
      localDimensions: portraitDefaultViewH_W,
      isImagePortraitOrLandscape: "portrait",
    };
  }

  _resetHomeStackAndGo=()=>{
    EventRegister.emit("resetStacksAndGo");
    // let currentIndex = this.props.navigation.state.nav.index;
    // if(currentIndex == 0)
    // {
    // //reset home stack and go
    // const resetAction = StackActions.reset({
    //   index: 0,
    //   actions: [NavigationActions.navigate({ routeName: "Home" })],
    // });
    // this.props.navigation.dispatch(resetAction);
    // }
    // else if(currentIndex == 1) {
    //   //reset cat stack
    //   const resetCatAction = StackActions.reset({
    //     index: 0,
    //     actions: [NavigationActions.navigate({ routeName: "CategoriesScreen" })],      
    //   });
    //   this.props.navigation.dispatch(resetCatAction);
    // }
  }

  goToScreen = (routeName, params) => {
    if (!this.props.navigation) {
      return toast("Cannot navigate");
    } 
    console.debug("navigating to:" + routeName + " with params " + params);
    this.props.navigation.dispatch({ type: "Navigation/NAVIGATE", routeName, params }); 
  };

  componentDidMount = async () => {
    const { item } = this.props;

    this.productImageUrl = ProductURLHelper.generateProductURL(
      item.image ? item.image : item.product.images[0]
    );

    this.imageDimensions(this.productImageUrl).then((imageDimensionsResult) => {
      let localPortLand = "portrait";
      let toChangeTo = "";
      // if (imageDimensionsResult.width > imageDimensionsResult.height) {
      //   localPortLand = "landscape";
      //   toChangeTo = landscapeDefaultImgH_W;
      // } else if (imageDimensionsResult.width == imageDimensionsResult.height) {
      //   localPortLand = "square";
      //   toChangeTo = squareDefaultImgH_W;
      // } else {
      //   localPortLand = "portrait";
      //   toChangeTo = portraitDefaultViewH_W;
      // }
      // //store results


      //fixed square image now
         localPortLand = "square";
         toChangeTo = newSquareCoverImgH_W;

      this.setState({
        isImagePortraitOrLandscape: localPortLand,
        localDimensions: toChangeTo,
      });
    });
  };

  async imageDimensions(uri) {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width: width, height: height });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  _renderNetworkResultsRow = (item) => {

    if (typeof item.network !== "undefined") {
    let networkImageUrl = Config.NetworkImageBaseUrl + item.network?.storeLogoUrl;
    
      // let storesOrderByDistance = item.nearestStores.sort((a, b) =>
      //   parseFloat(a.distance) > parseFloat(b.distance) ? 1 : -1
      // );


      //do tags array
      var numberOfTags = item.network?.networkTags >= 3 ? 3 : item.network?.networkTags.length;
      let tagString = ""
      item.network?.networkTags.slice(0, numberOfTags - 1).map((tag) => {
        tagString += "#" + tag.tag + ", "
      });

      tagString = tagString.slice(0, tagString.length -2);


      return (
      <ListItem
      titleStyle={{fontFamily:Constants.fontHeader}}
      subtitleStyle={{fontFamily:Constants.fontHeader}}
        onPress={async () => {
          try {               
          EventRegister.emit("showSpinner");
          //adds to picker if not exists
          this.props.addNetworkToLocalPickerIfNotExists(item.network);
          //changes network picker ('real network')
          this._resetHomeStackAndGo();
          await this.props.changeNetwork(item.network?.networkId);
          //redirect to cart
          //this.props.goToScreen("HomeScreen", null);                  
          this.props.closeParentModal();
        } catch (error) {
            
        }
        finally{
          EventRegister.emit("hideSpinner");
        }
        }}
          rightIcon={
            <View style={{
              alignContent: "center", 
              alignItems: "center",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20
            }}>

          {/* FAVE AND SHOP */}
          <View style={{ 
          alignContent: "center",
           alignItems: "center", 
           flexDirection:"column" }}>      
                <View style={GlobalStyle.rowImageContainer}>
                <TouchableOpacity
                   onPress={async () => {
                    try {               
                    EventRegister.emit("showSpinner");
                    //adds to picker if not exists
                    this.props.addNetworkToLocalPickerIfNotExists(item.network);
                    //changes network picker ('real network')
                    this._resetHomeStackAndGo();
                    await this.props.changeNetwork(item.network?.networkId);
                    //redirect to cart
                    //this.props.goToScreen("HomeScreen", null);                  
                    this.props.closeParentModal();
                  } catch (error) {
                      
                  }
                  finally{
                    EventRegister.emit("hideSpinner");
                  }
                  }}
                >
                  <FastImage
                    style={GlobalStyle.rowImageIcon}
                    source={Images.NewAppReskinIcon.Shop}
                    resizeMode="contain"
                    defaultSource={Config.AppNetworkPlaceHolder}
                  />
                </TouchableOpacity>
                <View style={{flex:1, justifyContent:"center"}}>
                <Text
                  style={{
                    //fontStyle: "italic",
                    color: GlobalStyle.primaryColorDark.color,                    
                    textAlignVertical:"center",
                    fontFamily:Constants.fontFamily,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"SHOP"}
                </Text>
                </View>
                </View>

              </View>

              {/* <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                  padding: 3,
                  margin: 3,
                }}
              >
                <TouchableOpacity
                  onPress={async () => {                   
                  }}
                >
                  <Image
                    style={{
                      maxHeight: 28,
                      height: 28,
                      width: 28,
                      maxWidth: 28,
                    }}
                    source={Images.AddShopper1}
                    resizeMode="contain"
                  />
                  <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Fave"}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{ marginRight: 3, marginLeft: 3, color: "silver" }}
                >
                  {"|"}
                </Text>
                <TouchableOpacity
                
                >
                  <Image
                    style={{
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30,
                    }}
                    source={Images.AddDriver2}
                    resizeMode="contain"
                  />
                      <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Drive"}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{ marginRight: 3, marginLeft: 3, color: "silver" }}
                >
                  {"|"}
                </Text>
                <TouchableOpacity              
                >
                  <Image
                    style={{
                      paddingRight: 10,
                      paddingLeft: 3,
                      maxHeight: 30,
                      height: 30,
                      width: 30,
                      maxWidth: 30,
                    }}
                    source={Images.MapIconStore11}
                    resizeMode="contain"
                  />
                      <Text
                  style={{
                    fontStyle: "italic",
                    color: "grey",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {"Shop"}
                  </Text>
                </TouchableOpacity>
              </View>    */}
              
            </View>
          }          
          subtitleNumberOfLines={5}
          leftIcon={
            <View
              style={{
                margin: 4,                
                alignContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  this.props.setCurrentlySelectedLOCALNetwork(item.network)
                }
              >
                <FastImage
                  style={{
                    maxHeight: 100,
                    height: 100,
                    width: 100,
                    maxWidth: 100,
                    margin: 2,
                    marginRight: 5,
                  }}
                  defaultSource={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
                  source={{ uri: networkImageUrl }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {/* <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    flex: 1,
                    flexWrap: "wrap",
                    color: "grey",
                    fontSize: 11,
                    textAlign: "center",
                  }}
                >
                  {item.network.storeName}
                </Text>
              </View> */}
              <View style={{flex:1, flexDirection:"row"}}>
              <Text style={{
                flex: 1,     
                flexWrap:"wrap",
                numberOfLines: 4,
                color: "grey",
                fontSize: 10,
                textAlign: "center",
                fontFamily:Constants.fontFamily,
              }}>
                {tagString}
              </Text>
              </View>
            </View>
          }
          title={
            item.network?.storeName 
            // +
            // " - " +
            // storesOrderByDistance[0].name
          }
          titleNumberOfLines={3}
          subtitle={
            item.network?.description          
          }
          subtitleNumberOfLines={5}
          // onPress={async () => {
          //   try {               
          //     this.props.setCurrentlySelectedLOCALNetwork(item.network);
          // } catch (error) {
              
          // }
          // finally{
          //   EventRegister.emit("hideSpinner");
          // }
          // }}
         // onLongPress={() => this._updateLatestSelectedNetworkAndFilter(item)}
        />
      );
    } else {
      return null;
    }
  };


  _renderCategoryAndNetworkItem=(item)=>{
    let networkImageUrl = this.networkImageBaseUrl + item.network?.storeLogoUrl;
    if (((networkImageUrl == null) == typeof networkImageUrl) == "undefined") {
      networkImageUrl =
        "https://www.randschemicals.com/wp-content/themes/randschemical/images/di.png";
    }

    let imgSrc = Images.EmptyBox1;
    if(item.productClassDTO?.image != null && item.productClassDTO?.image !== '')
    {
      imgSrc = { uri: item.productClassDTO?.image};
    }

    return (
      <ListItem
        onPress={async () => {
          try {                                                    
          await  this._takeCategoryRowGoAction(item);                                            
        } catch (error) {                     
        }   
        finally{
            //close modal
            EventRegister.emit("hideSpinner");      
        }           
        }}
      titleStyle={{fontFamily:Constants.fontHeader}}
      subtitleStyle={{fontFamily:Constants.fontHeader}}
        leftIcon={                  
          <View style={{
            padding: 4,
            margin:4,
            overflow: "hidden",
            borderRadius: 8,
            marginRight:8,       
          }}>
            <View
              style={{                           
                overflow: "hidden",
                borderRadius:8,
                maxHeight: 100,
                height: 100,
                width: 100,
                maxWidth: 100,
              }}
            >
              <FastImage                
                style={{            
                  flex:1,     
                  maxHeight: 100,
                  height: 100,
                  width: 100,
                  maxWidth: 100,                 
                }}
                defaultSource={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
                source={imgSrc}                
              />
            </View>       
            </View> 
        }        
        title={item.productClassDTO?.name}
        titleContainerStyle={{
          flexShrink:1,
        }
        }
        titleNumberOfLines={5}
        subtitleNumberOfLines={3}
        subtitle={"on " + item.network?.storeName}
        rightIcon={
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  //just set the 'info' network - just in this component
                  this.props.setCurrentlySelectedLOCALNetwork(item.network);
                }}
              >
                <View
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FastImage
                    style={{
                      marginTop:6,
                      maxHeight: 24,
                      height: 24,
                      width: 24,
                      maxWidth: 24,
                      marginRight: 5,
                      marginLeft: 3,
                      marginBottom: 0,
                    }}
                    source={Images.Info2}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {               
                  EventRegister.emit("showSpinner");
                  //adds to picker if not exists
                  this.props.addNetworkToLocalPickerIfNotExists(item.network);
                  //changes network picker ('real network')
                  this._resetHomeStackAndGo();
                  await this.props.changeNetwork(item.network?.networkId);
                  //redirect to cart
                  //this.props.goToScreen("HomeScreen", null);                  
                  this.props.closeParentModal();
                } catch (error) {
                    
                }
                finally{
                  EventRegister.emit("hideSpinner");
                }
                }}
              >
                <View
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FastImage
                    style={{
                      marginTop:6,
                      maxHeight: 40,
                      height: 40,
                      width: 40,
                      maxWidth: 40,
                      marginRight: 5,
                      marginLeft: 3,
                    }}
                    source={{ uri: networkImageUrl }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      maxWidth: 62,
                      color: "silver",
                      fontFamily:Constants.fontFamily,
                      fontSize: 11,
                      textAlign: "center",
                    }}
                  >
                     {"View all"}
                    {/* {"View all @\n" + item.network.storeName} */}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* END MIDDLE COLOUM */}
            <Text style={{ fontFamily:Constants.fontFamily, marginRight: 5, color: "silver" }}>{"|"}</Text>
            <View style={{ flexDirection: "column" }}>
          {/* START ROWS */}
            <TouchableOpacity
                   onPress={async () => {
                    try {               
                    EventRegister.emit("showSpinner");
                    //adds to picker if not exists
                    this.props.addNetworkToLocalPickerIfNotExists(item.network);
                    //changes network picker ('real network')
                    this._resetHomeStackAndGo();
                    await this.props.changeNetwork(item.network?.networkId);
                    //redirect to cart
                    //this.props.goToScreen("HomeScreen", null);                  
                    this.props.closeParentModal();
                  } catch (error) {
                      
                  }
                  finally{
                    EventRegister.emit("hideSpinner");
                  }
                  }}
                >
            <View style={[GlobalStyle.rowImageContainer]}>                
                  <FastImage
                    style={GlobalStyle.rowImageIcon}
                    source={Images.NewAppReskinIcon.Store}
                    resizeMode="contain"
                    defaultSource={Config.AppNetworkPlaceHolder}
                  />
              
                <View style={{flex:1, justifyContent:"center"}}>
                <Text
                  style={{
                    //fontStyle: "italic",
                    color: GlobalStyle.superSearchRowTextColor.color,                    
                    textAlignVertical:"center",
                    fontFamily:Constants.fontFamily,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"STORE"}
                </Text>
                </View>
                </View>
                </TouchableOpacity>

          
              <View style={GlobalStyle.rowImageContainerEmptyRow}></View>
              {/* SECOND ONE */}
              <TouchableOpacity
                     onPress={async () => {
                      try {                                                    
                      await  this._takeCategoryRowGoAction(item);                                            
                    } catch (error) {                     
                    }   
                    finally{
                        //close modal
                        EventRegister.emit("hideSpinner");      
                    }           
                    }}
                >
              <View style={GlobalStyle.rowImageContainer}>             
                  <FastImage
                    style={GlobalStyle.rowImageIcon}
                    source={Images.NewAppReskinIcon.GoingTo}
                    resizeMode="contain"                 
                  />
            
                <View style={{flex:1, justifyContent:"center"}}>
                <Text
                  style={{
                    //fontStyle: "italic",
                    color: GlobalStyle.primaryColorDark.color,                    
                    textAlignVertical:"center",
                    fontFamily:Constants.fontFamily,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {"GO"}
                </Text>
                </View>
                </View>
                </TouchableOpacity>

                
            </View>
          </View>
        }
        />);
          
  }

  _takeCategoryRowGoAction=async (item)=>{
    EventRegister.emit("showSpinner");
    //adds to picker if not exists
    this.props.addNetworkToLocalPickerIfNotExists(item.network);                      
    //changes network picker ('real network')
    this._resetHomeStackAndGo();
    this.props.closeParentModal();
    await this.props.changeNetwork(item.network?.networkId);                
    
    
    let fullCat = await HopprWorker.getCategory(item.productClassDTO?._id);                                              
    this.props.setSelectedCategory(fullCat[0]);
    setTimeout(()=>
    {
      this.props.goToScreen("CategoryScreen", {selectedCategory: fullCat[0]})                        
    }, 400);                    
    
    // await this.props.addNetworkPermissionThenAddToCart(
    //   item.network,
    //   item.product,
    //   "Customer"
    // );
    //redirect to cart
    //this.props.goToScreen("CategoryScreen", {selectedCategory : singleClassResult[0]} );
    //get the full category w/ all prods
  }

  _renderProductAndNetworkItem=(item)=>{
    let productImageUrl = ProductURLHelper.generateProductURL(
      item.image
    );
    let productImgPayload = { uri : productImageUrl};
    if (productImageUrl === null || typeof productImageUrl === "undefined" || productImageUrl === "") {
      productImgPayload =Images.EmptyBox1;
    }

    return (
      <ListItem
      titleStyle={{fontFamily:Constants.fontHeader}}
      subtitleStyle={{fontFamily:Constants.fontHeader}}
        subtitleNumberOfLines={2}
        leftIconOnPress={() => toast("Pressed left icon")}
        title={
          item.name
        }
        titleContainerStyle={{
          flexShrink:1,
        }
        }
        titleNumberOfLines={3}
       subtitle={item.description}
        leftIcon={        
          <View style={{
            padding: 4,
            margin:4,
            overflow: "hidden",
            borderRadius: 8,
            marginRight:8,       
          }}>
            <View
              style={{                           
                overflow: "hidden",
                borderRadius:8,              
              }}
            >
              <FastImage                
                style={{                 
                  maxHeight: 100,
                  height: 100,
                  width: 100,
                  maxWidth: 100,
                  margin: 2,
                  marginRight: 5,
                }}
                defaultSource={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
                source={productImgPayload}                
              />
            </View>       
            </View> 
        }
      />
    );
  }

  render() {
    const { item, ...props } = this.props;
        
    //depends on what type, render correct row
   if(item.resultType === "Product" || item.type === "Product")
   {    
      return this._renderProductAndNetworkItem(item);
   }
   else if(item.resultType === "Class" || item.type === "Class")
   {
    //return null;
     return this._renderCategoryAndNetworkItem(item);
   }
   else if(item.resultType === "Network" || item.type === "Network")
   {
    return this._renderNetworkResultsRow(item);
   }
   else{
     return null;
   }
  }
}
