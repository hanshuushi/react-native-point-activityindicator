/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Animated,
  Easing,
  Text,
  View
} from 'react-native';

const pointDiameter = 10
const pointJumpHeight = 20
const pointCurvature = 0.4
const pointPadding = 5
const curvatureDurationRate = 0.5
const pointTranslationLength = pointJumpHeight - pointDiameter * (1.0 + pointCurvature)
const activityIndicatorViewWidth = pointDiameter * (1.0 + pointCurvature) * 3.0 + pointPadding * 2.0

function mgEaseInQuad(t, b, c) {
    return c * t * t + b
}

function mgEaseOutQuad(t, b, c) {
    return -c * t * (t-2) + b
}

class LoadingPoint extends Component {
    getScaleX() {
        const progress = this.props.progress

        if (progress >= curvatureDurationRate) {
            return 1.0 - pointCurvature
        } else {
            const rate = mgEaseInQuad(progress / curvatureDurationRate, 0, 1.0)

            return 1.0 + pointCurvature - pointCurvature * 2.0 * rate
        }
    }
    getScaleY() {
        const progress = this.props.progress

        if (progress >= curvatureDurationRate) {
            return 1.0 + pointCurvature
        } else {
            const rate = mgEaseInQuad(progress / curvatureDurationRate, 0, 1.0)

            return 1.0 - pointCurvature + pointCurvature * 2.0 * rate
        }
    }
    getTranslateY() {
        const progress = this.props.progress

        if (progress >= curvatureDurationRate) {
            const rate = mgEaseOutQuad((progress - curvatureDurationRate) / (1.0 - curvatureDurationRate), 0, 1.0)

            return -pointTranslationLength * rate - pointDiameter / 2.0
        } else {
            const rate = pointCurvature + pointCurvature * 2.0 * mgEaseInQuad(progress / curvatureDurationRate, 0, 1.0)

            return -pointDiameter * rate + pointDiameter - pointDiameter / 2.0
        }
    }
    constructor(props) {
        super(props)

        props.progress = 0.0
    }
    render() {
        return (<View style={[styles.point, {backgroundColor: this.props.pointColor, transform: [{translateY: this.getTranslateY()},{scaleX:this.getScaleX()}, {scaleY: this.getScaleY()}] }]}/>)
    }
}

export default class Loading extends Component {

  static propTypes = {
    pointColor: PropTypes.string,
    duration: PropTypes.number,
  };

  props: PropsType;

  componentDidMount(){

    const animation = new Animated.Value(0.0);

    const _this = this;

    const duration = this.props.duration || 1000

    animation.addListener((value) => {
      _this.setState({
        progress: value.value
      });
    });

    function beginAnimation(animation) {
      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 2.0,
        duration: duration,
        easing: Easing.linear,
      }).start(() => beginAnimation(animation));
    };

    beginAnimation(animation);
  }

  static offset = 0.707106781186548 * curvatureDurationRate;

  getPointProgress(index) {
    let currentProgress = this.state.progress + (index - 1) * Loading.offset;

    return Loading.formatProgress(currentProgress);
  }

  static formatProgress(progress) {
    let _progress = progress;

    while (_progress < 0.0) {
      _progress += 2.0
    }

    while (_progress > 2.0) {
      _progress -= 2.0
    }

    if (_progress > 1.0) {
      return 2.0 - _progress;
    }

    return _progress;
  }

  constructor(props) {
      super(props);

      this.Left =  Animated.createAnimatedComponent(LoadingPoint);
      this.Center =  Animated.createAnimatedComponent(LoadingPoint);
      this.Right =  Animated.createAnimatedComponent(LoadingPoint);

      this.state = {
          progress: 0.0
      };
  }

  render() {
      return (
      <View style={styles.container}>
          <this.Left pointColor={this.props.pointColor || "black"} progress={this.getPointProgress(0)} />
          <this.Center pointColor={this.props.pointColor || "black"} progress={this.getPointProgress(1)} />
          <this.Right pointColor={this.props.pointColor || "black"} progress={this.getPointProgress(2)} />
      </View>
      );
  }
}

const styles = StyleSheet.create({
    container: {
        width: activityIndicatorViewWidth,
        height: pointJumpHeight + pointDiameter / 2.0,
        backgroundColor: "transparent",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    point: {
        width: pointDiameter,
        height: pointDiameter,
        borderRadius: pointDiameter / 2.0,
    }
});

AppRegistry.registerComponent('Loading', () => Loading);
