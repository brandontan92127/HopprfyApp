import { StyleSheet, Dimensions } from "react-native";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background
  },

  header: {
    backgroundColor: "#3559A2",
    width: "100%",
    height: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    justifyContent: "space-around"
  },
  findmeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    height: 70,
    padding: "2%"
  },
  findmeImage: {
    alignItems: "center",
    justifyContent: "center"
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%"
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    height: 70,
    padding: "2%",
    width: 80
  },
  storeFrontimageStyle: {
    height: 130,
    minHeight: 130,
    maxHeight: 166,
    flex: 1,
    width: null
  },
  weAreOpenimageStyle: {
    height: 40
    // flex: 1,
    // width: null
  },
  whereIsItImageStyle: {
    height: 30,
    flex: 1,
    width: null
  },
  headline: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "hotpink",
    paddingTop: 2
  },
  orderList: {
    fontWeight: "bold",
    fontSize: 18,
    color: Color.blackTextPrimary
  },

  ////////

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
    width: 80,
    height: 80,
    resizeMode: "contain"
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
    width: "35%",
    padding: 10
  },
  controls: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 8,
    marginTop: 10
  },
  headerItems: {
    flex: 1
  },
  greyFont: {
    fontSize: 12,
    color: "#AFBECD"
  },
  heading: {
    fontFamily: Constants.fontFamilyBold,
    fontSize: 16
  },
  icon: {
    width: 20,
    height: 20
  }
});

export default styles;
