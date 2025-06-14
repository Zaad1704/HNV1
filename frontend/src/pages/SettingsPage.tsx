import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore'; // FIX: Changed to a named import with curly braces {}
import apiClient from '../api/client';

const SettingsPage = () => {
  // FIX: Removed the non-existent 'login' property from the store destructuring.
  const { user } = useAuthStore((state) => ({ user: state.user }));

  const [profile, setProfile] = useState({ name: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setProfile({ name: user.name });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.put('/users/updatedetails', { name: profile.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // In a real app, you would refetch user data here to update the UI
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPassword !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoadingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.put('/users/updatepassword', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  const manageBilling = () => {
    alert('Redirecting to secure billing portal...');
  };
  
  const handleDataRequest = () => {
      alert('A request to download your data has been submitted. You will receive an email shortly.');
  }
