import { StyleSheet, Dimensions } from "react-native";
import { Constants, GlobalStyle } from "@common";

const styles = StyleSheet.create({
  btnFilled: {
    borderColor: GlobalStyle.primaryColorDark.color,
    borderWidth: 3,
    backgroundColor: GlobalStyle.primaryColorDark.color,
    paddingVertical: "4%",
    width: "35%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    marginHorizontal: 8
  },
  btnOutlined: {
    borderColor: GlobalStyle.primaryColorDark.color,
    borderWidth: 1,
    paddingVertical: "4%",
    width: "35%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    marginHorizontal: 8,
    flexDirection: "row"
  },
  tabItem: {
    flex: 0.5
  },
  tabButton: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#AFBECD",
    paddingLeft: 10,
    paddingRight: 10
  }
});

export default styles;
