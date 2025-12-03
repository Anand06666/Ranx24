import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
