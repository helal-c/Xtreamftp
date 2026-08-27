# Xtreme'x Communication Portal

Static BDIX, Live TV, FTP and app-download portal optimized for mobile browsers and Smart TVs.

## Update links

Edit `assets/js/catalog.js`. This is the production catalog used by `index.html`.
Every item should have a unique numeric `id`, a readable `name`, an `http://`, `https://` or local APK `url`, and a Lucide icon name.

## Deploy

Upload the contents of this folder to the web root. For Vercel, import the folder as a static project; `vercel.json` supplies security and service-worker headers. HTTPS is required for PWA installation.

After deployment, verify:

1. Search and every category card.
2. Light/dark theme and mobile menu.
3. Install prompt and one offline reload.
4. Internal BDIX links from a customer connection.
5. APK downloads and the hashes in `APK_SHA256SUMS.txt`.

## Important APK release note

The included APK files are signed with Android debug certificates; `live tv.apk` also uses a legacy SHA-1 certificate signature. They were preserved for compatibility, but they are not production release builds. Rebuild each app from its Android/Flutter source with a protected release keystore before broad public distribution. Keep that release key backed up because future updates must use the same signing identity.

## Project notes

- `index.html` is the primary production page.
- `design2.html` and `design3.html` are preserved design alternatives.
- `sw.js` caches only same-origin portal assets; external BDIX servers are never cached.
- The incomplete mirrored LibreSpeed test was removed. The portal links to the existing BDIX speed-test server instead.
- Large unused promotional source files and repository history are excluded from the release ZIP.
