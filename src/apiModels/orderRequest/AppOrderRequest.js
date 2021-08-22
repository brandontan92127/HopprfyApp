export default class AppOrderRequest {
    constructor(order, location, selectedDeliveryType) {
      this.selectedDeliveryType = selectedDeliveryType;
      this.order = order;
      this.location = location;     
    }
  }
  