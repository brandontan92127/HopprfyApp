import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: "20%",
    marginTop: "8%",
    padding: "1%",
    minWidth:"90%",
    alignSelf: "center",
  },
  cardHeader: {
    backgroundColor: "#3559A2",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: "3%",
    flexDirection: "row",
  },
  cardBody: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: "#DEE5EE",
   
    maxHeight:260,
  },
  bold: {
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  order: {
    fontWeight: "300",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RedHatDisplay-Regular",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#DEE5EE",
    paddingTop: "2%",
    paddingHorizontal: "3%",
  },
  list: {
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  btnImage: {
    width: 24,
    height: 24,
  },
  tab: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: "1.5%",
    width: "24%",
  },
  text: {
    color: "#3559A2",
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "RedHatDisplay-Regular",
  },
  activeTab: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: "1.5%",
    marginBottom: -0.5,
    width: "24%",
  },
});

export default styles;
