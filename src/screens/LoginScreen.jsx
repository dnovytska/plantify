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
            fontSize: 0,
            backgroundColor: '#ffffff',
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
          <Text
            style={{
              display: 'flex',
              width: 325,
              height: 137,
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'Michroma',
              fontSize: 96,
              fontWeight: '400',
              lineHeight: 136.5,
              color: '#2f2182',
              position: 'relative',
              textAlign: 'center',
              zIndex: 2,
              marginTop: 92,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 39,
            }}
            numberOfLines={1}
          >
            Login
          </Text>
          <Text
            style={{
              display: 'flex',
              width: 121,
              height: 51,
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'Michroma',
              fontSize: 36,
              fontWeight: '400',
              lineHeight: 51,
              color: '#1a5d5d',
              position: 'relative',
              textAlign: 'center',
              zIndex: 4,
              marginTop: 51,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 36,
            }}
            numberOfLines={1}
          >
            Email
          </Text>
          <View
            style={{
              width: 347,
              height: 60,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderBottomRightRadius: 40,
              borderBottomLeftRadius: 40,
              borderWidth: 3,
              borderColor: '#1a5d5d',
              borderStyle: 'solid',
              position: 'relative',
              zIndex: 5,
              marginTop: 9,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 26,
            }}
          />
          <Text
            style={{
              display: 'flex',
              width: 231,
              height: 51,
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'Michroma',
              fontSize: 36,
              fontWeight: '400',
              lineHeight: 51,
              color: '#1a5d5d',
              position: 'relative',
              textAlign: 'center',
              zIndex: 6,
              marginTop: 31,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 36,
            }}
            numberOfLines={1}
          >
            Password
          </Text>
          <View
            style={{
              width: 347,
              height: 60,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderBottomRightRadius: 40,
              borderBottomLeftRadius: 40,
              borderWidth: 3,
              borderColor: '#1a5d5d',
              borderStyle: 'solid',
              position: 'relative',
              zIndex: 7,
              marginTop: 9,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 26,
            }}
          />
          <View
            style={{
              width: 170,
              height: 56,
              backgroundColor: '#8c9bdf',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderBottomRightRadius: 40,
              borderBottomLeftRadius: 40,
              position: 'relative',
              zIndex: 8,
              marginTop: 190,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 116,
            }}
          >
            <Text
              style={{
                display: 'flex',
                width: 82,
                height: 34,
                justifyContent: 'center',
                alignItems: 'flex-start',
                fontFamily: 'Michroma',
                fontSize: 24,
                fontWeight: '400',
                lineHeight: 34,
                color: '#ffffff',
                position: 'absolute',
                top: 9,
                left: 45,
                textAlign: 'center',
                zIndex: 9,
              }}
              numberOfLines={1}
            >
              Login
            </Text>
          </View>
          <Text
            style={{
              display: 'flex',
              width: 327,
              height: 23,
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'Michroma',
              fontSize: 16,
              fontWeight: '400',
              lineHeight: 22.75,
              color: '#2f2182',
              position: 'relative',
              textAlign: 'center',
              zIndex: 11,
              marginTop: 10,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 37,
            }}
            numberOfLines={1}
          >
            Don’t have an account? Sign Up
          </Text>
          <ImageBackground
            style={{
              width: 717.308,
              height: 747.731,
              position: 'absolute',
              top: -288,
              left: 0,
            }}
            source={require('../../assets/images/leafs-login.png')}
            resizeMode='cover'
          />
          <ImageBackground
            style={{
              width: 402,
              height: 460,
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
            source={require('../../assets/images/leafs-login.png')}
            resizeMode='cover'
          />
          <ImageBackground
            style={{
              width: 191.96,
              height: 191.96,
              position: 'absolute',
              top: 541.235,
              left: -90.765,
              zIndex: 3,
            }}
            source={require('../../assets/images/leafs-login.png')}
            resizeMode='cover'
          />
          <Text
            style={{
              display: 'flex',
              width: 191,
              height: 23,
              justifyContent: 'center',
              alignItems: 'flex-start',
              fontFamily: 'Michroma',
              fontSize: 16,
              fontWeight: '400',
              lineHeight: 22.75,
              color: '#2f2182',
              position: 'absolute',
              top: 568,
              left: 171,
              textAlign: 'center',
              zIndex: 10,
            }}
            numberOfLines={1}
          >
            Forget Password?
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
