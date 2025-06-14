import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const PlanFormModal = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '0.00',
    duration: 'monthly',
    features: '',
    limits: {
      maxProperties: 1,
      maxTenants: 5,
      maxAgents: 1,
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // When the 'plan' prop changes (i.e., when editing), populate the form
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price ? (plan.price / 100).toFixed(2) : '0.00',
        duration: plan.duration || 'monthly',
        features: plan.features ? plan.features.join(', ') : '',
        limits: {
          maxProperties: plan.limits?.maxProperties || 1,
          maxTenants: plan.limits?.maxTenants || 5,
          maxAgents: plan.limits?.maxAgents || 1,
        }
      });
    } else {
      // Reset form for creating a new plan
      setFormData({
        name: '', price: '0.00', duration: 'monthly', features: '',
        limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 }
      });
    }
  }, [plan, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('limits.')) {
        const limitKey = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            limits: { ...prev.limits, [limitKey]: Number(value) }
        }));
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const submissionData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        features: formData.features
