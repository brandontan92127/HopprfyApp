import styles from "./style";
import {
  Images,
  Constants,  
  Config,
  GlobalStyle
} from "@common";
import React from "react";
import { View, Text, FlatList, TouchableOpacity,Image } from "react-native";

class List extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let estPickupTime = this.props.pickupIn();
    estPickupTime = estPickupTime == 0 ? 1  : estPickupTime;

    return (
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={this.props.data}
          renderItem={({ item }) => (
            <View style={styles.listMain}>

              <View style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>Going To:</Text>
                  <View style={{flexDirection:"row", paddingTop:3}}>
                 <TouchableOpacity onPress={()=>this.props.openLocationPickerModal()}>
                  <Image     
                    source={Images.NewAppReskinIcon.LocationBlue}               
                    style={{height:30, width:30}}
                  ></Image>
                  </TouchableOpacity>                
                  </View>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>{this.props.goingTo}</Text>
                </View>
              </View>
              <View style={styles.divider}></View>      
              <View style={[styles.listContainer, {maxHeight:70}]}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>Pickup From:</Text>               
               <View style={{flexDirection:"row", paddingTop:3}}>
                 <TouchableOpacity onPress={async ()=>await this.props.setCurrentLocation()}>
                  <Image     
                    source={Images.NewBlueIcons.blueDirections}               
                    style={{height:30, width:30}}
                  ></Image>
                  </TouchableOpacity>
                  <TouchableOpacity style={{paddingLeft:4}} 
                  onPress={async ()=>await this.props.clearInputs()}>
                  <Image     
                    source={Images.NewAppReskinIcon.CloseButton}               
                    style={{height:30,  width:30}}
                  ></Image>
                  </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.rightSide]}>
                  <View style={{flex:1, position:"absolute"}}>
                     {this.props.renderLocationAutocomplete()}
                  </View>
                  {/* <Text style={styles.rightSideFonts}>{item.pickup}</Text> */}
                </View>
              </View>
                    
        

              <View style={styles.divider}></View>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>Price:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>£{this.props.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
              <TouchableOpacity style={styles.listContainer}>
                <View style={styles.leftSide}>
                  <Text style={styles.leftSideFonts}>Pickup In:</Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.rightSideFonts}>{estPickupTime} min(s)</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}></View>
            </View>
          )}
        />
      </View>
    );
  }
}

export default List;
