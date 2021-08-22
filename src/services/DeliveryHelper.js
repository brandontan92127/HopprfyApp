import DeliveryOptionsRequest from "../apiModels/delivery/DeliveryOptionsRequest"

export default class DeliveryHelper {

    static generateCustomerCourierDeliveryOptionsUrl=(pickupStreetNumber, pickupStreetName, pickupStreetCity, 
        pickupStreetPostcode, //pickup location
        streetNumber, streetName, city, //delivery dest
        postcode, itemsArray, packageSize, networkId)=>{

            let url = this.generateDeliveryOptionsUrl(streetNumber, streetName, city,
                postcode, itemsArray, packageSize, networkId);
                
                let urlAddedParams = `&pickupAddressText.streetAddress=${pickupStreetNumber} ${pickupStreetName}&pickupAddressText.city=${pickupStreetCity}&pickupAddressText.postcode=${pickupStreetPostcode}`;
                url = url + urlAddedParams;
                return url;
    }


    static generateDeliveryOptionsUrl = (streetNumber, streetName, city,
        postcode, itemsArray, packageSize, networkId) => {
        let urlStringPayload = `?networkId=${networkId}&packageSizeType=${packageSize}&deliveryAddressText.streetAddress=${streetNumber} ${streetName}&deliveryAddressText.city=${city}&deliveryAddressText.postcode=${postcode}`;

        let itemsArrayString = "";
        let loopCounter = 0;
        itemsArray.map(x => {
            let loopText = `&itemsRequested[${loopCounter}].productId=${x.productId}&itemsRequested[${loopCounter}].amount=${x.amount}`;
            itemsArrayString = itemsArrayString + loopText;
            loopCounter = loopCounter + 1;
        });

        let finalConcatString = urlStringPayload + itemsArrayString;
        console.log("");
        return finalConcatString;
    }
}