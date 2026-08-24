/**
 * AuraMusic Offline Storage Engine (IndexedDB)
 * Saves audio blobs, album covers, and synchronized lyrics locally for 100% offline playback.
 */

const DB_NAME = 'AuraMusicOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_tracks';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('savedAt', 'savedAt', { unique: false });
          store.createIndex('title', 'title', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('[OfflineDB Error]:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  return dbPromise;
}

/**
 * Check if a track is already saved offline
 * @param {string} trackId
 * @returns {Promise<boolean>}
 */
export async function isTrackSavedOffline(trackId) {
  if (!trackId) return false;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(trackId));
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Save track audio, cover, and lyrics for offline playback
 * @param {Object} track
 * @param {string} directAudioUrl
 * @param {Function} [onProgress]
 * @returns {Promise<Object>}
 */
export async function saveTrackOffline(track, directAudioUrl, onProgress) {
  if (!track || !track._id) {
    throw new Error('Thông tin bài hát không hợp lệ');
  }

  const trackId = String(track._id);
  const audioUrl = directAudioUrl || track.audioUrl || track.fileUrl || track.streamUrl;

  if (!audioUrl) {
    throw new Error('Không tìm thấy luồng âm thanh để tải offline');
  }

  if (onProgress) onProgress('Đang tải tệp âm thanh...');

  // 1. Download audio file as Blob
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Không thể tải âm thanh (HTTP ${audioResponse.status})`);
  }
  const audioBlob = await audioResponse.blob();

  // 2. Download cover image if available
  let coverBlob = null;
  if (track.coverImage) {
    try {
      const coverRes = await fetch(track.coverImage);
      if (coverRes.ok) {
        coverBlob = await coverRes.blob();
      }
    } catch (e) {
      // Cover image download optional
    }
  }

  // 3. Construct record
  const record = {
    id: trackId,
    _id: trackId,
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    genre: track.genre || 'Music',
    duration: track.duration || 0,
    lyricsData: Array.isArray(track.lyricsData) ? track.lyricsData : [],
    lyrics: track.lyrics || '',
    audioBlob: audioBlob,
    coverBlob: coverBlob,
    coverImage: track.coverImage || '',
    savedAt: Date.now(),
    size: audioBlob.size,
    isOffline: true,
  };

  // 4. Save to IndexedDB
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => {
      resolve(record);
    };

    req.onerror = (e) => {
      reject(e.target.error || new Error('Lỗi lưu bài hát vào IndexedDB'));
    };
  });
}

/**
 * Remove track from offline cache
 * @param {string} trackId
 * @returns {Promise<boolean>}
 */
export async function removeTrackOffline(trackId) {
  if (!trackId) return false;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(String(trackId));
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('[OfflineDB Delete Error]:', err);
    return false;
  }
}

/**
 * Get all cached offline tracks
 * @returns {Promise<Array>}
 */
export async function getOfflineTracks() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const list = (req.result || []).map((item) => {
          let coverUrl = item.coverImage;
          if (item.coverBlob) {
            try {
              coverUrl = URL.createObjectURL(item.coverBlob);
            } catch (e) {
              // fallback
            }
          }
          return {
            ...item,
            _id: item.id,
            coverImage: coverUrl,
            hasOfflineBlob: true,
          };
        });
        resolve(list);
      };

      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('[OfflineDB getAll Error]:', err);
    return [];
  }
}

/**
 * Get offline audio ObjectURL from IndexedDB for a given track ID
 * @param {string} trackId
 * @returns {Promise<string|null>}
 */
export async function getOfflineAudioUrl(trackId) {
  if (!trackId) return null;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(trackId));

      req.onsuccess = () => {
        if (req.result && req.result.audioBlob) {
          const blobUrl = URL.createObjectURL(req.result.audioBlob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
