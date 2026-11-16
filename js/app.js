/**
 * EduNova LMS - Application Core & View Router (app.js)
 * Implements 13 views, commercial SaaS landing page, role-based dashboards,
 * quiz engine, video player, assignment grading, discussions, certificate generation,
 * and theme management.
 */

const App = (() => {
  // State
  let currentRoute = "landing";
  let activeCourseId = null;
  let activeLessonId = null;
  let activeQuizId = null;
  let quizTimerInterval = null;
  let quizTimeRemaining = 0;
  let quizUserAnswers = {};
  let activeCatalogCategory = "All";

  // Escape HTML helper
  const esc = (s) => (s ? String(s).replace(/[&<>'"]/g, "") : "");

  // Toast Notification System
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-600 text-white border-emerald-500",
      error: "bg-rose-600 text-white border-rose-500",
      warning: "bg-amber-600 text-white border-amber-500",
      info: "bg-blue-600 text-white border-blue-500"
    };
    const icons = {
      success: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
      error: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`,
      warning: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
      info: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    };
    toast.className = `toast-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold ${colors[type] || colors.info}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${esc(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px) scale(0.95)";
      toast.style.transition = "all 0.28s ease";
      setTimeout(() => toast.remove(), 280);
    }, 3600);
  }

  // Theme Management
  function initTheme() {
    const saved = localStorage.getItem("edunova_theme") || "light";
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("edunova_theme", isDark ? "dark" : "light");
    showToast(`Switched to ${isDark ? "Dark" : "Light"} mode`, "info");
    renderHeader();
    if (["dashboard", "admin-dashboard", "teacher-dashboard", "student-dashboard"].includes(currentRoute)) {
      renderRoute(currentRoute);
    }
  }

  // Navigation Router
  function navigate(route, params = {}) {
    window.location.hash = route;
    if (params.courseId) activeCourseId = params.courseId;
    if (params.lessonId) activeLessonId = params.lessonId;
    if (params.quizId) activeQuizId = params.quizId;
  }

  function handleRoute() {
    let hash = window.location.hash.replace(/^#\/?/, "") || "landing";
    const parts = hash.split("/");
    const rootRoute = parts[0];

    if (rootRoute === "learn" && parts[1]) {
      activeCourseId = parts[1];
      activeLessonId = parts[2] || null;
      currentRoute = "learn";
    } else if (rootRoute === "course-details" && parts[1]) {
      activeCourseId = parts[1];
      currentRoute = "course-details";
    } else {
      currentRoute = rootRoute;
    }

    renderApp();
  }

  // Layout Renderer
  function renderApp() {
    const user = Auth.getCurrentUser();
    const isPublicPage = ["landing", "login", "register"].includes(currentRoute);

    const appRoot = document.getElementById("app");
    if (!appRoot) return;

    if (isPublicPage) {
      document.body.classList.remove("has-sidebar");
      appRoot.innerHTML = `
        <div id="public-header"></div>
        <main id="main-content" class="min-h-screen"></main>
        <div id="public-footer"></div>
      `;
      renderPublicHeader();
      renderPublicFooter();
      renderRoute(currentRoute);
    } else {
      // Authenticated Portal
      document.body.classList.add("has-sidebar");
      appRoot.innerHTML = `
        <div class="flex h-screen overflow-hidden bg-[var(--bg-body)]">
          <aside id="app-sidebar" class="w-64 flex-shrink-0 hidden md:flex flex-col bg-[var(--bg-sidebar)] border-r border-slate-800 text-slate-300 select-none z-30"></aside>
          <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header id="app-header" class="h-16 flex-shrink-0 glass-nav border-b border-[var(--border-color)] px-4 sm:px-6 flex items-center justify-between z-20"></header>
            <main id="main-content" class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"></main>
          </div>
        </div>
        <div id="mobile-sidebar-drawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden" onclick="App.toggleMobileSidebar()"></div>
        <div id="role-pill-container"></div>
      `;
      renderSidebar();
      renderHeader();
      renderRolePill();
      renderRoute(currentRoute);
    }
  }

  // Floating Role Switcher Pill
  function renderRolePill() {
    const container = document.getElementById("role-pill-container");
    if (!container) return;
    const user = Auth.getCurrentUser();
    if (!user) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="role-pill rounded-full p-1.5 flex items-center gap-1.5 glass-panel bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-2.5 pr-1 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Role:
        </span>
        <button onclick="App.quickSwitchRole('student')" class="px-3 py-1 rounded-full text-xs font-bold transition-all ${user.role === 'student' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          🎓 Student
        </button>
        <button onclick="App.quickSwitchRole('teacher')" class="px-3 py-1 rounded-full text-xs font-bold transition-all ${user.role === 'teacher' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          👨‍🏫 Teacher
        </button>
        <button onclick="App.quickSwitchRole('admin')" class="px-3 py-1 rounded-full text-xs font-bold transition-all ${user.role === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ⚡ Admin
        </button>
      </div>
    `;
  }

  function quickSwitchRole(role) {
    Auth.switchRole(role);
    showToast(`Switched account to demo ${role.toUpperCase()}`, "success");
    navigate("dashboard");
  }

  // Public Header & Footer
  function renderPublicHeader() {
    const el = document.getElementById("public-header");
    if (!el) return;
    const user = Auth.getCurrentUser();
    el.innerHTML = `
      <header class="sticky top-0 z-40 glass-nav border-b border-[var(--border-color)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer" onclick="App.navigate('landing')">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              E
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">EduNova</span>
              <span class="text-[10px] uppercase font-bold tracking-widest text-blue-600 block -mt-1">Academy LMS</span>
            </div>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide uppercase text-slate-600 dark:text-slate-300">
            <a href="#landing" class="hover:text-blue-600 transition-colors">Platform</a>
            <a href="#courses" class="hover:text-blue-600 transition-colors">Curricula</a>
            <a href="#landing" onclick="setTimeout(()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'}), 80)" class="hover:text-blue-600 transition-colors">Features</a>
            <a href="#landing" onclick="setTimeout(()=>document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'}), 80)" class="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#landing" onclick="setTimeout(()=>document.getElementById('testimonials')?.scrollIntoView({behavior:'smooth'}), 80)" class="hover:text-blue-600 transition-colors">Testimonials</a>
          </nav>
          <div class="flex items-center gap-3">
            <button onclick="App.toggleTheme()" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
              🌓
            </button>
            ${
              user
                ? `<button onclick="App.navigate('dashboard')" class="btn-primary px-4 py-2 text-xs font-bold">Open Dashboard &rarr;</button>`
                : `<button onclick="App.navigate('login')" class="btn-secondary px-4 py-2 text-xs font-bold">Sign In</button>
                   <button onclick="App.navigate('register')" class="btn-primary px-5 py-2 text-xs font-bold hidden sm:inline-flex">Get Started Free</button>`
            }
          </div>
        </div>
      </header>
    `;
  }

  function renderPublicFooter() {
    const el = document.getElementById("public-footer");
    if (!el) return;
    el.innerHTML = `
      <footer class="bg-[#050914] text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
            <div class="md:col-span-2 space-y-4 pr-6">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/20">E</div>
                <span class="text-xl font-black text-white tracking-tight">EduNova LMS</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
                Next-generation Learning Management System architected for enterprise academies, universities, and high-performance learners.
              </p>
              <div class="flex items-center gap-3 pt-1 text-slate-500 text-xs">
                <span>SOC2 Type II Certified</span> • <span>FERPA Compliant</span> • <span>WCAG AAA</span>
              </div>
            </div>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
              <ul class="space-y-2.5 text-xs">
                <li><a href="#courses" class="hover:text-blue-400 transition-colors">Course Catalog</a></li>
                <li><a href="#dashboard" class="hover:text-blue-400 transition-colors">Student Hub</a></li>
                <li><a href="#dashboard" class="hover:text-blue-400 transition-colors">Faculty Workspace</a></li>
                <li><a href="#dashboard" class="hover:text-blue-400 transition-colors">Admin Governance</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">Features</h4>
              <ul class="space-y-2.5 text-xs">
                <li><a href="#courses" class="hover:text-blue-400 transition-colors">Video Lecture Theater</a></li>
                <li><a href="#assignments" class="hover:text-blue-400 transition-colors">Rubric Grading</a></li>
                <li><a href="#quizzes" class="hover:text-blue-400 transition-colors">Auto-Graded Quizzes</a></li>
                <li><a href="#profile" class="hover:text-blue-400 transition-colors">Verified Credentials</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Demo Access</h4>
              <div class="text-xs space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div class="flex items-center justify-between"><span class="text-blue-400 font-bold">Admin:</span> <span class="font-mono text-slate-300">admin@edunova.com</span></div>
                <div class="flex items-center justify-between"><span class="text-indigo-400 font-bold">Teacher:</span> <span class="font-mono text-slate-300">sarah.chen@edunova.com</span></div>
                <div class="flex items-center justify-between"><span class="text-emerald-400 font-bold">Student:</span> <span class="font-mono text-slate-300">alex.morgan@edunova.com</span></div>
                <div class="text-[10px] text-slate-400 pt-2 border-t border-slate-800">Password: <span class="font-mono text-white">admin123 / teacher123 / student123</span></div>
              </div>
            </div>
          </div>
          <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>&copy; 2026 EduNova Inc. Enterprise Academic Platform. All rights reserved.</div>
            <div class="flex items-center gap-6">
              <a href="#landing" class="hover:text-slate-400">Privacy Policy</a>
              <a href="#landing" class="hover:text-slate-400">Terms of Service</a>
              <a href="#landing" class="hover:text-slate-400">System Status</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Sidebar Component
  function renderSidebar() {
    const el = document.getElementById("app-sidebar");
    if (!el) return;
    const user = Auth.getCurrentUser();
    if (!user) return;

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "teacher", "student"] },
      { id: "courses", label: "Course Catalog", icon: "📚", roles: ["admin", "teacher", "student"] },
      { id: "assignments", label: "Assignments & Labs", icon: "📝", roles: ["admin", "teacher", "student"] },
      { id: "quizzes", label: "Timed Quizzes", icon: "⏱️", roles: ["admin", "teacher", "student"] },
      { id: "batches", label: "Cohorts & Batches", icon: "👥", roles: ["admin"] },
      { id: "users", label: "User Governance", icon: "🛡️", roles: ["admin"] },
      { id: "profile", label: "My Academic Profile", icon: "👤", roles: ["admin", "teacher", "student"] },
      { id: "settings", label: "Preferences & System", icon: "⚙️", roles: ["admin", "teacher", "student"] }
    ];

    const activeItem = currentRoute;

    const navLinksHtml = navItems
      .filter((item) => item.roles.includes(user.role))
      .map((item) => {
        const isActive = activeItem === item.id;
        return `
          <button onclick="App.navigate('${item.id}')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
            isActive
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }">
            <span class="text-base">${item.icon}</span>
            <span>${item.label}</span>
            ${isActive ? `<span class="absolute right-2 w-1.5 h-4 bg-white/40 rounded-full"></span>` : ""}
          </button>
        `;
      })
      .join("");

    el.innerHTML = `
      <div class="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div class="flex items-center gap-3 cursor-pointer" onclick="App.navigate('landing')">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            E
          </div>
          <div>
            <span class="text-lg font-black tracking-tight text-white">EduNova</span>
            <span class="text-[10px] uppercase font-bold tracking-widest text-blue-400 block -mt-1">Academy LMS</span>
          </div>
        </div>
      </div>
      <div class="px-3 py-4 flex-1 space-y-1.5 overflow-y-auto">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">Navigation</div>
        ${navLinksHtml}
      </div>
      <div class="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div class="flex items-center gap-3">
          <img src="${user.avatar}" alt="${esc(user.name)}" class="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate">${esc(user.name)}</p>
            <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              user.role === 'admin' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' :
              user.role === 'teacher' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' :
              'bg-blue-900/60 text-blue-300 border border-blue-700/50'
            }">${user.role}</span>
          </div>
          <button onclick="App.logout()" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors" title="Sign out">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  // Header Component
  function renderHeader() {
    const el = document.getElementById("app-header");
    if (!el) return;
    const user = Auth.getCurrentUser();
    if (!user) return;

    const notifs = DB.getUserNotifications(user.id);
    const unreadCount = notifs.filter((n) => !n.read).length;

    el.innerHTML = `
      <div class="flex items-center gap-3">
        <button onclick="App.toggleMobileSidebar()" class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="relative hidden sm:block w-64 lg:w-80">
          <input type="text" id="global-search" oninput="App.handleGlobalSearch(this.value)" placeholder="Search courses, lectures, notes..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-1.5 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--text-main)] placeholder-slate-400">
          <svg class="w-4 h-4 absolute left-3 top-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="App.toggleTheme()" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
          🌓
        </button>
        <!-- Notifications Dropdown -->
        <div class="relative">
          <button onclick="App.toggleNotificationsMenu()" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            ${unreadCount > 0 ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>` : ""}
          </button>
          <div id="notifications-menu" class="hidden absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-4 border border-[var(--border-color)] z-50">
            <div class="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <span class="font-bold text-sm text-[var(--text-main)]">Notifications (${unreadCount})</span>
              <button onclick="App.markAllRead()" class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Mark all read</button>
            </div>
            <div class="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)] pt-2">
              ${
                notifs.length === 0
                  ? `<div class="py-6 text-center text-xs text-slate-400">No notifications yet</div>`
                  : notifs
                      .map(
                        (n) => `
                    <div class="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors ${n.read ? 'opacity-70' : 'font-semibold'}" onclick="App.handleNotifClick('${n.id}', '${n.link || '#'}')">
                      <div class="text-xs text-[var(--text-main)]">${esc(n.title)}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${esc(n.message)}</div>
                      <div class="text-[9px] text-slate-400 mt-1">${new Date(n.date).toLocaleDateString()}</div>
                    </div>
                  `
                      )
                      .join("")
              }
            </div>
          </div>
        </div>
        <!-- Profile Pill -->
        <div class="flex items-center gap-2.5 pl-2 border-l border-[var(--border-color)] cursor-pointer" onclick="App.navigate('profile')">
          <img src="${user.avatar}" alt="${esc(user.name)}" class="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/20">
          <div class="hidden sm:block text-left">
            <div class="text-xs font-bold text-[var(--text-main)] leading-tight">${esc(user.name)}</div>
            <div class="text-[10px] text-slate-400 capitalize">${user.role}</div>
          </div>
        </div>
      </div>
    `;
  }

  function toggleNotificationsMenu() {
    const menu = document.getElementById("notifications-menu");
    if (menu) menu.classList.toggle("hidden");
  }

  function markAllRead() {
    const user = Auth.getCurrentUser();
    if (user) {
      DB.markAllNotificationsRead(user.id);
      showToast("All notifications marked as read", "success");
      renderHeader();
    }
  }

  function handleNotifClick(notifId, link) {
    DB.markNotificationRead(notifId);
    toggleNotificationsMenu();
    if (link && link.startsWith("#")) {
      navigate(link.substring(1));
    }
  }

  function toggleMobileSidebar() {
    const drawer = document.getElementById("mobile-sidebar-drawer");
    const sidebar = document.getElementById("app-sidebar");
    if (drawer && sidebar) {
      const isHidden = drawer.classList.contains("hidden");
      if (isHidden) {
        drawer.classList.remove("hidden");
        sidebar.classList.remove("hidden");
        sidebar.classList.add("fixed", "inset-y-0", "left-0", "z-50", "flex");
      } else {
        drawer.classList.add("hidden");
        sidebar.classList.add("hidden");
        sidebar.classList.remove("fixed", "inset-y-0", "left-0", "z-50");
      }
    }
  }

  function handleGlobalSearch(term) {
    if (!term || term.trim().length < 2) return;
    if (currentRoute !== "courses") {
      navigate("courses");
    }
    setTimeout(() => {
      const input = document.getElementById("course-search-input");
      if (input) {
        input.value = term;
        input.dispatchEvent(new Event("input"));
      }
    }, 50);
  }

  // =========================================================================
  // ROUTE RENDERERS (13 REQUIRED PAGES)
  // =========================================================================
  function renderRoute(route) {
    const main = document.getElementById("main-content");
    if (!main) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (route) {
      case "landing":
        renderLanding(main);
        break;
      case "login":
        renderLogin(main);
        break;
      case "register":
        renderRegister(main);
        break;
      case "dashboard":
        renderDashboard(main);
        break;
      case "courses":
        renderCourseCatalog(main);
        break;
      case "course-details":
        renderCourseDetails(main);
        break;
      case "learn":
        renderLessonLearning(main);
        break;
      case "assignments":
        renderAssignments(main);
        break;
      case "quizzes":
        renderQuizzes(main);
        break;
      case "batches":
        renderBatches(main);
        break;
      case "users":
        renderUsers(main);
        break;
      case "profile":
        renderProfile(main);
        break;
      case "settings":
        renderSettings(main);
        break;
      default:
        renderDashboard(main);
        break;
    }
  }

  // 1. LANDING PAGE (Commercial SaaS Caliber)
  function renderLanding(container) {
    const courses = DB.getCourses().slice(0, 3);

    container.innerHTML = `
      <div class="page-view overflow-hidden">
        <!-- Hero Section with Ambient Glow -->
        <section class="relative pt-20 pb-28 lg:pt-28 lg:pb-36 hero-glow-bg bg-[#060b18] text-white border-b border-slate-800/80">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <!-- Announcement Pill -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold mb-8 backdrop-blur-md hover:bg-blue-500/20 transition-all cursor-pointer" onclick="App.navigate('courses')">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>✨ EduNova 2.0 Released • Next-Gen AI Academic Platform &rarr;</span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
              The Academic Operating System for <span class="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">World-Class Institutions</span>
            </h1>

            <p class="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Empower schools, faculty, and scholars with intelligent course authoring, automated quiz evaluations, video lecture theaters, and verifiable digital credentials.
            </p>

            <!-- Call to Actions -->
            <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button onclick="App.navigate('register')" class="btn-primary px-8 py-3.5 text-sm font-bold shadow-xl shadow-blue-500/30">
                Start Free Trial &rarr;
              </button>
              <button onclick="App.quickSwitchRole('student')" class="btn-secondary px-6 py-3.5 text-sm font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20">
                ⚡ Explore Live Demo
              </button>
            </div>

            <!-- SaaS Interactive Dashboard Mockup Preview -->
            <div class="mt-16 relative max-w-5xl mx-auto">
              <div class="rounded-2xl p-2 bg-gradient-to-b from-blue-500/30 via-indigo-500/10 to-transparent border border-blue-400/20 shadow-2xl backdrop-blur-md">
                <div class="rounded-xl bg-[#091124] border border-slate-800 overflow-hidden text-left shadow-2xl">
                  <!-- Browser Bar -->
                  <div class="h-10 bg-[#060b17] border-b border-slate-800 px-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div class="text-[11px] font-mono text-slate-400 bg-slate-900 px-4 py-1 rounded-md border border-slate-800">https://edunova.academy/app/dashboard</div>
                    <div class="text-xs text-blue-400 font-bold">EduNova 2.0 Active</div>
                  </div>
                  <!-- Mockup Content -->
                  <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="edu-card bg-[#0d1630] border-slate-800 p-5 space-y-2">
                      <div class="text-[10px] font-bold text-slate-400 uppercase">ACTIVE SCHOLARS</div>
                      <div class="text-2xl font-black text-white">15,420</div>
                      <div class="text-[10px] text-emerald-400 font-semibold">▲ +24% Retention Rate</div>
                    </div>
                    <div class="edu-card bg-[#0d1630] border-slate-800 p-5 space-y-2">
                      <div class="text-[10px] font-bold text-slate-400 uppercase">COURSE PASS RATE</div>
                      <div class="text-2xl font-black text-blue-400">99.4%</div>
                      <div class="text-[10px] text-blue-300 font-semibold">Verified Digital Capstones</div>
                    </div>
                    <div class="edu-card bg-[#0d1630] border-slate-800 p-5 space-y-2">
                      <div class="text-[10px] font-bold text-slate-400 uppercase">FACULTY NETWORK</div>
                      <div class="text-2xl font-black text-violet-400">520+</div>
                      <div class="text-[10px] text-violet-300 font-semibold">PhDs & Lead Architects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Proof / Institutional Logos -->
            <div class="mt-16 pt-10 border-t border-slate-800/80">
              <span class="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-6">Trusted by Premier Technical Academies & Global Learning Networks</span>
              <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-extrabold tracking-wider text-slate-400">
                <span class="hover:text-white transition-colors">STANFORD ONLINE</span>
                <span class="hover:text-white transition-colors">MIT OPENCOURSE</span>
                <span class="hover:text-white transition-colors">CAMBRIDGE TECH</span>
                <span class="hover:text-white transition-colors">GOOGLE EDU</span>
                <span class="hover:text-white transition-colors">AWS ACADEMY</span>
              </div>
            </div>

          </div>
        </section>

        <!-- Stats Bar -->
        <section class="py-12 bg-[var(--bg-subtle)] border-b border-[var(--border-color)]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">15,000+</div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Enrolled Learners</div>
              </div>
              <div>
                <div class="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">99.4%</div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Completion Rate</div>
              </div>
              <div>
                <div class="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400">520+</div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Master Instructors</div>
              </div>
              <div>
                <div class="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">4.95 ★</div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Global Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Comprehensive Capabilities</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] mt-2">Engineered for Academic Excellence</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-3">From modern video lecture streaming to verifiable certificates, EduNova handles the entire academic lifecycle.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">🎬</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Interactive Video Theater</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Integrated player with timestamped note-taking, speed controls, downloadable resources, and contextual Q&A discussions.</p>
            </div>
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">⏱️</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Timed Auto-Graded Quizzes</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Instant evaluation, live countdown timers, randomized questions, and comprehensive review breakdowns with explanations.</p>
            </div>
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl font-bold">📜</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Verified Credentials</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Printable and verifiable digital certificates automatically issued upon 100% course syllabus completion with unique verification IDs.</p>
            </div>
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">📊</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Real-Time Academic Analytics</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Interactive SVG charts for enrollment trajectories, grade distributions, and curriculum progression across all student cohorts.</p>
            </div>
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">📝</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Assignment Rubrics & Grading</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Faculty can review student project deliverables, assign numerical marks, and provide qualitative constructive feedback.</p>
            </div>
            <div class="edu-card p-8 space-y-4 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">👥</div>
              <h3 class="text-lg font-bold text-[var(--text-main)]">Cohort & Batch Management</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Administrators can schedule semester cohorts, track batch capacity, assign faculty leads, and broadcast campus announcements.</p>
            </div>
          </div>
        </section>

        <!-- How It Works Flow -->
        <section id="how-it-works" class="py-20 bg-[var(--bg-subtle)] border-y border-[var(--border-color)]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16">
              <span class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Intuitive Workflow</span>
              <h2 class="text-3xl font-extrabold text-[var(--text-main)] mt-2">How EduNova Works</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
              <div class="p-6 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">1</div>
                <h3 class="text-base font-bold text-[var(--text-main)]">Enroll & Stream Lectures</h3>
                <p class="text-xs text-slate-500 leading-relaxed">Browse industry-grade courses and stream high-definition lectures with autosaved notes and lecture resources.</p>
              </div>
              <div class="p-6 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">2</div>
                <h3 class="text-base font-bold text-[var(--text-main)]">Submit Labs & Take Quizzes</h3>
                <p class="text-xs text-slate-500 leading-relaxed">Complete real-world project assignments, receive personalized faculty marks, and master timed comprehension quizzes.</p>
              </div>
              <div class="p-6 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-violet-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-violet-500/30">3</div>
                <h3 class="text-base font-bold text-[var(--text-main)]">Earn Verified Credentials</h3>
                <p class="text-xs text-slate-500 leading-relaxed">Graduate with official tamper-proof digital completion certificates complete with unique verification codes.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Course Showcase -->
        <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-12">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Featured Curricula</span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] mt-1">Explore High-Impact Programs</h2>
            </div>
            <button onclick="App.navigate('courses')" class="btn-secondary px-4 py-2 text-xs font-bold">Browse All &rarr;</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${courses.map((c) => App.renderCourseCardHtml(c)).join("")}
          </div>
        </section>

        <!-- Testimonials -->
        <section id="testimonials" class="py-24 bg-[var(--bg-subtle)] border-t border-[var(--border-color)]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-16">
              <span class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Voices of EduNova</span>
              <h2 class="text-3xl font-extrabold text-[var(--text-main)] mt-2">Trusted by Leading Instructors & Scholars</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="edu-card p-6 space-y-4">
                <div class="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
                <p class="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "EduNova revolutionized how I run our Computer Science capstones. The assignment grading rubrics and direct code feedback workflow cut my grading time in half."
                </p>
                <div class="flex items-center gap-3 pt-2 border-t border-[var(--border-color)]">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" class="w-9 h-9 rounded-full object-cover">
                  <div>
                    <div class="text-xs font-bold text-[var(--text-main)]">Prof. Sarah Chen</div>
                    <div class="text-[10px] text-slate-400">Faculty Lead</div>
                  </div>
                </div>
              </div>
              <div class="edu-card p-6 space-y-4">
                <div class="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
                <p class="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "The lecture notes sync directly with my video player. I can mark lessons complete, track my GPA in real-time, and download my verified completion certificates."
                </p>
                <div class="flex items-center gap-3 pt-2 border-t border-[var(--border-color)]">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" class="w-9 h-9 rounded-full object-cover">
                  <div>
                    <div class="text-xs font-bold text-[var(--text-main)]">Alex Morgan</div>
                    <div class="text-[10px] text-slate-400">Student Scholar</div>
                  </div>
                </div>
              </div>
              <div class="edu-card p-6 space-y-4">
                <div class="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
                <p class="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "Managing multi-cohort batch schedules and tracking student retention metrics across 500+ learners has never been smoother. A true enterprise-ready LMS."
                </p>
                <div class="flex items-center gap-3 pt-2 border-t border-[var(--border-color)]">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" class="w-9 h-9 rounded-full object-cover">
                  <div>
                    <div class="text-xs font-bold text-[var(--text-main)]">Dr. Robert Vance</div>
                    <div class="text-[10px] text-slate-400">Dean of Technology</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Banner -->
        <section class="py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white text-center">
          <div class="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Elevate Your Academic Experience?</h2>
            <p class="mt-4 text-base text-blue-100 max-w-xl mx-auto">Create your free account today or log in to continue your personalized learning journey on EduNova.</p>
            <div class="mt-8 flex justify-center gap-4">
              <button onclick="App.navigate('register')" class="px-8 py-3.5 rounded-xl bg-white text-blue-800 font-extrabold shadow-xl hover:bg-blue-50 transition-all">Create Free Account</button>
              <button onclick="App.navigate('login')" class="px-6 py-3.5 rounded-xl bg-blue-900/60 text-white font-semibold border border-white/20 hover:bg-blue-900/80 transition-all">Sign In</button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // 2. LOGIN PAGE
  function renderLogin(container) {
    container.innerHTML = `
      <div class="page-view min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <div class="w-full max-w-md edu-card p-8 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              E
            </div>
            <h2 class="text-2xl font-black text-[var(--text-main)]">Welcome to EduNova</h2>
            <p class="text-xs text-slate-500">Sign in to access your courses, grades, and materials.</p>
          </div>

          <!-- Quick 1-Click Demo Fill -->
          <div class="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3.5 rounded-xl space-y-2">
            <span class="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">⚡ Quick 1-Click Demo Login:</span>
            <div class="grid grid-cols-3 gap-2">
              <button onclick="App.fillDemoLogin('student')" class="py-1.5 px-2 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                Student
              </button>
              <button onclick="App.fillDemoLogin('teacher')" class="py-1.5 px-2 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-800 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                Teacher
              </button>
              <button onclick="App.fillDemoLogin('admin')" class="py-1.5 px-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 rounded-lg text-[11px] font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                Admin
              </button>
            </div>
          </div>

          <form id="login-form" onsubmit="App.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" id="login-email" required placeholder="alex.morgan@edunova.com" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Password</label>
              <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <button type="submit" class="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider">
              Sign In to EduNova
            </button>
          </form>

          <div class="text-center text-xs text-slate-500">
            Don't have an account? <a href="#register" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">Register here</a>
          </div>
        </div>
      </div>
    `;
  }

  function fillDemoLogin(role) {
    const creds = {
      student: { email: "alex.morgan@edunova.com", pass: "student123" },
      teacher: { email: "sarah.chen@edunova.com", pass: "teacher123" },
      admin: { email: "admin@edunova.com", pass: "admin123" }
    };
    const c = creds[role];
    if (c) {
      document.getElementById("login-email").value = c.email;
      document.getElementById("login-password").value = c.pass;
      showToast(`Filled ${role} demo credentials`, "info");
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;
    try {
      const user = Auth.login(email, pass);
      showToast(`Welcome back, ${user.name}!`, "success");
      navigate("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // 3. REGISTRATION PAGE
  function renderRegister(container) {
    container.innerHTML = `
      <div class="page-view min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <div class="w-full max-w-md edu-card p-8 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              E
            </div>
            <h2 class="text-2xl font-black text-[var(--text-main)]">Create an Account</h2>
            <p class="text-xs text-slate-500">Join EduNova to unlock premium courses and learning tracks.</p>
          </div>

          <form id="register-form" onsubmit="App.handleRegister(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" id="reg-name" required placeholder="Elena Rostova" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" id="reg-email" required placeholder="elena@university.edu" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Password</label>
              <input type="password" id="reg-password" required minlength="6" placeholder="At least 6 characters" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Primary Role</label>
              <select id="reg-role" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="student">Student / Scholar</option>
                <option value="teacher">Teacher / Faculty Instructor</option>
              </select>
            </div>
            <button type="submit" class="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider">
              Create My Account
            </button>
          </form>

          <div class="text-center text-xs text-slate-500">
            Already registered? <a href="#login" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign in here</a>
          </div>
        </div>
      </div>
    `;
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;

    try {
      const user = Auth.register({ name, email, password, role });
      showToast(`Account created successfully! Welcome, ${user.name}`, "success");
      navigate("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // 4. MAIN ROLE-BASED DASHBOARD DISPATCHER
  function renderDashboard(container) {
    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    if (user.role === "admin") {
      renderAdminDashboard(container, user);
    } else if (user.role === "teacher") {
      renderTeacherDashboard(container, user);
    } else {
      renderStudentDashboard(container, user);
    }
  }

  // ADMIN DASHBOARD
  function renderAdminDashboard(container, user) {
    const users = DB.getUsers();
    const courses = DB.getCourses();
    const enrollments = DB.getEnrollments();
    const batches = DB.getBatches();
    const announcements = DB.getAnnouncements();

    const students = users.filter((u) => u.role === "student");
    const teachers = users.filter((u) => u.role === "teacher");

    container.innerHTML = `
      <div class="page-view space-y-8">
        <!-- Welcome Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-[11px] font-bold uppercase tracking-wider">Institution Administration</span>
            <h1 class="text-2xl sm:text-3xl font-black">Admin Command Center</h1>
            <p class="text-xs text-purple-200">Welcome, ${esc(user.name)}. System status: Nominal across all academic clusters.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openCreateCourseModal()" class="px-4 py-2 bg-white text-purple-900 rounded-xl text-xs font-bold hover:bg-purple-50 transition-all shadow-md">
              + New Course
            </button>
            <button onclick="App.openCreateBatchModal()" class="px-4 py-2 bg-purple-600/80 text-white rounded-xl text-xs font-bold hover:bg-purple-600 transition-all">
              + New Batch
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #3b82f6;">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>TOTAL STUDENTS</span>
              <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-[10px]">+18% MoM</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${students.length}</div>
            <div class="text-[11px] text-slate-400">Enrolled across batches</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #6366f1;">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>FACULTY MEMBERS</span>
              <span class="text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md text-[10px]">Verified</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${teachers.length}</div>
            <div class="text-[11px] text-slate-400">Active instructors</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #8b5cf6;">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>ACTIVE COURSES</span>
              <span class="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md text-[10px]">Catalog</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${courses.length}</div>
            <div class="text-[11px] text-slate-400">${courses.filter((c) => c.isPublished).length} published live</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #ec4899;">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>ACTIVE BATCHES</span>
              <span class="text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md text-[10px]">Cohorts</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${batches.length}</div>
            <div class="text-[11px] text-slate-400">Running cohorts</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-[var(--text-main)]">Platform Enrollment Trajectory</h3>
                <p class="text-[11px] text-slate-400">Monthly active learner admissions</p>
              </div>
              <span class="text-xs font-bold text-blue-600">Total: 248</span>
            </div>
            <div id="admin-area-chart"></div>
          </div>
          <div class="edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-[var(--text-main)]">Platform Completion Ratio</h3>
                <p class="text-[11px] text-slate-400">Student curriculum progression</p>
              </div>
              <span class="text-xs font-bold text-emerald-600">Active</span>
            </div>
            <div id="admin-donut-chart"></div>
          </div>
        </div>

        <!-- Quick Management Tables: Recent Users & Batches -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--text-main)]">Recent Enrollments</h3>
              <button onclick="App.navigate('users')" class="text-xs text-blue-600 font-bold hover:underline">View All Users &rarr;</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-[var(--border-color)] text-slate-400 font-bold uppercase text-[10px]">
                    <th class="pb-2">Student</th>
                    <th class="pb-2">Course</th>
                    <th class="pb-2">Progress</th>
                    <th class="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border-subtle)]">
                  ${enrollments
                    .slice(0, 5)
                    .map((enr) => {
                      const student = DB.getUser(enr.userId);
                      const course = DB.getCourse(enr.courseId);
                      return `
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td class="py-3 flex items-center gap-2">
                          <img src="${student ? student.avatar : ''}" class="w-7 h-7 rounded-full object-cover">
                          <div>
                            <div class="font-bold text-[var(--text-main)]">${esc(student ? student.name : 'Unknown')}</div>
                            <div class="text-[10px] text-slate-400">${esc(student ? student.email : '')}</div>
                          </div>
                        </td>
                        <td class="py-3 font-medium text-[var(--text-main)]">${esc(course ? course.title : 'Course')}</td>
                        <td class="py-3">
                          <div class="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full rounded-full" style="width: ${enr.progress}%"></div>
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono mt-0.5">${enr.progress}%</span>
                        </td>
                        <td class="py-3">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${enr.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
                            ${enr.status}
                          </span>
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Announcements Board -->
          <div class="edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--text-main)]">System Broadcasts</h3>
              <button onclick="App.openCreateAnnouncementModal()" class="text-xs text-purple-600 font-bold hover:underline">+ Post</button>
            </div>
            <div class="space-y-3">
              ${announcements
                .map(
                  (a) => `
                <div class="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">${a.category}</span>
                    <span class="text-[9px] text-slate-400">${new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <h4 class="text-xs font-bold text-[var(--text-main)]">${esc(a.title)}</h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">${esc(a.content)}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      Charts.renderAreaChart("admin-area-chart", {
        data: [
          { label: "Jun", value: 65 },
          { label: "Jul", value: 98 },
          { label: "Aug", value: 140 },
          { label: "Sep", value: 195 },
          { label: "Oct", value: 220 },
          { label: "Nov", value: 248 }
        ]
      });
      Charts.renderDonutChart("admin-donut-chart", {
        segments: [
          { label: "Completed", value: 38, color: "#10b981" },
          { label: "In Progress", value: 52, color: "#2563eb" },
          { label: "Pending", value: 10, color: "#94a3b8" }
        ],
        centerLabel: "90%",
        centerSub: "Engagement"
      });
    }, 50);
  }

  // TEACHER DASHBOARD
  function renderTeacherDashboard(container, user) {
    const courses = DB.getCourses().filter((c) => c.instructorId === user.id);
    const assignments = DB.getAssignments().filter((a) => a.teacherId === user.id);
    const allSubs = DB.getSubmissions();
    const pendingSubs = allSubs.filter((s) => {
      const asg = DB.getAssignment(s.assignmentId);
      return asg && asg.teacherId === user.id && s.status === "submitted";
    });

    let totalEnrolled = 0;
    courses.forEach((c) => (totalEnrolled += c.enrolledCount || 0));

    container.innerHTML = `
      <div class="page-view space-y-8">
        <!-- Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[11px] font-bold uppercase tracking-wider">Faculty Portal</span>
            <h1 class="text-2xl sm:text-3xl font-black">Instructor Workspace</h1>
            <p class="text-xs text-blue-200">Welcome, ${esc(user.name)}. You have <span class="font-bold underline">${pendingSubs.length} pending submissions</span> requiring grading.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openCreateAssignmentModal()" class="px-4 py-2 bg-white text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-md">
              + New Assignment
            </button>
            <button onclick="App.openCreateQuizModal()" class="px-4 py-2 bg-blue-600/80 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all">
              + New Quiz
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #2563eb;">
            <div class="text-xs font-bold text-slate-500 uppercase">My Courses</div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${courses.length}</div>
            <div class="text-[11px] text-slate-400">Assigned curricula</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #10b981;">
            <div class="text-xs font-bold text-slate-500 uppercase">Enrolled Students</div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${totalEnrolled}</div>
            <div class="text-[11px] text-emerald-600 font-semibold">Active scholars</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #f59e0b;">
            <div class="text-xs font-bold text-slate-500 uppercase">Pending Grading</div>
            <div class="text-2xl sm:text-3xl font-black text-amber-500">${pendingSubs.length}</div>
            <div class="text-[11px] text-slate-400">Needs evaluation</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #6366f1;">
            <div class="text-xs font-bold text-slate-500 uppercase">Average Score</div>
            <div class="text-2xl sm:text-3xl font-black text-blue-600">92.4%</div>
            <div class="text-[11px] text-slate-400">Class GPA performance</div>
          </div>
        </div>

        <!-- Grade Distribution Chart & Submission Queue -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="edu-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-[var(--text-main)]">Student Grade Distribution</h3>
            <p class="text-[11px] text-slate-400">Aggregated rubric scores across active assignments</p>
            <div id="teacher-bar-chart"></div>
          </div>

          <!-- Pending Grading Queue -->
          <div class="edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--text-main)]">Pending Submissions Queue</h3>
              <button onclick="App.navigate('assignments')" class="text-xs text-blue-600 font-bold hover:underline">All Assignments &rarr;</button>
            </div>
            <div class="space-y-3 max-h-72 overflow-y-auto">
              ${
                pendingSubs.length === 0
                  ? `<div class="p-6 text-center text-xs text-slate-400">All student submissions are graded! Great work!</div>`
                  : pendingSubs
                      .map((sub) => {
                        const asg = DB.getAssignment(sub.assignmentId);
                        return `
                    <div class="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2.5">
                        <img src="${sub.studentAvatar}" class="w-8 h-8 rounded-full object-cover">
                        <div>
                          <div class="text-xs font-bold text-[var(--text-main)]">${esc(sub.studentName)}</div>
                          <div class="text-[10px] text-slate-400">${esc(asg ? asg.title : "Assignment")}</div>
                        </div>
                      </div>
                      <button onclick="App.openGradeSubmissionModal('${sub.id}')" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm">
                        Grade &rarr;
                      </button>
                    </div>
                  `;
                      })
                      .join("")
              }
            </div>
          </div>
        </div>

        <!-- Instructor's Courses -->
        <div class="edu-card p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-[var(--text-main)]">My Teaching Courses</h3>
            <button onclick="App.openCreateCourseModal()" class="text-xs text-blue-600 font-bold hover:underline">+ Create Course</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${courses.map((c) => App.renderCourseCardHtml(c)).join("")}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      Charts.renderBarChart("teacher-bar-chart", {
        data: [
          { label: "A (90-100)", value: 54, color: "#10b981" },
          { label: "B (80-89)", value: 38, color: "#2563eb" },
          { label: "C (70-79)", value: 16, color: "#6366f1" },
          { label: "D (60-69)", value: 6, color: "#f59e0b" },
          { label: "F (<60)", value: 2, color: "#ef4444" }
        ]
      });
    }, 50);
  }

  // STUDENT DASHBOARD
  function renderStudentDashboard(container, user) {
    const enrollments = DB.getUserEnrollments(user.id);
    const assignments = DB.getAssignments();
    const mySubmissions = DB.getStudentSubmissions(user.id);
    const announcements = DB.getAnnouncements();

    // Find first course with unwatched lesson to continue
    let continueCourse = null;
    let continueLesson = null;
    for (const enr of enrollments) {
      const course = DB.getCourse(enr.courseId);
      if (course && course.chapters) {
        for (const ch of course.chapters) {
          for (const les of ch.lessons || []) {
            if (!enr.completedLessons.includes(les.id)) {
              continueCourse = course;
              continueLesson = les;
              break;
            }
          }
          if (continueLesson) break;
        }
      }
      if (continueLesson) break;
    }

    if (!continueCourse && enrollments.length > 0) {
      continueCourse = DB.getCourse(enrollments[0].courseId);
      if (continueCourse && continueCourse.chapters && continueCourse.chapters[0]) {
        continueLesson = continueCourse.chapters[0].lessons[0];
      }
    }

    let totalCompletedLessons = 0;
    enrollments.forEach((e) => (totalCompletedLessons += (e.completedLessons || []).length));

    container.innerHTML = `
      <div class="page-view space-y-8">
        <!-- Student Hero Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[11px] font-bold uppercase tracking-wider">Student Academic Hub</span>
            <h1 class="text-2xl sm:text-3xl font-black">Welcome Back, ${esc(user.name)}!</h1>
            <p class="text-xs text-blue-200">You are enrolled in <span class="font-bold underline">${enrollments.length} active programs</span>. Ready to dive into your next lecture?</p>
          </div>
          ${
            continueCourse && continueLesson
              ? `
            <button onclick="App.navigate('learn/${continueCourse.id}/${continueLesson.id}')" class="btn-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30">
              ▶ Resume: ${esc(continueLesson.title)}
            </button>
          `
              : `<button onclick="App.navigate('courses')" class="btn-primary px-6 py-3.5 text-xs font-bold">Browse Courses</button>`
          }
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #2563eb;">
            <div class="text-xs font-bold text-slate-500 uppercase">Enrolled Programs</div>
            <div class="text-2xl sm:text-3xl font-black text-[var(--text-main)]">${enrollments.length}</div>
            <div class="text-[11px] text-slate-400">Active curricula</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #10b981;">
            <div class="text-xs font-bold text-slate-500 uppercase">Completed Lessons</div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600">${totalCompletedLessons}</div>
            <div class="text-[11px] text-slate-400">Lectures mastered</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #6366f1;">
            <div class="text-xs font-bold text-slate-500 uppercase">Academic GPA</div>
            <div class="text-2xl sm:text-3xl font-black text-blue-600">3.92 / 4.0</div>
            <div class="text-[11px] text-emerald-600 font-semibold">Grade: A Honor Roll</div>
          </div>
          <div class="edu-card stat-card p-5 space-y-2" style="--stat-accent: #8b5cf6;">
            <div class="text-xs font-bold text-slate-500 uppercase">Certificates Earned</div>
            <div class="text-2xl sm:text-3xl font-black text-purple-600">${enrollments.filter((e) => e.status === 'completed').length}</div>
            <div class="text-[11px] text-slate-400">Verified credentials</div>
          </div>
        </div>

        <!-- Enrolled Courses Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-[var(--text-main)]">My Enrolled Courses</h2>
            <button onclick="App.navigate('courses')" class="text-xs text-blue-600 font-bold hover:underline">Explore More &rarr;</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${
              enrollments.length === 0
                ? `<div class="col-span-3 edu-card p-12 text-center text-xs text-slate-400">You have not enrolled in any courses yet. <a href="#courses" class="text-blue-600 font-bold underline">Browse the course catalog</a> to enroll!</div>`
                : enrollments
                    .map((enr) => {
                      const course = DB.getCourse(enr.courseId);
                      if (!course) return "";
                      return `
                  <div class="edu-card overflow-hidden flex flex-col justify-between">
                    <div>
                      <div class="relative h-44 overflow-hidden">
                        <img src="${course.thumbnail}" alt="${esc(course.title)}" class="w-full h-full object-cover">
                        <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-blue-600 shadow-md">
                          ${course.category}
                        </span>
                      </div>
                      <div class="p-5 space-y-3">
                        <h3 class="text-sm font-bold text-[var(--text-main)] line-clamp-1">${esc(course.title)}</h3>
                        <p class="text-xs text-slate-500 line-clamp-2">${esc(course.tagline || course.description)}</p>
                        <!-- Progress Bar -->
                        <div class="space-y-1">
                          <div class="flex justify-between text-[11px] font-bold">
                            <span class="text-slate-500">Progress</span>
                            <span class="text-blue-600 font-mono">${enr.progress}%</span>
                          </div>
                          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width: ${enr.progress}%"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="p-5 pt-0 flex items-center justify-between gap-2 border-t border-[var(--border-color)]">
                      ${
                        enr.progress === 100
                          ? `
                        <button onclick="App.openCertificateModal('${enr.id}')" class="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition-colors">
                          📜 Certificate
                        </button>
                      `
                          : ""
                      }
                      <button onclick="App.navigate('learn/${course.id}')" class="btn-primary flex-1 py-2 text-xs font-bold">
                        Continue Learning &rarr;
                      </button>
                    </div>
                  </div>
                `;
                    })
                    .join("")
            }
          </div>
        </div>

        <!-- Assignments & Announcements Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Upcoming Assignments -->
          <div class="edu-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--text-main)]">Upcoming Deadlines</h3>
              <button onclick="App.navigate('assignments')" class="text-xs text-blue-600 font-bold hover:underline">All Assignments &rarr;</button>
            </div>
            <div class="space-y-3">
              ${assignments
                .slice(0, 3)
                .map((a) => {
                  const sub = mySubmissions.find((s) => s.assignmentId === a.id);
                  return `
                <div class="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                  <div>
                    <h4 class="text-xs font-bold text-[var(--text-main)]">${esc(a.title)}</h4>
                    <p class="text-[10px] text-slate-400">Due: ${new Date(a.dueDate).toLocaleDateString()} • Max: ${a.maxPoints} pts</p>
                  </div>
                  <div>
                    ${
                      sub
                        ? sub.status === 'graded'
                          ? `<span class="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Score: ${sub.grade}/100</span>`
                          : `<span class="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Submitted</span>`
                        : `<button onclick="App.openSubmitAssignmentModal('${a.id}')" class="btn-primary px-3 py-1 text-xs">Submit</button>`
                    }
                  </div>
                </div>
              `;
                })
                .join("")}
            </div>
          </div>

          <!-- Platform Announcements -->
          <div class="edu-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-[var(--text-main)]">Campus Announcements</h3>
            <div class="space-y-3">
              ${announcements
                .slice(0, 3)
                .map(
                  (a) => `
                <div class="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${a.category}</span>
                    <span class="text-[9px] text-slate-400">${new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <h4 class="text-xs font-bold text-[var(--text-main)]">${esc(a.title)}</h4>
                  <p class="text-[11px] text-slate-500 line-clamp-2">${esc(a.content)}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Course Card Renderer
  function renderCourseCardHtml(c) {
    const user = Auth.getCurrentUser();
    const isEnrolled = user ? DB.getUserEnrollments(user.id).some((e) => e.courseId === c.id) : false;

    return `
      <div class="edu-card overflow-hidden flex flex-col justify-between group">
        <div>
          <div class="relative h-48 overflow-hidden cursor-pointer" onclick="App.navigate('course-details/${c.id}')">
            <img src="${c.thumbnail}" alt="${esc(c.title)}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 text-blue-600 shadow-md">
              ${c.category}
            </span>
            <span class="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 text-white backdrop-blur-sm">
              ${c.level} • ${c.duration}
            </span>
          </div>
          <div class="p-5 space-y-3">
            <div class="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
              ★ ${c.rating} <span class="text-slate-400 font-normal">(${c.reviewsCount} reviews)</span>
            </div>
            <h3 class="text-sm font-bold text-[var(--text-main)] line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" onclick="App.navigate('course-details/${c.id}')">
              ${esc(c.title)}
            </h3>
            <p class="text-xs text-slate-500 line-clamp-2">${esc(c.tagline || c.description)}</p>
            <div class="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
              <img src="${c.instructorAvatar}" class="w-6 h-6 rounded-full object-cover">
              <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">${esc(c.instructorName)}</span>
            </div>
          </div>
        </div>
        <div class="p-5 pt-0 flex items-center justify-between gap-3">
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">${c.price || 'Free'}</span>
          ${
            isEnrolled
              ? `<button onclick="App.navigate('learn/${c.id}')" class="btn-secondary px-4 py-2 text-xs font-bold text-blue-600">Enrolled &rarr;</button>`
              : `<button onclick="App.handleEnrollCourse('${c.id}')" class="btn-primary px-4 py-2 text-xs font-bold">Enroll Now</button>`
          }
        </div>
      </div>
    `;
  }

  // 7. COURSE CATALOG
  function renderCourseCatalog(container) {
    const courses = DB.getCourses();
    const categories = ["All", ...new Set(courses.map((c) => c.category))];

    container.innerHTML = `
      <div class="page-view space-y-8 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600">Curricula & Tracks</span>
            <h1 class="text-3xl font-black text-[var(--text-main)] mt-1">Course Catalog</h1>
            <p class="text-xs text-slate-500 mt-1">Discover expert-designed programs taught by industry architects and university faculty.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input type="text" id="course-search-input" oninput="App.filterCoursesCatalog()" placeholder="Filter courses by title..." class="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-60">
            <select id="course-level-filter" onchange="App.filterCoursesCatalog()" class="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2" id="category-pills">
          ${categories
            .map(
              (cat, i) => `
            <button onclick="App.filterByCategory('${cat}', this)" class="category-pill px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              i === 0 ? "bg-blue-600 text-white shadow-sm" : "bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }">
              ${cat}
            </button>
          `
            )
            .join("")}
        </div>

        <!-- Course Cards Grid -->
        <div id="catalog-courses-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${courses.map((c) => App.renderCourseCardHtml(c)).join("")}
        </div>
      </div>
    `;
  }

  function filterByCategory(category, btn) {
    activeCatalogCategory = category;
    document.querySelectorAll(".category-pill").forEach((p) => {
      p.className = "category-pill px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800";
    });
    if (btn) {
      btn.className = "category-pill px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-blue-600 text-white shadow-sm";
    }
    filterCoursesCatalog();
  }

  function filterCoursesCatalog() {
    const search = (document.getElementById("course-search-input")?.value || "").toLowerCase();
    const level = document.getElementById("course-level-filter")?.value || "All";
    const grid = document.getElementById("catalog-courses-grid");
    if (!grid) return;

    let list = DB.getCourses();

    if (activeCatalogCategory !== "All") {
      list = list.filter((c) => c.category === activeCatalogCategory);
    }
    if (level !== "All") {
      list = list.filter((c) => c.level === level);
    }
    if (search.trim()) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(search) || c.description.toLowerCase().includes(search) || c.category.toLowerCase().includes(search)
      );
    }

    if (list.length === 0) {
      grid.innerHTML = `<div class="col-span-3 edu-card p-12 text-center text-xs text-slate-400">No courses match your filter criteria. Try adjusting your search term.</div>`;
    } else {
      grid.innerHTML = list.map((c) => App.renderCourseCardHtml(c)).join("");
    }
  }

  function handleEnrollCourse(courseId) {
    const user = Auth.getCurrentUser();
    if (!user) {
      showToast("Please sign in to enroll in this course.", "warning");
      navigate("login");
      return;
    }
    DB.enrollStudent(user.id, courseId);
    showToast("Successfully enrolled! Welcome to the course.", "success");
    navigate(`learn/${courseId}`);
  }

  // 8. COURSE DETAILS
  function renderCourseDetails(container) {
    const course = DB.getCourse(activeCourseId);
    if (!course) {
      container.innerHTML = `<div class="p-12 text-center text-xs text-slate-400">Course not found. <a href="#courses" class="text-blue-600 font-bold">Return to catalog</a></div>`;
      return;
    }

    const user = Auth.getCurrentUser();
    const isEnrolled = user ? DB.getUserEnrollments(user.id).some((e) => e.courseId === course.id) : false;

    let totalLessonsCount = 0;
    (course.chapters || []).forEach((ch) => (totalLessonsCount += (ch.lessons || []).length));

    container.innerHTML = `
      <div class="page-view max-w-6xl mx-auto space-y-8">
        <!-- Hero Header -->
        <div class="edu-card overflow-hidden">
          <div class="relative h-64 sm:h-80 w-full overflow-hidden">
            <img src="${course.thumbnail}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-white space-y-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md inline-block">
                ${course.category} • ${course.level}
              </span>
              <h1 class="text-2xl sm:text-4xl font-black">${esc(course.title)}</h1>
              <p class="text-xs sm:text-sm text-slate-300 max-w-3xl">${esc(course.tagline || course.description)}</p>
            </div>
          </div>
          <div class="p-6 bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)]">
            <div class="flex items-center gap-6 text-xs text-slate-500">
              <div><span class="font-bold text-[var(--text-main)]">${course.duration}</span> Duration</div>
              <div><span class="font-bold text-[var(--text-main)]">${totalLessonsCount}</span> Lessons</div>
              <div><span class="font-bold text-[var(--text-main)]">${course.enrolledCount}</span> Students Enrolled</div>
              <div class="flex items-center gap-1 text-amber-500 font-bold">★ ${course.rating} (${course.reviewsCount})</div>
            </div>
            <div>
              ${
                isEnrolled
                  ? `<button onclick="App.navigate('learn/${course.id}')" class="btn-primary px-6 py-2.5 text-xs font-bold">Go to Classroom &rarr;</button>`
                  : `<button onclick="App.handleEnrollCourse('${course.id}')" class="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-wider">Enroll in Course</button>`
              }
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content: Outcomes & Curriculum Accordion -->
          <div class="lg:col-span-2 space-y-8">
            <div class="edu-card p-6 space-y-4">
              <h2 class="text-lg font-bold text-[var(--text-main)]">What You Will Master</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${(course.outcomes || [])
                  .map(
                    (o) => `
                  <div class="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span class="text-blue-600 font-bold">✓</span>
                    <span>${esc(o)}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Syllabus Accordion -->
            <div class="edu-card p-6 space-y-4">
              <h2 class="text-lg font-bold text-[var(--text-main)]">Course Syllabus & Chapters</h2>
              <div class="space-y-3">
                ${(course.chapters || [])
                  .map(
                    (ch, idx) => `
                  <div class="border border-[var(--border-color)] rounded-xl overflow-hidden">
                    <div class="p-4 bg-[var(--bg-subtle)] flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden')">
                      <span class="text-xs font-bold text-[var(--text-main)]">Chapter ${idx + 1}: ${esc(ch.title)}</span>
                      <span class="text-[11px] text-slate-400 font-mono">${(ch.lessons || []).length} lessons</span>
                    </div>
                    <div class="divide-y divide-[var(--border-subtle)] p-2">
                      ${(ch.lessons || [])
                        .map(
                          (les) => `
                        <div class="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg">
                          <div class="flex items-center gap-2">
                            <span>🎬</span>
                            <span class="text-slate-700 dark:text-slate-200">${esc(les.title)}</span>
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono">${les.duration}</span>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- Sidebar: Instructor Bio -->
          <div class="space-y-6">
            <div class="edu-card p-6 space-y-4">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Lead Instructor</span>
              <div class="flex items-center gap-3">
                <img src="${course.instructorAvatar}" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20">
                <div>
                  <h3 class="text-sm font-bold text-[var(--text-main)]">${esc(course.instructorName)}</h3>
                  <p class="text-[11px] text-slate-400">${esc(course.instructorTitle)}</p>
                </div>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dedicated educator with proven production engineering experience committed to advancing student technical competency.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 9. LESSON LEARNING PAGE (Video Player, Notes, Discussion, Checklist)
  function renderLessonLearning(container) {
    const course = DB.getCourse(activeCourseId);
    if (!course) {
      container.innerHTML = `<div class="p-12 text-center text-xs text-slate-400">Course not found. <a href="#courses" class="text-blue-600 font-bold">Return to catalog</a></div>`;
      return;
    }

    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    let enrollment = DB.getUserEnrollments(user.id).find((e) => e.courseId === course.id);
    if (!enrollment) {
      enrollment = DB.enrollStudent(user.id, course.id);
    }

    let allLessons = [];
    (course.chapters || []).forEach((ch) => {
      (ch.lessons || []).forEach((l) => allLessons.push(l));
    });

    let currentLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
    if (!currentLesson) {
      container.innerHTML = `<div class="p-12 text-center text-xs text-slate-400">No lessons available in this course.</div>`;
      return;
    }

    const currentLessonIdx = allLessons.findIndex((l) => l.id === currentLesson.id);
    const prevLesson = currentLessonIdx > 0 ? allLessons[currentLessonIdx - 1] : null;
    const nextLesson = currentLessonIdx < allLessons.length - 1 ? allLessons[currentLessonIdx + 1] : null;

    const isCompleted = (enrollment.completedLessons || []).includes(currentLesson.id);
    const existingNote = (enrollment.notes && enrollment.notes[currentLesson.id]) || "";
    const discussions = DB.getDiscussions(course.id, currentLesson.id);

    container.innerHTML = `
      <div class="page-view flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
        <!-- Main Stage: Video, Lesson Info, Notes, Discussions -->
        <div class="flex-1 overflow-y-auto space-y-6 pr-2">
          <!-- Theater Video Player -->
          <div class="edu-card overflow-hidden bg-black shadow-2xl">
            <div class="video-container">
              <video id="lesson-video-player" controls preload="metadata" class="w-full h-full object-cover" poster="${course.thumbnail}">
                <source src="${currentLesson.videoUrl}" type="video/mp4">
                Your browser does not support HTML5 video.
              </video>
            </div>
            <div class="p-4 bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)]">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${course.title}</span>
                <h1 class="text-base sm:text-lg font-black text-[var(--text-main)]">${esc(currentLesson.title)}</h1>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="App.toggleLessonComplete('${course.id}', '${currentLesson.id}')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'btn-secondary text-slate-600 dark:text-slate-300'
                }">
                  <span>${isCompleted ? '✓ Completed' : '○ Mark as Complete'}</span>
                </button>
                ${
                  prevLesson
                    ? `<button onclick="App.navigate('learn/${course.id}/${prevLesson.id}')" class="p-2 btn-secondary text-xs font-bold" title="Previous Lecture">&larr;</button>`
                    : ""
                }
                ${
                  nextLesson
                    ? `<button onclick="App.navigate('learn/${course.id}/${nextLesson.id}')" class="btn-primary px-4 py-2 text-xs font-bold" title="Next Lecture">Next &rarr;</button>`
                    : ""
                }
              </div>
            </div>
          </div>

          <!-- Tabs: Overview, Notes, Resources, Q&A Discussion -->
          <div class="edu-card p-6 space-y-6">
            <div class="flex items-center gap-4 border-b border-[var(--border-color)] pb-3">
              <button onclick="App.switchLearnTab('overview')" id="tab-btn-overview" class="learn-tab-btn font-bold text-xs text-blue-600 pb-2 border-b-2 border-blue-600">Lecture Overview</button>
              <button onclick="App.switchLearnTab('notes')" id="tab-btn-notes" class="learn-tab-btn font-bold text-xs text-slate-400 hover:text-slate-700 pb-2">My Private Notes</button>
              <button onclick="App.switchLearnTab('resources')" id="tab-btn-resources" class="learn-tab-btn font-bold text-xs text-slate-400 hover:text-slate-700 pb-2">Resources (${(currentLesson.resources || []).length})</button>
              <button onclick="App.switchLearnTab('discussion')" id="tab-btn-discussion" class="learn-tab-btn font-bold text-xs text-slate-400 hover:text-slate-700 pb-2">Q&A Discussion (${discussions.length})</button>
            </div>

            <!-- Tab Content: Overview -->
            <div id="tab-pane-overview" class="learn-tab-pane space-y-3">
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${esc(currentLesson.description)}</p>
            </div>

            <!-- Tab Content: Notes -->
            <div id="tab-pane-notes" class="learn-tab-pane hidden space-y-3">
              <p class="text-xs text-slate-400">Notes are automatically autosaved to your private student profile for this lecture.</p>
              <textarea id="lesson-notes-textarea" oninput="App.saveNoteAuto('${course.id}', '${currentLesson.id}', this.value)" rows="6" placeholder="Type key insights, code snippets, or lecture reminders..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3.5 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono">${esc(existingNote)}</textarea>
              <span id="note-save-status" class="text-[10px] text-emerald-500 font-medium">All notes saved securely.</span>
            </div>

            <!-- Tab Content: Resources -->
            <div id="tab-pane-resources" class="learn-tab-pane hidden space-y-3">
              ${
                (currentLesson.resources || []).length === 0
                  ? `<div class="text-xs text-slate-400">No external downloads attached to this lecture.</div>`
                  : (currentLesson.resources || [])
                      .map(
                        (r) => `
                    <div class="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <span class="text-lg">📄</span>
                        <div>
                          <div class="text-xs font-bold text-[var(--text-main)]">${esc(r.name)}</div>
                          <div class="text-[10px] text-slate-400">${r.size} • ${r.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <a href="javascript:void(0)" onclick="App.showToast('Downloaded ${esc(r.name)}', 'success')" class="btn-secondary px-3 py-1.5 text-xs font-bold text-blue-600">
                        Download
                      </a>
                    </div>
                  `
                      )
                      .join("")
              }
            </div>

            <!-- Tab Content: Q&A Discussion -->
            <div id="tab-pane-discussion" class="learn-tab-pane hidden space-y-6">
              <!-- Add Comment Input -->
              <div class="flex gap-3">
                <img src="${user.avatar}" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1 space-y-2">
                  <input type="text" id="new-comment-input" placeholder="Ask a question or share feedback on this lecture..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <button onclick="App.postComment('${course.id}', '${currentLesson.id}')" class="btn-primary px-4 py-1.5 text-xs font-bold">Post Comment</button>
                </div>
              </div>

              <!-- Comment Threads -->
              <div class="space-y-4 pt-2">
                ${
                  discussions.length === 0
                    ? `<div class="text-xs text-slate-400 py-4 text-center">Be the first scholar to start a discussion!</div>`
                    : discussions
                        .map(
                          (d) => `
                      <div class="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <img src="${d.authorAvatar}" class="w-7 h-7 rounded-full object-cover">
                            <div>
                              <span class="text-xs font-bold text-[var(--text-main)]">${esc(d.authorName)}</span>
                              <span class="text-[9px] uppercase tracking-wider font-bold ml-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${d.authorRole}</span>
                            </div>
                          </div>
                          <span class="text-[10px] text-slate-400">${new Date(d.date).toLocaleDateString()}</span>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-300">${esc(d.text)}</p>
                        <div class="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <button onclick="App.upvoteComment('${d.id}')" class="hover:text-blue-600 flex items-center gap-1 font-semibold">
                            ▲ Upvote (${d.upvotes})
                          </button>
                        </div>
                        <!-- Nested Replies -->
                        ${
                          (d.replies || []).length > 0
                            ? `
                          <div class="pl-4 border-l-2 border-blue-500/30 space-y-2 mt-2">
                            ${(d.replies || [])
                              .map(
                                (r) => `
                              <div class="p-2.5 rounded-lg bg-[var(--bg-surface)] text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                  <span class="font-bold text-[var(--text-main)]">${esc(r.authorName)} <span class="text-[9px] text-indigo-500 font-bold uppercase">(${r.authorRole})</span></span>
                                  <span class="text-[9px] text-slate-400">${new Date(r.date).toLocaleDateString()}</span>
                                </div>
                                <p class="text-slate-600 dark:text-slate-300">${esc(r.text)}</p>
                              </div>
                            `
                              )
                              .join("")}
                          </div>
                        `
                            : ""
                        }
                      </div>
                    `
                        )
                        .join("")
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Curriculum Navigation -->
        <div class="w-full lg:w-80 edu-card p-5 flex flex-col justify-between overflow-y-auto space-y-4">
          <div class="space-y-4">
            <div class="border-b border-[var(--border-color)] pb-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Curriculum Progress</span>
              <div class="flex items-center justify-between text-xs font-bold mt-1">
                <span class="text-[var(--text-main)]">${enrollment.completedLessons.length} of ${allLessons.length} completed</span>
                <span class="text-blue-600 font-mono">${enrollment.progress}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div class="bg-blue-600 h-full rounded-full transition-all" style="width: ${enrollment.progress}%"></div>
              </div>
            </div>

            <!-- Chapters List -->
            <div class="space-y-3">
              ${(course.chapters || [])
                .map(
                  (ch, chIdx) => `
                <div class="space-y-1.5">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Section ${chIdx + 1}: ${esc(ch.title)}</div>
                  <div class="space-y-1">
                    ${(ch.lessons || [])
                      .map((les) => {
                        const isThis = les.id === currentLesson.id;
                        const isDone = (enrollment.completedLessons || []).includes(les.id);
                        return `
                        <button onclick="App.navigate('learn/${course.id}/${les.id}')" class="w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isThis
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                            : 'hover:bg-[var(--bg-subtle)] text-[var(--text-main)]'
                        }">
                          <div class="flex items-center gap-2 truncate">
                            <span class="${isDone ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${isDone ? '✓' : '○'}</span>
                            <span class="truncate">${esc(les.title)}</span>
                          </div>
                          <span class="text-[10px] opacity-70 font-mono flex-shrink-0 ml-2">${les.duration}</span>
                        </button>
                      `;
                      })
                      .join("")}
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function toggleLessonComplete(courseId, lessonId) {
    const user = Auth.getCurrentUser();
    if (user) {
      const enr = DB.markLessonCompleted(user.id, courseId, lessonId);
      if (enr.progress === 100) {
        showToast("🎉 Congratulations! You have fully completed this course and earned your Verified Certificate!", "success");
      } else {
        showToast("Lesson progress updated", "info");
      }
      renderLessonLearning(document.getElementById("main-content"));
    }
  }

  let noteTimeout = null;
  function saveNoteAuto(courseId, lessonId, note) {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const status = document.getElementById("note-save-status");
    if (status) status.innerText = "Saving note...";

    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(() => {
      DB.saveLessonNote(user.id, courseId, lessonId, note);
      if (status) status.innerText = "All notes saved securely.";
    }, 600);
  }

  function switchLearnTab(tab) {
    document.querySelectorAll(".learn-tab-btn").forEach((b) => {
      b.className = "learn-tab-btn font-bold text-xs text-slate-400 hover:text-slate-700 pb-2";
    });
    document.querySelectorAll(".learn-tab-pane").forEach((p) => p.classList.add("hidden"));

    const btn = document.getElementById(`tab-btn-${tab}`);
    const pane = document.getElementById(`tab-pane-${tab}`);
    if (btn) btn.className = "learn-tab-btn font-bold text-xs text-blue-600 pb-2 border-b-2 border-blue-600";
    if (pane) pane.classList.remove("hidden");
  }

  function postComment(courseId, lessonId) {
    const user = Auth.getCurrentUser();
    const input = document.getElementById("new-comment-input");
    if (!user || !input || !input.value.trim()) return;

    DB.addDiscussion({
      courseId,
      lessonId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      text: input.value.trim()
    });

    input.value = "";
    showToast("Comment posted", "success");
    renderLessonLearning(document.getElementById("main-content"));
    switchLearnTab("discussion");
  }

  function upvoteComment(discId) {
    DB.upvoteDiscussion(discId);
    renderLessonLearning(document.getElementById("main-content"));
    switchLearnTab("discussion");
  }

  // 10. ASSIGNMENTS PAGE (Role-tailored: Teacher grades, Student submits)
  function renderAssignments(container) {
    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    const assignments = DB.getAssignments();
    const isTeacherOrAdmin = user.role === "teacher" || user.role === "admin";

    container.innerHTML = `
      <div class="page-view max-w-6xl mx-auto space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600">Course Projects & Labs</span>
            <h1 class="text-3xl font-black text-[var(--text-main)] mt-1">Assignments Hub</h1>
            <p class="text-xs text-slate-500 mt-1">${isTeacherOrAdmin ? "Review submissions, assign grades, and author new project rubrics." : "Submit coursework, review grading rubrics, and inspect teacher feedback."}</p>
          </div>
          ${
            isTeacherOrAdmin
              ? `<button onclick="App.openCreateAssignmentModal()" class="btn-primary px-4 py-2.5 text-xs font-bold">+ Create Assignment</button>`
              : ""
          }
        </div>

        <div class="space-y-6">
          ${assignments
            .map((asg) => {
              const subs = DB.getAssignmentSubmissions(asg.id);
              const mySub = subs.find((s) => s.studentId === user.id);

              return `
              <div class="edu-card p-6 space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${asg.courseTitle}</span>
                    <h2 class="text-lg font-black text-[var(--text-main)]">${esc(asg.title)}</h2>
                    <p class="text-xs text-slate-500 mt-1 whitespace-pre-line">${esc(asg.description)}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="text-xs font-bold text-slate-400">Due: ${new Date(asg.dueDate).toLocaleDateString()}</span>
                    <div class="text-sm font-black text-blue-600 mt-0.5">${asg.maxPoints} Points</div>
                  </div>
                </div>

                <!-- Action Bar based on Role -->
                <div class="pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
                  ${
                    isTeacherOrAdmin
                      ? `
                    <div class="text-xs text-slate-500 font-medium">
                      Submissions: <span class="font-bold text-[var(--text-main)]">${subs.length} total</span> (${subs.filter((s) => s.status === 'submitted').length} pending review)
                    </div>
                    <div class="flex items-center gap-2">
                      <button onclick="App.openSubmissionsListModal('${asg.id}')" class="btn-secondary px-4 py-2 text-xs font-bold text-blue-600">
                        View Submissions (${subs.length}) &rarr;
                      </button>
                    </div>
                  `
                      : `
                    <div>
                      ${
                        mySub
                          ? mySub.status === 'graded'
                            ? `
                            <div class="flex items-center gap-2">
                              <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Graded: ${mySub.grade}/${asg.maxPoints}
                              </span>
                              <span class="text-xs text-slate-500">Feedback: "${esc(mySub.feedback)}"</span>
                            </div>
                          `
                            : `<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Submitted - Awaiting Faculty Review</span>`
                          : `<span class="text-xs text-amber-500 font-bold">Pending Your Submission</span>`
                      }
                    </div>
                    <div>
                      ${
                        mySub
                          ? `<button onclick="App.openSubmitAssignmentModal('${asg.id}')" class="btn-secondary px-4 py-2 text-xs font-bold">Update Submission</button>`
                          : `<button onclick="App.openSubmitAssignmentModal('${asg.id}')" class="btn-primary px-5 py-2 text-xs font-bold">Submit Work &rarr;</button>`
                      }
                    </div>
                  `
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  // 11. QUIZZES PAGE (List, Timed Quiz Engine, Auto-grading)
  function renderQuizzes(container) {
    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    const quizzes = DB.getQuizzes();
    const attempts = DB.getStudentQuizAttempts(user.id);
    const isTeacherOrAdmin = user.role === "teacher" || user.role === "admin";

    container.innerHTML = `
      <div class="page-view max-w-6xl mx-auto space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600">Comprehension Checks</span>
            <h1 class="text-3xl font-black text-[var(--text-main)] mt-1">Timed Quizzes</h1>
            <p class="text-xs text-slate-500 mt-1">Automatic grading, instant question explanations, and permanent gradebook recording.</p>
          </div>
          ${
            isTeacherOrAdmin
              ? `<button onclick="App.openCreateQuizModal()" class="btn-primary px-4 py-2.5 text-xs font-bold">+ Create Quiz</button>`
              : ""
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${quizzes
            .map((q) => {
              const myAttempt = attempts.find((a) => a.quizId === q.id);

              return `
              <div class="edu-card p-6 flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>${q.courseTitle}</span>
                    <span class="text-blue-600 font-mono">⏱️ ${q.timeLimitMinutes} Mins</span>
                  </div>
                  <h3 class="text-base font-black text-[var(--text-main)]">${esc(q.title)}</h3>
                  <p class="text-xs text-slate-500">${esc(q.description)}</p>
                  <div class="text-xs text-slate-400 pt-2 font-medium">
                    ${(q.questions || []).length} Multiple Choice Questions • Passing: ${q.passingScore}%
                  </div>
                </div>

                <div class="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  ${
                    myAttempt
                      ? `
                    <div>
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold ${myAttempt.passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                        Score: ${myAttempt.score}% (${myAttempt.passed ? 'Passed' : 'Try Again'})
                      </span>
                    </div>
                    <button onclick="App.startQuiz('${q.id}')" class="btn-secondary px-4 py-2 text-xs font-bold">
                      Retake Quiz &rarr;
                    </button>
                  `
                      : `
                    <span class="text-xs text-slate-400">Not attempted yet</span>
                    <button onclick="App.startQuiz('${q.id}')" class="btn-primary px-5 py-2 text-xs font-bold">
                      Start Quiz &rarr;
                    </button>
                  `
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  // QUIZ ENGINE MODAL
  function startQuiz(quizId) {
    const quiz = DB.getQuiz(quizId);
    if (!quiz) return;

    activeQuizId = quizId;
    quizTimeRemaining = quiz.timeLimitMinutes * 60;
    quizUserAnswers = {};

    let modal = document.getElementById("quiz-engine-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "quiz-engine-modal";
      modal.className = "fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    renderQuizEngineContent(quiz);

    clearInterval(quizTimerInterval);
    quizTimerInterval = setInterval(() => {
      quizTimeRemaining--;
      const timerEl = document.getElementById("quiz-timer-display");
      if (timerEl) {
        const mins = Math.floor(quizTimeRemaining / 60);
        const secs = quizTimeRemaining % 60;
        timerEl.innerText = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
      }
      if (quizTimeRemaining <= 0) {
        clearInterval(quizTimerInterval);
        showToast("Time expired! Automatically submitting your quiz.", "warning");
        submitQuizAnswers();
      }
    }, 1000);
  }

  function renderQuizEngineContent(quiz) {
    const modal = document.getElementById("quiz-engine-modal");
    if (!modal) return;

    const questionsHtml = (quiz.questions || [])
      .map(
        (q, qIdx) => `
        <div class="edu-card p-5 space-y-3">
          <div class="text-xs font-bold text-blue-600">Question ${qIdx + 1} of ${(quiz.questions || []).length}</div>
          <h4 class="text-sm font-bold text-[var(--text-main)]">${esc(q.question)}</h4>
          <div class="space-y-2 pt-1">
            ${(q.options || [])
              .map(
                (opt, oIdx) => `
              <label class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer text-xs transition-colors">
                <input type="radio" name="question-${q.id}" value="${oIdx}" onchange="App.recordQuizAnswer('${q.id}', ${oIdx})" class="accent-blue-600 w-4 h-4">
                <span class="text-[var(--text-main)] font-medium">${esc(opt)}</span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>
      `
      )
      .join("");

    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${quiz.courseTitle}</span>
            <h2 class="text-base font-black text-[var(--text-main)]">${esc(quiz.title)}</h2>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-sm">
            <span>⏱️</span>
            <span id="quiz-timer-display">${quiz.timeLimitMinutes}:00</span>
          </div>
        </div>
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          ${questionsHtml}
        </div>
        <div class="p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between">
          <button onclick="App.cancelQuiz()" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
          <button onclick="App.submitQuizAnswers()" class="btn-primary px-6 py-2.5 text-xs font-bold">Submit Answers &rarr;</button>
        </div>
      </div>
    `;
  }

  function recordQuizAnswer(qId, optionIdx) {
    quizUserAnswers[qId] = optionIdx;
  }

  function cancelQuiz() {
    if (confirm("Are you sure you want to exit? Your answers will not be saved.")) {
      clearInterval(quizTimerInterval);
      document.getElementById("quiz-engine-modal")?.classList.add("hidden");
    }
  }

  function submitQuizAnswers() {
    clearInterval(quizTimerInterval);
    const quiz = DB.getQuiz(activeQuizId);
    const user = Auth.getCurrentUser();
    if (!quiz || !user) return;

    let correctCount = 0;
    const questions = quiz.questions || [];

    questions.forEach((q) => {
      const selected = quizUserAnswers[q.id];
      if (selected !== undefined && selected === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = DB.saveQuizAttempt({
      quizId: quiz.id,
      studentId: user.id,
      studentName: user.name,
      score,
      totalQuestions: questions.length,
      correctCount,
      passed,
      answers: quizUserAnswers
    });

    showToast(`Quiz submitted! Your score: ${score}%`, passed ? "success" : "warning");
    renderQuizResults(quiz, attempt);
  }

  function renderQuizResults(quiz, attempt) {
    const modal = document.getElementById("quiz-engine-modal");
    if (!modal) return;

    const questions = quiz.questions || [];

    const breakdownHtml = questions
      .map((q, idx) => {
        const userChoice = attempt.answers[q.id];
        const isCorrect = userChoice === q.correctIndex;

        return `
        <div class="p-4 rounded-xl border ${isCorrect ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'} space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="${isCorrect ? 'text-emerald-600' : 'text-rose-600'}">Question ${idx + 1}: ${isCorrect ? '✓ Correct' : '✕ Incorrect'}</span>
          </div>
          <p class="text-xs font-bold text-[var(--text-main)]">${esc(q.question)}</p>
          <div class="text-[11px] space-y-1">
            <div>Your Answer: <span class="font-bold">${userChoice !== undefined ? esc(q.options[userChoice]) : 'No answer'}</span></div>
            ${!isCorrect ? `<div class="text-emerald-700 dark:text-emerald-400">Correct Answer: <span class="font-bold">${esc(q.options[q.correctIndex])}</span></div>` : ''}
          </div>
          <div class="text-[11px] text-slate-500 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-[var(--border-color)]">
            💡 <strong>Explanation:</strong> ${esc(q.explanation)}
          </div>
        </div>
      `;
      })
      .join("");

    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 text-center border-b border-[var(--border-color)] bg-gradient-to-b ${attempt.passed ? 'from-emerald-900/40 to-[var(--bg-surface)]' : 'from-rose-900/40 to-[var(--bg-surface)]'} space-y-2">
          <div class="text-4xl">${attempt.passed ? '🎉' : '📚'}</div>
          <h2 class="text-xl font-black text-[var(--text-main)]">${attempt.passed ? 'Congratulations! You Passed!' : 'Quiz Completed - Review Areas to Improve'}</h2>
          <div class="text-3xl font-black ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}">${attempt.score}%</div>
          <p class="text-xs text-slate-500">${attempt.correctCount} of ${attempt.totalQuestions} questions correct</p>
        </div>
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Question by Question Breakdown</h3>
          ${breakdownHtml}
        </div>
        <div class="p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-end">
          <button onclick="document.getElementById('quiz-engine-modal').classList.add('hidden'); App.renderRoute('quizzes')" class="btn-primary px-6 py-2 text-xs font-bold">
            Done & Return to Quizzes
          </button>
        </div>
      </div>
    `;
  }

  // 12. STUDENT PROFILE
  function renderProfile(container) {
    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    const enrollments = DB.getUserEnrollments(user.id);
    const submissions = DB.getStudentSubmissions(user.id);
    const quizAttempts = DB.getStudentQuizAttempts(user.id);

    container.innerHTML = `
      <div class="page-view max-w-5xl mx-auto space-y-8">
        <!-- Profile Banner Card -->
        <div class="edu-card overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800"></div>
          <div class="p-6 relative pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12">
            <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img src="${user.avatar}" class="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl">
              <div>
                <h1 class="text-2xl font-black text-[var(--text-main)]">${esc(user.name)}</h1>
                <p class="text-xs text-slate-500">${esc(user.title || user.role)} • ${esc(user.department || 'Academic Scholar')}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">${user.role}</span>
                  <span class="text-[11px] text-slate-400">Joined ${user.joinedDate}</span>
                </div>
              </div>
            </div>
            <button onclick="App.navigate('settings')" class="btn-secondary px-4 py-2 text-xs font-bold">Edit Profile</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Academic Summary -->
          <div class="edu-card p-6 space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Summary</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-xs py-1.5 border-b border-[var(--border-subtle)]">
                <span class="text-slate-500">Enrolled Programs:</span>
                <span class="font-bold text-[var(--text-main)]">${enrollments.length}</span>
              </div>
              <div class="flex justify-between text-xs py-1.5 border-b border-[var(--border-subtle)]">
                <span class="text-slate-500">Completed Courses:</span>
                <span class="font-bold text-emerald-600">${enrollments.filter((e) => e.status === 'completed').length}</span>
              </div>
              <div class="flex justify-between text-xs py-1.5 border-b border-[var(--border-subtle)]">
                <span class="text-slate-500">Graded Labs:</span>
                <span class="font-bold text-[var(--text-main)]">${submissions.filter((s) => s.status === 'graded').length}</span>
              </div>
              <div class="flex justify-between text-xs py-1.5 border-b border-[var(--border-subtle)]">
                <span class="text-slate-500">Quizzes Taken:</span>
                <span class="font-bold text-[var(--text-main)]">${quizAttempts.length}</span>
              </div>
              <div class="flex justify-between text-xs py-1.5">
                <span class="text-slate-500">Student ID:</span>
                <span class="font-mono text-[var(--text-main)] font-semibold">${user.studentId || 'STU-2026-0891'}</span>
              </div>
            </div>
          </div>

          <!-- Earned Certificates -->
          <div class="md:col-span-2 edu-card p-6 space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Certificates of Completion</h3>
            <div class="space-y-3">
              ${
                enrollments.filter((e) => e.status === "completed").length === 0
                  ? `<div class="p-6 text-center text-xs text-slate-400">Complete 100% of any enrolled course to generate and download your verified certificate of graduation!</div>`
                  : enrollments
                      .filter((e) => e.status === "completed")
                      .map((enr) => {
                        const course = DB.getCourse(enr.courseId);
                        return `
                    <div class="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-xl font-bold">📜</div>
                        <div>
                          <h4 class="text-xs font-bold text-[var(--text-main)]">${esc(course ? course.title : "Course")}</h4>
                          <p class="text-[10px] text-slate-400">Completed ${enr.completedAt} • ID: ${enr.certificateId}</p>
                        </div>
                      </div>
                      <button onclick="App.openCertificateModal('${enr.id}')" class="btn-primary px-3.5 py-1.5 text-xs font-bold">
                        View Certificate &rarr;
                      </button>
                    </div>
                  `;
                      })
                      .join("")
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // CERTIFICATE GENERATOR MODAL
  function openCertificateModal(enrollmentId) {
    const user = Auth.getCurrentUser();
    const enrollment = DB.getEnrollments().find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const course = DB.getCourse(enrollment.courseId);

    let modal = document.getElementById("certificate-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "certificate-modal";
      modal.className = "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto";
      document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-6">
        <div class="certificate-frame p-8 sm:p-12 text-center relative">
          <div class="certificate-watermark">EDUNOVA</div>
          <div class="space-y-6 relative z-10">
            <div class="flex items-center justify-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">E</div>
              <span class="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-400">EduNova Academy</span>
            </div>
            <div class="text-xs uppercase font-extrabold tracking-[0.3em] text-slate-400">Certificate of Completion</div>
            <p class="text-xs text-slate-500">This is proudly and officially certified to</p>
            <h2 class="text-3xl sm:text-4xl font-serif font-black tracking-wide text-blue-950 dark:text-white border-b-2 border-blue-600/30 pb-3 max-w-md mx-auto">
              ${esc(user ? user.name : "Student Scholar")}
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              for successfully mastering the curriculum and demonstrative capstones for the professional academic program in
            </p>
            <h3 class="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400">${esc(course ? course.title : "Course")}</h3>
            <div class="pt-8 flex items-center justify-between max-w-md mx-auto text-xs text-slate-500 border-t border-slate-300 dark:border-slate-700">
              <div class="text-center">
                <div class="font-serif italic font-bold text-slate-800 dark:text-slate-200">Prof. Sarah Chen</div>
                <div class="text-[10px] text-slate-400">Dean of Faculty</div>
              </div>
              <div class="w-14 h-14 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500 font-bold text-[9px] uppercase tracking-wider">
                Official Seal
              </div>
              <div class="text-center">
                <div class="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">${enrollment.completedAt || new Date().toISOString().split("T")[0]}</div>
                <div class="text-[10px] text-slate-400">Issue Date</div>
              </div>
            </div>
            <div class="text-[9px] font-mono text-slate-400 tracking-wider">
              Verification ID: ${enrollment.certificateId || "CERT-EDU-2026-9921"} • Verify at edunova.com/verify
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between no-print">
          <button onclick="document.getElementById('certificate-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Close</button>
          <button onclick="window.print()" class="btn-primary px-6 py-2.5 text-xs font-bold">🖨️ Print / Save as PDF</button>
        </div>
      </div>
    `;
  }

  // 13. SETTINGS PAGE
  function renderSettings(container) {
    const user = Auth.getCurrentUser();
    if (!user) {
      navigate("login");
      return;
    }

    container.innerHTML = `
      <div class="page-view max-w-4xl mx-auto space-y-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-blue-600">Preferences</span>
          <h1 class="text-3xl font-black text-[var(--text-main)] mt-1">Account & Settings</h1>
          <p class="text-xs text-slate-500 mt-1">Manage your account information, notification preferences, and system storage.</p>
        </div>

        <div class="edu-card p-6 space-y-6">
          <h3 class="text-sm font-bold text-[var(--text-main)]">Profile Information</h3>
          <form onsubmit="App.handleSaveProfile(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" id="setting-name" value="${esc(user.name)}" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <input type="email" id="setting-email" value="${esc(user.email)}" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Professional Bio</label>
              <textarea id="setting-bio" rows="3" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">${esc(user.bio || '')}</textarea>
            </div>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Save Changes</button>
          </form>
        </div>

        <div class="edu-card p-6 space-y-4">
          <h3 class="text-sm font-bold text-[var(--text-main)]">System & Storage Data</h3>
          <p class="text-xs text-slate-500">Backup your local EduNova database or reset to seed defaults.</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="App.exportData()" class="btn-secondary px-4 py-2 text-xs font-bold">Export Database JSON</button>
            <button onclick="App.resetSeedData()" class="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition-colors">
              Reset to Factory Seed Data
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    const name = document.getElementById("setting-name").value;
    const email = document.getElementById("setting-email").value;
    const bio = document.getElementById("setting-bio").value;

    try {
      Auth.updateProfile({ name, email, bio });
      showToast("Profile updated successfully", "success");
      renderHeader();
      renderSidebar();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function exportData() {
    const json = DB.exportDatabase();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edunova_backup_${Date.now()}.json`;
    a.click();
    showToast("Database exported successfully", "success");
  }

  function resetSeedData() {
    if (confirm("Reset database to original sample seed data? Current unsaved changes will be cleared.")) {
      DB.resetToSeed();
      showToast("Database reset to initial seed state", "success");
      setTimeout(() => location.reload(), 500);
    }
  }

  // =========================================================================
  // ADMIN SPECIFIC VIEWS: USERS & BATCHES
  // =========================================================================
  function renderUsers(container) {
    const users = DB.getUsers();
    container.innerHTML = `
      <div class="page-view max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600">User Administration</span>
            <h1 class="text-2xl font-black text-[var(--text-main)]">User Accounts</h1>
          </div>
          <button onclick="App.openCreateUserModal()" class="btn-primary px-4 py-2 text-xs font-bold">+ Add User</button>
        </div>
        <div class="edu-card overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-[var(--bg-subtle)] text-slate-400 font-bold uppercase text-[10px] border-b border-[var(--border-color)]">
              <tr>
                <th class="p-4">User</th>
                <th class="p-4">Role</th>
                <th class="p-4">Department / Major</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-subtle)]">
              ${users
                .map(
                  (u) => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td class="p-4 flex items-center gap-3">
                    <img src="${u.avatar}" class="w-8 h-8 rounded-full object-cover">
                    <div>
                      <div class="font-bold text-[var(--text-main)]">${esc(u.name)}</div>
                      <div class="text-[10px] text-slate-400">${esc(u.email)}</div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      u.role === 'teacher' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }">${u.role}</span>
                  </td>
                  <td class="p-4 text-slate-500">${esc(u.department || 'General')}</td>
                  <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${u.status}</span></td>
                  <td class="p-4 text-right">
                    <button onclick="App.deleteUserConfirm('${u.id}')" class="text-rose-500 hover:text-rose-700 font-bold">Delete</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function deleteUserConfirm(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      DB.deleteUser(userId);
      showToast("User removed", "info");
      renderUsers(document.getElementById("main-content"));
    }
  }

  function renderBatches(container) {
    const batches = DB.getBatches();
    container.innerHTML = `
      <div class="page-view max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-blue-600">Cohort Schedules</span>
            <h1 class="text-2xl font-black text-[var(--text-main)]">Classes & Batches</h1>
          </div>
          <button onclick="App.openCreateBatchModal()" class="btn-primary px-4 py-2 text-xs font-bold">+ Create Batch</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${batches
            .map(
              (b) => `
            <div class="edu-card p-6 space-y-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">${b.code}</span>
                <h3 class="text-base font-black text-[var(--text-main)]">${esc(b.name)}</h3>
                <p class="text-xs text-slate-500">${esc(b.courseName)}</p>
              </div>
              <div class="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                <div>👨‍🏫 Instructor: <span class="font-bold text-[var(--text-main)]">${esc(b.teacherName)}</span></div>
                <div>📅 Schedule: <span class="text-[var(--text-main)]">${esc(b.schedule)}</span></div>
                <div>👥 Roster: <span class="font-bold text-blue-600">${b.studentsCount} / ${b.capacity} Scholars</span></div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MODALS
  // =========================================================================
  function openCreateCourseModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "action-modal";
      modal.className = "fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }
    const user = Auth.getCurrentUser();
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-5">
        <h3 class="text-lg font-black text-[var(--text-main)]">Create New Course</h3>
        <form onsubmit="App.handleCreateCourse(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course Title</label>
            <input type="text" id="new-course-title" required placeholder="Distributed Systems & Go Microservices" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <input type="text" id="new-course-category" required placeholder="Web Development / AI" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea id="new-course-desc" required rows="3" placeholder="Provide course objectives and summary..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Level</label>
              <select id="new-course-level" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</label>
              <input type="text" id="new-course-duration" value="8 Weeks" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Create Course</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateCourse(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const title = document.getElementById("new-course-title").value;
    const category = document.getElementById("new-course-category").value;
    const description = document.getElementById("new-course-desc").value;
    const level = document.getElementById("new-course-level").value;
    const duration = document.getElementById("new-course-duration").value;

    const course = DB.createCourse({
      title,
      category,
      description,
      tagline: description.substring(0, 100),
      level,
      duration,
      instructorId: user ? user.id : "u-teacher-1",
      instructorName: user ? user.name : "Faculty Member",
      instructorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      instructorTitle: user ? user.title : "Instructor"
    });

    const ch = DB.addChapter(course.id, { title: "Introduction & Foundations" });
    DB.addLesson(course.id, ch.id, {
      title: "1.1 Course Orientation & Setup",
      duration: "15 min",
      description: "Welcome to the course! Overview of the toolchain, syllabus, and assignments."
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Course created successfully!", "success");
    navigate(`course-details/${course.id}`);
  }

  function openCreateAssignmentModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) return;
    const courses = DB.getCourses();
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-lg font-black text-[var(--text-main)]">Author New Assignment</h3>
        <form onsubmit="App.handleCreateAssignment(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course</label>
            <select id="asg-course-select" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
              ${courses.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assignment Title</label>
            <input type="text" id="asg-title" required placeholder="Lab 3: Microservice Containerization" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instructions & Rubric</label>
            <textarea id="asg-desc" required rows="3" placeholder="Specify requirements, deliverables, and submission format..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
              <input type="date" id="asg-date" required class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Max Points</label>
              <input type="number" id="asg-points" value="100" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Publish Assignment</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateAssignment(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const courseId = document.getElementById("asg-course-select").value;
    const course = DB.getCourse(courseId);
    const title = document.getElementById("asg-title").value;
    const description = document.getElementById("asg-desc").value;
    const dueDate = document.getElementById("asg-date").value + "T23:59:00";
    const maxPoints = Number(document.getElementById("asg-points").value);

    DB.createAssignment({
      courseId,
      courseTitle: course ? course.title : "Course",
      title,
      description,
      dueDate,
      maxPoints,
      teacherId: user ? user.id : "u-teacher-1"
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Assignment published!", "success");
    renderAssignments(document.getElementById("main-content"));
  }

  function openSubmitAssignmentModal(assignmentId) {
    const asg = DB.getAssignment(assignmentId);
    if (!asg) return;
    const user = Auth.getCurrentUser();
    const sub = user ? DB.getStudentSubmissions(user.id).find((s) => s.assignmentId === assignmentId) : null;

    let modal = document.getElementById("action-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Submit Assignment: ${esc(asg.title)}</h3>
        <form onsubmit="App.handleSubmitWork(event, '${asg.id}')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">GitHub / Project Repository URL or Live Link</label>
            <input type="url" id="sub-url" required value="${sub ? esc(sub.content) : ''}" placeholder="https://github.com/username/project" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Submission Notes & Implementation Summary</label>
            <textarea id="sub-notes" rows="4" placeholder="Briefly describe your approach, test coverage, and any bonus features implemented..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500">${sub ? esc(sub.submissionNotes) : ''}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Submit Assignment</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleSubmitWork(e, asgId) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    if (!user) return;
    const content = document.getElementById("sub-url").value;
    const submissionNotes = document.getElementById("sub-notes").value;

    DB.submitAssignment({
      assignmentId: asgId,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatar,
      content,
      submissionNotes
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Work submitted for faculty review!", "success");
    renderAssignments(document.getElementById("main-content"));
  }

  function openGradeSubmissionModal(subId) {
    const sub = DB.getSubmissions().find((s) => s.id === subId);
    if (!sub) return;
    const asg = DB.getAssignment(sub.assignmentId);

    let modal = document.getElementById("action-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Grade Student Submission</h3>
        <div class="p-3 bg-[var(--bg-subtle)] rounded-xl space-y-1 text-xs">
          <div>Student: <span class="font-bold text-[var(--text-main)]">${esc(sub.studentName)}</span></div>
          <div>Project URL: <a href="${esc(sub.content)}" target="_blank" class="text-blue-600 underline font-mono">${esc(sub.content)}</a></div>
          <div>Student Notes: <span class="italic text-slate-500">${esc(sub.submissionNotes || 'None')}</span></div>
        </div>
        <form onsubmit="App.handleGradeSubmission(event, '${sub.id}')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Score (Out of ${asg ? asg.maxPoints : 100})</label>
            <input type="number" id="grade-score" required min="0" max="100" value="${sub.grade || 90}" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Constructive Feedback</label>
            <textarea id="grade-feedback" required rows="3" placeholder="Provide qualitative guidance and rubric feedback..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">${esc(sub.feedback || '')}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Submit Grade</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleGradeSubmission(e, subId) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const grade = document.getElementById("grade-score").value;
    const feedback = document.getElementById("grade-feedback").value;

    DB.gradeSubmission(subId, grade, feedback, user ? user.id : "u-teacher-1");
    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Submission graded successfully!", "success");
    renderDashboard(document.getElementById("main-content"));
  }

  function openSubmissionsListModal(asgId) {
    const asg = DB.getAssignment(asgId);
    const subs = DB.getAssignmentSubmissions(asgId);

    let modal = document.getElementById("action-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h3 class="text-base font-black text-[var(--text-main)]">Submissions: ${esc(asg ? asg.title : '')}</h3>
          <button onclick="document.getElementById('action-modal').classList.add('hidden')" class="text-xs font-bold text-slate-400 hover:text-slate-600">✕ Close</button>
        </div>
        <div class="overflow-y-auto space-y-3 flex-1">
          ${
            subs.length === 0
              ? `<div class="p-8 text-center text-xs text-slate-400">No submissions received yet.</div>`
              : subs
                  .map(
                    (s) => `
                <div class="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <img src="${s.studentAvatar}" class="w-8 h-8 rounded-full object-cover">
                    <div>
                      <div class="text-xs font-bold text-[var(--text-main)]">${esc(s.studentName)}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${new Date(s.submittedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    ${s.status === 'graded' ? `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Grade: ${s.grade}/100</span>` : `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Needs Review</span>`}
                    <button onclick="App.openGradeSubmissionModal('${s.id}')" class="btn-primary px-3 py-1 text-xs font-bold">Grade</button>
                  </div>
                </div>
              `
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  }

  function openCreateQuizModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) return;
    const courses = DB.getCourses();
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Author Timed Quiz</h3>
        <form onsubmit="App.handleCreateQuiz(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course</label>
            <select id="qz-course" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
              ${courses.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quiz Title</label>
            <input type="text" id="qz-title" required placeholder="Milestone 2 Mastery Check" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Time Limit (Minutes)</label>
            <input type="number" id="qz-time" value="15" min="1" max="120" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Publish Quiz</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateQuiz(e) {
    e.preventDefault();
    const courseId = document.getElementById("qz-course").value;
    const course = DB.getCourse(courseId);
    const title = document.getElementById("qz-title").value;
    const timeLimitMinutes = Number(document.getElementById("qz-time").value);

    DB.createQuiz({
      courseId,
      courseTitle: course ? course.title : "Course",
      title,
      description: "Assess fundamental concepts and practical application.",
      timeLimitMinutes,
      passingScore: 70,
      questions: [
        {
          id: "q-dyn-1",
          question: "Which pattern best decouples state mutations from UI components in modern architecture?",
          options: ["Direct DOM mutation", "Flux / Redux unidirectional data flow", "Synchronous blocking loops", "Global window variables"],
          correctIndex: 1,
          explanation: "Unidirectional data flow ensures predictable, debuggable state transformations."
        },
        {
          id: "q-dyn-2",
          question: "What is the primary benefit of zero-trust network architectures?",
          options: ["Eliminates all passwords", "Never trusts, always verifies every request regardless of origin", "Doubles bandwidth speeds", "Stores database unencrypted"],
          correctIndex: 1,
          explanation: "Zero-trust treats every packet as potentially hostile, enforcing continuous authentication."
        }
      ]
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Quiz published with sample questions!", "success");
    renderQuizzes(document.getElementById("main-content"));
  }

  function openCreateAnnouncementModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) return;
    const user = Auth.getCurrentUser();
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Broadcast System Announcement</h3>
        <form onsubmit="App.handleCreateAnnouncement(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
            <input type="text" id="anc-title" required placeholder="Academic System Upgrade Scheduled" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <select id="anc-cat" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
              <option value="Platform">Platform Notice</option>
              <option value="Academic">Academic Schedule</option>
              <option value="Event">Campus Event</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
            <textarea id="anc-content" required rows="3" placeholder="Announcement details..." class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Broadcast</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateAnnouncement(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const title = document.getElementById("anc-title").value;
    const category = document.getElementById("anc-cat").value;
    const content = document.getElementById("anc-content").value;

    DB.createAnnouncement({
      title,
      category,
      content,
      authorName: user ? user.name : "Administration",
      authorRole: user ? user.title : "Dean",
      authorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Announcement broadcasted!", "success");
    renderDashboard(document.getElementById("main-content"));
  }

  function openCreateBatchModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) return;
    const courses = DB.getCourses();
    const teachers = DB.getUsers().filter((u) => u.role === "teacher");
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Create Cohort Batch</h3>
        <form onsubmit="App.handleCreateBatch(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Batch Name</label>
            <input type="text" id="bat-name" required placeholder="Fall 2026 Cohort Gamma" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Course</label>
            <select id="bat-course" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
              ${courses.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Instructor</label>
            <select id="bat-teacher" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
              ${teachers.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
              <input type="number" id="bat-cap" value="35" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule</label>
              <input type="text" id="bat-sched" value="Mon & Wed • 6 PM" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Create Batch</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateBatch(e) {
    e.preventDefault();
    const name = document.getElementById("bat-name").value;
    const courseId = document.getElementById("bat-course").value;
    const course = DB.getCourse(courseId);
    const teacherId = document.getElementById("bat-teacher").value;
    const teacher = DB.getUser(teacherId);
    const capacity = Number(document.getElementById("bat-cap").value);
    const schedule = document.getElementById("bat-sched").value;

    DB.createBatch({
      name,
      code: `COH-${Math.floor(100 + Math.random() * 900)}`,
      courseId,
      courseName: course ? course.title : "Course",
      teacherId,
      teacherName: teacher ? teacher.name : "Faculty",
      capacity,
      schedule,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-30"
    });

    document.getElementById("action-modal")?.classList.add("hidden");
    showToast("Cohort batch created!", "success");
    renderBatches(document.getElementById("main-content"));
  }

  function openCreateUserModal() {
    let modal = document.getElementById("action-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 class="text-base font-black text-[var(--text-main)]">Create New User Account</h3>
        <form onsubmit="App.handleCreateUser(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <input type="text" id="usr-name" required placeholder="Jordan Hayes" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <input type="email" id="usr-email" required placeholder="jordan@edunova.com" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input type="password" id="usr-pass" required minlength="6" value="password123" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
              <select id="usr-role" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <input type="text" id="usr-dept" value="Computer Science" class="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)]">
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" onclick="document.getElementById('action-modal').classList.add('hidden')" class="btn-secondary px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="submit" class="btn-primary px-6 py-2 text-xs font-bold">Create Account</button>
          </div>
        </form>
      </div>
    `;
  }

  function handleCreateUser(e) {
    e.preventDefault();
    const name = document.getElementById("usr-name").value;
    const email = document.getElementById("usr-email").value;
    const password = document.getElementById("usr-pass").value;
    const role = document.getElementById("usr-role").value;
    const department = document.getElementById("usr-dept").value;

    try {
      DB.createUser({
        name,
        email,
        password,
        role,
        department,
        title: role === "teacher" ? "Faculty Instructor" : role === "admin" ? "Academic Director" : "Enrolled Student"
      });
      document.getElementById("action-modal")?.classList.add("hidden");
      showToast("User account created!", "success");
      renderUsers(document.getElementById("main-content"));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function logout() {
    Auth.logout();
    showToast("Signed out successfully", "info");
    navigate("landing");
  }

  // Initialization
  function init() {
    initTheme();
    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("edunova_auth_change", () => renderApp());
    handleRoute();
  }

  return {
    init,
    navigate,
    toggleTheme,
    quickSwitchRole,
    showToast,
    fillDemoLogin,
    handleLogin,
    handleRegister,
    filterByCategory,
    filterCoursesCatalog,
    handleEnrollCourse,
    renderCourseCardHtml,
    toggleLessonComplete,
    saveNoteAuto,
    switchLearnTab,
    postComment,
    upvoteComment,
    startQuiz,
    recordQuizAnswer,
    cancelQuiz,
    submitQuizAnswers,
    openCertificateModal,
    handleSaveProfile,
    exportData,
    resetSeedData,
    deleteUserConfirm,
    openCreateCourseModal,
    handleCreateCourse,
    openCreateAssignmentModal,
    handleCreateAssignment,
    openSubmitAssignmentModal,
    handleSubmitWork,
    openGradeSubmissionModal,
    handleGradeSubmission,
    openSubmissionsListModal,
    openCreateQuizModal,
    handleCreateQuiz,
    openCreateAnnouncementModal,
    handleCreateAnnouncement,
    openCreateBatchModal,
    handleCreateBatch,
    openCreateUserModal,
    handleCreateUser,
    toggleMobileSidebar,
    toggleNotificationsMenu,
    markAllRead,
    handleNotifClick,
    handleGlobalSearch,
    renderRoute,
    logout
  };
})();

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
