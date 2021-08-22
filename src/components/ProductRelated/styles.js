/** @format */

import { StyleSheet, Dimensions } from "react-native";
import { Color, Constants, GlobalStyle } from "@common";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "'rgba(255, 255, 255, 1)'",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  head: {
    width: width / 2,
    paddingLeft: 15,
    marginLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    // borderBottomWidth: 2,
    // borderStyle: "solid",
    // borderColor: Color.headerTintColor,
    //backgroundColor: "'rgba(255,255,255,1)'",
  },
  headTitle: {
    color: GlobalStyle.softLinkColor.color,
    fontSize: 14,
    marginLeft: 8,
  },
  flatlist: {
    flexWrap: "wrap",
    flexDirection: "row",
    //backgroundColor: "#fff",
    marginTop: 10,
    paddingTop: 8,
    paddingBottom: 20,
  },
});
