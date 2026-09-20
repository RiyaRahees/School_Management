'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, CheckIcon, ArrowRightIcon } from './Icons';

const GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10'
];

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
  serverErrors = {}
}) {
  const datePickerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: initialData.studentName || initialData.name || '',
    dob: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : (initialData.dob || ''),
    gender: initialData.gender || 'Male',
    previousSchool: initialData.previousSchool || '',
    applyingGrade: initialData.applyingGrade || 'Grade 1'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleOpenCalendar = (e) => {
    e.preventDefault();
    if (datePickerRef.current) {
      try {
        if (typeof datePickerRef.current.showPicker === 'function') {
          datePickerRef.current.showPicker();
        } else {
          datePickerRef.current.focus();
        }
      } catch (err) {
        datePickerRef.current.focus();
      }
    }
  };

  // Sync server validation errors if passed
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      const mapped = {};
      if (serverErrors.studentName || serverErrors.name) {
        mapped.name = serverErrors.studentName || serverErrors.name;
      }
      if (serverErrors.dateOfBirth || serverErrors.dob) {
        mapped.dob = serverErrors.dateOfBirth || serverErrors.dob;
      }
      if (serverErrors.gender) mapped.gender = serverErrors.gender;
      if (serverErrors.applyingGrade) mapped.applyingGrade = serverErrors.applyingGrade;
      if (serverErrors.previousSchool) mapped.previousSchool = serverErrors.previousSchool;
      setErrors((prev) => ({ ...prev, ...mapped }));
    }
  }, [serverErrors]);

  // Flexible date parser supporting YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const parseDobToIso = (input) => {
    if (!input) return '';
    const trimmed = input.trim();
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(trimmed)) {
      const parts = trimmed.split(/[-/.]/);
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[-/.]/);
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return trimmed;
  };

  // Calculate age helper
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const iso = parseDobToIso(dobString);
    const dob = new Date(iso);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 && age <= 30 ? age : null;
  };

  const getFormattedDob = (raw) => {
    if (!raw) return null;
    const iso = parseDobToIso(raw);
    const parts = iso.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 25);
  const minDateStr = minDate.toISOString().split('T')[0];

  const calculatedAge = calculateAge(formData.dob);
  const formattedDob = getFormattedDob(formData.dob);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Student's full name is required.";
        if (value.trim().length < 2) return 'Student name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Student name should only contain letters and spaces.';
        return '';
      case 'dob': {
        if (!value || !value.trim()) return 'Date of birth is required.';
        const iso = parseDobToIso(value);
        const parts = iso.split('-');
        if (parts.length !== 3) {
          return 'Enter date as YYYY-MM-DD (e.g. 2018-05-14) or DD/MM/YYYY.';
        }
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
          return 'Please enter a valid calendar date.';
        }
        const dateObj = new Date(y, m - 1, d);
        if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
          return 'Invalid date (check days in month).';
        }
        const today = new Date();
        if (dateObj > today) return 'Date of birth cannot be in the future.';
        if (y < 2005) return 'Birth year must be 2005 or later.';
        return '';
      }
      case 'gender':
        if (!value) return 'Please select a gender.';
        return '';
      case 'applyingGrade':
        if (!value) return 'Target grade is required.';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errs = {
      name: validateField('name', formData.name),
      dob: validateField('dob', formData.dob),
      gender: validateField('gender', formData.gender),
      applyingGrade: validateField('applyingGrade', formData.applyingGrade)
    };

    // Filter empty error strings
    const cleanErrs = {};
    Object.keys(errs).forEach((key) => {
      if (errs[key]) cleanErrs[key] = errs[key];
    });

    setErrors(cleanErrs);
    return Object.keys(cleanErrs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      dob: true,
      gender: true,
      applyingGrade: true,
      previousSchool: true
    });

    if (!validateAll()) return;

    const isoDob = parseDobToIso(formData.dob);

    // Send payload matching both backend schema (studentName, dateOfBirth) and legacy keys
    const submissionPayload = {
      name: formData.name.trim(),
      studentName: formData.name.trim(),
      dob: isoDob,
      dateOfBirth: isoDob,
      gender: formData.gender,
      applyingGrade: formData.applyingGrade,
      previousSchool: formData.previousSchool.trim()
    };

    onSubmit(submissionPayload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        {/* Section Header */}
        <div className="form-section-header">
          <span className="form-section-badge">CANDIDATE INFORMATION</span>
          <span className="form-section-title">Student Profile & Academic Details</span>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="student-name-input">
            <span>
              Student&apos;s Full Name <span className="required">*</span>
            </span>
            <span style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 500 }}>
              As per official birth certificate
            </span>
          </label>
          <input
            id="student-name-input"
            name="name"
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Aarav Sharma"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            autoComplete="name"
          />
          {errors.name ? (
            <div className="form-error">
              <span>⚠</span>
              <span>{errors.name}</span>
            </div>
          ) : (
            <div className="form-hint">Enter the child&apos;s legal first and last name.</div>
          )}
        </div>

        {/* 2-Column: Date of Birth (Manual + Picker) & Gender */}
        <div className="form-grid">
          {/* Date of Birth with Pro Styling */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-dob-input">
              <span>
                <span>Date of Birth</span> <span className="required">*</span>
              </span>
              {calculatedAge !== null && (
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#065F46',
                  backgroundColor: '#D1FAE5',
                  border: '1px solid #A7F3D0',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px'
                }}>
                  {calculatedAge} {calculatedAge === 1 ? 'Year Old' : 'Years Old'}
                </span>
              )}
            </label>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="student-dob-input"
                name="dob"
                type="text"
                className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                placeholder="YYYY-MM-DD (e.g. 2018-05-14)"
                value={formData.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                style={{
                  paddingLeft: '14px',
                  paddingRight: '42px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}
              />

              {/* Native Datepicker Picker Trigger Button */}
              <button
                type="button"
                onClick={handleOpenCalendar}
                title="Open calendar picker"
                style={{
                  position: 'absolute',
                  right: '8px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <CalendarIcon size={15} color="#0D9488" />
              </button>

              {/* Native date input connected to ref for programmatic showPicker() */}
              <input
                ref={datePickerRef}
                id="hidden-native-dob-picker"
                type="date"
                max={todayStr}
                min={minDateStr}
                value={parseDobToIso(formData.dob) || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData(prev => ({ ...prev, dob: e.target.value }));
                    if (touched.dob || errors.dob) {
                      setErrors(prev => ({ ...prev, dob: '' }));
                    }
                  }
                }}
                tabIndex={-1}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '10px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  border: 'none',
                  padding: 0,
                  margin: 0
                }}
              />
            </div>

            {errors.dob ? (
              <div className="form-error" style={{ marginTop: '0.4rem' }}>
                <span>⚠</span>
                <span>{errors.dob}</span>
              </div>
            ) : formattedDob ? (
              <div style={{
                marginTop: '0.45rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px'
              }}>
                <CheckIcon size={13} color="#059669" />
                <span>Verified: {formattedDob}</span>
                {calculatedAge !== null && (
                  <span style={{ color: '#065F46', fontWeight: 500 }}>
                    · {calculatedAge} yrs old
                  </span>
                )}
              </div>
            ) : (
              <div className="form-hint" style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#64748B' }}>
                Enter date as <strong>YYYY-MM-DD</strong> or pick using the calendar icon.
              </div>
            )}
          </div>

          {/* Gender Select */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-gender-input">
              <span>
                Gender <span className="required">*</span>
              </span>
            </label>
            <select
              id="student-gender-input"
              name="gender"
              className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {errors.gender && (
              <div className="form-error">
                <span>⚠</span>
                <span>{errors.gender}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column: Applying For (Grade) & Previous School */}
        <div className="form-grid">
          {/* Applying Grade */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-grade-input">
              <span>
                Applying For (Target Grade) <span className="required">*</span>
              </span>
            </label>
            <select
              id="student-grade-input"
              name="applyingGrade"
              className={`form-select ${errors.applyingGrade ? 'is-invalid' : ''}`}
              value={formData.applyingGrade}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {errors.applyingGrade ? (
              <div className="form-error">
                <span>⚠</span>
                <span>{errors.applyingGrade}</span>
              </div>
            ) : (
              <div className="form-hint">Entrance assessment syllabus is based on this grade level.</div>
            )}
          </div>

          {/* Previous School */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-school-input">
              <span>Previous School / Institution</span>
              <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>(Optional)</span>
            </label>
            <input
              id="student-school-input"
              name="previousSchool"
              type="text"
              className="form-control"
              placeholder="e.g. Sunrise Primary School"
              value={formData.previousSchool}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="form-hint">Leave blank if this is the child&apos;s first school enrollment.</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="form-actions-bar">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ minWidth: '170px' }}
          >
            {isLoading ? (
              <span>Saving Application...</span>
            ) : isEdit ? (
              <span>Update Details</span>
            ) : (
              <>
                <span>Create Application</span>
                <ArrowRightIcon size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
