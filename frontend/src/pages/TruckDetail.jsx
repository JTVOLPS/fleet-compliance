import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTruck } from '../hooks/useTrucks';
import { trucksApi, testRecordsApi, remindersApi } from '../utils/api';
import TruckForm from '../components/TruckForm';
import TestRecordForm from '../components/TestRecordForm';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, getFuelTypeText, getDaysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';

const TruckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { truck, loading, error, refetch } = useTruck(id);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateTruck = async (data) => {
    setSubmitting(true);
    try {
      await trucksApi.update(id, data);
      toast.success('Truck updated successfully');
      setShowEditModal(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update truck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTruck = async () => {
    setSubmitting(true);
    try {
      await trucksApi.delete(id);
      toast.success('Truck deleted successfully');
      navigate('/trucks');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete truck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTestRecord = async (data) => {
    setSubmitting(true);
    try {
      await testRecordsApi.create(data);
      toast.success('Test record added successfully');
      setShowTestModal(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add test record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await remindersApi.delete(reminderId);
      toast.success('Reminder deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-padres-gold"></div>
      </div>
    );
  }

  if (error || !truck) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Truck not found'}</p>
        <Link to="/trucks" className="btn-primary">
          Back to Trucks
        </Link>
      </div>
    );
  }

  const daysUntilDue = getDaysUntil(truck.nextDueDate);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/trucks" className="text-gray-500 hover:text-gray-700">
          Trucks
        </Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{truck.unitNumber}</span>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              truck.status === 'COMPLIANT' ? 'bg-green-100' :
              truck.status === 'DUE_SOON' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <svg className={`w-7 h-7 ${
                truck.status === 'COMPLIANT' ? 'text-green-600' :
                truck.status === 'DUE_SOON' ? 'text-yellow-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{truck.unitNumber}</h1>
                <StatusBadge status={truck.status} needsRetest={truck.needsRetest} />
              </div>
              <p className="text-gray-500 font-mono">{truck.vin}</p>
              {truck.fleetTag && (
                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {truck.fleetTag}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowTestModal(true)} className="btn-primary">
              <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Test Record
            </button>
            <button onClick={() => setShowEditModal(true)} className="btn-outline">
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Truck Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">License Plate</dt>
              <dd className="font-medium text-gray-900">{truck.licensePlate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Engine Year</dt>
              <dd className="font-medium text-gray-900">{truck.engineYear}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Fuel Type</dt>
              <dd className="font-medium text-gray-900">{getFuelTypeText(truck.fuelType)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Added</dt>
              <dd className="font-medium text-gray-900">{formatDate(truck.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Compliance Status */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h2>
          {truck.nextDueDate ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">Next test due</p>
              <p className="text-2xl font-bold text-gray-900">{formatDate(truck.nextDueDate)}</p>
              <p className={`text-sm mt-1 ${
                daysUntilDue < 0 ? 'text-red-600' :
                daysUntilDue <= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : `${daysUntilDue} days remaining`}
              </p>

              {truck.needsRetest && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    This truck failed its last test and requires a retest.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No test records yet</p>
              <button
                onClick={() => setShowTestModal(true)}
                className="mt-4 text-padres-brown hover:text-padres-gold"
              >
                Add first test record
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h2>
          {truck.reminders?.filter(r => !r.sent).length > 0 ? (
            <div className="space-y-2">
              {truck.reminders.filter(r => !r.sent).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(reminder.reminderDate)}
                    </p>
                    <p className="text-xs text-gray-500">{reminder.reminderType}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming reminders</p>
          )}
        </div>
      </div>

      {/* Test History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test History</h2>
        {truck.testRecords?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Result</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Next Due</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tester</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {truck.testRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(record.testDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.testResult === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.testResult}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(record.nextDueDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.testerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No test records yet</p>
        )}
      </div>

      {/* Edit Truck Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Truck"
        size="lg"
      >
        <TruckForm
          truck={truck}
          onSubmit={handleUpdateTruck}
          onCancel={() => setShowEditModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Add Test Record Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Add Test Record"
        size="lg"
      >
        <TestRecordForm
          truckId={truck.id}
          onSubmit={handleAddTestRecord}
          onCancel={() => setShowTestModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Truck"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{truck.unitNumber}</strong>? This will also delete all test records and reminders. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-outline flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTruck}
              className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TruckDetail;
