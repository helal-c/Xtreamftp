// Xtreme'x portal frontend. Catalog data is loaded from assets/js/catalog.js.
// Rewritten in plain ES5 (no let/const, arrow functions, template literals,
// nullish coalescing, NodeList.forEach, Array.from, etc.) so it keeps working
// on old / Smart TV browsers with outdated JS engines. Functionality is
// identical to the previous version.

(function () {
    'use strict';

    var categories = Array.isArray(window.KSB_CATEGORIES) ? window.KSB_CATEGORIES : [];

    function escapeHtml(value) {
        var str = (value === null || value === undefined) ? '' : String(value);
        return str.replace(/[&<>'"]/g, function (ch) {
            var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' };
            return map[ch];
        });
    }

    function toArray(nodeList) {
        var arr = [];
        for (var i = 0; i < nodeList.length; i++) { arr.push(nodeList[i]); }
        return arr;
    }

    function forEachNode(nodeList, fn) {
        for (var i = 0; i < nodeList.length; i++) { fn(nodeList[i], i); }
    }

    function toggleClass(el, cls, force) {
        if (!el) { return; }
        if (force) { el.classList.add(cls); } else { el.classList.remove(cls); }
    }

    function safeStorage(storage) {
        return {
            get: function (key) {
                try { return storage && storage.getItem ? storage.getItem(key) : null; } catch (e) { return null; }
            },
            set: function (key, value) {
                try { if (storage && storage.setItem) { storage.setItem(key, value); } } catch (e) { /* ignore */ }
            }
        };
    }
    function browserStorage(name) {
        try { return window[name]; } catch (e) { return null; }
    }
    var localSafe = safeStorage(browserStorage('localStorage'));
    var sessionSafe = safeStorage(browserStorage('sessionStorage'));

    function safeUrl(value) {
        var url = String(value || '').replace(/^\s+|\s+$/g, '');
        if (/^https?:\/\//i.test(url)) { return url; }
        if (/^(?:\.\/)?[a-z0-9][a-z0-9._/() -]*$/i.test(url) && url.indexOf('..') === -1) { return url; }
        return '#';
    }

    function buildCards(sites) {
        var html = '';
        for (var i = 0; i < sites.length; i++) {
            var site = sites[i];
            var cleanUrl = safeUrl(site.url);
            var cleanDirectUrl = safeUrl(site.direct_url || site.url);
            var url = escapeHtml(cleanUrl);
            var directUrl = escapeHtml(cleanDirectUrl);
            var name = escapeHtml(site.name);
            var icon = escapeHtml(site.icon || 'globe');
            var badgeText = String(site.badge || '').trim();
            var badgeLabel = badgeText || (site.is_new ? 'NEW' : '');
            var badge = badgeLabel ? '<span class="new-badge" style="margin-left:.5rem;">' + escapeHtml(badgeLabel) + '</span>' : '';

            // Note: the copy URL is stored in a data-* attribute (read as plain
            // text via getAttribute) rather than an inline onclick="" handler.
            // Inline event-handler attributes are HTML-entity-decoded by the
            // browser before being run as JS, so embedding untrusted data
            // (e.g. a saved link URL containing a quote character) inside
            // onclick="" can break out of the JS string and execute arbitrary
            // script. Using a data attribute avoids that risk entirely.
            html +=
                '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="site-card" data-name="' + name.toLowerCase() + '" data-url="' + directUrl + '">' +
                    '<button type="button" class="card-copy" title="Copy URL" aria-label="Copy ' + name + ' URL" data-copy-url="' + directUrl + '"><i class="fas fa-copy"></i></button>' +
                    '<div class="card-icon"><i data-lucide="' + icon + '" style="width:20px;height:20px;"></i></div>' +
                    '<span class="card-name">' + name + badge + '</span>' +
                '</a>';
        }
        return html;
    }

    function buildSection(category) {
        var title = escapeHtml(category.name);
        var newBadge = category.is_new ? '<span class="new-badge">NEW</span>' : '';
        var sites = Array.isArray(category.links) ? category.links : [];
        return (
            '<section class="category-section" data-category="' + title.toLowerCase() + '">' +
                '<div class="category-header">' +
                    '<div class="category-bar"></div>' +
                    '<h2 class="category-title">' + title + '</h2>' + newBadge +
                    '<span class="category-count font-mono">' + sites.length + '</span>' +
                '</div>' +
                '<div class="cards-grid">' + buildCards(sites) + '</div>' +
            '</section>'
        );
    }

    var mainContent = document.getElementById('main-content');
    if (mainContent) {
        var sectionsHtml = '';
        for (var ci = 0; ci < categories.length; ci++) {
            sectionsHtml += buildSection(categories[ci]);
        }
        mainContent.innerHTML = categories.length ? sectionsHtml :
            '<p class="font-bengali" style="text-align:center;color:var(--text-secondary);padding:3rem 0;">কোনো লিংক এখনো যোগ করা হয়নি।</p>';
    }
    if (mainContent) {
        forEachNode(mainContent.querySelectorAll('.card-copy'), function (btn) {
            btn.addEventListener('click', function (e) {
                copyUrl(e, btn, btn.getAttribute('data-copy-url') || '');
            });
        });
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) { lucide.createIcons(); }
    var footerYearEl = document.getElementById('footerYear');
    if (footerYearEl) { footerYearEl.textContent = String(new Date().getFullYear()); }

    var searchInput = document.getElementById('searchInput');
    var searchClear = document.getElementById('searchClear');
    var noResults = document.getElementById('noResults');

    function normalize(str) {
        return String(str || '').replace(/\s+/g, '').toLowerCase();
    }

    function runSearch() {
        var q = searchInput.value.trim().toLowerCase();
        toggleClass(searchClear, 'visible', q.length > 0);
        var anyVisible = false;
        var nq = normalize(q);

        forEachNode(document.querySelectorAll('.category-section'), function (section) {
            var sectionHasVisible = false;
            forEachNode(section.querySelectorAll('.site-card'), function (card) {
                var cardName = normalize(card.getAttribute('data-name') || '');
                var cardUrl = normalize(card.getAttribute('data-url') || '');
                var show = !q || cardName.indexOf(nq) !== -1 || cardUrl.indexOf(nq) !== -1;
                toggleClass(card, 'hidden', !show);
                if (show) { sectionHasVisible = true; }
            });
            toggleClass(section, 'hidden', !sectionHasVisible);
            if (sectionHasVisible) { anyVisible = true; }
        });

        toggleClass(noResults, 'visible', !anyVisible && q.length > 0);
    }

    if (searchInput) {
        searchInput.addEventListener('input', runSearch);
    }
    if (searchClear && searchInput) {
        searchClear.addEventListener('click', function () {
            searchInput.value = '';
            runSearch();
            searchInput.focus();
        });
    }

    function showToast(msg) {
        var t = document.getElementById('toast');
        if (!t) { return; }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, 2000);
    }

    // No longer needs to be exposed globally — it's wired up via
    // addEventListener on the copy buttons after they're rendered.
    function copyUrl(e, btn, url) {
        e.preventDefault();
        e.stopPropagation();

        function done() {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i>';
            showToast('লিংক কপি হয়েছে !');
            setTimeout(function () {
                btn.classList.remove('copied');
                btn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1800);
        }
        function fail() { showToast('Copy failed'); }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, fail);
            return;
        }

        // Fallback for browsers without the Clipboard API (common on old TVs).
        try {
            var temp = document.createElement('textarea');
            temp.value = url;
            temp.style.position = 'fixed';
            temp.style.opacity = '0';
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            var ok = document.execCommand && document.execCommand('copy');
            document.body.removeChild(temp);
            if (ok) { done(); } else { fail(); }
        } catch (err) {
            fail();
        }
    }

    var themeToggle = document.getElementById('customThemeToggle');
    var themeIcon = document.getElementById('customThemeIcon');
    var currentTheme = localSafe.get('xtreme_theme') || 'dark';

    function applyTheme(theme) {
        var isLight = theme === 'light';
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
        toggleClass(document.body, 'light-theme', isLight);
        toggleClass(document.body, 'dark-theme', !isLight);
        toggleClass(document.body, 'dark', !isLight);
        if (themeIcon) { themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'; }
        localSafe.set('xtreme_theme', theme);
        currentTheme = theme;
    }
    applyTheme(currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    var hamburger = document.getElementById('hamburger');
    var mobileDrawer = document.getElementById('mobileDrawer');
    var drawerOverlay = document.getElementById('drawerOverlay');
    var drawerClose = document.getElementById('drawerClose');

    function openDrawer() {
        if (mobileDrawer) { mobileDrawer.classList.add('open'); }
        if (drawerOverlay) { drawerOverlay.classList.add('open'); }
        if (mobileDrawer) { mobileDrawer.setAttribute('aria-hidden', 'false'); }
        if (hamburger) { hamburger.setAttribute('aria-expanded', 'true'); }
        document.body.style.overflow = 'hidden';
        if (drawerClose) { drawerClose.focus(); }
    }
    function closeDrawer() {
        if (mobileDrawer) { mobileDrawer.classList.remove('open'); }
        if (drawerOverlay) { drawerOverlay.classList.remove('open'); }
        if (mobileDrawer) { mobileDrawer.setAttribute('aria-hidden', 'true'); }
        if (hamburger) { hamburger.setAttribute('aria-expanded', 'false'); }
        document.body.style.overflow = '';
    }
    if (hamburger) { hamburger.addEventListener('click', openDrawer); }
    if (drawerClose) { drawerClose.addEventListener('click', closeDrawer); }
    if (drawerOverlay) { drawerOverlay.addEventListener('click', closeDrawer); }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) { closeDrawer(); }
    });

    var fabToggle = document.getElementById('fabToggle');
    var fabOptions = document.getElementById('fabOptions');
    if (fabToggle && fabOptions) {
        fabToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (fabOptions.classList.contains('active')) {
                fabOptions.classList.remove('active');
            } else {
                fabOptions.classList.add('active');
            }
        });
        document.addEventListener('click', function (e) {
            if (!fabOptions.contains(e.target) && e.target !== fabToggle) {
                fabOptions.classList.remove('active');
            }
        });
    }

    var scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', function () {
            toggleClass(scrollBtn, 'visible', window.scrollY > 150);
        });
        scrollBtn.addEventListener('click', function () {
            try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e) {
                window.scrollTo(0, 0);
            }
        });
    }

    function showModal(m) {
        m._previousFocus = document.activeElement;
        m.classList.add('show');
        m.setAttribute('aria-hidden', 'false');
        var closeButton = m.querySelector('.js-popup-close');
        if (closeButton) { closeButton.focus(); }
    }
    function hideModal(m) {
        m.classList.remove('show');
        m.setAttribute('aria-hidden', 'true');
        if (m._previousFocus && m._previousFocus.focus) { m._previousFocus.focus(); }
    }

    function popupStorageKey(popup) {
        var today = new Date().toISOString().split('T')[0];
        var frequency = popup.getAttribute('data-frequency') || 'daily';
        var popupId = popup.getAttribute('data-popup-id');
        if (frequency === 'daily') { return 'ksb_popup_daily_' + popupId + '_' + today; }
        if (frequency === 'once') { return 'ksb_popup_once_' + popupId; }
        if (frequency === 'session') { return 'ksb_popup_session_' + popupId; }
        return '';
    }
    function popupSeen(popup) {
        var key = popupStorageKey(popup);
        if (!key) { return false; }
        var store = popup.getAttribute('data-frequency') === 'session' ? sessionSafe : localSafe;
        return store.get(key) === 'seen';
    }
    function markPopupSeen(popup) {
        var key = popupStorageKey(popup);
        if (!key) { return; }
        var store = popup.getAttribute('data-frequency') === 'session' ? sessionSafe : localSafe;
        store.set(key, 'seen');
    }

    var dynamicPopups = toArray(document.querySelectorAll('.dynamic-popup'));
    var popupQueue = [];

    function showNextPopup(delayOverride) {
        if (!popupQueue.length) { return; }
        var nextPopup = popupQueue.shift();
        var delay = (typeof delayOverride === 'number') ? delayOverride : Number(nextPopup.getAttribute('data-delay') || 900);
        setTimeout(function () { showModal(nextPopup); }, delay);
    }

    window.addEventListener('load', function () {
        var queue = [];
        for (var i = 0; i < dynamicPopups.length; i++) {
            if (!popupSeen(dynamicPopups[i])) { queue.push(dynamicPopups[i]); }
        }
        popupQueue = queue;
        showNextPopup();
    });

    forEachNode(dynamicPopups, function (popup) {
        function close() {
            markPopupSeen(popup);
            hideModal(popup);
            showNextPopup(250);
        }
        var closeBtn = popup.querySelector('.js-popup-close');
        if (closeBtn) { closeBtn.addEventListener('click', close); }
        forEachNode(popup.querySelectorAll('a.contact-btn'), function (link) {
            link.addEventListener('click', function () { markPopupSeen(popup); });
        });
        popup.addEventListener('click', function (e) {
            if (e.target === popup) { close(); }
        });
        popup.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) { close(); }
        });
    });

    var installBtn = document.getElementById('installAppBtn');
    var deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        deferredInstallPrompt = event;
        if (installBtn) { installBtn.hidden = false; }
    });
    if (installBtn) {
        installBtn.addEventListener('click', function () {
            if (!deferredInstallPrompt) { return; }
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(function () {
                deferredInstallPrompt = null;
                installBtn.hidden = true;
            });
        });
    }
    window.addEventListener('appinstalled', function () {
        deferredInstallPrompt = null;
        if (installBtn) { installBtn.hidden = true; }
        showToast('App installed successfully');
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            if (document.documentElement.getAttribute('data-pwa') === 'enabled') {
                navigator.serviceWorker.register('./sw.js')['catch'](function () {
                    showToast('Offline mode could not be enabled');
                });
            } else {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (var i = 0; i < registrations.length; i++) { registrations[i].unregister(); }
                })['catch'](function () {});
            }
        });
    }

})();
