/** @format */

import { StyleSheet } from "react-native";
import {Constants} from "@common";

export default StyleSheet.create({
  container: {
    paddingLeft: 15,
    paddingBottom: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  wrap: {
    alignItems: "center",
  },
  title: {
    marginTop: 6,
    fontSize: 11,
    fontFamily:Constants.fontFamily,
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
});
