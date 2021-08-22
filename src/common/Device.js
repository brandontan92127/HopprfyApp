/** @format */

import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const myfunction = (fruit) => alert('I like ');

  const getCorrectIphoneXBaseHeaderPadding  = (originalValue) =>  {
  if(isIphoneX)
  {
    return originalValue + 14;
  }
  else{
return originalValue;
  }
};

//**Used on many screens to set base padding thanks to new header!! */
const getCorrectIphoneXViewBasePadding  = (originalValue) =>  {
  if(isIphoneX)
  {
    return originalValue + 24;
  }
  else{
return originalValue;
  }
};

const isIphoneX =
  Platform.OS === "ios" &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (height >= 812 || width >= 812);

export default {
  isIphoneX,
  getCorrectIphoneXBaseHeaderPadding,
  getCorrectIphoneXViewBasePadding,
  ToolbarHeight: isIphoneX ? 35 : 0,
};
