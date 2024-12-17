import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Header({ title, onBackPress, showBackButton = false }) {
  return (
    <View>
      {showBackButton && (
        <TouchableOpacity  onPress={onBackPress}>
          <Text>{"<"}</Text>
        </TouchableOpacity>
      )}
      <Text >{title}</Text>
    </View>
  );
}
;
