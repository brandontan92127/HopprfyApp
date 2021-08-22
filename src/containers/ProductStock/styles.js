import { StyleSheet, Dimensions, Platform } from "react-native";
import {
  Color,
  Images,
  Languages,
  Config,
  Styles,
  Constants,
  withTheme
} from "@common";

const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  autocompleteSuggestionTopPosition: Platform.OS === "ios" ? 0 : 0,
  autocompleteSuggestionLeftPosition: Platform.OS === "ios" ? 21 : 14,
  listItem: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "95%",
    paddingVertical: 10,
    flexDirection: "row",
    marginTop: "5%"
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginHorizontal: 15
  },
  details: {
    width: "55%"
  },
  card: {
    backgroundColor: "#F1F2F6",
    flexDirection: "row",
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    position: "absolute",
    right: 0,
    alignSelf: "center",
    width: "20%"
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#3559A2",
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    justifyContent: "space-around"
  },
  statusCircle: {
    backgroundColor: "#4BC98C",
    width: 15,
    height: 15,
    borderRadius: 100
  },
  status: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 100,
    width: "50%",
    padding: 10
  },
  controls: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 8,
    marginTop: 10
  },
  productImage: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  quantity: {
    backgroundColor: "rgba(222, 229, 238, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    width: 30,
    height: 30,
    alignSelf: "center"
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },
  storeFrontimageStyle: {
    height: 140,
    minHeight: 140,
    maxHeight: 140,
    flex: 1,
    width: null
  },
  headerContainer: {
    height: "20%",
    marginTop: -(height / 100) * 3.5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  }
});

export default styles;
