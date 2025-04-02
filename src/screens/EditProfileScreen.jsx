/**
 * Codia React Native App
 * https://codia.ai
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function App() {
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
            backgroundColor: '#50b498',
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
              width: 452.848,
              height: 286.791,
              position: 'relative',
              zIndex: 10,
              marginTop: 716,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 74,
            }}
          >
            <ImageBackground
              style={{
                width: 185,
                height: 154,
                position: 'absolute',
                top: 0,
                left: 143,
                zIndex: 10,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <ImageBackground
              style={{
                width: 309.848,
                height: 282.791,
                position: 'absolute',
                top: 4,
                left: 143,
                zIndex: 8,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <View
              style={{
                width: 254,
                height: 73,
                backgroundColor: '#50b498',
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
                borderBottomRightRadius: 50,
                borderBottomLeftRadius: 50,
                borderWidth: 2,
                borderColor: '#1a5d5d',
                borderStyle: 'solid',
                position: 'absolute',
                top: 28,
                left: 0,
                zIndex: 2,
              }}
            >
              <Text
                style={{
                  display: 'flex',
                  width: 211,
                  height: 52,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  fontFamily: 'M PLUS 1',
                  fontSize: 36,
                  fontWeight: '400',
                  lineHeight: 52,
                  color: '#1a5d5d',
                  position: 'absolute',
                  top: 5,
                  left: 20,
                  textAlign: 'center',
                  zIndex: 6,
                }}
                numberOfLines={1}
              >
                Registrar-se
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 412,
              height: 725,
              position: 'absolute',
              top: 0,
              left: -3,
              zIndex: 17,
            }}
          >
            <ImageBackground
              style={{
                width: 135,
                height: 173,
                position: 'absolute',
                top: 0,
                left: 3,
                zIndex: 11,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <ImageBackground
              style={{
                width: 146,
                height: 130,
                position: 'absolute',
                top: 0,
                left: 266,
                zIndex: 12,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <ImageBackground
              style={{
                width: 290,
                height: 290,
                position: 'absolute',
                top: 135,
                left: 67,
                zIndex: 17,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            >
              <ImageBackground
                style={{
                  position: 'relative',
                  zIndex: 16,
                  marginTop: 49,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 17,
                }}
                source={require('../../assets/images/camera.png')}
                resizeMode='cover'
              />
            </ImageBackground>
            <ImageBackground
              style={{
                width: 126,
                height: 238,
                position: 'absolute',
                top: 306,
                left: 286,
                zIndex: 13,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <Text
              style={{
                display: 'flex',
                width: 262,
                height: 70,
                justifyContent: 'center',
                alignItems: 'flex-start',
                fontFamily: 'M PLUS 1',
                fontSize: 24,
                fontWeight: '400',
                lineHeight: 34.752,
                color: '#ffffff',
                position: 'absolute',
                top: 423,
                left: 77,
                textAlign: 'center',
                zIndex: 7,
              }}
            >
              Uma frase qualquer apenas porque sim
            </Text>
            <ImageBackground
              style={{
                width: 99,
                height: 195,
                position: 'absolute',
                top: 494,
                left: 0,
                zIndex: 14,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            />
            <View
              style={{
                width: 254,
                height: 73,
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
                borderBottomRightRadius: 50,
                borderBottomLeftRadius: 50,
                borderWidth: 2,
                borderColor: '#1a5d5d',
                borderStyle: 'solid',
                position: 'absolute',
                top: 652,
                left: 77,
                zIndex: 4,
              }}
            >
              <Text
                style={{
                  display: 'flex',
                  width: 96,
                  height: 52,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  fontFamily: 'M PLUS 1',
                  fontSize: 36,
                  fontWeight: '400',
                  lineHeight: 52,
                  color: '#1a5d5d',
                  position: 'absolute',
                  top: 4,
                  left: 77,
                  textAlign: 'center',
                  zIndex: 5,
                }}
                numberOfLines={1}
              >
                Login
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 495.912,
              height: 195.912,
              position: 'absolute',
              top: 486,
              left: 0,
              zIndex: 9,
            }}
          >
            <ImageBackground
              style={{
                width: 195.912,
                height: 195.912,
                position: 'absolute',
                top: 0,
                left: 300,
                zIndex: 9,
              }}
              source={require('../../assets/images/camera.png')}
              resizeMode='cover'
            >
              <ImageBackground
                style={{
                  width: 102,
                  height: 196,
                  position: 'relative',
                  zIndex: 15,
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 7,
                }}
                source={require('../../assets/images/camera.png')}
                resizeMode='cover'
              />
            </ImageBackground>
            <View
              style={{
                width: 402,
                height: 89,
                backgroundColor: '#e9e9f9',
                position: 'absolute',
                top: 17,
                left: 0,
              }}
            >
              <Text
                style={{
                  display: 'flex',
                  width: 237,
                  height: 68,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  fontFamily: 'Michroma',
                  fontSize: 48,
                  fontWeight: '400',
                  lineHeight: 68,
                  color: '#1a5d5d',
                  position: 'absolute',
                  top: 7,
                  left: 90,
                  textAlign: 'center',
                  zIndex: 1,
                }}
                numberOfLines={1}
              >
                Plantify
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
