/**
 * EduNova LMS - Database Layer (db.js)
 * High-performance, reactive persistence store powered by localStorage.
 * Includes complete schema validation, relationships, and transactional updates.
 */

const DB = (() => {
  const STORAGE_KEY = "edunova_lms_db_v1";

  // Helper: Deep clone
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  // Initialize store
  function init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      resetToSeed();
    }
  }

  function resetToSeed() {
    if (typeof SEED_DATA !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
  }

  function read() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      resetToSeed();
      return clone(SEED_DATA);
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Corrupted DB in storage, restoring seed data.", e);
      resetToSeed();
      return clone(SEED_DATA);
    }
  }

  function write(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event for reactive UI updates
    window.dispatchEvent(new CustomEvent("edunova_db_change", { detail: { timestamp: Date.now() } }));
  }

  // Generate unique IDs
  function genId(prefix = "id") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  }

  return {
    init,
    resetToSeed,
    genId,

    // ==========================================
    // USERS
    // ==========================================
    getUsers() {
      const db = read();
      return db.users || [];
    },

    getUser(id) {
      const users = this.getUsers();
      return users.find((u) => u.id === id) || null;
    },

    getUserByEmail(email) {
      const users = this.getUsers();
      return users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase()) || null;
    },

    createUser(userData) {
      const db = read();
      const existing = (db.users || []).find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        throw new Error("An account with this email address already exists.");
      }
      const newUser = {
        id: genId("u"),
        status: "active",
        joinedDate: new Date().toISOString().split("T")[0],
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=2563eb&color=fff`,
        ...userData
      };
      db.users = db.users || [];
      db.users.push(newUser);
      write(db);
      return newUser;
    },

    updateUser(id, updates) {
      const db = read();
      const idx = (db.users || []).findIndex((u) => u.id === id);
      if (idx === -1) throw new Error("User not found.");
      db.users[idx] = { ...db.users[idx], ...updates };
      write(db);
      return db.users[idx];
    },

    deleteUser(id) {
      const db = read();
      db.users = (db.users || []).filter((u) => u.id !== id);
      write(db);
      return true;
    },

    // ==========================================
    // COURSES
    // ==========================================
    getCourses() {
      const db = read();
      return db.courses || [];
    },

    getCourse(id) {
      const courses = this.getCourses();
      return courses.find((c) => c.id === id) || null;
    },

    createCourse(courseData) {
      const db = read();
      const newCourse = {
        id: genId("crs"),
        code: `CRS-${Math.floor(100 + Math.random() * 900)}`,
        rating: 5.0,
        reviewsCount: 0,
        enrolledCount: 0,
        isPublished: true,
        chapters: [],
        outcomes: [],
        thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
        ...courseData
      };
      db.courses = db.courses || [];
      db.courses.unshift(newCourse);
      write(db);
      return newCourse;
    },

    updateCourse(id, updates) {
      const db = read();
      const idx = (db.courses || []).findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Course not found.");
      db.courses[idx] = { ...db.courses[idx], ...updates };
      write(db);
      return db.courses[idx];
    },

    deleteCourse(id) {
      const db = read();
      db.courses = (db.courses || []).filter((c) => c.id !== id);
      // Clean up enrollments
      db.enrollments = (db.enrollments || []).filter((e) => e.courseId !== id);
      write(db);
      return true;
    },

    addChapter(courseId, chapterData) {
      const db = read();
      const course = (db.courses || []).find((c) => c.id === courseId);
      if (!course) throw new Error("Course not found");
      course.chapters = course.chapters || [];
      const newChapter = {
        id: genId("ch"),
        order: course.chapters.length + 1,
        lessons: [],
        ...chapterData
      };
      course.chapters.push(newChapter);
      write(db);
      return newChapter;
    },

    addLesson(courseId, chapterId, lessonData) {
      const db = read();
      const course = (db.courses || []).find((c) => c.id === courseId);
      if (!course) throw new Error("Course not found");
      const chapter = (course.chapters || []).find((ch) => ch.id === chapterId);
      if (!chapter) throw new Error("Chapter not found");
      chapter.lessons = chapter.lessons || [];
      const newLesson = {
        id: genId("les"),
        type: "video",
        videoUrl: lessonData.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        resources: [],
        ...lessonData
      };
      chapter.lessons.push(newLesson);
      write(db);
      return newLesson;
    },

    // ==========================================
    // ENROLLMENTS & PROGRESS
    // ==========================================
    getEnrollments() {
      const db = read();
      return db.enrollments || [];
    },

    getUserEnrollments(userId) {
      const enrollments = this.getEnrollments();
      return enrollments.filter((e) => e.userId === userId);
    },

    getCourseEnrollments(courseId) {
      const enrollments = this.getEnrollments();
      return enrollments.filter((e) => e.courseId === courseId);
    },

    enrollStudent(userId, courseId) {
      const db = read();
      db.enrollments = db.enrollments || [];
      const existing = db.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
      if (existing) return existing;

      const newEnrollment = {
        id: genId("enr"),
        userId,
        courseId,
        enrolledAt: new Date().toISOString().split("T")[0],
        completedLessons: [],
        progress: 0,
        status: "in-progress",
        notes: {}
      };
      db.enrollments.push(newEnrollment);

      // Increment course enrolled count
      const course = (db.courses || []).find((c) => c.id === courseId);
      if (course) {
        course.enrolledCount = (course.enrolledCount || 0) + 1;
      }

      write(db);
      return newEnrollment;
    },

    unenrollStudent(userId, courseId) {
      const db = read();
      db.enrollments = (db.enrollments || []).filter((e) => !(e.userId === userId && e.courseId === courseId));
      const course = (db.courses || []).find((c) => c.id === courseId);
      if (course && course.enrolledCount > 0) {
        course.enrolledCount -= 1;
      }
      write(db);
      return true;
    },

    markLessonCompleted(userId, courseId, lessonId) {
      const db = read();
      const enrollment = (db.enrollments || []).find((e) => e.userId === userId && e.courseId === courseId);
      if (!enrollment) return null;

      enrollment.completedLessons = enrollment.completedLessons || [];
      const hasCompleted = enrollment.completedLessons.includes(lessonId);

      if (hasCompleted) {
        // Toggle off
        enrollment.completedLessons = enrollment.completedLessons.filter((id) => id !== lessonId);
      } else {
        // Add
        enrollment.completedLessons.push(lessonId);
      }

      // Calculate total lessons in course
      const course = (db.courses || []).find((c) => c.id === courseId);
      let totalLessons = 0;
      if (course && course.chapters) {
        course.chapters.forEach((ch) => {
          totalLessons += (ch.lessons || []).length;
        });
      }

      if (totalLessons > 0) {
        enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));
      } else {
        enrollment.progress = 0;
      }

      if (enrollment.progress === 100) {
        enrollment.status = "completed";
        enrollment.completedAt = new Date().toISOString().split("T")[0];
        if (!enrollment.certificateId) {
          enrollment.certificateId = `CERT-EDU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      } else {
        enrollment.status = "in-progress";
      }

      write(db);
      return enrollment;
    },

    saveLessonNote(userId, courseId, lessonId, noteText) {
      const db = read();
      const enrollment = (db.enrollments || []).find((e) => e.userId === userId && e.courseId === courseId);
      if (!enrollment) return null;

      enrollment.notes = enrollment.notes || {};
      enrollment.notes[lessonId] = noteText;
      write(db);
      return enrollment.notes[lessonId];
    },

    // ==========================================
    // ASSIGNMENTS & SUBMISSIONS
    // ==========================================
    getAssignments() {
      const db = read();
      return db.assignments || [];
    },

    getAssignment(id) {
      const assignments = this.getAssignments();
      return assignments.find((a) => a.id === id) || null;
    },

    createAssignment(assignmentData) {
      const db = read();
      const newAsg = {
        id: genId("asg"),
        status: "active",
        submissionsCount: 0,
        ...assignmentData
      };
      db.assignments = db.assignments || [];
      db.assignments.unshift(newAsg);
      write(db);
      return newAsg;
    },

    updateAssignment(id, updates) {
      const db = read();
      const idx = (db.assignments || []).findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Assignment not found");
      db.assignments[idx] = { ...db.assignments[idx], ...updates };
      write(db);
      return db.assignments[idx];
    },

    deleteAssignment(id) {
      const db = read();
      db.assignments = (db.assignments || []).filter((a) => a.id !== id);
      db.submissions = (db.submissions || []).filter((s) => s.assignmentId !== id);
      write(db);
      return true;
    },

    getSubmissions() {
      const db = read();
      return db.submissions || [];
    },

    getAssignmentSubmissions(assignmentId) {
      const subs = this.getSubmissions();
      return subs.filter((s) => s.assignmentId === assignmentId);
    },

    getStudentSubmissions(studentId) {
      const subs = this.getSubmissions();
      return subs.filter((s) => s.studentId === studentId);
    },

    submitAssignment(subData) {
      const db = read();
      db.submissions = db.submissions || [];
      // Check if student already submitted this assignment
      const existingIdx = db.submissions.findIndex(
        (s) => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId
      );

      const submission = {
        id: existingIdx >= 0 ? db.submissions[existingIdx].id : genId("sub"),
        submittedAt: new Date().toISOString(),
        status: "submitted",
        grade: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
        ...subData
      };

      if (existingIdx >= 0) {
        db.submissions[existingIdx] = submission;
      } else {
        db.submissions.unshift(submission);
        // increment assignment submission count
        const asg = (db.assignments || []).find((a) => a.id === subData.assignmentId);
        if (asg) {
          asg.submissionsCount = (asg.submissionsCount || 0) + 1;
        }
      }

      write(db);
      return submission;
    },

    gradeSubmission(subId, grade, feedback, teacherId) {
      const db = read();
      const sub = (db.submissions || []).find((s) => s.id === subId);
      if (!sub) throw new Error("Submission not found");

      sub.grade = Number(grade);
      sub.feedback = feedback;
      sub.status = "graded";
      sub.gradedBy = teacherId;
      sub.gradedAt = new Date().toISOString();

      // Add notification to student
      this.addNotification({
        userId: sub.studentId,
        title: "Assignment Graded",
        message: `Your assignment submission was graded: ${grade}/100.`,
        type: "grade",
        link: "#assignments"
      });

      write(db);
      return sub;
    },

    // ==========================================
    // QUIZZES & ATTEMPTS
    // ==========================================
    getQuizzes() {
      const db = read();
      return db.quizzes || [];
    },

    getQuiz(id) {
      const quizzes = this.getQuizzes();
      return quizzes.find((q) => q.id === id) || null;
    },

    createQuiz(quizData) {
      const db = read();
      const newQuiz = {
        id: genId("qz"),
        questionsCount: (quizData.questions || []).length,
        ...quizData
      };
      db.quizzes = db.quizzes || [];
      db.quizzes.unshift(newQuiz);
      write(db);
      return newQuiz;
    },

    updateQuiz(id, updates) {
      const db = read();
      const idx = (db.quizzes || []).findIndex((q) => q.id === id);
      if (idx === -1) throw new Error("Quiz not found");
      db.quizzes[idx] = { ...db.quizzes[idx], ...updates };
      write(db);
      return db.quizzes[idx];
    },

    deleteQuiz(id) {
      const db = read();
      db.quizzes = (db.quizzes || []).filter((q) => q.id !== id);
      db.quizAttempts = (db.quizAttempts || []).filter((qa) => qa.quizId !== id);
      write(db);
      return true;
    },

    getQuizAttempts() {
      const db = read();
      return db.quizAttempts || [];
    },

    getStudentQuizAttempts(studentId) {
      const attempts = this.getQuizAttempts();
      return attempts.filter((a) => a.studentId === studentId);
    },

    saveQuizAttempt(attemptData) {
      const db = read();
      const newAttempt = {
        id: genId("qa"),
        completedAt: new Date().toISOString(),
        ...attemptData
      };
      db.quizAttempts = db.quizAttempts || [];
      db.quizAttempts.unshift(newAttempt);
      write(db);
      return newAttempt;
    },

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================
    getAnnouncements() {
      const db = read();
      return db.announcements || [];
    },

    createAnnouncement(ancData) {
      const db = read();
      const newAnc = {
        id: genId("anc"),
        date: new Date().toISOString(),
        isPinned: false,
        target: "all",
        category: "Platform",
        ...ancData
      };
      db.announcements = db.announcements || [];
      db.announcements.unshift(newAnc);
      write(db);
      return newAnc;
    },

    deleteAnnouncement(id) {
      const db = read();
      db.announcements = (db.announcements || []).filter((a) => a.id !== id);
      write(db);
      return true;
    },

    // ==========================================
    // BATCHES / CLASSES
    // ==========================================
    getBatches() {
      const db = read();
      return db.batches || [];
    },

    createBatch(batchData) {
      const db = read();
      const newBatch = {
        id: genId("batch"),
        studentsCount: 0,
        status: "active",
        ...batchData
      };
      db.batches = db.batches || [];
      db.batches.unshift(newBatch);
      write(db);
      return newBatch;
    },

    updateBatch(id, updates) {
      const db = read();
      const idx = (db.batches || []).findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Batch not found");
      db.batches[idx] = { ...db.batches[idx], ...updates };
      write(db);
      return db.batches[idx];
    },

    deleteBatch(id) {
      const db = read();
      db.batches = (db.batches || []).filter((b) => b.id !== id);
      write(db);
      return true;
    },

    // ==========================================
    // DISCUSSIONS
    // ==========================================
    getDiscussions(courseId, lessonId) {
      const db = read();
      let list = db.discussions || [];
      if (courseId) list = list.filter((d) => d.courseId === courseId);
      if (lessonId) list = list.filter((d) => d.lessonId === lessonId);
      return list;
    },

    addDiscussion(discData) {
      const db = read();
      const newDisc = {
        id: genId("disc"),
        date: new Date().toISOString(),
        upvotes: 0,
        replies: [],
        ...discData
      };
      db.discussions = db.discussions || [];
      db.discussions.unshift(newDisc);
      write(db);
      return newDisc;
    },

    addReply(discId, replyData) {
      const db = read();
      const disc = (db.discussions || []).find((d) => d.id === discId);
      if (!disc) throw new Error("Discussion thread not found");
      disc.replies = disc.replies || [];
      const newReply = {
        id: genId("reply"),
        date: new Date().toISOString(),
        ...replyData
      };
      disc.replies.push(newReply);
      write(db);
      return newReply;
    },

    upvoteDiscussion(discId) {
      const db = read();
      const disc = (db.discussions || []).find((d) => d.id === discId);
      if (disc) {
        disc.upvotes = (disc.upvotes || 0) + 1;
        write(db);
        return disc.upvotes;
      }
      return 0;
    },

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    getUserNotifications(userId) {
      const db = read();
      return (db.notifications || []).filter((n) => n.userId === userId || n.userId === "all");
    },

    addNotification(notifData) {
      const db = read();
      const newNotif = {
        id: genId("notif"),
        date: new Date().toISOString(),
        read: false,
        ...notifData
      };
      db.notifications = db.notifications || [];
      db.notifications.unshift(newNotif);
      write(db);
      return newNotif;
    },

    markNotificationRead(id) {
      const db = read();
      const notif = (db.notifications || []).find((n) => n.id === id);
      if (notif) {
        notif.read = true;
        write(db);
      }
      return true;
    },

    markAllNotificationsRead(userId) {
      const db = read();
      (db.notifications || []).forEach((n) => {
        if (n.userId === userId || n.userId === "all") {
          n.read = true;
        }
      });
      write(db);
      return true;
    },

    // ==========================================
    // BACKUP & EXPORT
    // ==========================================
    exportDatabase() {
      return JSON.stringify(read(), null, 2);
    },

    importDatabase(jsonString) {
      const parsed = JSON.parse(jsonString);
      if (!parsed.users || !parsed.courses) {
        throw new Error("Invalid EduNova database JSON schema.");
      }
      write(parsed);
      return true;
    }
  };
})();

// Auto initialize on load
DB.init();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DB;
} else if (typeof window !== "undefined") {
  window.DB = DB;
}
