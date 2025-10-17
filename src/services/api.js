import youtubeService from './youtubeService';

// Service API unifié qui utilise YouTube directement
export const musicAPI = {
  // Rechercher de la musique
  searchMusic: async (query, filter = 'songs', limit = 20) => {
    try {
      const results = await youtubeService.searchVideos(query, limit);
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  },

  // Obtenir les informations d'une chanson
  getSongInfo: async (videoId) => {
    try {
      const songInfo = await youtubeService.getVideoDetails(videoId);
      return songInfo;
    } catch (error) {
      console.error('Erreur lors de la récupération de la chanson:', error);
      throw error;
    }
  },

  // Obtenir les charts (tendances)
  getCharts: async () => {
    try {
      const charts = await youtubeService.getTrendingVideos(20);
      return { results: charts };
    } catch (error) {
      console.error('Erreur lors de la récupération des charts:', error);
      throw error;
    }
  },

  // Obtenir une playlist
  getPlaylist: async (playlistId) => {
    try {
      // Pour l'instant, on retourne une playlist vide
      // Il faudrait implémenter la récupération des vidéos d'une playlist
      return {
        playlistId,
        title: 'Playlist',
        videos: []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la playlist:', error);
      throw error;
    }
  },

  // Obtenir l'URL de streaming audio (YouTube Player API uniquement)
  getStreamUrl: async (videoId) => {
    try {
      // Utiliser YouTube Player API directement
      const streamData = youtubeService.getStreamUrl(videoId);
      return {
        ...streamData,
        source: 'youtube-player-api',
        note: 'Utilise YouTube Player API pour la lecture directe'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL audio:', error);
      throw error;
    }
  },

  // Obtenir l'URL de téléchargement direct
  getDownloadUrl: (videoId) => {
    return `https://www.youtube.com/watch?v=${videoId}`;
  },

  // Rechercher des playlists
  searchPlaylists: async (query, limit = 10) => {
    try {
      const playlists = await youtubeService.searchPlaylists(query, limit);
      return playlists;
    } catch (error) {
      console.error('Erreur lors de la recherche de playlists:', error);
      throw error;
    }
  }
};

export default youtubeService;