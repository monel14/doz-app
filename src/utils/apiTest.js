import { musicAPI } from '../services/api';
import youtubeService from '../services/youtubeService';

export const testAPI = {
  // Test de santé YouTube
  testHealth: async () => {
    try {
      console.log('🔍 Test de santé YouTube...');
      const results = await youtubeService.searchVideos('test', 1);
      console.log('✅ YouTube accessible');
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Erreur de santé YouTube:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de connexion (recherche simple)
  testConnection: async () => {
    try {
      console.log('🔍 Test de connexion YouTube...');
      const charts = await musicAPI.getCharts();
      console.log('✅ YouTube connecté avec succès');
      return { success: true, data: charts };
    } catch (error) {
      console.error('❌ Erreur de connexion YouTube:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de recherche
  testSearch: async (query = 'music') => {
    try {
      console.log(`🔍 Test de recherche: "${query}"`);
      const results = await musicAPI.searchMusic(query, 'songs', 5);
      console.log('✅ Recherche réussie:', results?.length || 0, 'résultats');
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de streaming pour un videoId spécifique
  testStream: async (videoId) => {
    try {
      console.log(`🔍 Test de streaming pour: ${videoId}`);
      const streamData = await musicAPI.getStreamUrl(videoId);
      console.log('✅ Stream obtenu:', streamData?.audio_url ? 'URL disponible' : 'Pas d\'URL');
      return { success: true, data: streamData };
    } catch (error) {
      console.error('❌ Erreur de streaming:', error);
      return { success: false, error: error.message };
    }
  },

  // Test des détails d'une vidéo
  testVideoDetails: async (videoId = 'dQw4w9WgXcQ') => {
    try {
      console.log(`🔍 Test détails vidéo: ${videoId}`);
      const details = await musicAPI.getSongInfo(videoId);
      console.log('✅ Détails obtenus:', details?.title || 'Pas de titre');
      return { success: true, data: details };
    } catch (error) {
      console.error('❌ Erreur détails vidéo:', error);
      return { success: false, error: error.message };
    }
  }
};