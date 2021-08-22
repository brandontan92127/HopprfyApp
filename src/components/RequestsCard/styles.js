import { StyleSheet, Dimensions } from "react-native";
import { Constants, GlobalStyle } from "@common";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    width: width,
    marginVertical: 2,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    zIndex: 9999,
    elevation: 9999,
    width: "98%",
    height: (height / 100) * 8
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2
  },
  textBold: {
    color: "white",
    fontFamily: Constants.fontFamilyBlack
  },
  text: {
    color: "white",
    fontFamily: Constants.fontFamily
  },
  textSemiBold: {
    color: "white",
    fontFamily: Constants.fontFamilyBold
  }
});

export default styles;
