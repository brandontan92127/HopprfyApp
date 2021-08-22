import { StyleSheet, Dimensions } from "react-native";

let itemWidth = null;
let deviceWidth = Dimensions.get("window").width;
if (deviceWidth >= 400) {
  itemWidth = "30%";
} else {
  itemWidth = "45%";
}

const styles = StyleSheet.create({
  listMain: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flexDirection: "row",
    maxWidth: "70%",
    padding: "3.5%",
    justifyContent: "center",
    alignItems: "center",
  },
  leftSide: {
    width: itemWidth,
    fontSize: 12,
  },
  leftSideFonts: {
    color: "#AFBECD",   
    fontSize: 12,
    fontFamily: "RedHatDisplay-Regular",
  },
  rightSideFonts: {
    color: "#24333D",
    textAlign: "right",
    fontSize: 13,
    fontFamily: "RedHatDisplay-Regular",
  },
  divider: {
    borderBottomColor: "#AFBECD",
    borderBottomWidth: 1,
    width: "88%",
  },
});

export default styles;
