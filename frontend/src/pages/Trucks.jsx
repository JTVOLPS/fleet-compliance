import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrucks } from '../hooks/useTrucks';
import TruckTable from '../components/TruckTable';
import TruckForm from '../components/TruckForm';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const Trucks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('unitNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [submitting, setSubmitting] = useState(false);

  const { trucks, loading, error, refetch, createTruck } = useTrucks({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const handleCreateTruck = async (data) => {
    setSubmitting(true);
    try {
      await createTruck(data);
      toast.success('Truck added successfully');
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add truck');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter trucks based on search
  const filteredTrucks = trucks.filter((truck) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      truck.unitNumber.toLowerCase().includes(searchLower) ||
      truck.vin.toLowerCase().includes(searchLower) ||
      truck.licensePlate.toLowerCase().includes(searchLower) ||
      truck.fleetTag?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trucks</h1>
          <p className="text-gray-500">Manage your fleet vehicles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Truck
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by unit number, VIN, plate, or tag..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'COMPLIANT', label: 'Compliant', color: 'green' },
              { value: 'DUE_SOON', label: 'Due Soon', color: 'yellow' },
              { value: 'OVERDUE', label: 'Overdue', color: 'red' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? option.color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : option.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'
                      : option.color === 'red'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-padres-brown text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Truck List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-padres-gold"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={refetch} className="btn-primary">
              Retry
            </button>
          </div>
        ) : filteredTrucks.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            title={search ? 'No trucks found' : 'No trucks yet'}
            description={
              search
                ? 'Try adjusting your search or filters'
                : 'Add your first truck to start tracking compliance'
            }
            action={
              !search && (
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  Add Truck
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredTrucks.length} truck{filteredTrucks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <TruckTable
              trucks={filteredTrucks}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </>
        )}
      </div>

      {/* Add Truck Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Truck"
        size="lg"
      >
        <TruckForm
          onSubmit={handleCreateTruck}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Trucks;
