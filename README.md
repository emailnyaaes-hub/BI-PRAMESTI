# BI PRAMESTI

**BI PRAMESTI** (*Platform Regional MSME-Shariah Indonesia*) is a standalone dashboard for monitoring MSME and Pelaku Usaha Syariah (PUS) profiles under Bank Indonesia regional offices.

## How to run

Open `index.html` in a browser, or start a static server:

```bash
ruby -run -e httpd . -p 8767
```

Then open [http://127.0.0.1:8767/](http://127.0.0.1:8767/).

Data is stored in the browser (localStorage / IndexedDB).

## Login roles

| Role | Username | Password | Access |
|------|----------|----------|--------|
| User | `user` | `lihat2026` | Beranda + Database (view only) |
| Kantor Perwakilan | `kpw` | `kpw2026` | Beranda + Capaian ICK + Database; edit, download templates, upload Excel data |
| Administrator | `admin` | `padel2026` | All features; upload templates and Excel data |
