import { StyleSheet, Dimensions } from "react-native";

let bodyHeight = null;
const height = Dimensions.get("window").height;
if (height > 800) {
  bodyHeight = "100%";
} else {
  bodyHeight = "100%";
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
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: "4%",
    justifyContent: "space-around",
    alignItems: "center",
    minWidth: "90%",
  },

//import from TextInput
  textInputcontainer: {
    flexDirection: "row",
    borderRadius: 50,
    borderColor: "#DEE5EE",
    borderWidth: 1,
    width: "46%",
    padding: "3%",
    alignItems: "center",
  },
  textInputImage: {
    width: 20,
    height: 20,
    tintColor: "#3559A2",
  },
  textInputText: {
    marginLeft: "8%",
    fontSize: 13,
    fontFamily: "RedHatDisplay-Regular",
  },
});

export default styles;
