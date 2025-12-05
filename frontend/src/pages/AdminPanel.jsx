// DEPRECATED: This component is no longer used. The admin dashboard now uses nested routing via AdminLayout.jsx and App.jsx.
import React, { useState, useEffect } from "react";
import axios from 'axios';
import Sidebar from "../components/admin-panel/Sidebar";
import Topbar from "../components/admin-panel/Topbar";
import DashboardContent from "../components/admin-panel/DashboardContent";
import UserManagement from "../components/admin-panel/UserManagement";
import WorkerManagement from "../components/admin-panel/WorkerManagement";
import BookingManagement from "../components/admin-panel/BookingManagement";
import ReviewManagement from "../components/admin-panel/ReviewManagement";
import HelpManagement from "../components/admin-panel/HelpManagement";
import WalletManagement from "../components/admin-panel/WalletManagement";
import CategoryManagement from "../components/admin-panel/CategoryManagement";
import EditWorkerModal from "../components/admin-panel/EditWorkerModal";
import AddWorkerModal from "../components/admin-panel/AddWorkerModal";
import AddCityManagement from "../components/admin-panel/AddCityManagement";
import BannerManagement from "../components/admin-panel/BannerManagement";
import CouponManagement from "../components/admin-panel/CouponManagement";
import CoinsManagement from "../components/admin-panel/CoinsManagement";
import FeeManagement from "../components/admin-panel/FeeManagement";
import WithdrawalManagement from "../components/admin-panel/WithdrawalManagement";
import UserAppDashboard from "../components/admin-panel/UserAppDashboard";
import WorkerAppDashboard from "../components/admin-panel/WorkerAppDashboard";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminPanel() {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals (Managed by WorkerManagement now, but keeping here if needed for global actions or moving entirely)
  // For now, we'll let WorkerManagement handle its own modals to decouple.
  // However, if other components need these modals, we might need to lift state up again.
  // Based on refactor, WorkerManagement handles its own add/edit.

  // Admin info
  const admin = { name: "Admin", email: "admin@example.com" };

  // Dashboard Stats
  const [stats, setStats] = useState({
    users: 0,
    workersPending: 0,
    verifiedWorkers: 0,
    bookings: 0,
    earnings: 0,
    activeServices: 0,
    availableCities: 0,
    completedBookings: 0,
    bookingsToday: 0,
    bookingsMonth: 0,
    wallet: { totalIn: 0, totalOut: 0, available: 0 },
    reviews: { average: 0, total: 0, week: 0 }
  });

  // Data states (Only for components that haven't been refactored yet)
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState({ users: [], workers: [] });
  const [helpTickets, setHelpTickets] = useState({ users: [], workers: [] });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Form states (Category/SubCategory)
  const [catForm, setCatForm] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [subForm, setSubForm] = useState({ name: "", parentId: "" });
  const [editingSub, setEditingSub] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/admin/stats`, config);
      setStats(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch only what's needed for the initial view or global context
      // We can lazy load others when tabs are switched
      const [catRes, cityRes] = await Promise.all([
        axios.get(`${API_URL}/categories`, config),
        axios.get(`${API_URL}/cities`, config),
      ]);

      setCategories(catRes.data);
      const allSubCategories = catRes.data.flatMap(cat =>
        cat.subCategories.map(sub => ({ ...sub, parentId: cat._id, parentName: cat.name }))
      );
      setSubCategories(allSubCategories);
      setCities(cityRes.data);

      // Update stats with client-side counts for these
      setStats(prev => ({
        ...prev,
        activeServices: catRes.data.length,
        availableCities: cityRes.data.length
      }));

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch initial dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchInitialData();
  }, []);

  // Category CRUD
  const handleAddCategory = async (categoryImage) => {
    if (!catForm.trim()) return alert("Category name cannot be empty.");
    const formData = new FormData();
    formData.append('name', catForm);
    if (categoryImage) formData.append('image', categoryImage);
    try {
      await axios.post(`${API_URL}/categories`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCatForm("");
      fetchInitialData(); // Refresh categories
    } catch (err) {
      alert("Failed to add category.");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCat(category);
    setCatForm(category.name);
  };

  const handleSaveCategory = async (categoryId, categoryImage) => {
    if (!catForm.trim()) return;
    const formData = new FormData();
    formData.append('name', catForm);
    if (categoryImage) formData.append('image', categoryImage);
    try {
      await axios.put(`${API_URL}/categories/${categoryId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditingCat(null);
      setCatForm("");
      fetchInitialData();
    } catch (err) {
      alert("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure? This will delete all sub-categories within it.")) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`);
        fetchInitialData();
      } catch (err) {
        alert("Failed to delete category.");
      }
    }
  };

  // Sub-Category CRUD
  const handleAddSub = async (subCategoryImage) => {
    if (!subForm.name.trim() || !subForm.parentId) return alert("All fields required.");
    const formData = new FormData();
    formData.append('name', subForm.name);
    if (subCategoryImage) formData.append('image', subCategoryImage);
    try {
      await axios.post(`${API_URL}/categories/${subForm.parentId}/subcategories`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubForm({ name: "", parentId: "" });
      fetchInitialData();
    } catch (err) {
      alert("Failed to add sub-category.");
    }
  };

  const handleEditSub = (sub) => {
    setEditingSub(sub);
    setSubForm({ name: sub.name, parentId: sub.parentId });
  };

  const handleSaveSub = async (subCategoryImage) => {
    if (!subForm.name.trim() || !editingSub) return;
    const formData = new FormData();
    formData.append('name', subForm.name);
    if (subCategoryImage) formData.append('image', subCategoryImage);
    try {
      await axios.put(`${API_URL}/categories/${editingSub.parentId}/subcategories/${editingSub._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditingSub(null);
      setSubForm({ name: "", parentId: "" });
      fetchInitialData();
    } catch (err) {
      alert("Failed to save sub-category.");
    }
  };

  const handleDeleteSub = async (subId, parentId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${API_URL}/categories/${parentId}/subcategories/${subId}`);
        fetchInitialData();
      } catch (err) {
        alert("Failed to delete sub-category.");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active={active}
        setActive={setActive}
      />

      <main className="flex-1">
        <Topbar onToggle={() => setSidebarOpen(s => !s)} admin={admin} />

        <div className="p-6">
          {active === "dashboard" && <DashboardContent totals={stats} setActive={setActive} />}

          {/* App Management */}
          {active === "user-app" && (
            <UserAppDashboard
              catForm={catForm}
              setCatForm={setCatForm}
              editingCat={editingCat}
              setEditingCat={setEditingCat}
              handleSaveCategory={handleSaveCategory}
              handleAddCategory={handleAddCategory}
              loading={loading}
              error={error}
              categories={categories}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              subForm={subForm}
              setSubForm={setSubForm}
              editingSub={editingSub}
              setEditingSub={setEditingSub}
              handleSaveSub={handleSaveSub}
              handleAddSub={handleAddSub}
              subCategories={subCategories}
              handleEditSub={handleEditSub}
              handleDeleteSub={handleDeleteSub}
            />
          )}
          {active === "worker-app" && (
            <WorkerAppDashboard
              categories={categories}
              subCategories={subCategories}
            />
          )}

          {/* Operations */}
          {active === "bookings" && <BookingManagement bookings={bookings} />}
          {active === "users" && <UserManagement />}
          {active === "workers" && (
            <WorkerManagement
              categories={categories}
              subCategories={subCategories}
            />
          )}
          {active === "categories" && (
            <CategoryManagement
              catForm={catForm}
              setCatForm={setCatForm}
              editingCat={editingCat}
              setEditingCat={setEditingCat}
              handleSaveCategory={handleSaveCategory}
              handleAddCategory={handleAddCategory}
              loading={loading}
              error={error}
              categories={categories}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              subForm={subForm}
              setSubForm={setSubForm}
              editingSub={editingSub}
              setEditingSub={setEditingSub}
              handleSaveSub={handleSaveSub}
              handleAddSub={handleAddSub}
              subCategories={subCategories}
              handleEditSub={handleEditSub}
              handleDeleteSub={handleDeleteSub}
            />
          )}
          {active === "add-city" && <AddCityManagement categories={categories} subCategories={subCategories} />}
          {active === "banners" && <BannerManagement />}
          {active === "coupons" && <CouponManagement />}
          {active === "coins" && <CoinsManagement />}
          {active === "fees" && <FeeManagement />}
          {active === "withdrawals" && <WithdrawalManagement />}

          {/* Support */}
          {active === "help" && <HelpManagement helpTickets={helpTickets} />}
          {/* Other components would be rendered here based on 'active' state */}
        </div>
      </main>
    </div>
  );
}
