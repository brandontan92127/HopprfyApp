import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  scrollViewBody: {
    flexDirection: "row"
  },
  btnGroup: {
    backgroundColor: "#3559A2",
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    flexDirection: "row",
    width: "48%",
    height: "95%",
    marginLeft: 10
  },
  description: {
    width: "50%",
    paddingLeft: "2%"
  }
});

export default styles;
