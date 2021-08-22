import Constants from "./../../common/Constants";

export default class circleRowConfig {
  constructor(items) {
    this.layout = Constants.Layout.circle;
    this.items = items; //this is an array
    this.listingOrder = 1; //this makes it always row 2 in the GUI
  }
}
