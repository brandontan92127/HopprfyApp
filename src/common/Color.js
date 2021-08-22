/** @format */

import GlobalStyle from "./GlobalStyle";

export default {
  primary: GlobalStyle.primaryColorDark.color,

  // navigation bar
  headerTintColor: GlobalStyle.primaryColorDark.color,

  // bottom tab bar
  tabbar: "rgba(255, 255, 255, 1)",
  tabbarTint: GlobalStyle.primaryColorDark.color, // '#FF0074', //
  tabbarColor: "#ccc",

  // wishlist
  heartActiveWishList: "rgba(252, 31, 74, 1)",

  // step indicate from the checkout page
  checkout: {
    stepActive: GlobalStyle.primaryColorDark.color,
  },

  // Product tabs
  product: {
    TabActive: GlobalStyle.primaryColorDark.color,
    TabDeActive: "white",
    TabActiveText: "#333",
    TabText: "#333",
    BuyNowButton: GlobalStyle.primaryColorDark.color,
    OutOfStockButton: "#a44",
    ViewBorder: "#bcbebb",
    Text: "#333",
    TextLight: "darkgray",
    TextDark: "#000000",
  },

  //////////////////////////////////////////////////////////////////////////////////
  // NOTE: THE BELOW COLOR MAY NOT RELATED TO YOUR REBRANDING & NOT COMMON STYLE
  //////////////////////////////////////////////////////////////////////////////////

  // login screen color
  login: {
    facebook: "#3b5998",
    google: "#d34836",
  },

  category: {
    navigationBarColor: "#ffffff",
    navigationBarIcon: "rgba(0, 0, 0, 0.3)",
    navigationTitleColor: "rgba(0, 0, 0, 0.8)",
  },

  // common
  error: "#f44336",
  accent: "#FFC107",
  accentLight: "#FFD54F",
  blackTextPrimary: "rgba(0,0,0,1)",
  blackTextSecondary: "rgba(0,0,0,0.5)",
  blackTextDisable: "rgba(0,0,0,0.3)",

  lightTextPrimary: "rgba(255,255,255,1)",
  lightTextSecondary: "rgba(255,255,255,255.5)",
  lightTextDisable: "rgba(255,255,255,0.3)",

  lightDivide: "rgba(255,255,255,0.12)",
  blackDivide: "rgba(0,0,0,0.05)",
  background: "white",
  DirtyBackground: "#F0F0F0",

  // Text
  Text: "#333",
  spin: "#333333",

  attributes: {
    black: "#333",
    red: "#DF3737",
    green: "#2AB5B3",
    blue: "#38B1E7",
    yellow: "#FDF12C",
  },

  lightGrey: "rgba(247, 248, 250, 1)",
  lightGrey1: "rgba(212, 220, 255, 1)",
  darkOrange: "rgba(255, 132, 11, 1)",
  darkYellow: "rgba(255, 164, 31, 1)",
  yellow: "rgba(255, 198, 53, 1)",
  darkRed: "#8B0000",
  red: "#FF0000",
  lightgrey: "#D3D3D3",
  green: "#2AB5B3",
  blue: "#0091ea",
  lightBlue: "#9ddaff",
  blue1: "rgba(30, 165, 233, 1)",
  blue2: "rgba(3, 207, 254, 1)",

  starRating: "#FDF12C",

  reskin: {
    white: "#FFFFFF",
    secondary: "#DEE5EE",
    dark: "#000E22",
    primary: "#3559A2",
    darkTow: "#24333D",
    grey: "#7F8A97",
    text: "#94A3BE",
  },
};
