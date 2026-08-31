/**
 * Konfigurasi sinkron History antar perangkat (Administrator / KPw).
 *
 * GitHub (disarankan untuk BI PRAMESTI di GitHub Pages):
 * 1. Buat Personal Access Token (classic) dengan scope repo
 * 2. Tempel di github.token di bawah
 * 3. provider: "github", enabled: true
 * History disimpan ke assets/data/audit-history.json di repo — semua laptop/PC membaca & menulis berkas yang sama.
 *
 * Firebase (alternatif):
 * 1. Buat proyek di https://console.firebase.google.com/
 * 2. Aktifkan Authentication → Anonymous sign-in + Firestore
 * 3. Rules: allow read, write: if request.auth != null; pada koleksi padelAudit
 * 4. provider: "firestore", isi firestore.*, enabled: true
 *
 * JSONBin (alternatif):
 * provider: "jsonbin", isi binId + accessKey
 */
window.PADEL_HISTORY_CLOUD = {
  enabled: true,
  provider: "github",
  github: {
    token: "",
    owner: "emailnyaaes-hub",
    repo: "BI-PRAMESTI",
    path: "assets/data/audit-history.json",
    branch: "main",
  },
  firestore: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: "",
  },
  jsonbin: {
    binId: "",
    accessKey: "",
  },
};
