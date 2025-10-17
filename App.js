import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MusicApp from './src/components/MusicApp';
import YouTubePlayerLoader from './src/components/YouTubePlayerLoader';

export default function App() {
  return (
    <View style={styles.container}>
      <YouTubePlayerLoader>
        <MusicApp />
      </YouTubePlayerLoader>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
