import { Platform } from 'react-native';

// Détection de la plateforme pour le cache
const isWeb = Platform.OS === 'web';

// Import conditionnel du FileSystem
let FileSystem = null;
if (!isWeb) {
  try {
    FileSystem = require('expo-file-system/legacy');
  } catch (error) {
    console.log('📁 FileSystem non disponible sur cette plateforme');
  }
}

class AudioCacheService {
  constructor() {
    this.isWebPlatform = isWeb;
    this.webCache = new Map(); // Cache en mémoire pour le web
    
    if (!this.isWebPlatform && FileSystem) {
      this.cacheDir = `${FileSystem.documentDirectory}audioCache/`;
      this.maxCacheSize = 100 * 1024 * 1024; // 100MB max
      this.maxCacheAge = 24 * 60 * 60 * 1000; // 24 heures
      this.initCache();
    } else {
      console.log('📁 Mode web - cache en mémoire activé');
    }
  }

  async initCache() {
    if (this.isWebPlatform) return;
    
    try {
      // Créer le dossier cache (ne fait rien s'il existe déjà)
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      console.log('📁 Cache audio initialisé');
    } catch (error) {
      console.log('📁 Cache déjà existant ou erreur:', error.message);
    }
  }

  // Générer un nom de fichier sécurisé
  getFileName(videoId) {
    return `${videoId.replace(/[^a-zA-Z0-9]/g, '_')}.m4a`;
  }

  // Vérifier si un fichier est en cache et valide
  async isCached(videoId) {
    if (this.isWebPlatform) {
      // Cache web en mémoire
      const cached = this.webCache.get(videoId);
      if (cached && Date.now() - cached.timestamp < (10 * 60 * 1000)) { // 10 min pour le web
        return { 
          cached: true, 
          filePath: cached.url,
          size: 'unknown',
          age: Date.now() - cached.timestamp 
        };
      }
      return { cached: false };
    }

    if (!FileSystem) return { cached: false };

    try {
      const fileName = this.getFileName(videoId);
      const filePath = `${this.cacheDir}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return { cached: false };
      }

      // Vérifier l'âge du fichier
      const fileAge = Date.now() - fileInfo.modificationTime * 1000;
      if (fileAge > this.maxCacheAge) {
        console.log('🗑️ Fichier cache expiré, suppression...');
        await FileSystem.deleteAsync(filePath);
        return { cached: false };
      }

      return { 
        cached: true, 
        filePath,
        size: fileInfo.size,
        age: fileAge 
      };
    } catch (error) {
      console.error('❌ Erreur vérification cache:', error);
      return { cached: false };
    }
  }

  // Télécharger et mettre en cache un fichier audio
  async downloadAndCache(videoId, audioUrl, title = 'Unknown') {
    if (this.isWebPlatform) {
      // Sur web, on met juste l'URL en cache mémoire
      this.webCache.set(videoId, {
        url: audioUrl,
        title,
        timestamp: Date.now()
      });
      
      console.log('✅ Audio mis en cache web:', title);
      return {
        success: true,
        filePath: audioUrl,
        title,
        cached: true,
        size: 'unknown'
      };
    }

    if (!FileSystem) {
      return {
        success: false,
        error: 'FileSystem non disponible'
      };
    }

    try {
      // Valider l'URL
      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error('URL audio invalide');
      }

      const fileName = this.getFileName(videoId);
      const filePath = `${this.cacheDir}${fileName}`;

      console.log('⬇️ Téléchargement audio:', title);
      console.log('🔗 URL:', audioUrl);
      
      // Télécharger le fichier
      const downloadResult = await FileSystem.downloadAsync(audioUrl, filePath);
      
      if (downloadResult.status === 200) {
        console.log('✅ Audio téléchargé et mis en cache:', fileName);
        
        // Nettoyer le cache si nécessaire
        await this.cleanupCache();
        
        return {
          success: true,
          filePath: downloadResult.uri,
          title,
          cached: true,
          size: downloadResult.headers['content-length'] || 'unknown'
        };
      } else {
        throw new Error(`Échec téléchargement: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tester si une URL audio est accessible
  async testAudioUrl(audioUrl) {
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.log('🔍 URL audio non accessible:', error.message);
      return false;
    }
  }

  // Obtenir un fichier audio (depuis le cache ou téléchargement)
  async getAudioFile(videoId, audioUrl, title = 'Unknown') {
    try {
      // Vérifier le cache d'abord
      const cacheCheck = await this.isCached(videoId);
      
      if (cacheCheck.cached) {
        console.log('🎵 Audio trouvé en cache:', title);
        return {
          success: true,
          filePath: cacheCheck.filePath,
          title,
          cached: true,
          fromCache: true,
          size: cacheCheck.size,
          age: Math.round(cacheCheck.age / 1000 / 60) // en minutes
        };
      }

      // Pas en cache, tester l'URL puis télécharger
      console.log('📥 Audio non en cache, test de l\'URL...');
      
      const urlWorks = await this.testAudioUrl(audioUrl);
      if (!urlWorks) {
        throw new Error('URL audio non accessible');
      }
      
      console.log('✅ URL valide, téléchargement...');
      return await this.downloadAndCache(videoId, audioUrl, title);
      
    } catch (error) {
      console.error('❌ Erreur getAudioFile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Nettoyer le cache (supprimer les vieux fichiers)
  async cleanupCache() {
    if (this.isWebPlatform) {
      // Nettoyer le cache web si trop d'entrées
      if (this.webCache.size > 50) {
        const entries = Array.from(this.webCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Garder seulement les 30 plus récents
        for (let i = 0; i < entries.length - 30; i++) {
          this.webCache.delete(entries[i][0]);
        }
        console.log('🧹 Cache web nettoyé');
      }
      return;
    }

    if (!FileSystem) return;

    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;
      const fileInfos = [];

      // Obtenir les infos de tous les fichiers
      for (const file of files) {
        const filePath = `${this.cacheDir}${file}`;
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          fileInfos.push({
            name: file,
            path: filePath,
            size: info.size,
            modificationTime: info.modificationTime
          });
          totalSize += info.size;
        }
      }

      // Si le cache dépasse la taille max, supprimer les plus anciens
      if (totalSize > this.maxCacheSize) {
        console.log('🧹 Nettoyage du cache nécessaire...');
        
        // Trier par date (plus anciens en premier)
        fileInfos.sort((a, b) => a.modificationTime - b.modificationTime);
        
        let sizeToRemove = totalSize - (this.maxCacheSize * 0.8); // Garder 80% de la taille max
        
        for (const fileInfo of fileInfos) {
          if (sizeToRemove <= 0) break;
          
          await FileSystem.deleteAsync(fileInfo.path);
          sizeToRemove -= fileInfo.size;
          console.log('🗑️ Fichier supprimé:', fileInfo.name);
        }
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage cache:', error);
    }
  }

  // Obtenir les statistiques du cache
  async getCacheStats() {
    if (this.isWebPlatform) {
      return {
        fileCount: this.webCache.size,
        totalSize: 0,
        totalSizeMB: 0,
        maxSizeMB: 0,
        cacheDir: 'web-memory-cache'
      };
    }

    if (!FileSystem) {
      return { fileCount: 0, totalSize: 0, totalSizeMB: 0 };
    }

    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        const filePath = `${this.cacheDir}${file}`;
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          totalSize += info.size;
          fileCount++;
        }
      }

      return {
        fileCount,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        maxSizeMB: Math.round(this.maxCacheSize / 1024 / 1024),
        cacheDir: this.cacheDir
      };
    } catch (error) {
      console.error('❌ Erreur stats cache:', error);
      return { fileCount: 0, totalSize: 0, totalSizeMB: 0 };
    }
  }

  // Vider complètement le cache
  async clearCache() {
    if (this.isWebPlatform) {
      this.webCache.clear();
      console.log('🗑️ Cache web vidé complètement');
      return true;
    }

    if (!FileSystem) return false;

    try {
      await FileSystem.deleteAsync(this.cacheDir);
      await this.initCache();
      console.log('🗑️ Cache audio vidé complètement');
      return true;
    } catch (error) {
      console.error('❌ Erreur vidage cache:', error);
      return false;
    }
  }
}

// Instance singleton
const audioCache = new AudioCacheService();
export default audioCache;