import { StyleSheet, Dimensions } from "react-native";

let bodyHeight = null;
const height = Dimensions.get("window").height;
console.log(height);
if (height <= 667) {
  bodyHeight = "90%";
} else if (height > 800) {
  bodyHeight = "75%";
} else {
  bodyHeight = "85%";
}

const styles = StyleSheet.create({
  modalMain: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  header: {
    backgroundColor: "#DEE5EE",
    height: "8%",
    padding: "4%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    // flexDirection: "row",
    justifyContent: "center",
  },
  body: {
    backgroundColor: "#F8F8F9",
    width: "90%",
    height: bodyHeight,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
