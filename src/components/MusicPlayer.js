import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

const MusicPlayer = ({ song, onClose }) => {
  const youtubeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Réinitialiser quand la chanson change
  useEffect(() => {
    if (!song) return;

    console.log('🎵 Nouvelle chanson:', song.title, song.videoId);

    setIsPlaying(false);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      setIsPlaying(false);
      setIsReady(false);
    };
  }, [song?.videoId]);

  // Callbacks YouTube
  const onReady = useCallback(() => {
    console.log('✅ YouTube Player prêt');
    setIsReady(true);
  }, []);

  const onStateChange = useCallback((state) => {
    console.log('🎵 État YouTube:', state);

    if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsPlaying(false);
    }
  }, []);

  const onProgress = useCallback((data) => {
    setCurrentTime(data.currentTime);
    setDuration(data.duration);
  }, []);

  const onError = useCallback((error) => {
    console.error('❌ Erreur YouTube:', error);
    Alert.alert('Erreur', 'Impossible de lire cette vidéo');
  }, []);

  // Toggle Play/Pause - on change juste l'état, le composant gère le reste
  const togglePlayPause = useCallback(() => {
    if (!song?.videoId || !isReady) {
      console.log('⚠️ Player pas prêt');
      return;
    }

    const newState = !isPlaying;
    console.log(newState ? '▶️ Play' : '⏸️ Pause');
    setIsPlaying(newState);
  }, [song?.videoId, isPlaying, isReady]);

  // Seek - on met à jour le temps, le composant gère le reste
  const seekBy = useCallback((seconds) => {
    if (!isReady || !duration) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    console.log('⏭️ Seek vers:', newTime);
    setCurrentTime(newTime);
  }, [currentTime, duration, isReady]);

  // Format temps
  const formatTime = (seconds) => {
    const total = Math.floor(seconds || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.noSongText}>Aucune chanson sélectionnée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>En cours de lecture</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CONTENU */}
      <View style={styles.content}>
        {/* YouTube Player caché (audio seulement) */}
        {song.videoId && (
          <View style={styles.hiddenPlayer}>
            <YoutubePlayer
              ref={youtubeRef}
              height={200}
              width={300}
              videoId={song.videoId}
              play={isPlaying}
              onReady={onReady}
              onChangeState={onStateChange}
              onProgress={onProgress}
              onError={onError}
              volume={100}
              playbackRate={1}
              webViewStyle={{ opacity: 0 }}
              initialPlayerParams={{
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                preventFullScreen: true,
              }}
            />
          </View>
        )}

        {/* Album Art */}
        <Image
          source={{ uri: song?.thumbnails?.[0]?.url }}
          style={styles.albumArt}
        />

        {/* Titre et Artiste */}
        <Text style={styles.songTitle} numberOfLines={2}>
          {song?.title || 'Titre inconnu'}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {song?.channelTitle || 'Artiste inconnu'}
        </Text>

        {/* Debug Info */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Ready: {isReady ? '✅' : '❌'} | Playing: {isPlaying ? '▶️' : '⏸️'} | {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        )}

        {/* Barre de progression */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${duration ? (currentTime / duration) * 100 : 0}%` }
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Contrôles */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => seekBy(-10)}
            style={styles.controlButton}
            disabled={!isReady}
          >
            <Ionicons name="play-skip-back" size={30} color={isReady ? "#fff" : "#666"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={[styles.playButton, !isReady && styles.playButtonDisabled]}
            disabled={!isReady}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color={isReady ? "#000" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => seekBy(10)}
            style={styles.controlButton}
            disabled={!isReady}
          >
            <Ionicons name="play-skip-forward" size={30} color={isReady ? "#fff" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  hiddenPlayer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 300,
    height: 200,
    opacity: 0.05,
    zIndex: 1000,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 10,
    marginBottom: 40,
    backgroundColor: '#282828',
  },
  songTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  debugInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButtonDisabled: {
    backgroundColor: '#404040',
  },
  noSongText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MusicPlayer;
