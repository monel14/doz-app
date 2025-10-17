import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.133:5000'; // API locale

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const musicAPI = {
  // Rechercher de la musique
  searchMusic: async (query, filter = 'songs', limit = 20) => {
    try {
      const response = await api.post('/search', {
        query,
        filter,
        limit
      });
      return response.data.results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  },

  // Obtenir les informations d'une chanson
  getSongInfo: async (videoId) => {
    try {
      const response = await api.get(`/song/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la chanson:', error);
      throw error;
    }
  },

  // Obtenir les charts
  getCharts: async () => {
    try {
      const response = await api.get('/charts');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des charts:', error);
      throw error;
    }
  },

  // Obtenir une playlist
  getPlaylist: async (playlistId) => {
    try {
      const response = await api.post('/playlist', {
        playlist_id: playlistId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la playlist:', error);
      throw error;
    }
  },

  // Obtenir l'URL de streaming audio
  getStreamUrl: async (videoId) => {
    try {
      const response = await api.get(`/stream/${videoId}`);
      return response.data; // Retourne l'objet complet avec audio_url, title, etc.
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL audio:', error);

      // Gestion spécifique des erreurs d'extraction
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('extraction')) {
        throw new Error('Impossible d\'extraire l\'audio pour cette vidéo. Essayez une autre chanson.');
      }

      throw error;
    }
  },

  // Obtenir l'URL de téléchargement direct
  getDownloadUrl: (videoId) => {
    return `${API_BASE_URL}/download/${videoId}`;
  }
};

export default api;