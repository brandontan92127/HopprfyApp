import { StyleSheet,Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");
const rowIconWidth = width * 0.06;

export default StyleSheet.create({
  primaryColorDark: {
    color: "#2A467E"
  },
  secondaryColor: {
    color: "#DEE5EE"
  },
  primaryBackgroundColor: {
    color: "#F8F8F9"
  },
  introColorPink: {
    color: "#62007A"
  },
  introColorBlue: {
    color: "#3680EE"
  },
  softLinkColor: {
    color: "#A9B9CC"
  },
  hardLinkColor: {
    color: "#000E22"
  },
  tabText: {
    color: "#041222"
  },
  switchToggleColorOn:{
    color: "white"     
  },
  switchToggleColorOff:{     
    color:"#9bbff7"      
  },
  switchBGColor:{
    color: "#526a9a"
  },
  //MODALS
  modalBGcolor:{
    backgroundColor:"#f9f8f8"
  },
  modalHeader:{
    backgroundColor: "#dee5ee"
  },
  modalTextBlackish:{
    color: "#0b182b"
  },
  modalPrimaryButton:{
    backgroundColor:"#2a4782"
  },
  modalSecondaryButton:{
    backgroundColor:"#d1d8e2"
  },
  storeModal: {
    color : "#767d81"
  },
  cartDropdown:{
    backgroundColor: "#dee5ee"
  },
  cartPickerText:{
    color: "#041226"
  },
  rowImageContainer:{
    padding:3,
    borderRadius:30,
    flexDirection:"row",             
    alignItems:"center",                      
    width:width * 0.21,
    height:36,
    overflow:"hidden",       
    backgroundColor:"#f9f8f8"
  },
  rowImageContainerEmptyRow:{
    maxHeight:12, minHeight:12
  },
  superSearchRowTextColor:{
  color:"#c3ced8"
  },
  //NETWORK / PRODUCT SEARCH 
  rowImageIcon:{
    maxHeight:rowIconWidth,
    height: rowIconWidth,
    width: rowIconWidth,
    padding:2,
    margin:2,
    marginLeft:6,
   alignSelf:"flex-start",     
  },
  //FULL ORDER DISPLAY MODAL
  headerTextColor:{
    color:"#9dc1f7"
  },
  //GENERAL LIST ITEM
  

});