/**
 * Live Visitor Wish Board - Data Store & Real-time Sync
 * Compatible with GitHub Pages: Uses Firebase Firestore via CDN.
 * Includes automatic Offline / LocalStorage fallback so it works immediately out of the box!
 */

// ============================================================================
// 1. FIREBASE CONFIGURATION (REPLACE WITH YOUR KEYS WHEN READY TO GO LIVE)
// To get your free keys: Go to https://console.firebase.google.com -> Create Project -> Add Web App -> Enable Firestore!
// ============================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// No pre-loaded wishes: clean board ready for real visitors!
const DEFAULT_WISHES = [];

// Safe Storage Helper (prevents crashes in file:// protocol or private browsing)
const SafeStore = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  },
  getSession(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setSession(key, val) {
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {}
  }
};

class WishStore {
  constructor() {
    this.isFirebaseReady = false;
    this.db = null;
    this.wishes = [];
    this.listeners = [];
    this.init();
  }

  init() {
    // Check if real Firebase config is provided
    const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && typeof firebase !== "undefined";

    if (isConfigured) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();
        this.isFirebaseReady = true;
        console.log("🔥 Connected to Firebase Firestore real-time database!");
        this.listenRealtimeFirebase();
      } catch (err) {
        console.warn("Firebase init failed, falling back to LocalStorage:", err);
        this.initLocalMode();
      }
    } else {
      console.log("ℹ️ Running in Local / Demo mode. Add your Firebase keys in js/firebase-config.js to sync live across devices!");
      this.initLocalMode();
    }
  }

  // Local Storage Mode
  initLocalMode() {
    this.isFirebaseReady = false;
    const localData = SafeStore.get("birthday_wishes_data");
    if (localData) {
      try {
        let parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          // Remove old demo wishes so board starts fresh
          parsed = parsed.filter(w => !['featured-1', 'wish-2', 'wish-3', 'wish-4'].includes(w.id));
        } else {
          parsed = [];
        }
        this.wishes = parsed;
      } catch (e) {
        this.wishes = [];
      }
    } else {
      this.wishes = [];
    }
    this.saveLocal();
  }

  saveLocal() {
    SafeStore.set("birthday_wishes_data", JSON.stringify(this.wishes));
    this.notify();
  }

  // Delete a wish (for moderation or removing test notes)
  async deleteWish(wishId) {
    if (this.isFirebaseReady) {
      try {
        await this.db.collection("birthday_wishes").doc(wishId).delete();
        return true;
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    }
    this.wishes = this.wishes.filter((w) => w.id !== wishId);
    this.saveLocal();
    return true;
  }

  // Real-time Firestore Listener
  listenRealtimeFirebase() {
    this.db.collection("birthday_wishes")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const liveList = [];
        snapshot.forEach((doc) => {
          liveList.push({ id: doc.id, ...doc.data() });
        });

        // If collection is empty, seed initial featured wish
        if (liveList.length === 0) {
          this.wishes = [...DEFAULT_WISHES];
        } else {
          this.wishes = liveList;
        }
        this.notify();
      }, (error) => {
        console.error("Firestore listen error:", error);
        this.initLocalMode();
      });
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.wishes);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.wishes));
  }

  // Add a new visitor wish
  async addWish({ name, tag, color, text, avatar }) {
    const newWish = {
      name: name.trim() || "A Good Friend",
      tag: tag || "Friend",
      color: color || "yellow",
      avatar: avatar || "🎉",
      isFeatured: false,
      likes: 0,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseReady) {
      try {
        await this.db.collection("birthday_wishes").add(newWish);
        return true;
      } catch (err) {
        console.error("Error adding to Firestore:", err);
      }
    }

    // Fallback Local Storage
    newWish.id = "local-" + Date.now();
    this.wishes.unshift(newWish);
    this.saveLocal();
    return true;
  }

  // Reaction / Like handler
  async likeWish(wishId) {
    // Check if already liked in this session
    const likedKey = `liked_${wishId}`;
    if (SafeStore.getSession(likedKey)) {
      return false; // Prevent multiple likes in same session
    }
    SafeStore.setSession(likedKey, "true");

    if (this.isFirebaseReady) {
      try {
        const docRef = this.db.collection("birthday_wishes").doc(wishId);
        await docRef.update({
          likes: firebase.firestore.FieldValue.increment(1)
        });
        return true;
      } catch (err) {
        console.error("Error liking wish in Firestore:", err);
      }
    }

    // Local mode
    const item = this.wishes.find((w) => w.id === wishId);
    if (item) {
      item.likes = (item.likes || 0) + 1;
      this.saveLocal();
    }
    return true;
  }
}

// Global Wish Store Instance
window.wishStore = new WishStore();
