import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const YouTubePlayerInfo = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <TouchableOpacity 
        style={styles.infoButton}
        onPress={() => setShowInfo(true)}
      >
        <Ionicons name="information-circle" size={24} color="#1DB954" />
      </TouchableOpacity>

      <Modal
        visible={showInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🎵 YouTube Player</Text>
            <TouchableOpacity onPress={() => setShowInfo(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Fonctionnalités Actives</Text>
              <Text style={styles.text}>• Recherche YouTube en temps réel</Text>
              <Text style={styles.text}>• Lecture audio directe via YouTube Player API</Text>
              <Text style={styles.text}>• Contrôles de lecture (play/pause/seek)</Text>
              <Text style={styles.text}>• Contrôle du volume</Text>
              <Text style={styles.text}>• Interface utilisateur complète</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎬 Comment ça marche</Text>
              <Text style={styles.text}>
                L'application utilise l'API YouTube Player officielle pour lire 
                l'audio des vidéos YouTube directement dans le navigateur.
              </Text>
              <Text style={styles.text}>
                Le lecteur YouTube est caché (1x1 pixel) et seuls les contrôles 
                audio sont exposés dans l'interface.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Contrôles Disponibles</Text>
              <Text style={styles.text}>• ▶️ Play/Pause - Lecture et pause</Text>
              <Text style={styles.text}>• ⏪ -10s - Reculer de 10 secondes</Text>
              <Text style={styles.text}>• ⏩ +10s - Avancer de 10 secondes</Text>
              <Text style={styles.text}>• 🔉 Volume - - Diminuer le volume</Text>
              <Text style={styles.text}>• 🔊 Volume + - Augmenter le volume</Text>
              <Text style={styles.text}>• 🔄 Restart - Recommencer depuis le début</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Limitations</Text>
              <Text style={styles.text}>
                • Fonctionne uniquement sur le web (pas sur mobile natif)
              </Text>
              <Text style={styles.text}>
                • Nécessite une connexion internet
              </Text>
              <Text style={styles.text}>
                • Soumis aux politiques de YouTube
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 Avantages</Text>
              <Text style={styles.text}>• Aucun backend nécessaire</Text>
              <Text style={styles.text}>• Lecture audio de qualité YouTube</Text>
              <Text style={styles.text}>• Intégration native avec YouTube</Text>
              <Text style={styles.text}>• Respect des droits d'auteur</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  infoButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  modalContainer: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
});

export default YouTubePlayerInfo;