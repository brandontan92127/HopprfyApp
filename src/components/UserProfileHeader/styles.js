/** @format */

import { StyleSheet, Platform, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import { Color, Config, Constants, Device, Styles } from "@common";

const avatarSize = 4.5;

export default StyleSheet.create({
  container: {
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  fullName: {
    fontFamily: Constants.fontFamilyBlack,
    color: Color.blackTextPrimary,
    backgroundColor: "transparent",
    fontSize: width / 18,
    marginBottom: 6,
    width: (width / 100) * 60
  },
  address: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#9B9B9B",
    fontWeight: "600"
  },
  textContainer: {
    marginLeft: 20,
    justifyContent: "center"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20
  },
  avatar: {
    height: width / avatarSize,
    width: width / avatarSize,
    borderRadius: width / avatarSize / 2
  },
  loginText: {
    color: "#666",
    fontFamily: Constants.fontFamilyBold,
    color: "#A5B5C7",
    fontSize: width / 25
  },
  btn: {
    backgroundColor: "white",
    borderRadius: 50,
    shadowColor: "#000",
    // width: 120,
    width: (width / 100) * 28,
    height: (height / 100) * 5,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center"
  }
});
