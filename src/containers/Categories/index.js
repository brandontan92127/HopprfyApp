/** @format */

// @flow
/**
 * Created by InspireUI on 19/02/2017.
 */
import React from "react";
import {
  View,
  Text,
  Image,
  Animated,
  ScrollView,Dimensions,
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import { Images, Config, Languages, withTheme, Device, Constants, GlobalStyle } from "@common";
import { toast, BlockTimer } from "@app/Omni";
import { Empty, LogoSpinner, SplitCategories } from "@components";
import styles from "./styles";
import Icon from "@expo/vector-icons/FontAwesome";
import { TouchableScale } from "@components";
import { NoFlickerImage } from "react-native-no-flicker-image";
import RNRestart from 'react-native-restart'; // Import package from node modules
import { a } from "../../../changed_modules/react-native-render-html/src/HTMLRenderers";

const { width, height } = Dimensions.get("window");
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const baseViewHeaderPadding = 30;
const correctPhoneBaseHeaderPadding = Device.getCorrectIphoneXBaseHeaderPadding(baseViewHeaderPadding);

class CategoriesScreen extends React.PureComponent {
  componentDidMount() {
    console.debug("in categories screen");
    const { fetchCategories } = this.props;

    //maybe this is what's fucking it up - cats shoould already be fetcvhed in first screen
    //fetchCategories(this.props.lastSeletedNetworkGuid);
  }

  state = {
    scrollY: new Animated.Value(0),
  };

  changeLayout = () => this.props.setActiveLayout(!this.props.selectedLayout);

  componentWillReceiveProps(props) {
    const { error } = props.categories;
    if (error) toast(error);
  }

  _renderPageErrorButton=()=>{
    return (
      <ScrollView style={{}}>
         <View style={{alignItems:"center", flex:1,
      paddingTop:correctPhoneBaseHeaderPadding + (height * 0.04),
      justifyContent:"center"}}>
      <View style={{
        flex:1,
        alignContent:"center",        
        paddingLeft:8, 
        paddingRight:8,       
      alignItems:"center",
      justifyContent:"center"}}>      
         <TouchableOpacity 
        onPress={async()=> {
          try {
            RNRestart.Restart();
            // EventRegister.emit("resetStacksAndGo");        
            // await this._getAvailableShoppingNetworks();
            // this._fetchAllPost();  
          } catch (error) {
            
          }
          finally{
            EventRegister.emit("hideSpinner");
          }          
        }}>                              
           <Image
                      style={{
                        maxHeight: 200,
                        height: 200,
                        width: width,
                        maxWidth: width,
                      }}             
                      source={Images.NewAppReskinGraphics.SadFace}
                      resizeMode="contain"
                    />  
          {/* <Text style={{
          textAlign:"center", 
          color:"silver", 
          fontWeight:"bold",
          fontStyle:"italic",
          fontFamily:Constants.fontFamily,           
          fontSize:11, paddingTop:3}}>{"Click to refresh."}
          </Text> */}
          <Text style={{
          textAlign:"center", 
          color:GlobalStyle.primaryColorDark.color,         
          fontFamily:Constants.fontHeader,           
          fontSize:22, paddingTop:18}}>{"Sorry, nothing is available in your current chosen location."}
          </Text>    
       <Text style={{
          textAlign:"center", 
          color:GlobalStyle.modalTextBlackish.color,
          fontFamily:Constants.fontFamily,           
          fontSize:14, paddingTop:8}}>{"Why not open a store here youself?"}
          </Text> 
   
      </TouchableOpacity>           
      </View>
      </View>
      </ScrollView>
    )
  }


  renderLayoutButton = () => {
    const hitSlop = { top: 20, right: 20, left: 20, bottom: 20 };
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={this.changeLayout}
        activeOpacity={1}
        hitSlop={hitSlop}
      >
        <Icon.Button
          onPress={this.changeLayout}
          color="#fff"
          iconStyle={{ backgroundColor: "transparent", left: 5 }}
          borderRadius={50}
          backgroundColor="transparent"
          name="exchange"
          size={14}
        />
      </TouchableOpacity>
    );
  };

  onRowClickHandle = (category) => {
    const { setSelectedCategory, onViewCategory } = this.props;
    setSelectedCategory({
      ...category,
      mainCategory: category,
    });
    BlockTimer.execute(() => {      
      onViewCategory({ mainCategory: category });
    }, 500);
  };

  _getPaddingValue=()=>{
    return Device.getCorrectIphoneXViewBasePadding(0);
  }

  render() {
    const { categories, selectedLayout, onViewProductScreen } = this.props;
    const {
      theme: {
        colors: { background },
      },
    } = this.props;

    console.debug("stop");
    if (typeof categories =="undefined" || categories.list.length == 0) {
      return this._renderPageErrorButton();
    }

    if (categories.isFetching) {
      return <LogoSpinner fullStretch />;
    }

    if (Config.CategoryListView != true) {
      return (
        <SplitCategories
          onViewPost={(product) => onViewProductScreen({ product })}
        />
      );
    }

    //this pulls out parent categories - just pull everything at the moment
    const allCatsUnfiltered = categories.list.sort((x) => x.name).reverse();
    let mainCategories = [];
    allCatsUnfiltered.map(cat=>{
      if(cat.Products.length > 0)
      {
        mainCategories.push(cat);
      }
    })
    
    // const mainCategories = categories.list.filter(
    //   category => category.parent === 0
    // );
    const topPaddingValue = this._getPaddingValue();
    

    return (
      <View style={{ flex: 1, backgroundColor: background , paddingTop:topPaddingValue}}>
        <AnimatedScrollView
          scrollEventThrottle={1}
          contentContainerStyle={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {typeof categories !== "undefined" &&
            mainCategories.map((category, index) => {
              const textStyle = { marginLeft: 10, textAlign: "left" };

              console.debug("rendering image category for:" + category);

              let catImageBaseUrl = Config.ProductClassImageBaseUrl;

              //set image URL depending on what type of link it is
              if (
                category.image != null &&
                typeof category.image !== "undefined"
              ) {
                if (
                  category.image.indexOf("http://") == 0 ||
                  category.image.indexOf("https://") == 0
                ) {
                  //it's already an HTTP link, don't add anything
                  catImageBaseUrl = "";
                }
              }

              const imageCategory =
                category.image !== null
                  ? { uri: catImageBaseUrl + category.image }
                  : Images.categoryPlaceholder;

              return (
                <View style={styles.containerStyle}>
                  <TouchableScale
                    style={styles.imageView}
                    key={category._id + "img"}
                    onPress={() => this.onRowClickHandle(category)}
                  >
                    <NoFlickerImage style={styles.image} source={imageCategory} />
                    <View
                      style={[
                        styles.overlay,
                        { alignItems: "flex-start" },
                      ]}
                    >
                      <Text style={[styles.mainCategoryText, { marginTop: 70, ...textStyle }]}>
                        {category.name.replace(/_/g, " ")}
                      </Text>
                      <Text
                        style={[styles.numberOfProductsText, { ...textStyle }]}
                      >
                        {`${category.Products.length} products available`}
                      </Text>
                    </View>
                  </TouchableScale>
                </View>
              );
            })}
        </AnimatedScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    categories: state.categories,
    netInfo: state.netInfo,
    user: state.user,
    selectedLayout: state.categories.selectedLayout,
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
      console.debug("fetching categories");

      if (!netInfo.isConnected) return toast(Languages.noConnection);
      actions.fetchCategories(dispatch, lastSeletedNetworkGuid);
    },
    setActiveLayout: (value) => dispatch(actions.setActiveLayout(value)),
    setSelectedCategory: (category) =>
      dispatch(actions.setSelectedCategory(category)),
  };
}

export default connect(
  mapStateToProps,
  undefined,
  mergeProps
)(withTheme(CategoriesScreen));
