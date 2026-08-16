self.addEventListener('install', function(event) {
    console.log('Xtream TV Service Worker Installed');
    self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
    // ব্রাউজারকে ইন্সটল পপআপ দেখানোর জন্য এই ফেচ ইভেন্টটি থাকা বাধ্যতামূলক
});