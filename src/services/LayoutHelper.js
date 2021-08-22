import { Image, Dimensions } from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";

const { width, height } = Dimensions.get("window");
export default class LayoutHelper {

    static getDynamicModalHeight=()=>{

        if(isIphoneX())
        {
                return height - 92;
        }
        return height - 54;
    }

    static getImageDimensions = (uri) => {
        return new Promise((resolve, reject) => {
            Image.getSize(
                uri,
                (width, height) => {
                    resolve({ width: width, height: height });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    static isImagePortraintOrLandscape = async (imageUrl) => {
        return new Promise(async (resolve, reject) => {
            console.log("");
            let imageDimensionsResult = await LayoutHelper.getImageDimensions(imageUrl);
            console.log("");

            let localPortLand = "portrait";           
            if (imageDimensionsResult.width > imageDimensionsResult.height) {
                localPortLand = "landscape";              
            } else if (imageDimensionsResult.width == imageDimensionsResult.height) {
                localPortLand = "square";               
            } else {
                localPortLand = "portrait";               
            }

            resolve(localPortLand);
        });

        reject();
    }


    static isPortraitOrLandscape(height, width) {
        if (width > height) {
            return "LANDSCAPE"
        }
        return "PORTRAIT"
    }

    static isTabletOrPhone(pixelDensity, height, width) {
        if (pixelDensity <= 2) {
            return "TABLET";
        }
        else {
            return "PHONE";
        }
    }
}