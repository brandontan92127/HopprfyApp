import { StyleSheet, Dimensions } from "react-native";
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle,
} from "@common";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  modal: {
    backgroundColor: "#F8F8F8",
    height: null,
    borderRadius: 20,
    width: Constants.Dimension.ScreenWidth(0.9),
    flexGrow: 1,
  },
  tabButton: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textTab: {
    fontFamily: Constants.fontFamily,
    color: "rgba(183, 196, 203, 1)",
    fontSize: 16,
  },
  tabButtonHead: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    opacity: 0,
  },
  tabItem: {
    flex: 1,
  },
  tabView: {
    minHeight: height / 5,
    marginTop: 3,
  },
  header: {
    backgroundColor: Color.reskin.white,
    justifyContent: "flex-end",
    flexDirection: "row",
    padding: "2%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  btnClose: {
    backgroundColor: Color.reskin.secondary,
    borderRadius: 100,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  imgClose: {
    tintColor: Color.reskin.grey,
    maxHeight: 20,
    height: 20,
    width: undefined,
  },
  scrollViewTop: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: Color.reskin.white,
    paddingBottom: "5%",
  },
  imgProfilePic: {
    width: 220,
    height: 220,
    borderRadius: 220 / 2,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: "2%",
    marginBottom: "5%",
  },
  userName: {
    fontFamily: Constants.fontFamilyBlack,
    fontSize: 20,
    marginBottom: "2%",
  },
  contactNumber: {
    fontFamily: Constants.fontFamilyBlack,
    color: Color.reskin.text,
    fontSize: 18,
  },
  verified: {
    fontFamily: Constants.fontFamily,
    color: Color.reskin.text,
    fontSize: 12,
  },
  imgDriver: {
    width: 25,
    height: 25,
    tintColor: Color.reskin.primary,
  },
  detailsHeader: {
    justifyContent: "center",
    alignItems: "center",
  },
  txtDetails: {
    fontFamily: Constants.fontFamilyBold,
    fontSize: 12,
    height: 12,
  },
  divider: {
    borderColor: Color.reskin.secondary,
    borderWidth: 1,
    minWidth: "100%",
    marginTop: "3%",
  },
  list: {
    width: "85%",
  },
  row: {
    flexDirection: "row",
    paddingTop: "5%",
  },
  txtRightSide: {
    alignSelf: "flex-end",
    fontFamily: Constants.fontFamily,
    textAlign: "right",
    flex: 1,
  },
  txtLeftSide: {
    alignSelf: "flex-end",
    fontFamily: Constants.fontFamily,
    color: Color.reskin.text,
  },
});

export default styles;
