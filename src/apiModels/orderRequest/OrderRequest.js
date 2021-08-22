export default class OrderRequest {
  constructor(networkId, customerId, deliveryDestination, items, storeId = null, driverNote, storeNote, resolvedDestinationAddress) {
    this.networkId = networkId;
    this.storeId = storeId,
    this.customerId = customerId;
    this.deliveryDestination = deliveryDestination;   
    this.items = items;
    this.driverNote = driverNote ?? "";
    this.storeNote = storeNote ?? "";
    this.resolvedDestinationAddress = resolvedDestinationAddress ?? "";
  }
}