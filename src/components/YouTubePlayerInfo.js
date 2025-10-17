import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const YouTubePlayerInfo = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="musical-notes" size={16} color="#1DB954" />
      <Text style={styles.infoText}>YouTube Mobile Player</Text>
      <View style={styles.statusDot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 8,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1DB954',
  },
});

export default YouTubePlayerInfo;