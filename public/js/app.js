/* ==========================================================================
   PLN MEDIA CENTER - FRONTEND CONTROLLER (VANILLA JS)
   ========================================================================== */

// Global State
let schedules = [];
let videos = [];
let currentPlayingScheduleId = null;
let editingScheduleId = null; // ID jadwal yang sedang diedit
let isActivated = false;
let clockTimer = null;
let schedulerTimer = null;

// Playlist Playback State
let selectedPlaylist = []; // Playlist untuk form tambah jadwal
let currentPlayingPlaylist = []; // Playlist yang sedang dimainkan
let currentPlaylistIndex = 0; // Indeks berkas media aktif

// DOM Elements
const elements = {
    activationOverlay: document.getElementById('activation-overlay'),
    btnActivate: document.getElementById('btn-activate'),

    liveDate: document.getElementById('live-date'),
    liveTime: document.getElementById('live-time'),

    videoPlayer: document.getElementById('main-video-player'),
    standbyScreen: document.getElementById('standby-screen'),
    standbyMessage: document.getElementById('standby-message'),
    playerBadge: document.getElementById('player-badge'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    videoOverlayInfo: document.getElementById('video-overlay-info'),
    overlayVideoTitle: document.getElementById('overlay-video-title'),
    overlayTimeProgress: document.getElementById('overlay-time-progress'),
    overlayScheduleTime: document.getElementById('overlay-schedule-time'),

    btnMuteToggle: document.getElementById('btn-mute-toggle'),
    iconMute: document.getElementById('icon-mute'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnPlayPauseToggle: document.getElementById('btn-play-pause-toggle'),
    iconPlayPause: document.getElementById('icon-play-pause'),
    btnStopMedia: document.getElementById('btn-stop-media'),
    btnNextMedia: document.getElementById('btn-next-media'),

    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    formAddSchedule: document.getElementById('form-add-schedule'),
    scheduleFormTitle: document.getElementById('schedule-form-title'),
    btnSubmitScheduleText: document.getElementById('btn-submit-schedule-text'),
    btnCancelEditSchedule: document.getElementById('btn-cancel-edit-schedule'),
    scheduleTimeFieldsRow: document.getElementById('schedule-time-fields-row'),
    scheduleVideoSelect: document.getElementById('schedule-video'),
    typeOnceRadio: document.getElementById('type-once'),
    typeRecurringRadio: document.getElementById('type-recurring'),
    groupTypeOnce: document.getElementById('group-type-once'),
    groupTypeRecurring: document.getElementById('group-type-recurring'),
    scheduleDateInput: document.getElementById('schedule-date'),
    scheduleStartTime: document.getElementById('schedule-start-time'),
    scheduleStartHour: document.getElementById('schedule-start-hour'),
    scheduleStartMinute: document.getElementById('schedule-start-minute'),
    scheduleLoopCheckbox: document.getElementById('schedule-loop'),

    schedulesList: document.getElementById('schedules-list'),
    scheduleCountBadge: document.getElementById('schedule-count-badge'),

    uploadZone: document.getElementById('upload-zone'),
    fileInput: document.getElementById('file-input'),
    uploadProgressContainer: document.getElementById('upload-progress-container'),
    uploadFilename: document.getElementById('upload-filename'),
    uploadPercent: document.getElementById('upload-percent'),
    uploadProgressFill: document.getElementById('upload-progress-fill'),
    videoLibraryList: document.getElementById('video-library-list'),
    videoCountBadge: document.getElementById('video-count-badge'),

    logsList: document.getElementById('logs-list'),
    btnClearLogsUi: document.getElementById('btn-clear-logs-ui'),

    toastContainer: document.getElementById('toast-container'),
    nextCountdownBox: document.getElementById('next-countdown-box'),
    nextVideoTitle: document.getElementById('next-video-title'),
    nextVideoTime: document.getElementById('next-video-time'),
    statusIndicatorBox: document.getElementById('status-indicator-box'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    btnStopSystem: document.getElementById('btn-stop-system'),

    audioVisualizer: document.getElementById('audio-visualizer'),
    audioTrackTitle: document.getElementById('audio-track-title'),
    audioDiscVinyl: document.getElementById('audio-disc-vinyl'),
    audioEqualizer: document.getElementById('audio-equalizer'),

    confirmModal: document.getElementById('confirm-modal'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmOk: document.getElementById('btn-confirm-ok'),

    promptModal: document.getElementById('prompt-modal'),
    promptModalTitle: document.getElementById('prompt-modal-title'),
    promptModalMessage: document.getElementById('prompt-modal-message'),
    promptModalInput: document.getElementById('prompt-modal-input'),
    btnPromptCancel: document.getElementById('btn-prompt-cancel'),
    btnPromptOk: document.getElementById('btn-prompt-ok'),

    playlistPreviewGroup: document.getElementById('playlist-preview-group'),
    playlistPreviewList: document.getElementById('playlist-preview-list'),
    btnAddToPlaylist: document.getElementById('btn-add-to-playlist'),

    // Modal: Tambah Slot Jam
    addSlotModal: document.getElementById('add-slot-modal'),
    addSlotModalSubtitle: document.getElementById('add-slot-modal-subtitle'),
    addSlotTypeOnce: document.getElementById('add-slot-type-once'),
    addSlotTypeRecurring: document.getElementById('add-slot-type-recurring'),
    addSlotGroupOnce: document.getElementById('add-slot-group-once'),
    addSlotGroupRecurring: document.getElementById('add-slot-group-recurring'),
    addSlotDate: document.getElementById('add-slot-date'),
    addSlotHour: document.getElementById('add-slot-hour'),
    addSlotMinute: document.getElementById('add-slot-minute'),
    btnAddSlotCancel: document.getElementById('btn-add-slot-cancel'),
    btnAddSlotOk: document.getElementById('btn-add-slot-ok'),

    // Modal: Edit Playlist
    editPlaylistModal: document.getElementById('edit-playlist-modal'),
    editPlaylistSubtitle: document.getElementById('edit-playlist-subtitle'),
    editPlaylistVideoSelect: document.getElementById('edit-playlist-video-select'),
    btnEditPlaylistAdd: document.getElementById('btn-edit-playlist-add'),
    editPlaylistPreviewGroup: document.getElementById('edit-playlist-preview-group'),
    editPlaylistPreviewList: document.getElementById('edit-playlist-preview-list'),
    editPlaylistLoop: document.getElementById('edit-playlist-loop'),
    btnEditPlaylistCancel: document.getElementById('btn-edit-playlist-cancel'),
    btnEditPlaylistOk: document.getElementById('btn-edit-playlist-ok')
};

// SVG Icons Constants for dynamically generated content
const ICONS = {
    trash: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`,
    video: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24" width="20" height="20" style="color:var(--secondary);"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/></svg>`,
    pencil: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
};

/* ==========================================================================
   INISIALISASI & SETUP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Set minimal date input ke hari ini
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    elements.scheduleDateInput.min = `${yyyy}-${mm}-${dd}`;
    elements.scheduleDateInput.value = `${yyyy}-${mm}-${dd}`;

    initClock();
    initTabs();
    initUploadZone();
    initVideoPlayerControls();
    initPlaylistFormActions();
    initAddSlotModal();
    initEditPlaylistModal();
    initMainFormTimeDropdowns();

    // Batal Edit Jadwal Listener
    elements.btnCancelEditSchedule.addEventListener('click', () => {
        cancelEditSchedule();
    });

    // Ambil Data Awal
    syncAllData();

    // Mulai Engine Scheduler (Setiap 1 detik)
    schedulerTimer = setInterval(runSchedulerEngine, 1000);
});

// Sinkronisasi data menyeluruh
async function syncAllData() {
    await Promise.all([
        fetchVideos(),
        fetchSchedules(),
        fetchLogs()
    ]);
}

// Menghilangkan awalan timestamp unix untuk display nama berkas
function getDisplayName(name) {
    if (!name) return '';
    return name.includes('_') ? name.substring(name.indexOf('_') + 1) : name;
}

/* ==========================================================================
   MODAL DIALOG KONFIRMASI CUSTOM
   ========================================================================== */

function showCustomConfirm(title, message, onOk) {
    elements.confirmModalTitle.textContent = title;
    elements.confirmModalMessage.textContent = message;
    elements.confirmModal.style.display = 'flex';

    // Clone element untuk membuang listener event sebelumnya secara instan
    const newCancel = elements.btnConfirmCancel.cloneNode(true);
    const newOk = elements.btnConfirmOk.cloneNode(true);
    elements.btnConfirmCancel.parentNode.replaceChild(newCancel, elements.btnConfirmCancel);
    elements.btnConfirmOk.parentNode.replaceChild(newOk, elements.btnConfirmOk);

    elements.btnConfirmCancel = newCancel;
    elements.btnConfirmOk = newOk;

    // Enter key support for Confirm OK
    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            elements.confirmModal.style.display = 'none';
            onOk();
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'Escape') {
            elements.confirmModal.style.display = 'none';
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);

    elements.btnConfirmCancel.addEventListener('click', () => {
        elements.confirmModal.style.display = 'none';
        document.removeEventListener('keydown', handleKeydown);
    });

    elements.btnConfirmOk.addEventListener('click', () => {
        elements.confirmModal.style.display = 'none';
        onOk();
        document.removeEventListener('keydown', handleKeydown);
    });
}

function showCustomPrompt(title, message, defaultValue, onOk) {
    elements.promptModalTitle.textContent = title;
    elements.promptModalMessage.textContent = message;
    elements.promptModalInput.value = defaultValue;
    elements.promptModal.style.display = 'flex';

    const newCancel = elements.btnPromptCancel.cloneNode(true);
    const newOk = elements.btnPromptOk.cloneNode(true);
    elements.btnPromptCancel.parentNode.replaceChild(newCancel, elements.btnPromptCancel);
    elements.btnPromptOk.parentNode.replaceChild(newOk, elements.btnPromptOk);

    elements.btnPromptCancel = newCancel;
    elements.btnPromptOk = newOk;

    setTimeout(() => {
        elements.promptModalInput.focus();
        elements.promptModalInput.select();
    }, 100);

    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            const value = elements.promptModalInput.value.trim();
            if (value) {
                elements.promptModal.style.display = 'none';
                onOk(value);
                document.removeEventListener('keydown', handleKeydown);
            }
        } else if (e.key === 'Escape') {
            elements.promptModal.style.display = 'none';
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);

    elements.btnPromptCancel.addEventListener('click', () => {
        elements.promptModal.style.display = 'none';
        document.removeEventListener('keydown', handleKeydown);
    });

    elements.btnPromptOk.addEventListener('click', () => {
        const value = elements.promptModalInput.value.trim();
        if (value) {
            elements.promptModal.style.display = 'none';
            onOk(value);
            document.removeEventListener('keydown', handleKeydown);
        } else {
            showToast('Input tidak boleh kosong!', 'warning');
        }
    });
}

/* ==========================================================================
   SISTEM NOTIFIKASI (TOAST)
   ========================================================================== */

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    else if (type === 'error') iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    else iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;

    toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close">&times;</button>
  `;

    elements.toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        dismissToast(toast);
    });

    setTimeout(() => {
        dismissToast(toast);
    }, 4000);
}

function dismissToast(toast) {
    toast.style.transform = 'translateX(100px)';
    toast.style.opacity = '0';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

/* ==========================================================================
   JAM & CLOCK SYSTEM
   ========================================================================== */

function initClock() {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();

    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const hari = namaHari[now.getDay()];
    const tanggal = String(now.getDate()).padStart(2, '0');
    const bulan = namaBulan[now.getMonth()];
    const tahun = now.getFullYear();

    elements.liveDate.textContent = `${hari}, ${tanggal} ${bulan} ${tahun}`;

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    elements.liveTime.textContent = `${jam}:${menit}:${detik}`;
}

/* ==========================================================================
   NAVIGATION & TABS
   ========================================================================== */

function initTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    elements.typeOnceRadio.addEventListener('change', toggleScheduleTypeFields);
    elements.typeRecurringRadio.addEventListener('change', toggleScheduleTypeFields);
}

function switchTab(tabId) {
    elements.tabBtns.forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    elements.tabPanes.forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

function toggleScheduleTypeFields() {
    if (elements.typeOnceRadio.checked) {
        elements.groupTypeOnce.style.display = 'block';
        elements.groupTypeRecurring.style.display = 'none';
    } else {
        elements.groupTypeOnce.style.display = 'none';
        elements.groupTypeRecurring.style.display = 'block';
    }
}

/* ==========================================================================
   FORM PLAYLIST BUILDER
   ========================================================================== */

function initPlaylistFormActions() {
    elements.btnAddToPlaylist.addEventListener('click', () => {
        const val = elements.scheduleVideoSelect.value;
        if (!val) {
            showToast('Pilih berkas media terlebih dahulu!', 'warning');
            return;
        }
        if (selectedPlaylist.includes(val)) {
            showToast('Media sudah ada di playlist.', 'warning');
            return;
        }
        selectedPlaylist.push(val);
        renderSelectedPlaylistPreview();
        elements.scheduleVideoSelect.value = ''; // reset selection
    });

    // Otomatis ubah isi playlist saat memilih berkas baru di dropdown (UX lebih mudah)
    elements.scheduleVideoSelect.addEventListener('change', () => {
        const val = elements.scheduleVideoSelect.value;
        if (val) {
            if (editingScheduleId !== null || selectedPlaylist.length <= 1) {
                selectedPlaylist = [val];
                renderSelectedPlaylistPreview();
            }
        }
    });
}

function renderSelectedPlaylistPreview() {
    if (selectedPlaylist.length === 0) {
        elements.playlistPreviewGroup.style.display = 'none';
        return;
    }

    elements.playlistPreviewGroup.style.display = 'block';
    elements.playlistPreviewList.innerHTML = '';

    selectedPlaylist.forEach((item, index) => {
        const card = document.createElement('div');
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.background = 'rgba(255, 255, 255, 0.03)';
        card.style.padding = '8px 12px';
        card.style.borderRadius = '6px';
        card.style.border = '1px solid var(--border-glass)';
        card.style.gap = '8px';

        const isMp3 = item.toLowerCase().endsWith('.mp3');
        const fileIcon = isMp3 ? ICONS.audio : ICONS.video;

        card.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex-grow: 1;">
        <span style="font-weight:600; color:var(--text-muted); font-size:11px;">${index + 1}.</span>
        <div style="flex-shrink:0; display:flex; align-items:center;">${fileIcon}</div>
        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px; color:var(--text-main);" title="${getDisplayName(item)}">${getDisplayName(item)}</span>
      </div>
      <button type="button" class="btn-text btn-remove-playlist-item" data-index="${index}" style="color:var(--danger); font-size:16px; font-weight:700; border:none; background:none; cursor:pointer; padding:2px 6px;">&times;</button>
    `;
        elements.playlistPreviewList.appendChild(card);
    });

    // Bind hapus item dari list preview
    elements.playlistPreviewList.querySelectorAll('.btn-remove-playlist-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            selectedPlaylist.splice(idx, 1);
            renderSelectedPlaylistPreview();
        });
    });
}

/* ==========================================================================
   API FETCH & SEND FUNCTIONS
   ========================================================================== */

// Ambil Daftar Media (MP3 & MP4)
async function fetchVideos() {
    try {
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error('Gagal mengambil daftar media.');
        videos = await res.json();

        // Render Dropdown Pilihan Media
        const currentSelected = elements.scheduleVideoSelect.value;
        elements.scheduleVideoSelect.innerHTML = `<option value="" disabled ${!currentSelected ? 'selected' : ''}>-- Pilih media dari server --</option>`;

        videos.forEach(vid => {
            const option = document.createElement('option');
            option.value = vid.name;
            option.textContent = getDisplayName(vid.name) + (vid.name.toLowerCase().endsWith('.mp3') ? ' (Audio)' : ' (Video)');
            elements.scheduleVideoSelect.appendChild(option);
        });

        if (currentSelected && videos.some(v => v.name === currentSelected)) {
            elements.scheduleVideoSelect.value = currentSelected;
        }

        renderVideoLibrary();
    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
    }
}

// Ambil Daftar Jadwal
async function fetchSchedules() {
    try {
        const res = await fetch('/api/schedules');
        if (!res.ok) throw new Error('Gagal mengambil daftar jadwal.');
        schedules = await res.json();
        renderSchedulesList();
    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
    }
}

// Ambil Logs
async function fetchLogs() {
    try {
        const res = await fetch('/api/logs');
        if (!res.ok) throw new Error('Gagal mengambil log aktivitas.');
        const logs = await res.json();
        renderLogsList(logs);
    } catch (err) {
        console.error(err);
    }
}

// Tambah Log Baru ke Server
async function postLog(event, videoName, details = '') {
    try {
        const res = await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, videoName: getDisplayName(videoName), details })
        });
        if (res.ok) {
            fetchLogs();
        }
    } catch (err) {
        console.error('Gagal memposting log ke server:', err);
    }
}

/* ==========================================================================
   RENDER UIs
   ========================================================================== */

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Render Video & Audio Library
function renderVideoLibrary() {
    elements.videoCountBadge.textContent = `${videos.length} Berkas`;

    if (videos.length === 0) {
        elements.videoLibraryList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H5V5h14v14z"/>
        </svg>
        <p>Tidak ada media di server.</p>
        <p class="sub">Silakan unggah video MP4 atau audio MP3 terlebih dahulu.</p>
      </div>
    `;
        return;
    }

    elements.videoLibraryList.innerHTML = '';
    videos.forEach(vid => {
        const card = document.createElement('div');
        card.className = 'video-item-card';

        const isMp3 = vid.name.toLowerCase().endsWith('.mp3');
        const fileIcon = isMp3 ? ICONS.audio : ICONS.video;

        card.innerHTML = `
      <div class="video-item-info-left" style="overflow:hidden; flex-grow:1;">
        <div class="video-item-icon" style="flex-shrink:0; display:flex; align-items:center;">${fileIcon}</div>
        <div class="video-item-details" style="overflow:hidden;">
          <span class="video-item-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${getDisplayName(vid.name)}">${getDisplayName(vid.name)}</span>
          <span class="video-item-size">${formatBytes(vid.size)} • ${isMp3 ? 'Audio MP3' : 'Video MP4'}</span>
        </div>
      </div>
      <div class="video-item-actions" style="flex-shrink:0;">
        <button class="btn-icon btn-play-now" title="Putar Langsung Sekarang" data-name="${vid.name}">
          ${ICONS.play}
        </button>
        <button class="btn-icon btn-rename-video" title="Ubah Nama Berkas" data-name="${vid.name}">
          ${ICONS.pencil}
        </button>
        <button class="btn-danger-icon btn-delete-video" title="Hapus Berkas" data-name="${vid.name}">
          ${ICONS.trash}
        </button>
      </div>
    `;
        elements.videoLibraryList.appendChild(card);
    });

    // Action listeners
    elements.videoLibraryList.querySelectorAll('.btn-play-now').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            playManualOverride(name);
        });
    });

    elements.videoLibraryList.querySelectorAll('.btn-rename-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const ext = name.substring(name.lastIndexOf('.'));
            const displayNameOnly = getDisplayName(name).replace(ext, '');
            showCustomPrompt('Ubah Nama Berkas', `Masukkan nama baru untuk "${getDisplayName(name)}":`, displayNameOnly, (newName) => {
                if (newName) {
                    renameVideo(name, newName);
                }
            });
        });
    });

    elements.videoLibraryList.querySelectorAll('.btn-delete-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            showCustomConfirm('Hapus Media', `Apakah Anda yakin ingin menghapus berkas "${getDisplayName(name)}" dari server?`, () => {
                deleteVideo(name);
            });
        });
    });
}

// Render Schedules List — 1 kartu per video, tampilkan semua slot waktu
function renderSchedulesList() {
    elements.scheduleCountBadge.textContent = `${schedules.length} Jadwal`;

    if (schedules.length === 0) {
        elements.schedulesList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
        <p>Belum ada jadwal yang dibuat.</p>
        <button class="btn btn-secondary btn-small" onclick="switchTab('tab-schedule')">Buat Sekarang</button>
      </div>
    `;
        return;
    }

    const shortDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    elements.schedulesList.innerHTML = '';
    schedules.forEach(sch => {
        const card = document.createElement('div');
        const isActive = currentPlayingScheduleId === sch.id;
        card.className = `schedule-item-card ${isActive ? 'active' : ''}`;

        // Susun nama media
        const mediaArr = sch.mediaList || [sch.videoName];
        const mediaDisplay = mediaArr.length === 1
            ? getDisplayName(mediaArr[0])
            : `Playlist (${mediaArr.length}): ` + mediaArr.map(getDisplayName).join(', ');
        const isMp3 = (mediaArr[0] || '').toLowerCase().endsWith('.mp3');
        const fileIcon = isMp3 ? ICONS.audio : ICONS.video;

        // Susun tampilan semua slot waktu secara detail
        const slots = sch.timeSlots || [];
        let slotsHtml = '';
        if (slots.length === 0) {
            slotsHtml = '<span class="schedule-time-range" style="color:var(--text-muted); font-size:11px;">Tidak ada slot waktu.</span>';
        } else {
            slots.forEach((slot, slotIdx) => {
                let dayLabel = '';
                if (slot.type === 'once') {
                    const p = slot.date.split('-');
                    dayLabel = `${ICONS.calendar} Sekali: ${p[2]}/${p[1]}/${p[0]}`;
                } else {
                    const sortedDays = (slot.days || []).map(Number).sort();
                    dayLabel = sortedDays.map(d => shortDays[d]).join(', ');
                }
                slotsHtml += `
          <div class="schedule-slot-row" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="slot-day-label" style="font-size:10px;">${dayLabel}</span>
              <span class="slot-times" style="font-size:10px;">${ICONS.clock} ${slot.startTime}</span>
            </div>
            <button type="button" class="btn-delete-slot" data-schedule-id="${sch.id}" data-slot-index="${slotIdx}" style="color:var(--danger); font-size:13px; font-weight:800; border:none; background:none; cursor:pointer; padding:1px 5px; display:inline-flex; align-items:center;" title="Hapus Slot Jam Ini">&times;</button>
          </div>`;
            });
        }

        card.innerHTML = `
      <div class="schedule-info-left" style="overflow:hidden; flex-grow:1; gap: 6px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="flex-shrink:0; display:flex; align-items:center;">${fileIcon}</div>
          <span class="schedule-video-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:14px; font-weight:600;" title="${mediaDisplay}">${mediaDisplay}</span>
          ${sch.loop ? '<span class="badge-tag" style="font-size:9px; background:var(--primary-glow); padding: 2px 6px; border-radius:3px; color:var(--primary); flex-shrink:0;">Loop</span>' : ''}
        </div>
        <div class="schedule-slots-container" style="display:flex; flex-direction:column; gap:4px; padding-top:4px; border-top: 1px solid var(--border-glass); margin-top:4px;">
          ${slotsHtml}
        </div>
      </div>
      <div class="schedule-actions" style="flex-shrink:0; align-self: flex-start; display:flex; gap:6px;">
        <button class="btn-icon btn-add-slot" title="Tambah Slot Jam" data-id="${sch.id}" style="color:var(--success); border-color: rgba(16,185,129,0.3);">
          ${ICONS.plus}
        </button>
        <button class="btn-icon btn-edit-schedule" title="Edit Playlist & Loop" data-id="${sch.id}">
          ${ICONS.pencil}
        </button>
        <button class="btn-danger-icon btn-delete-schedule" title="Hapus Jadwal" data-id="${sch.id}">
          ${ICONS.trash}
        </button>
      </div>
    `;
        elements.schedulesList.appendChild(card);
    });

    // Action listeners
    elements.schedulesList.querySelectorAll('.btn-add-slot').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            showAddSlotModal(id);
        });
    });

    elements.schedulesList.querySelectorAll('.btn-edit-schedule').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            showEditPlaylistModal(id);
        });
    });

    elements.schedulesList.querySelectorAll('.btn-delete-schedule').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            showCustomConfirm('Hapus Jadwal', 'Apakah Anda yakin ingin menghapus jadwal pemutaran ini beserta seluruh slot jamnya?', () => {
                deleteSchedule(id);
            });
        });
    });

    elements.schedulesList.querySelectorAll('.btn-delete-slot').forEach(btn => {
        btn.addEventListener('click', () => {
            const schId = btn.getAttribute('data-schedule-id');
            const slotIndex = btn.getAttribute('data-slot-index');
            deleteScheduleSlot(schId, slotIndex);
        });
    });
}

// Render Logs List
function renderLogsList(logs) {
    if (logs.length === 0) {
        elements.logsList.innerHTML = `<div class="log-item empty">Belum ada riwayat aktivitas.</div>`;
        return;
    }

    elements.logsList.innerHTML = '';
    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = `log-item ${log.event}`;

        const t = new Date(log.timestamp);
        const timeStr = String(t.getHours()).padStart(2, '0') + ':' +
            String(t.getMinutes()).padStart(2, '0') + ':' +
            String(t.getSeconds()).padStart(2, '0');

        item.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-event-badge">[${log.event}]</span>
      <span class="log-text"><strong>${getDisplayName(log.videoName)}</strong> - ${log.details}</span>
    `;
        elements.logsList.appendChild(item);
    });
}

/* ==========================================================================
   VIDEO DELETE & SCHEDULE DELETE
   ========================================================================== */

async function deleteVideo(filename) {
    try {
        const res = await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus berkas.');
        showToast(data.message, 'success');
        syncAllData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteSchedule(id) {
    try {
        const res = await fetch(`/api/schedules/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus jadwal.');
        showToast(data.message, 'success');

        // Jika jadwal yang dihapus sedang berjalan, matikan player
        if (currentPlayingScheduleId === id) {
            stopVideoAndGoStandby();
        }

        fetchSchedules();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Hapus satu slot dari jadwal berdasarkan index (tanpa menghapus jadwal keseluruhan)
async function deleteScheduleSlot(scheduleId, slotIndex) {
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return;

    const updatedSlots = (sch.timeSlots || []).filter((_, i) => i !== parseInt(slotIndex));

    // Jika tidak ada slot tersisa, hapus seluruh jadwal
    if (updatedSlots.length === 0) {
        showCustomConfirm(
            'Hapus Jadwal',
            'Slot ini adalah satu-satunya waktu di jadwal ini. Menghapusnya akan menghapus seluruh jadwal. Lanjutkan?',
            () => deleteSchedule(scheduleId)
        );
        return;
    }

    try {
        const res = await fetch(`/api/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeSlots: updatedSlots })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus slot waktu.');
        showToast('Slot waktu berhasil dihapus.', 'success');
        fetchSchedules();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Ubah nama berkas media di server
async function renameVideo(oldName, newName) {
    try {
        const res = await fetch('/api/videos/rename', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName, newName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengubah nama berkas.');
        showToast(`Berkas berhasil diubah namanya menjadi "${data.newName}"`, 'success');
        syncAllData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ==========================================================================
   FORM ADD SCHEDULE HANDLER
   ========================================================================== */

elements.formAddSchedule.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Update value scheduleStartTime dari dropdown sebelum submit
    const mainHour = elements.scheduleStartHour.value;
    const mainMinute = elements.scheduleStartMinute.value;
    if (mainHour && mainMinute) {
        elements.scheduleStartTime.value = `${mainHour}:${mainMinute}`;
    } else {
        elements.scheduleStartTime.value = '';
    }

    if (selectedPlaylist.length === 0) {
        showToast('Harap tambahkan minimal satu video/audio ke playlist!', 'error');
        return;
    }

    const loop = elements.scheduleLoopCheckbox.checked;

    // JIKA sedang mengedit playlist/loop
    if (editingScheduleId !== null) {
        try {
            const res = await fetch(`/api/schedules/${editingScheduleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoName: selectedPlaylist[0],
                    mediaList: selectedPlaylist,
                    loop
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal memperbarui jadwal.');

            showToast('Jadwal playlist berhasil diperbarui!', 'success');
            cancelEditSchedule();
            fetchSchedules();
            switchTab('tab-list');
        } catch (err) {
            showToast(err.message, 'error');
        }
        return;
    }

    // JIKA membuat jadwal baru / menambah slot waktu
    const type = document.querySelector('input[name="schedule-type"]:checked').value;
    const startTime = elements.scheduleStartTime.value;
    if (!startTime) {
        showToast('Jam Mulai wajib diisi!', 'error');
        return;
    }

    // Bangun 1 timeSlot dari form input
    const slot = { id: Date.now().toString(), type, startTime };
    if (type === 'once') {
        slot.date = elements.scheduleDateInput.value;
        if (!slot.date) { showToast('Tanggal pemutaran wajib diisi!', 'error'); return; }
    } else {
        const checkedDays = [];
        document.querySelectorAll('input[name="schedule-days"]:checked').forEach(cb => checkedDays.push(cb.value));
        if (checkedDays.length === 0) { showToast('Pilih minimal satu hari untuk jadwal berulang!', 'error'); return; }
        slot.days = checkedDays;
    }

    // Selalu buat jadwal BARU tanpa batasan — tidak ada penggabungan otomatis
    const payload = {
        videoName: selectedPlaylist[0],
        mediaList: selectedPlaylist,
        timeSlots: [slot],
        loop
    };
    try {
        const res = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan jadwal.');
        showToast('Jadwal baru berhasil ditambahkan!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
        return;
    }

    elements.formAddSchedule.reset();
    selectedPlaylist = [];
    renderSelectedPlaylistPreview();
    toggleScheduleTypeFields();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    elements.scheduleDateInput.value = `${yyyy}-${mm}-${dd}`;
    fetchSchedules();
    switchTab('tab-list');
});

/* ==========================================================================
   DRAG & DROP FILE UPLOADER
   ========================================================================== */

function initUploadZone() {
    const zone = elements.uploadZone;

    zone.addEventListener('click', () => elements.fileInput.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFilesUpload(e.dataTransfer.files[0]);
        }
    });

    elements.fileInput.addEventListener('change', () => {
        if (elements.fileInput.files.length > 0) {
            handleFilesUpload(elements.fileInput.files[0]);
        }
    });
}

function handleFilesUpload(file) {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.mp4') && !ext.endsWith('.mp3') && !ext.endsWith('.mpeg') && !ext.endsWith('.mpg')) {
        showToast('Hanya mendukung format MP4, MP3, atau MPEG (.mpeg, .mpg)!', 'error');
        return;
    }

    if (file.size > 500 * 1024 * 1024) {
        showToast('Ukuran berkas melebihi batas 500MB.', 'error');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('videoFile', file);

    elements.uploadProgressContainer.style.display = 'block';
    elements.uploadFilename.textContent = file.name;
    elements.uploadPercent.textContent = '0%';
    elements.uploadProgressFill.style.width = '0%';

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            elements.uploadPercent.textContent = `${percent}%`;
            elements.uploadProgressFill.style.width = `${percent}%`;
        }
    });

    xhr.addEventListener('load', () => {
        elements.uploadProgressContainer.style.display = 'none';
        if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            showToast(response.message || 'Media berhasil diunggah!', 'success');
            syncAllData();
        } else {
            let errorMsg = 'Gagal mengunggah media.';
            try {
                const errorRes = JSON.parse(xhr.responseText);
                errorMsg = errorRes.error || errorMsg;
            } catch (e) { }
            showToast(errorMsg, 'error');
        }
        elements.fileInput.value = '';
    });

    xhr.addEventListener('error', () => {
        elements.uploadProgressContainer.style.display = 'none';
        showToast('Terjadi kesalahan jaringan.', 'error');
        elements.fileInput.value = '';
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
}

/* ==========================================================================
   VIDEO & AUDIO PLAYER ENGINE
   ========================================================================== */

function initVideoPlayerControls() {
    // Tombol Aktivasi Pertama Kali (Penting untuk Bypass Autoplay Block)
    const activateSystemHandler = (e) => {
        if (e) {
            e.preventDefault();
        }
        if (isActivated) return;
        isActivated = true;
        elements.activationOverlay.classList.add('hide');

        elements.videoPlayer.muted = false;

        // Update Status Indicator ke Aktif
        elements.statusIndicatorBox.classList.remove('off');
        elements.statusDot.className = 'pulse-dot green';
        elements.statusText.classList.remove('off');
        elements.statusText.textContent = 'Sistem Aktif';
        elements.btnStopSystem.style.display = 'inline-flex';

        postLog('standby', 'System', 'Sistem pemutar diaktifkan oleh pengguna. Mode aktif.');
        showToast('PLN Media Center berhasil diaktifkan dengan suara.', 'success');

        runSchedulerEngine();
    };

    elements.btnActivate.addEventListener('click', activateSystemHandler);
    elements.btnActivate.addEventListener('touchstart', activateSystemHandler, { passive: false });

    // Tombol Hentikan Sistem
    elements.btnStopSystem.addEventListener('click', () => {
        showCustomConfirm('Hentikan Sistem', 'Hentikan sistem pemutar? Jadwal video/audio tidak akan diputar secara otomatis lagi.', () => {
            deactivateSystem();
        });
    });

    // Mute Toggle Button
    elements.btnMuteToggle.addEventListener('click', () => {
        const p = elements.videoPlayer;
        p.muted = !p.muted;
        updateMuteIcon(p.muted);
        showToast(p.muted ? 'Suara dimatikan (Muted)' : 'Suara diaktifkan (Unmuted)', 'info');
    });

    // Fullscreen Button
    elements.btnFullscreen.addEventListener('click', () => {
        const p = elements.videoPlayer;
        if (p.requestFullscreen) {
            p.requestFullscreen();
        } else if (p.webkitRequestFullscreen) {
            p.webkitRequestFullscreen();
        } else if (p.msRequestFullscreen) {
            p.msRequestFullscreen();
        }
    });

    // Play/Pause Button Listener
    elements.btnPlayPauseToggle.addEventListener('click', () => {
        const p = elements.videoPlayer;
        if (p.paused) {
            p.play();
            updatePlayPauseIcon(false);
            showToast('Pemutaran dilanjutkan.', 'info');
        } else {
            p.pause();
            updatePlayPauseIcon(true);
            showToast('Pemutaran dijeda.', 'info');
        }
    });

    // Stop Media Button Listener
    elements.btnStopMedia.addEventListener('click', () => {
        showCustomConfirm('Hentikan Media', 'Hentikan pemutaran media saat ini dan kembali ke mode standby?', () => {
            const src = elements.videoPlayer.src;
            const filename = src ? src.substring(src.lastIndexOf('/') + 1) : 'Unknown';
            postLog('end', filename, 'Pemutaran dihentikan manual oleh pengguna.');
            
            currentPlayingScheduleId = null;
            currentPlayingPlaylist = [];
            
            stopVideoAndGoStandby();
            showToast('Pemutaran media dihentikan.', 'info');
            renderSchedulesList();
        });
    });

    // Next/Skip Button Listener
    elements.btnNextMedia.addEventListener('click', () => {
        showToast('Memutar media berikutnya...', 'info');
        handlePlaylistNext();
    });

    // Pemantauan Progress Media
    elements.videoPlayer.addEventListener('timeupdate', () => {
        const p = elements.videoPlayer;
        if (!isNaN(p.duration)) {
            const pct = (p.currentTime / p.duration) * 100;
            elements.progressBarFill.style.width = `${pct}%`;
            elements.overlayTimeProgress.textContent = `${formatTime(p.currentTime)} / ${formatTime(p.duration)}`;
        }
    });

    // Mengatur status jeda visualizer untuk musik MP3 & tombol play/pause
    elements.videoPlayer.addEventListener('pause', () => {
        elements.audioDiscVinyl.classList.add('paused');
        elements.audioEqualizer.classList.add('paused');
        updatePlayPauseIcon(true);
    });

    elements.videoPlayer.addEventListener('play', () => {
        elements.audioDiscVinyl.classList.remove('paused');
        elements.audioEqualizer.classList.remove('paused');
        updatePlayPauseIcon(false);
    });

    // Event saat media selesai diputar
    elements.videoPlayer.addEventListener('ended', () => {
        if (currentPlayingScheduleId === 'manual_override') {
            stopVideoAndGoStandby();
            postLog('end', elements.videoPlayer.src, 'Pemutaran manual selesai.');
            return;
        }

        // Lanjut ke playlist berikutnya secara otomatis
        handlePlaylistNext();
    });

    // Event Error Pemutaran — dilindungi debounce agar tidak spam
    let _lastErrorTs = 0;
    elements.videoPlayer.addEventListener('error', (e) => {
        const now = Date.now();
        // Abaikan error berulang dalam 3 detik
        if (now - _lastErrorTs < 3000) return;
        _lastErrorTs = now;

        console.error('Error media player:', e);
        const src = elements.videoPlayer.currentSrc || elements.videoPlayer.src;
        const filename = src ? decodeURIComponent(src.substring(src.lastIndexOf('/') + 1)) : 'Unknown';
        const errCode = elements.videoPlayer.error ? elements.videoPlayer.error.code : '?';

        let hint = '';
        if (errCode === 4) hint = ' (File tidak ditemukan atau format tidak didukung)';
        else if (errCode === 3) hint = ' (File rusak atau codec tidak didukung)';

        postLog('error', filename, `Kesalahan memutar: ${getDisplayName(filename)}${hint}`);
        showToast(`❌ Gagal memutar: ${getDisplayName(filename)}${hint}`, 'error');

        // Jika playlist sedang berjalan → lanjut ke media berikutnya
        // Tapi batasi agar tidak infinite loop: jika semua item gagal, berhenti
        if (currentPlayingScheduleId !== null && currentPlayingScheduleId !== 'manual_override') {
            setTimeout(() => handlePlaylistNext(), 1500);
        } else {
            stopVideoAndGoStandby();
        }
    });

}

function updateMuteIcon(isMuted) {
    if (isMuted) {
        elements.iconMute.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    } else {
        elements.iconMute.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
    }
}

function updatePlayPauseIcon(isPaused) {
    if (isPaused) {
        elements.iconPlayPause.innerHTML = `<path fill="currentColor" d="M8 5v14l11-7z"/>`;
    } else {
        elements.iconPlayPause.innerHTML = `<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
    }
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Memutar Playlist Media di Indeks Tertentu
function playPlaylistMedia(index) {
    if (!currentPlayingPlaylist || currentPlayingPlaylist.length === 0) return;
    if (index < 0 || index >= currentPlayingPlaylist.length) return;

    currentPlaylistIndex = index;
    const filename = currentPlayingPlaylist[index];
    const isMp3 = filename.toLowerCase().endsWith('.mp3');

    // Pastikan video selalu dimulai dari awal dan TIDAK looping secara HTML5 native
    // supaya event 'ended' selalu terpanggil saat video selesai
    elements.videoPlayer.loop = false;
    elements.videoPlayer.src = `/videos/${filename}`;
    elements.videoPlayer.load();

    const currentSchedule = schedules.find(s => s.id === currentPlayingScheduleId);

    elements.videoPlayer.play()
        .then(() => {
            elements.standbyScreen.style.display = 'none';
            elements.playerBadge.className = 'badge badge-playing';
            elements.playerBadge.textContent = isMp3 ? 'Playing Audio' : 'Playing Video';

            // Tampilkan tombol kontrol cepat
            elements.btnPlayPauseToggle.style.display = 'inline-flex';
            elements.btnStopMedia.style.display = 'inline-flex';
            if (currentPlayingPlaylist && currentPlayingPlaylist.length > 1) {
                elements.btnNextMedia.style.display = 'inline-flex';
            } else {
                elements.btnNextMedia.style.display = 'none';
            }
            updatePlayPauseIcon(false); // set to Pause icon since it's playing

            elements.nowPlayingTitle.textContent = `Menayangkan [${index + 1}/${currentPlayingPlaylist.length}]: ${getDisplayName(filename)}`;

            elements.overlayVideoTitle.textContent = getDisplayName(filename);
            if (currentSchedule) {
                // Cari slot yang sedang aktif untuk jadwal ini
                const slots = currentSchedule.timeSlots || [];
                const now = new Date();
                const dayStr = now.getDay().toString();
                const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
                // Tampilkan semua jam untuk hari ini
                const todaySlotTimes = slots
                    .filter(sl => (sl.type === 'once' && sl.date === dateStr) || (sl.type === 'recurring' && (sl.days || []).some(d => d.toString() === dayStr)))
                    .map(sl => sl.startTime)
                    .join(', ');
                elements.overlayScheduleTime.textContent = `Jadwal hari ini: ${todaySlotTimes || '-'} (${index + 1}/${currentPlayingPlaylist.length})`;
            } else {
                elements.overlayScheduleTime.textContent = `Preview Manual (${index + 1}/${currentPlayingPlaylist.length})`;
            }

            // Munculkan visualizer jika memutar MP3 audio
            if (isMp3) {
                elements.audioVisualizer.style.display = 'flex';
                elements.audioTrackTitle.textContent = getDisplayName(filename);
                elements.audioDiscVinyl.classList.remove('paused');
                elements.audioEqualizer.classList.remove('paused');
            } else {
                elements.audioVisualizer.style.display = 'none';
            }

            postLog('start', filename, `Memulai pemutaran berkas [${index + 1}/${currentPlayingPlaylist.length}] — menunggu selesai sebelum lanjut.`);
        })
        .catch(err => {
            console.error(err);
            postLog('error', filename, `Gagal memutar berkas: ${err.message}`);
            // Tunggu sebentar sebelum lanjut agar tidak spam
            setTimeout(() => handlePlaylistNext(), 1500);
        });
}

// Lanjut ke Media Playlist Berikutnya
function handlePlaylistNext() {
    const currentSchedule = schedules.find(s => s.id === currentPlayingScheduleId);
    const isLoop = currentSchedule ? currentSchedule.loop : false;

    if (currentPlaylistIndex + 1 < currentPlayingPlaylist.length) {
        currentPlaylistIndex++;
        playPlaylistMedia(currentPlaylistIndex);
    } else {
        // Seluruh isi playlist selesai diputar
        if (isLoop) {
            currentPlaylistIndex = 0;
            playPlaylistMedia(0);
            postLog('start', currentPlayingPlaylist[0], 'Mengulangi playlist dari berkas pertama (Looping).');
        } else {
            currentPlayingScheduleId = null;
            currentPlayingPlaylist = [];
            stopVideoAndGoStandby();
            postLog('standby', 'System', 'Seluruh isi playlist telah selesai diputar.');
        }
    }
}

// Play Manual preview
function playManualOverride(mediaName) {
    if (!isActivated) {
        showToast('Harap aktifkan sistem pemutar terlebih dahulu!', 'warning');
        return;
    }

    currentPlayingScheduleId = "manual_override";
    currentPlayingPlaylist = [mediaName];
    currentPlaylistIndex = 0;

    playPlaylistMedia(0);
    showToast(`Sedang memutar preview: ${getDisplayName(mediaName)}`, 'info');
}

// Stop video
function stopVideoAndGoStandby() {
    elements.videoPlayer.pause();
    elements.videoPlayer.src = '';
    elements.videoPlayer.load();

    elements.audioVisualizer.style.display = 'none';
    elements.standbyScreen.style.display = 'flex';
    elements.playerBadge.className = 'badge badge-standby';
    elements.playerBadge.textContent = 'Standby';
    elements.nowPlayingTitle.textContent = 'Standby (Layar Kosong)';
    elements.progressBarFill.style.width = '0%';

    // Sembunyikan tombol kontrol cepat
    elements.btnPlayPauseToggle.style.display = 'none';
    elements.btnStopMedia.style.display = 'none';
    elements.btnNextMedia.style.display = 'none';
}

// Fungsi untuk menonaktifkan sistem pemutar
function deactivateSystem() {
    isActivated = false;

    elements.videoPlayer.pause();
    elements.videoPlayer.src = '';
    elements.videoPlayer.load();

    currentPlayingScheduleId = null;
    currentPlayingPlaylist = [];

    elements.btnStopSystem.style.display = 'none';

    elements.audioVisualizer.style.display = 'none';
    elements.standbyScreen.style.display = 'flex';
    elements.standbyMessage.textContent = 'Sistem dinonaktifkan. Silakan aktifkan sistem pemutar kembali di pagi hari agar video/audio diputar secara otomatis sesuai jadwal.';
    elements.playerBadge.className = 'badge badge-standby';
    elements.playerBadge.textContent = 'Offline';
    elements.nowPlayingTitle.textContent = 'Sistem Off (Hentikan)';
    elements.progressBarFill.style.width = '0%';
    elements.nextCountdownBox.style.display = 'none';

    // Update Status Indicator ke Off
    elements.statusIndicatorBox.classList.add('off');
    elements.statusDot.className = 'pulse-dot red';
    elements.statusText.classList.add('off');
    elements.statusText.textContent = 'Sistem Off';

    // Munculkan kembali overlay aktivasi
    const actTitle = elements.activationOverlay.querySelector('h2');
    const actDesc = elements.activationOverlay.querySelector('p');
    if (actTitle) actTitle.textContent = 'Sistem Nonaktif';
    if (actDesc) actDesc.textContent = 'Sistem pemutar video terjadwal dinonaktifkan. Tekan tombol di bawah untuk mengaktifkannya kembali.';
    elements.activationOverlay.classList.remove('hide');

    postLog('standby', 'System', 'Sistem pemutar dinonaktifkan oleh pengguna.');
    showToast('Sistem pemutar dihentikan.', 'info');

    renderSchedulesList();
}

/* ==========================================================================
   ENGINE UTAMA: SCHEDULER LOGIC (TIMER)
   ========================================================================== */

function runSchedulerEngine() {
    if (!isActivated) return;

    // ⚡ GUARD UTAMA: Jika video/audio sedang diputar, jangan ganggu — biarkan selesai dulu
    if (currentPlayingScheduleId !== null) {
        return;
    }

    const now = new Date();
    const currentDay = now.getDay().toString();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentSec = String(now.getSeconds()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}:${currentSec}`;
    const currentDateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

    let activeSchedule = null;
    let activeSlot = null;

    // Bandingkan hanya HH:MM (toleransi 1 menit penuh) agar tidak terlewat jika
    // browser terbuka beberapa detik setelah jadwal dimulai
    const currentHHMM = `${currentHour}:${currentMin}`;

    for (const sch of schedules) {
        const slots = sch.timeSlots || [];
        for (const slot of slots) {
            if (slot.startTime === currentHHMM) {
                if (slot.type === 'once' && slot.date === currentDateStr) {
                    activeSchedule = sch;
                    activeSlot = slot;
                    break;
                } else if (slot.type === 'recurring') {
                    const dayMatch = (slot.days || []).some(d => d.toString() === currentDay);
                    if (dayMatch) {
                        activeSchedule = sch;
                        activeSlot = slot;
                        break;
                    }
                }
            }
        }
        if (activeSchedule) break;
    }

    if (activeSchedule && currentPlayingScheduleId === null) {
        // Pastikan tidak trigger ulang jadwal yang sama di menit yang sama
        const triggerKey = `${activeSchedule.id}_${currentHHMM}_${currentDateStr}`;
        if (window._lastTriggeredKey === triggerKey) return;
        window._lastTriggeredKey = triggerKey;
        currentPlayingScheduleId = activeSchedule.id;
        currentPlayingPlaylist = activeSchedule.mediaList || [activeSchedule.videoName];
        currentPlaylistIndex = 0;

        postLog('standby', 'System', `Jadwal "${getDisplayName(activeSchedule.videoName)}" terpicu pada jam ${activeSlot.startTime}. Memulai pemutaran.`);
        showToast(`Jadwal terpicu: ${getDisplayName(activeSchedule.videoName)} (${activeSlot.startTime})`, 'success');

        playPlaylistMedia(0);
        renderSchedulesList();
    } else {
        if (currentPlayingScheduleId === null) {
            calculateNextScheduleCountdown(currentTimeStr, currentDateStr, currentDay);
        }
    }
}

function calculateNextScheduleCountdown(currentTimeStr, currentDateStr, currentDay) {
    let nextSchedule = null;
    let nextSlot = null;
    let minDiffSec = Infinity;

    schedules.forEach(sch => {
        const slots = sch.timeSlots || [];
        slots.forEach(slot => {
            let dayMatch = false;
            if (slot.type === 'once') {
                dayMatch = (slot.date === currentDateStr);
            } else {
                dayMatch = (slot.days || []).some(d => d.toString() === currentDay);
            }

            if (dayMatch) {
                const startSec = slot.startTime + ':00';
                if (startSec > currentTimeStr) {
                    const diff = timeToSeconds(startSec) - timeToSeconds(currentTimeStr);
                    if (diff < minDiffSec) {
                        minDiffSec = diff;
                        nextSchedule = sch;
                        nextSlot = slot;
                    }
                }
            }
        });
    });

    if (nextSchedule && minDiffSec !== Infinity) {
        elements.nextCountdownBox.style.display = 'block';
        elements.nextVideoTitle.textContent = getDisplayName(nextSchedule.videoName) + ` (${nextSlot.startTime})`;
        elements.nextVideoTime.textContent = secondsToTimeString(minDiffSec);
    } else {
        elements.nextCountdownBox.style.display = 'none';
    }
}

function timeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parts[2] ? parseInt(parts[2]) : 0);
}

function secondsToTimeString(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Pembersihan logs UI
elements.btnClearLogsUi.addEventListener('click', () => {
    elements.logsList.innerHTML = `<div class="log-item empty">Belum ada riwayat aktivitas.</div>`;
    showToast('Tampilan riwayat log dibersihkan.', 'info');
});


/* ==========================================================================
   MODAL: TAMBAH SLOT JAM KE JADWAL
   ========================================================================== */

let _addSlotTargetId = null;

function initAddSlotModal() {
    // Isi dropdown Jam (00 - 23)
    for (let h = 0; h <= 23; h++) {
        const opt = document.createElement('option');
        opt.value = String(h).padStart(2, '0');
        opt.textContent = String(h).padStart(2, '0') + ' (Jam)';
        elements.addSlotHour.appendChild(opt);
    }
    // Isi dropdown Menit (00, 05, 10, ... 55)
    for (let m = 0; m <= 55; m += 5) {
        const opt = document.createElement('option');
        opt.value = String(m).padStart(2, '0');
        opt.textContent = String(m).padStart(2, '0') + ' (Menit)';
        elements.addSlotMinute.appendChild(opt);
    }

    // Toggle tampilan grup hari/tanggal
    document.querySelectorAll('input[name="add-slot-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isOnce = document.querySelector('input[name="add-slot-type"]:checked').value === 'once';
            elements.addSlotGroupOnce.style.display = isOnce ? 'block' : 'none';
            elements.addSlotGroupRecurring.style.display = isOnce ? 'none' : 'block';
        });
    });

    // Set default tanggal hari ini
    const today = new Date();
    elements.addSlotDate.value = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
    elements.addSlotDate.min = elements.addSlotDate.value;

    elements.btnAddSlotCancel.addEventListener('click', () => {
        elements.addSlotModal.style.display = 'none';
        _addSlotTargetId = null;
    });

    elements.btnAddSlotOk.addEventListener('click', async () => {
        if (!_addSlotTargetId) return;

        const type = document.querySelector('input[name="add-slot-type"]:checked').value;
        const hour = elements.addSlotHour.value;
        const minute = elements.addSlotMinute.value;

        if (!hour || !minute) {
            showToast('Jam dan menit wajib dipilih!', 'error');
            return;
        }

        const startTime = `${hour}:${minute}`;
        const slot = { type, startTime };

        if (type === 'once') {
            slot.date = elements.addSlotDate.value;
            if (!slot.date) { showToast('Tanggal wajib diisi!', 'error'); return; }
        } else {
            const checkedDays = [];
            document.querySelectorAll('input[name="add-slot-days"]:checked').forEach(cb => checkedDays.push(cb.value));
            if (checkedDays.length === 0) { showToast('Pilih minimal satu hari!', 'error'); return; }
            slot.days = checkedDays;
        }

        const sch = schedules.find(s => s.id === _addSlotTargetId);
        if (!sch) return;

        const updatedSlots = [...(sch.timeSlots || []), slot];

        try {
            const res = await fetch(`/api/schedules/${_addSlotTargetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeSlots: updatedSlots })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal menambah slot waktu.');
            showToast(`✅ Slot jam ${startTime} berhasil ditambahkan!`, 'success');
            elements.addSlotModal.style.display = 'none';
            _addSlotTargetId = null;
            fetchSchedules();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function showAddSlotModal(scheduleId) {
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return;

    _addSlotTargetId = scheduleId;

    const mediaArr = sch.mediaList || [sch.videoName];
    const nameDisplay = mediaArr.length === 1
        ? getDisplayName(mediaArr[0])
        : `Playlist (${mediaArr.length} media)`;
    elements.addSlotModalSubtitle.textContent = `Jadwal: ${nameDisplay}`;

    // Reset form
    elements.addSlotTypeOnce.checked = true;
    elements.addSlotGroupOnce.style.display = 'block';
    elements.addSlotGroupRecurring.style.display = 'none';
    elements.addSlotHour.value = '';
    elements.addSlotMinute.value = '';
    document.querySelectorAll('input[name="add-slot-days"]').forEach(cb => cb.checked = false);

    // Set tanggal hari ini
    const today = new Date();
    elements.addSlotDate.value = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    elements.addSlotModal.style.display = 'flex';
}

/* ==========================================================================
   MODAL: EDIT PLAYLIST & LOOP JADWAL
   ========================================================================== */

let _editPlaylistTargetId = null;
let _editPlaylistList = [];

function initEditPlaylistModal() {
    elements.btnEditPlaylistAdd.addEventListener('click', () => {
        const val = elements.editPlaylistVideoSelect.value;
        if (!val) { showToast('Pilih media terlebih dahulu!', 'warning'); return; }
        if (_editPlaylistList.includes(val)) { showToast('Media sudah ada di playlist.', 'warning'); return; }
        _editPlaylistList.push(val);
        renderEditPlaylistPreview();
        elements.editPlaylistVideoSelect.value = '';
    });

    elements.editPlaylistVideoSelect.addEventListener('change', () => {
        const val = elements.editPlaylistVideoSelect.value;
        if (val && _editPlaylistList.length === 0) {
            _editPlaylistList = [val];
            renderEditPlaylistPreview();
        }
    });

    elements.btnEditPlaylistCancel.addEventListener('click', () => {
        elements.editPlaylistModal.style.display = 'none';
        _editPlaylistTargetId = null;
        _editPlaylistList = [];
    });

    elements.btnEditPlaylistOk.addEventListener('click', async () => {
        if (!_editPlaylistTargetId) return;
        if (_editPlaylistList.length === 0) {
            showToast('Playlist tidak boleh kosong!', 'error');
            return;
        }

        const loop = elements.editPlaylistLoop.checked;

        try {
            const res = await fetch(`/api/schedules/${_editPlaylistTargetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoName: _editPlaylistList[0],
                    mediaList: _editPlaylistList,
                    loop
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan.');
            showToast('Jadwal berhasil diperbarui!', 'success');
            elements.editPlaylistModal.style.display = 'none';
            _editPlaylistTargetId = null;
            _editPlaylistList = [];
            fetchSchedules();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function showEditPlaylistModal(scheduleId) {
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return;

    _editPlaylistTargetId = scheduleId;
    _editPlaylistList = [...(sch.mediaList || [sch.videoName])];
    elements.editPlaylistLoop.checked = sch.loop;

    const mediaArr = sch.mediaList || [sch.videoName];
    const nameDisplay = mediaArr.length === 1
        ? getDisplayName(mediaArr[0])
        : `Playlist (${mediaArr.length} media)`;
    elements.editPlaylistSubtitle.textContent = `Mengedit: ${nameDisplay}`;

    // Isi dropdown dengan daftar video yang tersedia
    elements.editPlaylistVideoSelect.innerHTML = '<option value="" disabled selected>-- Pilih media --</option>';
    videos.forEach(vid => {
        const opt = document.createElement('option');
        opt.value = vid.name;
        opt.textContent = getDisplayName(vid.name) + (vid.name.toLowerCase().endsWith('.mp3') ? ' (Audio)' : ' (Video)');
        elements.editPlaylistVideoSelect.appendChild(opt);
    });

    renderEditPlaylistPreview();
    elements.editPlaylistModal.style.display = 'flex';
}

function renderEditPlaylistPreview() {
    if (_editPlaylistList.length === 0) {
        elements.editPlaylistPreviewGroup.style.display = 'none';
        return;
    }

    elements.editPlaylistPreviewGroup.style.display = 'block';
    elements.editPlaylistPreviewList.innerHTML = '';

    _editPlaylistList.forEach((item, index) => {
        const isMp3 = item.toLowerCase().endsWith('.mp3');
        const card = document.createElement('div');
        card.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);padding:7px 10px;border-radius:6px;border:1px solid var(--border-glass);gap:8px;';
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;overflow:hidden;flex-grow:1;">
            <span style="font-weight:600;color:var(--text-muted);font-size:11px;">${index + 1}.</span>
            <div style="flex-shrink:0;">${isMp3 ? ICONS.audio : ICONS.video}</div>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;" title="${getDisplayName(item)}">${getDisplayName(item)}</span>
          </div>
          <button type="button" data-idx="${index}" style="color:var(--danger);font-size:16px;font-weight:700;border:none;background:none;cursor:pointer;padding:1px 6px;">&times;</button>
        `;
        elements.editPlaylistPreviewList.appendChild(card);
    });

    elements.editPlaylistPreviewList.querySelectorAll('button[data-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            _editPlaylistList.splice(idx, 1);
            renderEditPlaylistPreview();
        });
    });
}

function cancelEditSchedule() {
    editingScheduleId = null;
    selectedPlaylist = [];
    renderSelectedPlaylistPreview();
    elements.formAddSchedule.reset();

    elements.scheduleFormTitle.textContent = 'Buat Jadwal Baru';
    elements.btnSubmitScheduleText.textContent = 'Simpan ke Jadwal';
    elements.btnCancelEditSchedule.style.display = 'none';

    // Kembalikan required untuk input waktu
    elements.scheduleStartTime.setAttribute('required', 'required');

    // Munculkan kembali input tipe jadwal dan jam mulai
    elements.typeOnceRadio.closest('.form-group').style.display = 'flex';
    elements.scheduleTimeFieldsRow.style.display = 'flex';
    toggleScheduleTypeFields();
}

function initMainFormTimeDropdowns() {
    // Isi dropdown Jam utama (00 - 23)
    for (let h = 0; h <= 23; h++) {
        const opt = document.createElement('option');
        opt.value = String(h).padStart(2, '0');
        opt.textContent = String(h).padStart(2, '0') + ' (Jam)';
        elements.scheduleStartHour.appendChild(opt);
    }
    // Isi dropdown Menit utama (00, 05, 10, ... 55)
    for (let m = 0; m <= 55; m += 5) {
        const opt = document.createElement('option');
        opt.value = String(m).padStart(2, '0');
        opt.textContent = String(m).padStart(2, '0') + ' (Menit)';
        elements.scheduleStartMinute.appendChild(opt);
    }
}

