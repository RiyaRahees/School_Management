// Centralized API Client Layer for EduFlow School Admission Management
function getBaseUrl() {
  let raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  raw = raw.trim().replace(/\/+$/, '');
  if (!raw.endsWith('/api') && !raw.includes('/api/')) {
    raw = `${raw}/api`;
  }
  return raw;
}
const API_BASE_URL = getBaseUrl();

// Helper to wipe legacy mock data from browser localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('eduflow_admission_mock_db_v2');
    localStorage.removeItem('eduflow_mock_students');
    localStorage.removeItem('eduflow_mock_db');
  } catch (e) {}
}

// Helper to retrieve the appropriate token based on role, endpoint, or current page
function getActiveAuthToken(targetRole, endpoint) {
  if (typeof window === 'undefined') return null;

  const adminToken = localStorage.getItem('admission_admin_token') || localStorage.getItem('admin_token');
  const parentToken = localStorage.getItem('admission_parent_token') || localStorage.getItem('parent_token');
  const genericToken = localStorage.getItem('admission_token');

  // Explicit role request
  if (targetRole === 'admission_team' || targetRole === 'admin') {
    return adminToken || genericToken;
  }
  if (targetRole === 'parent') {
    return parentToken || genericToken;
  }

  // Route/endpoint based inference
  if (endpoint) {
    if (endpoint.startsWith('/admissions') || (endpoint.startsWith('/exam-slots') && !endpoint.includes('/available') && !endpoint.includes('/book'))) {
      return adminToken || genericToken;
    }
    if (endpoint.startsWith('/students') || endpoint.includes('/book')) {
      return parentToken || genericToken;
    }
  }

  // Pathname context inference if available in browser
  const currentPath = window.location ? (window.location.pathname || '') : '';
  if (currentPath.startsWith('/admission')) {
    return adminToken || genericToken;
  }
  if (currentPath.startsWith('/parent')) {
    return parentToken || genericToken;
  }

  return adminToken || parentToken || genericToken;
}

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const token = options.token || getActiveAuthToken(options.role, endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.errors?.length
      ? data.errors.map(e => e.message).join('. ')
      : (data?.message || `Request failed with status ${res.status}`);
    const err = new Error(errorMsg);
    err.errors = data?.errors || [];
    err.status = res.status;
    throw err;
  }

  return data;
}

// Normalizer for student objects from backend
function normalizeStudent(s) {
  if (!s) return null;
  const id = s._id || s.id;
  const rawSlot = s.examSlotId || s.examSlot;
  let examSlot = null;
  if (rawSlot && typeof rawSlot === 'object') {
    examSlot = {
      _id: rawSlot._id || rawSlot.id,
      id: rawSlot._id || rawSlot.id,
      date: rawSlot.date || rawSlot.examDate || '',
      time: rawSlot.time || (rawSlot.startTime ? `${rawSlot.startTime} – ${rawSlot.endTime}` : '') || rawSlot.examTime || '',
      location: rawSlot.location || 'Main Campus, Examination Center'
    };
  }

  return {
    ...s,
    _id: id,
    id: id,
    name: s.studentName || s.name || 'Unnamed Student',
    studentName: s.studentName || s.name || 'Unnamed Student',
    applicationNumber: s.applicationNumber || `APP-${id ? id.slice(-5).toUpperCase() : '2026'}`,
    dateOfBirth: s.dateOfBirth || s.dob || '',
    gender: s.gender || '',
    previousSchool: s.previousSchool || '',
    applyingGrade: s.applyingGrade || '',
    status: s.status || 'APPLICATION_CREATED',
    registrationFeePaid: Boolean(s.registrationFeePaid || s.feePaid || s.payment?.isPaid),
    feePaid: Boolean(s.registrationFeePaid || s.feePaid || s.payment?.isPaid),
    feeAmount: s.registrationFeeAmount || s.payment?.amount || 500,
    feePaymentDate: s.registrationPaidAt || s.payment?.paidAt || null,
    feePaymentRef: s.payment?.transactionId || (s.registrationPaidAt ? `TXN-${id.slice(-6).toUpperCase()}` : null),
    examSlot: examSlot,
    examScore: s.examScore ?? s.examResult?.marks ?? null,
    assignedCourse: s.assignedCourse || s.admission?.assignedCourse || null,
    parentName: (typeof s.parentId === 'object' ? s.parentId?.name : s.parentName) || '',
    parentEmail: (typeof s.parentId === 'object' ? s.parentId?.email : s.parentEmail) || '',
    createdAt: s.createdAt || new Date().toISOString(),
    updatedAt: s.updatedAt || s.createdAt || new Date().toISOString()
  };
}

// Normalizer for exam slot objects from backend
function normalizeSlot(slot) {
  if (!slot) return null;
  const id = slot._id || slot.id;
  const timeStr = slot.time || (slot.startTime ? `${slot.startTime} – ${slot.endTime}` : '10:00 AM');
  const cap = Number(slot.capacity) || 10;
  const booked = Number(slot.bookedCount) || 0;
  const available = slot.availableSeats !== undefined ? Number(slot.availableSeats) : Math.max(0, cap - booked);

  return {
    ...slot,
    _id: id,
    id: id,
    date: slot.date || 'TBD',
    time: timeStr,
    capacity: cap,
    bookedCount: booked,
    availableSeats: available,
    location: slot.location || 'Main Campus, Examination Center',
    isAvailable: slot.isActive !== false && available > 0
  };
}

// ==========================================
// Public API Client Functions (Real Dynamic API)
// ==========================================

export const loginApi = async (credentials) => {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return res?.data || res;
};

export const registerApi = async (userData) => {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return res?.data || res;
};

export const login = loginApi;
export const register = registerApi;

// GET /api/students — Real students for logged-in parent
export const getStudents = async () => {
  try {
    const res = await request('/students', { method: 'GET' });
    const rawList = res?.data || res || [];
    const list = Array.isArray(rawList) ? rawList : [];
    return list.map(normalizeStudent);
  } catch (err) {
    console.error('getStudents error:', err);
    return [];
  }
};

// GET /api/students/:id — Real student details
export const getStudentById = async (id) => {
  try {
    const res = await request(`/students/${id}`, { method: 'GET' });
    const student = res?.data || res;
    return normalizeStudent(student);
  } catch (err) {
    console.error('getStudentById error:', err);
    return null;
  }
};

// POST /api/students — Create new student application
export const createStudent = async (studentData) => {
  const payload = {
    studentName: studentData.studentName || studentData.name,
    dateOfBirth: studentData.dateOfBirth || studentData.dob,
    gender: studentData.gender,
    previousSchool: studentData.previousSchool || '',
    applyingGrade: studentData.applyingGrade
  };
  const res = await request('/students', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeStudent(res?.data || res);
};

// PUT /api/students/:id — Edit student details before payment
export const updateStudent = async (id, studentData) => {
  const payload = {
    studentName: studentData.studentName || studentData.name,
    dateOfBirth: studentData.dateOfBirth || studentData.dob,
    gender: studentData.gender,
    previousSchool: studentData.previousSchool,
    applyingGrade: studentData.applyingGrade
  };
  const res = await request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return normalizeStudent(res?.data || res);
};

// POST /api/students/:id/pay-registration — Pay registration fee (Direct / Mock fallback)
export const payRegistrationFee = async (studentId) => {
  const res = await request(`/students/${studentId}/pay-registration`, {
    method: 'POST'
  });
  return res?.data || res;
};

// POST /api/students/:id/razorpay/create-order — Create Razorpay Order
export const createRazorpayOrder = async (studentId) => {
  const res = await request(`/students/${studentId}/razorpay/create-order`, {
    method: 'POST'
  });
  return res?.data || res;
};

// POST /api/students/:id/razorpay/verify — Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (studentId, paymentData) => {
  const res = await request(`/students/${studentId}/razorpay/verify`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
  return normalizeStudent(res?.data || res);
};

// Helper to dynamically load Razorpay Checkout script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Unified Razorpay Payment Trigger
export const initiateRazorpayPayment = async ({
  studentId,
  studentName = '',
  parentName = '',
  parentEmail = '',
  onSuccess,
  onError,
  onClose
}) => {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
    }

    const orderData = await createRazorpayOrder(studentId);

    if (!orderData?.keyId) {
      throw new Error('Razorpay Key ID was not provided by the server.');
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount, // 50000 paise (₹500)
      currency: orderData.currency || 'INR',
      name: 'EDUFLOW Admission Platform',
      description: `Application Registration Fee (₹500) for ${studentName || orderData.studentName}`,
      order_id: orderData.orderId,
      prefill: {
        name: parentName || orderData.parentName || '',
        email: parentEmail || orderData.parentEmail || ''
      },
      theme: {
        color: '#0F9D8A'
      },
      handler: async function (response) {
        try {
          const verified = await verifyRazorpayPayment(studentId, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          if (onSuccess) onSuccess(verified, response);
        } catch (verifyErr) {
          if (onError) onError(verifyErr);
        }
      },
      modal: {
        ondismiss: function () {
          if (onClose) onClose();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      if (onError) onError(new Error(resp.error?.description || 'Payment transaction failed'));
    });
    rzp.open();
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
};

// POST /api/exam-slots — Admission Team creates exam slot
export const createExamSlot = async (slotData) => {
  const payload = {
    date: slotData.date,
    startTime: slotData.startTime,
    endTime: slotData.endTime,
    capacity: Number(slotData.capacity)
  };
  const res = await request('/exam-slots', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeSlot(res?.data || res);
};

// GET /api/exam-slots — Admission Team gets all exam slots
export const getAllAdminExamSlots = async () => {
  try {
    const res = await request('/exam-slots', { method: 'GET' });
    const rawList = res?.data || res || [];
    const list = Array.isArray(rawList) ? rawList : [];
    return list.map(normalizeSlot);
  } catch (err) {
    console.error('getAllAdminExamSlots error:', err);
    return [];
  }
};

// GET /api/exam-slots/available — Real active exam slots for parents
export const getExamSlots = async () => {
  try {
    const res = await request('/exam-slots/available', { method: 'GET' });
    const rawList = res?.data || res || [];
    const list = Array.isArray(rawList) ? rawList : [];
    return list.map(normalizeSlot);
  } catch (err) {
    console.error('getExamSlots error:', err);
    return [];
  }
};

// POST /api/exam-slots/:slotId/book — Book slot with { studentId }
export const bookExamSlot = async (studentId, slotId) => {
  const res = await request(`/exam-slots/${slotId}/book`, {
    method: 'POST',
    body: JSON.stringify({ studentId })
  });
  return res?.data || res;
};

// GET /api/admissions — Real applications for admission team
export const getApplications = async (filters = {}) => {
  try {
    let url = '/admissions';
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await request(url, { method: 'GET' });
    const rawList = res?.data || res || [];
    const list = Array.isArray(rawList) ? rawList : [];
    let applications = list.map(normalizeStudent);

    if (filters.grade && filters.grade !== 'ALL') {
      applications = applications.filter(a => a.applyingGrade === filters.grade);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      applications = applications.filter(a =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.parentName && a.parentName.toLowerCase().includes(q)) ||
        (a.applicationNumber && a.applicationNumber.toLowerCase().includes(q))
      );
    }
    return applications;
  } catch (err) {
    console.error('getApplications error:', err);
    return [];
  }
};

// PATCH /api/admissions/:studentId/exam-score — Update exam score
export const updateExamScore = async (studentId, score) => {
  const res = await request(`/admissions/${studentId}/exam-score`, {
    method: 'PATCH',
    body: JSON.stringify({ score: Number(score) })
  });
  return res?.data || res;
};

// PATCH /api/admissions/:studentId/course — Assign course and finalize admission
export const assignCourse = async (studentId, course) => {
  const res = await request(`/admissions/${studentId}/course`, {
    method: 'PATCH',
    body: JSON.stringify({ course })
  });
  return res?.data || res;
};
