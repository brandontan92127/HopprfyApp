import { Config, Images } from "@common";
import {Image} from 'react-native'


export default class ImageHelper {

    static cacheImages = (urlArrayToPreload) => {
        let preFetchTasks = [];
        urlArrayToPreload.forEach((url)=>{
           preFetchTasks.push(Image.prefetch(url));
       });
   
       Promise.all(preFetchTasks).then((results)=>{
       try {
         let downloadedAll = true;
         results.forEach((result)=>{
             if(!result){
                 //error occurred downloading a pic
                 downloadedAll = false;
             }
         })
       }catch(e){}
   })
    }    
}