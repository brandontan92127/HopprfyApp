import PlatformApiClient from "./PlatformApiClient";
import { QueryBuilder } from "odata-query-builder";
import { TimeBetweenPointsRequest } from "../apiModels/Order/TimeToDeliveryRequest";
import { Config } from "@common";
import { toast } from "@app/Omni";
import store from "@store/configureStore";

export default class HopprWorker {
  _api = null;
  
  static username = "";
  static password = "";
  static token = null;
  static initalised = false;
  static initalisedWithCreds = false;

  //not using this - clean up
  static init = ({
    username: username = null,
    password: password = null,
    token = null,
  }) => {
    try {    
      if (username !== null && password != null && token != null) {
        HopprWorker.username = username;
        HopprWorker.password = password;
        HopprWorker.token = token;
        //sets up api client for token based auth if token is provided
        this._api = new PlatformApiClient(token);
        HopprWorker.initalisedWithCreds = true;
      } else {
        this._api = new PlatformApiClient(null);
        HopprWorker.initalised = true;
      }

      console.debug("api was created");
    } catch (error) {
      console.debug(error);
    }
  };

  static getDestinationPickedLatLngIfExistFromStore=()=>{
    let existingStore = store.getState();
    let pickedDestination  = existingStore.location.mostRecentOrderDestinationLatLng;
   
   let returnLatLng = { lat: null, lng: null};
    if(typeof pickedDestination !== "undefined")
    {
      returnLatLng.lat = pickedDestination.lat;
      returnLatLng.lng = pickedDestination.lng;
    }   
    return returnLatLng;
  }

  static getDestinationPickedLatLngIfExistFromStoreOrNULL=()=>{
    let existingStore = store.getState();
    let pickedDestination  = existingStore.location.mostRecentOrderDestinationLatLng;
   
   let returnLatLng = { lat: null, lng: null};
    if(typeof pickedDestination === "undefined"
    || typeof pickedDestination.lat === "undefined"
    || typeof pickedDestination.lat === "undefined"
    )
    {
      return null;
    }   
    else{
      returnLatLng.lat = pickedDestination.lat;
      returnLatLng.lng = pickedDestination.lng;
      return returnLatLng;      
    }    
  }

  static isLoggedIn = () => {
    return this._api.isLoggedIn;
  };

  static checkClientIsInitalised = () => {
    if (typeof HopprWorker.initalised === "undefined") return false;
    let isInit = HopprWorker.initalised;
    if (isInit) return isInit;

    return Error("API Client is not initialised in Hoppr Worker");
  };

  static checkClientIsInitalisedWithCreds = () => {
    try {
      if (typeof HopprWorker.initalisedWithCreds === "undefined") {
        return false;
      } else {
        return HopprWorker.initalisedWithCreds;
      }
    } catch (error) {
      return Error("API Client is not initialised with creds in Hoppr Worker");
    }
  };

  static getUserTokenFromApi = async (username, password) => {
    try {
      let tokenResponse = await this._api.getUserTokenFromApi(
        username,
        password
      );
      console.debug("Got responses");
      return tokenResponse;
    } catch (error) {
      console.debug("Got responses");
      return error.response;
    }
  };

  static getCurrentToken = () => {
    return this._api.userAccessToken;
  };

  static login = async () => {
    try {
      console.debug("About to try worker API setup");
      let loginResult = await this._api.loginToApi(
        HopprWorker.username,
        HopprWorker.password
      );
      console.debug("Worker login complete");
      return loginResult;
    } catch (error) {
      console.debug(err);
    }
  };

  static createNewUser=async(userRegistrationModal)=>{
    try {
      let urlToPost = "accounts/register"
      return await this._api.post(urlToPost,userRegistrationModal);
    } catch (error) {
      return error.response;
    }      
  }

  //MISSED ORDER - GET MODAL DATA
  static getLastLogisticsOrderRequest = async (driverId) => {
    try {
      let urlToGet =
        "orderprocess/driver/supplylastlogisticsorderrequest?driverid=" +
        driverId;

      console.debug("About to get ");
      let logModalData = await this._api.get(urlToGet);
      console.debug("Hoppr worker got");
      return logModalData;
    } catch (error) {
      console.debug("Hoppr get" + error);
    }
  };

  static getNetworkRegions = async () => {
    try {
      console.debug("About to get network regions");
      let netRespnse = await this._api.get("networks/getregions");
      console.debug("Hoppr worker got network regions");
      return netRespnse.data;
    } catch (error) {
      console.debug("Hoppr get network regions" + error);
    }
  };

  ///NETWORK CALLS
  //**Gets full network details  */
  static getActiveNetworkImages = async (typeYoureQuerying) => {
    console.debug("Hoppr Worker attempting to get network: " + typeYoureQuerying);

    let imageNetUrl = `networkuserpermissions/getmyactivenetworkimages?type=${typeYoureQuerying}`;
    try {
      console.debug("About to get network");
      let netRespnse = await this._api.get(imageNetUrl);
      console.debug("Hoppr worker got network");

      return netRespnse.data;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };

  static getNetwork = async (getnetsId) => {
    console.debug("Hoppr Worker attempting to get network: " + getnetsId);
    // let netUrl = "networks(" + networkId + ")";
    // "networks(18664283-6230-E911-80F2-00155D00465E)"
    try {
      console.debug("About to get network");
      let netRespnse = await this._api.get("networks(" + getnetsId + ")");
      console.debug("Hoppr worker got network");

      return netRespnse.data;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };


  //**Gets mutiple network details  */
  static getNetworks = async (networksArray) => {
    console.debug("Hoppr Worker attempting to get network: " + networksArray);

    let networkIdsQueryString = "";
    networksArray.map((x) => {
      networkIdsQueryString += "%27" + x + "%27,";
    });

    //remove the last comma
    var cleanedUpQuery = networkIdsQueryString.substring(
      0,
      networkIdsQueryString.length - 1
    );

    let fullQUery =
      "/networks?$filter=networkId%20in%20(" + cleanedUpQuery + ")";
    try {
      console.debug("About to get network");
      let netsRespnse = await this._api.get(fullQUery);
      console.debug("Hoppr worker got network");

      return netsRespnse;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };

  //NEAREST STORES SEARCH
  static getNearestStoresOnAllNetworks = async (lat, lng, distKm) => {
    console.debug("Hoppr Worker attempting to get nearest stores");
    // let netUrl = "networks(" + networkId + ")";
    // "networks(18664283-6230-E911-80F2-00155D00465E)"
    try {
      let netSearchStoreReq = {
        lat: lat,
        long: lng,
        distance: distKm,
        unit: "K",
      };

      console.debug("Hoppr worker got nearest stores");
      const response = await this._api.post(
        "networks/GetNearbyNetworksAndStores",
        netSearchStoreReq
      );

      console.debug("Hoppr worker got nearest stores");

      return response.data;
    } catch (err) {
      console.debug("Hoppr get nearest stores" + err);
    }
  };

  //NETWORK AUTOCOMPLETE SEARCH
  static getNetworkAutocomplete = async (searchPhrase) => {
    console.debug("Hoppr worker got net autocomplete");
    const response = await this._api.get(
      "networks/searchallforautocomplete?networkSearchString=" + searchPhrase
    );

    console.debug("Hoppr worker got network autocomplete");
    return response.data;
  };

  static getProductBarcode = async (barcode) => {
    const response = await this._api.get(`products/getbarcodedproduct?barcode=${barcode}`);      
    return response;
  }

  /** THis is the first method you call in the process */
  static addProductViaBarcode = async (barcode, storeId) => {
    const response = await this._api.get(`productstocks/enablebybarcode?barcode=${barcode}&storeId=${storeId}`);      
    return response;
  }

  /* To add a new size of an existing product*/
  static addProductVariantViaBarcode = async (storeId, barcode, size, unit, basePrice) => {
    const response = await this._api.get(`products/addnewsizebybarcode?barcode=${barcode}&storeId=${storeId}&sizeMeasurement=${size}&sizeUnit=${unit}&basePrice=${basePrice}`);      
    return response;
  }

  /**this turns on permissions only for existing prod */
  static addExistingProductVariantViaBarcode = async (storeId, barcode, size, unit) => {
   // alert("in correct method");
    let sendURl = `products/addexistingbarcodeandsize?barcode=${barcode}&storeId=${storeId}&sizeMeasurement=${size}&sizeUnit=${unit}`
   // alert(sendURl);
    const response = await this._api.get(sendURl);      
    return response;
  }


  //PRODUCT AUTOCOMPLETE SEARCH
  static getProductAutocomplete = async (searchPhrase) => {
    console.debug("Hoppr worker got nearest stores");
    let isThereLatLng = this.getDestinationPickedLatLngIfExistFromStore();
    console.debug("Hoppr worker got product autocomplete");
    const response = await this._api.get(
      `products/searchallforautocomplete?productSearchString=${searchPhrase}&lat=${isThereLatLng.lat}&lng=${isThereLatLng.lng}`
    );

    console.debug("Hoppr worker got product autocomplete");

    return response.data;
  };

  static searchNetworksByName = async (searchTerm) => {
    console.debug("let's try");
    const response = await this._api.get(
      "networks/searchallnetworksbyname?networkSearchString=" + searchTerm
    );

    console.debug("Hoppr worker got networks search");
    return response.data;
  };

  //Searches all networks for first x matching products by name
  static searchNetworkForProductByName = async (searchPhrase) => {
    console.debug("Hoppr worker got nearest stores");
    let isThereLatLng = this.getDestinationPickedLatLngIfExistFromStore();
    const response = await this._api.get(
      `products/searchallnetworksbyname?productSearchString=${searchPhrase}&lat=${isThereLatLng.lat}&lng=${isThereLatLng.lng}` 
    );
    
    console.debug("Hoppr worker got product search");
    return response.data;
  };

  static getCategoryNamesAndIds = async () => {
    console.debug("Hoppr Worker attempting to get CATS NAMES FROM SERVER");

    try {
      const response = await this._api.get("2yu/categoryNamesAndIds");
      console.debug(
        "Hoppr worker got CATS NAMES FROM SERVER" +
        JSON.stringify(response.data)
      );

      return response.data;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };

  /**Creates new prouduct class */
  static createProductClass = async (prClassPayload) => {
    console.debug("attempting to creat product class");
    let prClassquery = "productClasses/create";
    try {
      console.debug("attempting to creat product class");
      const prCreateRes = await this._api.post(prClassquery, prClassPayload);
      console.debug("created product class");
      return prCreateRes.data;
    } catch (error) {
      console.debug("Hoppr create categories failed" + error);
    }
  };

  /**Creates new product */
  static createProduct = async (prPayload) => {
    console.debug("attempting to creat product ");
    let prQuery = "products/create";
    try {
      console.debug("attempting to create product");
      const prRes = await this._api.post(prQuery, prPayload);
      console.debug("created product ");
      return prRes.data;
    } catch (error) {
      console.debug("Hoppr create categories failed" + error);
    }
  };

  static editProduct = async (prPayload) => {
    console.debug("attempting to creat product ");
    let prQuery = "products/edit";
    try {
      console.debug("attempting to edit product");
      const prRes = await this._api.post(prQuery, prPayload);
      console.debug("edited product ");
      return prRes.data;
    } catch (error) {
      console.debug("Hoppr edit product failed" + error);
    }
  };

  //gets all cats on a network!! With prods
  static getCategories = async (networkId) => {
    console.debug(
      "Hoppr Worker attempting to get product classes / categories"
    );
    let query = `productclasses?$filter=active eq true&$expand=products($filter=active eq true),ProductClassClientConfigs$filter=isDeleted eq false&networkId eq ${networkID}`;
    try {
      const response = await this._api.get(query);
      console.debug(
        "Hoppr worker got product classes" + JSON.stringify(response.data.value)
      );

      return response.data.value;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };

  /**Returns one network */
  static getCategory = async (classId) => {
    console.debug(
      "Hoppr Worker attempting to get product classes / categories"
    );
    let query = `productclasses?$filter=_id eq '${classId}' and active eq true&$expand=products($filter=active eq true),ProductClassClientConfigs`;
    try {
      const response = await this._api.get(query);
      console.debug(
        "Hoppr worker got product classes" + JSON.stringify(response.data.value)
      );

      return response.data.value;
    } catch (err) {
      console.debug("Hoppr get categories failed" + err);
    }
  };

  //gets all cats on a network!! For adding new cats / prods
  static getCategoriesJustIdAndName = async (netIdCatsName) => {
    console.debug(
      "Hoppr Worker attempting to get product classes / categories"
    );
    let query = `productclasses?$expand=ProductClassClientConfigs&$select=_id,name,active,image,sorting&$filter=networkId eq ${netIdCatsName}`;
    try {
      console.debug("");
      const response = await this._api.get(query);
      console.debug(
        "Hoppr worker got product classes" + JSON.stringify(response.data.value)
      );

      return response.data.value;
    } catch (err) {
      console.debug("Hoppr get classes failed" + err);
    }
  };

  /*required logged in user*/
  static isUserOldEnoughToBuy = async (netID) =>{
    let fullUrl = `accounts/isuseroldenoughtobuy?networkId=${netID}`;
    console.debug("generated query");
    try {
      console.debug('stop');
      let respomnse = await this._api.get(fullUrl);
      console.debug('stop');
      return respomnse;
    }
    catch(error)
    {
      console.debug('stop');
      return error;
    }
  }

  static getNetworkAgeRestriction = async (netID) =>{
    let fullUrl = `networks/agerestricted?networkId=${netID}`;
    console.debug("generated query");
    try {
      let respomnse = this._api.get(fullUrl);
      return respomnse;
    }
    catch(error)
    {
      return error;
    }
  }

 //gets all cats on a network INCLUDING products
 static getCategoriesAndNestedProductsInStock = async (netID, lat, lng) => {
  console.debug(
    "Hoppr Worker attempting to get product classes and nested products"
  );  
 
  let fullURl = `productclasses/instocknow?networkId=${netID}&lat=${lat}&lng=${lng}`;
  try {
     return await this._api.get(fullURl);  
 
  } catch (err) {
    console.log("Hoppr get categories failed" + err);
    return err;
  }
};



  //gets all cats on a network INCLUDING products
  static getCategoriesAndNestedProducts = async (netID) => {
    console.debug(
      "Hoppr Worker attempting to get product classes and nested products"
    );

    let query = `$filter=networkId eq ${netID} and active eq true&$expand=products($filter=active eq true),ProductClassClientConfigs`;
    let fullUrl = "productclasses?" + query;
    console.debug("generated query");
    try {
       return await this._api.get(fullUrl);
      // console.debug(
      //   "Hoppr worker got product classes" + JSON.stringify(response.data.value)
      // );

      // return response.data.value;
    } catch (err) {
      console.log("Hoppr get categories failed" + err);
      return err;
    }
  };

  static getCustomerByToken = async () => {
    console.debug("Hoppr Worker attempting to get customers");
    try {
      const response = await this._api.get("customers/getviatoken");
      console.debug("Hoppr worker got customers by token" + response);
      return response;
    } catch (err) {
      console.debug(err);
    }
  };

  static getUserInfo = async () => {
    console.debug("Hoppr Worker attempting to get user info");
    try {
      const response = await this._api.get("accounts/getviatoken");
      console.debug("Hoppr worker got user info" + response);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  // static getCustomerById = async id => {
  //   try {
  //     const response = await this._api.get("customers/getbytoken");
  //     console.debug("Hoppr worker got customers by token" + response.data.data);
  //     return response;
  //   } catch (err) {
  //     console.debug(err);
  //   }
  // };

  static getActiveNearbyStores = async ()=>{
    let isThereLatLng = this.getDestinationPickedLatLngIfExistFromStore();
    const fullQuery = `stores/getactiveallnetworks?lat=${isThereLatLng.lat}&long=${isThereLatLng.lng}&distance=500&unit=k`

    try {
      const response = await this._api.get(fullQuery);
      console.debug("what we got");
      return response;
    } catch (err) {
      console.debug("Hoppr worker get nearby stores" + err);
      return err.response;
    }
  }

  static productsByClassIdInStockAndLive= async (classId, lat = null, lng = null)=>{
    let isThereLatLng = this.getDestinationPickedLatLngIfExistFromStore();
    const fullQuery = `products/getactiveproductsbyclass?productClassId=${classId}&lat=${isThereLatLng.lat}&lng=${isThereLatLng.lng}`

    try {
      const response = await this._api.get(fullQuery);
      console.debug("what we got");
      return response;
    } catch (err) {
      console.debug("Hoppr worker get products by class id FAILED" + err);
      return err.response;
    }
  }

  static productsByClassId = async (classId, per_page = 100, page = 1) => {
    //build query
    let toskip = (page - 1) * per_page;

    let query = new QueryBuilder()
      .count()
      .top(per_page)
      .skip(toskip)
      .filter((f) => f.filterExpression("classId", "eq", classId))
      .filter((f1=>f1.filterExpression("active", "eq", true)))
      .toQuery();

    const fullQuery = "products?" + query;

    try {
      const response = await this._api.get(fullQuery);
      return response;
    } catch (err) {
      console.debug("Hoppr worker get products by class id FAILED" + err);
      return err.response;
    }
  };

  static productsByClassIdJustNameAndId = async (
    classId,
    per_page = 100,
    page = 1
  ) => {
    //build query
    let toskip = (page - 1) * per_page;

    let query = new QueryBuilder()
      .count()
      .top(per_page)
      .skip(toskip)
      .filter((f) => f.filterExpression("classId", "eq", classId))
      .toQuery();

    const fullQuery = "products" + query; //+ "&$select=name,active,_id,classId,price,images";

    try {
      const response = await this._api.get(fullQuery);
      console.debug(
        "Hoppr worker got products by class id" +
        JSON.stringify(response.data.value)
      );
      return response.data.value;
    } catch (err) {
      console.debug("Hoppr worker get products by class id FAILED" + err);
    }
  };

  static productsByCategoryTag = async (
    classId,
    lat,
    lng    
  ) => {
    console.debug(
      "We are supposed to be getting by category tag, but this is currently unsupported!!"
    );
    return HopprWorker.productsByClassIdInStockAndLive(classId, lat, lng);
    // try {
    //   // only show product published
    //   let params = { per_page, page, purchasable: true, status: "publish" };
    //   if (category != "") {
    //     params = { ...params, category };
    //   } else {
    //     params = { ...params, tag };
    //   }
    //   const response = await this._api.get("products", params);
    //   return response.json();
    // } catch (err) {
    //   console.debug(err);
    // }
  };

  static reviewsByProductId = async (id) => {
    throw Error("Not implemented - Nadav");
    // try {
    //   const response = await this._api.get(`products/${id}/reviews`);
    //   return response.json();
    // } catch (err) {
    //   console.debug(err);
    // }
  };

  static productsByTagId = async (tagId, per_page, page) => {
    throw Error("Not implemented");
    // try {
    //   const response = await this._api.get("products", {
    //     tag: tagId,
    //     per_page,
    //     page
    //   });
    //   return response.json();
    // } catch (err) {
    //   console.debug(err);
    // }
  };

  //todo: this needs to be filtered to one network
  static productsByName = async (name, per_page = 100, page = 1) => {
    let toskip = (page - 1) * per_page;

    let query = new QueryBuilder()
      .filter((f) => f.filterPhrase(`contains(name,'${name}')`))
      .top(per_page)
      .skip(toskip)
      .toQuery();

    try {
      const response = await this._api.get("products" + query);
      console.debug(
        "Hoppr worker got products by name" + JSON.stringify(response)
      );
      console.debug(
        "Hoppr worker got products by name data" + JSON.stringify(response.data)
      );
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  //this is for the banner products?
  static productSticky = async (per_page = 20, page = 1, tagIdBanner = 273) => {
    try {
      return await this.getAllProducts();
      // const response = await this._api.get("products", {
      //   tag: tagIdBanner,
      //   per_page,
      //   page
      // });
      //return response.json();
    } catch (err) {
      console.debug(err);
    }
  };

  static getAllProducts = async (
    per_page = 200,
    page = 1,
    order = "desc",
    orderby = "date"
  ) => {
    let toskip = (page - 1) * per_page;
    let query = new QueryBuilder()
      //filter(f => f.filterPhrase(`contains(name,'${name}')`))
      .top(per_page)
      .orderBy("name desc")
      .skip(toskip)
      .toQuery();

    try {
      const response = await this._api.get("products" + query);
      console.debug("Hoppr worker got all products" + JSON.stringify(response));
      console.debug(
        "Hoppr worker got all products" + JSON.stringify(response.data.value)
      );
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  //get all orders for a customer
  static ordersByCustomerId = async (id, per_page, page) => {
    try {
      let toskip = (page - 1) * per_page;

      let query =
        "orders?$orderby=CreationDate desc&$expand=customer,location($filter=_id eq '" +
        id +
        "'),driver,store,items($expand=product)";

      console.debug("genterated query");
      const response = await this._api.get(
        query //+ "&$expand=driver,customer,items($expand=product)"
      );
      console.debug("Got orders by customerId");
      return response.data.value;
    } catch (err) {
      console.debug("Get orders by customer Id failed");
      console.debug(err);
    }
  };

  //get orders Itinerary for network / store
  static getOrderItineraryByStoreAndNetwork = async (storeId, networkId) => {
    try {
      let itenUri =
        "/orderdeliveryitinerary/getbystore?networkId=" +
        networkId +
        "&storeId=" +
        storeId;
      const response = await this._api.get(itenUri);
      return response.data;
    } catch (error) {
      console.debug(err);
    }
  };

  static getOrderItineraryByNetwork = async (networkId) => {
    try {
      let itenUri =
        "/orderdeliveryitinerary/getbynetwork?networkId=" + networkId;
      const response = await this._api.get(itenUri);
      return response.data;
    } catch (error) {
      console.debug(err);
    }
  };

  //get orders for a store using token
  //this is NOT odata endpoints
  static ordersByStoreAccountId = async (id, per_page, page) => {
    try {
      let toskip = (page - 1) * per_page;
      // let query = new QueryBuilder()
      //   .top(per_page)
      //   //.filter(f => f.filterExpression("storeId", "eq", id))
      //   .orderBy("creationDate desc")
      //   .skip(toskip)
      //   .toQuery();

      const response = await this._api.get(
        "orders/getbystore"
        // + query +
        //   "&$expand=driver,customer,items($expand=product)"
      );
      console.debug("Got orders by storeId");
      return response;
    } catch (err) {
      console.debug("Get orders by store Id failed");
      console.debug(err);
      return err;
    }
  };

  static completeProductCreationRequest =(_id, storeId, sizeMeasurement, sizeUnit, price)=>{
    let compelteUri = `products/completecreationrequests?_id=${_id}&storeId=${storeId}&sizeMeasurement=${sizeMeasurement}&sizeUnit=${sizeUnit}&basePrice=${price}`
   // alert("Url:" + compelteUri);
    return this._api.get(compelteUri);  
  }

  static getProductCreationRequests =()=>{
      let geReqUri = `products/getcreationrequests`
      return this._api.get(geReqUri);    
  }

  //create the order in the view - store the data here!
  //this returns the entire response
  static createNewOrder = async (orderPayload) => {
    try {
      console.debug("About to try create order");
      const response = await this._api.post(
        "orderprocess/placeorder",
        orderPayload
      );
      return response;
    } catch (err) {
      console.debug(err);
      throw err;
    }
  };

  static createNewCustomerCourierOrder = async (orderPayload) => {
    try {
      console.debug("About to try create order");
      const response = await this._api.post(
        "orderprocess/placecustomercourierorder",
        orderPayload
      );
      return response;
    } catch (err) {
      console.debug(err);
      throw err;
    }
  };

  //////////////////////
  ///ORDER LOGISTICS CREATE METHODS
  //////////////////////
  /**Creates a new logistics order */
  static CreateNewUnpaidLogisticsOrderNewDriver = async (orderPayload) => {
    try {
      console.debug("About to try create order");
      const response = await this._api.post(
        "orderprocess/placeunpaidlogisticsordernewdriver",
        orderPayload
      );

      console.debug("got reponse");
      return response;
    } catch (err) {
      return err;
    }
  };

  static CreateNewUnpaidLogisticsOrderAttachExisting = async (orderPayload) => {
    try {
      console.debug("About to try create order");
      const response = await this._api.post(
        "orderprocess/placeunpaidlogisticsorderattachexisting",
        orderPayload
      );
      return response;
    } catch (err) {
      console.debug(err);
    }
  };

  static driverAcceptNewOrderLogisticsRequest = async (
    orderRequestId,
    driverId
  ) => {
    console.debug("This should fire to api success");
    try {
      let orderPayload = {
        orderRequestId,
        driverId,
      };
      console.debug("About to try accept logistic order");
      const response = await this._api.post(
        "orderlogistics/driveracceptsnewunpaidorder",
        orderPayload
      );
      return response;
    } catch (err) {
      console.debug(err);
      return err;
    }
  };

  static driverRejectNewOrderLogisticsRequest = async (
    orderRequestId,
    driverId
  ) => {
    console.debug("This should fire to api fail");
    try {
      let orderPayload = {
        orderRequestId,
        driverId,
      };
      console.debug("About to try accept logistic order");
      const response = await this._api.post(
        "orderlogistics/driverrejectsnewunpaidorder",
        orderPayload
      );
      return response;
    } catch (err) {
      console.debug(err);
    }
  };

  //we don't allow customers to directly set the status -
  static setOrderStatus = async (orderId, status, callback) => {
    throw Error("Not implemented");
    // try {
    //   const response = await this._api.post(`orders/${orderId}`, { status });
    //   const json = await response.json();
    //   if (json.code === undefined) {
    //     callback(JSON.stringify(json.code));
    //   } else {
    //     console.debug(json);
    //   }
    // } catch (error) {
    //   console.debug(error);
    // }
  };

  static productVariant = async (product, per_page, page) => {
    throw Error("Not implemented");
    //no variants implemented currently
    // try {
    //   const data = {
    //     per_page,
    //     page
    //   };
    //   const response = await this._api.get(
    //     `products/${product.id}/variations`,
    //     data
    //   );
    //   return response.json();
    // } catch (err) {
    //   console.debug(err);
    // }
  };

  //er.. just get products in the same category for now?
  static getProductRelated = async (product, lat, lng) => {
    try {
      let prods = await productsByClassIdInStockAndLive(product.classId, lat, lng);
      return prods;
    } catch (err) {
      console.debug(err);
    }
  };

  //we don't use this
  static getAllCouponCode = async () => {
    try {
      const response = await this._api.get("coupons");
      return response.json();
    } catch (err) {
      console.debug(err);
    }
  };

  //this is delivery
  // static getShippingMethod = async (zoneId) => {
  //   zoneId = zoneId || 1;
  //   try {
  //     const response = await this._api.get(
  //       "shipping/zones/" + zoneId + "/methods"
  //     );
  //     return response.json();
  //   } catch (err) {
  //     console.debug(err);
  //   }
  // };

  //this gets indiviudal product
  static getProductId = async (productId) => {
    try {
      let query = new QueryBuilder()
        .filter((f) => f.filterExpression("_id", "eq", productId))
        .toQuery();

      const response = await this._api.get("products/" + query);
      console.debug("Got single product: " + response.data.value);
      return await response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  //some kind of ID on the order? Booking ID
  static setBookingID = (orderId, bookID, callback) => {
    try {
      this._api
        .post("orders/" + orderId, { "Booking ID": bookID })
        .then((json) => {
          if (json.code === undefined) callback(json);
          else {
            alert(JSON.stringify(json.code));
            // console.debug(JSON.stringify(json))
          }
        })
        .catch((error) => console.debug(error));
    } catch (err) {
      console.debug(err);
    }
  };

  //this is product tags
  static getTags = async () => {
    try {
      const response = await this._api.get("products/tags", {
        hide_empty: true,
        per_page: 100,
        order: "desc",
        orderby: "count",
      });
      return response.json();
    } catch (err) {
      console.debug(err);
    }
  };

  ///GEOLOCATION METHODS
  //ORDER TRACKING METHODS // default KM
  static getTimeBetweenLocations = async (currentLocation, newLocation) => {
    let requestModel = new TimeBetweenPointsRequest(
      currentLocation,
      newLocation
    );

    let requestJSon = JSON.stringify(requestModel);
    try {
      const response = await this._api.post(
        "geocoding/gettimebetweenlocations",
        requestJSon
      );
      console.debug("got getTimeBetweenLocations:" + response.data);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////////////////
  //LOCATION TRACKING METHODS
  //////////////////////////////
  //gets full info about an order includign locaiton, store data etc
  //used usually as a one shot to inialise map
  static getActiveCustomerOrders = async (customerId) => {
    console.debug(
      "about to try and get active customer order for customerId:" + customerId
    );
    let request = { id: customerId };
    try {
      const response = await this._api.post(
        "orders/getactivecustomerorder",
        request
      );
      console.debug("we're got active customer order:" + response.data);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Gets delivery destinations and orders */
  static getActiveDriverOrderDestinations = async (driverId) => {
    console.debug(
      "about to try and get active destinations for driverId:" + driverId
    );

    try {
      const response = await this._api.get(
        "orderdeliveryitinerary/getactivedestinationsfordrivershaped?driverId=" +
        driverId
      );
      console.debug("we've got active driver destinations:" + response.data);
      return response;
    } catch (err) {
      toast("ERROR: we FAILED to get driver destinations: " + error);
      console.debug(err);
    }
  };

  /**@deprecated  */
  static getActiveDriverOrder = async (driverId) => {
    console.debug(
      "about to try and get active customer order for driverId:" + driverId
    );
    let request = { id: driverId };
    try {
      const response = await this._api.post(
        "orders/getactivedriverorder",
        request
      );
      console.debug("we're got active driver order:" + response.data);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  static getOrderInfo = async (orderGuid) => {
    let orderRequest = {
      orderGuid: orderGuid,
    };

    try {
      const response = await this._api.post(
        "orders/getorderinfo",
        JSON.stringify(orderRequest)
      );
      console.debug("got order info:" + response.data);
      return response;
    } catch (err) {
      console.debug(err);
    }
  };

  //used to poll just the driver location for dynamic updates
  static getDriverLocationOnly = (driverId) => { };

  //used to poll just the driver location for dynamic updates
  static getStoreLocationOnly = async (storeId) => {
    try {
      let getStoreLocationUrl = "locations/stores/" + storeId;
      const response = await this._api.get(getStoreLocationUrl);
      console.debug("We got store location: " + response.data);
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  static getOrderLocationOnly(orderId) { }

  //LOCATION UPDATE TO API
  //update location on API - e.g. for current driver/order location
  static updateLocationOnApi = async (urlToPostTo, payload) => {
    try {
      return await this._api.post(urlToPostTo, payload);
      console.debug("we're updating location on API to:" + urlToPostTo);
      // toast("updated location on api:" + payload);
    } catch (err) {
      console.debug(err);
      return err.response;
    }
  };

  static reverseGeocode = async (lat, long) => {
    var locationRequest = {
      long: long,
      lat: lat,
    };

    const response = await this._api.post(
      "geocoding/reversegeocode",
      JSON.stringify(locationRequest)
    );
    console.debug("Reverse geocoded:");
    // toast("Reverse geocoded:" + response);
    return response.data;
  };

  //////////////////////////////
  //DELIVERY METHODS- Get delivery types etc
  //////////////////////////////
  /**Gets delivery options based on basket / server */
  static getAvailableDeliveryOptions = async (payloadString) => {
    try {

      let deliveryOptsUrl = "deliveryoptions/getavailable" + payloadString;
      console.log("got it");
      //let deliveryOptsUrl = "deliveryoptions/getavailable?networkId=963E5978-6B88-EA11-811A-00155D5EB736&itemsRequested[0].productId=0318eaad-0bf7-45f5-9b06-2bae9e9c549c&itemsRequested[0].amount=2&packageSizeType=small&deliveryAddressText.streetAddress=22 Horton Avenue&deliveryAddressText.city=London&deliveryAddressText.postcode=NW2 2SA";
      const deliveryOptsResponse = await this._api.get(deliveryOptsUrl);
      console.log("got it");
      return deliveryOptsResponse;
    } catch (err) {
      console.debug(err);
      return err.response;
    }
  };

  static getAvailableDeliveryOptionsExternal = async (payloadString) => {
    try {

      let deliveryOptsUrl = "deliveryoptions/getavailableexternal" + payloadString;
      console.log("got it");
      //let deliveryOptsUrl = "deliveryoptions/getavailable?networkId=963E5978-6B88-EA11-811A-00155D5EB736&itemsRequested[0].productId=0318eaad-0bf7-45f5-9b06-2bae9e9c549c&itemsRequested[0].amount=2&packageSizeType=small&deliveryAddressText.streetAddress=22 Horton Avenue&deliveryAddressText.city=London&deliveryAddressText.postcode=NW2 2SA";
      const deliveryOptsResponse = await this._api.get(deliveryOptsUrl);
      console.log("got it");
      return deliveryOptsResponse;
    } catch (err) {
      console.debug(err);
      return err.response;
    }
  };


  //////////////////////////////
  //MODE CONTROLS - switch between the driver, customer, store modes when you change screens
  //////////////////////////////
  static toCustomerMode = async () => {
    try {
      const response = await this._api.get("usermode/intocustomermode");
      console.debug("we're in customer mode");
      toast("App in customer mode");
    } catch (err) {
      console.debug(err);
    }
  };
  static toDriverMode = async () => {
    try {
      const response = await this._api.get("usermode/intodrivermode");
      console.debug("we're in driver mode");
      toast("App in driver mode");
    } catch (err) {
      console.debug(err);
    }
  };
  static toStoreMode = async () => {
    try {
      const response = await this._api.get("usermode/intostoremode");
      console.debug("we're in store mode");
      toast("App in store mode");
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////////////////
  //FULL OBJECT CALLS - get full info for drivers, customer, stores or orders
  //////////////////////////////
  static getStore = async (storeId) => {
    let suffix = `?&$expand=location,storeCalendars&$filter=_id eq '${storeId}'`;
    try {
      const response = await this._api.get("stores" + suffix);
      console.debug("We got full store: " + response.data);
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  static getStoreActiveState = async (storeId) => {
    let suffix = `?&$select=_id,active&$filter=_id eq '${storeId}'`;
    try {
      const response = await this._api.get("stores" + suffix);
      console.debug("We got full store active: " + response.data);
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  static getDriver = async (driverId) => {
    let suffix = `?&$expand=location&$filter=_id eq '${driverId}'`;
    try {
      const response = await this._api.get("drivers" + suffix);
      console.debug("We got full driver: " + response.data);
      return response;
    } catch (err) {
      console.debug(err);
    }
  };

  static getCustomer = async (customerId) => {
    let suffix = `?&$expand=location&$filter=_id eq '${customerId}'`;
    try {
      const response = await this._api.get("customers" + suffix);
      console.debug("We got full customer: " + response.data);
      return response.data.value;
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////////////////
  //USER SETTINGS CALLS
  //////////////////////////////
  //get settings based on token
  static getUserSetttings = async () => {
    try {
      const response = await this._api.get("usersettings");
      console.debug("We got user settings: " + response.data);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };
  //////////////////////////////
  //DRIVER CALLS
  //////////////////////////////
  static getDriverStatus = async (driverId) => {
    try {
      const response = await this._api.get("drivers/getstatus/" + driverId);
      console.debug("We got driver status: " + response.data);
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  static sendDriverKeepAlivePing = async () => {
    try {
      const response = await this._api.post("/keepalive/stayalive");
      console.debug("We sent keep alive");
    } catch (err) {
      console.debug(err);
    }
  };

  static turnDriverOn = async (driverId) => {
    let request = {
      driverId: driverId,
    };

    try {
      await this._api.post("drivers/state/setasonline", request);
      console.debug("We turned on driver");
    } catch (err) {
      console.debug(err);
    }
  };

  static turnDriverOff = async (driverId) => {
    let request = {
      driverId: driverId,
    };

    try {
      await this._api.post("drivers/state/setasoffline", request);
      console.debug("We turned off driver");
    } catch (err) {
      console.debug(err);
    }
  };

  static workoutAndSetDriverOnlineIfNoOrderActive = async (driverId) => {
    let request = {
      driverId: driverId,
    };

    try {
      await this._api.post(
        "drivers/state/workoutandsetonlineifnoorderactive",
        request
      );
      console.debug("We turned off driver");
    } catch (err) {
      console.debug(err);
    }
  };

  ///ORDER RELATE METHODS
  //driver accepts order
  static customerConfirmsDeliveryPayDriver = async (orderId) => {
    let request = {
      orderId: orderId, //check exists!
    };

    try {
      return await this._api.post("orders/delivered/customerconfirm", request);
      console.debug("We confriemd oerder devliery");
    } catch (err) {
      console.debug(err);
      throw err;
    }
  };

  static driverAcceptOrderRequest = async (orderRequestId, driverId) => {
    let request = {
      orderRequestId: orderRequestId, //check exists!
      driverId: driverId,
    };

    try {
      console.debug("We accepted an order!");
      let acceiptReult = await this._api.post("orders/driveraccepts", request);
      return acceiptReult;
    } catch (err) {
      console.debug(err);
      alert(
        "There was an error in driverAcceptOrderRequest: " + JSON.stringify(err)
      );
    }
  };

  //driver reject order
  static driverRejectOrderRequest = async (orderRequestId, driverId) => {
    let request = {
      orderRequestId: orderRequestId, //check exists!
      driverId: driverId,
    };

    try {
      await this._api.post("orders/driverrejects", request);
      console.debug("We rejected an order!");
    } catch (err) {
      console.debug(err);
    }
  };
  //////////////////////////////
  //STORE CALLS
  //////////////////////////////
  static turnStoreOn = async (storeId) => {
    let request = {
      storeGuid: storeId,
    };

    try {
      await this._api.post("stores/setasonline", request);
      console.debug("We turned on store");
    } catch (err) {
      console.debug(err);
    }
  };

  static turnStoreOff = async (storeId) => {
    let request = {
      storeGuid: storeId,
    };

    try {
      await this._api.post("stores/setasoffline", request);
      console.debug("We turned off store");
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////////////////
  //ORDER REQUEST
  //////////////////////////////
  static getOrderRequest = async (orderRequestId) => {
    let url = "orderrequest/getorderrequest?id=" + orderRequestId;
    try {
      let response = await this._api.get(url);
      console.debug("We got order request");
      return response.data;
    } catch (err) {
      console.debug(err);
    }
  };

  static cancelOrderRequest = async (orderRequestId) => {
    let url = "orderrequest/cancel?id=" + orderRequestId;
    try {
      console.debug("We cancel order request");
      return await this._api.get(url);           
    } catch (err) {
      console.debug(err);
    }
  };


  //////////////////////////////
  //ORDER REQUEST MESSAGE
  //////////////////////////////
  static getactiveCustomerOrderRequests = async (userId) => {
    let orderRequestUrl = "orderrequest/GetActiveCustomerRequests?userId=" + userId;
    try {
      return await this._api.get(orderRequestUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }    
  };

  static getactiveDriverOrderRequests = async (userId) => {
    let orderRequestUrl = "orderrequest/GetActiveDriverRequests?userId=" + userId;
    try {
      return await this._api.get(orderRequestUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }    
  };

  static getStoreInboundOrderCount = async (storeId) => {
    let storeUrl = "stores/getinboundordercount?storeId=" + storeId;
    try {
      return await this._api.get(storeUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }    
  };
 
                                 
 

  //////////////////////////////
  //ACTION MESSAGE
  //////////////////////////////
  static getUnreadActionMessages = async (userId) => {
    let actioMsgUrl = "actionmessages/GetAllUnread?userId=" + userId;

    try {
      return await this._api.get(actioMsgUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }    
  };

  static getAllActionMessages = async (userId) => {
    let actioMsgUrl = "actionmessages/GetAllUnread?userId=" + userId;
    try {
      return await this._api.get(actioMsgUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }
  };

  static markActionMessageAsComplete = async (messageId) => {
    let actionMsgUrl = "actionmessages/MarkAsComplete?messageId=" + messageId;
    try {
      return await this._api.get(actionMsgUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }
  };

  //ACTION MESSAGE - DRIVER ACCEPT ORDER REQUEST
  static actionMessageAction_DriverAcceptOrderRequest = async (
    driverId,
    orderRequestId
  ) => {
    let daactioMsgUrl =
      "actionmessages/actiontotake/driver/acceptOrderRequest?driverId=" +
      driverId +
      "&orderRequestId=" +
      orderRequestId;
    try {
      return await this._api.get(daactioMsgUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }
  };

  static actionMessageAction_CustomerConfirmOrderCompete = async (orderId) => {
    let daactioMsgUrl =
      "actionmessages/actiontotake/customer/confirmDelievery?orderId=" +
      orderId;
    try {
      return await this._api.get(daactioMsgUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }
  };



  static markOrderRequestAsRead = async (driverId, orderRequestId) => {
    let markReadUrl = "orderrequest/markrequestreceived?driverId=" + driverId + "&orderrequestid=" + orderRequestId;
    try {
      return await this._api.get(markReadUrl);
      console.debug("got msg");
    } catch (err) {
      console.debug(err);
    }
  };




  //////////////////////////////
  //ORDER CANCELLATION CALLS
  //////////////////////////////
  static driverCancelOrder = async (orderId, reason) => {
    let request = {
      orderId: orderId, //check exists!
      cancellationId: 0,
      reason: reason,
    };

    try {
      await this._api.post("orders/drivers/cancel", request);
      console.debug("We cancelled driver order");
    } catch (err) {
      console.debug(err);
    }
  };

  static driverCancelOrderEntireDestination = async (
    orderDestinationId,
    reason
  ) => {
    let request = {
      orderDestinationId: orderDestinationId, //check exists!
      cancellationId: 0,
      reason: reason,
    };

    try {
      console.debug("We cancelled driver order");
      return await this._api.post("orders/drivers/canceldestination", request);
    } catch (err) {
      console.debug(err);
    }
  };

  static storeCancelOrder = async (orderId, reason) => {
    let request = {
      orderId: orderId, //check exists!
      cancellationId: 0,
      reason: reason,
    };

    try {
      await this._api.post("orders/stores/cancel", request);
      console.debug("We cancelled store order");
    } catch (err) {
      console.debug(err);
    }
  };

  /////////////////////////////
  //ORDER CONFIRMATION CALLS
  //////////////////////////////

  static storeConfirmOrderPickup = async (orderId) => {
    let request = {
      orderId: orderId, //check exists!
    };

    try {
      await this._api.post("orders/pickup/storeconfirm", request);
      console.debug("We confirmed order pickup ");
    } catch (err) {
      console.debug(err);
    }
  };

  static driverPageAlmostArrivedAtPickupEntireDestination = async (passedOrderId) => {
    let request = {
      orderDestinationId: passedOrderId, //check exists!
    };

    try {      
      await this._api.post("orders/arrival/driveralmostatpickupentiredestination", request);
      console.debug("We confirmed arrived at pickup for all customers");
    } catch (err) {
      console.debug(err);
    }
  };

  
  static driverPageAlmostArrivedAtDestinationEntireDestination = async (passedOrderId) => {
    let request = {
      orderDestinationId: passedOrderId, //check exists!
    };

    try {      
      await this._api.post("orders/arrival/driveratdestinationentiredestination", request);
      console.debug("We confirmed arrived at dest for all customers");
    } catch (err) {
      console.debug(err);
    }
  };

  static driverConfirmOrderPickup = async (orderItineraryId) => {
    let request = {
      orderItineraryId: orderItineraryId, //check exists!
    };

    try {
      //SWTICHED METHOD FOR NEW PROCESS - CAN SWITCH BACK ANYTIME
      // await this._api.post("orders/pickup/driverconfirmfullitinerary", request);

      //uses token
      await this._api.get("orders/pickup/driverconfirmallactiveorders");

      console.debug("We confirmed order pickup for all customers");
    } catch (err) {
      console.debug(err);
    }
  };

  /**Confirms delivery for all orders at a destination */
  static driverConfirmOrderDelivery = async (orderDestinationId, reason) => {
    let request = {
      orderDestinationId: orderDestinationId, //check exists!
      reason: reason,
    };

    try {
      return await this._api.post(
        "orders/delivered/tocustomerdestination",
        request
      );
      console.debug("We confirmed order delivery");
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////////////////////
  //USER ACCOUNTS AND TRANSACTIONS
  //////////////////////////////////
  /**Gets account details including balance */
  static getAccountBalanceByUserId = async (userId) => {
    try {
      console.debug("About to get balance by user Id");
      let balanceResponse = await this._api.get(
        "usertransactions/getbalanceandlatesttranbyuser?userId=" + userId
      );
      console.debug("We got balance");
      return balanceResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Uses token */
  static getTransactionsForLast60Days = async () => {
    try {
      console.debug("About to getTransactionsForLast60Days");
      let tranResponse = await this._api.get(
        "usertransactions/getaccountandtransforlast60days"
      );
      console.debug("We got balance");
      return tranResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  ////////////////
  //EXTERNAL PAYMENTS - CUSTOMER
  ////////////////
  //checks if there is already an existing customer on the server and gets if so
  //this works off the token
  static doesStripeCustomerExistOnHopprServerForUser = async (
    paymentProviderType
  ) => {
    let url =
      "externalpaymentcustomers/doescustomerexist?type=" + paymentProviderType;
    try {
      let existingCustomerResponse = await this._api.get(url);
      return existingCustomerResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Must create customer directly!! Create in stripe then send linking details to server or somethign */
  static createExternalPaymentCustomerNOTALLOWED = async (userId, token) => {
    let createCusPayload = { userId: userId, token: token };
    let cCustomerUrl = "externalpaymentcustomers/createnewstripecustomer";
    try {
      let newCustomerResponse = await this._api.post(cCustomerUrl, payload);
      console.debug("WE got it");
      return newCustomerResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  static isStripeCustomerDefaultPaymentSourceSet = async (
    paymentProviderType
  ) => {
    let url =
      "externalpaymentcustomers/isdefaultpaymentsourceset?type=" +
      paymentProviderType;
    try {
      let existingCustomerResponse = await this._api.get(url);
      return existingCustomerResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  //**Gets from token/
  static getStripeCustomer = async () => {
    let url = "externalpaymentcustomers/getstripecustomerfromtoken";
    try {
      let existingCustomerResponse = await this._api.get(url);
      return existingCustomerResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  static getStripeConnectAccountUrl = async () => {
    let url = "externalpaymentaccounts/viewaccount";
    try {
      let existingCustomerResponse = await this._api.get(url);
      return existingCustomerResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  //sends the details of the charge to the server
  static sendStripeTokenDetailsToServer = async (tokenId) => {
    try {
      let request = {
        stripeTokenId: tokenId,
      };
      console.debug("About send token to server");
      let serverResponse = await this._api.post(
        "payments/makestripepaymentfororder",
        request
      );
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  //a stripe customer  must exist in the parent system
  static createChargeForOrderRequest = async (orderRequestId) => {
    try {
      let request = {
        orderRequestId: orderRequestId,
      };
      console.debug("About send token to server");
      let serverResponse = await this._api.post(
        "payments/makestripepaymentfororder",
        request
      );
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  //////////////////
  //PAYMENT CARDS
  static getPaymentCards = async (userId) => {
    try {
      let fullUrl = "externalpaymentcustomers/getcards?userId=" + userId;
      console.debug("About to get custmer cards");
      let serverResponse = await this._api.get(fullUrl);
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  /*Updates stripe card - sets new card as default*/
  static addNewStripeCardAsPaymentSource = async (tokenId, userId) => {
    try {
      let request = {
        userId: userId,
        token: tokenId,
      };
      console.debug("About send token to server");
      let serverResponse = await this._api.post(
        "externalpaymentcustomers/addnewcard",
        JSON.stringify(request)
      );
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  static removeStripeCardAsPaymentSource = async (cardId, userId) => {
    try {
      let request = {
        cardId: cardId,
        userId: userId,
      };

      console.debug("About to remove card");
      let serverResponse = await this._api.post(
        "externalpaymentcustomers/deletecard",
        JSON.stringify(request)
      );

      console.debug("Got response");
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  static setNewCardAsDefaultSource = async (cardId, userId) => {
    try {
      let request = {
        userId: userId,
        cardId: cardId,
      };

      let fullUrl = "externalpaymentcustomers/setdefaultcard";
      console.debug("About to set new deafult card");
      let serverResponse = await this._api.post(
        fullUrl,
        JSON.stringify(request)
      );

      console.debug("Set card as new default correctly!");
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  /////////////////
  // ////COMMS
  /////////////////

  //Onesignal - add or update!!
  static addOrUpdateOnesignalPlayerId = async (accountId, onesignalPlayerId) => {
    try {
      let request = {
        accountId: accountId,
        CommsId: onesignalPlayerId,
        ExternalCommunicationsIdType: "OneSignal_PlayerId",
      };

      console.debug("About to add / update player id");
      let serverResponse = await this._api.post(
        "externaluserconnections/addorupdate",
        JSON.stringify(request)
      );
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  ////////////////
  ///STOCK
  ////////////////

  /** Gets stock for your store depending on token)*/
  static getProductStockAndAmendments = async (storeId, networkId) => {
    try {
      // let query = new QueryBuilder()
      //   .filter(f => f.filterExpression("_id", "eq", storeId))
      //   .toQuery();

      // let url = "stores";
      // let suffix = "&$select=_id&$expand=productAmendments,productStocks";
      // let fullQuery = url + query + suffix;

      let fullQuery = `productstocks/getstocksforstore?storeId=${storeId}&networkId=${networkId}`;
      console.debug("About to get stock");
      let serverResponse = await this._api.get(fullQuery);
      console.debug("got stock");
      return serverResponse.data;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Turn on a product stock category */
  static turnProductStockCategoryOn = async (catId) => {
    try {
      let request = {
        categoryId: catId,
      };
      console.debug("About to turn proudct stock category on");
      let serverResponse = await this._api.post(
        "productstocks/categoryenable",
        request
      );
      console.debug("turned category on stock");
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Turn off a product stock category */
  static turnProductStockCategoryOff = async (catId) => {
    try {
      let request = {
        categoryId: catId,
      };
      console.debug("About to turn proudct stock category off");
      let serverResponse = await this._api.post(
        "productstocks/categorydisable",
        request
      );
      console.debug("turned category off stock");
      return serverResponse;
    } catch (err) {
      console.debug(err);
    }
  };

  /**Turn on a product stock */
  static turnProductStockOn = async (productId, productStockId) => {
    try {
      let request = {
        productId: productId,
        productStockId: productStockId,
      };
      console.debug("About to turn product stock on");
      let serverResponse = await this._api.post(
        "productstocks/enable",
        request
      );
      console.debug("turned on stock");
      return serverResponse.data; //the stock if there wasn't one
    } catch (err) {
      console.debug(err);
    }
  };

  /**Turn on a product stock */
  static turnProductStockOff = async (productId, productStockId) => {
    try {
      let request = {
        productId: productId,
        productStockId: productStockId,
      };
      console.debug("About to turn product stock on");
      let serverResponse = await this._api.post(
        "productstocks/disable",
        request
      );
      console.debug("turned off stock");
      return serverResponse.data; //the stock if there wasn't one
    } catch (err) {
      console.debug(err);
    }
  };

  /**Sends photo to registration process as multipart form data @ roleregistration/mediaupload */
  static uploadIdPhoto = async () => { };

  ///STORE CALENDAR / OPENING HOURS

  /**Update store calendar */

  static updateOpeningHoursStoresCalendar = async (day, newTime) => {
    try {
      let request = {
        day: day,
        newTime: newTime,
      };

      console.debug("About to update calendar");
      let serverResponse = await this._api.post(
        "storescalendar/updateopeningtime",
        request
      );
      console.debug("updated calendar");
      return serverResponse; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  static updateClosingHoursStoresCalendar = async (day, updatedTime) => {
    try {
      let request = {
        day: day,
        newTime: updatedTime,
      };

      console.debug("About to update calendar");
      let serverResponse = await this._api.post(
        "storescalendar/updateclosingtime",
        request
      );
      console.debug("updated calendar");
      return serverResponse; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  ///////////////
  ///BI METHODS
  ///////////////

  //For BIMap
  static getBIStores = async (networkId) => {
    try {
      console.debug("About to get stores");

      let URl = "bi/getstores?networkId=" + networkId;

      let serverResponse = await this._api.get(URl);
      console.debug("got BI stores");
      return serverResponse.data; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  static getBIDrivers = async (networkId) => {
    try {
      console.debug("About to get drivers");

      let URl = "bi/getdrivers?networkId=" + networkId;

      let serverResponse = await this._api.get(URl);
      console.debug("got BI getdrivers");
      return serverResponse.data; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  static getBIOrders = async (networkId) => {
    try {
      console.debug("About to get orders");
      let serverResponse = await this._api.get(
        "bi/getorders?networkId=" + networkId
      );
      console.debug("got BI orders");
      return serverResponse.data; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  /////////////////
  //// PERMISSIONS
  /////////////////

  //so you can approve them as network owner - usees token to identify user
  static getNetworkPermissionsRequests = async () => {
    try {
      let permReqURl = "networkuserpermissionrequest/getoutstanding";
      console.debug("About to get all permissions");
      let serverResponse = await this._api.get(permReqURl);
      console.debug("got data");
      return serverResponse.data; // permission requests
    } catch (error) {
      console.debug("error:" + error);
    }
  };

  /**Network owner can approve request */
  static approvePermissionRequest = async (id) => {
    let approveRequest = {
      Id: id,
    };
    let permReqURl = "networkuserpermissionrequest/accept";
    console.debug("About to get all permissions");
    let serverResponse = await this._api.post(permReqURl, approveRequest);
    console.debug("got data");
    return serverResponse; // no content
  };

  /**Network owner can delete request */
  static deletePermissionRequest = async (id) => {
    let deleteRequest = {
      Id: id,
    };
    let permReqURl = "networkuserpermissionrequest/remove";
    console.debug("About to get all permissions");
    let serverResponse = await this._api.post(permReqURl, deleteRequest);
    console.debug("got data");
    return serverResponse; // permission requests
  };

  static getCustomerCourierNetwork = async () => {
    try {
      let theUrl = "networks/getcustomercourier";
      console.debug("letsgo");
      let netPickerResult = await this._api.get(theUrl);
      console.debug("dones it");
      return netPickerResult;
    } catch (error) {
      console.debug("error in getAvailableShoppingNetworks" + error);
    }
  };
  

  /** get available networks for shopping screen */
  static getAvailableShoppingNetworks = async () => {
    try {
      
      let isThereLatLng = this.getDestinationPickedLatLngIfExistFromStore();
      let theUrl = `networks/getavailableshoppingnetworks?lat=${isThereLatLng.lat}&lng=${isThereLatLng.lng}`;
      console.debug("letsgo");
      let netPickerResult = await this._api.get(theUrl);
      console.debug("dones it");
      return netPickerResult;
    } catch (error) {
      console.debug("error in getAvailableShoppingNetworks" + error);
    }
  };

  /* get my network permissions for a type */
  static getAllNetworksAndPermissions = async (userId, permissionType) => {
    try {
      let permsUrl =
        "networkuserpermissions/getallnetworksandpermissions?userGuid=" +
        userId +
        "&type=" +
        permissionType;

      console.debug("About to get all permissions");
      let serverResponse = await this._api.get(permsUrl);
      console.debug("got Data");
      return serverResponse.data; // no content
    } catch (err) {
      console.debug(err);
    }
  };

  static enableNetworkPermission = async (permId) => {
    let permUrl = "networkuserpermissions/enable?permissionId=" + permId;
    console.debug("About to get all permissions");
    let serverResponse = await this._api.get(permUrl);
    console.debug("enabled");
    return serverResponse;
  };

  static getResetPasswordLink = async (email) => {
    let resetUrl = `accounts/resetuserpassword?email=${email}`;
    console.debug("About to reset password");
    let serverResponse = await this._api.get(resetUrl);
    console.debug("enabled");
    return serverResponse;
  };


  static disableNetworkPermission = async (permId) => {
    let permUrl = "networkuserpermissions/disable?permissionId=" + permId;
    console.debug("About to get all permissions");
    let serverResponse = await this._api.get(permUrl);
    console.debug("disabled");
    return serverResponse;
  };

  static deleteNetworkPermission = async (permId) => {
    let delRequest = {
      permissionId: permId,
    };
    let permUrl = "networkuserpermissions/remove";
    console.debug("About to get all permissions");

    let serverResponse = await this._api.post(permUrl, delRequest);
    console.debug("deleted");
    return serverResponse;
  };

  static addNetworkUserPermissionRequest = async (
    userId,
    networkId,
    permType
  ) => {
    var permRequest = {
      Id: 0,
      accountId: userId,
      networkId: networkId,
      type: permType,
    };

    let permUrl = "networkuserpermissionrequest/add";
    console.debug("About to add permissions");
    return await this._api.post(permUrl, permRequest);
    // console.debug("Added");
    // return permReqServerResponse;
  };

  /**Tests with single permission exists for user / type / network */
  static doesPermissionExistForUser_Network_Type = async (
    userId,
    networkId,
    permType
  ) => {
    //add params!!
    let permUrl = "networkuserpermissions/check?";
    console.debug("About to check permissions");
    return await this._api.get(permUrl);
  };

  /** CREATE NETWORK  */
  static createNewNetwork = async (newNetworkPayload) => {
    try {
      let addnetUrl = "networks/create";
      console.debug("About to add new netowk");
      let netAddResults = await this._api.post(addnetUrl, newNetworkPayload);
      return netAddResults;
    } catch (error) {
      console.debug(error);
      return error.response;
    }
  };

  /**Should get via token */
  static getNetworksIOwn = async () => {
    console.debug("getting networks");
    try {
      let myNets = "networks/getviatoken";
      console.debug("About to get netsk");
      let netAddResults = await this._api.get(myNets);
      console.debug("About to get netsk");
      return netAddResults.data;
    } catch (error) {
      console.debug(error);
    }
  };

  /**Should get via token */
  static getNetworksIOwn = async () => {
    console.debug("getting networks");
    try {
      let myNets = "networks/getviatoken";
      console.debug("About to get netsk");
      let netAddResults = await this._api.get(myNets);
      console.debug("About to get netsk");
      return netAddResults.data;
    } catch (error) {
      console.debug(error);
    }
  };

  /**Turn network active 'on' */
  static enableNetwork = async (enableNetId) => {
    console.debug("enable networks");
    try {
      let myNetsEnableUri = "networks/enable";
      let netEnablePayload = { networkId: enableNetId };
      console.debug("about to enable");
      let netAddResults = await this._api.post(
        myNetsEnableUri,
        JSON.stringify(netEnablePayload)
      );
      console.debug("net enabled");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };

  /**Turn network active 'off' */
  static disableNetwork = async (disableNetId) => {
    console.debug("enable networks");
    try {
      let myNetsEnableUri = "networks/disable";
      let netEnablePayload = { networkId: disableNetId };
      console.debug("about to disable");
      let netAddResults = await this._api.post(
        myNetsEnableUri,
        JSON.stringify(netEnablePayload)
      );
      console.debug("net disabled");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };

    /**Turn network active 'off' */
    static deleteNetwork = async (disableNetId) => {
      console.debug("enable networks");
      try {
        let myNetsEnableUri = "networks/delete";
        let netEnablePayload = { networkId: disableNetId };
        console.debug("about to delete");
        let netAddResults = await this._api.post(
          myNetsEnableUri,
          JSON.stringify(netEnablePayload)
        );
        console.debug("net disabled");
        return netAddResults;
      } catch (error) {
        console.debug(error);
      }
    };
  


  /**send chat message */
  static sendChatMessage = async (toUserGuid, message, orderId = null) => {
    console.debug("send chat");
    try {
      let chatUrl =
        "chat/SendChatMessage?toUserGuid=" +
        toUserGuid +
        "&message=" +
        message +
        "&orderId=" +
        orderId;
      let netAddResults = await this._api.get(chatUrl);
      console.debug("done");
      return netAddResults;
    } catch (error) {
      console.debug(error);
      return error;
    }
  };

  static getChatParticipantsForMyOrder = async (orderId) => {
    console.debug("get chatters");
    try {
      let chatUrl = "chat/GetChatParticipantsForMyOrder?orderId=" + orderId;
      let netAddResults = await this._api.get(chatUrl);
      console.debug("done");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };

  static getAllOnlineChatUsers = async () => {
    console.debug("get chatters");
    try {
      let chatUrl = "chat/getonlineusers";
      let netAddResults = await this._api.get(chatUrl);
      console.debug("done");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };

  static getChatUsersInMyOrders = async (userId) => {
    console.debug("get chatters");
    try {
      let chatUrl = "chat/getChatUsersInMyOrders?userId=" + userId;
      let netAddResults = await this._api.get(chatUrl);
      console.debug("done");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };


  static getSingleChatter = async (theirUserId) => {
    console.debug("get chatters");
    try {
      let chatUrl = "chat/getUser?id=" + theirUserId;
      let netAddResults = await this._api.get(chatUrl);
      console.debug("done");
      return netAddResults;
    } catch (error) {
      console.debug(error);
    }
  };


  //////////////////
  //NETWORK SPLITS
  //////////////////

  static getNetworkSplits = async (networkId) => {
    console.debug("get network splits");
    try {
      let netSplitURl = "networktransactionfeesplits/GetNetworkTransactionFeeSplits?networkId=" + networkId;
      let netSplitResult = await this._api.get(netSplitURl);
      console.debug("done");
      return netSplitResult;
    } catch (error) {
      console.debug(error);
    }
  };

  static addNetworkSplit = async (networkId, addPercentage, splitAddUserName) => {
    console.debug("add network splits");
    try {

      let netSplitData = {
        networkId: networkId,
        newSplitPercentage: addPercentage,
        userName: splitAddUserName
      };

      let stringToCall = `networktransactionfeesplits/add?networkId=${networkId}&newSplitPercentage=${addPercentage}&userName=${splitAddUserName}`;

      console.debug("done");
      let netSplitResult = await this._api.get(stringToCall);
      console.debug("done");
      return netSplitResult;
    } catch (error) {
      console.debug(error);
    }
  };


  static deleteNetworkSplit = async (splitIdToDelete) => {
    console.debug("delete network splits");
    try {
      let stringToCall = `networktransactionfeesplits/delete?id=${splitIdToDelete}`;
      console.debug("done");
      let netSplitResult = await this._api.get(stringToCall);
      console.debug("done");
      return netSplitResult;
    } catch (error) {
      console.debug(error);
    }
  };


  //EXTERNAL PAYMENTS

  //GET INBOUND Driver / Store
  static getOutboundPaymentLastXDays = async (noOfDays) => {
    console.debug("delete network splits");
    try {
      let stringToCall = `payments/outbound?days=${noOfDays}`;
      console.debug("done");
      let innboundPayRestuls = await this._api.get(stringToCall);
      console.debug("done");
      return innboundPayRestuls;
    } catch (error) {
      console.debug(error);
    }
  };

  //SHOPIFY TO HOPP
  static createShopifyToHoppr = async (payload) => {
    console.debug("shop to hop");
    try {
      let urlToCall = "ShopifyNetworkCreation/PerformShopifyToHopperfy"    
       console.debug("done");
      return await this._api.post(urlToCall,payload);       
    } catch (error) {
      console.debug(error);
      return error.response;
    }
  };


}
