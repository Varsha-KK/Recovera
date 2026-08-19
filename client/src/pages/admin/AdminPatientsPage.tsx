import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { RiskIndicator } from '../../components/common/RiskIndicator';
import { QuickCommunicationModal } from '../../components/admin/QuickCommunicationModal';
import { PatientProfileData } from '../../types';
import { getStatusBadgeColor } from '../../utils/formatters';
import {
  Users,
  Search,
  UserPlus,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminPatientsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRisk = searchParams.get('riskLevel') || 'ALL';

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientProfileData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState(initialRisk);
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfileData | null>(null);

  // New Patient Form state
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 52,
    gender: 'MALE',
    phone: '+1 (555) 300-1122',
    email: '',
    diagnosis: 'Type 2 Diabetes Mellitus with Complications',
    diseaseCode: 'DIABETES',
    severity: 'HIGH',
    primaryDoctor: 'Dr. Sarah Jenkins',
    department: 'Endocrinology',
  });
  const [creating, setCreating] = useState(false);

  const { success, error } = useToast();

  const fetchPatients = async () => {
    try {
      const res = await adminService.getPatients({
        riskLevel: riskFilter !== 'ALL' ? riskFilter : undefined,
        condition: conditionFilter !== 'ALL' ? conditionFilter : undefined,
        search: search || undefined,
        overdueOnly: overdueOnly || undefined,
      });
      setPatients(res.data);
    } catch (err: any) {
      error('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [riskFilter, conditionFilter, overdueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminService.createPatient(newPatient);
      success('New patient registered and care plan activated.', 'Patient Created');
      setCreateModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create patient.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Patient Follow-Up Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Risk-stratified cohort directory with follow-up milestones and communication history
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Discharged Patient
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
              <Input
                placeholder="Search patient, ID, doctor, condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-2 text-xs"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {/* Risk Level Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk (61-100)</option>
                <option value="MEDIUM">Medium Risk (31-60)</option>
                <option value="LOW">Low Risk (0-30)</option>
              </select>

              {/* Condition Filter */}
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">All Conditions</option>
                <option value="Diabetes">Type 2 Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Tuberculosis">Tuberculosis</option>
                <option value="Coronary">Cardiac / CABG</option>
                <option value="Surgery">Post-Surgical</option>
              </select>

              {/* Overdue Checkbox */}
              <button
                type="button"
                onClick={() => setOverdueOnly(!overdueOnly)}
                className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  overdueOnly
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue Only
              </button>
            </div>
          </div>

          {/* Patient Table (Desktop) / Cards (Mobile) */}
          {loading ? (
            <LoadingSpinner label="Filtering patient cohort..." />
          ) : patients.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
              <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1">No Patients Matching Filters</h3>
              <p className="text-xs text-slate-500">Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Patient Details</th>
                      <th className="py-3.5 px-4">Condition</th>
                      <th className="py-3.5 px-4">Care Risk</th>
                      <th className="py-3.5 px-4">Next Follow-Up</th>
                      <th className="py-3.5 px-4">Pending Diagnostic</th>
                      <th className="py-3.5 px-4">Last Contact</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr key={p.patientId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5">
                          <Link
                            to={`/admin/patients/${p.patientId}`}
                            className="font-bold text-slate-900 hover:text-brand-700 transition-colors block text-sm"
                          >
                            {p.name}
                          </Link>
                          <span className="text-xs text-slate-400 font-mono">
                            {p.patientId} • {p.age}y • {p.gender}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 block line-clamp-1">
                            {p.diagnosis}
                          </span>
                          <span className="text-xs text-slate-500">Dr. {p.primaryDoctor}</span>
                        </td>

                        <td className="py-4 px-4">
                          <RiskIndicator
                            score={p.riskScore}
                            level={p.riskLevel}
                            size="sm"
                            showLabel={true}
                          />
                        </td>

                        <td className="py-4 px-4">
                          {p.nextAppointment ? (
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {p.nextAppointment.formattedDate}
                                {p.nextAppointment.isOverdue && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-bold">
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.nextAppointment.scheduledTime} •{' '}
                                <span className={getStatusBadgeColor(p.nextAppointment.status)}>
                                  {p.nextAppointment.status}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None Scheduled</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {p.pendingTestName ? (
                            <div>
                              <span className="font-bold text-slate-800 block line-clamp-1">
                                {p.pendingTestName}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                                PENDING
                              </span>
                            </div>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-500">
                          <div>{p.lastContactDate}</div>
                          <span className="font-bold text-slate-700 capitalize">
                            {p.lastContactChannel} ({p.lastContactStatus})
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/admin/patients/${p.patientId}`}>
                              <button className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                                View
                              </button>
                            </Link>

                            <button
                              onClick={() => {
                                setSelectedPatient(p);
                                setCommModalOpen(true);
                              }}
                              title="Send Quick SMS or Voice Reminder"
                              className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {patients.map((p) => (
                  <div key={p.patientId} className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/admin/patients/${p.patientId}`}
                          className="font-bold text-base text-slate-900"
                        >
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono">
                          {p.patientId} • {p.age}y • {p.gender}
                        </div>
                      </div>
                      <RiskIndicator score={p.riskScore} level={p.riskLevel} size="sm" showLabel={true} />
                    </div>

                    <div className="text-xs text-slate-700 font-bold">{p.diagnosis}</div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Follow-Up:</span>
                        <span className="font-bold text-slate-900">
                          {p.nextAppointment?.formattedDate || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pending Lab:</span>
                        <span className="font-bold text-slate-700">
                          {p.pendingTestName || 'Completed ✓'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Link to={`/admin/patients/${p.patientId}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Patient Profile
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(p);
                          setCommModalOpen(true);
                        }}
                        leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Discharged Patient"
        subtitle="Formulates dynamic care plan, follow-up window, and initial reminder schedule"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <Input
            label="Patient Full Name"
            required
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            placeholder="e.g. Maria Gonzalez"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age"
              type="number"
              required
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
            />
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              type="tel"
              required
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              placeholder="patient@recovera.health"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Diagnosis / Clinical Profile
            </label>
            <input
              type="text"
              required
              value={newPatient.diagnosis}
              onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Baseline Severity
              </label>
              <select
                value={newPatient.severity}
                onChange={(e) => setNewPatient({ ...newPatient, severity: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600"
              >
                <option value="HIGH">High (Daily/Weekly Follow-Up)</option>
                <option value="MEDIUM">Medium (14-Day Window)</option>
                <option value="LOW">Low (Standard Care)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Attending Physician
              </label>
              <input
                type="text"
                required
                value={newPatient.primaryDoctor}
                onChange={(e) => setNewPatient({ ...newPatient, primaryDoctor: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-brand-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={creating}>
              Create Patient & Formulate Care Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Outreach Trigger */}
      <QuickCommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        patient={selectedPatient}
        onCommunicationSent={fetchPatients}
      />
    </div>
  );
};

export default AdminPatientsPage;
