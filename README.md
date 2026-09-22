# LMS App (Expo + Firebase)

Full-featured Learning Management System mobile app built with **Expo**, **React Navigation**, **Firebase** (Auth / Firestore / Storage), **Context API**, and **NativeWind**.

Real-time two-way sync uses Firestore `onSnapshot` listeners — UI updates automatically when backend data changes.

## Quick start

```bash
npm install
# Paste your existing Firebase config into services/firebase.js
npx expo start
```

## Connect your Firebase project

Open `services/firebase.js` and replace the placeholder object with your existing project config:

```js
export const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

Enable in the Firebase console:

1. **Authentication** → Email/Password
2. **Firestore Database**
3. **Storage** (optional, for avatars/thumbnails)

Do **not** create a new Firebase project for this app — use your existing one.

## Assumed product decisions

| Decision | Default | Change if needed |
|---|---|---|
| 4th tab | **Profile** (Home / Learn / Engage / Profile) | Remove from `navigation/TabNavigator.js` |
| Auth | Email + password | Swap providers in `services/auth.js` |
| Roles | `student` / `teacher` / `admin` | Adjust signup + rule checks |
| Styling | NativeWind (Tailwind) | — |
| Sync | Real-time Firestore listeners | Not offline-first / not a separate API |

## Folder structure

```
App.js
services/          Firebase config + auth / firestore / storage
context/           Auth, Courses, Engagement providers
hooks/             useCourseDetail, usePostDetail
navigation/        Auth stack + bottom tabs + nested stacks
screens/           auth, home, learn, engage, profile
components/        shared UI (loading / empty / error / cards)
constants/         roles, colors, badge defs
```

## Firestore collections (expected)

| Collection | Purpose |
|---|---|
| `users` | Profile, role, enrolledCourseIds, points, badges |
| `courses` | Catalog entries |
| `lessons` | Lessons linked by `courseId` (+ optional `quiz`) |
| `progress` | Docs id `{uid}_{courseId}` — completion tracking |
| `posts` | Community feed (+ subcollection `comments`) |
| `announcements` | Home feed notices |

### Sample course document

```json
{
  "title": "Intro to React Native",
  "description": "Build mobile apps with Expo.",
  "instructorId": "uid",
  "instructorName": "Ada Teacher",
  "category": "Development",
  "level": "Beginner",
  "published": true,
  "createdAt": "<serverTimestamp>"
}
```

### Sample lesson document

```json
{
  "courseId": "<courseId>",
  "title": "Welcome & setup",
  "content": "Install Expo and create your first project…",
  "videoUrl": "https://example.com/video.mp4",
  "order": 1,
  "durationMinutes": 12,
  "quiz": {
    "questions": [
      {
        "id": "q1",
        "prompt": "What command starts Expo?",
        "options": ["expo start", "npm build", "pod install"],
        "correctIndex": 0
      }
    ]
  }
}
```

### Composite index

The lessons query uses `where('courseId')` + `orderBy('order')`. Firestore will prompt you to create the composite index on first run (follow the error link).

## Security rules

Client code never bypasses permissions. Deploy rules that match your roles, for example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    function userDoc() { return get(/databases/$(database)/documents/users/$(request.auth.uid)); }
    function isStaff() {
      return signedIn() && userDoc().data.role in ['teacher', 'admin'];
    }

    match /users/{uid} {
      allow read: if signedIn();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid) || isStaff();
    }
    match /courses/{id} {
      allow read: if true;
      allow write: if isStaff();
    }
    match /lessons/{id} {
      allow read: if true;
      allow write: if isStaff();
    }
    match /progress/{id} {
      allow read, write: if signedIn() && resource == null
        ? request.resource.data.userId == request.auth.uid
        : resource.data.userId == request.auth.uid;
    }
    match /posts/{id} {
      allow read: if signedIn();
      allow create: if signedIn();
      allow update: if signedIn();
      allow delete: if signedIn() && resource.data.authorId == request.auth.uid;
      match /comments/{cid} {
        allow read, create: if signedIn();
      }
    }
    match /announcements/{id} {
      allow read: if signedIn();
      allow write: if isStaff();
    }
  }
}
```

Tune these to match your existing production rules.

## Tabs

1. **Home** — welcome, overall progress, enrolled courses, announcements  
2. **Learn** — catalog → course detail → lesson player → quiz  
3. **Engage** — feed, likes, comments, create post, leaderboard  
4. **Profile** — info, settings, certificates/badges, logout  

## Scripts

```bash
npm start          # Expo dev server
npm run android
npm run ios
npm run web
```

## Notes

- Auth session persists via Firebase Auth + AsyncStorage (`getReactNativePersistence`).
- Points increase when completing lessons, quizzes, and creating posts (gamification).
- Teacher/admin signup is available on the signup screen for demos; lock this down in production rules.
