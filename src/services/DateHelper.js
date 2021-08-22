export default class DateHelper {
  static renderDate = passedDate => {
    let m = new Date();
    m = passedDate;

    let dateString =
      m.getUTCFullYear() +
      "/" +
      ("0" + (m.getUTCMonth() + 1)).slice(-2) +
      "/" +
      ("0" + m.getUTCDate()).slice(-2) +
      " " +
      ("0" + m.getUTCHours()).slice(-2) +
      ":" +
      ("0" + m.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + m.getUTCSeconds()).slice(-2);

    return dateString;
  };
}
