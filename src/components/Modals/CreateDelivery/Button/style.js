import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 50,
    borderColor: "#DEE5EE",
    borderWidth: 1,
    width: "46%",
    padding: "3%",
    alignItems: "center",
  },
  image: {
    width: 20,
    height: 20,
    tintColor: "#3559A2",
  },
  text: {
    marginLeft: "8%",
    fontSize: 13,
    fontFamily: "RedHatDisplay-Regular",
  },
});

export default styles;
