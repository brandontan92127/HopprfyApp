// @ts-ignore
import { arc } from 'd3-shape';
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { SCALE } from '../resources/images';

interface Props {
  size: number,
  progress: number,
  color: string,
  notFilledColor: string,
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  smallText: {
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#919193',
  },
  absolute: {
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 29,
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  scale: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

const START_ANGLE = Math.PI;
export default class CircleProgress extends React.PureComponent<Props> {
  static defaultProps = {
    notFilledColor: '#f5f5f7',
  };

  render() {
    const { size, color, progress, notFilledColor } = this.props;
    const realProgress = Number.isNaN(progress) ? 0 : Math.max(0, Math.min(1, progress));
    const r1 = (size / 2) - 12;
    const r2 = size / 2;
    const backgroundPath = arc()
      .innerRadius(r1)
      .outerRadius(r2)
      .cornerRadius(10)
      .startAngle((realProgress * 2 * Math.PI) + START_ANGLE)
      .endAngle(START_ANGLE);
    const backgroundPath2 = arc()
      .innerRadius(r1)
      .outerRadius(r2)
      .startAngle(0)
      .endAngle(2 * Math.PI);
    return (
      <View style={[{ width: size, height: size, }, styles.container]}>
        <View style={styles.absolute}>
          <Image source={SCALE} style={styles.scale}/>
          <View style={styles.shadow}>
            <Svg height={size} width={size}>
              <Defs>
                <LinearGradient id='grad' x1='0' x2='0' y1='0' y2={size * 1.5}>
                  <Stop offset='1' stopColor='#ffffff' stopOpacity='1'/>
                  <Stop offset='0' stopColor={color} stopOpacity='1'/>
                </LinearGradient>
              </Defs>
              <Path d={backgroundPath2()} fill={notFilledColor} x={size / 2} y={size / 2}/>
              <Path d={backgroundPath()} fill='url(#grad)' strokeLinecap='round' x={size / 2} y={size / 2}/>
            </Svg>
          </View>
        </View>
        {this.props.children}
      </View>
    );
  }
}