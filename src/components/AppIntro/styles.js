/** @format */


import Constants from '../../common/Constants';
import GlobalStyle from '../../common/GlobalStyle';


export default {
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  mainImage: {
    width: 300,
    height: 300,
    marginBottom: -100,
  },
  image: {
    width: 320,
    height: 320,
  },
  text: {
    color: "rgba(255, 255, 255, 1)",
    fontSize: 18,
    backgroundColor: "transparent",
    textAlign: "left",
    paddingHorizontal: 32,
    fontFamily: Constants.fontFamily
  },
  logo: {
    width: 48,
    height: 48,
    tintColor: '#fff',
    marginLeft: 32,
    marginBottom: 16,
    marginTop: -32,
    opacity: 0.4,
  },
  title: {
    fontSize: 27,
    fontFamily: Constants.fontFamilyBlack,
    color: "white",
    backgroundColor: "transparent",
    textAlign: "left",
    marginBottom: 24,
    paddingHorizontal: 32,

  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    marginRight: 16,
  },

  
};
