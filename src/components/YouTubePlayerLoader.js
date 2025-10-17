import React from 'react';
import { View } from 'react-native';

const YouTubePlayerLoader = ({ children }) => {
  // Simple wrapper component for now
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

export default YouTubePlayerLoader;