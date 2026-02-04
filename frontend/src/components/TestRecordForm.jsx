import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TestRecordForm = ({ truckId, onSubmit, onCancel, loading }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    testDate: format(new Date(), 'yyyy-MM-dd'),
    testResult: 'PASS',
    testerName: '',
    notes: '',
    schedule: user?.testingSchedule || 'SEMI_ANNUAL',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.testDate) {
      newErrors.testDate = 'Test date is required';
    }

    if (!formData.testerName.trim()) {
      newErrors.testerName = 'Tester name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        truckId,
        ...formData,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Date *
          </label>
          <input
            type="date"
            name="testDate"
            value={formData.testDate}
            onChange={handleChange}
            className={`input-field ${errors.testDate ? 'border-red-500' : ''}`}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
          {errors.testDate && (
            <p className="text-red-500 text-xs mt-1">{errors.testDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Result *
          </label>
          <select
            name="testResult"
            value={formData.testResult}
            onChange={handleChange}
            className="input-field"
          >
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tester Name *
          </label>
          <input
            type="text"
            name="testerName"
            value={formData.testerName}
            onChange={handleChange}
            className={`input-field ${errors.testerName ? 'border-red-500' : ''}`}
            placeholder="Enter tester's name"
          />
          {errors.testerName && (
            <p className="text-red-500 text-xs mt-1">{errors.testerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testing Schedule
          </label>
          <select
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="input-field"
          >
            <option value="SEMI_ANNUAL">Semi-Annual (every 6 months)</option>
            <option value="QUARTERLY">Quarterly (every 3 months - 2027 rule)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.schedule === 'QUARTERLY'
              ? 'Next due date will be 3 months from test date'
              : 'Next due date will be 6 months from test date'}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Any additional notes about the test..."
          />
        </div>
      </div>

      {formData.testResult === 'FAIL' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Failed Test</p>
              <p className="text-xs text-yellow-700 mt-1">
                Recording a failed test will flag this truck as needing a retest. The due date will not be advanced until a passing test is recorded.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Record Test'}
        </button>
      </div>
    </form>
  );
};

export default TestRecordForm;
