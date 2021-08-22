import { StyleSheet, Dimensions } from "react-native";
import { Constants, withTheme, GlobalStyle } from "@common";

const styles = StyleSheet.create({
  container: {
    top: "2%",
    alignItems: "center",
    backgroundColor: "rgba(222, 229, 238, 0.6)",
    position: "absolute",
    alignSelf: "center",
    padding: 10,
    borderRadius: 50,
    flexDirection: "row",
    zIndex: 2,
  },
  indicator: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: "#22a6b3",
  },
  offline: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: "#ff4757",
  },
  yellow: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: "yellow",
  },
  blue: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: GlobalStyle.primaryColorDark.color,
  },
  

  image: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
});

export default styles;
