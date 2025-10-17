import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { musicAPI } from '../services/api';
import { testAPI } from '../utils/apiTest';
import audioCache from '../services/audioCache';
import MusicPlayer from './MusicPlayer';
import PlaylistManager from './PlaylistManager';
import YouTubePlayerInfo from './YouTubePlayerInfo';

const MusicApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showPlaylists, setShowPlaylists] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await musicAPI.searchMusic(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher la musique');
    } finally {
      setLoading(false);
    }
  };

  const handleSongSelect = (song) => {
    setCurrentSong(song);
  };

  const testAPIConnection = async () => {
    Alert.alert(
      'Test YouTube',
      'Quel test voulez-vous effectuer ?',
      [
        {
          text: 'Connexion', onPress: async () => {
            const result = await testAPI.testConnection();
            Alert.alert(
              result.success ? 'Succès' : 'Erreur',
              result.success ? 'YouTube connecté !' : result.error
            );
          }
        },
        {
          text: 'Recherche', onPress: async () => {
            const result = await testAPI.testSearch('music');
            Alert.alert(
              result.success ? 'Succès' : 'Erreur',
              result.success ? `${result.data?.length || 0} résultats trouvés` : result.error
            );
          }
        },
        {
          text: 'Détails vidéo', onPress: async () => {
            const result = await testAPI.testVideoDetails();
            Alert.alert(
              result.success ? 'Succès' : 'Erreur',
              result.success ? `Vidéo: ${result.data?.title || 'Inconnue'}` : result.error
            );
          }
        },
        { text: 'Cache', onPress: showCacheStats },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const showCacheStats = async () => {
    const stats = await audioCache.getCacheStats();
    Alert.alert(
      '📊 Cache Audio',
      `Fichiers: ${stats.fileCount}\nTaille: ${stats.totalSizeMB}MB / ${stats.maxSizeMB}MB\nDossier: ${stats.cacheDir}`,
      [
        {
          text: 'Vider le cache', onPress: async () => {
            const cleared = await audioCache.clearCache();
            Alert.alert(cleared ? 'Succès' : 'Erreur', cleared ? 'Cache vidé !' : 'Erreur lors du vidage');
          }, style: 'destructive'
        },
        { text: 'OK' }
      ]
    );
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongSelect(item)}
    >
      <Image
        source={{ uri: item.thumbnails?.[0]?.url }}
        style={styles.thumbnail}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.channelTitle || item.artists?.[0]?.name || 'Artiste inconnu'}
        </Text>
      </View>
      <Ionicons name="play-circle" size={24} color="#1DB954" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* YouTube Player Info */}
      <YouTubePlayerInfo />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={testAPIConnection}>
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Music Streaming</Text>
        <TouchableOpacity onPress={() => setShowPlaylists(true)}>
          <Ionicons name="list" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher de la musique..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={searchResults}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.videoId}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Music Player */}
      {currentSong && (
        <View style={styles.playerOverlay}>
          <MusicPlayer
            song={currentSong}
            onClose={() => setCurrentSong(null)}
          />
        </View>
      )}

      {/* Playlist Manager */}
      <PlaylistManager
        visible={showPlaylists}
        onClose={() => setShowPlaylists(false)}
        onSelectSong={handleSongSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1DB954',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#282828',
    borderRadius: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  playerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

export default MusicApp;