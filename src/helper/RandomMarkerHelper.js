import { Config, Images } from "@common";
/**gives you one of x random markers*/

const storeMarkers = [
    { id: 0.0, link: Images.MapIconStore3 },
    { id: 0.1, link: Images.MapIconStore },
    { id: 0.2, link: Images.MapIconStore2 },
    { id: 0.3, link: Images.MapIconStore11 },
    { id: 0.4, link: Images.MapIconStore10 },
    { id: 0.5, link: Images.MapIconStore12 },
    { id: 0.6, link: Images.MapIconStore6 },
    { id: 0.7, link: Images.MapIconStore7 },
    { id: 0.8, link: Images.MapIconStore8 },
    { id: 0.9, link: Images.MapIconStore9 },
];

const hopprMarkers = [
    { id: 0.0, link: Images.HopprLogoMapPin1 },
    { id: 0.1, link: Images.HopprLogoMapPin2 },
    { id: 0.1, link: Images.HopprLogoMapPin3 },
    { id: 0.2, link: Images.HopprLogoMapPin4 },
    { id: 0.3, link: Images.HopprLogoMapPin5 },
    { id: 0.4, link: Images.HopprLogoMapPin1 },
    { id: 0.5, link: Images.HopprLogoMapPin2 },
    { id: 0.6, link: Images.HopprLogoMapPin3 },
    { id: 0.7, link: Images.HopprLogoMapPin4 },
    { id: 0.8, link: Images.HopprLogoMapPin5 },
    { id: 0.9, link: Images.HopprLogoMapPin1 },
];

const driverMarkers = [
    { id: 0.0, link: Images.MapIconDriver7 },
    { id: 0.1, link: Images.MapIconDriver },
    { id: 0.1, link: Images.MapIconDriver },
    { id: 0.2, link: Images.MapIconDriver2 },
    { id: 0.3, link: Images.MapIconDriver3 },
    { id: 0.4, link: Images.MapIconDriver4 },
    { id: 0.5, link: Images.MapIconDriver5 },
    { id: 0.6, link: Images.MapIconDriver6 },
    { id: 0.7, link: Images.MapIconDriver7 },
    { id: 0.8, link: Images.MapIconDriver8 },
    { id: 0.9, link: Images.MapIconDriver9 },
];

export default class RandomMarkerHelper {

    static useHopprMarkers = () => {
        return hopprMarkers;
    }

    static useDriverMarkers = () => {
        return driverMarkers;
    }

    static useStoreMarkers = () => {
        return storeMarkers;
    }
    /**Default is between 0 - 1 */
    static _generateRandomNumber = () => {
        return Math.random();
    }

    static getRandomInt=(min, max)=> {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
      }

    static GetRandomZIndexforMarker=(lower, upper)=>{
        return this.getRandomInt(lower, upper);
    }

    static GetRandomMarker = (whichMarkerSet) => {
        let imgDefault = whichMarkerSet[0];
        try {
            let thisRnd = this._generateRandomNumber();
            let compariosnValue = parseFloat(thisRnd.toFixed(1));
            let img = whichMarkerSet.find(x => x.id === compariosnValue);
            if (typeof img === "undefined") {
                return imgDefault.link;
            }

            let imgLInk = img.link
            return imgLInk;
        } catch (error) {
            return imgDefault.link;
        }

    }

    static GetCorrectMarkerForVehicleType = (vehicleType) => {
        let imgToReturn = Images.Car2;
        switch (vehicleType) {
            case "walk":
                imgToReturn = Images.MapIconWalk1;
                break;
            case "bicycle":
                imgToReturn = Images.AddDriver1
                break;
            case "cargo_bicycle":
                imgToReturn = Images.CargoBike1
                break;
            case "motorbike":
                imgToReturn = Images.AddDriver2
                break;
            case "car":
                imgToReturn = Images.Car1
                break;
            case "van_small":
                imgToReturn = Images.MapDeliveryVan1
                break;
            case "van":
                imgToReturn = Images.MapBigVan1
                break;
            default:
                imgToReturn = Images.Car2
                break;
        }

        return imgToReturn;
    }
}