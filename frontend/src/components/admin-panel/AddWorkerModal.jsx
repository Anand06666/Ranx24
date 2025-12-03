import React, { useState, useEffect } from "react";

function AddWorkerModal({ categories, subCategories, onSave, onClose }) { // Added subCategories prop
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    state: "",
    district: "",
    city: "",
    latitude: "",
    longitude: "",
    categories: [],
    services: [], // Changed to array for subcategories
    status: "pending",
    workerType: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selected = [...e.target.options]
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, categories: selected, services: [] })); // Reset services when categories change
  };

  const handleServiceChange = (e) => {
    const selected = [...e.target.options]
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, services: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // formData now directly contains categories and services (subcategories)
  };

  // Filter subcategories based on selected categories
  const availableSubCategories = subCategories.filter(sub =>
    formData.categories.includes(sub.parentName)
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-fadeIn border border-gray-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">Add New Worker</h2>
          <button
            onClick={onClose}
            className="text-red-500 text-xl hover:text-red-700"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* NAME FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          {/* MOBILE + PASSWORD */}
          <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />

          {/* LOCATION */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="State" name="state" value={formData.state} onChange={handleChange} />
            <Input label="District" name="district" value={formData.district} onChange={handleChange} />
          </div>

          <Input label="City" name="city" value={formData.city} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
            <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
          </div>

          {/* CATEGORIES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <select
              multiple
              name="categories"
              value={formData.categories}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded-md h-28 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold CTRL to select multiple</p>
          </div>

          {/* SUBCATEGORIES (Services) */}
          {formData.categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Services (Subcategories)
              </label>
              <select
                multiple
                name="services"
                value={formData.services}
                onChange={handleServiceChange}
                className="w-full p-2 border rounded-md h-28 focus:ring-2 focus:ring-blue-500"
              >
                {availableSubCategories.map((sub) => (
                  <option key={sub._id} value={sub.name}>
                    {sub.parentName} - {sub.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select subcategories for chosen categories</p>
            </div>
          )}

          {/* STATUS + WORKER TYPE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Input
              label="Worker Type"
              name="workerType"
              value={formData.workerType}
              onChange={handleChange}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              Add Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* REUSABLE INPUT COMPONENT */
function Input({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default AddWorkerModal;
