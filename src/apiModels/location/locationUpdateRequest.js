export default class locationUpdateRequest {
  constructor(id, lat, lng) {
    this.relationGuid = id;
    this.lat = lat;
    this.long = lng;
  }
}
