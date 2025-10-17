import { musicAPI } from '../services/api';

export const testAPI = {
  // Test de santé simple
  testHealth: async () => {
    try {
      console.log('🔍 Test de santé de l\'API...');
      const response = await fetch('http://192.168.1.133:5000/health');
      const data = await response.json();
      console.log('✅ API en bonne santé');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur de santé API:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de base de l'API
  testConnection: async () => {
    try {
      console.log('🔍 Test de connexion à l\'API...');
      const charts = await musicAPI.getCharts();
      console.log('✅ API connectée avec succès');
      return { success: true, data: charts };
    } catch (error) {
      console.error('❌ Erreur de connexion API:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de recherche
  testSearch: async (query = 'test') => {
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
  }
};