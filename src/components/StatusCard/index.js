import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./style";

class StatusCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
      onPress={()=>this.props.openControls()}
      style={styles.container}>
   
        <View
          style={{ width: 18,
            height: 18,
            borderRadius: 50,
            backgroundColor:this.props.indicatorColor}}
        />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 12,
            color:"black",
            fontFamily: "RedHatDisplay-Regular",
          }}
        >
         {(this.props.status).toUpperCase()}
        </Text>
      
          <Image
            source={require("../../../assets/icons/Controls.png")}
            resizeMode={"contain"}
            style={styles.image}
          />        
      </TouchableOpacity>
    );
  }
}

export default StatusCard;
