import AppOrderRequest from "../orderRequest/AppOrderRequest";

export default class ItineraryAppOrderRequest extends AppOrderRequest {
    constructor(itineraryId, order, location) {
        super(order, location)
        this.orderDeliveryItineraryId = itineraryId;

    }
}