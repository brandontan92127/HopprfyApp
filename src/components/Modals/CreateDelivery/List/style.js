import { StyleSheet, Dimensions } from "react-native";

let itemWidth = null;
let deviceWidth = Dimensions.get("window").width;
if (deviceWidth >= 400) {
  itemWidth = "70%";
} else {
  itemWidth = "70%";
}

const styles = StyleSheet.create({
  listMain: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
    // marginTop: "5%"
  },
  listContainer: {
    flexDirection: "row",
    width: "70%",
    padding: "3.5%",
    justifyContent: "center"
  },
  leftSide: {
    width: "70%",
    textTransform: "uppercase",
    fontSize: 12
  },
  leftSideFonts: {
    color: "#AFBECD",
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: "RedHatDisplay-Regular"
  },
  rightSide: {
    width: "85%"
  },
  rightSideFonts: {
    color: "#24333D",
    textAlign: "right",
    fontSize: 12,
    fontFamily: "RedHatDisplay-Regular"
  },
  divider: {
    borderBottomColor: "#AFBECD",
    borderBottomWidth: 1,
    width: "100%"
  }
});

export default styles;
