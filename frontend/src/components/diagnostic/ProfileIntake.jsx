import { useState } from 'react';
import { ArrowRight, UserCircle } from 'lucide-react';
import { useCompetency } from '../../context/CompetencyContext';

const DESIGNATIONS = [
  'Junior Statistical Officer (JSO)',
  'Senior Statistical Officer (SSO)',
  'Assistant Director',
  'Deputy Director',
  'Joint Director',
  'Director',
  'Deputy Director General',
  'Additional Director General',
  'Director General'
];

const DIVISIONS = [
  'National Statistical Office (NSO)',
  'Central Statistics Office (CSO)',
  'Data Processing Division (DPD)',
  'Survey Design and Research Division (SDRD)',
  'Field Operations Division (FOD)',
  'National Accounts Division (NAD)',
  'Economic Statistics Division (ESD)',
  'Directorate of Industrial & Internal Trade (DIID)',
  'Training Division',
];

const YEARS_OPTIONS = [
  '0 – 2 years',
  '3 – 5 years',
  '6 – 10 years',
  '11 – 15 years',
  '16 – 20 years',
  '20+ years',
];

const PREVIOUS_TRAININGS = [
  'NSSTA Induction Programme',
  'iGOT Karmayogi Modules',
  'UNDP/UN Statistical Capacity Building',
  'NIC/CERT-In Cybersecurity Workshop',
  'ISEC/ISI Statistical Methods Programme',
  'GIS/Remote Sensing Training (NRSC/ISRO)',
  'None',
];

export default function ProfileIntake({ onComplete, onSkip }) {
  const { profile: existingProfile } = useCompetency();

  // Pre-fill from existing profile if available (returning user)
  const [designation, setDesignation] = useState(existingProfile?.designation || '');
  const [division, setDivision] = useState(existingProfile?.division || '');
  const [yearsOfService, setYearsOfService] = useState(existingProfile?.yearsOfService || '');
  const [previousTrainings, setPreviousTrainings] = useState(existingProfile?.previousTrainings || []);

  const handleTrainingToggle = (training) => {
    if (training === 'None') {
      setPreviousTrainings((prev) => prev.includes('None') ? [] : ['None']);
      return;
    }
    setPreviousTrainings((prev) => {
      const filtered = prev.filter((t) => t !== 'None');
      return filtered.includes(training)
        ? filtered.filter((t) => t !== training)
        : [...filtered, training];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (designation && division && yearsOfService) {
      onComplete({ 
        designation, 
        division, 
        yearsOfService,
        previousTrainings: previousTrainings.filter((t) => t !== 'None'),
      });
    }
  };

  const isValid = designation && division && yearsOfService;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="brutalist-card p-6 md:p-8 bg-surface">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.15 }}>
            <UserCircle size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="heading-lg m-0" style={{ color: 'var(--color-primary)' }}>Officer Profile</h2>
            <p className="text-muted m-0 mt-1 text-sm">
              This information contextualizes your FRAC assessment against the target competency framework for your designation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Designation + Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-xs mb-1.5 text-ink font-bold">
                Current Designation
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full p-2.5 border-2 border-border bg-canvas focus:outline-none focus:border-primary transition-colors text-ink text-sm"
                style={{ borderRadius: 'var(--border-radius)' }}
                required
              >
                <option value="" disabled>Select designation...</option>
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block label-mono text-xs mb-1.5 text-ink font-bold">
                Division / Department
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-2.5 border-2 border-border bg-canvas focus:outline-none focus:border-primary transition-colors text-ink text-sm"
                style={{ borderRadius: 'var(--border-radius)' }}
                required
              >
                <option value="" disabled>Select division...</option>
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Years of Service */}
          <div>
            <label className="block label-mono text-xs mb-1.5 text-ink font-bold">
              Years of Service
            </label>
            <select
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              className="w-full p-2.5 border-2 border-border bg-canvas focus:outline-none focus:border-primary transition-colors text-ink text-sm"
              style={{ borderRadius: 'var(--border-radius)' }}
              required
            >
              <option value="" disabled>Select range...</option>
              {YEARS_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Row 3: Previous Trainings (multi-select checkboxes) */}
          <div>
            <label className="block label-mono text-xs mb-2 text-ink font-bold">
              Previous Trainings Attended
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PREVIOUS_TRAININGS.map((training) => (
                <label
                  key={training}
                  className="flex items-center gap-2 p-2 cursor-pointer text-sm transition-colors"
                  style={{
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--color-border)',
                    background: previousTrainings.includes(training) ? 'var(--color-primary)' : 'var(--color-canvas)',
                    color: previousTrainings.includes(training) ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={previousTrainings.includes(training)}
                    onChange={() => handleTrainingToggle(training)}
                    className="sr-only"
                  />
                  <span className="text-xs">{training}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col items-end gap-3">
            <button
              type="submit"
              disabled={!isValid}
              className="brutalist-btn bg-primary text-white flex items-center gap-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start FRAC Diagnostic <ArrowRight size={20} />
            </button>
            {onSkip && (
              <button
                type="button"
                disabled={!isValid}
                onClick={() => {
                  if (isValid) {
                    onSkip({
                      designation,
                      division,
                      yearsOfService,
                      previousTrainings: previousTrainings.filter((t) => t !== 'None'),
                    });
                  }
                }}
                className="text-sm font-semibold cursor-pointer bg-transparent border-none underline disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-muted)' }}
              >
                Skip assessment & continue →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
