# EduFlow School Admission Workflow — Backend API

A clean, production-grade MVC backend API built for the School Admission Workflow machine task using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

---

## 1. Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & admin auto-seeding
│   ├── controllers/
│   │   ├── admissionController.js # Admission team workflow actions
│   │   ├── authController.js      # Register & login controllers
│   │   ├── examSlotController.js  # Slot creation, availability, booking
│   │   └── studentController.js   # Student application CRUD & fee payment
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT authentication & role authorization
│   │   └── errorMiddleware.js     # 404 handler & global error handler
│   ├── models/
│   │   ├── ExamSlot.js            # ExamSlot Mongoose model
│   │   ├── Student.js             # Student Mongoose model
│   │   └── User.js                # User Mongoose model
│   ├── routes/
│   │   ├── admissionRoutes.js     # /api/admissions routes
│   │   ├── authRoutes.js          # /api/auth routes
│   │   ├── examSlotRoutes.js      # /api/exam-slots routes
│   │   └── studentRoutes.js       # /api/students routes
│   ├── validators/
│   │   ├── admissionValidator.js  # Score & course validation chains
│   │   ├── authValidator.js       # Register & login validation chains
│   │   ├── examSlotValidator.js   # Slot creation & booking validators
│   │   └── studentValidator.js    # Student fields & ID validators
│   ├── app.js                     # Express app setup, security headers, routes
│   └── server.js                  # Entry point connecting DB & HTTP listener
├── .env                           # Environment secrets
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
├── package.json                   # Project metadata & npm dependencies
└── README.md                      # Comprehensive documentation & API guide
```

---

## 2. Tech Stack & Required Dependencies

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Validation**: `express-validator`
- **Security & Utilities**: `helmet`, `cors`, `dotenv`
- **Dev Tooling**: `nodemon`

---

## 3. Database Models & Schema Design

### 1. User Model (`src/models/User.js`)
- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, required, min 6 chars, hashed via bcrypt pre-save)
- `role` (String, enum: `['PARENT', 'ADMISSION_TEAM']`, default: `'PARENT'`)
- `createdAt`, `updatedAt` (Timestamps)
- *Security Rule*: Passwords are automatically stripped from JSON outputs (`toJSON` transform).

### 2. Student Model (`src/models/Student.js`)
- `parentId` (ObjectId, ref: `User`, required)
- `studentName` (String, required, trimmed)
- `dateOfBirth` (String, required)
- `gender` (String, enum: `['Male', 'Female', 'Other']`, required)
- `previousSchool` (String, optional)
- `applyingGrade` (String, required)
- `status` (String, enum: `['APPLICATION_CREATED', 'REGISTRATION_FEE_PAID', 'SLOT_BOOKED', 'EXAM_COMPLETED', 'ADMISSION_COMPLETED']`, default: `'APPLICATION_CREATED'`)
- `registrationFeePaid` (Boolean, default: `false`)
- `registrationFeeAmount` (Number, default: `0`)
- `registrationPaidAt` (Date, default: `null`)
- `examSlotId` (ObjectId, ref: `ExamSlot`, default: `null`)
- `examScore` (Number, default: `null`)
- `examCompletedAt` (Date, default: `null`)
- `assignedCourse` (String, default: `null`)
- `courseAssignedAt` (Date, default: `null`)
- `createdAt`, `updatedAt` (Timestamps)

### 3. ExamSlot Model (`src/models/ExamSlot.js`)
- `date` (String, required, e.g. "2026-07-15")
- `startTime` (String, required, e.g. "10:00 AM")
- `endTime` (String, required, e.g. "11:00 AM")
- `capacity` (Number, min: 1, required)
- `bookedCount` (Number, default: `0`)
- `isActive` (Boolean, default: `true`)
- `createdAt`, `updatedAt` (Timestamps)

---

## 4. Admission Workflow State Machine

The workflow is strictly sequential and enforced server-side. Step skipping is strictly prohibited:

```
APPLICATION_CREATED
        ↓  (Parent pays registration fee: POST /api/students/:id/pay-registration)
REGISTRATION_FEE_PAID
        ↓  (Parent books active slot with capacity: POST /api/exam-slots/:slotId/book)
SLOT_BOOKED
        ↓  (Admission team records score [0-100]: PATCH /api/admissions/:studentId/exam-score)
EXAM_COMPLETED
        ↓  (Admission team assigns course [Grade 1-4]: PATCH /api/admissions/:studentId/course)
ADMISSION_COMPLETED
```

---

## 5. Complete API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register parent account (`role` always forced to `PARENT`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue signed JWT |

### Students (`/api/students`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/students` | PARENT | Create student application (initial status `APPLICATION_CREATED`) |
| `GET` | `/api/students` | PARENT | Retrieve only own children applications |
| `GET` | `/api/students/:id` | Authenticated | View student (Parent: own only; Admission Team: any) |
| `PUT` | `/api/students/:id` | PARENT | Edit student details (**only** if `APPLICATION_CREATED`) |
| `POST` | `/api/students/:id/pay-registration` | PARENT | Mock fee payment (transitions to `REGISTRATION_FEE_PAID`) |

### Exam Slots (`/api/exam-slots`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/exam-slots` | ADMISSION_TEAM | Create exam slot with capacity |
| `GET` | `/api/exam-slots/available` | Authenticated | List slots where `isActive: true` & `bookedCount < capacity` |
| `POST` | `/api/exam-slots/:slotId/book` | PARENT | Book 1 slot for student (requires `REGISTRATION_FEE_PAID`) |

### Admissions (`/api/admissions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admissions` | ADMISSION_TEAM | View all applications (supports `?page=1&limit=10&status=...`) |
| `GET` | `/api/admissions/completed` | ADMISSION_TEAM | View students where status is `ADMISSION_COMPLETED` |
| `PATCH` | `/api/admissions/:studentId/exam-score` | ADMISSION_TEAM | Enter exam score (0–100; student must be `SLOT_BOOKED`) |
| `PATCH` | `/api/admissions/:studentId/course` | ADMISSION_TEAM | Assign final grade (Grade 1–4; student must be `EXAM_COMPLETED`) |

---

## 6. How to Run

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Environment Configuration
Ensure `.env` exists in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/school_admission
JWT_SECRET=supersecretjwtkey_school_admission_2026
JWT_EXPIRES_IN=7d
REGISTRATION_FEE=1000
```

### Step 3: Start MongoDB
Ensure your local MongoDB service is running on port 27017.

### Step 4: Run the Backend
```bash
# Start in development mode with nodemon
npm run dev

# Or start in production mode
npm start
```

*Note: On initial startup, the backend automatically seeds a default Admission Team user:*
- **Email**: `admin@school.com`
- **Password**: `admin123`
- **Role**: `ADMISSION_TEAM`

---

## 7. Example Postman / cURL Requests

### 1. Register Parent
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Riya Sharma", "email": "riya@example.com", "password": "password123"}'
```

### 2. Login Parent
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "riya@example.com", "password": "password123"}'
```

### 3. Create Student Application
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -d '{
    "studentName": "Aarav Sharma",
    "dateOfBirth": "2018-05-10",
    "gender": "Male",
    "previousSchool": "Sunrise Primary School",
    "applyingGrade": "Grade 3"
  }'
```

### 4. Pay Registration Fee (Mock Payment)
```bash
curl -X POST http://localhost:5000/api/students/<STUDENT_ID>/pay-registration \
  -H "Authorization: Bearer <PARENT_TOKEN>"
```

### 5. Create Exam Slot (Admission Team)
```bash
curl -X POST http://localhost:5000/api/exam-slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "date": "2026-07-15",
    "startTime": "10:00 AM",
    "endTime": "11:00 AM",
    "capacity": 15
  }'
```

### 6. Book Exam Slot (Parent)
```bash
curl -X POST http://localhost:5000/api/exam-slots/<SLOT_ID>/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -d '{"studentId": "<STUDENT_ID>"}'
```

### 7. Enter Exam Score (Admission Team)
```bash
curl -X PATCH http://localhost:5000/api/admissions/<STUDENT_ID>/exam-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"score": 85}'
```

### 8. Assign Course (Admission Team)
```bash
curl -X PATCH http://localhost:5000/api/admissions/<STUDENT_ID>/course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"course": "Grade 3"}'
```
