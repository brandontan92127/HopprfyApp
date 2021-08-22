import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    height: "25%",
    minHeight:"0%",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 12,
    marginBottom: "5%",
    marginTop: "-5%",
  },
  map: {
    borderRadius: 25,
    ...StyleSheet.absoluteFillObject,
  },
});

export default styles;
