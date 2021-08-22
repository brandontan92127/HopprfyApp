/** @format */

import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";
import { ModalBox } from "@components";
import { Config } from "@common";
import ItemLayout from "./ItemLayout";
import styles from "./styles";
import { connect } from "react-redux";
import { EventRegister } from "react-native-event-listeners";

StyleSheet.create({
  layoutBox: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    marginTop: 10,
  },
});

class Layout extends PureComponent {


  _removeLayoutEventHandlers=()=>{
    EventRegister.removeEventListener(this.openRequestPermissionsModalHandler);
    EventRegister.removeEventListener(this.openNetworkPickerModalHandler);
    EventRegister.removeEventListener(this.openVideoDisplayModalHandler);
    EventRegister.removeEventListener(this.openActionMessageModalHandler);
    EventRegister.removeEventListener(this.openCashoutModalHandler);    
  }

  componentWillUnmount=()=>{
      this._removeLayoutEventHandlers();
  }

  componentDidMount() {
    console.debug("In layout");
    // Events.onOpenModalLayout(this.open); //this was for the ORIGINAL layout modal!
    //add network picker modal open

    //new style handleres
    //event f
    
    this.openRequestPermissionsModalHandler = EventRegister.addEventListener("openRequestPermissionsModal", () =>
    this.openRequestPermissionsModal()
  );
    this.openNetworkPickerModalHandler= EventRegister.addEventListener("openNetworkPickerModal", () =>
    {
      this.openNetworkPickerModal();
    }          
    );
   this.openVideoDisplayModalHandler= EventRegister.addEventListener("openVideoDisplayModal", () =>
      this.openVideoDisplayModal()
    );
   this.openActionMessageModalHandler=  EventRegister.addEventListener("openActionMessageModal", () =>
      this.openActionMessageModal()
    );
    this.openCashoutModalHandler= EventRegister.addEventListener("openCashoutModal", () =>
      this.openCashoutModal()
    );

    this.openLocationPickerModalHandler = EventRegister.addEventListener(
      'openLocationPickerModal',
      () => this.openLocationPickerModal(),
    );

    this.openCourierControlsModalHandler = EventRegister.addEventListener(
      'openCourierControlsModal',
      () => this.openCourierControlsModal(),
    );
  }
   

  open = () => this.modal.openModal();

  close = () => this.modal.closeModalLayout();

  
  openLocationPickerModal = () => {
    console.log('on location picker modal');
    this.props.updateModalState('locationPickerModal', true);
    //EventRegister.emit("showLocationPickerModal");
  };

  openCourierControlsModal = () => {
    console.log('on courier picker modal');
    this.props.updateModalState('courierControlsModal', true);
    //EventRegister.emit("showCourierControlsModal");
  };

  openRequestPermissionsModal = () => {
    this.props.updateModalState("requestPermissionsModal", true);
    EventRegister.emit("savePingerStateAndCorner");
  };
  

  closeRequestPermissionsModal = () => {
    this.props.updateModalState("requestPermissionsModal", false);
  };

  //network modal options added
  openNetworkPickerModal = () => {
    this.props.updateModalState("networkPickerModal", true);
    EventRegister.emit("savePingerStateAndCorner");
  };

  closeNetworkPickerModal = () => {
    alert("this should close modal for network picker!");
    this.props.updateModalState("networkPickerModal", false);
  };

  openVideoDisplayModal = () => {
    this.props.updateModalState("videoDisplayModal", true);
    EventRegister.emit("savePingerStateAndCorner");
    //this.props.updateModalState("startingHelpModal", true);
  };

  openCashoutModal = () => {
    this.props.updateModalState("cashoutModal", true);
    EventRegister.emit("savePingerStateAndCorner");
  };

  openActionMessageModal = () => {
    this.props.updateModalState("actionMessageModal", true);
    EventRegister.emit("savePingerStateAndCorner");
  };

  closeVideoDisplayModal = () => {
    alert("this should close modal for video display");
    this.props.updateModalState("videoDisplayModal", false);
  };

  render() {
    return (
      <ModalBox ref={(modal) => (this.modal = modal)}>
        <View style={styles.layoutBox}>
          {Config.layouts.map((item, index) => {
            return (
              <ItemLayout
                key={index}
                close={this.close}
                layout={item.layout}
                image={item.image}
                text={item.text}
              />
            );
          })}
        </View>
      </ModalBox>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  const modalActions = require("@redux/ModalsRedux");

  return {
    updateModalState: (modalName, modalState) => {
      console.debug("About to update modals");
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState
          )
        );
      } catch (error) {
        console.debug(error);
      }
    },
  };
};

export default connect(null, mapDispatchToProps)(Layout);
