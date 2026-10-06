/**
 * Main Application Logic
 * Coordinates: Unboxing, Cake Blowing, Wish Wall, Balloon Pops, Confetti & Modals
 */

// Admin passkey configuration (Change this to whatever PIN you want!)
const ADMIN_PASSKEY = "sara2119123";
window.isAdminMode = (typeof SafeStore !== "undefined" && SafeStore.getSession("is_admin_mode") === "true");

document.addEventListener("DOMContentLoaded", () => {
  initUnboxing();
  initBalloons();
  initCake();
  initMusicToggle();
  initWishWall();
  initWishModal();
  initAdminMode();
});

/* ==========================================================================
   1. SURPRISE GIFT BOX UNBOXING
   ========================================================================== */
function initUnboxing() {
  const curtain = document.getElementById("surprise-curtain");
  const giftBox = document.getElementById("gift-box-trigger");
  if (!curtain || !giftBox) return;

  giftBox.addEventListener("click", () => {
    // Sound & Visual Trigger
    if (window.soundCtrl) {
      window.soundCtrl.playSparkle();
    }
    giftBox.classList.add("opening");

    // Launch celebratory confetti burst
    triggerConfettiBurst();

    setTimeout(() => {
      curtain.classList.add("hidden");
      // Autoplay celebratory melody upon opening
      const musicBtn = document.getElementById("music-toggle-btn");
      if (musicBtn && window.soundCtrl && !window.soundCtrl.isPlayingMusic) {
        window.soundCtrl.toggleMusic();
        musicBtn.classList.add("active");
      }
    }, 900);
  });
}

/**
 * Direct shortcut: Unbox gift, burst confetti, and open wish composer immediately
 */
window.unboxAndWish = function() {
  const giftBox = document.getElementById("gift-box-trigger");
  if (giftBox) {
    giftBox.click();
    setTimeout(() => {
      if (typeof openWishModal === "function") {
        openWishModal();
      }
    }, 950);
  }
};

/* ==========================================================================
   2. CONFETTI ENGINE (Uses canvas-confetti if loaded, with DOM fallback)
   ========================================================================== */
function triggerConfettiBurst() {
  if (typeof confetti === "function") {
    // Canvas Confetti Library
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4b72', '#8b5cf6', '#f59e0b', '#10b981', '#38bdf8']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff4b72', '#fbcfe8', '#fef08a']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#38bdf8', '#a7f3d0']
      });
    }, 250);
  }
}

/* ==========================================================================
   3. FLOATING BALLOON POPPING
   ========================================================================== */
const BALLOON_COMPLIMENTS = [
  "You bring so much joy to everyone around you! 🌟",
  "May this year bring all your biggest dreams alive! 🚀",
  "Thank you for being the truest, kindest friend ever! 💖",
  "Another year wiser, cooler, and even more fabulous! 😎",
  "Here's to endless memories, laughter, and adventures! 🥂"
];

function initBalloons() {
  const balloons = document.querySelectorAll(".balloon");
  const complimentPopup = document.getElementById("balloon-compliment-popup");

  balloons.forEach((balloon, index) => {
    balloon.addEventListener("click", () => {
      if (balloon.classList.contains("popped")) return;

      // Pop sound
      if (window.soundCtrl) {
        window.soundCtrl.playPop();
      }

      balloon.classList.add("popped");

      // Mini confetti at balloon position
      if (typeof confetti === "function") {
        const rect = balloon.getBoundingClientRect();
        confetti({
          particleCount: 25,
          startVelocity: 15,
          spread: 45,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          }
        });
      }

      // Show surprise compliment toast
      if (complimentPopup) {
        const text = BALLOON_COMPLIMENTS[index % BALLOON_COMPLIMENTS.length];
        complimentPopup.textContent = text;
        complimentPopup.classList.add("show");
        setTimeout(() => {
          complimentPopup.classList.remove("show");
        }, 3200);
      }
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE 3D CAKE & CANDLE BLOWING
   ========================================================================== */
function initCake() {
  const candlesRow = document.getElementById("candles-row");
  const candles = document.querySelectorAll(".candle");
  const blowBtn = document.getElementById("blow-candles-btn");
  const relightBtn = document.getElementById("relight-candles-btn");
  const cakeStatus = document.getElementById("cake-status-text");

  let candlesBlown = false;

  function blowOut() {
    if (candlesBlown) return;
    candlesBlown = true;

    // Play whoosh sound and chimes
    if (window.soundCtrl) {
      window.soundCtrl.playBlowout();
      setTimeout(() => window.soundCtrl.playSparkle(), 350);
    }

    candles.forEach((c) => c.classList.add("blown-out"));

    // Mega celebratory fireworks
    triggerConfettiBurst();

    if (cakeStatus) {
      cakeStatus.textContent = "✨ Woohoo! Your wish has been made! May it all come true! 🎉";
      cakeStatus.style.color = "#db2777";
    }

    if (relightBtn) relightBtn.style.display = "inline-flex";
    if (blowBtn) blowBtn.style.display = "none";
  }

  function relight() {
    candlesBlown = false;
    candles.forEach((c) => c.classList.remove("blown-out"));

    if (cakeStatus) {
      cakeStatus.textContent = "Make a secret wish and tap the candles to blow them out!";
      cakeStatus.style.color = "#4b5563";
    }

    if (relightBtn) relightBtn.style.display = "none";
    if (blowBtn) blowBtn.style.display = "inline-flex";
  }

  if (candlesRow) candlesRow.addEventListener("click", blowOut);
  if (blowBtn) blowBtn.addEventListener("click", blowOut);
  if (relightBtn) relightBtn.addEventListener("click", relight);
}

/* ==========================================================================
   5. MUSIC CONTROLLER BUTTON
   ========================================================================== */
function initMusicToggle() {
  const btn = document.getElementById("music-toggle-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (window.soundCtrl) {
      const isPlaying = window.soundCtrl.toggleMusic();
      if (isPlaying) {
        btn.classList.add("active");
        btn.setAttribute("title", "Pause Birthday Music");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("title", "Play Birthday Music");
      }
    }
  });
}

/* ==========================================================================
   6. LIVE VISITOR WISH WALL
   ========================================================================== */
let currentFilter = "all";

function initWishWall() {
  const container = document.getElementById("sticky-board");
  const counterEl = document.getElementById("wish-count-number");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (!container || !window.wishStore) return;

  // Filter Buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter") || "all";
      renderWishes(window.wishStore.wishes);
    });
  });

  // Subscribe to updates from Firebase/LocalStorage
  window.wishStore.subscribe((wishes) => {
    if (counterEl) counterEl.textContent = wishes.length;
    renderWishes(wishes);
  });
}

function renderWishes(wishes) {
  const container = document.getElementById("sticky-board");
  if (!container) return;

  const filtered = wishes.filter((w) => {
    if (currentFilter === "all") return true;
    const tag = (w.tag || "").toLowerCase();
    return tag.includes(currentFilter.toLowerCase());
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: rgba(255, 255, 255, 0.65); border-radius: 24px; border: 2px dashed #fbcfe8; backdrop-filter: blur(10px);">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">💌</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: #1f2937; margin-bottom: 0.4rem;">
          No wishes on the wall yet!
        </h3>
        <p style="font-size: 1.05rem; color: #6b7280; max-width: 420px; margin: 0 auto 1.5rem;">
          Be the very first friend to leave a birthday message and pin it here.
        </p>
        <button type="button" onclick="openWishModal()" class="btn-primary">
          <span>✍️ Write the First Wish</span>
        </button>
      </div>
    `;
    return;
  }

  // Generate slightly random tilt angles for realistic sticky notes
  const tilts = [-2, 1.5, -1, 2, -1.8, 1.2];

  container.innerHTML = filtered.map((wish, index) => {
    const tilt = wish.isFeatured ? 0 : tilts[index % tilts.length];
    const colorClass = `sticky-color-${wish.color || "yellow"}`;
    let isLiked = "";
    try {
      if (typeof SafeStore !== 'undefined' && SafeStore.getSession(`liked_${wish.id}`)) {
        isLiked = "liked";
      }
    } catch (e) {}
    const featuredClass = wish.isFeatured ? "sticky-featured" : "";

    const isAdmin = (window.isAdminMode === true);
    const authorName = isAdmin ? escapeHtml(wish.name || "Friend") : "A Special Friend 💖";
    const relationship = isAdmin ? `From: ${escapeHtml(wish.tag || "Friend")}` : "Birthday Wish ✨";
    const lockBadge = isAdmin
      ? `<span style="font-size: 0.7rem; background: #dcfce7; color: #166534; font-weight: 600; padding: 2px 7px; border-radius: 50px;">🔓 Verified</span>`
      : `<span style="font-size: 0.7rem; background: rgba(0, 0, 0, 0.06); color: #6b7280; font-weight: 600; padding: 2px 7px; border-radius: 50px;" title="Sender name visible only to Admin">🔒 Private</span>`;

    return `
      <article class="sticky-note ${colorClass} ${featuredClass}" style="transform: rotate(${tilt}deg);" data-id="${wish.id}">
        ${wish.isFeatured ? '<span class="featured-pin">⭐ Special Note</span>' : ''}
        <div class="sticky-header">
          <div class="sticky-author-box">
            <div class="sticky-avatar">${escapeHtml(wish.avatar || "🎂")}</div>
            <div class="sticky-author-info">
              <span class="sticky-author-name">${authorName} ${lockBadge}</span>
              <span class="sticky-tag-badge">${relationship}</span>
            </div>
          </div>
        </div>

        <p class="sticky-text">${escapeHtml(wish.text || "")}</p>

        <div class="sticky-footer">
          <span class="sticky-time">${formatDate(wish.createdAt)}</span>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${isAdmin ? `<button class="delete-btn" onclick="handleDelete('${wish.id}')" title="Delete wish (Admin only)" style="border: none; background: transparent; cursor: pointer; opacity: 0.5; font-size: 0.9rem; padding: 0.2rem;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">🗑️</button>` : ''}
            <button class="reaction-btn ${isLiked}" onclick="handleLike('${wish.id}')">
              <span>❤️</span>
              <span class="like-count">${wish.likes || 0}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// Global expose
window.renderWishes = renderWishes;

// Global Delete Handler
window.handleDelete = function (id) {
  if (confirm("Delete this birthday wish?")) {
    if (window.wishStore) {
      window.wishStore.deleteWish(id);
    }
  }
};

// Global Like Handler
window.handleLike = function (id) {
  if (window.soundCtrl) {
    window.soundCtrl.playTone(600, 0.15, 'sine');
  }
  if (window.wishStore) {
    window.wishStore.likeWish(id);
  }
};

/* ==========================================================================
   7. WISH COMPOSER MODAL & FORM
   ========================================================================== */
window.openWishModal = function () {
  const modal = document.getElementById("wish-modal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  const nameInput = document.getElementById("wish-name-input");
  if (nameInput) setTimeout(() => nameInput.focus(), 120);
};

window.closeWishModal = function () {
  const modal = document.getElementById("wish-modal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
};

function initWishModal() {
  const modal = document.getElementById("wish-modal");
  const openBtn = document.getElementById("open-wish-modal-btn");
  const closeBtn = document.getElementById("close-wish-modal-btn");
  const form = document.getElementById("wish-form");
  const colorOptions = document.querySelectorAll(".color-option");
  const emojiBtns = document.querySelectorAll(".emoji-btn");
  const textarea = document.getElementById("wish-message-input");

  let selectedColor = "yellow";

  if (!modal) return;

  if (openBtn) openBtn.addEventListener("click", window.openWishModal);
  if (closeBtn) closeBtn.addEventListener("click", window.closeWishModal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeWishModal();
  });

  // Color picker
  colorOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorOptions.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedColor = btn.getAttribute("data-color") || "yellow";
    });
  });

  // Quick Emoji insertion
  emojiBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const emoji = btn.textContent;
      if (textarea) {
        textarea.value += emoji;
        textarea.focus();
      }
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("wish-name-input");
      const name = nameInput ? nameInput.value.trim() : "";
      const tagSelect = document.getElementById("wish-tag-select");
      const tag = tagSelect ? tagSelect.value : "Friend";
      const text = textarea ? textarea.value.trim() : "";
      const avatarSelect = document.getElementById("wish-avatar-select");
      const avatar = avatarSelect ? avatarSelect.value : "🎉";

      if (!text) {
        alert("Please write a sweet message first! 💌");
        if (textarea) textarea.focus();
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      try {
        if (window.wishStore) {
          await window.wishStore.addWish({
            name: name || "A Dear Friend",
            tag,
            color: selectedColor,
            text,
            avatar
          });
        }

        // Sound & Confetti celebration
        try {
          if (window.soundCtrl) window.soundCtrl.playSparkle();
          triggerConfettiBurst();
        } catch (fxErr) {}

        // Reset form & close modal
        form.reset();
        window.closeWishModal();

        alert("💌 Your birthday wish has been delivered privately into the birthday box! Thank you for celebrating! ✨");
      } catch (err) {
        console.error("Submission failed:", err);
        alert("Failed to send wish. Please try again!");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "<span>Send Private Wish 💌</span>";
        }
      }
    });
  }
}



/* ==========================================================================
   8. ADMIN MODE & PASSKEY VERIFICATION
   ========================================================================== */
window.updateAdminButtonUI = function () {
  const icon = document.getElementById("admin-btn-icon");
  const text = document.getElementById("admin-btn-text");
  const btn = document.getElementById("admin-mode-btn");
  if (!btn) return;
  if (window.isAdminMode) {
    if (icon) icon.textContent = "🔓";
    if (text) text.textContent = "Admin";
    btn.style.borderColor = "#10b981";
    btn.style.color = "#047857";
    btn.style.background = "#ecfdf5";
    btn.setAttribute("title", "Admin Active: Click to Lock/Logout");
  } else {
    if (icon) icon.textContent = "🔒";
    if (text) text.textContent = "Admin";
    btn.style.borderColor = "#e5e7eb";
    btn.style.color = "#4b5563";
    btn.style.background = "white";
    btn.setAttribute("title", "Admin View (Secret Passkey)");
  }
};

window.openAdminModal = function () {
  const modal = document.getElementById("admin-modal");
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  const pinInput = document.getElementById("admin-pin-input");
  if (pinInput) {
    pinInput.value = "";
    setTimeout(() => pinInput.focus(), 120);
  }
  const errMsg = document.getElementById("admin-error-msg");
  if (errMsg) errMsg.style.display = "none";
};

window.closeAdminModal = function () {
  const modal = document.getElementById("admin-modal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
};

// Open Admin Passkey Modal
window.openAdminPanel = function () {
  window.openAdminModal();
};

window.closeAdminPanel = function () {
  const dashModal = document.getElementById("admin-dashboard-modal");
  if (dashModal) {
    dashModal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.renderInPageAdminDashboard = function (wishes) {
  const listEl = document.getElementById("inpage-admin-wishes-list");
  const countEl = document.getElementById("inpage-admin-count");
  const likesEl = document.getElementById("inpage-admin-likes");

  const list = wishes || [];
  if (countEl) countEl.textContent = list.length;
  if (likesEl) likesEl.textContent = list.reduce((sum, w) => sum + (w.likes || 0), 0);

  if (!listEl) return;

  if (list.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
        <p style="font-size: 1.1rem; color: #1e293b; font-weight: 600;">No wishes received yet.</p>
        <p style="font-size: 0.9rem;">Once visitors post messages, they will appear right here with their real names.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = list.map((wish) => `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem; background: white; border-radius: 10px; margin-bottom: 0.65rem; border: 1px solid #e2e8f0; gap: 1rem;">
      <div style="display: flex; gap: 0.75rem; flex: 1;">
        <div style="font-size: 1.5rem; background: #f1f5f9; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${escapeHtml(wish.avatar || "🎂")}
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong style="color: #0f172a; font-size: 1rem;">${escapeHtml(wish.name || "Anonymous Friend")}</strong>
            <span style="font-size: 0.75rem; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 12px; font-weight: 600;">
              ${escapeHtml(wish.tag || "Friend")}
            </span>
            <span style="font-size: 0.75rem; color: #94a3b8;">🕒 ${formatDate(wish.createdAt)}</span>
          </div>
          <p style="margin: 0.4rem 0 0; color: #334155; font-size: 0.95rem; line-height: 1.45; word-break: break-word;">
            "${escapeHtml(wish.text || "")}"
          </p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #e11d48;">❤️ ${wish.likes || 0}</span>
        <button type="button" onclick="handleAdminDelete('${wish.id}')" title="Delete Wish" style="border: 1px solid #fecaca; background: #fee2e2; color: #dc2626; padding: 0.35rem 0.65rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join("");
};

window.handleAdminDelete = async function (id) {
  if (confirm("Permanently delete this birthday wish?")) {
    if (window.wishStore) {
      await window.wishStore.deleteWish(id);
      window.renderInPageAdminDashboard(window.wishStore.wishes);
    }
  }
};

window.lockAdminSession = function () {
  window.isAdminMode = false;
  if (typeof SafeStore !== "undefined") {
    SafeStore.setSession("is_admin_mode", "false");
    SafeStore.setSession("admin_authenticated", "false");
  }
  window.closeAdminPanel();
  window.updateAdminButtonUI();
  if (window.renderWishes && window.wishStore) {
    window.renderWishes(window.wishStore.wishes);
  }
  alert("Admin session locked. Names are now hidden from public view.");
};

window.exportAdminWishes = function () {
  const wishes = window.wishStore ? window.wishStore.wishes : [];
  if (wishes.length === 0) {
    alert("No wishes to export yet!");
    return;
  }

  let text = "🎂 BIRTHDAY WISHES EXPORT 🎂\n========================================\n\n";
  wishes.forEach((w, i) => {
    text += `#${i + 1} From: ${w.name || "Friend"} (${w.tag || "Friend"})\n`;
    text += `Likes: ${w.likes || 0}\n`;
    text += `Message:\n"${w.text}"\n`;
    text += "----------------------------------------\n\n";
  });

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `birthday-wishes-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
};

function initAdminMode() {
  window.updateAdminButtonUI();

  // If wishStore updates, also update in-page admin dashboard if open
  if (window.wishStore) {
    window.wishStore.subscribe((wishes) => {
      const dash = document.getElementById("admin-dashboard-modal");
      if (dash && dash.classList.contains("active")) {
        window.renderInPageAdminDashboard(wishes);
      }
    });
  }

  const form = document.getElementById("admin-login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pinInput = document.getElementById("admin-pin-input");
    const errMsg = document.getElementById("admin-error-msg");
    const enteredPin = pinInput ? pinInput.value.trim() : "";

    if (enteredPin === ADMIN_PASSKEY) {
      window.isAdminMode = true;
      if (typeof SafeStore !== "undefined") {
        SafeStore.set("admin_authenticated", "true");
        SafeStore.setSession("is_admin_mode", "true");
        SafeStore.setSession("admin_authenticated", "true");
      }
      try {
        localStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_authenticated", "true");
      } catch (e) {}

      window.closeAdminModal();
      if (errMsg) errMsg.style.display = "none";
      if (pinInput) pinInput.value = "";

      if (window.soundCtrl) window.soundCtrl.playSparkle();

      // Open new tab where all wishes to me are shown!
      window.open("admin.html?auth=" + encodeURIComponent(ADMIN_PASSKEY), "_blank");
    } else {
      if (errMsg) errMsg.style.display = "block";
      if (pinInput) {
        pinInput.select();
        pinInput.focus();
      }
    }
  });

  const modal = document.getElementById("admin-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeAdminModal();
    });
  }

  const dashModal = document.getElementById("admin-dashboard-modal");
  if (dashModal) {
    dashModal.addEventListener("click", (e) => {
      if (e.target === dashModal) window.closeAdminPanel();
    });
  }
}

/* ==========================================================================
   HELPERS
   ========================================================================== */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoDate) {
  if (!isoDate) return "Just now";
  try {
    const d = new Date(isoDate);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recently";
  }
}
