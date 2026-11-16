# 🎓 EduNova — Next-Generation Learning Management System (LMS)

EduNova is a modern, enterprise-ready, premium SaaS-style Learning Management System designed for schools, universities, academies, teachers, and students. It provides a complete educational ecosystem with role-based dashboards, video lecture theaters, interactive timed quizzes, assignment submissions and grading, discussion boards, cohort scheduling, and verified digital completion certificates.

---

## 🌟 Highlights & Key Features

### 1. 🎨 Premium SaaS User Interface
- **Refined Color Palette**: Navy blue, royal blue, crisp white, and subtle violet accents.
- **Dynamic Theming**: Seamless 1-click **Light & Dark Mode** with instant state synchronization.
- **Micro-Interactions**: Hover lifts, smooth page fade transitions, active button feedback, and custom scrollbars.
- **SVG Vector Charts**: Responsive Area charts (Monthly Enrollments), Bar charts (Grade Distributions), and Donut charts (Progression ratio) with retina clarity.
- **Mobile Responsive**: Adaptive multi-column grid layouts with mobile sidebar drawers.

### 2. 👥 Complete User Roles & Permissions
- **Admin**:
  - Full platform governance and statistics.
  - User account management (students, teachers, administrators).
  - Course approval, creation, editing, and deletion.
  - Cohort batch management (scheduling, capacity, assigned instructors).
  - Platform-wide system broadcasts & announcements.
- **Teacher (Instructor)**:
  - Course curriculum management (chapters, lessons, video URLs, PDF resources).
  - Author assignments with custom point rubrics and deadlines.
  - Author timed multiple-choice quizzes.
  - Review submitted student work, assign numerical scores, and give qualitative feedback.
  - Track student attendance, progress, and performance distributions.
- **Student (Scholar)**:
  - Course catalog exploration and 1-click self-enrollment.
  - Theater video learning interface with playback controls and previous/next navigation.
  - Lesson checklist with auto percentage calculation.
  - Autosaved private lecture notes.
  - Lesson Q&A discussion board with comment upvoting and faculty replies.
  - Submit assignment links/files with submission notes.
  - Take timed multiple-choice quizzes with live countdown timers, instant automated grading, and question-by-question explanations.
  - Gradebook tracking and verifiable digital **Certificate of Completion** generation.

### 3. 📑 13 Dedicated Pages Included
1. **Marketing Landing Page** (Hero, Features, Course Showcase, Testimonials, CTA, Footer).
2. **Login Page** (Input validation, 1-click demo login buttons for all 3 roles).
3. **Registration Page** (Input validation, role selection, terms agreement).
4. **Admin Dashboard** (Stat cards, Trajectory area chart, Engagement donut chart, Enrollment tables).
5. **Teacher Dashboard** (Faculty stats, Grade distribution bar chart, Pending grading queue).
6. **Student Dashboard** (Enrolled courses, Resume learning hero, Deadlines, Campus news).
7. **Course Catalog** (Category pills, search filtering, level dropdown, enrollment status).
8. **Course Details** (Hero banner, syllabus accordion, outcomes checklist, instructor profile).
9. **Lesson Learning Page** (Theater video player, notes autosave, Q&A discussions, downloads, lesson checklist).
10. **Assignments Hub** (Role-tailored: Teacher grading modal & student submission modal).
11. **Quizzes Page** (Quiz list, timed quiz engine, automated results with explanations).
12. **Student Profile** (Academic stats, enrolled courses, verified certificates gallery).
13. **Settings Page** (Profile updating, theme toggle, JSON backup export, factory reset).

---

## 🔑 Demo Login Credentials

For testing and demonstration, EduNova comes pre-loaded with realistic demo accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Dr. Robert Vance | `admin@edunova.com` | `admin123` |
| **Teacher** | Prof. Sarah Chen | `sarah.chen@edunova.com` | `teacher123` |
| **Student** | Alex Morgan | `alex.morgan@edunova.com` | `student123` |

> ⚡ **Quick Role Switcher**: A floating pill at the bottom-left of the screen allows instant 1-click switching between **Student**, **Teacher**, and **Admin** modes without re-typing passwords.

---

## 🚀 Running the Application Locally

EduNova is built with modern web standards and zero required backend build steps, making it lightweight, fast, and completely reliable.

### Option 1: Direct Browser Launch (Simplest)
Double-click `index.html` (or right-click and choose **Open With > Google Chrome / Microsoft Edge / Brave**). The entire LMS will launch immediately!

### Option 2: Using the Included PowerShell Server (Windows)
Run in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```
This automatically finds the best available local server (Python, Node, or direct launch) and opens `http://localhost:3000`.

### Option 3: Using Node.js / npx
```bash
npx serve . -p 3000
```
Then visit `http://localhost:3000`.

### Option 4: Using Python
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 🗄️ Database & Storage Architecture

EduNova uses an asynchronous client-side persistence engine in `js/db.js`:
- Data is stored in browser `localStorage` under `edunova_lms_db_v1`.
- Fully reactive: updates automatically trigger UI re-renders via CustomEvents.
- Includes **Export Database JSON** and **Reset to Factory Defaults** in the Settings view.
- Easily swappable to a PostgreSQL or MongoDB REST backend by replacing the storage calls in `db.js`.
