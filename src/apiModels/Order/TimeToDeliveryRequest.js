
export  class TimeBetweenPointsRequest {    
    constructor(sourcepointPayload, 
        destpointpayload){
        this.location = sourcepointPayload;
        this.destination = destpointpayload;
    }
}

export class TimeBetweenPointsRequestPayload {
    constructor(lat, lng, distance, unit, networkId) {
        this.lat = lat;
        this.long = lng;
        this.distance = distance;
        this.unit = unit;
        this.networkId = networkId;
    }
}
