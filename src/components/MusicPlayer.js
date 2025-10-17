import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import youtubePlayer from '../services/youtubePlayer';

const { width, height } = Dimensions.get('window');

const MusicPlayer = ({ song, onClose, visible }) => {
  const [rotation] = useState(new Animated.Value(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(240);
  const [audioSource, setAudioSource] = useState(null);

  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  const currentPlaying = Platform.OS === 'web' ? isPlaying : (status.playing || false);
  const currentPosition = Platform.OS === 'web' ? position : (status.currentTime || 0);
  const currentDuration = Platform.OS === 'web' ? duration : (status.duration || 0);

  useEffect(() => {
    if (currentPlaying) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation();
    }
  }, [currentPlaying]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const togglePlayPause = () => {
    if (Platform.OS === 'web') {
      if (isPlaying) {
        youtubePlayer.pause();
        setIsPlaying(false);
      } else {
        youtubePlayer.play();
        setIsPlaying(true);
      }
    } else {
      if (!player) return;
      if (status.playing) player.pause();
      else player.play();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <LinearGradient
        colors={['#121212', '#1a1a1a', '#000']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>En cours de lecture</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Album Art */}
        <View style={styles.centerSection}>
          <Animated.Image
            source={{ uri: song.thumbnails?.[0]?.url }}
            style={[styles.albumArt, { transform: [{ rotate }] }]}
          />
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {song.channelTitle || song.artists?.[0]?.name || 'Artiste inconnu'}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(currentPosition / currentDuration) * 100}%` }]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(currentDuration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="play-skip-back" size={32} color="#b3b3b3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Ionicons name={currentPlaying ? 'pause' : 'play'} size={44} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="play-skip-forward" size={32} color="#b3b3b3" />
          </TouchableOpacity>
        </View>

        {/* Volume */}
        <View style={styles.volume}>
          <Ionicons name="volume-medium" size={20} color="#1DB954" />
          <Text style={styles.volumeText}>75%</Text>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  centerSection: {
    alignItems: 'center',
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    marginBottom: 20,
  },
  songTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#1DB954',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volume: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  volumeText: {
    color: '#1DB954',
    fontSize: 14,
  },
});

export default MusicPlayer;
