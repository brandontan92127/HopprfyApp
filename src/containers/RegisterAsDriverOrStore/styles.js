/** @format */

import { Dimensions, StyleSheet, I18nManager } from "react-native";
import { Color, Styles, Config, Theme, Constants } from "@common";

const { width, height } = Dimensions.get("window");
const isDark = Config.Theme.isDark

export default StyleSheet.create({
  container:{
    height: '100%',
    width: '100%',
    padding:8,
    flex:1,
  },
  logoWrap: {
    ...Styles.Common.ColumnCenter,
    flexGrow: 1,
  },
  logo: {
    width: Styles.width * 0.95,
    height: (Styles.width * 0.95) / 2,
  },
  subContain: {
    paddingHorizontal: Styles.width * 0.1,
    paddingBottom: 8,
  },
  loginForm: {
    paddingBottom:20,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
  },
  input: {
    color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
    borderColor: "#9B9B9B",
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 8,
    flex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: Color.primary,
    borderRadius: 5,
    elevation: 1,
  },
  separatorWrap: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    borderBottomWidth: 1,
    flexGrow: 1,
    borderColor: Color.blackTextDisable,
  },
  separatorText: {
    color: Color.blackTextDisable,
    paddingHorizontal: 10,
  },
  fbButton: {
    //backgroundColor:"hotpink",
    backgroundColor: Color.login.facebook,
    borderRadius: 5,
    elevation: 1,
  },
  // ggButton: {
  //     marginVertical: 10,
  //     backgroundColor: Color.google,
  //     borderRadius: 5,
  // },
  signUp: {
    fontFamily:Constants.fontFamilyMedium,
    color: "white",
    marginTop: 20,
  },
  highlight: {
    fontFamily:Constants.fontHeader,
    fontWeight: "bold",
    color: Color.primary,
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  inputContainer: {
    width: '100%',
    marginVertical: '5%',
    paddingBottom:50,
  },
  textinput: {
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
    marginVertical: '4%',    
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Constants.fontFamily
  },
  text: {
    fontSize: 20,
   textAlign:"center",
    color: '#D8EAFC',
    marginBottom: '5%',
    fontFamily: 'RedHatDisplay-Bold',
  },
  btn: {
    backgroundColor: '#D8EAFC',
    height: '5%',
    width: '80%',
    alignContent:"center",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 25,
  },
  btnText: {
    fontSize: 16,
    //color: '#572A91',
    color:"purple",
    fontFamily: Constants.fontFamily
  },
});
