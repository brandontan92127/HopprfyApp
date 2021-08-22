//import { Config } from "@common";
import Config from "../common/Config.js";
import { toast } from "@app/Omni";

export default class ProductURLHelper {
  static generateProductURL = url => {

    try {
      let prodBaseUrl = "https://booza.store:44300/";    
      let imageUrl = "";
  
      if (typeof url !== "undefined") {
        if (url.includes("https:") || url.includes("http:")) {
          //see if it's full or relative path
          imageUrl = url;
        } else {
          imageUrl = prodBaseUrl + url;
        }
        return imageUrl;
      }
      throw error("You passed in: " + url);  
    } catch (error) {
      return "";
    }
    
  };
}
