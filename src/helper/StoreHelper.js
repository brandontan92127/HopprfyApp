import store from "@store/configureStore";

export default class StoreHelper {

    static isUserDefined=()=>{      
        
        if(typeof store.user !== "undefined")
        {
          return false;
          
        }        

        return true;
      }
      
      

       static isInRoleDriver=()=>{

       }

       static isInRoleDriver=()=>{
          
       }
}