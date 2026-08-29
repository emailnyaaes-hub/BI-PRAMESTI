(function () {
  const AUTH_KEY = "padel-session-v1";
  const KPW_SELF_KEY = "padel-kpw-self-v1";
  const AUTH_USERS = [
    { user: "user", pass: "lihat2026", name: "User", role: "user" },
    { user: "kpw", pass: "kpw2026", name: "Kantor Perwakilan", role: "kpw" },
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
      views: ["beranda", "ringkasan", "capaian", "database"],
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
  };

  let watchIds = loadWatch();
  let saranOverrides = loadSaranOverrides();

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

  function loadKpwSelfKey() {
    try {
      return String(sessionStorage.getItem(KPW_SELF_KEY) || "").trim();
    } catch (_) {
      return "";
    }
  }

  function saveKpwSelfKey(key) {
    const next = String(key || "").trim();
    state.kpwSelfKey = next;
    try {
      if (next) sessionStorage.setItem(KPW_SELF_KEY, next);
      else sessionStorage.removeItem(KPW_SELF_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  function kpwSelfOffice() {
    const key = String(state.kpwSelfKey || "").trim().toLowerCase();
    if (!key) return null;
    return (ickCapaian().offices || []).find((office) => capaianOfficeKey(office) === key) || null;
  }

  function officeIsKpwSelf(office) {
    if (!isKpwScoped()) return true;
    const key = String(state.kpwSelfKey || "").trim().toLowerCase();
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
    if (state.kpwSelfKey) return true;
    flash("Pilih KPwDN pengampu Anda terlebih dahulu.", true);
    const sel = document.getElementById(focusId || "capaian-import-self");
    if (sel) sel.focus();
    return false;
  }

  function kpwOfficeOptionsHtml(selected) {
    const current = String(selected || state.kpwSelfKey || "").trim();
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
    if (addBtn && currentRole() === "kpw") {
      addBtn.textContent = kpwSelfOffice() ? "Perbarui data saya" : "Tambah data saya";
    } else if (addBtn) {
      addBtn.textContent = "Tambah data";
    }
    const dbAddBtn = document.getElementById("btn-add");
    if (dbAddBtn && currentRole() === "kpw") {
      dbAddBtn.textContent = state.kpwSelfKey ? "Tambah data saya" : "Tambah data saya";
    } else if (dbAddBtn) {
      dbAddBtn.textContent = "Tambah data";
    }
    if (!canView(state.view)) {
      state.view = access.views[0] || "beranda";
    }
  }

  function showApp() {
    const session = currentSession();
    document.getElementById("login-gate").hidden = true;
    document.getElementById("app-shell").hidden = false;
    state.kpwSelfKey = isKpwScoped() ? loadKpwSelfKey() : "";
    startNewsTicker();
    const label = document.getElementById("user-label");
    if (label) {
      const roleName =
        session?.role === "admin"
          ? "Administrator"
          : session?.role === "kpw"
            ? "Kantor Perwakilan"
            : session?.role === "user"
              ? "User"
              : "";
      label.textContent = session
        ? roleName && session.name !== roleName
          ? `${session.name} · ${roleName}`
          : session.name || session.user
        : "";
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

  async function persistRecords(next) {
    try {
      await saveRecords(next);
      records = next;
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

  function parseSpreadsheet(file, buffer) {
    if (!window.XLSX) {
      throw new Error("Pustaka Excel belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
    }
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    if (!workbook.SheetNames.length) throw new Error("Berkas tidak berisi lembar kerja.");
    let best = null;
    workbook.SheetNames.forEach((sheetName) => {
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
      const bonus = /rekap all/i.test(sheetName) ? 500000000 : /onboarding|digital farming/i.test(sheetName) ? -200000000 : 0;
      const score = bonus + (parsed.score || 0) * 10000 + parsed.rows.length;
      if (!best || score > best.rank) {
        best = { parsed, sheetName, rank: score };
      }
    });
    const chosen = best.parsed;
    chosen.filename = file.name;
    chosen.sheet = best.sheetName;
    return chosen;
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
      throw new Error("Tidak menemukan Tabel 2026 (Acc) atau Target 2026 (Ind). Unggah Rekap Capaian ICK DR KPwDN.");
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

  async function applyImportedRows(rows, replace) {
    if (isKpwScoped()) {
      const { rows: next, added, updated } = mergeDatabaseRows(rows);
      if (!(await persistRecords(next))) return;
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
    if (!(await persistRecords(next))) return;
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

  function downloadBuiltDbTemplate() {
    if (!window.XLSX) {
      flash("Pustaka Excel belum termuat. Muat ulang halaman, lalu coba lagi.", true);
      return;
    }
    const example = [
      "Kopi Contoh Lestari",
      "UMKM",
      "Kopi",
      "Pendampingan klaster",
      new Date().getFullYear(),
      "KPwDN Provinsi Jawa Barat",
      "Bandung, Jawa Barat",
      "Aktif",
      "Contoh baris — hapus lalu isi data Anda",
    ];
    const sheet = XLSX.utils.aoa_to_sheet([IMPORT_HEADERS, example]);
    sheet["!cols"] = IMPORT_HEADERS.map((h) => ({ wch: Math.max(16, h.length + 4) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "BI PRAMESTI");
    XLSX.writeFile(book, "template-bi-pramesti.xlsx");
  }

  function downloadBuiltCapaianTemplate() {
    if (!window.XLSX) {
      flash("Pustaka Excel belum termuat. Muat ulang halaman, lalu coba lagi.", true);
      return;
    }
    const programs = (ickCapaian().programs || []).map((item) => item.name || item.id);
    const headers = [
      "No",
      "Tier",
      "Wilayah",
      "KPwDN pengampu",
      ...programs.flatMap((name) => [`Acc ${name}`, `Ind ${name}`, `Realisasi ${name}`]),
    ];
    const example = [
      1,
      "Tier C",
      "Jawa",
      "Provinsi Jawa Barat",
      ...programs.flatMap(() => [0, 0, 0]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
    sheet["!cols"] = headers.map((h) => ({ wch: Math.max(12, String(h).length + 2) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Capaian ICK");
    XLSX.writeFile(book, "template-capaian-ick.xlsx");
  }

  async function downloadStoredOrBuilt(key, builtFn, fallbackName) {
    if (!can("canDownloadTemplate")) {
      flash("Akun ini tidak dapat mengunduh template.", true);
      return;
    }
    const meta = await loadTemplateMeta(key);
    if (meta) {
      try {
        const blob = new Blob([base64ToArrayBuffer(meta.base64)], {
          type: meta.mime || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        triggerBlobDownload(blob, meta.name || fallbackName);
        flash(`Template standar diunduh: ${meta.name || fallbackName}.`);
        return;
      } catch (_) {
        flash("Template tersimpan rusak. Mengunduh template bawaan.", true);
      }
    }
    builtFn();
  }

  function downloadDbTemplate() {
    downloadStoredOrBuilt(TEMPLATE_DB_KEY, downloadBuiltDbTemplate, "template-bi-pramesti.xlsx");
  }

  function downloadCapaianTemplate() {
    downloadStoredOrBuilt(TEMPLATE_CAPAIAN_KEY, downloadBuiltCapaianTemplate, "template-capaian-ick.xlsx");
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
          <span class="kicker">Tiga tindakan</span>
          <strong>Saran untuk wilayah ${escapeHtml(region.name)}</strong>
          <span>Klik untuk membuka analisis</span>
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
    const prevWilayah = state.wilayah;
    state.wilayah = region.id;
    const actions = buildActions(list).priority;
    state.wilayah = prevWilayah;
    pop.hidden = false;
    pop.innerHTML = `
      <div class="home-pop-card home-actions-card" role="dialog" aria-label="Tiga tindakan wilayah ${escapeHtml(region.name)}">
        <div class="home-pop-head">
          <div>
            <div class="kicker">Tiga tindakan</div>
            <p class="meta">Wilayah ${escapeHtml(region.name)}</p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-home-actions-close">Tutup</button>
        </div>
        <ol class="home-actions-list">
          ${
            actions.length
              ? actions
                  .map(
                    (item) => `<li>
                      <strong>${escapeHtml(item.title)}</strong>
                      <span>${escapeHtml(item.text)}</span>
                    </li>`
                  )
                  .join("")
              : `<li><span>Tidak ada saran pada cakupan ini.</span></li>`
          }
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

  function buildBriefing(list) {
    if (!list.length) {
      return [
        {
          title: "",
          items: [
            "Tidak ada data pada cakupan saat ini. Ubah filter, lepas fokus peta, atau tambah data agar briefing dapat disusun.",
          ],
        },
      ];
    }
    const offices = new Set(list.map((row) => row.kpwdn)).size;
    const topKom = countByKomoditas(list).find(([name]) => name !== "N/A");
    const topFas = countByFasilitas(list).find(([name]) => name && name !== "N/A");
    const pus = list.filter((row) => row.jenis === "PUS").length;
    const years = yearList(list);
    const regionCounts = REGIONS.map((region) => ({
      name: region.name,
      n: list.filter((row) => matchesRegion(region, row.kpwdn)).length,
    })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "id"));
    const fokus = REGIONS.find((region) => region.id === state.wilayah);
    const filterBits = [
      state.jenis.length && `jenis ${state.jenis.join(", ")}`,
      state.komoditas.length && `komoditas ${state.komoditas.join(", ")}`,
      state.fasilitas.length && `fasilitas ${state.fasilitas.join(", ")}`,
      state.tahun.length && `tahun ${state.tahun.join(", ")}`,
      state.kpwdn.length && state.kpwdn.map(shortOffice).join(", "),
    ].filter(Boolean);
    const cakupan = fokus
      ? `wilayah ${fokus.name}`
      : filterBits.length
        ? filterBits.join(", ")
        : "nasional";
    const padat = regionCounts[0];
    const jarang = [...regionCounts].sort((a, b) => a.n - b.n || a.name.localeCompare(b.name, "id"))[0];

    const sections = [];
    if (cakupan !== "nasional") {
      sections.push({
        title: `Cakupan ${cakupan}`,
        items: [
          `Unit terpantau: ${fmtNum(list.length)} UMKM/PUS`,
          `Kantor pengampu: ${fmtNum(offices)} KPwDN`,
          `Rentang fasilitasi: ${years[0] || "—"}–${years[years.length - 1] || "—"}`,
          `Fasilitas paling sering: ${topFas ? topFas[0] : "belum terisi"}`,
          `Pelaku Usaha Syariah: ${fmtNum(pus)} unit`,
        ],
      });
    }

    if (!topKom) {
      sections.push({
        title: "Komoditas",
        items: ["Kolom komoditas masih kosong, sehingga komoditas paling padat belum dapat dibaca."],
      });
    } else {
      const komRows = list.filter((row) => row.komoditas === topKom[0]);
      sections.push({
        title: "Komoditas",
        items: [
          `Terpadat: ${topKom[0]} (${fmtNum(topKom[1])} unit)`,
          `Sebaran utama: ${regionPhrase(komRows)}`,
          `Pengampu utama: ${officePhrase(komRows, 2)}`,
          `Tindak lanjut: jadikan kantor pengampu itu rujukan klaster bila rapat wilayah membahas rantai pasok ${topKom[0]}.`,
        ],
      });
    }

    const officeRank = countBy(list, "kpwdn");
    if (fokus && officeRank.length) {
      const tebal = officeRank[0];
      const tipis = [...officeRank].sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0]), "id"))[0];
      const items =
        tebal[0] === tipis[0]
          ? [
              `Tertumpu pada KPwDN ${shortOffice(tebal[0])} (${fmtNum(tebal[1])} unit)`,
              "Tindak lanjut: perluas input data dari KPwDN lain di wilayah yang sama agar pantauan tidak bergantung pada satu kantor.",
            ]
          : [
              `Tertinggi: KPwDN ${shortOffice(tebal[0])} (${fmtNum(tebal[1])} unit)`,
              `Terendah: KPwDN ${shortOffice(tipis[0])} (${fmtNum(tipis[1])} unit)`,
              `Tindak lanjut: ${sebaranAdvice({ name: shortOffice(tebal[0]), n: tebal[1] }, { name: shortOffice(tipis[0]), n: tipis[1] })}`,
            ];
      sections.push({ title: `Sebaran ${fokus.name}`, items });
    } else {
      sections.push({
        title: "Sebaran wilayah",
        items: [
          `Tertinggi: ${padat.name} (${fmtNum(padat.n)} unit)`,
          `Terendah: ${jarang.name} (${fmtNum(jarang.n)} unit)`,
          `Tindak lanjut: ${sebaranAdvice(padat, jarang)}`,
        ],
      });
    }

    return sections;
  }

  function briefingHtml(list) {
    return buildBriefing(list)
      .map((section) => {
        const head = section.title
          ? `<h4 class="briefing-head">${escapeHtml(section.title)}</h4>`
          : "";
        const items = section.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("");
        return `<div class="briefing-block">${head}<ul class="briefing-points">${items}</ul></div>`;
      })
      .join("");
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
    const actions = (priority || buildActions(list).priority).slice(0, 3);
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
        <h3>Tiga tindakan</h3>
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
      actions ? `Tiga tindakan:\n${actions}` : "",
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

  function buildActions(list) {
    const total = list.length;
    const emptyHorizons = [
      {
        horizon: "pendek",
        label: "Jangka pendek",
        window: "0–6 bulan",
        title: "Buka data dulu",
        text: "Unggah kertas kerja Rekap All atau lepas filter/fokus peta agar BI PRAMESTI punya basis unit.",
      },
      {
        horizon: "menengah",
        label: "Jangka menengah",
        window: "6–24 bulan",
        title: "Ritme unggah triwulanan",
        text: "Setiap KPwDN mengunggah Rekap All setiap triwulan dengan kolom No, komoditas, ICK, tahun fasilitasi, dan Asal KPw terisi.",
      },
      {
        horizon: "panjang",
        label: "Jangka panjang",
        window: "2–5 tahun",
        title: "BI PRAMESTI sebagai alat rapat",
        text: "Jadikan Ringkasan Eksekutif bahan baku rapat wilayah secara berkala, bukan hanya arsip kertas kerja.",
      },
    ];
    if (!total) {
      return {
        priority: [
          {
            tone: "sedang",
            title: "Isi cakupan pantauan",
            text: "Tidak ada UMKM/PUS pada filter atau fokus peta ini. Lepas fokus wilayah, ubah filter, atau unggah kertas kerja agar tiga saran strategis dapat disusun.",
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
        title: `Baca ketimpangan ${jarang.name} vs ${padat.name} sebagai sinyal alokasi`,
        text: `${padat.name} menahan ${fmtNum(padat.n)} unit (${shareLabel(padat.n, total)}), ${jarang.name} hanya ${fmtNum(jarang.n)} (rasio ±${Math.max(1, Math.round(rasio))}:1). Dalam ekonomi regional, celah setajam ini bisa revealed agglomeration (biaya, pasar, logistik), atau underreporting yang membuat fungsi alokasi ICK mengikuti peta pelaporan, bukan peta kapasitas. Uji sederhana: KPwDN di ${jarang.name} mengunggah 10–20 unit unggulan pada siklus berikutnya. Jika stok melonjak, masalahnya measurement; jika tetap tipis, masalahnya endowment — dan instrumennya pun berbeda.`,
      });
    }
    if (topKom && komShare >= 0.08) {
      const komRows = list.filter((row) => komoditasLabel(row.komoditas) === topKom[0]);
      const office = countByAsalKpw(komRows)[0];
      candidates.push({
        score: 400 + Math.round(komShare * 100),
        tone: "tinggi",
        title: `Perlakukan ${topKom[0]} sebagai keunggulan komparatif, bukan daftar nama`,
        text: `${topKom[0]} sudah ${fmtNum(topKom[1])} unit (${shareLabel(topKom[1], total)}) di ${cakupan} — revealed comparative advantage, bukan target yang masih dicari. Marginal return tertinggi ada di deepening: input, offtaker, dan modal kerja di rantai yang sama, bukan program baru. ${office ? shortOffice(office[0]) : "KPwDN terpadat"} menuliskan paket yang sudah jalan dalam satu lembar rujukan, lalu dua KPwDN lain meniru. Itu economies of scale di rantai pasok, lebih murah daripada diversifikasi prematur.`,
      });
    }
    if (topKpw && kpwRank.length > 1 && kpwShare >= 0.18) {
      const thin = [...kpwRank].slice(-3).filter((row) => row[0] !== topKpw[0]);
      candidates.push({
        score: 380 + Math.round(kpwShare * 100),
        tone: "tinggi",
        title: "Koreksi bias seleksi pada input KPwDN",
        text: `${shortOffice(topKpw[0])} memasok ${fmtNum(topKpw[1])} unit (${shareLabel(topKpw[1], total)}). Konsentrasi pelaporan sebesar itu adalah selection bias: fungsi kebijakan mengikuti kantor yang rajin input, bukan kantor dengan potential output terbesar. Sample yang skewed menyesatkan ranking klaster dan kuota ICK. Tiga pengampu tertipis${thin.length ? ` (${thin.map((row) => shortOffice(row[0])).join(", ")})` : ""} menambah unit binaan pada unggahan berikutnya agar sebaran mendekati kapasitas regional, bukan kebiasaan pelaporan.`,
      });
    }
    if (pus) {
      candidates.push({
        score: 360 + Math.round((pus / total) * 100),
        tone: "sedang",
        title: "Ubah PUS dari label menjadi saluran pembiayaan",
        text: `${fmtNum(pus)} PUS (${shareLabel(pus, total)}) di ${cakupan} adalah stok yang bisa dihubungkan ke keuangan syariah, bukan sekadar komposisi identitas. Tanpa peta mana yang sudah dapat pembiayaan/halal, angka PUS tidak punya implikasi kebijakan. KPwDN memilah: (1) sudah linkage bank/BPRS/LKMS, (2) sertifikasi berjalan, (3) belum tersentuh. Celah (3) diisi pada ICK yang sudah ada — inclusion lewat instrumen lama, bukan skema baru.`,
      });
    }
    if (noTahun || stale.length) {
      const oldest = stale.length ? Math.min(...stale.map((row) => Number(row.tahun))) : now;
      candidates.push({
        score: 300 + Math.round((naTahunShare + staleShare) * 80),
        tone: naTahunShare + staleShare >= 0.25 ? "tinggi" : "sedang",
        title: "Pisahkan aliran fasilitasi dari stok yang mengendap",
        text: `${noTahun ? `${fmtNum(noTahun)} unit tanpa tahun fasilitasi (${shareLabel(noTahun, total)})` : ""}${noTahun && stale.length ? "; " : ""}${stale.length ? `${fmtNum(stale.length)} unit terakhir tercatat ${oldest}–${now - 3}` : ""}. Tanpa jejak waktu, rapat capaian mencampur flow (binaan baru) dengan stock (akumulasi lama), sehingga pertumbuhan terlihat lebih tinggi daripada ekspansi riil. PIC data mengisi tahun sesuai ICK; KPwDN terpadat memutakhirkan sampel 20–30 unit menua pada kunjungan rutin agar kuota tidak terserap ke usaha non-aktif.`,
      });
    }
    if (noKom && naKomShare >= 0.08) {
      candidates.push({
        score: 280 + Math.round(naKomShare * 80),
        tone: naKomShare >= 0.25 ? "tinggi" : "sedang",
        title: "Perbaiki klasifikasi agar RCA wilayah terbaca",
        text: `${fmtNum(noKom)} unit (${shareLabel(noKom, total)}) di ${cakupan} belum berkomoditas. Itu measurement error: keunggulan komparatif tidak bisa dihitung, sehingga alokasi ICK jatuh ke unit yang kebetulan lengkap datanya. KPwDN pengampu mengisi kolom komoditas pada kertas kerja yang sama — biaya rendah, agar ranking klaster mencerminkan struktur ekonomi, bukan kelengkapan Excel.`,
      });
    }
    if (topIck) {
      candidates.push({
        score: 240 + Math.round((topIck[1] / total) * 50),
        tone: "sedang",
        title: `Ambil skala ekonomi pada ICK ${topIck[0]}`,
        text: `${topIck[0]} sudah menjangkau ${fmtNum(topIck[1])} unit (${shareLabel(topIck[1], total)}) — instrumen dengan fixed cost tertebar. Satu protokol tindak lanjut (linkage pasar atau cek status) punya declining average cost; menambah jenis program menaikkan biaya koordinasi tanpa menaikkan skala. KPwDN pengampu menyamakan satu langkah pada portofolio yang sudah besar ini.`,
      });
    }
    candidates.sort((a, b) => b.score - a.score);

    const fallbacks = [
      {
        tone: "sedang",
        title: "Pakai BI PRAMESTI di rapat wilayah",
        text: `Pakai Ringkasan Eksekutif ${cakupan} (${fmtNum(total)} unit) sebagai bahan baku rapat: sebaran lima wilayah, pie komoditas, dan tiga tindakan ini dalam satu layar.`,
      },
      {
        tone: "sedang",
        title: "Tetapkan PIC data per KPwDN",
        text: "Satu orang per kantor bertanggung jawab atas kertas kerja Rekap All dan unggahan BI PRAMESTI setiap triwulan, supaya mutu kolom komoditas dan tahun tidak pecah lagi.",
      },
      {
        tone: "sedang",
        title: "Samakan format kertas kerja",
        text: "Kunci kolom No, Nama UMKM, Komoditas, ICK, Tahun Fasilitasi, dan Asal KPw agar unggahan berikutnya mengikuti pengelompokan yang sama.",
      },
    ];

    const naBits = [noKom && `${fmtNum(noKom)} komoditas N/A`, noTahun && `${fmtNum(noTahun)} tahun N/A`].filter(Boolean);
    const horizons = [
      {
        horizon: "pendek",
        label: "Jangka pendek",
        window: "0–6 bulan",
        title: naBits.length ? "Rapikan lubang data" : stale.length ? "Segarkan stok yang menua" : "Kunci bahan rapat",
        text: naBits.length
          ? `Isi ${naBits.join(" dan ")} lewat edaran ke KPwDN pengampu, lalu unggah ulang Rekap All. Tanpa klasifikasi itu, diagnosis klaster dan stok-aliran fasilitasi bias pada rapat berikutnya.`
          : stale.length
            ? `${fmtNum(stale.length)} unit menua. KPwDN terpadat (${topKpw ? shortOffice(topKpw[0]) : "pengampu"}) memutakhirkan sampel 20–30 unit pada kunjungan rutin semester ini agar kuota ICK tidak terserap ke usaha non-aktif.`
            : `Pakai ${fmtNum(total)} unit di ${cakupan} sebagai baseline rapat bulan ini: kunci satu klaster unggulan dan satu PIC data per KPwDN.`,
      },
      {
        horizon: "menengah",
        label: "Jangka menengah",
        window: "6–24 bulan",
        title: topKom ? `Replikasi klaster ${topKom[0]}` : "Ratakan sebaran wilayah",
        text: topKom
          ? `Setelah lembar rujukan ${topKom[0]} tersedia, terapkan paket yang sama di dua KPwDN lain untuk menangkap economies of scale di rantai pasok itu. ${jarang && padat && jarang.n < padat.n ? `KPwDN di ${jarang.name} menambah unggahan unggulan pada dua siklus kertas kerja.` : "KPwDN dengan unggahan tipis menambah unit binaan pada dua siklus kertas kerja."}`
          : `Ratakan sebaran lima wilayah: ${padat.name} (${fmtNum(padat.n)}) menjadi rujukan tata kelola data, ${jarang.name} (${fmtNum(jarang.n)}) menjadi sasaran perluasan input agar alokasi tidak mengikuti geografi pelaporan semata.`,
      },
      {
        horizon: "panjang",
        label: "Jangka panjang",
        window: "2–5 tahun",
        title: "BI PRAMESTI sebagai alat kinerja wilayah",
        text: `Lima wilayah tanpa kantong kosong, satu komoditas unggulan per wilayah sebagai revealed specialization. ${fmtNum(total)} unit saat ini menjadi baseline; capaian ICK dan mutu data (komoditas serta tahun terisi) dilaporkan lewat BI PRAMESTI setiap tahun ke rapat Direktorat Regional.`,
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

    const { priority, horizons } = applySaranOverrides(buildActions(list));
    const saranMeta = document.getElementById("saran-meta");
    if (saranMeta) {
      saranMeta.textContent = list.length
        ? "Tiga langkah paling material bagi kinerja regional, berdasarkan sebaran, konsentrasi, dan mutu data. Klik kotak untuk mengubah teks."
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

  async function persistCapaian(data) {
    const next = recomputeCapaianTotals(JSON.parse(JSON.stringify(data)));
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
    return true;
  }

  function capaianOfficeKey(office) {
    return accOfficeLabel(office).toLowerCase();
  }

  function decorateCapaianImport(parsed) {
    let offices = parsed.offices || [];
    if (isKpwScoped()) {
      const selfKey = String(state.kpwSelfKey || "").trim().toLowerCase();
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
    const selfKey = isKpwScoped() ? String(state.kpwSelfKey || "").trim().toLowerCase() : "";
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
    if (addBtn && isKpwScoped()) {
      addBtn.textContent = kpwSelfOffice() ? "Perbarui data saya" : "Tambah data saya";
    } else if (addBtn) {
      addBtn.textContent = "Tambah data";
    }

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

  function setView(view) {
    if (!["beranda", "ringkasan", "capaian", "database"].includes(view)) return;
    if (!canView(view)) {
      flash("Akun ini tidak memiliki akses ke menu tersebut.", true);
      return;
    }
    state.view = view;
    if (view !== "ringkasan") state.rapat = false;
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
    renderFilters();
    renderStats(list);
    renderPantau(list);
    renderCapaian();
    renderCharts(list);
    renderTable(list);
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
    const replaceHint = can("canReplaceAllData")
      ? "Setelah data di kertas kerja diubah, unduh berkasnya lalu unggah di sini (Ganti seluruh data)."
      : "Pilih KPwDN pengampu Anda, lalu unggah Excel. Hanya baris kantor itu yang diperbarui; data KPwDN lain tidak berubah.";
    const picker = scoped
      ? `<label class="capaian-import-self">KPwDN pengampu saya
            <select id="db-import-self" required>${kpwOfficeOptionsHtml(self)}</select>
          </label>`
      : "";
    const dropDisabled = scoped && !self;
    return `
      <div class="modal-back" data-close="1">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="kicker">Tambah dari berkas</div>
          <h2>Unggah Excel</h2>
          ${picker}
          <p class="import-note">
            Sumber resmi: kertas kerja SharePoint <i>Database Rekap All UMKM 11.811</i>.
            BI PRAMESTI tidak dapat menarik file itu otomatis karena tautannya privat dan meminta login Bank Indonesia.
            ${replaceHint}
            Kolom yang dikenali: No, Nama UMKM, Komoditas, ICK (fasilitas), Tahun Fasilitasi, dan Asal KPw.
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
    const note = can("canReplaceAllData")
      ? "Unggah kertas kerja <b>Rekap Capaian ICK DR KPwDN</b> yang memuat Tabel 2026 (Acc) dan Tabel 2026 (Ind). Sel Target 2026 (Ind) yang kosong dihitung 0. Target memakai Acc Revised bila kolom itu terisi; selain itu Acc."
      : "Pilih KPwDN pengampu Anda, lalu unggah Excel template. Hanya baris kantor itu yang diperbarui; data KPwDN lain tidak berubah.";
    const picker = scoped
      ? `<label class="capaian-import-self">KPwDN pengampu saya
            <select id="capaian-import-self" required>${kpwOfficeOptionsHtml(self)}</select>
          </label>`
      : "";
    const dropDisabled = scoped && !self;
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
                scoped && !isEdit
                  ? `<select name="kpwdn" id="capaian-form-self" required>${kpwOfficeOptionsHtml(row.kpwdn || selfKey)}</select>`
                  : `<input name="kpwdn" required value="${escapeHtml(row.kpwdn || "")}" placeholder="Prov. Aceh"${scoped ? " readonly" : ""}>`
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
      const office =
        state.modal.type === "capaian-edit" ? capaianOfficeByNo(state.modal.no) : null;
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
      const bundle = applySaranOverrides(buildActions(filtered()));
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
                  ? `<select name="kpwdn" id="db-form-self" required>${kpwOfficeOptionsHtml(row.kpwdn || selfKey)}</select>`
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
        `Platform Regional MSME-Shariah Indonesia · ${new Date().toLocaleDateString("id-ID")}`,
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

  function pdfFit(pdf, text, maxW) {
    let t = String(text || "");
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
    if (isKpwScoped() && !state.kpwSelfKey) {
      flash("Pilih KPwDN pengampu Anda terlebih dahulu.", true);
    }
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
  document.getElementById("btn-capaian-add").addEventListener("click", () => {
    if (!can("canEdit")) {
      flash("Akun ini hanya dapat melihat data.", true);
      return;
    }
    if (isKpwScoped()) {
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
      const brief = [...document.querySelectorAll("#briefing-text .briefing-block")]
        .map((block) => {
          const title = block.querySelector(".briefing-head")?.textContent.trim() || "";
          const items = [...block.querySelectorAll("li")].map((li) => `• ${li.textContent.trim()}`);
          return [title, ...items].filter(Boolean).join("\n");
        })
        .filter(Boolean)
        .join("\n\n");
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
        brief,
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
    if (e.target.id === "db-import-self") {
      saveKpwSelfKey(e.target.value);
      applyRoleChrome();
      if (state.modal?.type === "import" && !state.importDraft) renderModal();
      return;
    }
    if (e.target.id === "db-form-self") {
      saveKpwSelfKey(e.target.value);
      applyRoleChrome();
      return;
    }
    if (e.target.id === "capaian-import-self") {
      saveKpwSelfKey(e.target.value);
      applyRoleChrome();
      if (state.modal?.type === "capaian-import" && !state.capaianDraft) renderModal();
      return;
    }
    if (e.target.id === "capaian-form-self") {
      saveKpwSelfKey(e.target.value);
      const mine = kpwSelfOffice();
      if (mine) {
        state.modal = { type: "capaian-edit", no: mine.no };
        renderModal();
      }
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
      persistCapaian(data).then((ok) => {
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
      persistCapaian(state.capaianDraft).then((ok) => {
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
      const data = ickCapaian();
      data.offices = (data.offices || []).filter((office) => Number(office.no) !== Number(no));
      persistCapaian(data).then((ok) => {
        if (!ok) return;
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
      applyImportedRows(state.importDraft.rows, false);
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
        if (!requireKpwSelf("capaian-form-self")) return;
      }
      const data = ickCapaian();
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
        persistCapaian(data).then((ok) => {
          if (!ok) return;
          flash(`Data ICK ${state.kpwSelfKey} disimpan.`);
          state.modal = { type: "capaian-office", no: existingSelf.no };
          renderCapaian();
          renderModal();
        });
        return;
      }
      if (isKpwScoped() && state.modal?.type === "capaian-edit") {
        const target = capaianOfficeByNo(state.modal.no);
        if (!officeIsKpwSelf(target)) {
          flash("Anda hanya dapat mengubah data ICK KPwDN pengampu Anda.", true);
          return;
        }
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
      persistCapaian(data).then((ok) => {
        if (!ok) return;
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
      JSON.stringify({ user: match.user, name: match.name, role: match.role, at: Date.now() })
    );
    state.view = ROLE_ACCESS[match.role]?.views?.[0] || "beranda";
    showApp();
  });
  document.getElementById("app-shell").addEventListener("click", (e) => {
    const go = e.target.closest("[data-view]");
    if (!go) return;
    const view = go.getAttribute("data-view");
    if (!["beranda", "ringkasan", "capaian", "database"].includes(view)) return;
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
      title: "BI perluas MDR QRIS 0% untuk seluruh merchant mulai Oktober 2026",
      url: "https://money.kompas.com/read/2026/08/17/095952526/bi-gratiskan-biaya-transaksi-qris-untuk-seluruh-pedagang-hingga-rp-500000-per",
    },
    {
      title: "MDR QRIS nol persen: manfaat bagi UMKM dan konsumen",
      url: "https://money.kompas.com/read/2026/08/17/135017126/apa-itu-mdr-qris-nol-persen-ini-manfaatnya-bagi-umkm-dan-konsumen",
    },
    {
      title: "Transaksi QRIS tumbuh 82,42% seiring digitalisasi UMKM",
      url: "https://www.liputan6.com/bisnis/read/8273255/transaksi-qris-tumbuh-8242-2-faktor-ini-jadi-penopang",
    },
    {
      title: "Mulai 1 Oktober, transaksi QRIS hingga Rp500 ribu untuk usaha mikro bebas MDR",
      url: "https://www.kompas.tv/ekonomi/686033/mulai-1-oktober-transaksi-qris-hingga-rp500-ribu-untuk-umkm-mikro-bebas-mdr",
    },
    {
      title: "BI perkuat akseptasi pembayaran digital untuk pelaku usaha",
      url: "https://www.bi.go.id/id/publikasi/ruang-media/news-release/Default.aspx",
    },
  ];
  let tickerRefreshTimer = null;

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

  function paintTicker(items) {
    const list = (items || [])
      .map((it) => ({
        title: String(it.title || "").replace(/\s+/g, " ").trim(),
        url: normalizeNewsUrl(it.url),
      }))
      .filter((it) => it.title && it.url)
      .slice(0, 24);
    const use = list.length ? list : TICKER_SEED;
    const html = use
      .map(
        (it) =>
          `<a class="ticker-item" href="${escapeHtml(it.url)}" target="_blank" rel="noopener noreferrer"><b>${escapeHtml(
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
        return { title, url: link };
      })
      .filter((it) => it.title && /^https?:\/\//i.test(it.url || ""));
  }

  async function fetchUmkmNewsFeed() {
    const q = encodeURIComponent(
      '(UMKM OR "usaha mikro" OR "usaha kecil" OR QRIS OR "ekonomi syariah" OR PUS OR pesantren) Indonesia'
    );
    const rssUrl = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`;
    const proxies = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    ];
    for (const make of proxies) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(make(rssUrl), { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) continue;
        const text = await res.text();
        const items = parseRssNews(text);
        if (items.length) return items;
      } catch (_) {
        /* try next proxy */
      }
    }
    return null;
  }

  async function refreshNewsTicker() {
    paintTicker(TICKER_SEED);
    const live = await fetchUmkmNewsFeed();
    if (!live || !live.length) return;
    const seen = new Set();
    const merged = [...live, ...TICKER_SEED].filter((it) => {
      const key = String(it.title || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    paintTicker(merged);
  }

  function startNewsTicker() {
    refreshNewsTicker();
    if (tickerRefreshTimer) clearInterval(tickerRefreshTimer);
    tickerRefreshTimer = setInterval(refreshNewsTicker, 30 * 60 * 1000);
  }

  Promise.all([loadRecords().catch(() => []), loadCapaian().catch(() => null)])
    .then(([list]) => {
      records = list;
      if (currentSession()) showApp();
      else showLogin();
    });
})();
