import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import BottomBar from '../components/BottomBar';
import LinearGradient from 'react-native-linear-gradient';

export default function YouPlantScreen(){
  return (
    <SafeAreaView>
      <ScrollView
        scrollEnabled={true}
        contentInsetAdjustmentBehavior='automatic'
      >
        <View
          style={{
            width: 402,
            height: 874,
            backgroundColor: '#468585',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 30,
            position: 'relative',
            overflow: 'hidden',
            marginTop: 0,
            marginRight: 'auto',
            marginBottom: 0,
            marginLeft: 'auto',
          }}
        >
          <View
            style={{
              width: 402,
              height: 224,
              backgroundColor: '#50b498',
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              borderBottomRightRadius: 25,
              borderBottomLeftRadius: 25,
              position: 'absolute',
              top: 0,
              left: -1,
            }}
          >
            <ImageBackground
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                top: 46,
                left: 16,
                zIndex: 4,
              }}
              source={require('../../assets/images/plant.png')}
              resizeMode='cover'
            />
            <Text
              style={{
                display: 'flex',
                width: 125,
                height: 35,
                justifyContent: 'center',
                alignItems: 'flex-start',
                fontFamily: 'M PLUS 1',
                fontSize: 24,
                fontWeight: '400',
                lineHeight: 34.752,
                color: '#ffffff',
                position: 'absolute',
                top: 52,
                left: 76,
                textAlign: 'center',
                zIndex: 5,
              }}
              numberOfLines={1}
            >
              User Name
            </Text>
            <ImageBackground
              style={{
                width: 26,
                height: 15,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
                position: 'absolute',
                top: 65,
                left: 344,
                zIndex: 2,
              }}
              source={require('../../assets/images/plant.png')}
              resizeMode='cover'
            />
          </View>
          <View
            style={{
              width: 402,
              height: 771,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              borderBottomRightRadius: 25,
              borderBottomLeftRadius: 25,
              position: 'absolute',
              top: 103,
              left: 1,
              zIndex: 1,
            }}
          >
            <View
              style={{
                width: 280,
                height: 280,
                position: 'relative',
                zIndex: 19,
                marginTop: 86,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 59,
              }}
            >
              <ImageBackground
                style={{
                  width: 280,
                  height: 280,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 3,
                }}
                source={require('../../assets/images/plant.png')}
                resizeMode='cover'
              />
              <View
                style={{
                  width: 243,
                  height: 243,
                  position: 'absolute',
                  top: 19,
                  left: 17,
                  zIndex: 12,
                }}
              />
              <ImageBackground
                style={{
                  width: 243,
                  height: 243,
                  position: 'absolute',
                  top: 19,
                  left: 19,
                  zIndex: 19,
                }}
                source={require('../../assets/images/plant.png')}
                resizeMode='cover'
              />
            </View>
            <View
              style={{
                display: 'flex',
                width: 355,
                height: 54,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 7,
                marginTop: 39,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 19,
              }}
            >
              <View
                style={{
                  width: 174,
                  height: 54,
                  flexShrink: 0,
                  backgroundColor: '#50b498',
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40,
                  borderBottomRightRadius: 40,
                  borderBottomLeftRadius: 40,
                  position: 'relative',
                  zIndex: 6,
                }}
              >
                <Text
                  style={{
                    display: 'flex',
                    height: 24,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    fontFamily: 'Inter',
                    fontSize: 20,
                    fontWeight: '400',
                    lineHeight: 24,
                    color: '#ffffff',
                    position: 'absolute',
                    top: 15,
                    left: 58,
                    textAlign: 'left',
                    zIndex: 9,
                  }}
                  numberOfLines={1}
                >
                  Tasks
                </Text>
              </View>
              <View
                style={{
                  width: 174,
                  height: 54,
                  flexShrink: 0,
                  backgroundColor: '#e9e9f9',
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40,
                  borderBottomRightRadius: 40,
                  borderBottomLeftRadius: 40,
                  position: 'relative',
                  zIndex: 7,
                }}
              >
                <Text
                  style={{
                    display: 'flex',
                    height: 24,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    fontFamily: 'Inter',
                    fontSize: 20,
                    fontWeight: '400',
                    lineHeight: 24,
                    color: '#50b498',
                    position: 'absolute',
                    top: 15,
                    left: 44,
                    textAlign: 'left',
                    zIndex: 11,
                  }}
                  numberOfLines={1}
                >
                  Diseases
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 361,
                height: 106,
                backgroundColor: '#e9e9f9',
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                borderBottomRightRadius: 40,
                borderBottomLeftRadius: 40,
                position: 'relative',
                zIndex: 10,
                marginTop: 18,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 17,
              }}
            >
              <Text
                style={{
                  display: 'flex',
                  height: 22,
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  fontFamily: 'Inter',
                  fontSize: 20,
                  fontWeight: '400',
                  lineHeight: 22,
                  color: '#1a5d5d',
                  position: 'absolute',
                  top: 21,
                  left: 22,
                  textAlign: 'left',
                  zIndex: 10,
                }}
                numberOfLines={1}
              >
                Task Name
              </Text>
            </View>
            <BottomBar/>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}
