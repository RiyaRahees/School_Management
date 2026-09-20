'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getApplications } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import Loading from '../../../components/Loading';
import { SearchIcon } from '../../../components/Icons';

const GRADES = ['ALL', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'APPLICATION_CREATED', label: 'Application Created' },
  { value: 'REGISTRATION_FEE_PAID', label: 'Fee Paid' },
  { value: 'SLOT_BOOKED', label: 'Slot Booked' },
  { value: 'EXAM_COMPLETED', label: 'Exam Completed' },
  { value: 'ADMISSION_COMPLETED', label: 'Admission Completed' }
];

export default function ApplicationsListPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplications();
        setApplications(data || []);
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (app.name && app.name.toLowerCase().includes(q)) ||
      (app.parentName && app.parentName.toLowerCase().includes(q)) ||
      (app.parentEmail && app.parentEmail.toLowerCase().includes(q)) ||
      (app.applicationNumber && app.applicationNumber.toLowerCase().includes(q)) ||
      ((app._id || app.id || '').toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
    const matchesGrade = selectedGrade === 'ALL' || app.applyingGrade === selectedGrade;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const isCompletedTab = selectedStatus === 'ADMISSION_COMPLETED';

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem 0' }}>
            {isCompletedTab ? 'Completed Admissions' : 'Candidate Applications'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            {isCompletedTab
              ? 'List of formally enrolled students with assigned grades and entrance test results.'
              : 'Evaluate entrance test marks, coordinate schedules, and assign courses across all admission stages.'}
          </p>
        </div>

        {/* Quick Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${!isCompletedTab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            All Applications
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isCompletedTab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStatus('ADMISSION_COMPLETED')}
          >
            ✓ Completed ({applications.filter(a => a.status === 'ADMISSION_COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Section 7: Compact Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <SearchIcon size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search candidate name, parent, or application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
          ))}
        </select>

        {(search || selectedStatus !== 'ALL' || selectedGrade !== 'ALL') && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedStatus('ALL');
              setSelectedGrade('ALL');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <Loading type="skeleton-table" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No candidate records found"
          description="Try adjusting your search criteria or resetting active filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedStatus('ALL');
            setSelectedGrade('ALL');
          }}
        />
      ) : (
        <div className="table-container" style={{ overflowX: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Student</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Parent</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Grade</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Exam Score</th>
                <th style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>Course</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const appId = app._id || app.id;
                return (
                  <tr key={appId}>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#E8F8F5',
                          color: '#0F9D8A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#172033', fontSize: '0.875rem' }}>
                            {app.name}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#667085' }}>
                            #{app.applicationNumber || 'APP-2026-001'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#172033' }}>
                        {app.parentName || 'Parent'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#667085' }}>
                        {app.parentEmail || app.parentPhone || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 500, color: '#172033', fontSize: '0.8125rem' }}>
                        {app.applyingGrade}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (app.examScore != null || app.marksObtained != null) ? '#172033' : '#94A3B8' }}>
                        {app.examScore != null ? `${app.examScore} / 100` : app.marksObtained != null ? `${app.marksObtained} / 100` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: app.assignedCourse ? '#0F9D8A' : '#667085' }}>
                        {app.assignedCourse || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {app.status === 'SLOT_BOOKED' && (
                          <Link
                            href="/admission/update-score"
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            Update Score
                          </Link>
                        )}

                        {app.status === 'EXAM_COMPLETED' && (
                          <Link
                            href="/admission/assign-course"
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            Assign Course
                          </Link>
                        )}

                        <Link
                          href={`/admission/applications/${appId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
