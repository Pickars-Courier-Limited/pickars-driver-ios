import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

type Props = {};

const ShimmerLoader = (props: Props) => {
  return (
    <SkeletonPlaceholder>
      <SafeAreaView style={{marginTop: 0, width: '100%'}}>
        <View style={{marginLeft: 20, marginTop: 20, width: '100%'}}>
          {/* <View style={{width: '90%', height: 200}} /> */}
          {/* <View
            style={{marginTop: 6, width: 260, height: 20, borderRadius: 5}}
          /> */}
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
          <View
            style={{marginTop: 6, width: '90%', height: 80, borderRadius: 16}}
          />
        </View>
      </SafeAreaView>
    </SkeletonPlaceholder>
  );
};

export default ShimmerLoader;

const styles = StyleSheet.create({});
