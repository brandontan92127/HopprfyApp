/** @format */

import { StyleSheet, Platform, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import { Color, Config, Constants, Device, Styles, Theme } from "@common";
const isDark = Config.Theme.isDark;

export default StyleSheet.create({
  row: {
    borderColor: isDark ? "#101425" : "#F5F5F5",
    padding: 18,
    backgroundColor: "white",
    borderRadius: 30,
    width: "48%",
    justifyContent: "center",
    minHeight: "8%",
    marginBottom: 18
  },
  title: {
    fontSize: 14,
    fontFamily: Constants.fontFamily,
    color: "#A5B5C7"
  },
  subtitle: {
    fontSize: 14,
    color: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
    fontWeight: "300",
    fontFamily: Constants.fontFamily,
    marginTop: "2%"
  }
});
