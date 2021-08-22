// /** @format */

// import EventEmitter from "@services/AppEventEmitter";

// //order request modal
// const closeOrderRequestModal = () =>
//   EventEmitter.emit("modal.orderRequestModal.close");
// const openOrderRequestModal = () =>
//   EventEmitter.emit("modal.orderRequestModal.open");
// const onOpenOrderRequestModal = func =>
//   EventEmitter.addListener("modal.orderRequestModal.open", func);

// //video display modal
// const closeVideoDisplayModal = () =>
//   EventEmitter.emit("modal.videoDisplayModal.close");
// const openVideoDisplayModal = () =>
//   EventEmitter.emit("modal.videoDisplayModal.open");  
// const onOpenVideoDisplayModal = func =>
//   EventEmitter.addListener("modal.videoDisplayModal.open", func);

// //network picker modal
// const closeModalNetworkPicker = () =>
//   EventEmitter.emit("modal.networkPicker.close");
// const openModalNetworkPicker = () =>
//   EventEmitter.emit("modal.networkPicker.open");
// const onOpenModalNetworkPicker = func =>
//   EventEmitter.addListener("modal.networkPicker.open", func);

// //action message modal
// const closeActionMessageModal = () =>
//   EventEmitter.emit("modal.actionMessage.close");
// const openActionMessageModal = () =>
//   EventEmitter.emit("modal.actionMessage.open");
// const onOpenActionMessageModal = func =>
//   EventEmitter.addListener("modal.actionMessage.open", func);

// //layout modal
// const closeModalLayout = () => EventEmitter.emit("modal.layout.close");
// const openModalLayout = () => EventEmitter.emit("modal.layout.open");
// const onOpenModalLayout = func =>
//   EventEmitter.addListener("modal.layout.open", func);
// // revemo
// const openModalReview = product =>
//   EventEmitter.emit("modal.review.open", product);
// const closeModalReview = () => EventEmitter.emit("modal.review.close");
// const onOpenModalReview = func =>
//   EventEmitter.addListener("modal.review.open", func);
// const onCloseModalReview = func =>
//   EventEmitter.addListener("modal.review.close", func);

// export default {
//   closeActionMessageModal,
//   openActionMessageModal,
//   onOpenActionMessageModal,

//   openOrderRequestModal,
//   closeOrderRequestModal,
//   onOpenOrderRequestModal,

//   openModalNetworkPicker,
//   closeModalNetworkPicker,
//   onOpenModalNetworkPicker,

//   openVideoDisplayModal,
//   closeVideoDisplayModal,
//   onOpenVideoDisplayModal,

//   //modal layout
//   openModalLayout,
//   closeModalLayout,
//   onOpenModalLayout,
//   // review
//   openModalReview,
//   closeModalReview,
//   onOpenModalReview,
//   onCloseModalReview
// };
