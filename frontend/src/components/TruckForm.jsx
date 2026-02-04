import { useState, useEffect } from 'react';

const TruckForm = ({ truck, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    unitNumber: '',
    vin: '',
    licensePlate: '',
    engineYear: new Date().getFullYear(),
    fuelType: 'DIESEL',
    fleetTag: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (truck) {
      setFormData({
        unitNumber: truck.unitNumber || '',
        vin: truck.vin || '',
        licensePlate: truck.licensePlate || '',
        engineYear: truck.engineYear || new Date().getFullYear(),
        fuelType: truck.fuelType || 'DIESEL',
        fleetTag: truck.fleetTag || '',
      });
    }
  }, [truck]);

  const validate = () => {
    const newErrors = {};

    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
    }

    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }

    const year = parseInt(formData.engineYear);
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      newErrors.engineYear = 'Invalid engine year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        engineYear: parseInt(formData.engineYear),
        vin: formData.vin.toUpperCase(),
        licensePlate: formData.licensePlate.toUpperCase(),
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
            Unit Number *
          </label>
          <input
            type="text"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            className={`input-field ${errors.unitNumber ? 'border-red-500' : ''}`}
            placeholder="e.g., TRK-001"
          />
          {errors.unitNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.unitNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VIN *
          </label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            className={`input-field uppercase ${errors.vin ? 'border-red-500' : ''}`}
            placeholder="17-character VIN"
            maxLength={17}
          />
          {errors.vin && (
            <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Plate *
          </label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className={`input-field uppercase ${errors.licensePlate ? 'border-red-500' : ''}`}
            placeholder="e.g., 8ABC123"
          />
          {errors.licensePlate && (
            <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engine Year *
          </label>
          <input
            type="number"
            name="engineYear"
            value={formData.engineYear}
            onChange={handleChange}
            className={`input-field ${errors.engineYear ? 'border-red-500' : ''}`}
            min={1990}
            max={new Date().getFullYear() + 1}
          />
          {errors.engineYear && (
            <p className="text-red-500 text-xs mt-1">{errors.engineYear}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type *
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="input-field"
          >
            <option value="DIESEL">Diesel</option>
            <option value="ALT_FUEL">Alternative Fuel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fleet Tag
          </label>
          <input
            type="text"
            name="fleetTag"
            value={formData.fleetTag}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Yard A, Route 5"
          />
        </div>
      </div>

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
          {loading ? 'Saving...' : truck ? 'Update Truck' : 'Add Truck'}
        </button>
      </div>
    </form>
  );
};

export default TruckForm;
