import React, { PureComponent, Component } from "react";
import { toast } from "@app/Omni";
import {
  Color,
  Images,
  Languages,
  Styles,
  GlobalStyle,
  Constants,
  withTheme,
} from "@common";
import FlashMessage, {
  showMessage,
  hideMessage,
} from "react-native-flash-message";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  TextInput,
  Image,
} from "react-native";
import Modal from "react-native-modalbox";
import { RNCamera } from 'react-native-camera';
import { connect } from "react-redux";
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { EventRegister } from "react-native-event-listeners";
import SoundPlayer from "react-native-sound-player";
import HopprWorker from "@services/HopprWorker";
import RNPickerSelect from "react-native-picker-select";
import ProductURLHelper from "../../services/ProductURLHelper";

const { width, height } = Dimensions.get("window");
const heightForTHeAutocompletes = (height * 0.050) + 4;
const heightForTHeAutocompleteImage = heightForTHeAutocompletes - 20;
const defaultSizeUnit = {
  sizeMeasurement:"",
  sizeUnit: "Add new size"
}

const itemsFOrPicker = [
  { label:"cl", value: "cl"},
  { label:"ml", value: "ml"},
  { label:"kg", value: "kg"}, 
  { label:"g", value: "g"}, 
  { label:"unit", value: "unit"}, 
  { label:"pack", value: "pack"}, 
]

/**Allows the adjustment of product stocks */
export default class BarcodeScanner extends Component {
    constructor(props) {
        super(props);
        this.camera = null;
        this.barcodeCodes = [];
            
        this.state = {
          openRequests:[],
          chosenSize:{
            sizeMeasurement:-1,
            sizeUnit:"None"
          },
          currentSizeRequest:undefined,
          // currentSizeRequest:{
          // sizes:[
          //   {
          //     sizeMeasurement:1,
          //     sizeUnit:"unit"
          //   },
          //   {
          //     sizeMeasurement:6,
          //     sizeUnit:"pack"
          //   }          
          //   ],
          //  },
          requestsModalOpen:false,
          allowedToScan:true,
          camera: {
            type: RNCamera.Constants.Type.back,
            flashMode: RNCamera.Constants.FlashMode.auto,
          },
          newVariantPrice: 1.98,
          newVariantSizeMeasurement:441,
          newVariantSizeUnit:"cl",
          showCreateVariantPanel:false
        };
      }

      _renderSizePickerRow = () => {            
          return (
            <View
              style={{  
                width:40,
                flex:1,
                maxWidth:60,
                borderWidth: 0,
                backgroundColor:GlobalStyle.cartDropdown.backgroundColor,       
                borderRadius: 30,
                maxHeight: 50,
                height: 50,
                marginHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RNPickerSelect
                useNativeAndroidPickerStyle={false}
                style={{
                  flex: 1,
                  borderWidth: 0,
                  color: GlobalStyle.cartPickerText.color,
                  height: 20,
                  alignItems: "center",
                  inputIOS: {
                    textAlign: "center",
                    padding:4,
                    fontFamily:Constants.fontFamily,
                    overflow:"hidden",
                    color: GlobalStyle.cartPickerText.color,
                  },
                  inputAndroid: {
                    textAlign: "center",
                    fontFamily:Constants.fontFamily,
                    padding:4,
                    overflow:"hidden",
                    color: GlobalStyle.cartPickerText.color,
                  },
                }}
                inputStyle={{
                  textAlign: "center",
                  fontFamily:Constants.fontFamily,
                  color: GlobalStyle.cartPickerText.color,
                  padding:4,
                  overflow:"hidden"
                }}
                onValueChange={async (itemValue, itemIndex) =>
                 this.setState({newVariantSizeUnit: itemValue})                
                }
                value={this.state.newVariantSizeUnit}
                items={itemsFOrPicker}
              />
            </View>
          );
        }

        _renderNewItemSizePickerRow = (_id) => {            
          return (
            <View
              style={{  
                width:40,
                flex:1,
                maxWidth:60,
                borderWidth: 0,
                backgroundColor:GlobalStyle.cartDropdown.backgroundColor,       
                borderRadius: 30,
                maxHeight: 50,
                height: 50,
                marginHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RNPickerSelect
                useNativeAndroidPickerStyle={false}
                style={{
                  flex: 1,
                  borderWidth: 0,
                  color: GlobalStyle.cartPickerText.color,
                  height: 20,
                  alignItems: "center",
                  inputIOS: {
                    textAlign: "center",
                    padding:4,
                    fontFamily:Constants.fontFamily,
                    overflow:"hidden",
                    color: GlobalStyle.cartPickerText.color,
                  },
                  inputAndroid: {
                    textAlign: "center",
                    fontFamily:Constants.fontFamily,
                    padding:4,
                    overflow:"hidden",
                    color: GlobalStyle.cartPickerText.color,
                  },
                }}
                inputStyle={{
                  textAlign: "center",
                  fontFamily:Constants.fontFamily,
                  color: GlobalStyle.cartPickerText.color,
                  padding:4,
                  overflow:"hidden"
                }}
                onValueChange={async (itemValue, itemIndex) =>
                  {
                    //find the right item and update it
                    this._updateATextInput(_id, "sizeUnit", itemValue)
                  }                
                }
                //value={this.state.newVariantSizeUnit}
                items={itemsFOrPicker}
              />
            </View>
          );
        }
      
    

      _renderAddVariantPanel =()=>{
        if(this.state.showCreateVariantPanel)
        {
        return (      
            <View style={{ height: 70, minHeight:70, padding:2,}}>
            <Text numberOfLines={1} style={{fontSize:14, margin:6, marginTop:4, 
              fontFamily:Constants.fontFamilyBold,
              color:GlobalStyle.modalTextBlackish.color}}>{"Add new size / price"}</Text>

            <View style={{flexDirection: "row", minHeight:70}}>    
                       {/* INPUTS   2*/}
            <View style={{ flexDirection: "row",
            backgroundColor:"white",
            padding:2, 
            paddingTop:2,
            marginLeft:13,
            marginRight:13,
            borderRadius: 30,
            flex: 1, 
            alignContent:"center", 
            alignItems:"center", 
            justifyContent:"center" }}>   
              <Image
              style={{                
                margin: 0,                
                marginLeft:6,
                marginRight:2,
                maxHeight: heightForTHeAutocompleteImage,
                height: heightForTHeAutocompleteImage,
                width: heightForTHeAutocompleteImage,
              }}
              source={Images.NewAppReskinIcon.Payment1}
              resizeMode="contain"
            />
           <TextInput
                style={{
                  height:heightForTHeAutocompletes,
                  fontSize: 12,
                  flex: 1,
                  padding:4,
                  margin: 4,                                    
                  borderWidth: 0,
                  borderRadius: 30,
                  backgroundColor:"white",
                  borderColor: "lightblue",
                  color: "black",
                }}
                keyboardType={"numeric"}
                value={this.state.newVariantPrice}                
                onChangeText={(text) => this.setState({newVariantPrice:text})}
                placeholderTextColor={"silver"}
                placeholder={" Your Price £ (e.g. 2.99)"}
              />
              </View>


            {/* INPUTS   1*/}
            <View style={{ flexDirection: "row",
            backgroundColor:"white",
            padding:2, 
            paddingTop:2,
            marginLeft:13,
            marginRight:13,
            borderRadius: 30,
            flex: 1, 
            alignContent:"center", 
            alignItems:"center", 
            justifyContent:"center" }}>   
              <Image
              style={{                
                margin: 0,                
                marginLeft:6,
                marginRight:2,
                maxHeight: heightForTHeAutocompleteImage,
                height: heightForTHeAutocompleteImage,
                width: heightForTHeAutocompleteImage,
              }}
              source={Images.NewAppReskinIcon.Driver}
              resizeMode="contain"
            />
           <TextInput
                style={{
                  height:heightForTHeAutocompletes,
                  fontSize: 12,
                  flex: 1,
                  padding:4,
                  margin: 4,                                    
                  borderWidth: 0,
                  borderRadius: 30,
                  backgroundColor:"white",
                  borderColor: "lightblue",
                  color: "black",
                }}
                keyboardType={"numeric"}
                value={this.state.newVariantSizeMeasurement}                
                onChangeText={(text) => this.setState({newVariantSizeMeasurement:text})}
                placeholderTextColor={"silver"}
                placeholder={" Size (e.g. 440)"}
              />         
              </View>  

              {this._renderSizePickerRow()}

              <View style={{
              flexDirection:"row",
              alignContent:"center",
              alignItems:"center",
              justifyContent:"center"}}>
              {/* <TouchableOpacity style={{padding:2}}>
              <Image
                style={{
                  maxHeight: heightForTHeAutocompletes,
                  height: heightForTHeAutocompletes,
                  width: heightForTHeAutocompletes,
                  maxWidth: heightForTHeAutocompletes,
                }}
                source={Images.Cross1}
              />
              </TouchableOpacity> */}

              <TouchableOpacity 
              onPress={async()=>{
                  //it was an existing size, just add the perms and off we go
                await this._createSizeProductVariant();                
              }}
              style={{padding:2}}>
              <Image
                style={{
                  maxHeight: heightForTHeAutocompletes,
                  height: heightForTHeAutocompletes,
                  width: heightForTHeAutocompletes,
                  maxWidth: heightForTHeAutocompletes,
                }}
                source={Images.Tick4}
              />
              </TouchableOpacity>
              </View>
           </View>
           </View>  
        )
        }
        
      }

      componentDidMount= async()=>{
    //    this._openSizePickerModal();
       await this._refreshRequests();

      //  let variantReslut = await HopprWorker.addProductVariantViaBarcode(this.props.user.user.storeId, "5000157140920", "98299", "cl", "14.99");
      // let sop ="";
       //await this._addExistingProductVariant({sizeMeasurement :2, sizeUnit:"unit"})
     }

     _refreshRequests =async ()=>{
       try {
          let x = await HopprWorker.getProductCreationRequests();
          this.setState({openRequests: x.data});
        } catch (error) {
            
        }
     }

     _openModal=()=>{
      this.setState({requestsModalOpen: true});
     }

     _closeModal=()=>{
       this.setState({requestsModalOpen: false});
      }

     _openSizePickerModal=()=>{
      this.setState({sizePickerModalOpen: true});
     }

     _closeSizePickerModal=()=>{
       this.setState({sizePickerModalOpen: false});
      }

      _renderSizePickerModal=()=>{
        return(
          <Modal
           style={{
            backgroundColor: "#fff",           
            paddingBottom: 10,
            height:null,
            borderRadius: 20,
            borderWidth: 0,
            borderColor: "#2EB176",
            width: width - 16,
          }}
          backdrop={true}
          position={"center"}
          ref={"sizePickerModal"}
          isOpen={this.state.sizePickerModalOpen}
          onClosed={() => this._closeSizePickerModal()}
        >
          <Header
            backgroundColor={GlobalStyle.modalHeader.backgroundColor}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19
            }}
            rightComponent={{
              icon: "close",
              color: "#fff",
              onPress: () => this._closeSizePickerModal(),
            }}
            centerComponent={{
              text: "Which size?",
              style: { 
                fontSize:14,
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily:Constants.fontHeader,          
              },
            }}
          />
          <View style={{ flexGrow: 1, paddingBottom:20 }}>
            
            {this.state.showCreateVariantPanel && (<View style={{height:100}}>
            {this._renderAddVariantPanel()}
            </View>)}
            
            {this._renderCurrentSizesPicker()}
          </View>
        </Modal>        
        );
      }

      _renderModal=()=>{
        return(
          <Modal
           style={{
            backgroundColor: "#fff",
            height: null,
            paddingBottom: 10,
            borderRadius: 20,
            borderWidth: 0,
            borderColor: "#2EB176",
            width: width - 16,
          }}
          backdrop={true}
          position={"center"}
          ref={"productCreationRequestsModal"}
          isOpen={this.state.requestsModalOpen}
          onClosed={() => this._closeModal()}
        >
          <Header
            backgroundColor={GlobalStyle.modalHeader.backgroundColor}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19
            }}
            rightComponent={{
              icon: "close",
              color: "#fff",
              onPress: () => this._closeModal(),
            }}
            centerComponent={{
              text: "Review and complete",
              style: { 
                fontSize:14,
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily:Constants.fontHeader,          
              },
            }}
          />
          <View style={{ flexGrow: 1, paddingBottom:20 }}>
            {this.showProductList()}
          </View>
        </Modal>        
        );
      }

      _addExistingProductVariant=async(item)=>{
        try {
          EventRegister.emit("showSpinner");
          let storeid = this.props.user.user.storeId;
          let currentVariantBarcode = this.state.currentSizeRequest.barcode;        
          let size = item.sizeMeasurement;
          let unit = item.sizeUnit;
          
          let variantReslut = await HopprWorker.addExistingProductVariantViaBarcode (storeid, currentVariantBarcode, size, unit);
          //alert(variantReslut.status);

          //alert(JSON.stringify(item));
          if(variantReslut.status == 200)
          {
                //alert(JSON.stringify(item));               
                this._closeSizePickerModal();
                SoundPlayer.playSoundFile("notification5", "mp3");
                this.setState({currentSizeRequest:undefined});
                showMessage({
                  message:"That was added!",
                  message: `You're live retailing your item.`,
                  // description:
                  //   `You're selling it for £${returnedresutlt.basePrice} on network ${returnedresutlt.networkName}.`,
                  description:"Thanks.",                  
                  type: "success",
                  duration:4900,
                  autoHide: true,
                  position: "center",
                  backgroundColor: GlobalStyle.primaryColorDark.color,
                  hideOnPress: true,
                });                                    
          }
          else{
            alert('Variant add failed');// + JSON.stringify(variantReslut.data.message));
          }
        } catch (error) {
          
        }
        finally{
          EventRegister.emit("hideSpinner");
        }
      }

      _createSizeProductVariant= async (item)=>
      {        
        try {
          //alert('in create variant');
          EventRegister.emit("showSpinner");
          let storeid = this.props.user.user.storeId;
          let currentVariantBarcode = this.state.currentSizeRequest.barcode;
          let size = this.state.newVariantSizeMeasurement;
          let unit = this.state.newVariantSizeUnit;
          let basePrice = this.state.newVariantPrice;          
          //alert(storeid, currentVariantBarcode,size,unit, basePrice);
          let variantReslut = await HopprWorker.addProductVariantViaBarcode(storeid, currentVariantBarcode, size, unit, basePrice);
          //alert(variantReslut.status);
          if(variantReslut.status == 200 || variantReslut.status == 201)
          {
            SoundPlayer.playSoundFile("notification5", "mp3");
            this._closeSizePickerModal();
            showMessage({
              message: `Completed`,
              description:
                `Nice one. You're selling ${this.state.currentSizeRequest.productName} for £${basePrice}.`,
              type: "success",
              duration:6500,
              autoHide: true,
              position: "center",
              backgroundColor: GlobalStyle.primaryColorDark.color,
              hideOnPress: true,
            });
            //alert('Variant added');
            //clear the request
            this.setState({currentSizeRequest:undefined,
               showCreateVariantPanel:false,
               newVariantSizeMeasurement:"",
               newVariantPrice:"",
               newVariantSizeUnit:""
               });            
          }
          else{
            alert('Variant add failed result ' + variantReslut.status + " -- " +  JSON.stringify(variantReslut.data));
          }
        } catch (error) {
          alert("Ouch that failed:" + JSON.stringify(error));
        }
        finally{
          EventRegister.emit("hideSpinner");
        }

      }

      _completeARequest = async (_id)=>{
        try {   
          EventRegister.emit('showSpinner');                                  
          let theRowWeWant = this.state.openRequests.find((x) => x._id == _id);
          if(theRowWeWant.price == 0 || theRowWeWant.sizeMeasurement == 0 
            || theRowWeWant.sizeUnit == "")
            {
              alert("Can you make sure you put a size and a price please!")
              return;
            }

          //alert("We are sending: " + JSON.stringify(theRowWeWant));

          let result = await HopprWorker.completeProductCreationRequest(theRowWeWant._id,
          this.props.user.user.storeId,
          theRowWeWant.sizeMeasurement,
          theRowWeWant.sizeUnit,
          //"cl",
          theRowWeWant.price
          );
       
        if(result.status >= 200 && result.status <= 299)        
        {
          SoundPlayer.playSoundFile("notification5", "mp3");
          if(this.state.openRequests.length == 1)
          {
            //shut the modal if this was the last request
            this._closeModal()
          }
          this._removeItemFromArray(_id);          
          showMessage({
            message: `Completed`,
            description:
              `Nice one. You're selling that item now.`,
            type: "success",
            duration:6500,
            autoHide: true,
            position: "center",
            backgroundColor: GlobalStyle.primaryColorDark.color,
            hideOnPress: true,
          });
          
        }
        else{ 
          showMessage({
          message: `That did not work`,
          description: JSON.stringify(result.data),
          type: "success",
          duration:2500,
          autoHide: true,
          position: "bottom",
          backgroundColor: "red",
          hideOnPress: true,
        });
          
        }
      } catch (error) {
          alert("Whoa, that exceptioned:" + JSON.stringify(error));
      }
      finally{
        EventRegister.emit('hideSpinner');
      }
      }

      _updateATextInput=(_id, propName, text)=>{
        let stop = "";
        let theRowWeWant = this.state.openRequests.find((x) => x._id == _id);

        theRowWeWant[propName] = text;
        //do replacement              
        let copiedArray = [...this.state.openRequests];
        let indexOfItem = copiedArray.findIndex(
          (el) => el._id === _id
        );
        copiedArray[indexOfItem] = theRowWeWant;
        this.setState({openRequests : copiedArray});
      }

      _removeItemFromArray=(_id)=>{
        let theRowWeWant = this.state.openRequests.find((x) => x._id == _id);        
        //do replacement              
        let copiedArray = [...this.state.openRequests];        
        copiedArray = copiedArray.filter(x=>x._id !== theRowWeWant._id);
        this.setState({openRequests : copiedArray});
      }

      /**There are 2 choises here = create a new variant or use exstiing variant */
      _renderPickSizeRow=({ item })=>{
      //  alert("Image url" + JSON.stringify(item));
      //  alert(item.productImageUrl);
        //  let imageUrl = ProductURLHelper.generateProductURL(item.images[0]);
            return(
              <ListItem
              leftIcon={
                <View style={{borderRadius:30,height:80, width:80, padding:4, overflow:"hidden"}}>
                <Image 
                resizeMode={"cover"}
                source={
                 { uri: this.state.currentSizeRequest.productImageUrl }
                }
                style={{height:80, width:80}}/>
                </View>
              }
              onPress={async()=>{
                //which option did they choose? Either add existing variant OR
                //alert('they chose: ' + item.sizeUnit);
                if(item.sizeUnit != defaultSizeUnit.sizeUnit)  
                {
                 await this._addExistingProductVariant(item);                  
                }
                else{
                  this.setState({showCreateVariantPanel:true});
                }
              }
              }
              key={item._id}
              containerStyle={{
                backgroundColor:GlobalStyle.modalBGcolor.backgroundColor
              }} 
              titleStyle={{paddingLeft:8}}                   
              title={item.sizeMeasurement + " " + item.sizeUnit}              
              />
            )
      }

      _renderProductRequestRow=({ item })=>{
      //  let imageUrl = ProductURLHelper.generateProductURL(item.images[0]);
          return(
            <ListItem
            key={item._id}
            containerStyle={{
              backgroundColor:GlobalStyle.modalBGcolor.backgroundColor
            }}
            roundAvatar            
            rightIcon={
              <View style={{
              flexDirection:"row",
              alignContent:"center",
              alignItems:"center",
              justifyContent:"center"}}>
              <TouchableOpacity style={{padding:2}}>
              <Image
                style={{
                  maxHeight: heightForTHeAutocompletes,
                  height: heightForTHeAutocompletes,
                  width: heightForTHeAutocompletes,
                  maxWidth: heightForTHeAutocompletes,
                }}
                source={Images.Cross1}
              />
              </TouchableOpacity>

              <TouchableOpacity               
              //onPress={()=>this._completeARequest(item._id)}
              onPress={async()=>{
               // alert(JSON.stringify(item))
                await this._completeARequest(item._id)
              }}
              style={{padding:2}}>
              <Image
                style={{
                  maxHeight: heightForTHeAutocompletes,
                  height: heightForTHeAutocompletes,
                  width: heightForTHeAutocompletes,
                  maxWidth: heightForTHeAutocompletes,
                }}
                source={Images.Tick4}
              />
              </TouchableOpacity>
              </View>
            }
            subtitleNumberOfLines={1}
            leftIconOnPress={() => toast("Pressed left icon")}
            title={
            <View style={{flex:1}}>
            <Text numberOfLines={1} style={{fontSize:14, margin:6, marginTop:4, 
              fontFamily:Constants.fontFamilyBold,
              color:GlobalStyle.modalTextBlackish.color}}>{item.name}</Text>
            <View style={{flex:1, flexDirection: "row", padding:4}}>       
            {/* ROW 1 */}
            {/* INPUTS   1*/}
            <View style={{ flexDirection: "row",
            backgroundColor:"white",
            padding:2, 
            paddingTop:2,
            marginLeft:13,
            marginRight:13,
            borderRadius: 30,
            flex: 1, 
            alignContent:"center", 
            alignItems:"center", 
            justifyContent:"center" }}>   
              <Image
              style={{                
                margin: 0,                
                marginLeft:6,
                marginRight:2,
                maxHeight: heightForTHeAutocompleteImage,
                height: heightForTHeAutocompleteImage,
                width: heightForTHeAutocompleteImage,
              }}
              source={Images.NewAppReskinIcon.Driver}
              resizeMode="contain"
            />
           <TextInput
                style={{
                  height:heightForTHeAutocompletes,
                  fontSize: 12,
                  flex: 1,
                  padding:4,
                  margin: 4,                                    
                  borderWidth: 0,
                  borderRadius: 30,
                  backgroundColor:"white",
                  borderColor: "lightblue",
                  color: "black",
                }}
                keyboardType={"numeric"}
                value={item.size}                
                onChangeText={(text) => this._updateATextInput(item._id, "sizeMeasurement", text)}
                placeholderTextColor={"silver"}
                placeholder={" Size (e.g. 440 ml)"}
              />
              </View>  
              {this._renderNewItemSizePickerRow(item._id)}
           </View>

           {/* ROW 2 */}
            {/* INPUTS   2*/}
          <View style={{flex:1, flexDirection: "row", padding:4}}>          
            <View style={{ flexDirection: "row",
            backgroundColor:"white",
            padding:2, 
            paddingTop:2,
            marginLeft:13,
            marginRight:13,
            borderRadius: 30,
            flex: 1, 
            alignContent:"center", 
            alignItems:"center", 
            justifyContent:"center" }}>   
              <Image
              style={{                
                margin: 0,                
                marginLeft:6,
                marginRight:2,
                maxHeight: heightForTHeAutocompleteImage,
                height: heightForTHeAutocompleteImage,
                width: heightForTHeAutocompleteImage,
              }}
              source={Images.NewAppReskinIcon.Payment1}
              resizeMode="contain"
            />
           <TextInput
                style={{
                  height:heightForTHeAutocompletes,
                  fontSize: 12,
                  flex: 1,
                  padding:4,
                  margin: 4,                                    
                  borderWidth: 0,
                  borderRadius: 30,
                  backgroundColor:"white",
                  borderColor: "lightblue",
                  color: "black",
                }}
                keyboardType={"numeric"}
                value={item.price}                
                onChangeText={(text) => this._updateATextInput(item._id, "price", text)}
                placeholderTextColor={"silver"}
                placeholder={" Your Price £ (e.g. 2.99)"}
              />
              </View>                      
              
           </View>
           </View>
            }
                    
            //subtitle={"Products: " + numberOfProds}            
            onPress={() => {
             
            }}
          />
          )
      }

      _renderCurrentSizesPicker=()=>{
        if(typeof this.state.currentSizeRequest !== "undefined")
        {
          return (           
            <FlatList
              style={{ flexGrow: 1 }}
              data={this.state.currentSizeRequest.sizes}
              renderItem={this._renderPickSizeRow}
              keyExtractor={(item) => item._id}
            />           
        );
        }        
      }

      showProductList = () => {
        if (this.state.openRequests.length > 0) {
          return (           
              <FlatList
                style={{ flexGrow: 1 }}
                data={this.state.openRequests}
                renderItem={this._renderProductRequestRow}
                keyExtractor={(item) => item._id}
              />           
          );
        } else {
          return (
            <View style={{minHeight:180}}>
              <Image
                style={{
                  flex: 1,
                  maxHeight: 140,
                  minHeight: 140,
                  width: undefined,
                }}
                source={Images.whereisIt}
                resizeMode="contain"
              />
              <Text style={{ color: "black", fontSize: 20, textAlign: "center" }}>
                {"There were no products to show!"}
              </Text>
            </View>
          );
        }
      };
    
      onBarCodeRead = async (scanResult)=> {
        if(!this.state.allowedToScan || 
          this.state.requestsModalOpen ||
          this.state.showCreateVariantPanel)
        {          
          return; 
        }         
        this.setState({allowedToScan:false});
        try {
          EventRegister.emit("showSpinner");
          console.warn(scanResult.type);
          console.warn(scanResult.data);
          if (scanResult.data != null) {       

            let barcodeResult = scanResult.data;
            //alert("Read new barcode: " + barcodeResult);
            let x = await HopprWorker.addProductViaBarcode(barcodeResult, this.props.user.user.storeId)
           // alert('got result' + JSON.stringify(x));
            let returnedStatus = x.status;
            //alert(returnedStatus);
              if (returnedStatus == 200 || returnedStatus == 201) {
                let returnedresutlt = x.data;                
                //alert(returnedresutlt.barcodedProductResponseType);
                switch(returnedresutlt.barcodedProductResponseType)
                {
                  case "MatchNeedsRevisions":
                    showMessage({
                      message: `Pick a size or create a new ${returnedresutlt.productName} variation. Click the open requests button above.`,
                      // description:
                      //   `You're selling it for £${returnedresutlt.basePrice} on network ${returnedresutlt.networkName}.`,
                      description:"Thanks.",                      
                      type: "success",
                      duration:4500,
                      autoHide: true,
                      position: "bottom",
                      backgroundColor: GlobalStyle.primaryColorDark.color,
                      hideOnPress: true,
                    });
                    SoundPlayer.playSoundFile("notification5", "mp3");
                    returnedresutlt.sizes.push(defaultSizeUnit);
                    //alert(JSON.stringify(returnedresutlt));
                    this.setState({currentSizeRequest : returnedresutlt})
                    this._openSizePickerModal();
                    break;
                  case "NoMatch":
                    showMessage({
                      message: `${returnedresutlt.productName} needs revisions`,
                      description:
                        `You need to set a price and a size. Click below.`,
                      type: "success",
                      duration:2500,
                      autoHide: true,
                      position: "bottom",
                      backgroundColor: "orange",
                      hideOnPress: true,
                    });
                    SoundPlayer.playSoundFile("notification5", "mp3");
                    break;
                }
                
                await this._refreshRequests();
              }
              else if (returnedStatus == 400) {
                showMessage({
                  message: `Sorry we don't stock that`,// ${returnedresutlt.productName}`,
                  description:
                    "We will add it to the list for the future",
                  type: "success",
                  duration:2200,
                  autoHide: true,
                  position: "bottom",
                  backgroundColor: "#ED8C48", // background color
                  hideOnPress: true,
                });
                SoundPlayer.playSoundFile("negative1", "mp3");                
                //alert(x.data.message);
              }
              else{
                alert('Failed, not sure what went wrong?');
                SoundPlayer.playSoundFile("negative1", "mp3");                
              }                            
          }
          return;                  
        } catch (error) {
          alert('Try catch failed:' + JSON.stringify(error));
        }
        finally{
          EventRegister.emit("hideSpinner");
          setTimeout(()=>{
            this.setState({allowedToScan:true});
          },1500);          
        }
      
      }
    
      async takePicture() {
        if (this.camera) {
          const options = { quality: 0.5, base64: true };
          const data = await this.camera.takePictureAsync(options);
          console.log(data.uri);
        }
      }
    
      pendingView() {
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: 'lightgreen',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>Waiting</Text>
          </View>
        );
      }
    
      render() {
        return (
          <View style={styles.container}>
            <RNCamera
                ref={ref => {
                  this.camera = ref;
                }}
                defaultTouchToFocus
                flashMode={this.state.camera.flashMode}
                mirrorImage={false}
                onBarCodeRead={async (scanResult)=>await this.onBarCodeRead(scanResult)}
                onFocusChanged={() => {}}
                onZoomChanged={() => {}}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
                style={styles.preview}
                type={this.state.camera.type}
            />
            <View style={[styles.overlay, styles.topOverlay]}>
          <Text style={styles.scanScreenMessage}>Please scan the barcode.</Text>
        </View>
        <View style={[styles.overlay, styles.bottomOverlay]}>
            <TouchableOpacity 
              onPress={() => this.props.navigation.goBack(null)}
              style={styles.enterBarcodeManualButton}>                
              <Image
                style={{
                  maxHeight: 60,
                  height: 60,
                  width: 60,
                  maxWidth: 60,
                }}
                source={Images.NewAppReskinIcon.CloseButton}
               />
             </TouchableOpacity>
            <View style={[styles.enterBarcodeManualButton,{ backgroundColor:"transparent", width:10}]}>   

            </View>
             <TouchableOpacity 
              onPress={() => this._openModal()}
              style={styles.enterBarcodeManualButton}>                
                <Text
                style={{ textAlign:"center", fontSize:22, fontFamily:Constants.fontFamily, color:"white"}}
                >{this.state.openRequests.length}</Text>
                <Text
                style={{ textAlign:"center", fontSize:11, fontFamily:Constants.fontFamily, color:"white"}}
                >{"to review"}</Text>
             </TouchableOpacity>                               
          </View>
          {this._renderModal()}
          {this._renderSizePickerModal()}
          </View>
        );
      }
    }
    
    const styles = {
      container: {
        flex: 1
      },
      preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
      },
      overlay: {
        position: 'absolute',
        padding: 16,
        right: 0,
        left: 0,
        alignItems: 'center'
      },
      topOverlay: {
        top: 0,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      bottomOverlay: {
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      },
      enterBarcodeManualButton: {
        padding: 15,
        maxHeight:80,
        overflow:"hidden",
        justifyContent: 'center',
        alignItems: 'center',
        alignContent:"center",
        height:80,
        width:80,
        maxWidth:80,
        fontFamily:Constants.fontFamily,
        color:"white",
        backgroundColor: GlobalStyle.primaryColorDark.color,
        borderRadius: 40
      },
      scanScreenMessage: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
      }
    };

const mapStateToProps = (state) => ({
  language: state.language,
  user: state.user,
  stockAndAmendments: state.store.myStoreStocksAndAmendments,
});



module.exports = connect(
  mapStateToProps,
  null,
  // mergeProps
)(BarcodeScanner);
