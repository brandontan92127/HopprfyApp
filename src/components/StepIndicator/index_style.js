/** @format */

import { StyleSheet } from "react-native";
import { Color, Constants, GlobalStyle } from "@common";

export default StyleSheet.create({
  container: {
    height: 74,
    //backgroundColor: "#fff",
    paddingBottom: 6,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    overflow:"visible",
    alignItems:"center"
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: "center",
    fontFamily: Constants.fontHeader,   
    overflow:"visible"
  },
  labelActive: {
    color: GlobalStyle.primaryColorDark.color,
    fontFamily: Constants.fontHeader,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
});
