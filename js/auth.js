/**
 * EduNova LMS - Authentication & RBAC Service (auth.js)
 * Manages user sessions, role-based authorization, demo switching, and access guards.
 */

const Auth = (() => {
  const SESSION_KEY = "edunova_current_user_v1";

  function getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const cached = JSON.parse(raw);
        // Refresh from DB in case user data was updated
        const fresh = DB.getUser(cached.id);
        return fresh || cached;
      } catch (e) {
        console.error("Failed to parse current user session", e);
      }
    }
    // Default to Alex Morgan (Student) for immediate out-of-the-box demo exploration
    const defaultStudent = DB.getUser("u-student-1");
    if (defaultStudent) {
      setCurrentUser(defaultStudent);
      return defaultStudent;
    }
    return null;
  }

  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent("edunova_auth_change", { detail: { user } }));
  }

  function login(email, password) {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const user = DB.getUserByEmail(trimmedEmail);

    if (!user) {
      throw new Error("No user found with this email address.");
    }
    if (user.password !== password) {
      throw new Error("Invalid password. Please check your credentials and try again.");
    }
    if (user.status === "inactive") {
      throw new Error("Your account has been deactivated. Please contact an administrator.");
    }

    setCurrentUser(user);
    return user;
  }

  function register(data) {
    const { name, email, password, role } = data;
    if (!name || name.trim().length < 2) {
      throw new Error("Please enter a valid full name.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const newUser = DB.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || "student",
      title: role === "teacher" ? "Instructor" : "Enrolled Student",
      department: role === "teacher" ? "Faculty" : "General Studies"
    });

    setCurrentUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent("edunova_auth_change", { detail: { user: null } }));
  }

  // Quick 1-click role switcher for seamless evaluation
  function switchRole(targetRole) {
    let targetUser = null;
    if (targetRole === "admin") {
      targetUser = DB.getUser("u-admin-1");
    } else if (targetRole === "teacher") {
      targetUser = DB.getUser("u-teacher-1");
    } else if (targetRole === "student") {
      targetUser = DB.getUser("u-student-1");
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      return targetUser;
    }
    throw new Error(`Role ${targetRole} target user not found.`);
  }

  function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === "admin") return true; // Admin has super-privilege
    return user.role === requiredRole;
  }

  function updateProfile(updates) {
    const user = getCurrentUser();
    if (!user) throw new Error("No active session");
    const updated = DB.updateUser(user.id, updates);
    setCurrentUser(updated);
    return updated;
  }

  return {
    getCurrentUser,
    setCurrentUser,
    login,
    register,
    logout,
    switchRole,
    hasRole,
    updateProfile
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Auth;
} else if (typeof window !== "undefined") {
  window.Auth = Auth;
}
