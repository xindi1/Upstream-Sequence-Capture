# Upstream Sequence Capture Tool

A standalone, phone-first capture and review app. App files can be public; entries stay in the browser on each device. There is no account, server storage, or automatic connection to Capability Lab. A fresh installation starts empty.

## Publish with GitHub Pages

1. Create a GitHub repository and upload the **contents of this folder** to the repository root: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, and both PNG icons. Do not upload your exported JSON backups.
2. In the repository, open **Settings → Pages**. Set **Build and deployment** to **Deploy from a branch**, choose the branch containing these files, and choose **/(root)**. Save.
3. Open the HTTPS site URL shown on that page. On iPhone, use Safari’s **Share → Add to Home Screen**. On Android, use the browser’s **Install app** or **Add to Home screen** option.
4. Open the installed app once while online to cache the app files. It can then open offline. Your entries remain on that phone; installing on another device starts with separate empty storage.

No personal case study is embedded in the source. GitHub Pages may publish the app code publicly even if its repository is private. Keep personal exports outside GitHub.

## Back up and restore

Under **Your data**, choose **Export all data** to download a JSON backup. Store it privately. To move records to the installed phone app, open **Your data → Choose backup file**, select an Upstream JSON export, review the moment counts, then choose **Replace and restore**. Restore replaces all current local records; export the current records first if you want to keep them. The file is validated before replacement.

The **Later review** summary is a separate, selective text export for manual use with Capability Lab. It is not a full backup and cannot be imported as one.

Browser storage can be cleared by the user or browser. Use full exports for backups, especially before changing phones, browsers, or site addresses. A private browsing window is not suitable for durable entries.

## Local launch

Open `index.html` in a modern browser for a quick desktop preview. Installation and offline caching require HTTPS or localhost. To test those locally, serve this folder with a static file server, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` on the same computer.
