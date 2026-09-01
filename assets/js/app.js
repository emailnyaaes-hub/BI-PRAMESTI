(function () {
  const AUTH_KEY = "padel-session-v1";
  const KPW_SELF_KEY = "padel-kpw-self-v1";
  const AUTH_USERS = [
    { user: "user", pass: "lihat2026", name: "User", role: "user" },
    {
      user: "kpw_sumut",
      pass: "kpwsumut2026",
      name: "Kantor Perwakilan Sumatera Utara",
      role: "kpw",
      kpwdn: "Prov. Sumatera Utara",
    },
    { user: "admin", pass: "padel2026", name: "Administrator", role: "admin" },
  ];
  const ROLE_ACCESS = {
    user: {
      views: ["beranda", "database"],
      canEdit: false,
      canUploadData: false,
      canReplaceAllData: false,
      canUploadTemplate: false,
      canDownloadTemplate: false,
    },
    kpw: {
      views: ["beranda", "capaian", "database"],
      canEdit: true,
      canUploadData: true,
      canReplaceAllData: false,
      canUploadTemplate: false,
      canDownloadTemplate: true,
    },
    admin: {
      views: ["beranda", "ringkasan", "capaian", "database", "history"],
      canEdit: true,
      canUploadData: true,
      canReplaceAllData: true,
      canUploadTemplate: true,
      canDownloadTemplate: true,
    },
  };
  const STORAGE_KEY = "ekonomi-lokal-records-v2";
  const ICK_CAPAIAN_KEY = "padel-ick-capaian-v1";
  const TEMPLATE_DB_KEY = "padel-template-database-v1";
  const TEMPLATE_CAPAIAN_KEY = "padel-template-capaian-v1";
  const STORAGE_BACKEND_KEY = "ekonomi-lokal-backend-v1";
  const IDB_NAME = "padel-ekonomi-lokal";
  const IDB_STORE = "kv";
  const UPDATED_KEY = "ekonomi-lokal-updated-v1";
  const SEED_VERSION = "20260829b";
  const SEED_VERSION_KEY = "padel-seed-version-v1";
  const WATCH_KEY = "padel-watchlist-v1";
  const SARAN_KEY = "padel-saran-overrides-v1";
  const SARAN_TEXT_VERSION = "20260831j";
  const APP_BUILD = "20260901b";
  const GENERIC_KOMODITAS = new Set([
    "N/A",
    "Industri Pengolahan",
    "Perdagangan Besar dan Eceran; Reparasi dan Perawatan Mobil dan Sepeda Motor",
    "Penyediaan Akomodasi dan Penyediaan Makan Minum",
    "Jasa Lainnya",
    "Pertanian, Kehutanan, dan Perikanan",
    "Lainnya",
  ]);
  const SARAN_TEXT_VERSION_KEY = "padel-saran-text-version-v1";
  const HISTORY_KEY = "padel-audit-history-v1";
  const HISTORY_SHARED_URL = "assets/data/audit-history.json";
  const HISTORY_CLOUD_DOC = "shared-v1";
  const HISTORY_CLOUD_COLLECTION = "padelAudit";
  const HISTORY_MAX = 800;
  const AUDIT_DB_FIELDS = ["nama", "jenis", "komoditas", "fasilitas", "tahun", "kpwdn", "keterangan"];
  const AUDIT_FIELD_LABELS = {
    nama: "Nama UMKM/PUS",
    jenis: "Jenis",
    komoditas: "Komoditas",
    fasilitas: "ICK/Fasilitas",
    tahun: "Tahun",
    kpwdn: "KPwDN pengampu",
    keterangan: "Keterangan",
  };
  const AUDIT_ACTION_LABELS = {
    create: "Tambah",
    update: "Ubah",
    delete: "Hapus",
    import: "Unggah Excel",
    replace: "Ganti seluruh data",
  };
  const AUDIT_MODULE_LABELS = {
    database: "Database UMKM/PUS",
    capaian: "Capaian ICK",
  };
  const PAGE_SIZE = 10;
  const REGIONS = [
    {
      id: "sumatera",
      name: "Sumatera",
      x: 16,
      y: 42,
      test: (k) =>
        /Aceh|Sumatera Utara|Sumatera Barat|Riau|Jambi|Sumatera Selatan|Bangka|Bengkulu|Lampung|Kepulauan Riau|Sibolga|Pematang ?Siantar|Lhok ?Seumawe/i.test(
          k
        ),
    },
    {
      id: "jawa",
      name: "Jawa",
      x: 32,
      y: 78,
      test: (k) =>
        /Jakarta|DKI|Jawa Barat|Banten|Jawa Tengah|Yogyakarta|Jawa Timur|Solo|Surakarta|Tasikmalaya|Cirebon|Jember|Purwokerto|Kediri|Malang|Tegal/i.test(k),
    },
    {
      id: "kalimantan",
      name: "Kalimantan",
      x: 39,
      y: 34,
      test: (k) => /Kalimantan|Kaltim|Kalsel|Kalbar|Kalteng|Kaltara|Balikpapan/i.test(k),
    },
    {
      id: "bali-nusra",
      name: "Bali Nusra",
      x: 56,
      y: 84,
      test: (k) => /\bBali\b|Nusa Tenggara|\bNTT\b|\bNTB\b/i.test(k),
    },
    {
      id: "sulampua",
      name: "Sulampua",
      x: 68,
      y: 48,
      test: (k) =>
        /Sulawesi Utara|Sulawesi Tengah|Sulawesi Selatan|Sulawesi Tenggara|Sulawesi Barat|Sulawesi|Gorontalo|Maluku Utara|Maluku|Papua Barat|Papua/i.test(
          k
        ),
    },
  ];
  const CHART_TITLES = {
    komoditas: "Komoditas",
    fasilitas: "ICK",
    kpwdn: "KPwDN pengampu",
    tahun: "Tahun",
  };
  const CHART_LIST_EXTRA = {
    komoditas: ["fasilitas", "tahun"],
    fasilitas: ["komoditas", "tahun"],
    tahun: ["komoditas", "fasilitas"],
  };
  const CHART_FILTER_LABELS = {
    komoditas: "Komoditas",
    fasilitas: "Fasilitas",
    tahun: "Tahun",
  };
  const PIE_COLORS = [
    "#004c97",
    "#003087",
    "#1a6bb5",
    "#4d8ec9",
    "#7aaad9",
    "#0d3b6e",
    "#5c6b7a",
    "#9aa7b8",
    "#2e6a9e",
    "#c5d5e6",
  ];
  const IMPORT_HEADERS = [
    "Nama UMKM/PUS",
    "Jenis",
    "Komoditas",
    "Fasilitas",
    "Tahun",
    "KPwDN pengampu",
    "Lokasi",
    "Status",
    "Keterangan",
  ];

  const state = {
    qNama: "",
    jenis: [],
    komoditas: [],
    fasilitas: [],
    tahun: [],
    kpwdn: [],
    sortKey: "tahun",
    sortDir: "desc",
    page: 1,
    modal: null,
    importDraft: null,
    capaianDraft: null,
    wilayah: "",
    view: "beranda",
    rapat: false,
    capaianWilayah: "",
    capaianProgram: "",
    capaianQ: "",
    capaianSort: "desc",
    capaianOffice: 0,
    kpwSelfKey: "",
    chartKpwQ: "",
    homeWilayah: "",
    homeActions: false,
    homeKpw: "",
    homeUnitId: "",
    historyModule: "",
    historyQ: "",
  };

  let watchIds = loadWatch();
  let saranOverrides = loadSaranOverrides();
  let auditLog = [];
  let historyCloudReady = false;
  let historyCloudMode = "local";
  let historyPushTimer = null;
  let historyPollTimer = null;
  let historySyncBusy = false;

  function loadWatch() {
    try {
      const parsed = JSON.parse(localStorage.getItem(WATCH_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (_) {
      return [];
    }
  }

  function saveWatch() {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchIds));
  }

  function loadSaranOverrides() {
    try {
      const storedVersion = localStorage.getItem(SARAN_TEXT_VERSION_KEY);
      if (storedVersion !== SARAN_TEXT_VERSION) {
        localStorage.removeItem(SARAN_KEY);
        localStorage.setItem(SARAN_TEXT_VERSION_KEY, SARAN_TEXT_VERSION);
        return {};
      }
      const parsed = JSON.parse(localStorage.getItem(SARAN_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveSaranOverrides() {
    localStorage.setItem(SARAN_KEY, JSON.stringify(saranOverrides));
  }

  function applySaranOverrides(bundle) {
    const pri = (bundle.priority || []).map((item, i) => {
      const over = saranOverrides.priority?.[i];
      return over ? { ...item, title: over.title || item.title, text: over.text || item.text } : item;
    });
    const horizons = (bundle.horizons || []).map((item, i) => {
      const over = saranOverrides.horizons?.[i];
      return over
        ? {
            ...item,
            title: over.title || item.title,
            text: over.text || item.text,
            window: over.window || item.window,
            label: over.label || item.label,
          }
        : item;
    });
    return { priority: pri, horizons };
  }

  function isWatched(id) {
    return watchIds.includes(String(id));
  }

  function toggleWatch(id) {
    const key = String(id);
    watchIds = isWatched(key) ? watchIds.filter((item) => item !== key) : [key, ...watchIds];
    saveWatch();
  }

  const CITY_KPW = [
    [/tasikmalaya/i, "Tasikmalaya"],
    [/cirebon/i, "Cirebon"],
    [/jember/i, "Jember"],
    [/purwokerto/i, "Purwokerto"],
    [/kediri/i, "Kediri"],
    [/\bmalang\b/i, "Malang"],
    [/pematang ?siantar/i, "Pematang Siantar"],
    [/\btegal\b/i, "Tegal"],
    [/lhok ?seumawe/i, "Lhokseumawe"],
    [/sibolga/i, "Sibolga"],
    [/balikpapan/i, "Balikpapan"],
  ];

  function shortOffice(name) {
    return String(name || "").replace(/^KPwDN\s+/i, "").replace(/^KPw\s+/i, "").trim();
  }

  function cityKpwLabel(name) {
    const found = CITY_KPW.find(([test]) => test.test(name));
    return found ? found[1] : "";
  }

  function asalKpwLabel(name) {
    const raw = String(name || "").replace(/\s+/g, " ").trim();
    if (!raw) return "Tanpa KPwDN";
    if (/\bsolo\b|surakarta/i.test(raw) && !/jawa tengah/i.test(raw)) return "Provinsi Jawa Tengah";

    const city = cityKpwLabel(raw);
    if (city) return city;
    if (/\bkaltim\b|kalimantan timur/i.test(raw) && !/balikpapan/i.test(raw)) {
      return "Provinsi Kalimantan Timur";
    }

    let label = raw
      .replace(/^(KPwDN|KPwBI|KPw)\s+/i, "")
      .replace(/^Prov(?:insi)?\.?\s+/i, "Provinsi ")
      .trim();
    if (/^DKI\b|^DI\s/i.test(label)) return label;
    const cityAfter = cityKpwLabel(label);
    if (cityAfter) return cityAfter;
    if (!/^Provinsi\s+/i.test(label)) label = `Provinsi ${label}`;
    return label;
  }

  function canonicalKpwdn(name) {
    return asalKpwLabel(name);
  }

  function regionOf(kpwdn) {
    const label = canonicalKpwdn(kpwdn);
    return REGIONS.find((region) => region.test(label)) || null;
  }

  function matchesRegion(region, kpwdn) {
    return regionOf(kpwdn)?.id === region.id;
  }

  function currentSession() {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function currentRole() {
    const session = currentSession();
    if (session?.role && ROLE_ACCESS[session.role]) return session.role;
    const byUser = AUTH_USERS.find((row) => row.user === session?.user);
    if (byUser?.role) return byUser.role;
    return "user";
  }

  function roleAccess() {
    return ROLE_ACCESS[currentRole()] || ROLE_ACCESS.user;
  }

  function can(flag) {
    return Boolean(roleAccess()[flag]);
  }

  function isKpwScoped() {
    return currentRole() === "kpw";
  }

  function fixedKpwDn() {
    const session = currentSession();
    if (session?.kpwdn) return String(session.kpwdn).trim();
    const byUser = AUTH_USERS.find((row) => row.user === session?.user);
    return String(byUser?.kpwdn || "").trim();
  }

  function hasFixedKpwScope() {
    return isKpwScoped() && Boolean(fixedKpwDn());
  }

  function kpwScopeMatchKey(pick) {
    const raw = String(pick || "").trim();
    if (!raw) return "";
    return accOfficeLabel({ kpwdn: raw, kpw: raw }).toLowerCase();
  }

  function kpwScopeLabel() {
    return String(state.kpwSelfKey || fixedKpwDn() || "KPwDN Anda").trim();
  }

  function initKpwScope() {
    if (!isKpwScoped()) {
      state.kpwSelfKey = "";
      return;
    }
    const fixed = fixedKpwDn();
    if (fixed) {
      state.kpwSelfKey = accOfficeLabel({ kpwdn: fixed, kpw: fixed });
      return;
    }
    state.kpwSelfKey = loadKpwSelfKey();
  }

  function loadKpwSelfKey() {
    try {
      return String(sessionStorage.getItem(KPW_SELF_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function saveKpwSelfKey(key) {
    const next = String(key || "").trim();
    const fixed = fixedKpwDn();
    if (hasFixedKpwScope()) {
      state.kpwSelfKey = accOfficeLabel({ kpwdn: fixed, kpw: fixed });
      return next === state.kpwSelfKey || kpwScopeMatchKey(next) === kpwScopeMatchKey(state.kpwSelfKey);
    }
    const locked = String(state.kpwSelfKey || "").trim();
    if (isKpwScoped() && locked && next !== locked) return false;
    state.kpwSelfKey = next;
    try {
      if (next) sessionStorage.setItem(KPW_SELF_KEY, next);
      else sessionStorage.removeItem(KPW_SELF_KEY);
    } catch (_) {
      /* ignore */
    }
    return true;
  }

  function handleKpwSelfPick(el, afterChange) {
    const locked = String(state.kpwSelfKey || "").trim();
    const picked = String(el.value || "").trim();
    if (locked && picked && picked !== locked) {
      el.value = locked;
      flash("KPwDN pengampu sudah dikunci. Anda hanya dapat mengubah data kantor ini.", true);
      return false;
    }
    if (!saveKpwSelfKey(picked)) {
      el.value = locked;
      flash("KPwDN pengampu sudah dikunci. Anda hanya dapat mengubah data kantor ini.", true);
      return false;
    }
    applyRoleChrome();
    renderKpwSelfBar();
    if (afterChange) afterChange();
    return true;
  }

  function kpwSelfOffice() {
    const key = kpwScopeMatchKey(state.kpwSelfKey);
    if (!key) return null;
    return (ickCapaian().offices || []).find((office) => capaianOfficeKey(office) === key) || null;
  }

  function officeIsKpwSelf(office) {
    if (!isKpwScoped()) return true;
    const key = kpwScopeMatchKey(state.kpwSelfKey);
    if (!key || !office) return false;
    return capaianOfficeKey(office) === key;
  }

  function recordIsKpwSelf(row) {
    if (!isKpwScoped()) return true;
    if (!state.kpwSelfKey || !row) return false;
    return rowMatchesKpwPick(row, state.kpwSelfKey);
  }

  function requireKpwSelf(focusId) {
    if (!isKpwScoped()) return true;
    initKpwScope();
    if (state.kpwSelfKey) return true;
    flash("KPwDN pengampu belum tersedia untuk akun ini.", true);
    const sel = document.getElementById(focusId || "capaian-import-self");
    if (sel) sel.focus();
    return false;
  }

  function kpwOfficeOptionsHtml(selected) {
    const current = String(selected || state.kpwSelfKey || "").trim();
    if (isKpwScoped() && state.kpwSelfKey) {
      const locked = state.kpwSelfKey;
      return `<option value="${escapeHtml(locked)}" selected>${escapeHtml(locked)}</option>`;
    }
    const labels = [...(ickCapaian().offices || [])]
      .map((office) => accOfficeLabel(office))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "id"));
    return [`<option value="">Pilih KPwDN pengampu…</option>`]
      .concat(
        labels.map(
          (label) =>
            `<option value="${escapeHtml(label)}"${label === current ? " selected" : ""}>${escapeHtml(label)}</option>`
        )
      )
      .join("");
  }

  function renderKpwSelfBar() {
    const bar = document.getElementById("kpw-self-bar");
    if (!bar || hasFixedKpwScope()) {
      if (bar) bar.hidden = true;
      return;
    }
    const pick = document.getElementById("kpw-self-pick");
    const note = document.getElementById("kpw-self-note");
    if (!pick) return;
    if (!isKpwScoped() || !can("canUploadData")) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    const locked = Boolean(state.kpwSelfKey);
    pick.innerHTML = kpwOfficeOptionsHtml(state.kpwSelfKey);
    pick.disabled = locked;
    if (note) note.hidden = !locked;
  }

  function canView(view) {
    return roleAccess().views.includes(view);
  }

  function showLogin() {
    document.getElementById("login-gate").hidden = false;
    document.getElementById("app-shell").hidden = true;
    document.getElementById("app-shell").classList.remove("rapat-mode");
    state.rapat = false;
    const pass = document.getElementById("login-pass");
    if (pass) pass.value = "";
  }

  function applyRoleChrome() {
    const access = roleAccess();
    const shell = document.getElementById("app-shell");
    if (shell) shell.setAttribute("data-role", currentRole());
    document.querySelectorAll(".view-nav [data-view]").forEach((btn) => {
      const view = btn.getAttribute("data-view");
      btn.hidden = !access.views.includes(view);
    });
    const setHidden = (id, hidden) => {
      const el = document.getElementById(id);
      if (el) el.hidden = hidden;
    };
    setHidden("btn-add", !access.canEdit);
    setHidden("btn-upload", !access.canUploadData);
    setHidden("btn-template-db", !access.canDownloadTemplate);
    setHidden("btn-template-db-upload", !access.canUploadTemplate);
    setHidden("btn-capaian-add", !access.canEdit);
    setHidden("btn-capaian-upload", !access.canUploadData);
    setHidden("btn-capaian-pdf", currentRole() === "user");
    setHidden("btn-template-capaian", !access.canDownloadTemplate);
    setHidden("btn-template-capaian-upload", !access.canUploadTemplate);
    const addBtn = document.getElementById("btn-capaian-add");
    if (addBtn) addBtn.textContent = "Tambah data";
    const dbAddBtn = document.getElementById("btn-add");
    if (dbAddBtn) dbAddBtn.textContent = "Tambah data";
    if (!canView(state.view)) {
      state.view = access.views[0] || "beranda";
    }
    renderKpwSelfBar();
  }

  async function showApp() {
    const session = currentSession();
    document.getElementById("login-gate").hidden = true;
    document.getElementById("app-shell").hidden = false;
    state.kpwSelfKey = "";
    initKpwScope();
    await loadHistory();
    startNewsTicker();
    startHistoryPolling();
    const label = document.getElementById("user-label");
    if (label) {
      label.textContent = session ? session.name || session.user : "";
    }
    applyRoleChrome();
    render();
  }

  function looksLikeSampleData(list) {
    return (
      Array.isArray(list) &&
      list.length > 0 &&
      list.every((row) => /^umkm-\d{3}$/.test(String(row.id || "")))
    );
  }

  function inflateRecord(row, i) {
    return {
      id: String(row.id || `u${i + 1}`),
      nama: row.nama || "",
      jenis: classifyJenis(row),
      komoditas: usableKomoditas(row.komoditas),
      fasilitas: usableIck(row.fasilitas),
      tahun: row.tahun || "",
      kpwdn: row.kpwdn || "",
      lokasi: row.lokasi || "",
      status: row.status || "Aktif",
      keterangan: row.keterangan || "",
    };
  }

  function slimRecords(list) {
    return list.map((row, i) => {
      const item = {
        id: String(row.id || `u${i + 1}`),
        nama: row.nama || "",
        jenis: classifyJenis(row),
        komoditas: row.komoditas || "",
        fasilitas: usableIck(row.fasilitas),
        tahun: row.tahun || "",
        kpwdn: row.kpwdn || "",
      };
      if (row.lokasi) item.lokasi = row.lokasi;
      if (row.status && row.status !== "Aktif") item.status = row.status;
      if (row.keterangan) item.keterangan = row.keterangan;
      return item;
    });
  }

  function usableList(value) {
    return Array.isArray(value) && value.length && !looksLikeSampleData(value)
      ? value.map(inflateRecord)
      : null;
  }

  function withIdb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
    });
  }

  function idbGet(key) {
    return withIdb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readonly");
          const req = tx.objectStore(IDB_STORE).get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        })
    );
  }

  function idbSet(key, value) {
    return withIdb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).put(value, key);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        })
    );
  }

  function idbDelete(key) {
    return withIdb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).delete(key);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        })
    );
  }

  async function ensureSeedVersion() {
    try {
      const stored = localStorage.getItem(SEED_VERSION_KEY);
      if (stored === SEED_VERSION) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_BACKEND_KEY);
      localStorage.removeItem(UPDATED_KEY);
      try {
        await idbDelete(STORAGE_KEY);
      } catch (_) {
        /* ignore */
      }
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    } catch (_) {
      /* ignore */
    }
  }

  function cloneEconomiSeed() {
    const seed = window.EKONOMI_SEED;
    if (!Array.isArray(seed) || !seed.length) return [];
    return seed.map((row, i) => inflateRecord(row, i));
  }

  async function loadRecords() {
    await ensureSeedVersion();
    try {
      const backend = localStorage.getItem(STORAGE_BACKEND_KEY);
      if (backend === "idb") {
        const fromIdb = usableList(await idbGet(STORAGE_KEY));
        if (fromIdb) return fromIdb;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const fromLs = usableList(JSON.parse(raw));
        if (fromLs) return fromLs;
      }
      const fromIdb = usableList(await idbGet(STORAGE_KEY));
      if (fromIdb) return fromIdb;
    } catch (_) {
      /* fall through to bundled seed */
    }
    return cloneEconomiSeed();
  }

  async function saveRecords(list) {
    const slim = slimRecords(list);
    let idbOk = false;
    try {
      await idbSet(STORAGE_KEY, slim);
      idbOk = true;
    } catch (_) {
      /* localStorage may still work for small sets */
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      localStorage.removeItem(STORAGE_BACKEND_KEY);
    } catch (_) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        if (idbOk) localStorage.setItem(STORAGE_BACKEND_KEY, "idb");
      } catch (__) {
        /* ignore */
      }
      if (!idbOk) {
        throw new Error("Penyimpanan peramban penuh. Tutup tab lain, lalu unggah ulang dengan Ganti seluruh data.");
      }
    }
    try {
      localStorage.setItem(UPDATED_KEY, String(Date.now()));
    } catch (_) {
      /* date stamp is optional */
    }
  }

  async function loadHistory() {
    await loadHistoryLocal();
    await initHistoryCloud();
    await syncHistoryRemote(true);
  }

  function historyCloudConfig() {
    return window.PADEL_HISTORY_CLOUD || {};
  }

  function historyCloudEnabled() {
    const cfg = historyCloudConfig();
    if (!cfg.enabled) return false;
    if (cfg.provider === "github") {
      return !!(cfg.github?.token && cfg.github?.owner && cfg.github?.repo && cfg.github?.path);
    }
    if (cfg.provider === "jsonbin") return !!(cfg.jsonbin?.binId && cfg.jsonbin?.accessKey);
    if (cfg.provider === "firestore") return !!(cfg.firestore?.apiKey && cfg.firestore?.projectId);
    return false;
  }

  function mergeAuditLogs(...lists) {
    const byId = new Map();
    lists.flat().forEach((entry) => {
      if (!entry?.id) return;
      const prev = byId.get(entry.id);
      if (!prev || Number(entry.at || 0) >= Number(prev.at || 0)) byId.set(entry.id, entry);
    });
    return [...byId.values()].sort((a, b) => Number(b.at || 0) - Number(a.at || 0)).slice(0, HISTORY_MAX);
  }

  async function fetchSharedHistoryFile() {
    try {
      const res = await fetch(`${HISTORY_SHARED_URL}?v=${encodeURIComponent(APP_BUILD)}`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data?.entries)) return data.entries;
      if (Array.isArray(data)) return data;
      return [];
    } catch (_) {
      return [];
    }
  }

  async function initHistoryCloud() {
    historyCloudReady = false;
    historyCloudMode = "local";
    if (!historyCloudEnabled()) return false;
    const cfg = historyCloudConfig();
    if (cfg.provider === "github") {
      historyCloudReady = true;
      historyCloudMode = "github";
      return true;
    }
    if (cfg.provider === "jsonbin") {
      historyCloudReady = true;
      historyCloudMode = "jsonbin";
      return true;
    }
    if (cfg.provider === "firestore") {
      if (!window.firebase?.apps?.length) {
        if (!cfg.firestore?.apiKey) return false;
        firebase.initializeApp(cfg.firestore);
      }
      try {
        if (!firebase.auth().currentUser) await firebase.auth().signInAnonymously();
        historyCloudReady = true;
        historyCloudMode = "firestore";
        return true;
      } catch (err) {
        console.warn("initHistoryCloud", err);
        return false;
      }
    }
    return false;
  }

  function githubHistoryHeaders(cfg) {
    return {
      Authorization: `Bearer ${cfg.github.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  function decodeGithubContent(content) {
    try {
      return JSON.parse(atob(String(content || "").replace(/\n/g, "")));
    } catch (_) {
      return null;
    }
  }

  async function pullGithubHistory() {
    const cfg = historyCloudConfig();
    const g = cfg.github;
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(g.path)}?ref=${encodeURIComponent(g.branch || "main")}`;
    const res = await fetch(url, { headers: githubHistoryHeaders(cfg) });
    if (res.status === 404) return { entries: [], sha: null };
    if (!res.ok) throw new Error(`GitHub read ${res.status}`);
    const data = await res.json();
    const parsed = decodeGithubContent(data.content);
    return {
      entries: Array.isArray(parsed?.entries) ? parsed.entries : [],
      sha: data.sha || null,
    };
  }

  async function pushGithubHistory(entries) {
    const cfg = historyCloudConfig();
    const g = cfg.github;
    const current = await pullGithubHistory();
    const merged = mergeAuditLogs(current.entries, entries);
    const payload = {
      entries: merged,
      updatedAt: new Date().toISOString(),
    };
    const body = {
      message: "Sync BI PRAMESTI audit history",
      content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))),
      branch: g.branch || "main",
    };
    if (current.sha) body.sha = current.sha;
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(g.path)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...githubHistoryHeaders(cfg), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub write ${res.status}`);
    return true;
  }

  async function pullCloudHistory() {
    if (!historyCloudReady) return [];
    const cfg = historyCloudConfig();
    try {
      if (historyCloudMode === "github") {
        const data = await pullGithubHistory();
        return data.entries;
      }
      if (historyCloudMode === "jsonbin") {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.jsonbin.binId}/latest`, {
          headers: { "X-Access-Key": cfg.jsonbin.accessKey },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const record = data?.record;
        if (Array.isArray(record?.entries)) return record.entries;
        if (Array.isArray(record)) return record;
        return [];
      }
      if (historyCloudMode === "firestore") {
        const snap = await firebase.firestore().collection(HISTORY_CLOUD_COLLECTION).doc(HISTORY_CLOUD_DOC).get();
        if (!snap.exists) return [];
        const entries = snap.data()?.entries;
        return Array.isArray(entries) ? entries : [];
      }
    } catch (err) {
      console.warn("pullCloudHistory", err);
    }
    return [];
  }

  async function pushCloudHistory(entries) {
    if (!historyCloudReady) return false;
    const cfg = historyCloudConfig();
    try {
      if (historyCloudMode === "github") {
        return await pushGithubHistory(entries);
      }
      if (historyCloudMode === "jsonbin") {
        const remote = await pullCloudHistory();
        const merged = mergeAuditLogs(remote, entries);
        const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.jsonbin.binId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Access-Key": cfg.jsonbin.accessKey,
          },
          body: JSON.stringify({ entries: merged, updatedAt: new Date().toISOString() }),
        });
        return res.ok;
      }
      if (historyCloudMode === "firestore") {
        const ref = firebase.firestore().collection(HISTORY_CLOUD_COLLECTION).doc(HISTORY_CLOUD_DOC);
        await firebase.firestore().runTransaction(async (tx) => {
          const snap = await tx.get(ref);
          const remote = snap.exists && Array.isArray(snap.data()?.entries) ? snap.data().entries : [];
          const merged = mergeAuditLogs(remote, entries);
          tx.set(ref, {
            entries: merged,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
        return true;
      }
    } catch (err) {
      console.warn("pushCloudHistory", err);
    }
    return false;
  }

  function scheduleHistoryPush() {
    if (!historyCloudReady) return;
    clearTimeout(historyPushTimer);
    historyPushTimer = setTimeout(() => {
      pushCloudHistory(auditLog).catch(() => {});
    }, 1200);
  }

  async function syncHistoryRemote(silent) {
    if (historySyncBusy) return;
    historySyncBusy = true;
    try {
      const [fileEntries, cloudEntries] = await Promise.all([fetchSharedHistoryFile(), pullCloudHistory()]);
      const merged = mergeAuditLogs(auditLog, fileEntries, cloudEntries);
      const changed =
        merged.length !== auditLog.length ||
        merged.some((entry, i) => entry.id !== auditLog[i]?.id || entry.at !== auditLog[i]?.at);
      if (changed) {
        auditLog = merged;
        await saveHistoryLocal();
        if (state.view === "history" && canView("history")) renderHistory();
        if (!silent) flash("History disinkronkan dari server.");
      } else if (!silent) {
        flash("History sudah mutakhir.");
      }
    } catch (err) {
      if (!silent) flash("Gagal sinkron history. Periksa koneksi atau konfigurasi cloud.", true);
      console.warn("syncHistoryRemote", err);
    } finally {
      historySyncBusy = false;
    }
  }

  function startHistoryPolling() {
    if (historyPollTimer) clearInterval(historyPollTimer);
    if (!historyCloudEnabled() && !(currentSession() && canView("history"))) return;
    historyPollTimer = setInterval(() => {
      syncHistoryRemote(true).catch(() => {});
    }, 45000);
  }

  async function loadHistoryLocal() {
    const readLocal = () => {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    };
    let fromIdb = [];
    try {
      const raw = await idbGet(HISTORY_KEY);
      if (Array.isArray(raw)) fromIdb = raw;
    } catch (_) {
      /* ignore */
    }
    const fromLocal = readLocal();
    auditLog = fromIdb.length >= fromLocal.length ? fromIdb : fromLocal;
    if (fromIdb.length && fromLocal.length && fromLocal.length > fromIdb.length) {
      auditLog = fromLocal;
      try {
        await idbSet(HISTORY_KEY, auditLog);
      } catch (_) {
        /* ignore */
      }
    }
  }

  async function saveHistoryLocal() {
    auditLog = auditLog.slice(0, HISTORY_MAX);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(auditLog));
    } catch (_) {
      /* ignore quota */
    }
    try {
      await idbSet(HISTORY_KEY, auditLog);
    } catch (_) {
      /* ignore */
    }
  }

  async function saveHistory() {
    await saveHistoryLocal();
    scheduleHistoryPush();
  }

  async function deleteAuditEntry(id) {
    if (!canView("history")) return;
    const target = auditLog.find((entry) => entry.id === id);
    if (!target) return;
    if (!confirm(`Hapus catatan history:\n${target.summary || "Perubahan data"}?`)) return;
    auditLog = auditLog.filter((entry) => entry.id !== id);
    await saveHistory();
    await pushCloudHistory(auditLog);
    if (state.view === "history") renderHistory();
    flash("Catatan history dihapus.");
  }

  async function clearAuditHistory() {
    if (!canView("history")) return;
    if (!auditLog.length) {
      flash("History sudah kosong.", true);
      return;
    }
    if (!confirm(`Hapus semua ${fmtNum(auditLog.length)} catatan history? Tindakan ini tidak dapat dibatalkan.`)) return;
    auditLog = [];
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (_) {
      /* ignore */
    }
    try {
      await idbSet(HISTORY_KEY, []);
    } catch (_) {
      /* ignore */
    }
    await pushCloudHistory([]);
    if (state.view === "history") renderHistory();
    flash("Semua history dihapus.");
  }

  function syncHistoryFromStorage() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || parsed.length <= auditLog.length) return;
      auditLog = parsed;
      if (state.view === "history" && canView("history")) renderHistory();
    } catch (_) {
      /* ignore */
    }
  }

  function currentActor() {
    const session = currentSession();
    return {
      name: String(session?.name || session?.user || "Tidak dikenal").trim(),
      role: currentRole(),
      user: String(session?.user || "").trim(),
    };
  }

  function formatHistoryWhen(ms) {
    return new Date(ms).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAuditChanges(changes) {
    return (changes || []).map((row) => {
      const before = row.before ?? "-";
      const after = row.after ?? "-";
      return `${auditChangeDisplay(row)}: "${before}" -> "${after}"`;
    });
  }

  function auditChangeDisplay(row) {
    if (row?.field) return row.field;
    const group = String(row?.group || "").trim();
    const aspect = String(row?.aspect || "").trim();
    if (group && aspect) return `${group} · ${aspect}`;
    return group || aspect || "Perubahan";
  }

  function summarizeAuditChanges(changes, module) {
    if (!changes?.length) return "";
    if (module === "capaian") {
      const icks = [...new Set(changes.filter((row) => row.group && row.group !== "Ringkasan KPwDN").map((row) => row.group))];
      if (icks.length) {
        const list = icks.slice(0, 3).join(", ");
        return `Program ICK: ${list}${icks.length > 3 ? ` (+${icks.length - 3} lainnya)` : ""}`;
      }
      return "Perubahan ringkasan capaian KPwDN";
    }
    if (module === "database") {
      const aspects = [...new Set(changes.map((row) => row.aspect || row.field))];
      return `Bidang data: ${aspects.slice(0, 4).join(", ")}${aspects.length > 4 ? ` (+${aspects.length - 4} lainnya)` : ""}`;
    }
    return "";
  }

  function buildDatabaseUpdateSummary(row, changes) {
    const aspects = [...new Set(changes.map((c) => c.aspect || c.field))];
    const list = aspects.slice(0, 3).join(", ");
    const extra = aspects.length > 3 ? ` (+${aspects.length - 3} bidang)` : "";
    return `Mengubah ${list}${extra} · ${row.nama}`;
  }

  function buildCapaianUpdateSummary(officeLabel, changes) {
    const icks = [...new Set(changes.filter((row) => row.group && row.group !== "Ringkasan KPwDN").map((row) => row.group))];
    if (!icks.length) return `Memperbarui Capaian ICK · ${officeLabel}`;
    const list = icks.slice(0, 3).join(", ");
    const extra = icks.length > 3 ? ` (+${icks.length - 3} ICK lainnya)` : "";
    return `Memperbarui Capaian ICK · ${officeLabel} — ${list}${extra}`;
  }

  function buildCapaianOfficeChanges(before, office, programs) {
    const changes = [];
    programs.forEach((prog) => {
      const pid = prog.id;
      const group = prog.name;
      const aAcc = ickEmptyZero(before.acc?.[pid] ?? before.accBase?.[pid]);
      const bAcc = ickEmptyZero(office.acc?.[pid] ?? office.accBase?.[pid]);
      if (aAcc !== bAcc) {
        changes.push({
          ickId: pid,
          group,
          aspect: "Target 2026",
          field: `${group} · Target 2026`,
          before: fmtAcc(aAcc),
          after: fmtAcc(bAcc),
        });
      }
      const aReal = ickEmptyZero(before.realisasi?.[pid]);
      const bReal = ickEmptyZero(office.realisasi?.[pid]);
      if (aReal !== bReal) {
        changes.push({
          ickId: pid,
          group,
          aspect: "Realisasi",
          field: `${group} · Realisasi`,
          before: fmtAcc(aReal),
          after: fmtAcc(bReal),
        });
      }
      const aInd = ickEmptyZero(before.ind?.[pid]);
      const bInd = ickEmptyZero(office.ind?.[pid]);
      if (aInd !== bInd) {
        changes.push({
          group,
          aspect: "Indikator",
          field: `${group} · Indikator`,
          before: fmtAcc(aInd),
          after: fmtAcc(bInd),
        });
      }
    });
    if (!changes.length) {
      const beforeTotals = capaianComputedTotals(before, programs);
      const afterTotals = capaianComputedTotals(office, programs);
      if (beforeTotals.totalAcc !== afterTotals.totalAcc) {
        changes.push({
          group: "Ringkasan KPwDN",
          aspect: "Total Target 2026",
          field: "Total Target 2026 (semua ICK)",
          before: fmtAcc(beforeTotals.totalAcc),
          after: fmtAcc(afterTotals.totalAcc),
        });
      }
      if (beforeTotals.totalRealisasi !== afterTotals.totalRealisasi) {
        changes.push({
          group: "Ringkasan KPwDN",
          aspect: "Total Realisasi",
          field: "Total Realisasi (semua ICK)",
          before: fmtAcc(beforeTotals.totalRealisasi),
          after: fmtAcc(afterTotals.totalRealisasi),
        });
      }
    }
    return changes;
  }

  function buildCapaianCreateChanges(office, programs) {
    const changes = [];
    programs.forEach((prog) => {
      const target = Number(office.acc?.[prog.id] ?? office.accBase?.[prog.id] ?? 0);
      const real = Number(office.realisasi?.[prog.id] ?? 0);
      if (target > 0) {
        changes.push({
          group: prog.name,
          aspect: "Target 2026",
          field: `${prog.name} · Target 2026`,
          before: "-",
          after: fmtAcc(target),
        });
      }
      if (real > 0) {
        changes.push({
          group: prog.name,
          aspect: "Realisasi",
          field: `${prog.name} · Realisasi`,
          before: "-",
          after: fmtAcc(real),
        });
      }
    });
    if (!changes.length) {
      changes.push({
        group: "Ringkasan KPwDN",
        aspect: "Total Target 2026",
        field: "Total Target 2026",
        before: "-",
        after: fmtAcc(office.totalAcc),
      });
    }
    return changes;
  }

  function makeAuditEntry(partial) {
    const actor = currentActor();
    const changes = Array.isArray(partial.changes) ? partial.changes.filter((row) => row?.field) : [];
    const details = partial.details?.length ? partial.details : changes.length ? formatAuditChanges(changes) : [];
    return {
      id: `h${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      actor: actor.name,
      actorRole: actor.role,
      actorUser: actor.user,
      module: partial.module || "database",
      action: partial.action || "update",
      summary: partial.summary || "",
      target: partial.target || "",
      context: partial.context ?? summarizeAuditChanges(changes, partial.module || "database"),
      changes,
      details: Array.isArray(details) ? details.filter(Boolean) : [],
    };
  }

  function diffRecordFields(prev, next) {
    const changes = [];
    AUDIT_DB_FIELDS.forEach((key) => {
      const before = String(prev?.[key] ?? "").trim() || "-";
      const after = String(next?.[key] ?? "").trim() || "-";
      if (before !== after) {
        const aspect = AUDIT_FIELD_LABELS[key] || key;
        changes.push({
          group: next?.nama || prev?.nama || "Data UMKM/PUS",
          aspect,
          field: aspect,
          before,
          after,
        });
      }
    });
    return changes;
  }

  function parseAuditDetailLine(line) {
    const raw = String(line || "")
      .trim()
      .replace(/\u2192/g, " -> ");
    if (!raw) return null;
    const quoted = raw.match(/^(.+?):\s*"([^"]*)"\s*->\s*"([^"]*)"$/);
    if (quoted) {
      return { field: quoted[1].trim(), before: quoted[2] || "-", after: quoted[3] || "-" };
    }
    const plain = raw.match(/^(.+?):\s*(.+?)\s->\s(.+)$/);
    if (plain) {
      const name = plain[1].trim();
      const before = plain[2].trim() || "-";
      const after = plain[3].trim() || "-";
      if (name === "Target 2026" || name === "Realisasi" || name === "Indikator") {
        return {
          group: "Ringkasan KPwDN",
          aspect: name,
          field: name === "Target 2026" ? "Total Target 2026 (semua ICK)" : `Total ${name} (semua ICK)`,
          before,
          after,
        };
      }
      return { group: name, aspect: "Target 2026", field: `${name} · Target 2026`, before, after };
    }
    const single = raw.match(/^(.+?):\s*(.+)$/);
    if (single) {
      const name = single[1].trim();
      const after = single[2].trim() || "-";
      if (AUDIT_FIELD_LABELS && Object.values(AUDIT_FIELD_LABELS).includes(name)) {
        return { group: "Data UMKM/PUS", aspect: name, field: name, before: "-", after };
      }
      return { group: name, aspect: "Info", field: name, before: "-", after };
    }
    return { field: "Info", before: "-", after: raw };
  }

  function normalizeAuditChanges(entry) {
    if (Array.isArray(entry?.changes) && entry.changes.length) return entry.changes;
    return (entry?.details || []).map(parseAuditDetailLine).filter(Boolean);
  }

  function auditChangesHtml(entry) {
    const changes = normalizeAuditChanges(entry);
    if (!changes.length) return "—";
    const rows = changes
      .slice(0, 6)
      .map((row) => {
        const group = row.group || "";
        const aspect = row.aspect || auditChangeDisplay(row);
        const desc = group
          ? `<strong class="history-change-group">${escapeHtml(group)}</strong><span class="history-change-aspect">${escapeHtml(aspect)}</span>`
          : `<span class="history-change-aspect-only">${escapeHtml(aspect)}</span>`;
        return `<tr>
          <td class="history-change-desc">${desc}</td>
          <td class="history-change-before">${escapeHtml(row.before ?? "-")}</td>
          <td class="history-change-after">${escapeHtml(row.after ?? "-")}</td>
        </tr>`;
      })
      .join("");
    const more =
      changes.length > 6
        ? `<tr><td colspan="3" class="history-change-more">+${changes.length - 6} perubahan lainnya</td></tr>`
        : "";
    return `<table class="history-changes-mini"><thead><tr><th>Keterangan</th><th>Sebelum</th><th>Sesudah</th></tr></thead><tbody>${rows}${more}</tbody></table>`;
  }

  function entryPdfChanges(entry) {
    const changes = normalizeAuditChanges(entry);
    if (changes.length) return changes;
    if (entry.action === "import" || entry.action === "replace") {
      return (entry.details || []).map((detail) => ({ field: "Ringkasan", before: "-", after: detail }));
    }
    return [];
  }

  function groupAuditChanges(changes) {
    const groups = [];
    const index = new Map();
    (changes || []).forEach((row) => {
      const key = row.group || row.aspect || "Perubahan";
      if (!index.has(key)) {
        index.set(key, groups.length);
        groups.push({ label: key, rows: [] });
      }
      groups[index.get(key)].rows.push(row);
    });
    return groups;
  }

  function pdfHistoryMetaHeight(entry) {
    let h = 24;
    if (entry.target) h += 4.2;
    if (entry.context) h += 4.2;
    return h;
  }

  function pdfHistoryChangesHeight(changes, maxRows = 14) {
    if (!changes.length) return 6;
    const groups = groupAuditChanges(changes);
    let rows = 0;
    let headers = 0;
    groups.forEach((group) => {
      headers += 1;
      rows += group.rows.length;
      if (rows >= maxRows) return;
    });
    const shownRows = Math.min(rows, maxRows);
    const shownHeaders = Math.min(headers, groups.length);
    return 5.2 + shownHeaders * 4.6 + shownRows * 4.4 + (rows > maxRows ? 4.4 : 0) + 2;
  }

  function pdfDrawHistoryMeta(pdf, entry, x, y, width, colors) {
    const { navy, muted, line } = colors;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(x, y, width, pdfHistoryMetaHeight(entry), "F");
    pdf.setDrawColor(...line);
    pdf.setLineWidth(0.15);
    pdf.line(x, y, x + width, y);
    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text(pdfFit(pdf, entry.summary || "Perubahan data", width - 4), x + 2, y + 5.2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.2);
    pdf.setTextColor(...muted);
    let dy = 10.2;
    pdf.text(pdfFit(pdf, `Waktu: ${formatHistoryWhen(entry.at)}`, width - 4), x + 2, y + dy);
    dy += 4.2;
    pdf.text(
      pdfFit(
        pdf,
        `Pelaku: ${entry.actor}  |  Modul: ${AUDIT_MODULE_LABELS[entry.module] || entry.module}  |  Aksi: ${AUDIT_ACTION_LABELS[entry.action] || entry.action}`,
        width - 4
      ),
      x + 2,
      y + dy
    );
    dy += 4.2;
    if (entry.target) {
      pdf.text(pdfFit(pdf, `Objek: ${entry.target}`, width - 4), x + 2, y + dy);
      dy += 4.2;
    }
    if (entry.context) {
      pdf.setTextColor(0, 72, 120);
      pdf.text(pdfFit(pdf, entry.context, width - 4), x + 2, y + dy);
    }
    return y + pdfHistoryMetaHeight(entry);
  }

  function pdfDrawHistoryChangesTable(pdf, changes, entry, x, y, width, colors) {
    const { muted, line, navy } = colors;
    const maxRows = 14;
    const colGroup = width * 0.34;
    const colAspect = width * 0.22;
    const colBefore = width * 0.2;
    const colAfter = width * 0.2;
    const rowH = 4.4;
    const groupH = 4.6;
    const isCapaian = entry.module === "capaian";
    pdf.setFillColor(236, 242, 248);
    pdf.rect(x, y, width, 5.2, "F");
    pdf.setDrawColor(...line);
    pdf.setLineWidth(0.15);
    pdf.line(x, y + 5.2, x + width, y + 5.2);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...muted);
    pdf.text(isCapaian ? "Program ICK" : "Data / UMKM", x + 1.5, y + 3.6);
    pdf.text("Jenis", x + colGroup + 1.5, y + 3.6);
    pdf.text("Sebelum", x + colGroup + colAspect + 1.5, y + 3.6);
    pdf.text("Sesudah", x + colGroup + colAspect + colBefore + 1.5, y + 3.6);
    y += 5.2;
    let shown = 0;
    const groups = groupAuditChanges(changes);
    groups.forEach((group) => {
      if (shown >= maxRows) return;
      pdf.setFillColor(245, 248, 252);
      pdf.rect(x, y, width, groupH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.2);
      pdf.setTextColor(...navy);
      pdf.text(pdfFit(pdf, group.label, width - 3), x + 1.5, y + 3.2);
      y += groupH;
      pdf.setFont("helvetica", "normal");
      group.rows.forEach((row) => {
        if (shown >= maxRows) return;
        if (shown % 2 === 1) {
          pdf.setFillColor(252, 253, 254);
          pdf.rect(x, y, width, rowH, "F");
        }
        const aspect = row.aspect || auditChangeDisplay(row);
        pdf.setFontSize(7);
        pdf.setTextColor(80, 96, 112);
        pdf.text(pdfFit(pdf, aspect, colAspect - 2), x + colGroup + 1.5, y + 3.1);
        pdf.setTextColor(140, 45, 45);
        pdf.text(pdfFit(pdf, String(row.before ?? "-"), colBefore - 2), x + colGroup + colAspect + 1.5, y + 3.1);
        pdf.setTextColor(25, 95, 55);
        pdf.text(pdfFit(pdf, String(row.after ?? "-"), colAfter - 2), x + colGroup + colAspect + colBefore + 1.5, y + 3.1);
        y += rowH;
        shown += 1;
      });
    });
    if (changes.length > maxRows) {
      pdf.setFontSize(7);
      pdf.setTextColor(...muted);
      pdf.text(`+${changes.length - maxRows} baris perubahan lainnya`, x + 1.5, y + 3.2);
      y += rowH;
    }
    pdf.setDrawColor(...line);
    pdf.line(x, y, x + width, y);
    return y + 1.5;
  }

  function buildDatabaseAuditEntries(prev, next, audit = {}) {
    if (audit.skip) return [];
    if (audit.action === "replace") {
      return [
        makeAuditEntry({
          module: "database",
          action: "replace",
          summary: `Mengganti seluruh Database UMKM/PUS (${fmtNum(next.length)} baris)`,
          target: audit.target || "Seluruh database",
          details: audit.details || [`Total baris setelah penggantian: ${fmtNum(next.length)}`],
        }),
      ];
    }
    if (audit.action === "import") {
      return [
        makeAuditEntry({
          module: "database",
          action: "import",
          summary:
            audit.summary ||
            `Unggah Excel Database UMKM/PUS — ${fmtNum(audit.added || 0)} baru, ${fmtNum(audit.updated || 0)} diperbarui`,
          target: audit.target || kpwScopeLabel(),
          details: audit.details || [],
        }),
      ];
    }
    const prevById = new Map(prev.map((row) => [row.id, row]));
    const nextById = new Map(next.map((row) => [row.id, row]));
    const entries = [];
    next.forEach((row) => {
      if (prevById.has(row.id)) return;
      entries.push(
        makeAuditEntry({
          module: "database",
          action: "create",
          summary: `Menambah UMKM/PUS · ${row.nama}`,
          target: row.nama,
          changes: [
            { group: row.nama, aspect: "Nama UMKM/PUS", field: "Nama UMKM/PUS", before: "-", after: row.nama || "-" },
            { group: row.nama, aspect: "KPwDN pengampu", field: "KPwDN pengampu", before: "-", after: asalKpwLabel(row.kpwdn) },
            { group: row.nama, aspect: "Jenis", field: "Jenis", before: "-", after: row.jenis || "-" },
            { group: row.nama, aspect: "ICK/Fasilitas", field: "ICK/Fasilitas", before: "-", after: row.fasilitas || "-" },
            { group: row.nama, aspect: "Komoditas", field: "Komoditas", before: "-", after: row.komoditas || "-" },
            { group: row.nama, aspect: "Tahun", field: "Tahun", before: "-", after: row.tahun || "-" },
          ],
        })
      );
    });
    prev.forEach((row) => {
      if (nextById.has(row.id)) return;
      entries.push(
        makeAuditEntry({
          module: "database",
          action: "delete",
          summary: `Menghapus UMKM/PUS · ${row.nama}`,
          target: row.nama,
          changes: [
            { group: row.nama, aspect: "Nama UMKM/PUS", field: "Nama UMKM/PUS", before: row.nama || "-", after: "(dihapus)" },
            { group: row.nama, aspect: "KPwDN pengampu", field: "KPwDN pengampu", before: asalKpwLabel(row.kpwdn), after: "(dihapus)" },
            { group: row.nama, aspect: "ICK/Fasilitas", field: "ICK/Fasilitas", before: row.fasilitas || "-", after: "(dihapus)" },
          ],
        })
      );
    });
    next.forEach((row) => {
      const before = prevById.get(row.id);
      if (!before) return;
      const changes = diffRecordFields(before, row);
      if (!changes.length) return;
      entries.push(
        makeAuditEntry({
          module: "database",
          action: "update",
          summary: buildDatabaseUpdateSummary(row, changes),
          target: row.nama,
          changes,
        })
      );
    });
    return entries;
  }

  function buildCapaianAuditEntries(prev, next, audit = {}) {
    if (audit.skip) return [];
    if (audit.action === "replace") {
      return [
        makeAuditEntry({
          module: "capaian",
          action: "replace",
          summary: `Mengganti seluruh Capaian ICK (${fmtNum((next.offices || []).length)} kantor)`,
          target: audit.target || "Seluruh capaian ICK",
          details: audit.details || [],
        }),
      ];
    }
    if (audit.action === "import") {
      return [
        makeAuditEntry({
          module: "capaian",
          action: "import",
          summary:
            audit.summary ||
            `Unggah Excel Capaian ICK — ${fmtNum(audit.count || 0)} kantor diperbarui`,
          target: audit.target || kpwScopeLabel(),
          details: audit.details || [],
        }),
      ];
    }
    const prevNorm = recomputeCapaianTotals(JSON.parse(JSON.stringify(prev)));
    const nextNorm = recomputeCapaianTotals(JSON.parse(JSON.stringify(next)));
    const prevOffices = prevNorm.offices || [];
    const nextOffices = nextNorm.offices || [];
    const prevByKey = new Map(prevOffices.map((office) => [capaianOfficeKey(office), office]));
    const nextByKey = new Map(nextOffices.map((office) => [capaianOfficeKey(office), office]));
    const programs = nextNorm.programs || prevNorm.programs || [];
    const entries = [];
    nextOffices.forEach((office) => {
      const key = capaianOfficeKey(office);
      if (prevByKey.has(key)) return;
      entries.push(
        makeAuditEntry({
          module: "capaian",
          action: "create",
          summary: `Menambah Capaian ICK · ${accOfficeLabel(office)}`,
          target: accOfficeLabel(office),
          changes: buildCapaianCreateChanges(office, programs),
        })
      );
    });
    prevOffices.forEach((office) => {
      const key = capaianOfficeKey(office);
      if (nextByKey.has(key)) return;
      const deleteChanges = buildCapaianCreateChanges(office, programs);
      entries.push(
        makeAuditEntry({
          module: "capaian",
          action: "delete",
          summary: `Menghapus Capaian ICK · ${accOfficeLabel(office)}`,
          target: accOfficeLabel(office),
          changes: deleteChanges.length
            ? deleteChanges.map((row) => ({
                ...row,
                before: row.after,
                after: "(dihapus)",
              }))
            : [
                {
                  group: accOfficeLabel(office),
                  aspect: "Capaian ICK",
                  field: "Capaian ICK",
                  before: accOfficeLabel(office),
                  after: "(dihapus)",
                },
              ],
        })
      );
    });
    nextOffices.forEach((office) => {
      const key = capaianOfficeKey(office);
      const before = prevByKey.get(key);
      if (!before || JSON.stringify(before) === JSON.stringify(office)) return;
      const changes = buildCapaianOfficeChanges(before, office, programs);
      if (!changes.length) return;
      entries.push(
        makeAuditEntry({
          module: "capaian",
          action: "update",
          summary: buildCapaianUpdateSummary(accOfficeLabel(office), changes),
          target: accOfficeLabel(office),
          changes: changes.slice(0, 20),
        })
      );
    });
    return entries;
  }

  async function appendAuditLog(entries) {
    if (!entries?.length) return;
    auditLog = [...entries, ...auditLog].slice(0, HISTORY_MAX);
    await saveHistory();
    if (state.view === "history" && canView("history")) renderHistory();
  }

  async function persistRecords(next, audit = {}) {
    const prevSnapshot = records.map((row) => ({ ...row }));
    let toSave = next;
    if (isKpwScoped()) {
      const selfKey = String(state.kpwSelfKey || "").trim();
      if (!selfKey) {
        flash("Pilih KPwDN pengampu Anda terlebih dahulu.", true);
        return false;
      }
      const prevById = new Map(records.map((row) => [row.id, row]));
      const nextById = new Map(toSave.map((row) => [row.id, row]));
      for (const prev of records) {
        if (!nextById.has(prev.id) && !recordIsKpwSelf(prev)) {
          flash("Anda hanya dapat menghapus data UMKM/PUS KPwDN pengampu Anda.", true);
          return false;
        }
      }
      for (const row of toSave) {
        if (!prevById.has(row.id) && !rowMatchesKpwPick(row, selfKey)) {
          flash("Anda hanya dapat menambah data untuk KPwDN pengampu Anda.", true);
          return false;
        }
      }
      for (const row of toSave) {
        const prev = prevById.get(row.id);
        if (!prev || recordIsKpwSelf(prev)) continue;
        if (JSON.stringify(prev) !== JSON.stringify(row)) {
          flash("Anda hanya dapat mengubah data UMKM/PUS KPwDN pengampu Anda.", true);
          return false;
        }
      }
      const merged = records
        .filter((prev) => (recordIsKpwSelf(prev) ? nextById.has(prev.id) : true))
        .map((prev) => (recordIsKpwSelf(prev) ? nextById.get(prev.id) : prev));
      toSave.forEach((row) => {
        if (!prevById.has(row.id) && rowMatchesKpwPick(row, selfKey)) merged.push(row);
      });
      toSave = merged;
    }
    try {
      await saveRecords(toSave);
      records = toSave;
      const entries = buildDatabaseAuditEntries(prevSnapshot, toSave, audit);
      if (entries.length) await appendAuditLog(entries);
      return true;
    } catch (err) {
      flash(err.message || "Gagal menyimpan data.", true);
      return false;
    }
  }

  function loadUpdatedAt() {
    const raw = Number(localStorage.getItem(UPDATED_KEY));
    if (Number.isFinite(raw) && raw > 0) return raw;
    const stamp = Date.now();
    localStorage.setItem(UPDATED_KEY, String(stamp));
    return stamp;
  }

  function formatDataDate(ms) {
    return new Date(ms).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  let records = [];
  let ickCapaianLive = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function unique(key) {
    if (key === "fasilitas") {
      const map = {};
      records.forEach((row) => {
        const label = ickLabel(row.fasilitas);
        const fold = label.toLowerCase();
        map[fold] = map[fold] || { label, n: 0 };
        map[fold].n += 1;
        if (label !== "N/A") map[fold].label = label;
      });
      return Object.values(map)
        .filter((item) => item.label !== "N/A")
        .sort((a, b) => a.label.localeCompare(b.label, "id"))
        .map((item) => item.label);
    }
    return [...new Set(records.map((row) => row[key]).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "id")
    );
  }

  function flash(message, isError) {
    const el = document.getElementById("flash");
    if (!el) return;
    el.hidden = false;
    el.classList.toggle("error", Boolean(isError));
    el.textContent = message;
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => {
      el.hidden = true;
    }, 4200);
  }

  function cellText(value) {
    if (value == null) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return String(value.getFullYear());
    }
    return String(value).replace(/\s+/g, " ").trim();
  }

  function normalizeHeader(value) {
    return cellText(value)
      .toLowerCase()
      .replace(/[/_]+/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function mapHeader(label) {
    const h = normalizeHeader(label);
    if (!h) return null;
    if (h === "no" || h === "nomor" || h === "no urut") return "no";
    if (h === "nama umkm" || h === "nama umkm pus" || h === "nama umkm/pus") return "nama";
    if (h === "komoditas") return "komoditas";
    if (/\bick\b/.test(h) && !/tahun/.test(h)) return "fasilitas";
    if (h === "tahun fasilitas" || h === "tahun fasilitasi") return "tahun";
    if (/^asal kpw$|^asal kpwdn$/.test(h)) return "kpwdn";
    if (/jenis produk|komoditi|^produk$/.test(h)) return "komoditas";
    if (/(nama).*(umkm|pus|perusahaan|usaha)|^(nama|umkm|pus)$/.test(h)) return "nama";
    if (/^jenis$|^tipe$/.test(h)) return "jenis";
    if (/(^| )fasilitas( |$)|program|bantuan/.test(h) && !/tahun/.test(h)) return "fasilitas";
    if (/tahun|year|periode/.test(h)) return "tahun";
    if (/kpwdn|kpwbi|kantor perwakilan|pengampu|^kpw$|asal kpw/.test(h)) return "kpwdn";
    if (/lokasi|kabupaten|kota|alamat|daerah/.test(h)) return "lokasi";
    if (/^status$/.test(h)) return "status";
    if (/keterangan|catatan|deskripsi/.test(h)) return "keterangan";
    return null;
  }

  function parseYear(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getFullYear();
    if (typeof value === "number" && Number.isFinite(value)) {
      if (value >= 1900 && value <= 2100) return Math.round(value);
      if (value > 20000 && value < 60000) {
        const excelEpoch = new Date(Math.round((value - 25569) * 86400 * 1000));
        if (!Number.isNaN(excelEpoch.getTime())) return excelEpoch.getFullYear();
      }
    }
    const match = cellText(value).match(/(?:19|20)\d{2}/);
    return match ? Number(match[0]) : "";
  }

  function parseJenis(value, nama) {
    const text = `${cellText(value)} ${cellText(nama)}`.toUpperCase();
    return /\bPUS\b/.test(text) ? "PUS" : "UMKM";
  }

  function isPusFasilitas(fasilitas) {
    const text = String(fasilitas || "");
    return /\bikra\b/i.test(text) || /\bponpes\b/i.test(text) || /pondok\s*pesantren/i.test(text);
  }

  function classifyJenis(row) {
    if (isPusFasilitas(row && row.fasilitas)) return "PUS";
    return parseJenis(row && row.jenis, row && row.nama);
  }

  function recordKey(row) {
    return [row.nama, row.tahun, row.kpwdn]
      .map((part) => cellText(part).toLowerCase())
      .join("|");
  }

  function mappingFromHeaderRow(cells) {
    const mapping = {};
    const kertas = {
      no: "no",
      nomor: "no",
      "nama umkm": "nama",
      "nama umkm pus": "nama",
      komoditas: "komoditas",
      ick: "fasilitas",
      "jenis ick": "fasilitas",
      "kode ick": "fasilitas",
      "nama ick": "fasilitas",
      "ick fasilitas": "fasilitas",
      "tahun fasilitas": "tahun",
      "tahun fasilitasi": "tahun",
      "asal kpw": "kpwdn",
      "asal kpwdn": "kpwdn",
    };
    cells.forEach((cell, index) => {
      const key = kertas[normalizeHeader(cell)];
      if (key && mapping[key] == null) mapping[key] = index;
    });
    cells.forEach((cell, index) => {
      const key = mapHeader(cell);
      if (key && mapping[key] == null) mapping[key] = index;
    });
    return mapping;
  }

  function mappingScore(mapping) {
    if (!mapping || mapping.nama == null) return 0;
    return (
      2 +
      ["komoditas", "fasilitas", "tahun", "kpwdn"].reduce(
        (n, key) => n + (mapping[key] != null ? 1 : 0),
        0
      )
    );
  }

  function isRowNumber(value) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0 && Math.round(value) === value) {
      return true;
    }
    return /^\d+$/.test(cellText(value));
  }

  function usableNama(value) {
    const t = cellText(value);
    if (!t || t === "-" || t === "–" || t === "—" || /^n\/?a$/i.test(t)) return "";
    return t;
  }

  function usableKomoditas(value) {
    const t = cellText(value);
    if (!t) return "";
    if (t === "-" || t === "–" || t === "—" || /^#?n\/?a$/i.test(t)) return "";
    if (/^(?:19|20)\d{2}$/.test(t) || /^\d+$/.test(t)) return "";
    return t;
  }

  function usableIck(value) {
    const t = cellText(value);
    if (!t) return "";
    if (t === "-" || t === "–" || t === "—" || /^#?n\/?a$/i.test(t)) return "";
    return t;
  }

  function ickLabel(name) {
    return usableIck(name) || "N/A";
  }

  function ickMatch(rowValue, selected) {
    const fold = ickLabel(rowValue).toLowerCase();
    return selected.some((item) => ickLabel(item).toLowerCase() === fold);
  }

  function tahunLabel(value) {
    const t = cellText(value);
    if (!t || t === "-" || t === "–" || t === "—" || /^#?n\/?a$/i.test(t)) return "N/A";
    const year = Number(t);
    if (!Number.isFinite(year) || year < 1900 || year > 2100) return "N/A";
    return String(year);
  }

  function parseGrid(grid) {
    if (!grid || !grid.length) {
      return { rows: [], skipped: 0, filename: "" };
    }
    let headerIndex = -1;
    let mapping = null;
    let bestScore = 0;
    for (let i = 0; i < Math.min(grid.length, 25); i += 1) {
      const candidate = mappingFromHeaderRow(grid[i] || []);
      const score = mappingScore(candidate);
      if (score > bestScore) {
        bestScore = score;
        headerIndex = i;
        mapping = candidate;
      }
      if (score >= 6) break;
    }
    if (!mapping) {
      mapping = { nama: 0, komoditas: 1, fasilitas: 2, tahun: 3, kpwdn: 4, jenis: 5, lokasi: 6 };
      headerIndex = -1;
    }
    const start = headerIndex + 1;
    const rows = [];
    let skipped = 0;
    let lastNama = "";
    let lastKpwdn = "";
    let lastIck = "";
    const hasNoCol = mapping.no != null;
    for (let i = start; i < grid.length; i += 1) {
      const cells = grid[i] || [];
      const get = (key) => (mapping[key] == null ? "" : cells[mapping[key]]);
      const noText = cellText(get("no"));
      const numbered = isRowNumber(get("no"));
      const nonempty = cells.some((cell) => cellText(cell));
      if (hasNoCol) {
        if (!numbered) {
          if (nonempty) skipped += 1;
          continue;
        }
      } else if (!nonempty) {
        continue;
      }
      const rawNama = usableNama(get("nama"));
      const rawIck = usableIck(get("fasilitas"));
      if (rawNama) {
        lastNama = rawNama;
        lastIck = rawIck;
      }
      let nama = rawNama || lastNama;
      if (!nama && numbered) nama = cellText(get("nama")) || `Tanpa nama (${noText})`;
      const kpwdn = cellText(get("kpwdn")) || lastKpwdn;
      const komoditas = usableKomoditas(get("komoditas"));
      const tahun = parseYear(get("tahun"));
      const fasilitas = rawIck || lastIck;
      if (rawIck) lastIck = rawIck;
      if (kpwdn) lastKpwdn = kpwdn;
      if (!nama) {
        skipped += 1;
        continue;
      }
      rows.push({
        nama,
        jenis: classifyJenis({ jenis: get("jenis"), nama, fasilitas }),
        komoditas,
        fasilitas,
        tahun,
        kpwdn,
        lokasi: cellText(get("lokasi")),
        status: cellText(get("status")) || "Aktif",
        keterangan: cellText(get("keterangan")),
      });
    }
    return { rows, skipped, score: bestScore };
  }

  function applyColumnMerges(sheet, grid, colIndex) {
    if (colIndex == null || !sheet || !sheet["!merges"]) return;
    sheet["!merges"].forEach((range) => {
      if (range.s.c > colIndex || range.e.c < colIndex) return;
      const src = grid[range.s.r] && grid[range.s.r][colIndex];
      if (!cellText(src)) return;
      for (let r = range.s.r; r <= range.e.r; r += 1) {
        if (!grid[r]) continue;
        if (!cellText(grid[r][colIndex])) grid[r][colIndex] = src;
      }
    });
  }

  const TEMPLATE_XLSX_PATH = "contoh/Template Database UMKM PUS dan ICK.xlsx";
  const TEMPLATE_XLSX_NAME = "Template Database UMKM PUS dan ICK.xlsx";
  const TEMPLATE_BUNDLE_VERSION = "20260829i";
  const SHEET_DATABASE_UMKM = "Database UMKM PUS";
  const SHEET_CAPAIAN_ICK = "Capaian ICK";

  function bundledTemplateUrl() {
    const url = new URL(TEMPLATE_XLSX_PATH, document.baseURI);
    url.searchParams.set("v", TEMPLATE_BUNDLE_VERSION);
    return url.href;
  }

  function isZipBuffer(buffer) {
    if (!buffer || buffer.byteLength < 4) return false;
    const bytes = new Uint8Array(buffer);
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
  }

  function normalizeSheetName(name) {
    return String(name || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function pickSheetName(sheetNames, target) {
    const want = normalizeSheetName(target);
    return (sheetNames || []).find((name) => normalizeSheetName(name) === want) || null;
  }

  function parseSpreadsheetSheet(workbook, sheetName, file) {
    const sheet = workbook.Sheets[sheetName];
    const grid = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: true,
      blankrows: true,
    });
    let mapping = null;
    let bestScore = 0;
    for (let i = 0; i < Math.min(grid.length, 25); i += 1) {
      const candidate = mappingFromHeaderRow(grid[i] || []);
      const score = mappingScore(candidate);
      if (score > bestScore) {
        bestScore = score;
        mapping = candidate;
      }
      if (score >= 6) break;
    }
    if (mapping) {
      applyColumnMerges(sheet, grid, mapping.nama);
      applyColumnMerges(sheet, grid, mapping.fasilitas);
      applyColumnMerges(sheet, grid, mapping.kpwdn);
    }
    const parsed = parseGrid(grid);
    parsed.filename = file.name;
    parsed.sheet = sheetName;
    parsed.score = bestScore;
    return parsed;
  }

  function parseSpreadsheet(file, buffer) {
    if (!window.XLSX) {
      throw new Error("Pustaka Excel belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
    }
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    if (!workbook.SheetNames.length) throw new Error("Berkas tidak berisi lembar kerja.");
    const named = pickSheetName(workbook.SheetNames, SHEET_DATABASE_UMKM);
    if (named) {
      const chosen = parseSpreadsheetSheet(workbook, named, file);
      if (!chosen.rows.length) {
        throw new Error(`Lembar "${SHEET_DATABASE_UMKM}" kosong atau kolom tidak dikenali.`);
      }
      return chosen;
    }
    let best = null;
    workbook.SheetNames.forEach((sheetName) => {
      const parsed = parseSpreadsheetSheet(workbook, sheetName, file);
      const bonus = /rekap all|database umkm/i.test(sheetName) ? 500000000 : /onboarding|digital farming|capaian ick/i.test(sheetName) ? -200000000 : 0;
      const score = bonus + (parsed.score || 0) * 10000 + parsed.rows.length;
      if (!best || score > best.rank) {
        best = { parsed, rank: score };
      }
    });
    if (!best?.parsed?.rows?.length) {
      throw new Error(`Tidak menemukan lembar "${SHEET_DATABASE_UMKM}". Unggah ${TEMPLATE_XLSX_NAME}.`);
    }
    return best.parsed;
  }

  function foldCapaianHeader(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreCapaianGrid(grid) {
    let acc = 0;
    let ind = 0;
    let kpw = 0;
    (grid || []).slice(0, 12).forEach((row) => {
      (row || []).forEach((cell) => {
        const h = foldCapaianHeader(cell);
        if (/target 2026 \(acc\)/.test(h)) acc += 1;
        if (/target 2026 \(ind\)/.test(h)) ind += 1;
        if (h === "kpwdn" || h === "asal kpw") kpw += 1;
      });
    });
    return acc * 10 + ind * 8 + kpw * 5;
  }

  function parseCapaianSpreadsheet(file, buffer) {
    if (!window.XLSX) {
      throw new Error("Pustaka Excel belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
    }
    const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
    if (!workbook.SheetNames.length) throw new Error("Berkas tidak berisi lembar kerja.");
    const named = pickSheetName(workbook.SheetNames, SHEET_CAPAIAN_ICK);
    if (named) {
      const grid = XLSX.utils.sheet_to_json(workbook.Sheets[named], {
        header: 1,
        defval: "",
        raw: true,
        blankrows: false,
      });
      const built = buildCapaianFromGrid(grid, file.name, named);
      if (!built.offices.length) {
        throw new Error(`Lembar "${SHEET_CAPAIAN_ICK}" tidak berisi baris KPwDN yang valid.`);
      }
      return built;
    }
    let best = null;
    workbook.SheetNames.forEach((sheetName) => {
      const grid = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: "",
        raw: true,
        blankrows: false,
      });
      const score = scoreCapaianGrid(grid);
      if (score && (!best || score > best.score)) best = { grid, sheetName, score };
    });
    if (!best || best.score < 10) {
      throw new Error(`Tidak menemukan lembar "${SHEET_CAPAIAN_ICK}". Unggah ${TEMPLATE_XLSX_NAME}.`);
    }
    return buildCapaianFromGrid(best.grid, file.name, best.sheetName);
  }

  function buildCapaianFromGrid(grid, filename, sheetName) {
    const offices = [];
    grid.forEach((row) => {
      const no = ickEmptyZero(row?.[0]);
      const kpwdn = String(row?.[4] || "").replace(/\s+/g, " ").trim();
      const kpw = String(row?.[3] || "").replace(/\s+/g, " ").trim();
      const wilayah = String(row?.[2] || "").replace(/\s+/g, " ").trim();
      if (!no || no > 200) return;
      if (!kpwdn && !kpw) return;
      if (/^total$/i.test(String(row?.[0] || ""))) return;
      const acc = {};
      const accBase = {};
      const revised = {};
      const ind = {};
      const realisasi = {};
      ICK_COLMAP.forEach((item) => {
        const base = ickEmptyZero(row[item.acc]);
        const hasRev = item.revised != null;
        const revRaw = hasRev ? row[item.revised] : "";
        const revEmpty = revRaw == null || String(revRaw).trim() === "";
        const used = hasRev && !revEmpty ? ickEmptyZero(revRaw) : base;
        accBase[item.id] = base;
        if (hasRev && !revEmpty) revised[item.id] = ickEmptyZero(revRaw);
        acc[item.id] = used;
        ind[item.id] = ickEmptyZero(row[item.ind]);
        realisasi[item.id] = ickEmptyZero(row[item.realisasi]);
      });
      offices.push({
        no,
        tier: String(row?.[1] || "").trim(),
        wilayah,
        kpw: kpw || kpwdn,
        kpwdn: kpwdn || kpw,
        acc,
        accBase,
        revised,
        ind,
        realisasi,
        totalAcc: 0,
        totalRealisasi: 0,
        totalInd: 0,
      });
    });
    return recomputeCapaianTotals({
      source: filename || "Unggahan Rekap Capaian ICK",
      sheet: sheetName || "",
      year: 2026,
      metric: "Target 2026 (Acc) Revised",
      metricFallback: "Target 2026 (Acc)",
      programs: ICK_COLMAP.map(({ id, code, name, hasRevised }) => ({ id, code, name, hasRevised })),
      offices,
    });
  }

  function existingKeys() {
    return new Set(records.map(recordKey));
  }

  function decorateImport(parsed) {
    let rows = parsed.rows || [];
    let ignoredOtherRows = 0;
    if (isKpwScoped()) {
      const selfKey = String(state.kpwSelfKey || "").trim();
      if (!selfKey) {
        return { ...parsed, rows: [], fresh: [], duplicates: [], matched: [], ignoredOtherRows: rows.length };
      }
      const all = rows;
      rows = all
        .filter((row) => rowMatchesKpwPick(row, selfKey))
        .map((row) => ({ ...row, kpwdn: selfKey, jenis: classifyJenis({ ...row, kpwdn: selfKey }) }));
      ignoredOtherRows = Math.max(0, all.length - rows.length);
    }
    const have = existingKeys();
    const fresh = [];
    const duplicates = [];
    const matched = [];
    rows.forEach((row) => {
      if (have.has(recordKey(row))) {
        duplicates.push(row);
        matched.push(row);
      } else {
        fresh.push(row);
      }
    });
    return { ...parsed, rows, fresh, duplicates, matched, ignoredOtherRows };
  }

  function mergeDatabaseRows(incoming) {
    const selfKey = isKpwScoped() ? String(state.kpwSelfKey || "").trim() : "";
    let added = 0;
    let updated = 0;
    const next = records.map((row) => ({ ...row }));
    const indexByKey = new Map(next.map((row, i) => [recordKey(row), i]));
    (incoming || []).forEach((row, i) => {
      if (selfKey && !rowMatchesKpwPick(row, selfKey)) return;
      const normalized = {
        ...row,
        kpwdn: selfKey || row.kpwdn,
        jenis: classifyJenis({ ...row, kpwdn: selfKey || row.kpwdn }),
        status: row.status || "Aktif",
      };
      const key = recordKey(normalized);
      if (indexByKey.has(key)) {
        const idx = indexByKey.get(key);
        const prev = next[idx];
        if (selfKey && !rowMatchesKpwPick(prev, selfKey)) return;
        next[idx] = {
          ...prev,
          ...normalized,
          id: prev.id,
          lokasi: normalized.lokasi || prev.lokasi || "",
          keterangan: normalized.keterangan ?? prev.keterangan ?? "",
        };
        updated += 1;
      } else {
        if (selfKey && !rowMatchesKpwPick(normalized, selfKey)) return;
        next.push({
          ...normalized,
          id: `u${Date.now()}-${i}`,
          lokasi: normalized.lokasi || "",
        });
        indexByKey.set(key, next.length - 1);
        added += 1;
      }
    });
    return { rows: next, added, updated };
  }

  async function applyImportedRows(rows, replace, auditExtra = {}) {
    if (isKpwScoped()) {
      const { rows: next, added, updated } = mergeDatabaseRows(rows);
      if (!(await persistRecords(next, { action: "import", added, updated, target: kpwScopeLabel(), ...auditExtra })))
        return;
      state.page = 1;
      state.importDraft = null;
      closeModal();
      render();
      flash(
        `Data ${state.kpwSelfKey} diperbarui: ${fmtNum(added)} baru, ${fmtNum(updated)} diperbarui. Data KPwDN lain tidak berubah.`
      );
      return;
    }
    const stamped = rows.map((row, i) => ({
      id: `u${i + 1}`,
      ...row,
      status: row.status || "Aktif",
    }));
    const next = replace ? stamped : records.concat(stamped.map((row, i) => ({ ...row, id: `u${records.length + i + 1}` })));
    const audit = replace
      ? { action: "replace", target: "Seluruh database", ...auditExtra }
      : {
          action: "import",
          added: auditExtra.added ?? stamped.length,
          updated: auditExtra.updated ?? 0,
          target: auditExtra.target || "Database UMKM/PUS",
          ...auditExtra,
        };
    if (!(await persistRecords(next, audit))) return;
    state.page = 1;
    state.importDraft = null;
    closeModal();
    render();
    flash(
      replace
        ? `${fmtNum(stamped.length)} baris dari Excel mengganti seluruh database.`
        : `${fmtNum(stamped.length)} baris dari Excel ditambahkan ke database.`
    );
  }

  function downloadTemplate() {
    downloadDbTemplate();
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function isTemplateMeta(meta) {
    return meta && typeof meta === "object" && meta.base64 && meta.name;
  }

  async function loadTemplateMeta(key) {
    try {
      const fromIdb = await idbGet(key);
      if (isTemplateMeta(fromIdb)) return fromIdb;
    } catch (_) {
      /* ignore */
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isTemplateMeta(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  async function saveTemplateMeta(key, meta) {
    try {
      await idbSet(key, meta);
    } catch (_) {
      /* localStorage fallback */
    }
    try {
      localStorage.setItem(key, JSON.stringify(meta));
      return true;
    } catch (_) {
      try {
        localStorage.removeItem(key);
      } catch (__) {
        /* ignore */
      }
      return false;
    }
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function downloadBundledTemplate() {
    const url = bundledTemplateUrl();
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return false;
      const buffer = await res.arrayBuffer();
      if (!isZipBuffer(buffer) || buffer.byteLength < 100000) return false;
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      triggerBlobDownload(blob, TEMPLATE_XLSX_NAME);
      flash(`Template diunduh: ${TEMPLATE_XLSX_NAME} (Database UMKM/PUS & Capaian ICK).`);
      return true;
    } catch (_) {
      return false;
    }
  }

  function downloadBundledTemplateDirect() {
    try {
      const a = document.createElement("a");
      a.href = bundledTemplateUrl();
      a.download = TEMPLATE_XLSX_NAME;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      flash(`Template diunduh: ${TEMPLATE_XLSX_NAME} (Database UMKM/PUS & Capaian ICK).`);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function downloadOfficialTemplate() {
    if (!can("canDownloadTemplate")) {
      flash("Akun ini tidak dapat mengunduh template.", true);
      return;
    }
    if (await downloadBundledTemplate()) return;
    if (downloadBundledTemplateDirect()) return;
    flash(
      `Gagal mengunduh ${TEMPLATE_XLSX_NAME}. Periksa koneksi internet lalu muat ulang halaman (Cmd+Shift+R).`,
      true
    );
  }

  function downloadDbTemplate() {
    return downloadOfficialTemplate();
  }

  function downloadCapaianTemplate() {
    return downloadOfficialTemplate();
  }

  async function ingestTemplateFile(file, key, label) {
    if (!can("canUploadTemplate")) {
      flash("Hanya Administrator yang dapat mengunggah template.", true);
      return;
    }
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const meta = {
        name: file.name || label,
        mime: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: file.size,
        updatedAt: Date.now(),
        base64: arrayBufferToBase64(buffer),
      };
      const ok = await saveTemplateMeta(key, meta);
      if (!ok) {
        flash("Gagal menyimpan template di browser. Coba berkas yang lebih kecil.", true);
        return;
      }
      flash(`Template ${label} disimpan: ${meta.name}. Kantor Perwakilan dapat mengunduhnya.`);
    } catch (_) {
      flash("Gagal membaca berkas template.", true);
    }
  }

  function rowMatchesKpwPick(row, pick) {
    const wanted = String(pick || "").replace(/\s+/g, " ").trim();
    if (!wanted) return false;
    const label = asalKpwLabel(row.kpwdn);
    const expanded = wanted.replace(/^Prov\.?\s+/i, "Provinsi ");
    if (label === wanted || label === expanded) return true;
    if (/^Prov(?:insi)?\.?\s+/i.test(wanted)) return false;
    const raw = String(row.kpwdn || "").replace(/\s+/g, " ").trim();
    if (wanted.length < 4) return false;
    const re = new RegExp(wanted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return re.test(raw) || re.test(shortOffice(raw)) || re.test(label);
  }

  function filtered() {
    const nama = state.qNama.trim().toLowerCase();
    const list = records.filter((row) => {
      if (nama && !String(row.nama).toLowerCase().includes(nama)) return false;
      if (state.jenis.length && !state.jenis.includes(String(row.jenis))) return false;
      if (state.komoditas.length && !state.komoditas.includes(String(row.komoditas))) return false;
      if (state.fasilitas.length && !ickMatch(row.fasilitas, state.fasilitas)) return false;
      if (state.tahun.length && !state.tahun.includes(String(row.tahun))) return false;
      if (state.kpwdn.length && !state.kpwdn.some((pick) => rowMatchesKpwPick(row, pick))) return false;
      if (state.wilayah) {
        const region = REGIONS.find((item) => item.id === state.wilayah);
        if (region && !matchesRegion(region, row.kpwdn)) return false;
      }
      return true;
    });
    const dir = state.sortDir === "desc" ? -1 : 1;
    list.sort((a, b) => {
      const av = a[state.sortKey];
      const bv = b[state.sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), "id") * dir;
    });
    return list;
  }

  function uniqueKpwLabels() {
    const fromRecords = records.map((row) => asalKpwLabel(row.kpwdn));
    const fromAcc = (ickCapaian().offices || []).map((office) => asalKpwLabel(office.kpwdn || office.kpw));
    const labels = [...new Set([...fromRecords, ...fromAcc].filter((name) => name && name !== "Tanpa KPwDN"))];
    const order = REGIONS.map((region) => region.id);
    return labels.sort((a, b) => {
      const ia = order.indexOf(regionOf(a)?.id);
      const ib = order.indexOf(regionOf(b)?.id);
      const ra = ia < 0 ? 99 : ia;
      const rb = ib < 0 ? 99 : ib;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "id");
    });
  }

  function kpwdnFilterHtml(selected) {
    const picked = new Set((selected || []).map(String));
    const labels = uniqueKpwLabels();
    if (!labels.length) return `<p class="muted">Tidak ada opsi</p>`;
    let lastRegion = "";
    return labels
      .map((label) => {
        const region = regionOf(label)?.name || "Lainnya";
        const head =
          region !== lastRegion ? `<div class="filter-group">${escapeHtml(region)}</div>` : "";
        lastRegion = region;
        const checked = picked.has(label) ? " checked" : "";
        return `${head}<label class="check-opt"><input type="checkbox" value="${escapeHtml(label)}"${checked}><span>${escapeHtml(label)}</span></label>`;
      })
      .join("");
  }

  function checkboxFilterHtml(list, selected) {
    const picked = new Set((selected || []).map(String));
    if (!list.length) return `<p class="muted">Tidak ada opsi</p>`;
    return list
      .map((item) => {
        const val = String(item);
        const checked = picked.has(val) ? " checked" : "";
        return `<label class="check-opt"><input type="checkbox" value="${escapeHtml(val)}"${checked}><span>${escapeHtml(val)}</span></label>`;
      })
      .join("");
  }

  function readChecked(id) {
    return [...document.querySelectorAll(`#${id} input[type="checkbox"]:checked`)].map((el) => el.value);
  }

  function countBy(list, key) {
    const map = {};
    list.forEach((row) => {
      const k = row[key];
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function komoditasLabel(name) {
    return usableKomoditas(name) || "N/A";
  }

  function countByKomoditas(list) {
    const map = {};
    list.forEach((row) => {
      const key = komoditasLabel(row.komoditas);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(
      (a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "id")
    );
  }

  function countByFasilitas(list) {
    const map = {};
    list.forEach((row) => {
      const label = ickLabel(row.fasilitas);
      const fold = label.toLowerCase();
      if (!map[fold]) map[fold] = { name: label, n: 0 };
      map[fold].n += 1;
      if (label !== "N/A") map[fold].name = label;
    });
    return Object.values(map)
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"))
      .map((row) => [row.name, row.n]);
  }

  function countByTahun(list) {
    const map = {};
    list.forEach((row) => {
      const key = tahunLabel(row.tahun);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(
      (a, b) => b[1] - a[1] || String(b[0]).localeCompare(String(a[0]))
    );
  }

  function countByAsalKpw(list) {
    const map = {};
    list.forEach((row) => {
      const key = asalKpwLabel(row.kpwdn);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "id"));
  }

  function fillStats(el, list) {
    if (!el) return;
    const komoditas = new Set(list.map((r) => r.komoditas)).size;
    const pus = list.filter((r) => r.jenis === "PUS").length;
    const umkm = list.length - pus;
    const pusPct = list.length ? Math.round((pus / list.length) * 100) : 0;
    const umkmPct = list.length ? 100 - pusPct : 0;
    el.innerHTML = `
      <div class="stat"><b>${fmtNum(list.length)}</b><span>UMKM / PUS terdata</span></div>
      <div class="stat"><b>${fmtNum(komoditas)}</b><span>Komoditas</span></div>
      <div class="stat"><b>${fmtNum(umkm)} <em class="stat-pct">(${umkmPct}%)</em></b><span>Jumlah UMKM</span></div>
      <div class="stat"><b>${fmtNum(pus)} <em class="stat-pct">(${pusPct}%)</em></b><span>Pelaku Usaha Syariah (PUS)</span></div>
    `;
  }

  function renderStats(list) {
    fillStats(document.getElementById("stats-home"), records);
    fillStats(document.getElementById("stats"), list);
    renderHome();
  }

  function renderHome() {
    const list = records;
    const dateEl = document.getElementById("home-date");
    if (dateEl) {
      dateEl.textContent = `Data tertanggal ${formatDataDate(loadUpdatedAt())}`;
    }
    const mapBox = document.getElementById("home-map");
    if (!mapBox) return;
    const regionCounts = REGIONS.map((region) => ({
      ...region,
      n: list.filter((row) => matchesRegion(region, row.kpwdn)).length,
    }));
    const maxN = Math.max(0, ...regionCounts.map((row) => row.n));
    mapBox.innerHTML = indonesiaMapHtml(regionCounts, maxN, "data-home-wilayah");
    const caption = document.getElementById("home-map-caption");
    if (caption) {
      caption.textContent = "Klik pulau untuk melihat KPwDN tertinggi dan terendah di wilayah itu.";
    }
    renderHomeWilayahPop();
  }

  function homePrioritiesHtml(actions) {
    if (!actions.length) {
      return `<li><span>Belum terdapat prioritas tindak lanjut pada cakupan ini.</span></li>`;
    }
    return actions
      .map(
        (item, i) => `<li class="tone-${item.tone || "sedang"}">
          <span class="home-action-no">${String(i + 1).padStart(2, "0")}</span>
          <div class="home-action-body">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </div>
        </li>`
      )
      .join("");
  }

  function resolveActionBundle(list) {
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    if (fokus) {
      const wilayahBundle = buildWilayahActions(list, fokus);
      return { priority: wilayahBundle.priority, horizons: buildActions(list).horizons };
    }
    return buildActions(list);
  }

  function renderHomeWilayahPop() {
    const pop = document.getElementById("home-wilayah-pop");
    if (!pop) return;
    const region = REGIONS.find((item) => item.id === state.homeWilayah);
    if (!region) {
      pop.hidden = true;
      pop.innerHTML = "";
      state.homeKpw = "";
      state.homeUnitId = "";
      renderHomeKpwListPop();
      renderHomeActionsPop([], null);
      return;
    }
    const list = records.filter((row) => matchesRegion(region, row.kpwdn));
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const umkm = list.length - pus;
    const kpwRank = kpwSplitRank(list);
    const ends = rankEnds(kpwRank, 3);
    const offices = kpwRank.length;
    pop.hidden = false;
    pop.innerHTML = `
      <div class="home-pop-card" role="dialog" aria-label="KPwDN wilayah ${escapeHtml(region.name)}">
        <div class="home-pop-head">
          <div>
            <div class="kicker">Wilayah ${escapeHtml(region.name)}</div>
            <p class="meta">${fmtNum(umkm + pus)} UMKM/PUS · ${fmtNum(umkm)} UMKM · ${fmtNum(pus)} PUS · ${fmtNum(offices)} KPwDN</p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-home-pop-close">Tutup</button>
        </div>
        <div class="lembar-grid home-pop-grid">
          ${kpwListBlock("KPwDN tertinggi", ends.top, "strong")}
          ${kpwListBlock("KPwDN terendah", ends.bottom, "weak")}
        </div>
        <button type="button" class="home-pop-tiga" id="btn-home-tiga-tindakan">
          <span class="kicker">Prioritas tindak lanjut</span>
          <strong>Tiga arahan kebijakan — Wilayah ${escapeHtml(region.name)}</strong>
          <span>Klik untuk melihat rincian</span>
        </button>
      </div>`;
    renderHomeActionsPop(list, region);
    renderHomeKpwListPop();
  }

  function kpwSplitRank(list) {
    const groups = {};
    list.forEach((row) => {
      const key = asalKpwLabel(row.kpwdn);
      if (!groups[key]) groups[key] = { name: key, n: 0, umkm: 0, pus: 0 };
      groups[key].n += 1;
      if (row.jenis === "PUS") groups[key].pus += 1;
      else groups[key].umkm += 1;
    });
    return Object.values(groups).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"));
  }

  function kpwListBlock(title, rows, tone) {
    const cls = `lembar-card tone-${tone || "neutral"}`;
    if (!rows.length) return `<article class="${cls}"><h3>${escapeHtml(title)}</h3><p class="muted">Tidak ada pembanding.</p></article>`;
    return `<article class="${cls}"><h3>${escapeHtml(title)}</h3><ol>${rows
      .map(
        (row, i) => `<li>
          <button type="button" class="kpw-pick" data-home-kpw="${escapeHtml(row.name)}">
            <em>${String(i + 1).padStart(2, "0")}</em>
            <span>${escapeHtml(row.name)}</span>
            <b class="kpw-split"><i>${fmtNum(row.n)} UMKM/PUS</i><i>${fmtNum(row.umkm)} UMKM · ${fmtNum(row.pus)} PUS</i></b>
          </button>
        </li>`
      )
      .join("")}</ol></article>`;
  }

  function renderHomeActionsPop(list, region) {
    const pop = document.getElementById("home-actions-pop");
    if (!pop) return;
    if (!state.homeActions || !region) {
      pop.hidden = true;
      pop.innerHTML = "";
      return;
    }
    const actions = buildWilayahActions(list, region).priority;
    const signature = distinctiveKomoditasRank(list)[0];
    pop.hidden = false;
    pop.innerHTML = `
      <div class="home-pop-card home-actions-card" role="dialog" aria-label="Prioritas tindak lanjut wilayah ${escapeHtml(region.name)}">
        <div class="home-pop-head">
          <div>
            <div class="kicker">Prioritas tindak lanjut</div>
            <p class="meta">Wilayah ${escapeHtml(region.name)}${signature ? ` · klaster khas: ${escapeHtml(signature[0])}` : ""} · v${APP_BUILD}</p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-home-actions-close">Tutup</button>
        </div>
        <ol class="home-actions-list home-actions-inline">
          ${homePrioritiesHtml(actions)}
        </ol>
      </div>`;
  }

  function homeRegionRows() {
    const region = REGIONS.find((item) => item.id === state.homeWilayah);
    if (!region) return [];
    return records.filter((row) => matchesRegion(region, row.kpwdn));
  }

  function renderHomeKpwListPop() {
    const pop = document.getElementById("home-kpw-list-pop");
    if (!pop) return;
    if (!state.homeKpw) {
      pop.hidden = true;
      pop.innerHTML = "";
      renderHomeUnitPop();
      return;
    }
    const rows = homeRegionRows()
      .filter((row) => asalKpwLabel(row.kpwdn) === state.homeKpw)
      .sort((a, b) => String(a.nama).localeCompare(String(b.nama), "id"));
    pop.hidden = false;
    pop.innerHTML = `
      <div class="home-pop-card home-kpw-list-card" role="dialog" aria-label="Daftar UMKM/PUS ${escapeHtml(state.homeKpw)}">
        <div class="home-pop-head">
          <div>
            <div class="kicker">KPwDN pengampu</div>
            <strong class="home-pop-title">${escapeHtml(state.homeKpw)}</strong>
            <p class="meta">${fmtNum(rows.length)} UMKM/PUS. Klik nama untuk melihat detail.</p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-home-kpw-close">Tutup</button>
        </div>
        <ol class="home-unit-list">
          ${
            rows.length
              ? rows
                  .map(
                    (row) => `<li>
                      <button type="button" data-home-unit="${escapeHtml(row.id)}">
                        <span class="name">${escapeHtml(row.nama)}</span>
                        <span class="sub">${escapeHtml(row.jenis)}</span>
                      </button>
                    </li>`
                  )
                  .join("")
              : `<li class="muted">Tidak ada unit pada kantor ini.</li>`
          }
        </ol>
      </div>`;
    renderHomeUnitPop();
  }

  function renderHomeUnitPop() {
    const pop = document.getElementById("home-unit-pop");
    if (!pop) return;
    const row = records.find((item) => String(item.id) === String(state.homeUnitId));
    if (!row) {
      pop.hidden = true;
      pop.innerHTML = "";
      return;
    }
    pop.hidden = false;
    pop.innerHTML = `
      <div class="home-pop-card home-unit-card" role="dialog" aria-label="${escapeHtml(row.nama)}">
        <div class="home-pop-head">
          <div class="kicker">Profil UMKM/PUS</div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-home-unit-close">Tutup</button>
        </div>
        <dl class="home-unit-dl">
          <div><dt>Nama UMKM/PUS</dt><dd>${escapeHtml(row.nama)}</dd></div>
          <div><dt>Komoditas</dt><dd>${escapeHtml(komoditasLabel(row.komoditas))}</dd></div>
          <div><dt>Tahun</dt><dd>${escapeHtml(tahunLabel(row.tahun))}</dd></div>
          <div><dt>Fasilitas</dt><dd>${escapeHtml(ickLabel(row.fasilitas))}</dd></div>
        </dl>
      </div>`;
  }

  function clearHomeFilters() {
    state.qNama = "";
    state.jenis = [];
    state.komoditas = [];
    state.fasilitas = [];
    state.tahun = [];
    state.kpwdn = [];
    state.wilayah = "";
    state.page = 1;
  }

  function heatClass(n, max) {
    if (!n || !max || n <= Math.max(1, Math.round(max * 0.34))) return "low";
    if (n <= Math.round(max * 0.67)) return "mid";
    return "high";
  }

  function yearList(list) {
    return [...new Set(list.map((row) => Number(row.tahun)).filter(Boolean))].sort((a, b) => a - b);
  }

  function joinId(parts) {
    const list = parts.filter(Boolean);
    if (!list.length) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} dan ${list[1]}`;
    return `${list.slice(0, -1).join(", ")}, dan ${list[list.length - 1]}`;
  }

  function officePhrase(rows, limit = 2) {
    const ranked = countBy(rows, "kpwdn").filter(([name]) => name);
    if (!ranked.length) return "KPwDN pengampu yang belum tercatat";
    const shown = ranked.slice(0, limit).map(([name, n]) => `KPwDN ${shortOffice(name)} (${fmtNum(n)} unit)`);
    const more = ranked.length - shown.length;
    return more > 0 ? `${joinId(shown)}, plus ${fmtNum(more)} KPwDN lain` : joinId(shown);
  }

  function regionPhrase(rows) {
    const counts = REGIONS.map((region) => ({
      name: region.name,
      n: rows.filter((row) => matchesRegion(region, row.kpwdn)).length,
    }))
      .filter((row) => row.n > 0)
      .sort((a, b) => b.n - a.n);
    if (!counts.length) return "wilayah yang belum terpetakan";
    const top = counts.slice(0, 2).map((row) => `${row.name} (${fmtNum(row.n)} unit)`);
    return counts.length > 2 ? `${joinId(top)}, dengan sebaran susulan di wilayah lain` : joinId(top);
  }

  function sebaranAdvice(padat, jarang) {
    if (!padat) return "Sebaran wilayah belum dapat dinilai. Lengkapi data KPwDN pengampu agar peta pantauan merata.";
    if (padat.name === jarang.name) {
      return `Pada cakupan ini sebaran tertumpu di ${padat.name}. Pertahankan ritme pelaporan KPwDN di situ, dan cek apakah wilayah tetangga belum masuk karena celah pendampingan atau hanya celah input data.`;
    }
    if (!jarang.n) {
      return `Wilayah ${jarang.name} belum memiliki unit tercatat. Disarankan Direktorat Regional menugaskan KPwDN di ${jarang.name} untuk menginventarisasi UMKM/PUS binaan, mengunggah data ke BI PRAMESTI, dan menetapkan satu klaster unggulan sebagai entri perdana.`;
    }
    const rasio = padat.n / Math.max(1, jarang.n);
    if (rasio >= 3 || padat.n - jarang.n >= 5) {
      return `Kesenjangan antara ${padat.name} dan ${jarang.name} cukup lebar. Manfaatkan ${padat.name} sebagai rujukan tata kelola klaster, lalu minta KPwDN di ${jarang.name} mempercepat pemutakhiran data dan meninjau apakah angka yang tipis mencerminkan celah pendampingan atau hanya celah pelaporan.`;
    }
    return `Perbedaan sebaran masih terkelola. Tetap pantau ${jarang.name} agar tidak tertinggal, dan gunakan momentum ${padat.name} untuk berbagi praktik pendampingan ke wilayah yang lebih tipis.`;
  }

  function briefingAndil(n, total) {
    if (!total) return "0%";
    return fmtPct(Math.round((n / total) * 1000) / 10);
  }

  function briefingCakupanLabel() {
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const filterBits = [
      state.jenis.length && `jenis ${state.jenis.join(", ")}`,
      state.komoditas.length && `komoditas ${state.komoditas.join(", ")}`,
      state.fasilitas.length && `fasilitas ${state.fasilitas.join(", ")}`,
      state.tahun.length && `tahun ${state.tahun.join(", ")}`,
      state.kpwdn.length && state.kpwdn.map(shortOffice).join(", "),
    ].filter(Boolean);
    if (fokus) return `wilayah ${fokus.name}`;
    if (filterBits.length) return filterBits.join("; ");
    return "nasional";
  }

  function macroRegionKpwLines(list) {
    return REGIONS.map((region) => {
      const rows = list.filter((row) => matchesRegion(region, row.kpwdn));
      if (!rows.length) return `${region.name}: belum ada unit tercatat.`;
      const ranked = countByAsalKpw(rows).map(([name, n]) => ({
        name: shortOffice(name) || name,
        n,
      }));
      const top = ranked[0];
      const bottom = ranked[ranked.length - 1];
      if (ranked.length === 1 || top.name === bottom.name) {
        return `${region.name}: tertumpu pada ${top.name} (${fmtNum(top.n)} unit).`;
      }
      return `${region.name}: tertinggi ${top.name} (${fmtNum(top.n)} unit); terendah ${bottom.name} (${fmtNum(bottom.n)} unit).`;
    });
  }

  function buildBriefing(list) {
    if (!list.length) {
      return {
        lead: [
          "Tidak ada data pada cakupan saat ini. Ubah filter, lepas fokus peta, atau tambah data agar briefing dapat disusun.",
        ],
        sections: [],
      };
    }

    const total = list.length;
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const umkm = total - pus;
    const offices = new Set(list.map((row) => row.kpwdn)).size;
    const years = yearList(list);
    const yearSpan =
      years[0] && years[years.length - 1]
        ? years[0] === years[years.length - 1]
          ? String(years[0])
          : `${years[0]}–${years[years.length - 1]}`
        : "belum terisi";
    const cakupan = briefingCakupanLabel();
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const dated = formatDataDate(loadUpdatedAt());
    const yearData = yearCompare(list);
    const regionCounts = REGIONS.map((region) => ({
      name: region.name,
      n: list.filter((row) => matchesRegion(region, row.kpwdn)).length,
    })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"));
    const padat = regionCounts[0];
    const jarang = [...regionCounts].sort((a, b) => a.n - b.n || a.name.localeCompare(b.name, "id"))[0];
    const regionsWithData = regionCounts.filter((row) => row.n > 0).length;
    const topKom = countByKomoditas(list).filter(([name]) => name !== "N/A");
    const topIck = countByFasilitas(list).filter(([name]) => name && name !== "N/A");
    const topKpw = countByAsalKpw(list);
    const noTahun = list.filter((row) => tahunLabel(row.tahun) === "N/A").length;
    const noKom = list.filter((row) => komoditasLabel(row.komoditas) === "N/A").length;

    const scopePhrase = cakupan === "nasional" ? "nasional" : `cakupan ${cakupan}`;
    const lead = [
      `Pada tingkat ${scopePhrase}, BI PRAMESTI mencatat ${fmtNum(total)} unit UMKM/PUS binaan dari ${fmtNum(offices)} KPwDN pengampu per ${dated}. Pelaku Usaha Syariah (PUS) menyumbang ${fmtNum(pus)} unit (${briefingAndil(pus, total)}), sementara UMKM konvensional ${fmtNum(umkm)} unit (${briefingAndil(umkm, total)}). Rentang tahun fasilitasi ${yearSpan}.`,
    ];

    if (yearData.prev && yearData.latest) {
      const arah =
        yearData.delta > 0 ? "meningkat" : yearData.delta < 0 ? "menurun" : "stabil";
      const deltaAbs = fmtNum(Math.abs(yearData.delta));
      lead.push(
        `Antara tahun fasilitasi ${yearData.prev} dan ${yearData.latest}, unit tercatat ${arah} ${deltaAbs} unit, dari ${fmtNum(yearData.prevN)} menjadi ${fmtNum(yearData.latestN)} unit.${yearData.noTahun ? ` ${fmtNum(yearData.noTahun)} unit tanpa tahun fasilitasi tidak masuk perbandingan ini.` : ""}`
      );
    }

    const driverBits = [];
    if (padat?.n) {
      driverBits.push(
        `wilayah ${padat.name} dengan andil ${briefingAndil(padat.n, total)} (${fmtNum(padat.n)} unit)`
      );
    }
    if (topKom[0]) {
      driverBits.push(
        `komoditas ${topKom[0][0]} dengan andil ${briefingAndil(topKom[0][1], total)}`
      );
    }
    if (topIck[0]) {
      driverBits.push(
        `ICK ${topIck[0][0]} dengan andil ${briefingAndil(topIck[0][1], total)}`
      );
    }
    if (driverBits.length) {
      lead.push(
        `Profil sebaran terutama didorong oleh ${joinId(driverBits)}.${topKpw[0] ? ` Kontribusi terbesar berasal dari ${shortOffice(topKpw[0][0])} (${fmtNum(topKpw[0][1])} unit).` : ""}`
      );
    }

    const sections = [];

    const spatialSubsections = [];
    if (fokus) {
      const officeRank = countBy(list, "kpwdn");
      const tebal = officeRank[0];
      const tipis = [...officeRank].sort(
        (a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0]), "id")
      )[0];
      spatialSubsections.push({
        title: `1. Sebaran di ${fokus.name}`,
        paragraph: `Wilayah ${fokus.name} memuat ${fmtNum(total)} unit (${briefingAndil(total, records.length || total)} dari seluruh data BI PRAMESTI bila tidak difilter).`,
        items:
          tebal && tipis && tebal[0] !== tipis[0]
            ? [
                `KPwDN tertinggi: ${shortOffice(tebal[0])} (${fmtNum(tebal[1])} unit).`,
                `KPwDN terendah: ${shortOffice(tipis[0])} (${fmtNum(tipis[1])} unit).`,
                `Tindak lanjut: ${sebaranAdvice(
                  { name: shortOffice(tebal[0]), n: tebal[1] },
                  { name: shortOffice(tipis[0]), n: tipis[1] }
                )}`,
              ]
            : tebal
              ? [
                  `Sebaran tertumpu pada KPwDN ${shortOffice(tebal[0])} (${fmtNum(tebal[1])} unit).`,
                  "Perluas input dari KPwDN lain di wilayah yang sama agar pantauan tidak bergantung pada satu kantor.",
                ]
              : ["Belum ada KPwDN pengampu yang tercatat pada cakupan ini."],
      });
    } else {
      spatialSubsections.push({
        title: "1. Sebaran per wilayah makro",
        paragraph: `Secara ${scopePhrase} tercatat ${fmtNum(total)} unit UMKM/PUS. ${fmtNum(regionsWithData)} dari ${fmtNum(REGIONS.length)} wilayah makro memiliki unit binaan; ${padat.name} menjadi wilayah terpadat (${fmtNum(padat.n)} unit, ${briefingAndil(padat.n, total)}), sedangkan ${jarang.n ? `${jarang.name} paling tipis (${fmtNum(jarang.n)} unit, ${briefingAndil(jarang.n, total)}).` : `${jarang.name} belum memiliki unit tercatat.`}`,
        items: [
          `Wilayah tertinggi: ${padat.name} (${fmtNum(padat.n)} unit).`,
          jarang.n
            ? `Wilayah terendah: ${jarang.name} (${fmtNum(jarang.n)} unit).`
            : `Wilayah terendah: ${jarang.name} (belum ada unit).`,
          `Tindak lanjut: ${sebaranAdvice(padat, jarang)}`,
        ],
      });
      spatialSubsections.push({
        title: "2. Perkembangan per wilayah makro",
        paragraph: "Perkembangan tertinggi dan terendah per wilayah makro (berdasarkan KPwDN pengampu):",
        items: macroRegionKpwLines(list),
      });
    }

    if (topKpw.length && !fokus) {
      spatialSubsections.push({
        title: fokus ? "2. KPwDN pengampu" : "3. Konsentrasi KPwDN pengampu",
        paragraph: `Tercatat ${fmtNum(topKpw.length)} asal KPwDN pengampu pada cakupan ini.`,
        items: [
          `Tertinggi: ${topKpw[0][0]} (${fmtNum(topKpw[0][1])} unit, ${briefingAndil(topKpw[0][1], total)}).`,
          topKpw.length > 1
            ? `Terendah: ${topKpw[topKpw.length - 1][0]} (${fmtNum(topKpw[topKpw.length - 1][1])} unit).`
            : "Hanya satu asal KPwDN yang tercatat.",
          topKpw.length > 1
            ? `Sepuluh KPwDN teratas menyumbang ${briefingAndil(
                topKpw.slice(0, 10).reduce((sum, [, n]) => sum + n, 0),
                total
              )} dari seluruh unit.`
            : "",
        ].filter(Boolean),
      });
    }

    if (yearData.series.length >= 2) {
      spatialSubsections.push({
        title: `${fokus ? spatialSubsections.length + 1 : spatialSubsections.length + 1}. Perkembangan tahun fasilitasi`,
        paragraph:
          yearData.delta === 0
            ? `Antara ${yearData.prev} dan ${yearData.latest}, jumlah unit stabil di ${fmtNum(yearData.latestN)} unit.`
            : `Antara ${yearData.prev} dan ${yearData.latest}, unit ${yearData.delta > 0 ? "bertambah" : "berkurang"} ${fmtNum(Math.abs(yearData.delta))} unit.`,
        items: yearData.series.slice(-4).map(
          (row) => `${row.year}: ${fmtNum(row.n)} unit (${briefingAndil(row.n, total)} dari cakupan saat ini).`
        ),
      });
    }

    sections.push({
      title: fokus
        ? `I. PERKEMBANGAN SEBARAN WILAYAH ${fokus.name.toUpperCase()}`
        : "I. PERKEMBANGAN SEBARAN NASIONAL DAN SPASIAL",
      subsections: spatialSubsections,
    });

    const komoditasItems = topKom.slice(0, 5).map(
      ([name, n]) =>
        `${name}: ${fmtNum(n)} unit dengan andil ${briefingAndil(n, total)}.${n >= 3 ? ` Sebaran utama ${regionPhrase(list.filter((row) => komoditasLabel(row.komoditas) === name))}.` : ""}`
    );
    const ickItems = topIck.slice(0, 5).map(([name, n]) => {
      let line = `${name}: ${fmtNum(n)} unit (${briefingAndil(n, total)}).`;
      const delta = yearData.ickUp.find((row) => row.name === name);
      if (delta && delta.delta > 0) line += ` Naik ${fmtNum(delta.delta)} unit dibanding tahun fasilitasi sebelumnya.`;
      const down = yearData.ickDown.find((row) => row.name === name);
      if (down && down.delta < 0) line += ` Turun ${fmtNum(Math.abs(down.delta))} unit dibanding tahun fasilitasi sebelumnya.`;
      return line;
    });

    const componentSubsections = [
      {
        title: "1. Komposisi jenis pelaku",
        paragraph: `UMKM konvensional ${fmtNum(umkm)} unit (${briefingAndil(umkm, total)}); PUS ${fmtNum(pus)} unit (${briefingAndil(pus, total)}).`,
        items: [
          pus >= umkm
            ? "PUS mendominasi komposisi pada cakupan ini — perkuat dokumentasi fasilitasi syariah dan rantai pasok halal."
            : "UMKM konvensional masih dominan — manfaatkan portofolio ICK untuk mendorong naik kelas dan akses pembiayaan.",
        ],
      },
    ];

    if (topKom.length) {
      const komFollowers = topKom.slice(1, 3).map(([name, n]) => `${name} (${fmtNum(n)} unit)`);
      componentSubsections.push({
        title: "2. Komoditas unggulan",
        paragraph: topKom[0]
          ? `Komoditas paling padat ${topKom[0][0]} (${fmtNum(topKom[0][1])} unit, andil ${briefingAndil(topKom[0][1], total)})${komFollowers.length ? `, diikuti ${joinId(komFollowers)}.` : "."}`
          : "",
        items: komoditasItems.length
          ? komoditasItems
          : ["Kolom komoditas masih kosong sehingga profil klaster belum dapat dibaca."],
      });
    } else {
      componentSubsections.push({
        title: "2. Komoditas unggulan",
        items: [
          `${fmtNum(noKom)} unit belum memiliki komoditas terisi — lengkapi kolom komoditas agar profil klaster dapat dibandingkan antarwilayah.`,
        ],
      });
    }

    componentSubsections.push({
      title: "3. Portofolio ICK dan mutu data",
      paragraph: topIck[0]
        ? `ICK dominan ${topIck[0][0]} (${fmtNum(topIck[0][1])} unit, andil ${briefingAndil(topIck[0][1], total)}).`
        : "Portofolio ICK belum terisi pada sebagian besar unit.",
      items: [
        ...(ickItems.length ? ickItems : ["Kolom ICK/fasilitas masih kosong pada sebagian unit."]),
        noTahun
          ? `${fmtNum(noTahun)} unit tanpa tahun fasilitasi — lengkapi agar perbandingan antarperiode dapat dibaca.`
          : "Seluruh unit pada cakupan ini memiliki tahun fasilitasi terisi.",
        noKom
          ? `${fmtNum(noKom)} unit tanpa komoditas — prioritaskan pelengkapan sebelum rapat pimpinan regional.`
          : "Seluruh unit pada cakupan ini memiliki komoditas terisi.",
      ],
    });

    sections.push({
      title: "II. PERKEMBANGAN MENURUT KOMPONEN",
      subsections: componentSubsections,
    });

    return { lead, sections };
  }

  function briefingHtml(list) {
    const data = buildBriefing(list);
    const parts = [];
    if (data.lead?.length) {
      parts.push(
        `<div class="briefing-lead">${data.lead.map((para) => `<p>${escapeHtml(para)}</p>`).join("")}</div>`
      );
    }
    (data.sections || []).forEach((section) => {
      let html = `<div class="briefing-block">`;
      if (section.title) {
        html += `<h4 class="briefing-head briefing-section-title">${escapeHtml(section.title)}</h4>`;
      }
      (section.paragraphs || []).forEach((para) => {
        html += `<p class="briefing-para">${escapeHtml(para)}</p>`;
      });
      (section.subsections || []).forEach((sub) => {
        if (sub.title) html += `<h5 class="briefing-subhead">${escapeHtml(sub.title)}</h5>`;
        if (sub.paragraph) html += `<p class="briefing-para">${escapeHtml(sub.paragraph)}</p>`;
        if (sub.items?.length) {
          html += `<ul class="briefing-points">${sub.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
        }
      });
      if (section.items?.length && !section.subsections?.length) {
        html += `<ul class="briefing-points">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      }
      html += `</div>`;
      parts.push(html);
    });
    return parts.join("");
  }

  function shareLabel(n, total) {
    if (!total) return "0%";
    return `${Math.round((n / total) * 100)}%`;
  }

  function rankEnds(ranked, take) {
    const top = ranked.slice(0, take);
    const seen = new Set(top.map((row) => row.name));
    const bottom = [...ranked].reverse().filter((row) => !seen.has(row.name)).slice(0, take);
    return { top, bottom };
  }

  function execCakupan() {
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const bits = [
      state.jenis.length && `jenis ${state.jenis.join(", ")}`,
      state.komoditas.length && `komoditas ${state.komoditas.join(", ")}`,
      state.fasilitas.length && `fasilitas ${state.fasilitas.join(", ")}`,
      state.tahun.length && `tahun ${state.tahun.join(", ")}`,
      state.kpwdn.length && state.kpwdn.map(shortOffice).join(", "),
    ].filter(Boolean);
    if (fokus) return `wilayah ${fokus.name}`;
    if (bits.length) return bits.join("; ");
    return "nasional";
  }

  function kpwPerformance(list) {
    const groups = {};
    list.forEach((row) => {
      const key = asalKpwLabel(row.kpwdn);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return Object.entries(groups)
      .map(([name, rows]) => {
        const n = rows.length;
        const pus = rows.filter((row) => row.jenis === "PUS").length;
        const noTahun = rows.filter((row) => tahunLabel(row.tahun) === "N/A").length;
        const noKom = rows.filter((row) => komoditasLabel(row.komoditas) === "N/A").length;
        const ick = countByFasilitas(rows).find(([label]) => label && label !== "N/A");
        return {
          name,
          n,
          pus,
          pusPct: n ? Math.round((pus / n) * 100) : 0,
          noTahun,
          noKom,
          completePct: n ? Math.round((1 - (noTahun + noKom) / (n * 2)) * 100) : 0,
          ick: ick ? ick[0] : "—",
          ickN: ick ? ick[1] : 0,
        };
      })
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"));
  }

  function yearCompare(list) {
    const noTahun = list.filter((row) => tahunLabel(row.tahun) === "N/A").length;
    const byYear = {};
    list.forEach((row) => {
      const year = Number(row.tahun);
      if (!year || tahunLabel(row.tahun) === "N/A") return;
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(row);
    });
    const years = Object.keys(byYear)
      .map(Number)
      .sort((a, b) => a - b);
    const series = years.map((year) => ({ year, n: byYear[year].length }));
    const latest = years[years.length - 1] || 0;
    const prev = years[years.length - 2] || 0;
    const latestRows = latest ? byYear[latest] : [];
    const prevRows = prev ? byYear[prev] : [];
    const officeDelta = (latestRows, prevRows) => {
      const map = {};
      latestRows.forEach((row) => {
        const key = asalKpwLabel(row.kpwdn);
        map[key] = map[key] || { name: key, now: 0, then: 0 };
        map[key].now += 1;
      });
      prevRows.forEach((row) => {
        const key = asalKpwLabel(row.kpwdn);
        map[key] = map[key] || { name: key, now: 0, then: 0 };
        map[key].then += 1;
      });
      return Object.values(map)
        .map((row) => ({ ...row, delta: row.now - row.then }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.now - a.now);
    };
    const ickDelta = (latestRows, prevRows) => {
      const map = {};
      latestRows.forEach((row) => {
        const key = ickLabel(row.fasilitas);
        const fold = key.toLowerCase();
        map[fold] = map[fold] || { name: key, now: 0, then: 0 };
        map[fold].now += 1;
        if (key !== "N/A") map[fold].name = key;
      });
      prevRows.forEach((row) => {
        const key = ickLabel(row.fasilitas);
        const fold = key.toLowerCase();
        map[fold] = map[fold] || { name: key, now: 0, then: 0 };
        map[fold].then += 1;
        if (key !== "N/A") map[fold].name = key;
      });
      return Object.values(map)
        .map((row) => ({ ...row, delta: row.now - row.then }))
        .sort((a, b) => b.delta - a.delta || b.now - a.now);
    };
    const ickAll = ickDelta(latestRows, prevRows);
    return {
      noTahun,
      series,
      latest,
      prev,
      latestN: latestRows.length,
      prevN: prevRows.length,
      delta: latestRows.length - prevRows.length,
      kpw: officeDelta(latestRows, prevRows),
      ickUp: ickAll.filter((row) => row.delta > 0).slice(0, 5),
      ickDown: ickAll.filter((row) => row.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5),
    };
  }

  function execSnapshot(list, priority) {
    const total = list.length;
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const years = yearList(list);
    const regionCounts = REGIONS.map((region) => ({
      name: region.name,
      n: list.filter((row) => matchesRegion(region, row.kpwdn)).length,
    })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"));
    const kpwRank = countByAsalKpw(list).map(([name, n]) => ({ name, n }));
    const regionEnds = rankEnds(regionCounts, 3);
    const kpwEnds = rankEnds(kpwRank, 3);
    const topKom = countByKomoditas(list).find(([name]) => name !== "N/A");
    const topIck = countByFasilitas(list).find(([name]) => name && name !== "N/A");
    const actions = (priority || resolveActionBundle(list).priority).slice(0, 3);
    return {
      cakupan: execCakupan(),
      dated: formatDataDate(loadUpdatedAt()),
      total,
      pus,
      umkm: total - pus,
      pusPct: total ? Math.round((pus / total) * 100) : 0,
      offices: new Set(list.map((row) => asalKpwLabel(row.kpwdn))).size,
      yearFrom: years[0] || "—",
      yearTo: years[years.length - 1] || "—",
      regionTop: regionEnds.top,
      regionLow: regionEnds.bottom,
      kpwTop: kpwEnds.top,
      kpwLow: kpwEnds.bottom,
      topKom: topKom ? { name: topKom[0], n: topKom[1] } : null,
      topIck: topIck ? { name: topIck[0], n: topIck[1] } : null,
      actions,
    };
  }

  function listBlock(title, rows, tone) {
    const cls = `lembar-card tone-${tone || "neutral"}`;
    if (!rows.length) return `<article class="${cls}"><h3>${escapeHtml(title)}</h3><p class="muted">Tidak ada pembanding.</p></article>`;
    return `<article class="${cls}"><h3>${escapeHtml(title)}</h3><ol>${rows
      .map((row, i) => `<li><em>${String(i + 1).padStart(2, "0")}</em><span>${escapeHtml(row.name)}</span><b>${fmtNum(row.n)}</b></li>`)
      .join("")}</ol></article>`;
  }

  function renderLembar(list, priority) {
    const meta = document.getElementById("lembar-meta");
    const body = document.getElementById("lembar-body");
    if (!meta || !body) return;
    const snap = execSnapshot(list, priority);
    meta.textContent = `Cakupan ${snap.cakupan} · data tertanggal ${snap.dated}`;
    if (!snap.total) {
      body.innerHTML = `<p class="chart-empty">Tidak ada data pada cakupan ini untuk menyusun lembar rapat.</p>`;
      return;
    }
    body.innerHTML = `
      <div class="lembar-grid">
        ${listBlock("Wilayah tertinggi", snap.regionTop, "strong")}
        ${listBlock("Wilayah terendah", snap.regionLow, "weak")}
        ${listBlock("KPwDN tertinggi", snap.kpwTop, "strong")}
        ${listBlock("KPwDN terendah", snap.kpwLow, "weak")}
      </div>
      <div class="lembar-actions">
        <h3>Prioritas tindak lanjut</h3>
        <ol>
          ${snap.actions
            .map((item) => `<li><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.text)}</li>`)
            .join("")}
        </ol>
      </div>
      <p class="briefing-note">Disusun dari data BI PRAMESTI yang sedang tampil. Tahun pada lembar ini adalah tahun fasilitasi, bukan tanggal unggahan. Bukan penilaian resmi Bank Indonesia.</p>
    `;
  }

  function lembarPlainText(list) {
    const snap = execSnapshot(list);
    const line = (title, rows) =>
      rows.length ? `${title}: ${rows.map((row) => `${row.name} (${fmtNum(row.n)})`).join("; ")}` : `${title}: —`;
    const actions = snap.actions.map((item, i) => `${i + 1}. ${item.title}: ${item.text}`).join("\n");
    return [
      `BI PRAMESTI — Lembar rapat pimpinan`,
      `Cakupan ${snap.cakupan} · data tertanggal ${snap.dated}`,
      `UMKM/PUS ${fmtNum(snap.total)}; PUS ${fmtNum(snap.pus)} (${snap.pusPct}%); KPwDN ${fmtNum(snap.offices)}; tahun fasilitasi ${snap.yearFrom === "—" && snap.yearTo === "—" ? "—" : `${snap.yearFrom}–${snap.yearTo}`}.`,
      line("Wilayah tertinggi", snap.regionTop),
      line("Wilayah terendah", snap.regionLow),
      line("KPwDN tertinggi", snap.kpwTop),
      line("KPwDN terendah", snap.kpwLow),
      actions ? `Prioritas tindak lanjut:\n${actions}` : "",
      "Catatan: tahun fasilitasi pada kertas kerja, bukan tanggal unggahan. Bukan penilaian resmi Bank Indonesia.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  function renderKpwBoard(list) {
    const body = document.getElementById("kpw-board-body");
    if (!body) return;
    const rows = kpwPerformance(list);
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7" class="muted">Tidak ada KPwDN pada cakupan ini.</td></tr>`;
      return;
    }
    body.innerHTML = rows
      .map((row) => {
        const tone = row.completePct >= 85 ? "ok" : row.completePct >= 60 ? "mid" : "low";
        return `<tr class="kpw-row" data-kpw-filter="${escapeHtml(row.name)}" title="Buka ${escapeHtml(row.name)} di Database">
          <td class="name">${escapeHtml(row.name)}</td>
          <td><b>${fmtNum(row.n)}</b></td>
          <td>${fmtNum(row.pus)} · ${row.pusPct}%</td>
          <td><span class="complete-pill complete-${tone}">${row.completePct}%</span></td>
          <td>${fmtNum(row.noTahun)}</td>
          <td>${fmtNum(row.noKom)}</td>
          <td>${escapeHtml(row.ick)}${row.ickN ? ` · ${fmtNum(row.ickN)}` : ""}</td>
        </tr>`;
      })
      .join("");
  }

  function deltaLabel(n) {
    const abs = fmtNum(Math.abs(n));
    if (n > 0) return `+${abs}`;
    if (n < 0) return `-${abs}`;
    return "0";
  }

  function renderTahunCompare(list) {
    const box = document.getElementById("tahun-compare-body");
    if (!box) return;
    const data = yearCompare(list);
    if (!data.series.length) {
      box.innerHTML = `<p class="chart-empty">Belum ada tahun fasilitasi yang dapat dibandingkan. Lengkapi kolom Tahun Fasilitasi pada kertas kerja.</p>`;
      return;
    }
    const maxN = Math.max(1, ...data.series.map((row) => row.n));
    const bars = data.series
      .map((row) => {
        const on = row.year === data.latest ? " on" : "";
        return `<button type="button" class="year-bar${on}" data-tahun-filter="${row.year}">
          <span>${row.year}</span>
          <i><b style="width:${Math.round((row.n / maxN) * 100)}%"></b></i>
          <strong>${fmtNum(row.n)}</strong>
        </button>`;
      })
      .join("");
    let head;
    if (!data.prev) {
      head = `<p class="meta">Hanya ada satu tahun fasilitasi (${data.latest}, ${fmtNum(data.latestN)} unit). Unggah data tahun lain untuk melihat kenaikan atau penurunan.</p>`;
    } else {
      const arah = data.delta > 0 ? "lebih banyak" : data.delta < 0 ? "lebih sedikit" : "sama";
      head = `<p class="meta">${data.latest} mencatat ${fmtNum(data.latestN)} unit, ${arah} ${fmtNum(Math.abs(data.delta))} unit dibanding ${data.prev} (${fmtNum(data.prevN)} unit). ${data.noTahun ? `${fmtNum(data.noTahun)} unit tanpa tahun fasilitasi tidak masuk hitungan ini.` : ""}</p>`;
    }
    const movers = (title, rows, empty, tone) => `
      <article class="lembar-card tone-${tone || "neutral"}">
        <h3>${escapeHtml(title)}</h3>
        ${
          rows.length
            ? `<ol>${rows
                .slice(0, 5)
                .map(
                  (row) =>
                    `<li><span>${escapeHtml(row.name)}</span><b class="${row.delta > 0 ? "up" : row.delta < 0 ? "down" : ""}">${deltaLabel(row.delta)}</b></li>`
                )
                .join("")}</ol>`
            : `<p class="muted">${escapeHtml(empty)}</p>`
        }
      </article>`;
    const up = data.kpw.filter((row) => row.delta > 0).slice(0, 5);
    const down = data.kpw.filter((row) => row.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5);
    box.innerHTML = `
      ${head}
      <div class="year-bars">${bars}</div>
      <div class="lembar-grid">
        ${movers("KPwDN yang naik", up, data.prev ? "Tidak ada KPwDN yang naik pada pasangan tahun ini." : "Perlu dua tahun fasilitasi.", "strong")}
        ${movers("KPwDN yang turun", down, data.prev ? "Tidak ada KPwDN yang turun pada pasangan tahun ini." : "Perlu dua tahun fasilitasi.", "weak")}
        ${movers("ICK yang menggelembung", data.ickUp, data.prev ? "Tidak ada ICK yang naik." : "Perlu dua tahun fasilitasi.", "strong")}
        ${movers("ICK yang menyusut", data.ickDown, data.prev ? "Tidak ada ICK yang turun." : "Perlu dua tahun fasilitasi.", "weak")}
      </div>
    `;
  }

  function isGenericKomoditas(name) {
    const label = komoditasLabel(name);
    if (GENERIC_KOMODITAS.has(label)) return true;
    if (label.length > 52) return true;
    return false;
  }

  function distinctiveKomoditasRank(list) {
    return countByKomoditas(list).filter(([name]) => !isGenericKomoditas(name));
  }

  function komoditasLiftRank(list, baselineList) {
    const total = Math.max(1, list.length);
    const baseTotal = Math.max(1, baselineList.length);
    const regMap = Object.fromEntries(distinctiveKomoditasRank(list));
    const baseMap = Object.fromEntries(distinctiveKomoditasRank(baselineList));
    const names = new Set([...Object.keys(regMap), ...Object.keys(baseMap)]);
    return [...names]
      .map((name) => ({
        name,
        n: regMap[name] || 0,
        regShare: (regMap[name] || 0) / total,
        baseShare: (baseMap[name] || 0) / baseTotal,
        lift: (regMap[name] || 0) / total - (baseMap[name] || 0) / baseTotal,
      }))
      .filter((row) => row.n >= 3)
      .sort((a, b) => b.lift - a.lift || b.n - a.n || a.name.localeCompare(b.name, "id"));
  }

  function ickPortfolioRank(list, limit = 3) {
    return countByFasilitas(list)
      .filter(([name]) => name && name !== "N/A")
      .slice(0, limit)
      .map(([name, n]) => ({ name, n, share: list.length ? n / list.length : 0 }));
  }

  function pickActions(items, limit) {
    const out = [];
    const seen = new Set();
    items.forEach((item) => {
      if (out.length >= limit || seen.has(item.title)) return;
      seen.add(item.title);
      out.push(item);
    });
    return out;
  }

  function buildWilayahActions(list, region) {
    const regionName = region.name;
    const total = list.length;
    const nationalTotal = records.length;
    const baseline = records;

    if (!total) {
      return {
        priority: [
          {
            tone: "sedang",
            title: `Lengkapi data UMKM/PUS wilayah ${regionName}`,
            text: `Belum terdapat UMKM/PUS tercatat di wilayah ${regionName}. KPwDN pengampu di wilayah ini diharapkan mengunggah kertas kerja Rekap All agar prioritas tindak lanjut kebijakan regional dapat disusun berdasarkan karakteristik unit binaan.`,
          },
        ],
      };
    }

    const now = new Date().getFullYear();
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const umkm = total - pus;
    const pusShare = pus / total;
    const natPusShare = baseline.length ? baseline.filter((row) => row.jenis === "PUS").length / baseline.length : 0;
    const komRank = distinctiveKomoditasRank(list);
    const komLift = komoditasLiftRank(list, baseline);
    const signatureKom = komLift[0] || (komRank[0] ? { name: komRank[0][0], n: komRank[0][1], lift: 0, regShare: komRank[0][1] / total } : null);
    const volumeKom = komRank[0] ? { name: komRank[0][0], n: komRank[0][1] } : null;
    const runnerKom = komRank[1] ? { name: komRank[1][0], n: komRank[1][1] } : null;
    const thirdKom = komRank[2] ? { name: komRank[2][0], n: komRank[2][1] } : null;
    const ickPortfolio = ickPortfolioRank(list, 4);
    const topIck = ickPortfolio[0];
    const focusIck = ickPortfolio[1] && ickPortfolio[1].share >= 0.12 ? ickPortfolio[1] : ickPortfolio[0];
    const kpwRank = kpwSplitRank(list);
    const topKpw = kpwRank[0];
    const thinKpw = kpwRank.filter((row) => row.n <= Math.max(2, Math.round((topKpw?.n || 1) * 0.25)));
    const noKom = list.filter((row) => komoditasLabel(row.komoditas) === "N/A").length;
    const noTahun = list.filter((row) => tahunLabel(row.tahun) === "N/A").length;
    const stale = list.filter((row) => {
      const year = Number(row.tahun);
      return year >= 1900 && year <= now - 3;
    });
    const nationalShare = nationalTotal ? total / nationalTotal : 0;

    const candidates = [];
    const leadKom = signatureKom && (signatureKom.lift >= 0.003 || signatureKom.n >= 8) ? signatureKom : volumeKom;

    if (leadKom) {
      const komRows = list.filter((row) => komoditasLabel(row.komoditas) === leadKom.name);
      const leadOffice = countByAsalKpw(komRows)[0];
      const profil =
        volumeKom && leadKom.name !== volumeKom.name
          ? `Klaster khas ${leadKom.name} (${fmtNum(leadKom.n)} unit, ${shareLabel(leadKom.n, total)}) menonjol dibanding rata-rata nasional; komoditas terbanyak ${volumeKom.name} (${fmtNum(volumeKom.n)} unit).`
          : `${leadKom.name} menjadi komoditas terbanyak (${fmtNum(leadKom.n)} unit, ${shareLabel(leadKom.n, total)}).`;
      const susulan = runnerKom
        ? ` Diikuti ${runnerKom.name} (${fmtNum(runnerKom.n)} unit)${thirdKom ? ` dan ${thirdKom.name} (${fmtNum(thirdKom.n)} unit)` : ""}.`
        : "";
      candidates.push({
        score: 560 + Math.round((leadKom.n / total) * 120) + Math.round((signatureKom?.lift || 0) * 400),
        tone: leadKom.n / total >= 0.18 ? "tinggi" : "sedang",
        title: `Perkuat klaster ${leadKom.name} sebagai unggulan ${regionName}`,
        text: `Profil UMKM/PUS wilayah ${regionName}: ${profil}${susulan} Bank Indonesia mendorong pendalaman rantai nilai—akses input, pemasaran, dan pembiayaan syariah—melalui program ICK di ${leadOffice ? shortOffice(leadOffice[0]) : "KPwDN pengampu terpadat"}.`,
      });
    }

    if (ickPortfolio.length >= 2) {
      const mix = ickPortfolio
        .slice(0, 3)
        .map((row) => `${row.name} ${fmtNum(row.n)} unit (${shareLabel(row.n, total)})`)
        .join(", ");
      const ickRows = list.filter((row) => ickLabel(row.fasilitas).toLowerCase() === focusIck.name.toLowerCase());
      const ickOffice = countByAsalKpw(ickRows)[0];
      candidates.push({
        score: 520 + Math.round(focusIck.share * 100),
        tone: focusIck.share >= 0.2 ? "tinggi" : "sedang",
        title: `Selaraskan portofolio ICK ${regionName} (${focusIck.name})`,
        text: `Cakupan ICK di ${regionName}: ${mix}. Prioritas tindak lanjut difokuskan pada perluasan dan evaluasi program ${focusIck.name} melalui ${ickOffice ? shortOffice(ickOffice[0]) : "KPwDN pengampu terpadat"}—termasuk linkage pasar, pemantauan status binaan, dan koordinasi antar-program ICK.`,
      });
    } else if (topIck) {
      candidates.push({
        score: 500,
        tone: "sedang",
        title: `Optimalisasi program ICK ${topIck.name} di ${regionName}`,
        text: `${topIck.name} menjangkau ${fmtNum(topIck.n)} unit (${shareLabel(topIck.n, total)}) di wilayah ${regionName}. KPwDN pengampu menyeragamkan tindak lanjut pada portofolio ini guna memperkuat daya saing UMKM/PUS.`,
      });
    }

    if (pusShare >= 0.18 || (pusShare >= 0.12 && pusShare - natPusShare >= 0.03)) {
      const pusRows = list.filter((row) => row.jenis === "PUS");
      const pusKom = distinctiveKomoditasRank(pusRows)[0];
      candidates.push({
        score: 470 + Math.round(pusShare * 100),
        tone: pusShare >= 0.22 ? "tinggi" : "sedang",
        title: `Perkuat inklusi keuangan syariah PUS di ${regionName}`,
        text: `${regionName} mencatat ${fmtNum(pus)} PUS (${shareLabel(pus, total)}), ${pusShare > natPusShare ? "di atas" : "selaras dengan"} rata-rata nasional (${shareLabel(Math.round(natPusShare * baseline.length), baseline.length)})${pusKom ? `, terutama pada ${pusKom[0]}` : ""}. KPwDN pengampu memetakan unit yang telah terhubung pembiayaan syariah, dalam proses sertifikasi halal, dan belum tersentuh.`,
      });
    } else if (!pus && umkm >= 3) {
      candidates.push({
        score: 430,
        tone: "sedang",
        title: `Perluas pendataan PUS di wilayah ${regionName}`,
        text: `Seluruh ${fmtNum(umkm)} unit di ${regionName} berstatus UMKM; belum ada PUS tercatat. KPwDN pengampu melakukan identifikasi pelaku usaha syariah potensial—termasuk pondok pesantren dan koperasi syariah—agar profil inklusi keuangan syariah ${regionName} tercermin pada BI PRAMESTI.`,
      });
    } else if (pusShare <= 0.1 && pus >= 1) {
      candidates.push({
        score: 410,
        tone: "sedang",
        title: `Tingkatkan peran PUS pada profil ${regionName}`,
        text: `PUS baru ${fmtNum(pus)} unit (${shareLabel(pus, total)}) di ${regionName}, di bawah rata-rata nasional. KPwDN pengampu menargetkan penemuan dan fasilitasi PUS potensial agar keuangan syariah semakin terintegrasi pada klaster unggulan wilayah.`,
      });
    }

    if (kpwRank.length > 1 && topKpw && topKpw.n / total >= 0.18) {
      const bottom = kpwRank[kpwRank.length - 1];
      candidates.push({
        score: 450 + Math.round((topKpw.n / total) * 80),
        tone: "tinggi",
        title: `Ratakan pelaporan KPwDN pengampu di ${regionName}`,
        text: `Sebaran internal ${regionName}: ${shortOffice(topKpw.name)} ${fmtNum(topKpw.n)} unit (${shareLabel(topKpw.n, total)}) vs ${shortOffice(bottom.name)} ${fmtNum(bottom.n)} unit. KPwDN dengan unggahan terendah ditargetkan penambahan data unit binaan agar perumusan kebijakan regional ${regionName} tidak condong ke satu kantor.`,
      });
    } else if (thinKpw.length && kpwRank.length >= 2) {
      candidates.push({
        score: 420,
        tone: "sedang",
        title: `Tingkatkan cakupan KPwDN tipis di ${regionName}`,
        text: `${fmtNum(kpwRank.length)} KPwDN pengampu di ${regionName}; ${thinKpw.map((row) => shortOffice(row.name)).join(", ")} masih berunggahan tipis (≤${fmtNum(thinKpw[0].n)} unit). Bank Indonesia mendorong penambahan 10–15 unit binaan unggulan per kantor pada siklus pelaporan berikutnya.`,
      });
    }

    if (noTahun || stale.length) {
      const oldest = stale.length ? Math.min(...stale.map((row) => Number(row.tahun))) : now;
      candidates.push({
        score: 390 + Math.round(((noTahun + stale.length) / total) * 80),
        tone: (noTahun + stale.length) / total >= 0.25 ? "tinggi" : "sedang",
        title: `Perbarui data fasilitasi ICK di ${regionName}`,
        text: `${noTahun ? `${fmtNum(noTahun)} unit belum memiliki tahun fasilitasi (${shareLabel(noTahun, total)})` : ""}${noTahun && stale.length ? "; " : ""}${stale.length ? `${fmtNum(stale.length)} unit terakhir tercatat ${oldest}–${now - 3}` : ""} di ${regionName}. KPwDN pengampu melengkapi tahun fasilitasi agar capaian ICK mencerminkan aktivitas fasilitasi terkini.`,
      });
    }

    if (noKom && noKom / total >= 0.08) {
      candidates.push({
        score: 370 + Math.round((noKom / total) * 80),
        tone: noKom / total >= 0.2 ? "tinggi" : "sedang",
        title: `Lengkapi klasifikasi komoditas di ${regionName}`,
        text: `${fmtNum(noKom)} unit (${shareLabel(noKom, total)}) di ${regionName} belum berkomoditas. KPwDN pengampu melengkapi kolom komoditas pada Rekap All agar profil klaster ${leadKom ? leadKom.name : regionName} dapat dijadikan dasar perumusan kebijakan.`,
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    const komHint = leadKom ? leadKom.name : volumeKom ? volumeKom.name : "komoditas unggulan";
    const ickHint = focusIck ? focusIck.name : topIck ? topIck.name : "fasilitasi ICK";
    const kpwHint = topKpw ? shortOffice(topKpw.name) : "KPwDN pengampu";
    const fallbacks = [
      {
        tone: "sedang",
        title: `Optimalisasi profil UMKM/PUS ${regionName}`,
        text: `${fmtNum(total)} unit (${fmtNum(umkm)} UMKM · ${fmtNum(pus)} PUS) tersebar di ${fmtNum(kpwRank.length)} KPwDN pengampu${nationalShare ? `, ${shareLabel(total, nationalTotal)} data nasional` : ""}. Prioritas difokuskan pada klaster ${komHint}, program ICK ${ickHint}, dan mutu pelaporan triwulanan.`,
      },
      {
        tone: "sedang",
        title: `Koordinasi KPwDN pengampu ${regionName}`,
        text: `${kpwHint} menjadi kantor dengan unggahan terbanyak di ${regionName}. KPwDN pengampu lain melakukan replikasi tata kelola data dan lembar rujukan klaster ${komHint} agar seluruh ${regionName} tercermin merata.`,
      },
      {
        tone: "sedang",
        title: `Integrasikan BI PRAMESTI dalam rapat ${regionName}`,
        text: `Data ${fmtNum(total)} unit binaan di ${regionName} dijadikan baseline rapat pimpinan: sebaran ${komHint}, portofolio ICK, dan prioritas tindak lanjut disusun dalam satu layar BI PRAMESTI setiap triwulan.`,
      },
    ];

    return {
      priority: pickActions(candidates.concat(fallbacks), 3),
    };
  }

  function buildActions(list) {
    const total = list.length;
    const emptyHorizons = [
      {
        horizon: "pendek",
        label: "Jangka pendek",
        window: "0–6 bulan",
        title: "Lengkapi cakupan data UMKM/PUS",
        text: "KPwDN pengampu mengunggah kertas kerja Rekap All atau melepas filter/fokus peta agar BI PRAMESTI memiliki basis data untuk perumusan kebijakan regional.",
      },
      {
        horizon: "menengah",
        label: "Jangka menengah",
        window: "6–24 bulan",
        title: "Tetapkan ritme pelaporan triwulanan",
        text: "Setiap KPwDN pengampu melaporkan Rekap All setiap triwulan dengan kolom No, komoditas, ICK, tahun fasilitasi, dan Asal KPw terisi guna menjaga mutu data perumusan kebijakan.",
      },
      {
        horizon: "panjang",
        label: "Jangka panjang",
        window: "2–5 tahun",
        title: "Integrasikan BI PRAMESTI dalam rapat regional",
        text: "Ringkasan Eksekutif BI PRAMESTI dijadikan bahan rapat pimpinan KPwDN secara berkala untuk memperkuat sinergi kebijakan dan tindak lanjut ICK.",
      },
    ];
    if (!total) {
      return {
        priority: [
          {
            tone: "sedang",
            title: "Lengkapi cakupan data UMKM/PUS",
            text: "Belum terdapat UMKM/PUS pada filter atau fokus wilayah ini. Lepas fokus peta, sesuaikan filter, atau unggah kertas kerja Rekap All agar prioritas tindak lanjut kebijakan regional dapat disusun.",
          },
        ],
        horizons: emptyHorizons,
      };
    }

    const now = new Date().getFullYear();
    const noKom = list.filter((row) => komoditasLabel(row.komoditas) === "N/A").length;
    const noTahun = list.filter((row) => tahunLabel(row.tahun) === "N/A").length;
    const stale = list.filter((row) => {
      const year = Number(row.tahun);
      return year >= 1900 && year <= now - 3;
    });
    const topKom = countByKomoditas(list).find(([name]) => name !== "N/A");
    const topIck = countByFasilitas(list).find(([name]) => name && name !== "N/A");
    const kpwRank = countByAsalKpw(list);
    const topKpw = kpwRank[0];
    const regionCounts = REGIONS.map((region) => ({
      name: region.name,
      n: list.filter((row) => matchesRegion(region, row.kpwdn)).length,
    })).sort((a, b) => b.n - a.n);
    const padat = regionCounts[0];
    const jarang = regionCounts[regionCounts.length - 1];
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const cakupan = fokus ? `wilayah ${fokus.name}` : "cakupan nasional";

    const komShare = topKom ? topKom[1] / total : 0;
    const kpwShare = topKpw ? topKpw[1] / total : 0;
    const gapShare = padat && total ? (padat.n - (jarang?.n || 0)) / total : 0;
    const naKomShare = noKom / total;
    const naTahunShare = noTahun / total;
    const staleShare = stale.length / total;

    const candidates = [];
    if (jarang && padat && (gapShare >= 0.12 || jarang.n < Math.max(3, Math.round(padat.n * 0.25)))) {
      const rasio = padat.n / Math.max(1, jarang.n);
      candidates.push({
        score: 420 + Math.round(gapShare * 100),
        tone: "tinggi",
        title: `Perkuat sinergi pengembangan UMKM di ${jarang.name}`,
        text: `Sebaran UMKM/PUS menunjukkan ${padat.name} ${fmtNum(padat.n)} unit (${shareLabel(padat.n, total)}) dan ${jarang.name} ${fmtNum(jarang.n)} unit (perbandingan ±${Math.max(1, Math.round(rasio))}:1). Bank Indonesia mendorong penyeimbangan melalui penguatan fasilitasi ICK di KPwDN pengampu ${jarang.name}, termasuk penambahan unggahan 10–20 unit binaan unggulan pada siklus pelaporan berikutnya guna memperkuat dasar perumusan kebijakan regional.`,
      });
    }
    if (topKom && komShare >= 0.08) {
      const komRows = list.filter((row) => komoditasLabel(row.komoditas) === topKom[0]);
      const office = countByAsalKpw(komRows)[0];
      candidates.push({
        score: 400 + Math.round(komShare * 100),
        tone: "tinggi",
        title: `Optimalkan klaster ${topKom[0]} sebagai unggulan regional`,
        text: `${topKom[0]} tercatat ${fmtNum(topKom[1])} unit (${shareLabel(topKom[1], total)}) di ${cakupan}. Prioritas tindak lanjut difokuskan pada pendalaman rantai nilai—akses input, pemasaran, dan pembiayaan syariah—melalui sinergi kebijakan yang ada. ${office ? shortOffice(office[0]) : "KPwDN terpadat"} menyusun lembar rujukan; KPwDN pengampu lain melakukan replikasi terkoordinasi.`,
      });
    }
    if (topKpw && kpwRank.length > 1 && kpwShare >= 0.18) {
      const thin = [...kpwRank].slice(-3).filter((row) => row[0] !== topKpw[0]);
      candidates.push({
        score: 380 + Math.round(kpwShare * 100),
        tone: "tinggi",
        title: "Perluas cakupan pelaporan KPwDN pengampu",
        text: `${shortOffice(topKpw[0])} melaporkan ${fmtNum(topKpw[1])} unit (${shareLabel(topKpw[1], total)}). Guna memperkuat akurasi perumusan kebijakan, KPwDN dengan unggahan terendah${thin.length ? ` (${thin.map((row) => shortOffice(row[0])).join(", ")})` : ""} ditargetkan penambahan data unit binaan pada periode pelaporan berikutnya agar sebaran mendekati potensi wilayah.`,
      });
    }
    if (pus) {
      candidates.push({
        score: 360 + Math.round((pus / total) * 100),
        tone: "sedang",
        title: "Perkuat keterkaitan PUS dengan keuangan syariah",
        text: `${fmtNum(pus)} PUS (${shareLabel(pus, total)}) di ${cakupan}. KPwDN pengampu memetakan: (1) yang telah terhubung pembiayaan syariah, (2) dalam proses sertifikasi halal, (3) belum tersentuh—guna mengarahkan instrumen ICK yang ada ke inklusi keuangan syariah dan peningkatan daya saing.`,
      });
    }
    if (noTahun || stale.length) {
      const oldest = stale.length ? Math.min(...stale.map((row) => Number(row.tahun))) : now;
      candidates.push({
        score: 300 + Math.round((naTahunShare + staleShare) * 80),
        tone: naTahunShare + staleShare >= 0.25 ? "tinggi" : "sedang",
        title: "Perbarui data fasilitasi ICK secara berkala",
        text: `${noTahun ? `${fmtNum(noTahun)} unit belum memiliki tahun fasilitasi (${shareLabel(noTahun, total)})` : ""}${noTahun && stale.length ? "; " : ""}${stale.length ? `${fmtNum(stale.length)} unit terakhir tercatat ${oldest}–${now - 3}` : ""}. KPwDN pengampu melengkapi tahun fasilitasi dan memperbarui sampel unit binaan melalui kunjungan rutin agar capaian ICK mencerminkan aktivitas fasilitasi terkini.`,
      });
    }
    if (noKom && naKomShare >= 0.08) {
      candidates.push({
        score: 280 + Math.round(naKomShare * 80),
        tone: naKomShare >= 0.25 ? "tinggi" : "sedang",
        title: "Lengkapi klasifikasi komoditas pada database",
        text: `${fmtNum(noKom)} unit (${shareLabel(noKom, total)}) di ${cakupan} belum berkomoditas. KPwDN pengampu melengkapi kolom komoditas pada kertas kerja Rekap All agar profil klaster regional dapat dijadikan dasar perumusan kebijakan dan alokasi ICK.`,
      });
    }
    if (topIck) {
      candidates.push({
        score: 240 + Math.round((topIck[1] / total) * 50),
        tone: "sedang",
        title: `Tingkatkan skala program ICK ${topIck[0]}`,
        text: `${topIck[0]} telah menjangkau ${fmtNum(topIck[1])} unit (${shareLabel(topIck[1], total)}). KPwDN pengampu menyeragamkan langkah tindak lanjut—termasuk linkage pasar dan pemantauan status binaan—pada portofolio yang sudah besar guna memperkuat daya saing UMKM.`,
      });
    }
    candidates.sort((a, b) => b.score - a.score);

    const fallbacks = [
      {
        tone: "sedang",
        title: "Manfaatkan Ringkasan Eksekutif dalam rapat regional",
        text: `Gunakan Ringkasan Eksekutif ${cakupan} (${fmtNum(total)} unit) sebagai bahan rapat pimpinan: sebaran lima wilayah, komposisi komoditas, dan prioritas tindak lanjut dalam satu layar BI PRAMESTI.`,
      },
      {
        tone: "sedang",
        title: "Tetapkan penanggung jawab data per KPwDN",
        text: "Setiap KPwDN pengampu menunjuk satu penanggung jawab kertas kerja Rekap All dan unggahan BI PRAMESTI setiap triwulan, guna menjaga mutu kolom komoditas dan tahun fasilitasi.",
      },
      {
        tone: "sedang",
        title: "Standarkan format kertas kerja Rekap All",
        text: "Seragamkan kolom No, Nama UMKM/PUS, Komoditas, ICK, Tahun Fasilitasi, dan Asal KPw agar pelaporan berikutnya konsisten dan mendukung perumusan kebijakan regional.",
      },
    ];

    const naBits = [noKom && `${fmtNum(noKom)} komoditas N/A`, noTahun && `${fmtNum(noTahun)} tahun N/A`].filter(Boolean);
    const horizons = [
      {
        horizon: "pendek",
        label: "Jangka pendek",
        window: "0–6 bulan",
        title: naBits.length
          ? "Lengkapi klasifikasi data"
          : stale.length
            ? "Perbarui data fasilitasi ICK"
            : "Susun bahan rapat regional",
        text: naBits.length
          ? `KPwDN pengampu melengkapi ${naBits.join(" dan ")} melalui edaran resmi, lalu mengunggah ulang Rekap All agar profil klaster dan capaian ICK dapat dijadikan dasar perumusan kebijakan.`
          : stale.length
            ? `${fmtNum(stale.length)} unit belum diperbarui. KPwDN pengampu (${topKpw ? shortOffice(topKpw[0]) : "terpadat"}) memperbarui sampel 20–30 unit binaan melalui kunjungan rutin semester ini agar capaian ICK mencerminkan aktivitas fasilitasi terkini.`
            : `${fmtNum(total)} unit di ${cakupan} dijadikan baseline rapat: tentukan satu klaster unggulan dan satu penanggung jawab data per KPwDN pengampu.`,
      },
      {
        horizon: "menengah",
        label: "Jangka menengah",
        window: "6–24 bulan",
        title: topKom ? `Replikasi klaster ${topKom[0]}` : "Perluas sebaran pelaporan wilayah",
        text: topKom
          ? `Setelah lembar rujukan ${topKom[0]} tersusun, KPwDN pengampu melakukan replikasi terkoordinasi di dua KPwDN lain guna memperkuat rantai nilai dan sinergi kebijakan. ${jarang && padat && jarang.n < padat.n ? `KPwDN di ${jarang.name} menambah unggahan unit binaan unggulan pada dua siklus pelaporan.` : "KPwDN dengan unggahan terendah menambah unit binaan pada dua siklus pelaporan."}`
          : `Bank Indonesia mendorong penyeimbangan sebaran lima wilayah: ${padat.name} (${fmtNum(padat.n)} unit) menjadi rujukan tata kelola data, ${jarang.name} (${fmtNum(jarang.n)} unit) menjadi sasaran perluasan agar alokasi ICK selaras dengan potensi wilayah.`,
      },
      {
        horizon: "panjang",
        label: "Jangka panjang",
        window: "2–5 tahun",
        title: "BI PRAMESTI sebagai instrumen pemantauan kinerja",
        text: `Setiap wilayah memiliki komoditas unggulan dan cakupan ICK yang terdokumentasi. ${fmtNum(total)} unit menjadi baseline; capaian program dan mutu data (komoditas serta tahun fasilitasi) dilaporkan melalui BI PRAMESTI setiap tahun ke rapat pimpinan Direktorat Regional.`,
      },
    ];

    return {
      priority: pickActions(candidates.concat(fallbacks), 3),
      horizons,
    };
  }

  function indonesiaMapHtml(regionCounts, maxN, pinAttr) {
    const attr = pinAttr || "data-wilayah";
    const pins = regionCounts
      .map((region) => {
        const on = (attr === "data-home-wilayah" ? state.homeWilayah : state.wilayah) === region.id ? " on" : "";
        const heat = heatClass(region.n, maxN);
        return `<button type="button" class="map-hotspot heat-${heat}${on}" ${attr}="${region.id}" style="left:${region.x}%;top:${region.y}%" title="${escapeHtml(region.name)}: ${fmtNum(region.n)} UMKM/PUS">
          <b>${fmtNum(region.n)} UMKM/PUS</b>
          <span>${escapeHtml(region.name)}</span>
        </button>`;
      })
      .join("");
    return `<div class="indo-frame">
      <div class="indo-map">
        <img class="indo-sil" src="assets/img/peta-indonesia.png?v=20260824h" alt="Peta Indonesia" width="1416" height="560">
        ${pins}
      </div>
    </div>
    <div class="map-legend">
      <span><i class="heat-low"></i> Rendah</span>
      <span><i class="heat-mid"></i> Sedang</span>
      <span><i class="heat-high"></i> Padat</span>
    </div>`;
  }

  function renderPantau(list) {
    const briefing = document.getElementById("briefing-text");
    if (!briefing) return;
    briefing.innerHTML = briefingHtml(list);

    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const focusBar = document.getElementById("wilayah-focus");
    const focusLabel = document.getElementById("wilayah-focus-label");
    if (focusBar) {
      focusBar.hidden = !state.wilayah;
      if (focusLabel) {
        focusLabel.textContent = fokus
          ? `Fokus wilayah ${fokus.name}`
          : "";
      }
    }
    const clearBtn = document.getElementById("btn-clear-wilayah");
    if (clearBtn) clearBtn.hidden = !state.wilayah;

    const { priority, horizons } = applySaranOverrides(resolveActionBundle(list));
    const saranMeta = document.getElementById("saran-meta");
    if (saranMeta) {
      saranMeta.textContent = list.length
        ? fokus
          ? `Tiga arahan kebijakan untuk wilayah ${fokus.name}, berdasarkan profil UMKM/PUS, ICK, dan KPwDN pengampu di wilayah ini. Klik kotak untuk mengubah teks.`
          : "Tiga arahan kebijakan regional paling material, berdasarkan sebaran UMKM/PUS, konsentrasi KPwDN, dan mutu data. Klik kotak untuk mengubah teks."
        : "Tidak ada saran pada cakupan ini.";
    }
    const saranList = document.getElementById("saran-list");
    if (saranList) {
      saranList.innerHTML = priority
        .map(
          (item, i) => `
        <article class="saran-card tone-${item.tone} saran-editable" data-saran-kind="priority" data-saran-idx="${i}" title="Klik untuk mengubah saran">
          <span class="saran-no">${String(i + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="saran-text">${escapeHtml(item.text)}</span>
          <span class="saran-edit-hint">Ubah</span>
        </article>`
        )
        .join("");
    }
    const horizonList = document.getElementById("saran-horizon-list");
    if (horizonList) {
      horizonList.innerHTML = horizons
        .map(
          (item, i) => `
        <article class="saran-card horizon-${item.horizon} saran-editable" data-saran-kind="horizons" data-saran-idx="${i}" title="Klik untuk mengubah jangka waktu">
          <span class="saran-horizon">${escapeHtml(item.label)}</span>
          <span class="saran-window">${escapeHtml(item.window)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="saran-text">${escapeHtml(item.text)}</span>
          <span class="saran-edit-hint">Ubah</span>
        </article>`
        )
        .join("");
    }

    const rapatBtn = document.getElementById("btn-rapat");
    if (rapatBtn) rapatBtn.textContent = state.rapat ? "Keluar ruang rapat" : "Mode ruang rapat";
    renderKpwBoard(list);
    renderTahunCompare(list);
  }

  const ICK_EXPLAIN = {
    digital:
      "Onboarding digitalisasi usaha, termasuk QRIS dan kanal pembayaran atau pemasaran daring agar unit tercatat di ekosistem digital.",
    ekspor:
      "Pendampingan UMKM yang diarahkan ke pasar luar negeri: mutu produk, dokumen ekspor, dan jejaring pembeli.",
    hijau:
      "Pendampingan praktik usaha ramah lingkungan dan efisiensi sumber daya pada unit kategori hijau.",
    produktivitas:
      "Intervensi pada klaster pangan agar produktivitas naik sekurang-kurangnya 10 persen dibanding baseline KPwDN.",
    bisaid:
      "Program BISAID: perluasan akses, kapasitas, dan pendampingan terpadu bagi UMKM binaan KPwDN.",
    pembiayaan:
      "Unit yang memperoleh pembiayaan, termasuk kanal KUR dan skema pembiayaan lain yang dicatat KPwDN.",
    subsisten:
      "Kelompok usaha subsisten yang masih perlu penguatan kapasitas dasar sebelum naik kelas ke fasilitasi ICK lain.",
    ikra:
      "IKRA dan pondok pesantren: pemberdayaan usaha berbasis komunitas atau pesantren sebagai PUS.",
  };
  const ICK_SHORT = {
    digital: "Digital",
    ekspor: "Ekspor",
    hijau: "Hijau",
    produktivitas: "Produktivitas",
    bisaid: "BISAID",
    pembiayaan: "Pembiayaan",
    subsisten: "Subsisten",
    ikra: "IKRA",
  };
  const ACC_WILAYAH = [
    { id: "Sumatera", name: "Sumatera" },
    { id: "Jawa", name: "Jawa" },
    { id: "Kalimantan", name: "Kalimantan" },
    { id: "Balinusra", name: "Bali Nusra" },
    { id: "Sulampua", name: "Sulampua" },
  ];
  const ICK_PROGRAM_RE = {
    digital: /digital|qris|onboarding/i,
    ekspor: /ekspor/i,
    hijau: /hijau/i,
    produktivitas: /produktivitas|klaster pangan/i,
    bisaid: /bisaid/i,
    pembiayaan: /pembiayaan|\bkur\b/i,
    subsisten: /subsisten/i,
    ikra: /\bikra\b|ponpes|pondok pesantren/i,
  };
  const ICK_COLMAP = [
    { id: "digital", code: "a", name: "UMKM Digital", hasRevised: true, acc: 8, revised: 9, ind: 7, realisasi: 6 },
    { id: "ekspor", code: "b", name: "UMKM Ekspor", hasRevised: false, acc: 12, revised: null, ind: 11, realisasi: 10 },
    { id: "hijau", code: "c", name: "UMKM Hijau", hasRevised: true, acc: 16, revised: 17, ind: 15, realisasi: 14 },
    { id: "produktivitas", code: "d", name: "Peningkatan produktivitas klaster pangan min. 10%", hasRevised: false, acc: 20, revised: null, ind: 19, realisasi: 18 },
    { id: "bisaid", code: "e", name: "BISAID", hasRevised: false, acc: 23, revised: null, ind: 22, realisasi: 21 },
    { id: "pembiayaan", code: "f", name: "UMKM yang Mendapat Pembiayaan", hasRevised: false, acc: 26, revised: null, ind: 25, realisasi: 24 },
    { id: "subsisten", code: "g", name: "Kelompok subsisten", hasRevised: false, acc: 30, revised: null, ind: 29, realisasi: 28 },
    { id: "ikra", code: "h", name: "IKRA + Ponpes", hasRevised: false, acc: 39, revised: null, ind: 38, realisasi: 34 },
  ];

  function ickCapaian() {
    return ickCapaianLive || cloneCapaianSeed();
  }

  function cloneCapaianSeed() {
    const live = window.ICK_CAPAIAN_LIVE;
    if (live && Array.isArray(live.offices) && live.offices.length) {
      return recomputeCapaianTotals(JSON.parse(JSON.stringify(live)));
    }
    const seed = window.ICK_CAPAIAN_2026;
    if (!seed) {
      return recomputeCapaianTotals({
        source: "Input BI PRAMESTI",
        sheet: "",
        year: 2026,
        metric: "Target 2026 (Acc) Revised",
        programs: ICK_COLMAP.map(({ id, code, name, hasRevised }) => ({ id, code, name, hasRevised })),
        totals: {},
        totalsRealisasi: {},
        totalsInd: {},
        offices: [],
      });
    }
    return recomputeCapaianTotals(JSON.parse(JSON.stringify(seed)));
  }

  function ickEmptyZero(value) {
    if (value == null || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const t = String(value).replace(/\s+/g, " ").trim();
    if (!t || t === "-" || t === "–" || t === "—" || /^#?n\/?a$/i.test(t)) return 0;
    const n = Number(t.replace(/,/g, "").replace(/%/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function recomputeCapaianTotals(data) {
    const programs = data.programs && data.programs.length
      ? data.programs
      : ICK_COLMAP.map(({ id, code, name, hasRevised }) => ({ id, code, name, hasRevised }));
    data.programs = programs;
    const totals = {};
    const totalsRealisasi = {};
    const totalsInd = {};
    programs.forEach((item) => {
      totals[item.id] = 0;
      totalsRealisasi[item.id] = 0;
      totalsInd[item.id] = 0;
    });
    (data.offices || []).forEach((office) => {
      office.acc = office.acc || {};
      office.ind = office.ind || {};
      office.realisasi = office.realisasi || {};
      office.totalAcc = 0;
      office.totalRealisasi = 0;
      office.totalInd = 0;
      programs.forEach((item) => {
        const target = ickEmptyZero(office.acc[item.id]);
        const real = ickEmptyZero(office.realisasi[item.id]);
        const ind = ickEmptyZero(office.ind[item.id]);
        office.acc[item.id] = target;
        office.realisasi[item.id] = real;
        office.ind[item.id] = ind;
        totals[item.id] += target;
        totalsRealisasi[item.id] += real;
        totalsInd[item.id] += ind;
        office.totalAcc += target;
        office.totalRealisasi += real;
        office.totalInd += ind;
      });
    });
    data.totals = totals;
    data.totalsRealisasi = totalsRealisasi;
    data.totalsInd = totalsInd;
    return data;
  }

  function recomputeCapaianOffice(office, programs) {
    const payload = {
      programs:
        programs && programs.length
          ? programs
          : ICK_COLMAP.map(({ id, code, name, hasRevised }) => ({ id, code, name, hasRevised })),
      offices: [JSON.parse(JSON.stringify(office || {}))],
    };
    recomputeCapaianTotals(payload);
    return payload.offices[0];
  }

  function captureCapaianEditBaseline(office) {
    if (!office) {
      state.capaianEditBaseline = null;
      return;
    }
    const programs = ickCapaian().programs || [];
    state.capaianEditBaseline = recomputeCapaianOffice(office, programs);
  }

  function buildCapaianPrevSnapshot(source) {
    let prev = recomputeCapaianTotals(JSON.parse(JSON.stringify(source || ickCapaian())));
    const baseline = state.capaianEditBaseline;
    if (!baseline) return prev;
    const key = capaianOfficeKey(baseline);
    const offices = [...(prev.offices || [])];
    const idx = offices.findIndex((office) => capaianOfficeKey(office) === key);
    const normalized = recomputeCapaianOffice(baseline, prev.programs || []);
    if (idx >= 0) offices[idx] = normalized;
    else offices.push(normalized);
    prev.offices = offices;
    return recomputeCapaianTotals(prev);
  }

  function capaianComputedTotals(office, programs) {
    let totalAcc = 0;
    let totalRealisasi = 0;
    (programs || []).forEach((prog) => {
      totalAcc += ickEmptyZero(office?.acc?.[prog.id] ?? office?.accBase?.[prog.id]);
      totalRealisasi += ickEmptyZero(office?.realisasi?.[prog.id]);
    });
    return { totalAcc, totalRealisasi };
  }

  async function loadCapaian() {
    try {
      const raw = localStorage.getItem(ICK_CAPAIAN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.offices) && parsed.offices.length) {
          ickCapaianLive = recomputeCapaianTotals(parsed);
          return;
        }
      }
      const fromIdb = await idbGet(ICK_CAPAIAN_KEY);
      if (fromIdb && Array.isArray(fromIdb.offices) && fromIdb.offices.length) {
        ickCapaianLive = recomputeCapaianTotals(fromIdb);
        return;
      }
    } catch (_) {
      /* seed */
    }
    ickCapaianLive = cloneCapaianSeed();
  }

  async function persistCapaian(data, audit = {}, prevSnapshot = null) {
    const prevSnapshotResolved = recomputeCapaianTotals(
      JSON.parse(JSON.stringify(prevSnapshot || ickCapaian()))
    );
    let next = recomputeCapaianTotals(JSON.parse(JSON.stringify(data)));
    if (isKpwScoped()) {
      const selfKey = kpwScopeMatchKey(state.kpwSelfKey);
      if (!selfKey) {
        flash("Pilih KPwDN pengampu Anda terlebih dahulu.", true);
        return false;
      }
      const prev = JSON.parse(JSON.stringify(ickCapaian()));
      const prevOffices = prev.offices || [];
      const nextOffices = next.offices || [];
      const nextSelf = nextOffices.find((office) => capaianOfficeKey(office) === selfKey);
      for (const office of nextOffices) {
        const key = capaianOfficeKey(office);
        if (!key || key === selfKey) continue;
        const prevOffice = prevOffices.find((row) => capaianOfficeKey(row) === key);
        if (!prevOffice) {
          flash("Anda hanya dapat menambah atau mengubah data ICK KPwDN pengampu Anda.", true);
          return false;
        }
        if (JSON.stringify(prevOffice) !== JSON.stringify(office)) {
          flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
          return false;
        }
      }
      const prevKeys = new Set(prevOffices.map(capaianOfficeKey));
      const nextKeys = new Set(nextOffices.map(capaianOfficeKey));
      for (const key of prevKeys) {
        if (key !== selfKey && !nextKeys.has(key)) {
          flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
          return false;
        }
      }
      const mergedOffices = prevOffices.map((office) =>
        capaianOfficeKey(office) === selfKey && nextSelf ? nextSelf : office
      );
      if (nextSelf && !prevKeys.has(selfKey)) mergedOffices.push(nextSelf);
      next = recomputeCapaianTotals({
        ...prev,
        offices: mergedOffices.sort((a, b) => Number(a.no) - Number(b.no)),
      });
    }
    try {
      await idbSet(ICK_CAPAIAN_KEY, next);
    } catch (_) {
      /* localStorage may still work */
    }
    try {
      localStorage.setItem(ICK_CAPAIAN_KEY, JSON.stringify(next));
    } catch (err) {
      flash(err.message || "Gagal menyimpan capaian ICK.", true);
      return false;
    }
    ickCapaianLive = next;
    const entries = buildCapaianAuditEntries(prevSnapshotResolved, next, audit);
    if (entries.length) await appendAuditLog(entries);
    return true;
  }

  function capaianOfficeKey(office) {
    return accOfficeLabel(office).toLowerCase();
  }

  function decorateCapaianImport(parsed) {
    let offices = parsed.offices || [];
    if (isKpwScoped()) {
      const selfKey = kpwScopeMatchKey(state.kpwSelfKey);
      offices = offices.filter((office) => capaianOfficeKey(office) === selfKey);
    }
    const existing = ickCapaian().offices || [];
    const keys = new Set(existing.map(capaianOfficeKey));
    const fresh = offices.filter((office) => !keys.has(capaianOfficeKey(office)));
    const matched = offices.filter((office) => keys.has(capaianOfficeKey(office)));
    return {
      ...parsed,
      offices,
      fresh,
      matched,
      ignoredOtherOffices: isKpwScoped()
        ? Math.max(0, (parsed.offices || []).length - offices.length)
        : 0,
    };
  }

  function mergeCapaianOffices(incoming) {
    const current = JSON.parse(JSON.stringify(ickCapaian()));
    const byKey = new Map((current.offices || []).map((office) => [capaianOfficeKey(office), office]));
    let maxNo = Math.max(0, ...((current.offices || []).map((o) => Number(o.no) || 0)));
    let added = 0;
    let updated = 0;
    const selfKey = isKpwScoped() ? kpwScopeMatchKey(state.kpwSelfKey) : "";
    (incoming || []).forEach((row) => {
      const key = capaianOfficeKey(row);
      if (!key || key === "tanpa kpwdn") return;
      if (selfKey && key !== selfKey) return;
      const prev = byKey.get(key);
      if (prev) {
        byKey.set(key, {
          ...prev,
          ...row,
          no: prev.no,
          kpwdn: row.kpwdn || prev.kpwdn,
          kpw: row.kpw || prev.kpw,
          wilayah: row.wilayah || prev.wilayah,
          tier: row.tier || prev.tier,
        });
        updated += 1;
      } else {
        if (selfKey && key !== selfKey) return;
        maxNo += 1;
        const next = { ...row, no: maxNo };
        if (selfKey) {
          next.kpwdn = next.kpwdn || state.kpwSelfKey;
        }
        byKey.set(key, next);
        added += 1;
      }
    });
    current.offices = [...byKey.values()].sort((a, b) => Number(a.no) - Number(b.no));
    return { data: current, added, updated };
  }

  function accOfficeLabel(office) {
    const raw = String(office?.kpwdn || office?.kpw || "").replace(/\s+/g, " ").trim();
    if (!raw) return "Tanpa KPwDN";
    return raw.replace(/^(KPwDN|KPwBI|KPw)\s+/i, "").replace(/^Prov\.?\s+/i, "Provinsi ").trim();
  }

  function fmtNum(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "0";
    return Math.round(x).toLocaleString("id-ID");
  }

  function fmtAcc(n) {
    return fmtNum(n);
  }

  function capaianPct(real, target) {
    const t = Number(target || 0);
    const r = Number(real || 0);
    if (!t && !r) return null;
    if (!t) return r > 0 ? 100 : 0;
    return Math.round((r / t) * 1000) / 10;
  }

  function fmtPct(pct) {
    if (pct == null || Number.isNaN(pct)) return "—";
    const n = Number(pct);
    const text = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
    return `${text}%`;
  }

  function pctTone(pct) {
    if (pct == null) return "na";
    if (pct >= 100) return "ok";
    if (pct >= 70) return "mid";
    return "low";
  }

  function capaianBarHtml(pct) {
    const w = pct == null ? 0 : Math.max(0, Math.min(100, Number(pct)));
    return `<span class="capaian-bar tone-${pctTone(pct)}"><i style="width:${w}%"></i></span>`;
  }

  function officeTarget(office, id) {
    return Number(office?.acc?.[id] || 0);
  }

  function officeRealisasi(office, id) {
    return Number(office?.realisasi?.[id] || 0);
  }

  function officeTulenCount(office, programId) {
    const label = accOfficeLabel(office);
    return records.filter(
      (row) => rowMatchesKpwPick(row, label) && (!programId || ickProgramIdFromLabel(row.fasilitas) === programId)
    ).length;
  }

  function ickProgramIdFromLabel(name) {
    const t = ickLabel(name);
    if (t === "N/A") return "";
    return Object.keys(ICK_PROGRAM_RE).find((id) => ICK_PROGRAM_RE[id].test(t)) || "";
  }

  function countRecordsForIck(programId) {
    return records.filter((row) => ickProgramIdFromLabel(row.fasilitas) === programId).length;
  }

  function fasilitasLabelsForProgram(programId) {
    return unique("fasilitas").filter((label) => ickProgramIdFromLabel(label) === programId);
  }

  function capaianOfficeByNo(no) {
    return (ickCapaian().offices || []).find((office) => Number(office.no) === Number(no)) || null;
  }

  function openCapaianOfficeDb(office) {
    if (!office) return;
    state.kpwdn = [accOfficeLabel(office)];
    state.fasilitas = state.capaianProgram ? fasilitasLabelsForProgram(state.capaianProgram) : [];
    state.komoditas = [];
    state.tahun = [];
    state.qNama = "";
    state.jenis = [];
    state.wilayah = "";
    state.page = 1;
    setView("database");
  }

  function capaianOfficeModalHtml(office, programs) {
    const name = accOfficeLabel(office);
    const wilayah = office.wilayah === "Balinusra" ? "Bali Nusra" : office.wilayah;
    const targetTotal = Number(office.totalAcc || 0);
    const indTotal = Number(office.totalInd || 0);
    const realTotal = Number(office.totalRealisasi || 0);
    const pctTotal = capaianPct(realTotal, targetTotal);
    const tulenTotal = officeTulenCount(office);
    const rows = programs
      .map((item) => {
        const target = officeTarget(office, item.id);
        const real = officeRealisasi(office, item.id);
        const pct = capaianPct(real, target);
        const tulen = officeTulenCount(office, item.id);
        const on = item.id === state.capaianProgram ? " ick-col-on" : "";
        return `<tr class="${on.trim()}">
          <td class="name"><strong>${escapeHtml(item.code)}. ${escapeHtml(item.name)}</strong></td>
          <td class="num">${fmtAcc(target)}</td>
          <td class="num">${fmtAcc(ickEmptyZero(office.ind?.[item.id]))}</td>
          <td class="num">${fmtAcc(real)}</td>
          <td class="num"><span class="complete-pill complete-${pctTone(pct)}">${fmtPct(pct)}</span></td>
          <td>${capaianBarHtml(pct)}</td>
          <td class="num">${fmtAcc(tulen)}</td>
        </tr>`;
      })
      .join("");
    return `
      <div class="modal-back" data-close="1">
        <div class="modal wide capaian-office-modal" role="dialog" aria-modal="true">
          <div class="capaian-detail-head">
            <div>
              <div class="kicker">Capaian KPwDN</div>
              <h2>${escapeHtml(name)}</h2>
              <div class="meta">${escapeHtml(office.tier)} · ${escapeHtml(wilayah)}. Target memakai Acc Revised bila kolom itu ada. Realisasi dari kolom Realisasi 2026 per Juni.</div>
            </div>
          </div>
          <div class="lembar-stats capaian-kpis">
            <div class="tile-navy"><b>${fmtAcc(targetTotal)}</b><span>Target 2026</span></div>
            <div class="tile-gold"><b>${fmtAcc(realTotal)}</b><span>Realisasi per Juni</span></div>
            <div class="tile-blue"><b>${fmtPct(pctTotal)}</b><span>Keberhasilan vs target</span></div>
            <div class="tile-slate"><b>${fmtAcc(tulenTotal)}</b><span>Terdata BI PRAMESTI</span></div>
          </div>
          <div class="board-scroll capaian-detail-scroll">
            <table class="data-table kpw-board capaian-table">
              <thead>
                <tr>
                  <th>Fasilitas ICK</th>
                  <th>Target 2026 Acc</th>
                  <th>Target 2026 Ind</th>
                  <th>Realisasi</th>
                  <th>Capaian</th>
                  <th>Progres</th>
                  <th>Terdata</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="capaian-total">
                  <td class="name"><strong>Jumlah</strong><small>Delapan ICK kantor ini</small></td>
                  <td class="num"><b>${fmtAcc(targetTotal)}</b></td>
                  <td class="num"><b>${fmtAcc(indTotal)}</b></td>
                  <td class="num"><b>${fmtAcc(realTotal)}</b></td>
                  <td class="num"><span class="complete-pill complete-${pctTone(pctTotal)}">${fmtPct(pctTotal)}</span></td>
                  <td>${capaianBarHtml(pctTotal)}</td>
                  <td class="num"><b>${fmtAcc(tulenTotal)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="capaian-detail-note">Capaian = realisasi kertas kerja dibagi target Acc/Acc Revised. Terdata BI PRAMESTI adalah jumlah unit kantor ini di Database, bukan angka resmi realisasi IKU.</p>
          <div class="modal-actions">
            ${
              can("canEdit") && officeIsKpwSelf(office)
                ? `<button class="btn btn-ghost btn-sm" type="button" data-capaian-edit>Ubah data</button>`
                : ""
            }
            <button class="btn btn-dark btn-sm" type="button" data-capaian-db>Buka di Database</button>
            <button class="btn btn-primary btn-sm" type="button" data-close="1">Tutup</button>
          </div>
        </div>
      </div>`;
  }

  function renderCapaian() {
    const box = document.getElementById("ick-explain");
    if (!box) return;
    const data = ickCapaian();
    const programs = data.programs || [];
    const sel = document.getElementById("capaian-wilayah");
    if (sel && sel.options.length <= 1) {
      ACC_WILAYAH.forEach((row) => {
        const opt = document.createElement("option");
        opt.value = row.id;
        opt.textContent = row.name;
        sel.appendChild(opt);
      });
    }
    if (sel) sel.value = state.capaianWilayah;
    const q = document.getElementById("capaian-q");
    if (q && q.value !== state.capaianQ) q.value = state.capaianQ;
    const resetBtn = document.getElementById("capaian-reset");
    if (resetBtn) resetBtn.hidden = !state.capaianProgram;
    const addBtn = document.getElementById("btn-capaian-add");
    if (addBtn) addBtn.textContent = "Tambah data";

    const qFold = state.capaianQ.trim().toLowerCase();
    const offices = (data.offices || []).filter((office) => {
      if (state.capaianWilayah && office.wilayah !== state.capaianWilayah) return false;
      if (!qFold) return true;
      const hay = `${office.kpw} ${office.kpwdn} ${accOfficeLabel(office)} ${office.tier}`.toLowerCase();
      return hay.includes(qFold);
    });
    const shown = state.capaianProgram
      ? programs.filter((item) => item.id === state.capaianProgram)
      : programs;
    const metricLabel = data.metric || "Target 2026 (Acc) Revised";
    const tools = document.getElementById("capaian-tools");
    const scroll = document.getElementById("capaian-scroll");
    if (tools) tools.hidden = false;
    if (scroll) scroll.hidden = false;

    box.innerHTML = programs.length
      ? [...programs]
          .map((item) => {
            const acc = Number(data.totals?.[item.id] || 0);
            const real = Number(data.totalsRealisasi?.[item.id] || 0);
            const pct = capaianPct(real, acc);
            return { item, acc, real, pct, terdata: countRecordsForIck(item.id) };
          })
          .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1) || a.item.name.localeCompare(b.item.name, "id"))
          .map(({ item, acc, real, pct, terdata }) => {
            const on = item.id === state.capaianProgram ? " on" : "";
            const tone = pct == null ? "" : pct > 70 ? " ick-hi" : " ick-lo";
            const tag = item.hasRevised ? "Target 2026 Acc Revised" : "Target 2026 Acc";
            return `<button type="button" class="ick-card${tone}${on}" data-ick-program="${escapeHtml(item.id)}">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="ick-desc">${escapeHtml(ICK_EXPLAIN[item.id] || "")}</span>
              <span class="ick-metrics">
                <b>${fmtPct(pct)}</b>
                <small>Capaian nasional</small>
                <em>${fmtAcc(real)} realisasi / ${fmtAcc(acc)} ${tag.toLowerCase()}</em>
                <em>${fmtAcc(terdata)} terdata di BI PRAMESTI</em>
              </span>
            </button>`;
          })
          .join("")
      : `<p class="muted">Tabel 2026 (Acc) belum dimuat.</p>`;

    const head = document.getElementById("capaian-head");
    const body = document.getElementById("capaian-body");
    if (!head || !body) return;
    if (!programs.length) {
      head.innerHTML = "";
      body.innerHTML = `<tr><td class="muted">Tidak ada data ${escapeHtml(metricLabel)}.</td></tr>`;
      return;
    }
    const extra = 2;
    const colCount = 2 + shown.length + extra;
    const colHead = shown
      .map(
        (item) =>
          `<th class="${item.id === state.capaianProgram ? "ick-col-on" : ""}" title="${escapeHtml(item.name)}">${escapeHtml(ICK_SHORT[item.id] || item.name)}</th>`
      )
      .join("");
    const sortMark = state.capaianSort === "asc" ? " ↑" : " ↓";
    head.innerHTML = `<tr>
      <th>No</th>
      <th>KPwDN pengampu</th>
      ${colHead}
      <th>Target 2026</th>
      <th><button type="button" class="sort-btn" data-capaian-sort="pct" data-label="Capaian" title="Urutkan persentase capaian">Capaian${sortMark}</button></th>
    </tr>`;
    if (!offices.length) {
      body.innerHTML = `<tr><td colspan="${colCount}" class="muted">Tidak ada kantor pada saringan ini.</td></tr>`;
      return;
    }
    const sumAcc = {};
    const sumReal = {};
    shown.forEach((item) => {
      sumAcc[item.id] = offices.reduce((n, office) => n + officeTarget(office, item.id), 0);
      sumReal[item.id] = offices.reduce((n, office) => n + officeRealisasi(office, item.id), 0);
    });
    const sumTotal = offices.reduce((n, office) => n + Number(office.totalAcc || 0), 0);
    const sumRealTotal = offices.reduce((n, office) => n + Number(office.totalRealisasi || 0), 0);
    const rankedOffices = [...offices]
      .map((office) => {
        const t = state.capaianProgram ? officeTarget(office, state.capaianProgram) : Number(office.totalAcc || 0);
        const r = state.capaianProgram
          ? officeRealisasi(office, state.capaianProgram)
          : Number(office.totalRealisasi || 0);
        const pct = capaianPct(r, t);
        return { office, t, r, pct };
      })
      .sort((a, b) => {
        const pa = a.pct ?? -1;
        const pb = b.pct ?? -1;
        if (state.capaianSort === "asc") return pa - pb || Number(a.office.no) - Number(b.office.no);
        return pb - pa || Number(a.office.no) - Number(b.office.no);
      });
    const rows = rankedOffices
      .map(({ office, t, r, pct }, i) => {
        const name = accOfficeLabel(office);
        const cells = shown
          .map((item) => {
            const n = officeTarget(office, item.id);
            const on = item.id === state.capaianProgram ? " ick-col-on" : "";
            return `<td class="num${on}${n ? "" : " muted"}">${fmtAcc(n)}</td>`;
          })
          .join("");
        return `<tr class="kpw-row" data-capaian-office="${office.no}" title="Lihat capaian ${escapeHtml(name)}">
          <td>${i + 1}</td>
          <td class="name"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(office.tier)} · ${escapeHtml(office.wilayah === "Balinusra" ? "Bali Nusra" : office.wilayah)}</small></td>
          ${cells}
          <td class="num"><b>${fmtAcc(t)}</b></td>
          <td class="num"><span class="complete-pill complete-${pctTone(pct)}">${fmtPct(pct)}</span></td>
        </tr>`;
      })
      .join("");
    const footCells = shown.map((item) => `<td class="num">${fmtAcc(sumAcc[item.id])}</td>`).join("");
    const footPct = capaianPct(
      state.capaianProgram ? sumReal[state.capaianProgram] : sumRealTotal,
      state.capaianProgram ? sumAcc[state.capaianProgram] : sumTotal
    );
    body.innerHTML = `${rows}<tr class="capaian-total"><td></td><td class="name"><strong>Jumlah saringan</strong><small>${offices.length} kantor</small></td>${footCells}<td class="num">${fmtAcc(state.capaianProgram ? sumAcc[state.capaianProgram] : sumTotal)}</td><td class="num">${fmtPct(footPct)}</td></tr>`;
  }

  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function donutPath(cx, cy, outer, inner, start, end) {
    const sweep = end - start;
    if (sweep <= 0.03) return "";
    if (sweep >= 359.95) {
      return `M ${cx} ${cy - outer} A ${outer} ${outer} 0 1 1 ${cx} ${cy + outer} A ${outer} ${outer} 0 1 1 ${cx} ${cy - outer} M ${cx} ${cy - inner} A ${inner} ${inner} 0 1 0 ${cx} ${cy + inner} A ${inner} ${inner} 0 1 0 ${cx} ${cy - inner}`;
    }
    const large = sweep > 180 ? 1 : 0;
    const [sx, sy] = polar(cx, cy, outer, start);
    const [ex, ey] = polar(cx, cy, outer, end);
    const [ix, iy] = polar(cx, cy, inner, end);
    const [jx, jy] = polar(cx, cy, inner, start);
    return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${ix} ${iy} A ${inner} ${inner} 0 ${large} 0 ${jx} ${jy} Z`;
  }

  function pieSlices(entries, limit) {
    if (!entries.length) return [];
    const all = entries.map(([name, n]) => ({ name, n, value: String(name), others: null }));
    if (!limit || entries.length <= limit) return all;
    const head = all.slice(0, limit - 1);
    const rest = entries.slice(limit - 1);
    head.push({
      name: "Lainnya",
      n: rest.reduce((sum, [, count]) => sum + count, 0),
      value: "Lainnya",
      others: rest.map(([name]) => String(name)),
    });
    return head;
  }

  function pieChartHtml(title, field, entries, limit) {
    const slices = pieSlices(entries, limit);
    const total = slices.reduce((sum, item) => sum + item.n, 0);
    if (!total) {
      return `
        <section class="chart-card">
          <h3>${escapeHtml(title)}</h3>
          <p class="chart-empty">Tidak ada data untuk grafik ini.</p>
        </section>`;
    }
    const cx = 80;
    const cy = 80;
    const outer = 72;
    const inner = 44;
    let angle = 0;
    const paths = slices
      .map((slice, i) => {
        const sweep = (slice.n / total) * 360;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        const d = donutPath(cx, cy, outer, inner, start, end);
        if (!d) return "";
        const othersAttr = slice.others
          ? ` data-chart-others="${escapeHtml(JSON.stringify(slice.others))}"`
          : "";
        return `<path fill-rule="evenodd" fill="${PIE_COLORS[i % PIE_COLORS.length]}" d="${d}" data-chart-field="${escapeHtml(field)}" data-chart-value="${escapeHtml(slice.value)}"${othersAttr}><title>${escapeHtml(slice.name)}: ${fmtNum(slice.n)}</title></path>`;
      })
      .join("");
    const legend = slices
      .map((slice, i) => {
        const othersAttr = slice.others
          ? ` data-chart-others="${escapeHtml(JSON.stringify(slice.others))}"`
          : "";
        const label = slice.name;
        const pct = Math.round((slice.n / total) * 100);
        return `
          <button type="button" class="pie-legend-item" data-chart-field="${escapeHtml(field)}" data-chart-value="${escapeHtml(slice.value)}"${othersAttr} title="Lihat ${fmtNum(slice.n)} UMKM / PUS">
            <i style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></i>
            <span>${escapeHtml(label)}</span>
            <b>${fmtNum(slice.n)} · ${pct}%</b>
          </button>`;
      })
      .join("");
    return `
      <section class="chart-card">
        <h3>${escapeHtml(title)}</h3>
        <p class="chart-hint">Klik irisan atau legenda untuk melihat daftar UMKM</p>
        <div class="pie-layout">
          <div class="pie-wrap">
            <svg viewBox="0 0 160 160" class="pie-svg" role="img" aria-label="${escapeHtml(title)}">
              ${paths}
            </svg>
            <div class="pie-center">
              <strong>${fmtNum(total)}</strong>
              <small>UMKM/PUS</small>
            </div>
          </div>
          <div class="pie-legend">${legend}</div>
        </div>
      </section>`;
  }

  function chartFiltered(list) {
    const pick = String(state.chartKpwQ || "").replace(/\s+/g, " ").trim();
    if (!pick) return list;
    return list.filter((row) => asalKpwLabel(row.kpwdn) === pick);
  }

  function chartFieldLabel(row, field) {
    if (field === "komoditas") return komoditasLabel(row.komoditas);
    if (field === "fasilitas") return ickLabel(row.fasilitas);
    if (field === "tahun") return tahunLabel(row.tahun);
    if (field === "kpwdn") return asalKpwLabel(row.kpwdn);
    return String(row[field] || "");
  }

  function chartSliceMatch(row, field, value, others) {
    if (field === "kpwdn") return asalKpwLabel(row.kpwdn) === String(value);
    if (field === "komoditas") return komoditasLabel(row.komoditas) === String(value);
    if (field === "fasilitas") {
      const label = ickLabel(row.fasilitas);
      return label === String(value) || label.toLowerCase() === String(value).toLowerCase();
    }
    if (field === "tahun") return tahunLabel(row.tahun) === String(value);
    if (others && others.length) return others.includes(String(row[field]));
    return String(row[field]) === String(value);
  }

  function chartSliceRows(field, value, others) {
    return chartFiltered(filtered()).filter((row) => chartSliceMatch(row, field, value, others));
  }

  function uniqueChartLabels(rows, field) {
    if (field === "fasilitas") {
      const map = {};
      rows.forEach((row) => {
        const label = ickLabel(row.fasilitas);
        const fold = label.toLowerCase();
        if (!map[fold] || label !== "N/A") map[fold] = label;
      });
      return Object.values(map).sort((a, b) => a.localeCompare(b, "id"));
    }
    const set = new Set(rows.map((row) => chartFieldLabel(row, field)));
    const list = [...set];
    if (field === "tahun") return list.sort((a, b) => String(b).localeCompare(String(a), "id"));
    return list.sort((a, b) => String(a).localeCompare(String(b), "id"));
  }

  function chartExtraFilters(modal) {
    const extra = CHART_LIST_EXTRA[modal.field] || [];
    const filters = modal.chartFilters || {};
    const out = {};
    extra.forEach((key) => {
      out[key] = String(filters[key] || "").trim();
    });
    return out;
  }

  function chartListRows(modal) {
    const slice = chartSliceRows(modal.field, modal.value, modal.others);
    const filters = chartExtraFilters(modal);
    const extra = CHART_LIST_EXTRA[modal.field] || [];
    const namaQ = String(modal.chartFilters?.nama || "")
      .trim()
      .toLowerCase();
    return slice.filter((row) => {
      if (namaQ && !String(row.nama || "").toLowerCase().includes(namaQ)) return false;
      return extra.every((key) => {
        const pick = filters[key];
        if (!pick) return true;
        if (key === "fasilitas") return ickLabel(row.fasilitas).toLowerCase() === pick.toLowerCase();
        return chartFieldLabel(row, key) === pick;
      });
    });
  }

  function chartListFilterHtml(modal, sliceRows) {
    const extra = CHART_LIST_EXTRA[modal.field] || [];
    const filters = chartExtraFilters(modal);
    const namaQ = String(modal.chartFilters?.nama || "").trim();
    const nameControl = `<label class="chart-list-filter">Cari nama
      <input type="search" data-chart-list-filter="nama" value="${escapeHtml(namaQ)}" placeholder="Nama UMKM/PUS" autocomplete="off">
    </label>`;
    const controls = extra
      .map((key) => {
        const current = filters[key] || "";
        const options = uniqueChartLabels(sliceRows, key)
          .map(
            (name) =>
              `<option value="${escapeHtml(name)}"${name === current ? " selected" : ""}>${escapeHtml(name)}</option>`
          )
          .join("");
        return `<label class="chart-list-filter">${escapeHtml(CHART_FILTER_LABELS[key] || key)}
          <select data-chart-list-filter="${escapeHtml(key)}">
            <option value="">Semua ${escapeHtml(String(CHART_FILTER_LABELS[key] || key).toLowerCase())}</option>
            ${options}
          </select>
        </label>`;
      })
      .join("");
    const has = Boolean(namaQ) || extra.some((key) => filters[key]);
    return `<div class="chart-list-filters">
      ${nameControl}
      ${controls}
      ${has ? `<button type="button" class="btn btn-ghost btn-sm" id="btn-chart-list-clear">Hapus filter</button>` : ""}
    </div>`;
  }

  function fillChartKpwSelect() {
    const select = document.getElementById("chart-kpw-q");
    if (!select) return;
    const labels = uniqueKpwLabels();
    const current = String(state.chartKpwQ || "").replace(/\s+/g, " ").trim();
    const known = new Set(labels);
    if (current && !known.has(current)) {
      state.chartKpwQ = "";
    }
    const pick = String(state.chartKpwQ || "").trim();
    let lastRegion = "";
    let html = `<option value="">Semua KPw pengampu</option>`;
    labels.forEach((label) => {
      const region = regionOf(label)?.name || "Lainnya";
      if (region !== lastRegion) {
        if (lastRegion) html += `</optgroup>`;
        html += `<optgroup label="${escapeHtml(region)}">`;
        lastRegion = region;
      }
      html += `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`;
    });
    if (lastRegion) html += `</optgroup>`;
    select.innerHTML = html;
    select.value = pick;
  }

  function renderCharts(list) {
    const box = document.getElementById("charts");
    if (!box) return;
    fillChartKpwSelect();
    const clear = document.getElementById("btn-chart-kpw-clear");
    const q = String(state.chartKpwQ || "").trim();
    if (clear) clear.hidden = !q;
    const sliced = chartFiltered(list);
    const caption = document.getElementById("chart-kpw-caption");
    if (caption) {
      caption.textContent = q
        ? sliced.length
          ? `KPw pengampu ${q}: ${fmtNum(sliced.length)} unit dari ${fmtNum(list.length)}.`
          : `Tidak ada unit pada KPw pengampu ${q}.`
        : "";
    }
    box.innerHTML = [
      pieChartHtml("Jumlah UMKM/PUS berdasarkan komoditas", "komoditas", countByKomoditas(sliced), 0),
      pieChartHtml("Jumlah UMKM/PUS berdasarkan ICK", "fasilitas", countByFasilitas(sliced), 0),
      pieChartHtml("Jumlah UMKM/PUS berdasarkan KPwDN pengampu", "kpwdn", countByAsalKpw(sliced), 0),
      pieChartHtml("Jumlah UMKM/PUS berdasarkan tahun", "tahun", countByTahun(sliced), 0),
    ].join("");
  }

  function renderFilters() {
    const nama = document.getElementById("filter-nama");
    if (nama) nama.value = state.qNama;
    const jenis = document.getElementById("filter-jenis");
    if (jenis) jenis.innerHTML = checkboxFilterHtml(["UMKM", "PUS"], state.jenis);
    const kom = document.getElementById("filter-komoditas");
    if (kom) kom.innerHTML = checkboxFilterHtml(unique("komoditas"), state.komoditas);
    const fas = document.getElementById("filter-fasilitas");
    if (fas) fas.innerHTML = checkboxFilterHtml(unique("fasilitas"), state.fasilitas);
    const th = document.getElementById("filter-tahun");
    if (th) th.innerHTML = checkboxFilterHtml(unique("tahun"), state.tahun);
    const kpw = document.getElementById("filter-kpwdn");
    if (kpw) kpw.innerHTML = kpwdnFilterHtml(state.kpwdn);
  }

  function renderTable(list) {
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    const showAksi = can("canEdit");
    const thAksi = document.getElementById("th-aksi");
    if (thAksi) thAksi.hidden = !showAksi;
    const cols = showAksi ? 8 : 7;

    const sortMark = (key) =>
      state.sortKey === key ? (state.sortDir === "asc" ? " ↑" : " ↓") : "";

    document.getElementById("result-meta").textContent =
      list.length === 0
        ? "Tidak ada data yang sesuai filter"
        : `Menampilkan ${fmtNum(start + 1)}–${fmtNum(start + slice.length)} dari ${fmtNum(list.length)} data`;

    document.getElementById("table-body").innerHTML = slice.length
      ? slice
          .map(
            (row, i) => `
        <tr>
          <td>${fmtNum(start + i + 1)}</td>
          <td>
            <span class="name">${escapeHtml(row.nama)}</span>
            <span class="sub">${escapeHtml(row.jenis)}</span>
          </td>
          <td>${escapeHtml(row.komoditas)}</td>
          <td>${escapeHtml(row.fasilitas)}</td>
          <td>${escapeHtml(row.tahun)}</td>
          <td>${escapeHtml(row.kpwdn)}</td>
          <td class="ket-cell">${escapeHtml(row.keterangan || "—")}</td>
          ${
            showAksi
              ? recordIsKpwSelf(row)
                ? `<td class="aksi-cell">
            <button type="button" class="btn btn-ghost btn-sm" data-edit="${escapeHtml(row.id)}">Ubah</button>
            <button type="button" class="btn btn-danger btn-sm" data-delete="${escapeHtml(row.id)}">Hapus</button>
          </td>`
                : `<td class="aksi-cell muted">—</td>`
              : ""
          }
        </tr>`
          )
          .join("")
      : `<tr><td colspan="${cols}" class="muted">Tidak ada data. Ubah filter atau tambah data baru.</td></tr>`;

    document.querySelectorAll("[data-sort]").forEach((btn) => {
      const key = btn.getAttribute("data-sort");
      btn.textContent = btn.getAttribute("data-label") + sortMark(key);
    });

    const pageBtns = pageWindow(state.page, pages).map((item) => {
      if (item === "…") return `<span class="pager-gap" aria-hidden="true">…</span>`;
      return `<button type="button" data-page="${item}" class="${item === state.page ? "on" : ""}" aria-current="${item === state.page ? "page" : "false"}">${fmtNum(item)}</button>`;
    });
    document.getElementById("pager-pages").innerHTML = pageBtns.join("");
    const pagerInfo = document.getElementById("pager-info");
    if (pagerInfo) {
      pagerInfo.textContent = list.length
        ? `Halaman ${fmtNum(state.page)} dari ${fmtNum(pages)}`
        : "Tidak ada halaman";
    }
    document.getElementById("prev-page").disabled = state.page <= 1;
    document.getElementById("next-page").disabled = state.page >= pages;
  }

  function pageWindow(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const keep = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4, 5].forEach((n) => keep.add(n));
    if (current >= total - 2) [total - 4, total - 3, total - 2, total - 1].forEach((n) => keep.add(n));
    const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const items = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) items.push("…");
      items.push(n);
    });
    return items;
  }

  function filteredHistory() {
    const q = state.historyQ.trim().toLowerCase();
    return auditLog.filter((entry) => {
      if (state.historyModule && entry.module !== state.historyModule) return false;
      if (!q) return true;
      const hay = [
        entry.actor,
        entry.summary,
        entry.target,
        AUDIT_MODULE_LABELS[entry.module],
        AUDIT_ACTION_LABELS[entry.action],
        ...(entry.details || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function renderHistory() {
    if (!canView("history")) return;
    const body = document.getElementById("history-body");
    const meta = document.getElementById("history-meta");
    if (!body) return;
    const list = filteredHistory();
    if (meta) {
      meta.textContent =
        list.length === 0
          ? "Belum ada perubahan data yang tercatat."
          : `Menampilkan ${fmtNum(list.length)} dari ${fmtNum(auditLog.length)} catatan.`;
    }
    body.innerHTML = list.length
      ? list
          .map((entry) => {
            return `<tr>
          <td class="history-when">${escapeHtml(formatHistoryWhen(entry.at))}</td>
          <td><strong>${escapeHtml(entry.actor)}</strong></td>
          <td>${escapeHtml(AUDIT_MODULE_LABELS[entry.module] || entry.module)}<br><span class="sub">${escapeHtml(AUDIT_ACTION_LABELS[entry.action] || entry.action)}</span></td>
          <td><div class="history-summary-main">${escapeHtml(entry.summary)}</div>${entry.context ? `<div class="history-summary-sub">${escapeHtml(entry.context)}</div>` : ""}</td>
          <td class="history-detail">${auditChangesHtml(entry)}</td>
          <td class="history-actions"><button type="button" class="btn btn-ghost btn-sm history-delete" data-history-id="${escapeHtml(entry.id)}">Hapus</button></td>
        </tr>`;
          })
          .join("")
      : `<tr><td colspan="6" class="muted">Belum ada riwayat perubahan. Perubahan oleh Administrator atau Kantor Perwakilan akan muncul di sini.</td></tr>`;
  }

  function resolveJsPdf() {
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
    if (typeof window.jsPDF === "function") return window.jsPDF;
    return null;
  }

  function savePdfFile(pdf, filename) {
    try {
      pdf.save(filename);
      return true;
    } catch (_) {
      try {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  function downloadHistoryPdf() {
    if (!canView("history")) {
      flash("History hanya tersedia untuk Administrator.", true);
      return;
    }
    const JsPDF = resolveJsPdf();
    if (!JsPDF) {
      flash("Pustaka PDF belum termuat. Muat ulang halaman, lalu coba lagi.", true);
      return;
    }
    const list = filteredHistory();
    if (!list.length) {
      flash("Tidak ada riwayat untuk diunduh.", true);
      return;
    }
    const btn = document.getElementById("btn-history-pdf");
    if (btn) btn.disabled = true;
    try {
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const m = 12;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const navy = [0, 48, 87];
      const gold = [199, 163, 90];
      const muted = [90, 107, 122];
      const line = [197, 207, 219];
      const dated = pdfSafeText(
        new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      const paintHeader = (title, kicker) => {
        pdf.setFillColor(...navy);
        pdf.rect(0, 0, pageW, 24, "F");
        pdf.setFillColor(...gold);
        pdf.rect(0, 24, pageW, 1.1, "F");
        pdf.setTextColor(...gold);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("BI PRAMESTI", m, 8);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text("Departemen Regional, Bank Indonesia", m + 26, 8);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(pdfSafeText(title), m, 16.5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(158, 196, 234);
        pdf.text(pdfSafeText(kicker), m, 21.5);
        pdf.text(dated, pageW - m, 8, { align: "right" });
      };

      paintHeader("History Perubahan Data", pdfSafeText(`${fmtNum(list.length)} catatan | khusus Administrator`));
      let y = 32;
      const contentW = pageW - m * 2;

      list.forEach((entry, index) => {
        const changes = entryPdfChanges(entry);
        const metaH = pdfHistoryMetaHeight(entry);
        const changesH = pdfHistoryChangesHeight(changes);
        const blockH = metaH + changesH + 2;
        const colors = { navy, gold, muted, line };
        if (y + blockH > pageH - 14) {
          pdf.addPage();
          paintHeader("History Perubahan Data", "Lanjutan");
          y = 32;
        }
        const blockTop = y;
        pdf.setDrawColor(...line);
        pdf.setLineWidth(0.25);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(m, blockTop, contentW, blockH, "FD");
        pdf.setFillColor(...gold);
        pdf.rect(m, blockTop, 1.4, blockH, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(...muted);
        pdf.text(String(index + 1), m + 3.5, blockTop + 4.8);
        const innerX = m + 7;
        const innerW = contentW - 9;
        let innerY = blockTop + 1.5;
        innerY = pdfDrawHistoryMeta(pdf, entry, innerX, innerY, innerW, colors);
        if (changes.length) {
          pdfDrawHistoryChangesTable(pdf, changes, entry, innerX, innerY, innerW, colors);
        } else {
          pdf.setFontSize(7);
          pdf.setTextColor(...muted);
          pdf.text("Tidak ada detail perubahan.", innerX + 2, innerY + 4);
        }
        y += blockH + 4;
      });

      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i += 1) {
        pdf.setPage(i);
        pdf.setDrawColor(...line);
        pdf.line(m, pageH - 8, pageW - m, pageH - 8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(...muted);
        pdf.text(`Halaman ${i} dari ${total}`, pageW - m, pageH - 4.6, { align: "right" });
      }
      if (!savePdfFile(pdf, "bi-pramesti-history-perubahan.pdf")) {
        flash("Gagal mengunduh PDF history.", true);
        return;
      }
      flash("PDF history diunduh.");
    } catch (err) {
      console.error("downloadHistoryPdf", err);
      flash("Gagal membuat PDF history.", true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function setView(view) {
    if (!["beranda", "ringkasan", "capaian", "database", "history"].includes(view)) return;
    if (!canView(view)) {
      flash("Akun ini tidak memiliki akses ke menu tersebut.", true);
      return;
    }
    state.view = view;
    if (view !== "ringkasan") state.rapat = false;
    if (view === "history") {
      loadHistory().then(() => {
        renderView();
        renderHistory();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderView() {
    applyRoleChrome();
    const titles = {
      beranda: "Beranda",
      ringkasan: "Ringkasan Eksekutif",
      capaian: "Capaian ICK",
      database: "Database UMKM / PUS",
      history: "History",
    };
    document.querySelectorAll("[data-view-panel]").forEach((el) => {
      el.hidden = el.getAttribute("data-view-panel") !== state.view;
    });
    document.querySelectorAll(".view-nav [data-view]").forEach((btn) => {
      btn.classList.toggle("on", btn.getAttribute("data-view") === state.view);
    });
    const crumb = document.getElementById("crumb-view");
    if (crumb) crumb.textContent = titles[state.view] || "";
    document.getElementById("app-shell").classList.toggle(
      "rapat-mode",
      Boolean(state.rapat && state.view === "ringkasan")
    );
  }

  function render() {
    const list = filtered();
    renderView();
    renderKpwSelfBar();
    renderFilters();
    renderStats(list);
    renderPantau(list);
    renderCapaian();
    renderCharts(list);
    renderTable(list);
    renderHistory();
    renderModal();
  }

  function closeModal() {
    state.modal = null;
    state.importDraft = null;
    state.capaianDraft = null;
    renderModal();
  }

  function importDropHtml() {
    const scoped = isKpwScoped();
    const self = scoped ? state.kpwSelfKey : "";
    const scopeName = escapeHtml(kpwScopeLabel());
    const replaceHint = can("canReplaceAllData")
      ? "Setelah data di kertas kerja diubah, unduh berkasnya lalu unggah di sini (Ganti seluruh data)."
      : hasFixedKpwScope()
        ? `Unggah Excel. Hanya data <b>${scopeName}</b> yang diperbarui; data KPwDN lain tidak berubah.`
        : "Pilih KPwDN pengampu Anda, lalu unggah Excel. Hanya baris kantor itu yang diperbarui; data KPwDN lain tidak berubah.";
    const picker =
      scoped && !hasFixedKpwScope()
        ? state.kpwSelfKey
          ? `<p class="capaian-import-self"><strong>KPwDN pengampu:</strong> ${scopeName}</p>`
          : `<label class="capaian-import-self">KPwDN pengampu saya
            <select id="db-import-self" required>${kpwOfficeOptionsHtml(self)}</select>
          </label>`
        : "";
    const dropDisabled = scoped && !hasFixedKpwScope() && !self;
    return `
      <div class="modal-back" data-close="1">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="kicker">Tambah dari berkas</div>
          <h2>Unggah Excel</h2>
          ${picker}
          <p class="import-note">
            Gunakan berkas <b>${TEMPLATE_XLSX_NAME}</b>, lembar <b>${SHEET_DATABASE_UMKM}</b>.
            ${replaceHint}
            Kolom yang dikenali: No, Asal KPw, ICK (fasilitas), Nama UMKM, Komoditas, Tahun Fasilitasi, dan ID Ref.
            Jumlah per ICK dihitung dari kolom ICK pada kertas kerja, termasuk sel yang tergabung (merge).
          </p>
          <div class="dropzone-box${dropDisabled ? " is-disabled" : ""}" id="excel-drop" tabindex="0"${dropDisabled ? ' aria-disabled="true"' : ""}>
            <b>${dropDisabled ? "Pilih KPwDN pengampu terlebih dahulu" : "Letakkan berkas Excel di sini"}</b>
            <p>${dropDisabled ? "Setelah dipilih, unggah Excel kantor Anda." : "atau klik untuk memilih dari komputer"}</p>
          </div>
          <div class="modal-actions">
            ${
              can("canDownloadTemplate")
                ? `<button type="button" class="btn btn-ghost" id="btn-template-modal">Unduh template</button>`
                : ""
            }
            <button type="button" class="btn btn-dark" data-close="1">Tutup</button>
          </div>
        </div>
      </div>`;
  }

  function importPreviewHtml(draft) {
    const preview = draft.rows.slice(0, 8);
    const canReplace = can("canReplaceAllData");
    const scoped = isKpwScoped();
    const ignored = Number(draft.ignoredOtherRows || 0);
    const note = canReplace
      ? "Satu nomor di kolom No kertas kerja = satu unit di BI PRAMESTI (bukan nama unik). Nama kosong atau \"-\" diisi dari baris atas jika sel Excel tergabung. Untuk Rekap All, pilih <b>Ganti seluruh data</b> agar jumlahnya sama dengan Excel."
      : `${draft.rows.length} baris untuk <b>${escapeHtml(state.kpwSelfKey || "KPwDN Anda")}</b> siap diterapkan.${ignored ? ` ${fmtNum(ignored)} baris KPwDN lain di berkas diabaikan.` : ""} Data KPwDN lain di BI PRAMESTI tidak berubah.`;
    const mergeLabel = scoped
      ? `Perbarui data saya (${fmtNum(draft.rows.length)})`
      : `Tambahkan ${fmtNum(draft.fresh.length)} yang belum ada`;
    return `
      <div class="modal-back" data-close="1">
        <div class="modal wide" role="dialog" aria-modal="true">
          <div class="kicker">Pratinjau unggahan</div>
          <h2>${escapeHtml(draft.filename || "Berkas Excel")}</h2>
          <p class="import-note">${note}</p>
          <div class="import-stats">
            <span>${fmtNum(draft.rows.length)} unit sesuai kertas kerja${scoped ? " (kantor Anda)" : ""}</span>
            <span>${fmtNum(draft.fresh.length)} belum ada di BI PRAMESTI</span>
            <span>${fmtNum((draft.matched || draft.duplicates || []).length)} sudah ada (akan diperbarui)</span>
            <span>${fmtNum(draft.skipped)} dilewati</span>
          </div>
          <div style="overflow:auto">
            <table class="data-table preview-table">
              <thead>
                <tr>
                  <th>Nama</th><th>Komoditas</th><th>Fasilitas</th><th>Tahun</th><th>KPwDN</th>
                </tr>
              </thead>
              <tbody>
                ${
                  preview.length
                    ? preview
                        .map(
                          (row) => `
                  <tr>
                    <td><span class="name">${escapeHtml(row.nama)}</span><span class="sub">${escapeHtml(row.jenis)}</span></td>
                    <td>${escapeHtml(row.komoditas || "—")}</td>
                    <td>${escapeHtml(row.fasilitas || "—")}</td>
                    <td>${escapeHtml(row.tahun)}</td>
                    <td>${escapeHtml(row.kpwdn || "—")}</td>
                  </tr>`
                        )
                        .join("")
                    : `<tr><td colspan="5" class="muted">Tidak ada baris yang dapat diimpor.</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-close="1">Batal</button>
            ${
              scoped
                ? `<button type="button" class="btn btn-primary" id="btn-import-merge" ${draft.rows.length ? "" : "disabled"}>${mergeLabel}</button>`
                : `<button type="button" class="btn ${canReplace ? "btn-ghost" : "btn-primary"}" id="btn-import-append" ${draft.fresh.length ? "" : "disabled"}>${mergeLabel}</button>`
            }
            ${
              canReplace
                ? `<button type="button" class="btn btn-primary" id="btn-import-replace" ${draft.rows.length ? "" : "disabled"}>Ganti seluruh data (${fmtNum(draft.rows.length)})</button>`
                : ""
            }
          </div>
        </div>
      </div>`;
  }

  function capaianImportDropHtml() {
    const scoped = isKpwScoped();
    const self = scoped ? state.kpwSelfKey : "";
    const scopeName = escapeHtml(kpwScopeLabel());
    const note = can("canReplaceAllData")
      ? `Gunakan berkas <b>${TEMPLATE_XLSX_NAME}</b>, lembar <b>${SHEET_CAPAIAN_ICK}</b>. Sel Target 2026 (Ind) yang kosong dihitung 0. Pilih <b>Ganti seluruh capaian ICK</b> agar isi sama dengan Excel, atau gabungkan tanpa menghapus kantor yang tidak ada di berkas.`
      : hasFixedKpwScope()
        ? `Gunakan berkas <b>${TEMPLATE_XLSX_NAME}</b>, lembar <b>${SHEET_CAPAIAN_ICK}</b>. Unggah Excel untuk memperbarui capaian <b>${scopeName}</b> saja; data KPwDN lain tidak berubah.`
        : `Gunakan berkas <b>${TEMPLATE_XLSX_NAME}</b>, lembar <b>${SHEET_CAPAIAN_ICK}</b>. Pilih KPwDN pengampu Anda, lalu unggah Excel. Hanya baris kantor itu yang diperbarui; data KPwDN lain tidak berubah.`;
    const picker =
      scoped && !hasFixedKpwScope()
        ? state.kpwSelfKey
          ? `<p class="capaian-import-self"><strong>KPwDN pengampu:</strong> ${scopeName}</p>`
          : `<label class="capaian-import-self">KPwDN pengampu saya
            <select id="capaian-import-self" required>${kpwOfficeOptionsHtml(self)}</select>
          </label>`
        : "";
    const dropDisabled = scoped && !hasFixedKpwScope() && !self;
    return `
      <div class="modal-back" data-close="1">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="kicker">Capaian ICK</div>
          <h2>Unggah Excel</h2>
          <p class="import-note">${note}</p>
          ${picker}
          <div class="dropzone-box${dropDisabled ? " is-disabled" : ""}" id="excel-drop-capaian" tabindex="0" ${dropDisabled ? 'aria-disabled="true"' : ""}>
            <b>Letakkan berkas Excel di sini</b>
            <p>${dropDisabled ? "Pilih KPwDN pengampu terlebih dahulu" : "atau klik untuk memilih dari komputer"}</p>
          </div>
          <div class="modal-actions">
            ${
              can("canDownloadTemplate")
                ? `<button type="button" class="btn btn-ghost" id="btn-template-capaian-modal">Unduh template</button>`
                : ""
            }
            <button type="button" class="btn btn-dark" data-close="1">Tutup</button>
          </div>
        </div>
      </div>`;
  }

  function capaianImportPreviewHtml(data) {
    const offices = data.offices || [];
    const fresh = data.fresh || [];
    const matched = data.matched || [];
    const preview = offices.slice(0, 8);
    const canReplace = can("canReplaceAllData");
    const ignored = Number(data.ignoredOtherOffices || 0);
    const note = canReplace
      ? `${offices.length} kantor terbaca dari ${escapeHtml(data.sheet || "lembar Acc/Ind")}. Sel Ind kosong sudah diubah menjadi 0. Pilih <b>Ganti seluruh capaian ICK</b> agar isi sama dengan Excel, atau gabungkan tanpa menghapus kantor yang tidak ada di berkas.`
      : `${offices.length} baris untuk <b>${escapeHtml(state.kpwSelfKey || "KPwDN Anda")}</b> siap diterapkan.${ignored ? ` ${fmtNum(ignored)} baris KPwDN lain di berkas diabaikan.` : ""} Data KPwDN lain di BI PRAMESTI tidak berubah.`;
    const mergeLabel = isKpwScoped()
      ? `Perbarui data saya (${fmtNum(offices.length)})`
      : `Tambahkan / perbarui ${fmtNum(offices.length)} kantor`;
    return `
      <div class="modal-back" data-close="1">
        <div class="modal wide" role="dialog" aria-modal="true">
          <div class="kicker">Pratinjau capaian ICK</div>
          <h2>${escapeHtml(data.source || "Berkas Excel")}</h2>
          <p class="import-note">${note}</p>
          <div class="import-stats">
            <span>${offices.length} KPwDN di berkas${isKpwScoped() ? " (kantor Anda)" : ""}</span>
            <span>${fmtNum(fresh.length)} belum ada</span>
            <span>${fmtNum(matched.length)} sudah ada (akan diperbarui)</span>
            <span>Target 2026 ${fmtAcc(offices.reduce((n, o) => n + Number(o.totalAcc || 0), 0))}</span>
          </div>
          <div style="overflow:auto">
            <table class="data-table preview-table">
              <thead>
                <tr>
                  <th>KPwDN</th><th>Wilayah</th><th>Target 2026</th><th>Ind</th><th>Realisasi</th>
                </tr>
              </thead>
              <tbody>
                ${
                  preview.length
                    ? preview
                        .map(
                          (office) => `
                  <tr>
                    <td>${escapeHtml(accOfficeLabel(office))}</td>
                    <td>${escapeHtml(office.wilayah || "—")}</td>
                    <td>${fmtAcc(office.totalAcc)}</td>
                    <td>${fmtAcc(office.totalInd)}</td>
                    <td>${fmtAcc(office.totalRealisasi)}</td>
                  </tr>`
                        )
                        .join("")
                    : `<tr><td colspan="5" class="muted">${isKpwScoped() ? "Tidak ada baris yang cocok dengan KPwDN pengampu Anda." : "Tidak ada baris kantor yang dapat diimpor."}</td></tr>`
                }
              </tbody>
            </table>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-close="1">Batal</button>
            <button type="button" class="btn ${canReplace ? "btn-ghost" : "btn-primary"}" id="btn-capaian-import-merge" ${offices.length ? "" : "disabled"}>${mergeLabel}</button>
            ${
              canReplace
                ? `<button type="button" class="btn btn-primary" id="btn-capaian-import-replace" ${offices.length ? "" : "disabled"}>Ganti seluruh capaian ICK (${offices.length})</button>`
                : ""
            }
          </div>
        </div>
      </div>`;
  }

  function capaianOfficeFormHtml(office) {
    const data = ickCapaian();
    const programs = data.programs || [];
    const scoped = isKpwScoped();
    const selfKey = String(state.kpwSelfKey || "").trim();
    const isEdit = Boolean(office && office.no);
    const row = office || {
      no: Math.max(0, ...((data.offices || []).map((item) => Number(item.no) || 0))) + 1,
      tier: "Tier C",
      wilayah: "Jawa",
      kpw: selfKey || "",
      kpwdn: selfKey || "",
      acc: {},
      ind: {},
      realisasi: {},
    };
    if (scoped && selfKey) {
      row.kpwdn = selfKey;
      if (!row.kpw) row.kpw = selfKey;
    }
    const wilayahOpts = ACC_WILAYAH.map(
      (item) =>
        `<option value="${escapeHtml(item.id)}" ${row.wilayah === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`
    ).join("");
    const lockAttr = scoped ? " readonly" : "";
    const nums = programs
      .map(
        (item) => `
        <tr>
          <td>${escapeHtml(item.code)}. ${escapeHtml(item.name)}</td>
          <td><input name="acc-${escapeHtml(item.id)}" type="number" min="0" step="1" value="${ickEmptyZero(row.acc?.[item.id])}"></td>
          <td><input name="ind-${escapeHtml(item.id)}" type="number" min="0" step="1" value="${ickEmptyZero(row.ind?.[item.id])}"></td>
          <td><input name="real-${escapeHtml(item.id)}" type="number" min="0" step="1" value="${ickEmptyZero(row.realisasi?.[item.id])}"></td>
        </tr>`
      )
      .join("");
    return `
      <div class="modal-back" data-close="1">
        <form class="modal wide" id="capaian-office-form">
          <div class="kicker">${isEdit ? "Ubah data" : "Tambah data"}</div>
          <h2>${isEdit || scoped ? escapeHtml(accOfficeLabel(row) || selfKey) : "KPwDN pengampu baru"}</h2>
          <p class="import-note">${
            scoped
              ? "Anda hanya dapat mengubah target dan realisasi ICK untuk KPwDN pengampu yang dipilih. Data KPwDN lain tidak terpengaruh."
              : "Kolom Target Ind yang dikosongkan disimpan sebagai 0, sesuai Tabel 2026 (Ind)."
          }</p>
          <div class="modal-grid">
            <label>Nomor
              <input name="no" type="number" min="1" required value="${escapeHtml(row.no)}"${scoped ? " readonly" : ""}>
            </label>
            <label>Tier
              <input name="tier" value="${escapeHtml(row.tier || "")}" placeholder="Tier C"${lockAttr}>
            </label>
            <label>Wilayah
              ${
                scoped
                  ? `<input type="text" value="${escapeHtml(row.wilayah === "Balinusra" ? "Bali Nusra" : row.wilayah || "")}" readonly>
              <input type="hidden" name="wilayah" value="${escapeHtml(row.wilayah || "Jawa")}">`
                  : `<select name="wilayah" required>${wilayahOpts}</select>`
              }
            </label>
            <label>Nama singkat KPw
              <input name="kpw" value="${escapeHtml(row.kpw || "")}" placeholder="Aceh"${lockAttr}>
            </label>
            <label class="full">KPwDN pengampu${scoped && !isEdit ? " saya" : ""}
              ${
                scoped
                  ? `<input name="kpwdn" id="capaian-form-self" required value="${escapeHtml(row.kpwdn || selfKey)}" readonly>`
                  : `<input name="kpwdn" required value="${escapeHtml(row.kpwdn || "")}" placeholder="Prov. Aceh">`
              }
            </label>
          </div>
          <div style="overflow:auto; margin-top: 12px">
            <table class="data-table preview-table capaian-form-table">
              <thead>
                <tr>
                  <th>Fasilitas ICK</th>
                  <th>Target 2026 Acc</th>
                  <th>Target 2026 Ind</th>
                  <th>Realisasi</th>
                </tr>
              </thead>
              <tbody>${nums}</tbody>
            </table>
          </div>
          <div class="modal-actions">
            ${isEdit && !scoped ? `<button type="button" class="btn btn-danger" id="btn-capaian-delete">Hapus</button>` : ""}
            <button type="button" class="btn btn-ghost" data-close="1">Batal</button>
            <button type="submit" class="btn btn-primary">${isEdit ? "Simpan" : "Tambah"}</button>
          </div>
        </form>
      </div>`;
  }

  function renderModal() {
    const root = document.getElementById("modal-root");
    if (!state.modal) {
      root.innerHTML = "";
      return;
    }

    if (
      (state.modal.type === "import" || state.modal.type === "capaian-import") &&
      !can("canUploadData")
    ) {
      state.modal = null;
      root.innerHTML = "";
      return;
    }
    if (
      (state.modal.type === "create" ||
        state.modal.type === "edit" ||
        state.modal.type === "capaian-create" ||
        state.modal.type === "capaian-edit") &&
      !can("canEdit")
    ) {
      state.modal = null;
      root.innerHTML = "";
      return;
    }

    if (state.modal.type === "capaian-import") {
      root.innerHTML = state.capaianDraft ? capaianImportPreviewHtml(state.capaianDraft) : capaianImportDropHtml();
      return;
    }

    if (state.modal.type === "capaian-office") {
      const office = capaianOfficeByNo(state.modal.no);
      const programs = ickCapaian().programs || [];
      if (!office) {
        root.innerHTML = "";
        return;
      }
      root.innerHTML = capaianOfficeModalHtml(office, programs);
      return;
    }

    if (state.modal.type === "capaian-create" || state.modal.type === "capaian-edit") {
      if (state.modal.type === "capaian-edit") {
        const target = capaianOfficeByNo(state.modal.no);
        if (target && isKpwScoped() && !officeIsKpwSelf(target)) {
          flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
          state.modal = null;
          root.innerHTML = "";
          return;
        }
      }
      if (state.modal.type === "capaian-create" && isKpwScoped() && !state.kpwSelfKey) {
        flash("Pilih KPwDN pengampu Anda terlebih dahulu.", true);
        state.modal = null;
        root.innerHTML = "";
        return;
      }
      const office =
        state.modal.type === "capaian-edit" ? capaianOfficeByNo(state.modal.no) : null;
      if (state.modal.type === "capaian-edit") captureCapaianEditBaseline(office);
      else state.capaianEditBaseline = null;
      root.innerHTML = capaianOfficeFormHtml(office);
      return;
    }

    if (state.modal.type === "import") {
      const draft = state.importDraft;
      root.innerHTML = draft
        ? importPreviewHtml(draft)
        : importDropHtml();
      return;
    }

    if (state.modal.type === "chart-list") {
      const field = state.modal.field;
      const value = state.modal.value;
      const others = state.modal.others;
      const sliceRows = chartSliceRows(field, value, others);
      const rows = chartListRows(state.modal);
      const extra = CHART_LIST_EXTRA[field] || [];
      const filters = chartExtraFilters(state.modal);
      const namaQ = String(state.modal.chartFilters?.nama || "").trim();
      const heading = others && others.length ? `${value} · ${CHART_TITLES[field]}` : value;
      const filteredNote = Boolean(namaQ) || (extra.length && extra.some((key) => filters[key]));
      const note = filteredNote
        ? `${fmtNum(rows.length)} dari ${fmtNum(sliceRows.length)} UMKM / PUS. Klik baris untuk membuka profil.`
        : `${fmtNum(rows.length)} UMKM / PUS. Klik baris untuk membuka profil.`;
      root.innerHTML = `
        <div class="modal-back" data-close="1">
          <div class="modal wide" role="dialog" aria-modal="true">
            <div class="kicker">Detail grafik · ${escapeHtml(CHART_TITLES[field] || field)}</div>
            <h2>${escapeHtml(heading)}</h2>
            ${chartListFilterHtml(state.modal, sliceRows)}
            <p class="import-note">${note}</p>
            <div style="overflow:auto; max-height: 52vh">
              <table class="data-table preview-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama UMKM / PUS</th>
                    <th>Komoditas</th>
                    <th>Fasilitas</th>
                    <th>Tahun</th>
                    <th>KPwDN pengampu</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    rows.length
                      ? rows
                          .map(
                            (row, i) => `
                    <tr data-chart-id="${escapeHtml(row.id)}">
                      <td>${i + 1}</td>
                      <td>
                        <span class="name">${escapeHtml(row.nama)}</span>
                        <span class="sub">${escapeHtml(row.jenis)} · ${escapeHtml(row.lokasi || "—")}</span>
                      </td>
                      <td>${escapeHtml(chartFieldLabel(row, "komoditas"))}</td>
                      <td>${escapeHtml(chartFieldLabel(row, "fasilitas"))}</td>
                      <td>${escapeHtml(chartFieldLabel(row, "tahun"))}</td>
                      <td>${escapeHtml(chartFieldLabel(row, "kpwdn"))}</td>
                    </tr>`
                          )
                          .join("")
                      : `<tr><td colspan="6" class="muted">Tidak ada UMKM pada saringan ini.</td></tr>`
                  }
                </tbody>
              </table>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-dark" data-close="1">Tutup</button>
            </div>
          </div>
        </div>`;
      return;
    }

    if (state.modal.type === "saran-edit") {
      const kind = state.modal.kind === "horizons" ? "horizons" : "priority";
      const idx = Number(state.modal.idx) || 0;
      const bundle = applySaranOverrides(resolveActionBundle(filtered()));
      const item = (bundle[kind] || [])[idx];
      if (!item) {
        root.innerHTML = "";
        return;
      }
      root.innerHTML = `
        <div class="modal-back" data-close="1">
          <form class="modal" id="saran-edit-form">
            <div class="kicker">${kind === "horizons" ? "Ubah jangka waktu" : "Ubah saran tindakan"}</div>
            <h2>${escapeHtml(kind === "horizons" ? item.label || "Jangka waktu" : `Saran ${idx + 1}`)}</h2>
            <div class="modal-grid">
              ${
                kind === "horizons"
                  ? `<label>Label
                <input name="label" required value="${escapeHtml(item.label || "")}">
              </label>
              <label>Jendela waktu
                <input name="window" required value="${escapeHtml(item.window || "")}">
              </label>`
                  : ""
              }
              <label class="full">Judul
                <input name="title" required value="${escapeHtml(item.title || "")}">
              </label>
              <label class="full">Isi saran
                <textarea name="text" rows="6" required>${escapeHtml(item.text || "")}</textarea>
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="btn-saran-reset">Kembalikan bawaan</button>
              <button type="button" class="btn btn-ghost" data-close="1">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>`;
      return;
    }

    if (state.modal.type === "detail") {
      const row = records.find((r) => r.id === state.modal.id);
      if (!row) {
        root.innerHTML = "";
        return;
      }
      root.innerHTML = `
        <div class="modal-back" data-close="1">
          <div class="modal" role="dialog" aria-modal="true">
            <div class="kicker">Profil UMKM / PUS</div>
            <h2>${escapeHtml(row.nama)}</h2>
            <p class="muted">${escapeHtml(row.jenis)} · ${escapeHtml(row.lokasi || "—")}</p>
            <dl class="detail-grid">
              <dt>Komoditas</dt><dd>${escapeHtml(row.komoditas)}</dd>
              <dt>Fasilitas</dt><dd>${escapeHtml(row.fasilitas)}</dd>
              <dt>Tahun</dt><dd>${escapeHtml(row.tahun)}</dd>
              <dt>KPwDN pengampu</dt><dd>${escapeHtml(row.kpwdn)}</dd>
              <dt>Keterangan</dt><dd>${escapeHtml(row.keterangan || "—")}</dd>
            </dl>
            <div class="modal-actions">
              ${
                state.modal.fromChart
                  ? `<button class="btn btn-ghost btn-sm" type="button" data-chart-back>Kembali ke daftar</button>`
                  : ""
              }
              ${
                can("canEdit") && recordIsKpwSelf(row)
                  ? `<button class="btn btn-ghost btn-sm" data-edit="${escapeHtml(row.id)}">Ubah</button>
              <button class="btn btn-danger btn-sm" data-delete="${escapeHtml(row.id)}">Hapus</button>`
                  : ""
              }
              <button class="btn btn-dark btn-sm" data-close="1">Tutup</button>
            </div>
          </div>
        </div>`;
      return;
    }

    if (state.modal.type === "edit") {
      const existing = records.find((r) => r.id === state.modal.id);
      if (existing && isKpwScoped() && !recordIsKpwSelf(existing)) {
        flash("Anda hanya dapat mengubah data UMKM/PUS KPwDN pengampu Anda.", true);
        state.modal = null;
        root.innerHTML = "";
        return;
      }
    }

    const row =
      state.modal.type === "edit"
        ? records.find((r) => r.id === state.modal.id)
        : {
            nama: "",
            jenis: "UMKM",
            komoditas: "",
            fasilitas: "",
            tahun: new Date().getFullYear(),
            kpwdn: isKpwScoped() ? state.kpwSelfKey : "",
            lokasi: "",
            status: "Aktif",
            keterangan: "",
          };
    if (!row) {
      root.innerHTML = "";
      return;
    }

    const datalist = (id, values) =>
      `<datalist id="${id}">${values.map((v) => `<option value="${escapeHtml(v)}"></option>`).join("")}</datalist>`;

    const scopedDb = isKpwScoped();
    const selfKey = String(state.kpwSelfKey || row.kpwdn || "").trim();

    root.innerHTML = `
      <div class="modal-back" data-close="1">
        <form class="modal" id="record-form">
          <div class="kicker">${state.modal.type === "edit" ? "Ubah data" : "Tambah data"}</div>
          <h2>${state.modal.type === "edit" ? escapeHtml(row.nama) : "UMKM / PUS baru"}</h2>
          <div class="modal-grid">
            <label class="full">Nama UMKM / PUS
              <input name="nama" required value="${escapeHtml(row.nama)}">
            </label>
            <label>Jenis
              <select name="jenis">
                <option value="UMKM" ${row.jenis === "UMKM" ? "selected" : ""}>UMKM</option>
                <option value="PUS" ${row.jenis === "PUS" ? "selected" : ""}>PUS — Pelaku Usaha Syariah</option>
              </select>
            </label>
            <label>Tahun
              <input name="tahun" type="number" min="2000" max="2100" required value="${escapeHtml(row.tahun)}">
            </label>
            <label>Komoditas
              <input name="komoditas" list="list-komoditas" required value="${escapeHtml(row.komoditas)}">
            </label>
            <label>Fasilitas
              <input name="fasilitas" list="list-fasilitas" required value="${escapeHtml(row.fasilitas)}">
            </label>
            <label class="full">KPwDN pengampu
              ${
                scopedDb
                  ? state.kpwSelfKey
                    ? `<input name="kpwdn" value="${escapeHtml(state.kpwSelfKey)}" readonly>`
                    : `<select name="kpwdn" id="db-form-self" required>${kpwOfficeOptionsHtml(row.kpwdn || selfKey)}</select>`
                  : `<input name="kpwdn" list="list-kpwdn" required value="${escapeHtml(row.kpwdn)}">`
              }
            </label>
            <label class="full">Keterangan
              <textarea name="keterangan" rows="3">${escapeHtml(row.keterangan || "")}</textarea>
            </label>
          </div>
          ${datalist("list-komoditas", unique("komoditas"))}
          ${datalist("list-fasilitas", unique("fasilitas"))}
          ${datalist("list-kpwdn", unique("kpwdn"))}
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-close="1">Batal</button>
            <button class="btn btn-primary" type="submit">Simpan</button>
          </div>
        </form>
      </div>`;
  }

  function readFiltersFromForm() {
    state.qNama = document.getElementById("filter-nama").value;
    state.jenis = readChecked("filter-jenis");
    state.komoditas = readChecked("filter-komoditas");
    state.fasilitas = readChecked("filter-fasilitas");
    state.tahun = readChecked("filter-tahun");
    state.kpwdn = readChecked("filter-kpwdn");
    state.page = 1;
    render();
  }

  function exportCsv() {
    const list = filtered();
    const header = [
      "No",
      "Nama UMKM/PUS",
      "Jenis",
      "Komoditas",
      "Fasilitas",
      "Tahun",
      "KPwDN pengampu",
      "Lokasi",
      "Status",
      "Keterangan",
    ];
    const rows = list.map((row, i) => [
      i + 1,
      row.nama,
      row.jenis,
      row.komoditas,
      row.fasilitas,
      row.tahun,
      row.kpwdn,
      row.lokasi || "",
      row.status || "",
      row.keterangan || "",
    ]);
    const csv = [header, ...rows]
      .map((cols) =>
        cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "database-ekonomi-lokal.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadChartsPdf() {
    const source = document.getElementById("charts-export");
    if (!source) return;
    if (!window.html2canvas || !window.jspdf) {
      flash("Pustaka PDF belum termuat. Periksa koneksi, lalu muat ulang halaman.", true);
      return;
    }
    const btn = document.getElementById("btn-pdf");
    if (btn) btn.disabled = true;
    flash("Menyiapkan PDF grafik…");
    const clone = source.cloneNode(true);
    const pdfBtn = clone.querySelector("#btn-pdf");
    if (pdfBtn) pdfBtn.remove();
    clone.querySelectorAll(".pie-legend").forEach((el) => {
      el.style.maxHeight = "none";
      el.style.height = "auto";
      el.style.overflow = "visible";
    });
    clone.style.position = "fixed";
    clone.style.left = "-12000px";
    clone.style.top = "0";
    clone.style.width = `${Math.max(source.offsetWidth, 980)}px`;
    clone.style.background = "#ffffff";
    clone.style.padding = "16px";
    document.body.appendChild(clone);
    try {
      const canvas = await window.html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const JsPDF = window.jspdf.jsPDF;
      const pdf = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("BI PRAMESTI — Grafik sebaran UMKM / PUS", margin, 12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        `Platform UMKM & Usaha Syariah Berdaya Saing · ${new Date().toLocaleDateString("id-ID")}`,
        margin,
        18
      );
      const maxW = pageW - margin * 2;
      const maxH = pageH - 26;
      let drawW = maxW;
      let drawH = (canvas.height * drawW) / canvas.width;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = (canvas.width * drawH) / canvas.height;
      }
      pdf.addImage(img, "PNG", margin, 22, drawW, drawH);
      pdf.save("bi-pramesti-grafik-sebaran.pdf");
      flash("PDF grafik berhasil diunduh.");
    } catch (err) {
      flash(err.message || "Gagal membuat PDF grafik.", true);
    } finally {
      clone.remove();
      if (btn) btn.disabled = false;
    }
  }

  async function downloadLembarPdf() {
    const source = document.getElementById("lembar-rapat");
    if (!source) return;
    if (!window.html2canvas || !window.jspdf) {
      flash("Pustaka PDF belum termuat. Periksa koneksi, lalu muat ulang halaman.", true);
      return;
    }
    const btn = document.getElementById("btn-lembar-pdf");
    if (btn) btn.disabled = true;
    flash("Menyiapkan PDF lembar rapat…");
    const clone = source.cloneNode(true);
    clone.querySelectorAll("button").forEach((el) => el.remove());
    clone.style.position = "fixed";
    clone.style.left = "-12000px";
    clone.style.top = "0";
    clone.style.width = "900px";
    clone.style.background = "#001e4c";
    clone.style.padding = "0";
    document.body.appendChild(clone);
    try {
      const canvas = await window.html2canvas(clone, {
        scale: 2,
        backgroundColor: "#001e4c",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const JsPDF = window.jspdf.jsPDF;
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text("BI PRAMESTI — Lembar rapat pimpinan", margin, 12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        `Departemen Regional, Bank Indonesia · ${new Date().toLocaleDateString("id-ID")}`,
        margin,
        18
      );
      const maxW = pageW - margin * 2;
      const maxH = pageH - 26;
      let drawW = maxW;
      let drawH = (canvas.height * drawW) / canvas.width;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = (canvas.width * drawH) / canvas.height;
      }
      pdf.addImage(img, "PNG", margin, 22, drawW, drawH);
      pdf.save("bi-pramesti-lembar-rapat.pdf");
      flash("PDF lembar rapat berhasil diunduh.");
    } catch (err) {
      flash(err.message || "Gagal membuat PDF lembar rapat.", true);
    } finally {
      clone.remove();
      if (btn) btn.disabled = false;
    }
  }

  function hexRgb(hex) {
    const h = String(hex || "").replace("#", "");
    return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
  }

  function pdfSafeText(value) {
    return String(value ?? "")
      .replace(/\u2192/g, " -> ")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2022/g, "-")
      .replace(/\u00b7/g, " | ")
      .replace(/[\u201c\u201d\u2018\u2019]/g, "'")
      .replace(/\u00a0/g, " ")
      .replace(/[\u2000-\u200b]/g, " ")
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pdfFit(pdf, text, maxW) {
    let t = pdfSafeText(text);
    if (pdf.getTextWidth(t) <= maxW) return t;
    while (t.length > 2 && pdf.getTextWidth(`${t}...`) > maxW) t = t.slice(0, -1);
    return `${t}...`;
  }

  function downloadCapaianPdf() {
    if (!window.jspdf) {
      flash("Pustaka PDF belum termuat. Periksa koneksi, lalu muat ulang halaman.", true);
      return;
    }
    const btn = document.getElementById("btn-capaian-pdf");
    if (btn) btn.disabled = true;
    try {
      const data = ickCapaian();
      const programs = data.programs || [];
      const qFold = state.capaianQ.trim().toLowerCase();
      const offices = (data.offices || []).filter((office) => {
        if (state.capaianWilayah && office.wilayah !== state.capaianWilayah) return false;
        if (!qFold) return true;
        const hay = `${office.kpw} ${office.kpwdn} ${accOfficeLabel(office)} ${office.tier}`.toLowerCase();
        return hay.includes(qFold);
      });
      if (!programs.length) {
        flash("Tidak ada data capaian ICK untuk diunduh.", true);
        return;
      }

      const JsPDF = window.jspdf.jsPDF;
      const pdf = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const navy = hexRgb("#001e4c");
      const navy2 = hexRgb("#003a73");
      const gold = hexRgb("#c4a35a");
      const ink = hexRgb("#1b1b1b");
      const muted = hexRgb("#5a6570");
      const line = hexRgb("#c5d2e0");
      const paper = hexRgb("#f4f7fb");
      const white = [255, 255, 255];
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const m = 12;
      const dated = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const cakupan = state.capaianWilayah
        ? ACC_WILAYAH.find((row) => row.id === state.capaianWilayah)?.name || state.capaianWilayah
        : "Nasional";
      const cakupanNote = state.capaianQ.trim()
        ? `${cakupan} · saringan "${state.capaianQ.trim()}"`
        : cakupan;
      const shortHead = {
        digital: "Digital",
        ekspor: "Ekspor",
        hijau: "Hijau",
        produktivitas: "Prod.",
        bisaid: "BISAID",
        pembiayaan: "Biaya",
        subsisten: "Subst.",
        ikra: "IKRA",
      };
      const sumTarget = offices.reduce((n, office) => n + Number(office.totalAcc || 0), 0);
      const sumReal = offices.reduce((n, office) => n + Number(office.totalRealisasi || 0), 0);
      const sumPct = capaianPct(sumReal, sumTarget);
      const focus =
        state.modal?.type === "capaian-office" ? capaianOfficeByNo(state.modal.no) : null;

      const drawBand = (kicker, title) => {
        pdf.setFillColor(...navy);
        pdf.rect(0, 0, pageW, 24, "F");
        pdf.setFillColor(...gold);
        pdf.rect(0, 24, pageW, 1.1, "F");
        pdf.setTextColor(199, 163, 90);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("BI PRAMESTI", m, 8);
        pdf.setTextColor(...white);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text("Departemen Regional, Bank Indonesia", m + 26, 8);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(title, m, 16.5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(158, 196, 234);
        pdf.text(kicker, m, 21.5);
        pdf.setTextColor(158, 196, 234);
        pdf.text(dated, pageW - m, 8, { align: "right" });
      };

      const stampPages = () => {
        const total = pdf.getNumberOfPages();
        for (let i = 1; i <= total; i += 1) {
          pdf.setPage(i);
          pdf.setDrawColor(...line);
          pdf.setLineWidth(0.25);
          pdf.line(m, pageH - 8, pageW - m, pageH - 8);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(...muted);
          pdf.text(`Halaman ${i} dari ${total}`, pageW - m, pageH - 4.6, { align: "right" });
        }
      };

      const pctColor = (pct) => {
        if (pct == null) return muted;
        if (pct >= 100) return hexRgb("#1b6b43");
        if (pct >= 70) return hexRgb("#8a6d2c");
        return hexRgb("#9b2c23");
      };

      const drawBar = (x, y, w, pct) => {
        pdf.setFillColor(...line);
        pdf.rect(x, y, w, 2.4, "F");
        const width = Math.max(0, Math.min(w, (Number(pct || 0) / 100) * w));
        if (!width) return;
        pdf.setFillColor(...pctColor(pct));
        pdf.rect(x, y, width, 2.4, "F");
      };

      drawBand(`Cakupan ${cakupanNote}  ·  Target 2026 (Acc) Revised`, "Capaian ICK per KPwDN pengampu");

      const boxW = (pageW - m * 2 - 12) / 4;
      const kpis = [
        [fmtAcc(sumTarget), "Target 2026"],
        [fmtAcc(sumReal), "Realisasi per Juni"],
        [fmtPct(sumPct), "Keberhasilan vs target"],
        [fmtAcc(offices.length), "Kantor pengampu"],
      ];
      kpis.forEach((item, i) => {
        const x = m + i * (boxW + 4);
        pdf.setFillColor(...(i % 2 ? navy2 : navy));
        pdf.rect(x, 30, boxW, 18, "F");
        pdf.setTextColor(...gold);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(String(item[0]), x + 5, 41);
        pdf.setTextColor(...white);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(String(item[1]).toUpperCase(), x + 5, 45.5);
      });

      pdf.setTextColor(...navy);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Ringkasan delapan fasilitas ICK", m, 56);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text("Capaian = realisasi kertas kerja dibagi target Acc / Acc Revised. Sel Ind kosong dihitung 0.", m, 61);

      const col = [m, m + 10, m + 78, m + 108, m + 138, m + 162];
      const headY = 66;
      pdf.setFillColor(...navy);
      pdf.rect(m, headY, pageW - m * 2, 8, "F");
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      ["", "Fasilitas ICK", "Target 2026", "Realisasi", "Capaian", "Progres"].forEach((label, i) => {
        pdf.text(label, col[i] + (i >= 2 && i <= 4 ? 22 : 0), headY + 5.3, i >= 2 && i <= 4 ? { align: "right" } : undefined);
      });

      programs.forEach((item, i) => {
        const y = 74 + i * 9.2;
        if (i % 2) {
          pdf.setFillColor(...paper);
          pdf.rect(m, y, pageW - m * 2, 9.2, "F");
        }
        const target = offices.reduce((n, office) => n + officeTarget(office, item.id), 0);
        const real = offices.reduce((n, office) => n + officeRealisasi(office, item.id), 0);
        const pct = capaianPct(real, target);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(...gold);
        pdf.text(String(item.code).toUpperCase(), col[0], y + 5.8);
        pdf.setTextColor(...ink);
        pdf.setFont("helvetica", "bold");
        pdf.text(pdfFit(pdf, item.name, 64), col[1], y + 5.8);
        pdf.setFont("helvetica", "normal");
        pdf.text(fmtAcc(target), col[2] + 22, y + 5.8, { align: "right" });
        pdf.text(fmtAcc(real), col[3] + 22, y + 5.8, { align: "right" });
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...pctColor(pct));
        pdf.text(fmtPct(pct), col[4] + 22, y + 5.8, { align: "right" });
        drawBar(col[5], y + 3.4, pageW - m - col[5], pct);
      });

      const drawOfficeMatrix = (startY, startIndex) => {
        const heads = ["No", "KPwDN pengampu", "Wilayah", ...programs.map((item) => shortHead[item.id] || item.id), "Target 2026", "Capaian"];
        const widths = [10, 46, 24, ...programs.map(() => 17), 24, 18];
        const tableW = widths.reduce((n, w) => n + w, 0);
        const x0 = Math.max(m, (pageW - tableW) / 2);
        const rowH = 6.4;
        const drawHeads = (y) => {
          pdf.setFillColor(...navy);
          pdf.rect(x0, y, tableW, 8, "F");
          pdf.setTextColor(...white);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          let x = x0;
          heads.forEach((label, i) => {
            const alignRight = i >= 3;
            pdf.text(label, alignRight ? x + widths[i] - 1.5 : x + 1.4, y + 5.2, alignRight ? { align: "right" } : undefined);
            x += widths[i];
          });
        };
        drawHeads(startY);
        let y = startY + 8;
        let index = startIndex;
        const drawTotals = () => {
          pdf.setFillColor(...navy);
          pdf.rect(x0, y, tableW, rowH, "F");
          pdf.setTextColor(...white);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          let x = x0;
          const foot = [
            "",
            `Jumlah ${offices.length} kantor`,
            "",
            ...programs.map((item) => fmtAcc(offices.reduce((n, office) => n + officeTarget(office, item.id), 0))),
            fmtAcc(sumTarget),
            fmtPct(sumPct),
          ];
          foot.forEach((val, i) => {
            const alignRight = i >= 3;
            pdf.text(String(val), alignRight ? x + widths[i] - 1.5 : x + 1.4, y + 4.3, alignRight ? { align: "right" } : undefined);
            x += widths[i];
          });
        };
        if (index >= offices.length) {
          drawTotals();
          return { next: offices.length, totals: true };
        }
        while (index < offices.length) {
          if (y + rowH > pageH - 12) break;
          const office = offices[index];
          if (index % 2) {
            pdf.setFillColor(...paper);
            pdf.rect(x0, y, tableW, rowH, "F");
          }
          const t = Number(office.totalAcc || 0);
          const r = Number(office.totalRealisasi || 0);
          const pct = capaianPct(r, t);
          const wilayah = office.wilayah === "Balinusra" ? "Bali Nusra" : office.wilayah || "";
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          const vals = [
            String(office.no || index + 1),
            pdfFit(pdf, accOfficeLabel(office), widths[1] - 3),
            pdfFit(pdf, wilayah, widths[2] - 3),
            ...programs.map((item) => fmtAcc(officeTarget(office, item.id))),
            fmtAcc(t),
            fmtPct(pct),
          ];
          let x = x0;
          vals.forEach((val, i) => {
            const alignRight = i >= 3;
            if (i === vals.length - 1) pdf.setTextColor(...pctColor(pct));
            else pdf.setTextColor(...ink);
            pdf.setFont("helvetica", i <= 1 ? "bold" : "normal");
            pdf.setFontSize(7);
            pdf.text(String(val), alignRight ? x + widths[i] - 1.5 : x + 1.4, y + 4.3, alignRight ? { align: "right" } : undefined);
            x += widths[i];
          });
          y += rowH;
          index += 1;
        }
        if (index >= offices.length) {
          if (y + rowH > pageH - 12) return { next: index, totals: false };
          drawTotals();
          return { next: offices.length, totals: true };
        }
        return { next: index, totals: false };
      };

      if (focus) {
        pdf.addPage();
        const name = accOfficeLabel(focus);
        drawBand(`${focus.tier || ""}  ·  ${focus.wilayah === "Balinusra" ? "Bali Nusra" : focus.wilayah || ""}`, `Rincian ${name}`);
        const t = Number(focus.totalAcc || 0);
        const r = Number(focus.totalRealisasi || 0);
        const p = capaianPct(r, t);
        const officeKpis = [
          [fmtAcc(t), "Target 2026"],
          [fmtAcc(r), "Realisasi per Juni"],
          [fmtPct(p), "Keberhasilan vs target"],
          [fmtAcc(focus.totalInd || 0), "Target 2026 Ind"],
        ];
        officeKpis.forEach((item, i) => {
          const x = m + i * (boxW + 4);
          pdf.setFillColor(...(i % 2 ? navy2 : navy));
          pdf.rect(x, 30, boxW, 18, "F");
          pdf.setTextColor(...gold);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.text(String(item[0]), x + 5, 41);
          pdf.setTextColor(...white);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.text(String(item[1]).toUpperCase(), x + 5, 45.5);
        });
        pdf.setFillColor(...navy);
        pdf.rect(m, 54, pageW - m * 2, 8, "F");
        pdf.setTextColor(...white);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        const fcol = [m + 2, m + 86, m + 122, m + 152, m + 180, m + 204];
        ["Fasilitas ICK", "Target 2026 Acc", "Target 2026 Ind", "Realisasi", "Capaian", "Progres"].forEach((label, i) => {
          pdf.text(label, fcol[i] + (i >= 1 && i <= 4 ? 22 : 0), 59.2, i >= 1 && i <= 4 ? { align: "right" } : undefined);
        });
        programs.forEach((item, i) => {
          const y = 62 + i * 10;
          if (i % 2) {
            pdf.setFillColor(...paper);
            pdf.rect(m, y, pageW - m * 2, 10, "F");
          }
          const target = officeTarget(focus, item.id);
          const ind = ickEmptyZero(focus.ind?.[item.id]);
          const real = officeRealisasi(focus, item.id);
          const pct = capaianPct(real, target);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.setTextColor(...ink);
          pdf.text(`${item.code}. ${pdfFit(pdf, item.name, 70)}`, fcol[0], y + 6.2);
          pdf.setFont("helvetica", "normal");
          pdf.text(fmtAcc(target), fcol[1] + 22, y + 6.2, { align: "right" });
          pdf.text(fmtAcc(ind), fcol[2] + 22, y + 6.2, { align: "right" });
          pdf.text(fmtAcc(real), fcol[3] + 22, y + 6.2, { align: "right" });
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...pctColor(pct));
          pdf.text(fmtPct(pct), fcol[4] + 22, y + 6.2, { align: "right" });
          drawBar(fcol[5], y + 3.8, pageW - m - fcol[5], pct);
        });
      }

      pdf.addPage();
      drawBand(`Cakupan ${cakupanNote}  ·  ${offices.length} kantor`, "Matriks target dan capaian per KPwDN");
      let result = drawOfficeMatrix(30, 0);
      while (result.next < offices.length || !result.totals) {
        pdf.addPage();
        drawBand(`Cakupan ${cakupanNote}  ·  lanjutan`, "Matriks target dan capaian per KPwDN");
        result = drawOfficeMatrix(30, result.next);
      }

      stampPages();
      pdf.save("bi-pramesti-capaian-ick.pdf");
      flash("PDF capaian ICK siap dipakai untuk rapat.");
    } catch (err) {
      flash(err.message || "Gagal membuat PDF capaian ICK.", true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function copyText(payload, ok, fail) {
    if (!payload) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(payload).then(
        () => flash(ok),
        () => flash(fail, true)
      );
    } else {
      flash("Salin manual dari layar.", true);
    }
  }

  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    readFiltersFromForm();
  });
  document.getElementById("filter-form").addEventListener("input", (e) => {
    const q = e.target.closest(".filter-opt-q");
    if (!q) return;
    const listId = q.getAttribute("data-filter-list");
    const box = document.getElementById(listId);
    if (!box) return;
    const needle = q.value.trim().toLowerCase();
    box.querySelectorAll(".check-opt, .filter-group").forEach((el) => {
      if (el.classList.contains("filter-group")) {
        el.hidden = false;
        return;
      }
      const label = (el.textContent || "").toLowerCase();
      el.hidden = Boolean(needle) && !label.includes(needle);
    });
  });
  document.getElementById("btn-reset").addEventListener("click", () => {
    state.qNama = "";
    state.jenis = [];
    state.komoditas = [];
    state.fasilitas = [];
    state.tahun = [];
    state.kpwdn = [];
    state.wilayah = "";
    state.page = 1;
    document.querySelectorAll(".filter-opt-q").forEach((el) => {
      el.value = "";
    });
    render();
  });
  document.getElementById("btn-export")?.addEventListener("click", exportCsv);
  document.getElementById("btn-pdf").addEventListener("click", downloadChartsPdf);
  document.getElementById("btn-template")?.addEventListener("click", downloadDbTemplate);
  document.getElementById("btn-template-db")?.addEventListener("click", downloadDbTemplate);
  document.getElementById("btn-template-capaian")?.addEventListener("click", downloadCapaianTemplate);
  document.getElementById("btn-template-db-upload")?.addEventListener("click", () => {
    if (!can("canUploadTemplate")) {
      flash("Hanya Administrator yang dapat mengunggah template.", true);
      return;
    }
    const input = document.getElementById("template-input-db");
    if (!input) return;
    input.value = "";
    input.click();
  });
  document.getElementById("btn-template-capaian-upload")?.addEventListener("click", () => {
    if (!can("canUploadTemplate")) {
      flash("Hanya Administrator yang dapat mengunggah template.", true);
      return;
    }
    const input = document.getElementById("template-input-capaian");
    if (!input) return;
    input.value = "";
    input.click();
  });
  document.getElementById("btn-add").addEventListener("click", () => {
    if (!can("canEdit")) {
      flash("Akun ini hanya dapat melihat data.", true);
      return;
    }
    if (isKpwScoped() && !requireKpwSelf("kpw-self-pick")) return;
    state.modal = { type: "create" };
    renderModal();
  });
  document.getElementById("btn-upload").addEventListener("click", () => {
    if (!can("canUploadData")) {
      flash("Akun ini tidak dapat mengunggah data.", true);
      return;
    }
    state.importDraft = null;
    state.modal = { type: "import" };
    renderModal();
  });
  document.getElementById("btn-capaian-upload").addEventListener("click", () => {
    if (!can("canUploadData")) {
      flash("Akun ini tidak dapat mengunggah data.", true);
      return;
    }
    state.capaianDraft = null;
    state.modal = { type: "capaian-import" };
    renderModal();
  });
  document.getElementById("btn-capaian-pdf").addEventListener("click", () => {
    downloadCapaianPdf();
  });
  document.getElementById("btn-history-pdf")?.addEventListener("click", () => {
    downloadHistoryPdf();
  });
  document.getElementById("btn-history-clear")?.addEventListener("click", () => {
    clearAuditHistory();
  });
  const historyView = document.getElementById("view-history");
  if (historyView) {
    historyView.addEventListener("click", (e) => {
      const btn = e.target.closest(".history-delete");
      if (!btn) return;
      const id = btn.getAttribute("data-history-id");
      if (id) deleteAuditEntry(id);
    });
    historyView.addEventListener("input", (e) => {
      if (e.target.id === "history-q") {
        state.historyQ = e.target.value;
        renderHistory();
      }
    });
    historyView.addEventListener("change", (e) => {
      if (e.target.id === "history-module") {
        state.historyModule = e.target.value;
        renderHistory();
      }
    });
  }
  document.getElementById("btn-capaian-add").addEventListener("click", () => {
    if (!can("canEdit")) {
      flash("Akun ini hanya dapat melihat data.", true);
      return;
    }
    if (isKpwScoped()) {
      if (!requireKpwSelf("kpw-self-pick")) return;
      const mine = kpwSelfOffice();
      if (mine) {
        state.modal = { type: "capaian-edit", no: mine.no };
      } else {
        state.modal = { type: "capaian-create" };
      }
      renderModal();
      return;
    }
    state.modal = { type: "capaian-create" };
    renderModal();
  });

  const excelInput = document.getElementById("excel-input");
  const excelInputCapaian = document.getElementById("excel-input-capaian");
  const templateInputDb = document.getElementById("template-input-db");
  const templateInputCapaian = document.getElementById("template-input-capaian");

  function openExcelPicker() {
    excelInput.value = "";
    excelInput.click();
  }

  function openCapaianExcelPicker() {
    excelInputCapaian.value = "";
    excelInputCapaian.click();
  }

  async function ingestExcelFile(file) {
    if (!can("canUploadData")) {
      flash("Akun ini tidak dapat mengunggah data.", true);
      return;
    }
    if (isKpwScoped() && !requireKpwSelf("db-import-self")) return;
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!/\.(xlsx|xls|csv)$/.test(name)) {
      flash("Unggah berkas .xlsx, .xls, atau .csv.", true);
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const parsed = decorateImport(parseSpreadsheet(file, buffer));
      state.importDraft = parsed;
      state.modal = { type: "import" };
      renderModal();
      if (!parsed.rows.length) {
        flash("Tidak ada baris valid. Pastikan ada kolom Nama UMKM/PUS.", true);
      }
    } catch (err) {
      flash(err.message || "Berkas Excel tidak dapat dibaca.", true);
    }
  }

  async function ingestCapaianExcelFile(file) {
    if (!can("canUploadData")) {
      flash("Akun ini tidak dapat mengunggah data.", true);
      return;
    }
    if (!requireKpwSelf()) return;
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!/\.(xlsx|xls|csv)$/.test(name)) {
      flash("Unggah berkas .xlsx, .xls, atau .csv.", true);
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const parsed = decorateCapaianImport(parseCapaianSpreadsheet(file, buffer));
      state.capaianDraft = parsed;
      state.modal = { type: "capaian-import" };
      renderModal();
      if (!parsed.offices.length) {
        flash(
          isKpwScoped()
            ? `Tidak ada baris yang cocok dengan KPwDN pengampu "${state.kpwSelfKey}".`
            : "Tidak ada baris KPwDN pada Tabel 2026 (Acc)/(Ind).",
          true
        );
      }
    } catch (err) {
      flash(err.message || "Berkas capaian ICK tidak dapat dibaca.", true);
    }
  }

  excelInput.addEventListener("change", () => {
    const file = excelInput.files && excelInput.files[0];
    ingestExcelFile(file);
  });
  excelInputCapaian.addEventListener("change", () => {
    const file = excelInputCapaian.files && excelInputCapaian.files[0];
    ingestCapaianExcelFile(file);
  });
  templateInputDb?.addEventListener("change", () => {
    const file = templateInputDb.files && templateInputDb.files[0];
    ingestTemplateFile(file, TEMPLATE_DB_KEY, "Database UMKM/PUS");
  });
  templateInputCapaian?.addEventListener("change", () => {
    const file = templateInputCapaian.files && templateInputCapaian.files[0];
    ingestTemplateFile(file, TEMPLATE_CAPAIAN_KEY, "Capaian ICK");
  });

  document.getElementById("table-body").addEventListener("click", (e) => {
    const edit = e.target.closest("[data-edit]");
    if (edit) {
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const row = records.find((r) => r.id === edit.getAttribute("data-edit"));
      if (row && isKpwScoped() && !recordIsKpwSelf(row)) {
        flash("Anda hanya dapat mengubah data UMKM/PUS KPwDN pengampu Anda.", true);
        return;
      }
      state.modal = { type: "edit", id: edit.getAttribute("data-edit") };
      renderModal();
      return;
    }
    const del = e.target.closest("[data-delete]");
    if (del) {
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const id = del.getAttribute("data-delete");
      const row = records.find((r) => r.id === id);
      if (row && isKpwScoped() && !recordIsKpwSelf(row)) {
        flash("Anda hanya dapat menghapus data UMKM/PUS KPwDN pengampu Anda.", true);
        return;
      }
      if (!row || !confirm(`Hapus ${row.nama}?`)) return;
      persistRecords(records.filter((r) => r.id !== id)).then((ok) => {
        if (!ok) return;
        watchIds = watchIds.filter((item) => item !== String(id));
        saveWatch();
        render();
        flash("Data dihapus.");
      });
    }
  });

  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-sort");
      if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      state.page = 1;
      render();
    });
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    state.page -= 1;
    render();
  });
  document.getElementById("next-page").addEventListener("click", () => {
    state.page += 1;
    render();
  });
  document.getElementById("pager-pages").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn) return;
    state.page = Number(btn.getAttribute("data-page"));
    render();
  });

  document.getElementById("pantau").addEventListener("click", (e) => {
    if (e.target.closest("#btn-copy-brief")) {
      const leadEl = document.querySelector("#briefing-text .briefing-lead");
      const leadText = leadEl
        ? [...leadEl.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean).join("\n\n")
        : "";
      const brief = [...document.querySelectorAll("#briefing-text .briefing-block")]
        .map((block) => {
          const title = block.querySelector(".briefing-section-title, .briefing-head")?.textContent.trim() || "";
          const paras = [...block.querySelectorAll(":scope > .briefing-para")].map((p) => p.textContent.trim());
          const subs = [...block.querySelectorAll(".briefing-subhead")].map((sub) => {
            const lines = [sub.textContent.trim()];
            let node = sub.nextElementSibling;
            while (node && !node.classList.contains("briefing-subhead") && !node.classList.contains("briefing-section-title")) {
              if (node.classList.contains("briefing-para")) lines.push(node.textContent.trim());
              if (node.classList.contains("briefing-points")) {
                lines.push(...[...node.querySelectorAll("li")].map((li) => `• ${li.textContent.trim()}`));
              }
              node = node.nextElementSibling;
            }
            return lines.filter(Boolean).join("\n");
          });
          return [title, ...paras, ...subs].filter(Boolean).join("\n");
        })
        .filter(Boolean);
      const briefText = [leadText, ...brief].filter(Boolean).join("\n\n");
      const steps = [...document.querySelectorAll("#saran-list .saran-card")].map((card, i) => {
        const title = card.querySelector("strong")?.textContent || "";
        const text = card.querySelector(".saran-text")?.textContent || "";
        return `${i + 1}. ${title}: ${text}`;
      });
      const horizons = [...document.querySelectorAll("#saran-horizon-list .saran-card")].map((card) => {
        const label = card.querySelector(".saran-horizon")?.textContent || "";
        const title = card.querySelector("strong")?.textContent || "";
        const text = card.querySelector(".saran-text")?.textContent || "";
        return `${label} — ${title}: ${text}`;
      });
      const payload = [
        briefText,
        steps.length ? `Saran tindakan:\n${steps.join("\n")}` : "",
        horizons.length ? `Jangka waktu:\n${horizons.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      if (!payload) return;
      copyText(payload, "Briefing dan saran tindakan disalin.", "Tidak dapat menyalin briefing.");
      return;
    }
    if (e.target.closest("#btn-copy-lembar")) {
      copyText(lembarPlainText(filtered()), "Lembar rapat disalin.", "Tidak dapat menyalin lembar rapat.");
      return;
    }
    if (e.target.closest("#btn-lembar-pdf")) {
      downloadLembarPdf();
      return;
    }
    const kpwRow = e.target.closest("[data-kpw-filter]");
    if (kpwRow) {
      state.kpwdn = [kpwRow.getAttribute("data-kpw-filter")];
      state.page = 1;
      setView("database");
      return;
    }
    const yearBtn = e.target.closest("[data-tahun-filter]");
    if (yearBtn) {
      state.tahun = [yearBtn.getAttribute("data-tahun-filter")];
      state.page = 1;
      setView("database");
      return;
    }
    if (e.target.closest("#btn-rapat")) {
      state.rapat = !state.rapat;
      render();
      return;
    }
    if (e.target.closest("#btn-clear-wilayah")) {
      state.wilayah = "";
      state.page = 1;
      render();
      return;
    }
    const pin = e.target.closest("[data-watch]");
    if (pin) {
      e.stopPropagation();
      const id = pin.getAttribute("data-watch");
      toggleWatch(id);
      renderPantau(filtered());
      flash(isWatched(id) ? "Masuk antrian kunjungan." : "Dilepas dari antrian kunjungan.");
      return;
    }
    const pulau = e.target.closest("[data-wilayah]");
    if (pulau) {
      const id = pulau.getAttribute("data-wilayah");
      state.wilayah = state.wilayah === id ? "" : id;
      state.page = 1;
      render();
      return;
    }
    const card = e.target.closest("[data-story-id]");
    if (card) {
      state.modal = { type: "detail", id: card.getAttribute("data-story-id") };
      renderModal();
    }
  });

  document.getElementById("charts").addEventListener("click", (e) => {
    const item = e.target.closest("[data-chart-field]");
    if (!item) return;
    let others = null;
    const rawOthers = item.getAttribute("data-chart-others");
    if (rawOthers) {
      try {
        others = JSON.parse(rawOthers);
      } catch (_) {
        others = null;
      }
    }
    state.modal = {
      type: "chart-list",
      field: item.getAttribute("data-chart-field"),
      value: item.getAttribute("data-chart-value"),
      others,
      chartFilters: {},
    };
    renderModal();
  });

  document.getElementById("modal-root").addEventListener("change", (e) => {
    if (
      e.target.id === "db-import-self" ||
      e.target.id === "db-form-self" ||
      e.target.id === "capaian-import-self"
    ) {
      handleKpwSelfPick(e.target, () => {
        if (e.target.id === "db-import-self" && state.modal?.type === "import" && !state.importDraft) {
          renderModal();
        }
        if (e.target.id === "capaian-import-self" && state.modal?.type === "capaian-import" && !state.capaianDraft) {
          renderModal();
        }
      });
      return;
    }
    const pick = e.target.closest("[data-chart-list-filter]");
    if (!pick || state.modal?.type !== "chart-list") return;
    if (pick.tagName === "INPUT") return;
    const key = pick.getAttribute("data-chart-list-filter");
    state.modal = {
      ...state.modal,
      chartFilters: { ...(state.modal.chartFilters || {}), [key]: pick.value },
    };
    renderModal();
  });
  let chartNamaTimer = 0;
  document.getElementById("modal-root").addEventListener("input", (e) => {
    const pick = e.target.closest("input[data-chart-list-filter]");
    if (!pick || state.modal?.type !== "chart-list") return;
    const key = pick.getAttribute("data-chart-list-filter");
    const value = pick.value;
    state.modal = {
      ...state.modal,
      chartFilters: { ...(state.modal.chartFilters || {}), [key]: value },
    };
    window.clearTimeout(chartNamaTimer);
    chartNamaTimer = window.setTimeout(() => {
      if (state.modal?.type !== "chart-list") return;
      renderModal();
      const again = document.querySelector(`input[data-chart-list-filter="${key}"]`);
      if (again) {
        again.focus();
        const len = again.value.length;
        again.setSelectionRange(len, len);
      }
    }, 180);
  });
  document.getElementById("modal-root").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-back") || e.target.closest("button[data-close]")) {
      closeModal();
      return;
    }
    const watchBtn = e.target.closest("[data-watch]");
    if (watchBtn) {
      toggleWatch(watchBtn.getAttribute("data-watch"));
      renderPantau(filtered());
      renderModal();
      flash(isWatched(watchBtn.getAttribute("data-watch")) ? "Masuk antrian kunjungan." : "Dilepas dari antrian kunjungan.");
      return;
    }
    if (e.target.closest("#btn-template-modal")) {
      downloadDbTemplate();
      return;
    }
    if (e.target.closest("#btn-template-capaian-modal")) {
      downloadCapaianTemplate();
      return;
    }
    if (e.target.closest("#excel-drop")) {
      if (!can("canUploadData")) return;
      if (isKpwScoped() && !requireKpwSelf("db-import-self")) return;
      openExcelPicker();
      return;
    }
    if (e.target.closest("#excel-drop-capaian")) {
      if (!can("canUploadData")) return;
      if (e.target.closest(".is-disabled") || !requireKpwSelf("capaian-import-self")) return;
      openCapaianExcelPicker();
      return;
    }
    if (e.target.closest("#btn-capaian-import-merge")) {
      if (!can("canUploadData")) return;
      if (!requireKpwSelf()) return;
      if (!state.capaianDraft?.offices?.length) return;
      const { data, added, updated } = mergeCapaianOffices(state.capaianDraft.offices);
      if (state.capaianDraft.source) data.source = state.capaianDraft.source;
      if (state.capaianDraft.sheet) data.sheet = state.capaianDraft.sheet;
      persistCapaian(data, {
        action: "import",
        count: added + updated || (state.capaianDraft?.offices || []).length,
        target: kpwScopeLabel(),
      }).then((ok) => {
        if (!ok) return;
        flash(
          isKpwScoped()
            ? `Data ICK ${state.kpwSelfKey} diperbarui tanpa mengubah KPwDN lain.`
            : `Capaian ICK digabung: ${fmtNum(added)} baru, ${fmtNum(updated)} diperbarui.`
        );
        closeModal();
        renderCapaian();
      });
      return;
    }
    if (e.target.closest("#btn-capaian-import-replace")) {
      if (!can("canReplaceAllData")) {
        flash("Hanya Administrator yang dapat mengganti seluruh capaian ICK.", true);
        return;
      }
      if (!state.capaianDraft?.offices?.length) return;
      if (!confirm("Ganti seluruh capaian ICK dengan isi Excel ini?")) return;
      persistCapaian(state.capaianDraft, {
        action: "replace",
        target: "Seluruh capaian ICK",
        details: [`${fmtNum(state.capaianDraft.offices.length)} kantor dari Excel`],
      }).then((ok) => {
        if (!ok) return;
        flash(`${state.capaianDraft.offices.length} kantor dari Excel mengganti capaian ICK.`);
        closeModal();
        renderCapaian();
      });
      return;
    }
    if (e.target.closest("[data-capaian-edit]")) {
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const no = state.modal?.no;
      if (!no) return;
      const office = capaianOfficeByNo(no);
      if (!officeIsKpwSelf(office)) {
        flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
        return;
      }
      state.modal = { type: "capaian-edit", no };
      renderModal();
      return;
    }
    if (e.target.closest("[data-capaian-db]")) {
      const office = capaianOfficeByNo(state.modal?.no);
      closeModal();
      openCapaianOfficeDb(office);
      return;
    }
    if (e.target.closest("#btn-capaian-delete")) {
      if (isKpwScoped()) {
        flash("Kantor Perwakilan tidak dapat menghapus kantor dari capaian ICK.", true);
        return;
      }
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const no = state.modal?.no;
      if (!no) return;
      if (!confirm("Hapus kantor ini dari capaian ICK?")) return;
      const prevSnapshot = buildCapaianPrevSnapshot(ickCapaian());
      const data = JSON.parse(JSON.stringify(ickCapaian()));
      data.offices = (data.offices || []).filter((office) => Number(office.no) !== Number(no));
      persistCapaian(data, {}, prevSnapshot).then((ok) => {
        if (!ok) return;
        state.capaianEditBaseline = null;
        state.capaianOffice = 0;
        flash("Kantor dihapus dari capaian ICK.");
        closeModal();
        renderCapaian();
      });
      return;
    }
    if (e.target.closest("#btn-import-merge")) {
      if (!can("canUploadData")) return;
      if (!requireKpwSelf("db-import-self")) return;
      if (!state.importDraft?.rows.length) return;
      applyImportedRows(state.importDraft.rows, false, {
        added: (state.importDraft.fresh || []).length,
        updated: (state.importDraft.matched || []).length,
      });
      return;
    }
    if (e.target.closest("#btn-import-append")) {
      if (!can("canUploadData")) return;
      if (!state.importDraft?.fresh.length) return;
      applyImportedRows(state.importDraft.fresh, false);
      return;
    }
    if (e.target.closest("#btn-import-replace")) {
      if (!can("canReplaceAllData")) {
        flash("Hanya Administrator yang dapat mengganti seluruh data.", true);
        return;
      }
      if (!state.importDraft?.rows.length) return;
      if (!confirm("Ganti seluruh database dengan isi Excel ini?")) return;
      applyImportedRows(state.importDraft.rows, true);
      return;
    }
    if (e.target.closest("#btn-saran-reset") && state.modal?.type === "saran-edit") {
      const kind = state.modal.kind === "horizons" ? "horizons" : "priority";
      const idx = Number(state.modal.idx) || 0;
      if (saranOverrides[kind]) {
        delete saranOverrides[kind][idx];
        if (!Object.keys(saranOverrides[kind]).length) delete saranOverrides[kind];
      }
      saveSaranOverrides();
      closeModal();
      renderPantau(filtered());
      flash("Saran dikembalikan ke bawaan.");
      return;
    }
    if (e.target.closest("#btn-chart-list-clear") && state.modal?.type === "chart-list") {
      state.modal = { ...state.modal, chartFilters: {} };
      renderModal();
      return;
    }
    if (e.target.closest("[data-chart-back]") && state.modal?.fromChart) {
      state.modal = {
        type: "chart-list",
        field: state.modal.fromChart.field,
        value: state.modal.fromChart.value,
        others: state.modal.fromChart.others || null,
        chartFilters: state.modal.fromChart.chartFilters || {},
      };
      renderModal();
      return;
    }
    const chartRow = e.target.closest("tr[data-chart-id]");
    if (chartRow && state.modal?.type === "chart-list") {
      state.modal = {
        type: "detail",
        id: chartRow.getAttribute("data-chart-id"),
        fromChart: {
          field: state.modal.field,
          value: state.modal.value,
          others: state.modal.others || null,
          chartFilters: state.modal.chartFilters || {},
        },
      };
      renderModal();
      return;
    }
    const edit = e.target.closest("[data-edit]");
    if (edit) {
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const row = records.find((r) => r.id === edit.getAttribute("data-edit"));
      if (row && isKpwScoped() && !recordIsKpwSelf(row)) {
        flash("Anda hanya dapat mengubah data UMKM/PUS KPwDN pengampu Anda.", true);
        return;
      }
      state.modal = { type: "edit", id: edit.getAttribute("data-edit") };
      renderModal();
      return;
    }
    const del = e.target.closest("[data-delete]");
    if (del) {
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const id = del.getAttribute("data-delete");
      const row = records.find((r) => r.id === id);
      if (row && isKpwScoped() && !recordIsKpwSelf(row)) {
        flash("Anda hanya dapat menghapus data UMKM/PUS KPwDN pengampu Anda.", true);
        return;
      }
      if (!row || !confirm(`Hapus ${row.nama}?`)) return;
      persistRecords(records.filter((r) => r.id !== id)).then((ok) => {
        if (!ok) return;
        watchIds = watchIds.filter((item) => item !== String(id));
        saveWatch();
        closeModal();
        render();
      });
    }
  });

  document.getElementById("modal-root").addEventListener("dragover", (e) => {
    const zone = e.target.closest("#excel-drop, #excel-drop-capaian");
    if (!zone) return;
    e.preventDefault();
    zone.classList.add("drag");
  });
  document.getElementById("modal-root").addEventListener("dragleave", (e) => {
    const zone = e.target.closest("#excel-drop, #excel-drop-capaian");
    if (zone) zone.classList.remove("drag");
  });
  document.getElementById("modal-root").addEventListener("drop", (e) => {
    const capaianZone = e.target.closest("#excel-drop-capaian");
    if (capaianZone) {
      e.preventDefault();
      capaianZone.classList.remove("drag");
      if (capaianZone.classList.contains("is-disabled") || !requireKpwSelf("capaian-import-self")) return;
      ingestCapaianExcelFile(e.dataTransfer.files && e.dataTransfer.files[0]);
      return;
    }
    const zone = e.target.closest("#excel-drop");
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove("drag");
    if (isKpwScoped() && !requireKpwSelf("db-import-self")) return;
    ingestExcelFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  });

  document.getElementById("modal-root").addEventListener("submit", (e) => {
    if (e.target.id === "capaian-office-form") {
      e.preventDefault();
      if (!can("canEdit")) {
        flash("Akun ini hanya dapat melihat data.", true);
        return;
      }
      const form = Object.fromEntries(new FormData(e.target).entries());
      if (isKpwScoped()) {
        const picked = String(form.kpwdn || "").trim();
        if (picked) saveKpwSelfKey(picked);
        if (!requireKpwSelf("kpw-self-pick")) return;
      }
      const prevSnapshot = buildCapaianPrevSnapshot(ickCapaian());
      const data = JSON.parse(JSON.stringify(ickCapaian()));
      const programs = data.programs || [];
      const acc = {};
      const ind = {};
      const realisasi = {};
      programs.forEach((item) => {
        acc[item.id] = ickEmptyZero(form[`acc-${item.id}`]);
        ind[item.id] = ickEmptyZero(form[`ind-${item.id}`]);
        realisasi[item.id] = ickEmptyZero(form[`real-${item.id}`]);
      });
      let kpwdn = String(form.kpwdn || form.kpw || "").trim();
      let kpw = String(form.kpw || form.kpwdn || "").trim();
      if (isKpwScoped()) {
        kpwdn = state.kpwSelfKey;
        kpw = kpw || state.kpwSelfKey;
      }
      if (isKpwScoped() && state.modal?.type === "capaian-edit") {
        const target = capaianOfficeByNo(state.modal.no);
        if (!officeIsKpwSelf(target)) {
          flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
          return;
        }
      }
      if (isKpwScoped() && state.modal?.type === "capaian-create" && !requireKpwSelf()) return;
      const existingSelf = isKpwScoped() ? kpwSelfOffice() : null;
      const office = {
        no:
          existingSelf?.no ||
          ickEmptyZero(form.no) ||
          Math.max(0, ...(data.offices || []).map((row) => Number(row.no) || 0)) + 1,
        tier: String(form.tier || existingSelf?.tier || "").trim() || "Tier C",
        wilayah: String(form.wilayah || existingSelf?.wilayah || "").trim() || "Jawa",
        kpw,
        kpwdn,
        acc,
        ind,
        realisasi,
        accBase: { ...acc },
        revised: {},
        totalAcc: 0,
        totalRealisasi: 0,
        totalInd: 0,
      };
      if (isKpwScoped() && existingSelf) {
        const list = [...(data.offices || [])];
        const idx = list.findIndex((row) => Number(row.no) === Number(existingSelf.no));
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            ...office,
            no: existingSelf.no,
            kpwdn: existingSelf.kpwdn || kpwdn,
            kpw: existingSelf.kpw || kpw,
            wilayah: existingSelf.wilayah || office.wilayah,
            tier: existingSelf.tier || office.tier,
          };
        }
        data.offices = list;
        persistCapaian(data, {}, prevSnapshot).then((ok) => {
          if (!ok) return;
          state.capaianEditBaseline = null;
          flash(`Data ICK ${state.kpwSelfKey} disimpan.`);
          state.modal = { type: "capaian-office", no: existingSelf.no };
          renderCapaian();
          renderModal();
        });
        return;
      }
      const list = [...(data.offices || [])];
      if (state.modal?.type === "capaian-edit") {
        const idx = list.findIndex((row) => Number(row.no) === Number(state.modal.no));
        if (idx >= 0) list[idx] = { ...list[idx], ...office, no: list[idx].no };
        else list.push(office);
      } else {
        list.push(office);
      }
      data.offices = list.sort((a, b) => Number(a.no) - Number(b.no));
      persistCapaian(data, {}, prevSnapshot).then((ok) => {
        if (!ok) return;
        state.capaianEditBaseline = null;
        flash(state.modal?.type === "capaian-edit" ? "Capaian kantor disimpan." : "Kantor ditambahkan ke capaian ICK.");
        state.modal = { type: "capaian-office", no: office.no };
        renderCapaian();
        renderModal();
      });
      return;
    }
    if (e.target.id === "saran-edit-form") {
      e.preventDefault();
      const kind = state.modal?.kind === "horizons" ? "horizons" : "priority";
      const idx = Number(state.modal?.idx) || 0;
      const form = Object.fromEntries(new FormData(e.target).entries());
      if (!saranOverrides[kind]) saranOverrides[kind] = {};
      saranOverrides[kind][idx] = {
        title: String(form.title || "").trim(),
        text: String(form.text || "").trim(),
        ...(kind === "horizons"
          ? {
              label: String(form.label || "").trim(),
              window: String(form.window || "").trim(),
            }
          : {}),
      };
      saveSaranOverrides();
      closeModal();
      renderPantau(filtered());
      flash("Saran disimpan.");
      return;
    }
    if (e.target.id !== "record-form") return;
    e.preventDefault();
    if (!can("canEdit")) {
      flash("Akun ini hanya dapat melihat data.", true);
      return;
    }
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.tahun = Number(data.tahun);
    if (isKpwScoped()) {
      const picked = String(data.kpwdn || "").trim();
      if (picked) saveKpwSelfKey(picked);
      if (!requireKpwSelf("db-form-self")) return;
      data.kpwdn = state.kpwSelfKey;
    }
    data.jenis = classifyJenis(data);
    let next;
    if (state.modal?.type === "edit") {
      const prev = records.find((row) => row.id === state.modal.id);
      if (prev && isKpwScoped() && !recordIsKpwSelf(prev)) {
        flash("Anda hanya dapat mengubah data UMKM/PUS KPwDN pengampu Anda.", true);
        return;
      }
      next = records.map((row) =>
        row.id === state.modal.id
          ? {
              ...row,
              ...data,
              lokasi: row.lokasi || "",
              status: row.status || "Aktif",
            }
          : row
      );
    } else {
      next = records.concat([{ id: `u${Date.now()}`, ...data, lokasi: "", status: "Aktif" }]);
    }
    persistRecords(next).then((ok) => {
      if (!ok) return;
      closeModal();
      render();
    });
  });

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim().toLowerCase();
    const pass = document.getElementById("login-pass").value;
    const error = document.getElementById("login-error");
    const match = AUTH_USERS.find((row) => row.user === user && row.pass === pass);
    if (!match) {
      error.hidden = false;
      error.textContent = "Nama pengguna atau kata sandi tidak sesuai.";
      return;
    }
    error.hidden = true;
    sessionStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        user: match.user,
        name: match.name,
        role: match.role,
        kpwdn: match.kpwdn || "",
        at: Date.now(),
      })
    );
    state.view = ROLE_ACCESS[match.role]?.views?.[0] || "beranda";
    showApp();
  });
  document.getElementById("app-shell").addEventListener("change", (e) => {
    if (e.target.id !== "kpw-self-pick") return;
    handleKpwSelfPick(e.target);
  });
  document.getElementById("app-shell").addEventListener("click", (e) => {
    const go = e.target.closest("[data-view]");
    if (!go) return;
    const view = go.getAttribute("data-view");
    if (!["beranda", "ringkasan", "capaian", "database", "history"].includes(view)) return;
    e.preventDefault();
    setView(view);
  });

  document.getElementById("view-ringkasan").addEventListener("click", (e) => {
    const saranCard = e.target.closest("[data-saran-kind]");
    if (saranCard) {
      state.modal = {
        type: "saran-edit",
        kind: saranCard.getAttribute("data-saran-kind"),
        idx: Number(saranCard.getAttribute("data-saran-idx")) || 0,
      };
      renderModal();
      return;
    }
    if (e.target.closest("#btn-clear-wilayah")) {
      state.wilayah = "";
      state.page = 1;
      render();
      return;
    }
    if (e.target.closest("#btn-chart-kpw-clear")) {
      state.chartKpwQ = "";
      const select = document.getElementById("chart-kpw-q");
      if (select) select.value = "";
      renderCharts(filtered());
    }
  });
  document.getElementById("view-ringkasan").addEventListener("change", (e) => {
    if (e.target.id !== "chart-kpw-q") return;
    state.chartKpwQ = e.target.value;
    renderCharts(filtered());
  });

  document.getElementById("view-beranda").addEventListener("click", (e) => {
    const wilayah = e.target.closest("[data-home-wilayah]");
    if (wilayah) {
      const id = wilayah.getAttribute("data-home-wilayah");
      if (!id) return;
      state.homeWilayah = state.homeWilayah === id ? "" : id;
      state.homeActions = false;
      state.homeKpw = "";
      state.homeUnitId = "";
      renderHome();
      return;
    }
    const kpwBtn = e.target.closest("[data-home-kpw]");
    if (kpwBtn) {
      state.homeKpw = kpwBtn.getAttribute("data-home-kpw") || "";
      state.homeUnitId = "";
      state.homeActions = false;
      renderHomeKpwListPop();
      return;
    }
    const unitBtn = e.target.closest("[data-home-unit]");
    if (unitBtn) {
      state.homeUnitId = unitBtn.getAttribute("data-home-unit") || "";
      renderHomeUnitPop();
      return;
    }
    if (e.target.closest("#btn-home-tiga-tindakan")) {
      state.homeActions = true;
      state.homeKpw = "";
      state.homeUnitId = "";
      renderHomeWilayahPop();
      return;
    }
    if (e.target.closest("#btn-home-actions-close") || e.target.id === "home-actions-pop") {
      state.homeActions = false;
      renderHomeWilayahPop();
      return;
    }
    if (e.target.closest("#btn-home-unit-close") || e.target.id === "home-unit-pop") {
      state.homeUnitId = "";
      renderHomeUnitPop();
      return;
    }
    if (e.target.closest("#btn-home-kpw-close") || e.target.id === "home-kpw-list-pop") {
      state.homeKpw = "";
      state.homeUnitId = "";
      renderHomeKpwListPop();
      return;
    }
    if (e.target.closest("#btn-home-pop-close") || e.target.id === "home-wilayah-pop") {
      state.homeWilayah = "";
      state.homeActions = false;
      state.homeKpw = "";
      state.homeUnitId = "";
      renderHome();
    }
  });

  const capaianView = document.getElementById("view-capaian");
  if (capaianView) {
    capaianView.addEventListener("click", (e) => {
      const sortBtn = e.target.closest("[data-capaian-sort]");
      if (sortBtn) {
        state.capaianSort = state.capaianSort === "asc" ? "desc" : "asc";
        renderCapaian();
        return;
      }
      const card = e.target.closest("[data-ick-program]");
      if (card) {
        const id = card.getAttribute("data-ick-program");
        state.capaianProgram = state.capaianProgram === id ? "" : id;
        renderCapaian();
        return;
      }
      if (e.target.closest("#capaian-reset")) {
        state.capaianProgram = "";
        renderCapaian();
        return;
      }
      const officeRow = e.target.closest("[data-capaian-office]");
      if (officeRow) {
        state.modal = {
          type: "capaian-office",
          no: Number(officeRow.getAttribute("data-capaian-office")) || 0,
        };
        renderModal();
        return;
      }
      const kpwRow = e.target.closest("[data-kpw-filter]");
      if (kpwRow) {
        state.kpwdn = [kpwRow.getAttribute("data-kpw-filter")];
        state.fasilitas = state.capaianProgram ? fasilitasLabelsForProgram(state.capaianProgram) : [];
        state.komoditas = [];
        state.tahun = [];
        state.qNama = "";
        state.jenis = [];
        state.wilayah = "";
        state.page = 1;
        setView("database");
      }
    });
    capaianView.addEventListener("input", (e) => {
      if (e.target.id !== "capaian-q") return;
      state.capaianQ = e.target.value;
      renderCapaian();
    });
    capaianView.addEventListener("change", (e) => {
      if (e.target.id !== "capaian-wilayah") return;
      state.capaianWilayah = e.target.value;
      renderCapaian();
    });
  }

  document.getElementById("btn-logout").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(KPW_SELF_KEY);
    state.kpwSelfKey = "";
    closeModal();
    showLogin();
  });

  const TICKER_SEED = [
    {
      id: "seed-qris-mdr",
      title: "BI perluas MDR QRIS 0% untuk seluruh merchant mulai Oktober 2026",
      url: "https://money.kompas.com/read/2026/08/17/095952526/bi-gratiskan-biaya-transaksi-qris-untuk-seluruh-pedagang-hingga-rp-500000-per",
      publishedAt: "2026-08-17T00:00:00.000Z",
    },
    {
      id: "seed-qris-manfaat",
      title: "MDR QRIS nol persen: manfaat bagi UMKM dan konsumen",
      url: "https://money.kompas.com/read/2026/08/17/135017126/apa-itu-mdr-qris-nol-persen-ini-manfaatnya-bagi-umkm-dan-konsumen",
      publishedAt: "2026-08-16T00:00:00.000Z",
    },
    {
      id: "seed-qris-tumbuh",
      title: "Transaksi QRIS tumbuh 82,42% seiring digitalisasi UMKM",
      url: "https://www.liputan6.com/bisnis/read/8273255/transaksi-qris-tumbuh-8242-2-faktor-ini-jadi-penopang",
      publishedAt: "2026-08-15T00:00:00.000Z",
    },
  ];
  const NEWS_FEED_URL = "assets/data/umkm-news.json";
  const NEWS_SEEN_KEY = "padel-news-seen-v1";
  const NEWS_REFRESH_MS = 15 * 60 * 1000;
  const NEWS_RELEVANCE =
    /\b(umkm|usaha\s+mikro|usaha\s+kecil|menengah|qr[i]?s|kur|pelaku\s+usaha\s+syariah|\bpus\b|ekonomi\s+syariah|halal|pesantren|koperasi\s+syariah|bank\s+indonesia|\bbi\b|binaan|inkubasi|klaster|digitalisasi\s+umkm)\b/i;
  const NEWS_NOISE = /\b(bola|sepak|politik|pilpres|gaji\s+artis|k-pop|drakor|horoskop|goss?ip|seleb)\b/i;
  let tickerRefreshTimer = null;
  let tickerKnownIds = new Set();

  function loadSeenNewsIds() {
    try {
      const parsed = JSON.parse(localStorage.getItem(NEWS_SEEN_KEY) || "[]");
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveSeenNewsIds(ids) {
    localStorage.setItem(NEWS_SEEN_KEY, JSON.stringify([...ids].slice(0, 120)));
  }

  function newsItemId(item) {
    if (item.id) return String(item.id);
    const base = `${String(item.title || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()}|${String(item.url || "").toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    return `n${hash.toString(16)}`;
  }

  function isRelevantNews(title) {
    const t = String(title || "").replace(/\s+/g, " ").trim();
    if (t.length < 12 || NEWS_NOISE.test(t)) return false;
    return NEWS_RELEVANCE.test(t);
  }

  function normalizeNewsUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    try {
      const u = new URL(raw);
      const nested = u.searchParams.get("url");
      if (nested && /^https?:\/\//i.test(nested)) return nested;
      return u.href;
    } catch (_) {
      return raw;
    }
  }

  function normalizeNewsItem(raw) {
    const title = String(raw?.title || "")
      .replace(/\s+/g, " ")
      .trim();
    const url = normalizeNewsUrl(raw?.url);
    if (!title || !url || !isRelevantNews(title)) return null;
    const item = {
      id: newsItemId({ id: raw?.id, title, url }),
      title,
      url,
      publishedAt: raw?.publishedAt || raw?.pubDate || "",
    };
    return item;
  }

  function mergeNewsItems(...batches) {
    const seen = new Set();
    const out = [];
    batches.flat().forEach((raw) => {
      const item = normalizeNewsItem(raw);
      if (!item || seen.has(item.id)) return;
      seen.add(item.id);
      out.push(item);
    });
    out.sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));
    return out.slice(0, 24);
  }

  function updateTickerLabel(updatedAt, newCount) {
    const el = document.getElementById("ticker-label");
    if (!el) return;
    let stamp = "";
    if (updatedAt) {
      const dt = new Date(updatedAt);
      if (!Number.isNaN(dt.getTime())) {
        stamp = ` · ${dt.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
      }
    }
    const fresh = newCount > 0 ? ` · ${newCount} baru` : "";
    el.textContent = `Berita UMKM${fresh}${stamp}`;
  }

  function paintTicker(items, newIds) {
    const fresh = newIds || new Set();
    const use = (items || []).length ? items : TICKER_SEED;
    const html = use
      .map(
        (it) =>
          `<a class="ticker-item${fresh.has(it.id) ? " is-new" : ""}" href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer"><b>${escapeHtml(
            it.title
          )}</b></a>`
      )
      .join("");
    const a = document.getElementById("ticker-copy-a");
    const b = document.getElementById("ticker-copy-b");
    const track = document.getElementById("ticker-track");
    if (a) a.innerHTML = html;
    if (b) b.innerHTML = html;
    if (track) track.style.animationDuration = `${Math.max(45, use.length * 9)}s`;
  }

  function parseRssNews(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.querySelector("parsererror")) return [];
    return [...doc.querySelectorAll("item")]
      .map((item) => {
        const title = (item.querySelector("title")?.textContent || "").trim();
        const linkEl = item.querySelector("link");
        const link =
          (linkEl?.textContent || "").trim() ||
          linkEl?.getAttribute("href") ||
          (item.querySelector("guid")?.textContent || "").trim();
        const publishedAt = (item.querySelector("pubDate")?.textContent || "").trim();
        return normalizeNewsItem({ title, url: link, publishedAt });
      })
      .filter(Boolean);
  }

  async function fetchTextViaProxy(url, proxies) {
    for (const make of proxies) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(make(url), { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) continue;
        return await res.text();
      } catch (_) {
        /* try next proxy */
      }
    }
    return null;
  }

  async function fetchBundledNewsFeed() {
    try {
      const res = await fetch(`${NEWS_FEED_URL}?v=${encodeURIComponent(APP_BUILD)}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !Array.isArray(data.items)) return null;
      return {
        updatedAt: data.updatedAt || "",
        items: mergeNewsItems(data.items),
      };
    } catch (_) {
      return null;
    }
  }

  async function fetchLiveUmkmNewsFeed() {
    const queries = [
      "UMKM Indonesia",
      '"pelaku usaha syariah" OR PUS OR pesantren Indonesia UMKM',
      "QRIS UMKM Indonesia",
      "site:bi.go.id UMKM OR syariah",
    ];
    const proxies = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    ];
    const batches = await Promise.all(
      queries.map(async (query) => {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
        const text = await fetchTextViaProxy(rssUrl, proxies);
        return text ? parseRssNews(text) : [];
      })
    );
    const items = mergeNewsItems(...batches);
    return items.length ? { updatedAt: new Date().toISOString(), items } : null;
  }

  async function refreshNewsTicker() {
    const seenBefore = loadSeenNewsIds();
    const bundled = await fetchBundledNewsFeed();
    const live = await fetchLiveUmkmNewsFeed();
    const merged = mergeNewsItems(live?.items || [], bundled?.items || [], TICKER_SEED);
    if (!merged.length) {
      paintTicker(TICKER_SEED, new Set());
      updateTickerLabel("", 0);
      return;
    }

    const newIds = new Set(merged.filter((it) => !seenBefore.has(it.id)).map((it) => it.id));
    paintTicker(merged, newIds);
    updateTickerLabel(live?.updatedAt || bundled?.updatedAt || "", newIds.size);

    const nextSeen = new Set(seenBefore);
    merged.forEach((it) => nextSeen.add(it.id));
    saveSeenNewsIds(nextSeen);
    tickerKnownIds = nextSeen;
  }

  function startNewsTicker() {
    tickerKnownIds = loadSeenNewsIds();
    refreshNewsTicker();
    if (tickerRefreshTimer) clearInterval(tickerRefreshTimer);
    tickerRefreshTimer = setInterval(refreshNewsTicker, NEWS_REFRESH_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshNewsTicker();
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === HISTORY_KEY) syncHistoryFromStorage();
  });

  Promise.all([loadRecords().catch(() => []), loadCapaian().catch(() => null), loadHistory().catch(() => null)])
    .then(([list]) => {
      records = list;
      if (currentSession()) showApp();
      else showLogin();
    });
})();
