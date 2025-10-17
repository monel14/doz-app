import * as YoutubeApi from 'youtube-search-api';

class YouTubeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Rechercher des vidéos sur YouTube
  async searchVideos(query, maxResults = 20) {
    try {
      console.log('🔍 Recherche YouTube:', query);
      
      // Vérifier le cache
      const cacheKey = `search_${query}_${maxResults}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📦 Résultats depuis le cache');
          return cached.data;
        }
      }

      // Recherche avec youtube-search-api
      const searchResults = await YoutubeApi.GetListByKeyword(query, false, maxResults);
      
      if (!searchResults || !searchResults.items) {
        throw new Error('Aucun résultat trouvé');
      }

      const videos = searchResults.items.map(item => ({
        videoId: item.id,
        title: item.title,
        description: item.description || '',
        channelTitle: item.channelTitle,
        channelId: item.channelId,
        publishedAt: item.publishedAt,
        duration: item.length?.simpleText || 'Durée inconnue',
        viewCount: item.viewCount?.text || '0 vues',
        thumbnails: [
          { 
            url: item.thumbnail?.thumbnails?.[0]?.url || '', 
            width: item.thumbnail?.thumbnails?.[0]?.width || 120, 
            height: item.thumbnail?.thumbnails?.[0]?.height || 90 
          },
          { 
            url: item.thumbnail?.thumbnails?.[1]?.url || '', 
            width: item.thumbnail?.thumbnails?.[1]?.width || 320, 
            height: item.thumbnail?.thumbnails?.[1]?.height || 180 
          },
          { 
            url: item.thumbnail?.thumbnails?.[2]?.url || '', 
            width: item.thumbnail?.thumbnails?.[2]?.width || 480, 
            height: item.thumbnail?.thumbnails?.[2]?.height || 360 
          }
        ],
        url: `https://www.youtube.com/watch?v=${item.id}`,
        isLive: item.isLive || false
      }));

      // Mettre en cache
      this.cache.set(cacheKey, {
        data: videos,
        timestamp: Date.now()
      });

      console.log(`✅ Trouvé ${videos.length} vidéos`);
      return videos;

    } catch (error) {
      console.error('❌ Erreur recherche YouTube:', error);
      
      // Fallback avec des données de test
      console.log('🔄 Utilisation du fallback pour:', query);
      return this.getFallbackData(query);
    }
  }

  // Obtenir les détails d'une vidéo spécifique
  async getVideoDetails(videoId) {
    try {
      console.log('📹 Détails vidéo:', videoId);
      
      const cacheKey = `video_${videoId}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Obtenir les détails avec youtube-search-api
      const videoDetails = await YoutubeApi.GetVideoDetails(videoId);
      
      if (!videoDetails) {
        throw new Error('Vidéo non trouvée');
      }

      const details = {
        videoId: videoDetails.id,
        title: videoDetails.title,
        description: videoDetails.description || '',
        channelTitle: videoDetails.channelTitle,
        channelId: videoDetails.channelId,
        publishedAt: videoDetails.publishedAt,
        duration: videoDetails.length?.simpleText || 'Durée inconnue',
        viewCount: videoDetails.viewCount || '0 vues',
        likeCount: videoDetails.likeCount || '0',
        thumbnails: [
          { 
            url: videoDetails.thumbnail?.thumbnails?.[0]?.url || '', 
            width: videoDetails.thumbnail?.thumbnails?.[0]?.width || 120, 
            height: videoDetails.thumbnail?.thumbnails?.[0]?.height || 90 
          },
          { 
            url: videoDetails.thumbnail?.thumbnails?.[1]?.url || '', 
            width: videoDetails.thumbnail?.thumbnails?.[1]?.width || 320, 
            height: videoDetails.thumbnail?.thumbnails?.[1]?.height || 180 
          },
          { 
            url: videoDetails.thumbnail?.thumbnails?.[2]?.url || '', 
            width: videoDetails.thumbnail?.thumbnails?.[2]?.width || 480, 
            height: videoDetails.thumbnail?.thumbnails?.[2]?.height || 360 
          }
        ],
        url: `https://www.youtube.com/watch?v=${videoDetails.id}`,
        isLive: videoDetails.isLive || false
      };

      this.cache.set(cacheKey, {
        data: details,
        timestamp: Date.now()
      });

      return details;

    } catch (error) {
      console.error('❌ Erreur détails vidéo:', error);
      
      // Fallback
      return {
        videoId,
        title: 'Vidéo YouTube',
        description: 'Détails non disponibles',
        channelTitle: 'Chaîne inconnue',
        duration: '0:00',
        viewCount: '0 vues',
        thumbnails: [
          { url: 'https://picsum.photos/320/180?random=404', width: 320, height: 180 }
        ],
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    }
  }

  // Obtenir les vidéos populaires/tendances
  async getTrendingVideos(maxResults = 20) {
    try {
      console.log('🔥 Récupération des tendances');
      
      // Utiliser des termes populaires pour simuler les tendances
      const trendingQueries = [
        'music 2024',
        'top hits 2024',
        'popular songs',
        'trending music',
        'new music 2024',
        'viral songs'
      ];
      
      const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
      const results = await this.searchVideos(randomQuery, maxResults);
      
      console.log(`✅ Trouvé ${results.length} vidéos populaires`);
      return results;

    } catch (error) {
      console.error('❌ Erreur tendances:', error);
      return this.getFallbackData('trending music');
    }
  }

  // Rechercher des playlists
  async searchPlaylists(query, maxResults = 10) {
    try {
      console.log('🎵 Recherche playlists:', query);
      
      // youtube-search-api peut aussi chercher des playlists
      const searchResults = await YoutubeApi.GetPlaylistData(query, maxResults);
      
      if (!searchResults || !searchResults.items) {
        return [];
      }

      const playlists = searchResults.items.map(item => ({
        playlistId: item.id,
        title: item.title,
        description: item.description || '',
        channelTitle: item.channelTitle,
        videoCount: item.videoCount || 0,
        thumbnails: [
          { 
            url: item.thumbnail?.thumbnails?.[0]?.url || '', 
            width: item.thumbnail?.thumbnails?.[0]?.width || 320, 
            height: item.thumbnail?.thumbnails?.[0]?.height || 180 
          }
        ],
        url: `https://www.youtube.com/playlist?list=${item.id}`
      }));

      console.log(`✅ Trouvé ${playlists.length} playlists`);
      return playlists;

    } catch (error) {
      console.error('❌ Erreur recherche playlists:', error);
      return [];
    }
  }

  // Données de fallback si l'API échoue
  getFallbackData(query) {
    console.log('📦 Utilisation des données de fallback pour:', query);
    
    return [
      {
        videoId: 'dQw4w9WgXcQ',
        title: `Résultat pour "${query}" - Demo 1`,
        description: 'Données de démonstration - YouTube API temporairement indisponible',
        channelTitle: 'Demo Channel',
        duration: '3:32',
        viewCount: '1.2M vues',
        thumbnails: [
          { url: 'https://picsum.photos/320/180?random=1', width: 320, height: 180 }
        ],
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        videoId: 'jNQXAC9IVRw',
        title: `Résultat pour "${query}" - Demo 2`,
        description: 'Données de démonstration - YouTube API temporairement indisponible',
        channelTitle: 'Demo Channel',
        duration: '4:15',
        viewCount: '850K vues',
        thumbnails: [
          { url: 'https://picsum.photos/320/180?random=2', width: 320, height: 180 }
        ],
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
      },
      {
        videoId: 'L_jWHffIx5E',
        title: `Résultat pour "${query}" - Demo 3`,
        description: 'Données de démonstration - YouTube API temporairement indisponible',
        channelTitle: 'Demo Channel',
        duration: '2:48',
        viewCount: '2.1M vues',
        thumbnails: [
          { url: 'https://picsum.photos/320/180?random=3', width: 320, height: 180 }
        ],
        url: 'https://www.youtube.com/watch?v=L_jWHffIx5E'
      }
    ];
  }

  // Générer une URL de streaming (placeholder)
  getStreamUrl(videoId) {
    return {
      audio_url: `https://www.youtube.com/watch?v=${videoId}`,
      title: 'Streaming YouTube',
      note: 'URL YouTube directe - Interface fonctionnelle',
      format: 'youtube_direct',
      cached: false,
      videoId: videoId
    };
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache YouTube vidé');
  }

  // Stats du cache
  getCacheStats() {
    return {
      entries: this.cache.size,
      timeout: this.cacheTimeout / 1000 / 60 // en minutes
    };
  }
}

// Instance singleton
const youtubeService = new YouTubeService();
export default youtubeService;