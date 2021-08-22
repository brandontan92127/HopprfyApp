import { StyleSheet, Dimensions } from "react-native";

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
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: "row",
  },
  body: {
    backgroundColor: "#F8F8F9",
    width: "90%",
    minHeight: "80%",
    borderRadius: 25,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "85%",
  },
  btn: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  jobList: {
    flex: 1,
    alignItems: "center",
  },
});

export default styles;
