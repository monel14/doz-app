import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaylistManager = ({ visible, onClose, onSelectSong }) => {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const savedPlaylists = await AsyncStorage.getItem('playlists');
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      }
    } catch (error) {
      console.error('Erreur chargement playlists:', error);
    }
  };

  const savePlaylists = async (updatedPlaylists) => {
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Erreur sauvegarde playlists:', error);
    }
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de playlist');
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: new Date().toISOString()
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    savePlaylists(updatedPlaylists);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const deletePlaylist = (playlistId) => {
    Alert.alert(
      'Supprimer la playlist',
      'Êtes-vous sûr de vouloir supprimer cette playlist ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
            savePlaylists(updatedPlaylists);
            if (currentPlaylist?.id === playlistId) {
              setCurrentPlaylist(null);
            }
          }
        }
      ]
    );
  };

  const addSongToPlaylist = async (song, playlistId) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const songExists = playlist.songs.some(s => s.videoId === song.videoId);
        if (!songExists) {
          return {
            ...playlist,
            songs: [...playlist.songs, song]
          };
        }
      }
      return playlist;
    });
    
    savePlaylists(updatedPlaylists);
    Alert.alert('Succès', 'Chanson ajoutée à la playlist');
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => setCurrentPlaylist(item)}
    >
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songs.length} chansons</Text>
      </View>
      <TouchableOpacity
        onPress={() => deletePlaylist(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => onSelectSong(item)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artists?.[0]?.name || 'Artiste inconnu'}
        </Text>
      </View>
      <Ionicons name="play-circle" size={24} color="#1DB954" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentPlaylist ? currentPlaylist.name : 'Mes Playlists'}
          </Text>
          {currentPlaylist ? (
            <TouchableOpacity onPress={() => setCurrentPlaylist(null)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {currentPlaylist ? (
          <FlatList
            data={currentPlaylist.songs}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.videoId}
            style={styles.list}
          />
        ) : (
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}

        {/* Modal de création de playlist */}
        <Modal visible={showCreateModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nouvelle Playlist</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom de la playlist"
                placeholderTextColor="#666"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={createPlaylist}
                >
                  <Text style={styles.buttonText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  songCount: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#282828',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#404040',
    color: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  createButton: {
    backgroundColor: '#1DB954',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PlaylistManager;