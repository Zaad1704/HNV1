import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const SiteEditorPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // A developer would fetch from the backend API here.
        // For now, we'll use mock data.
        const mockData = {
          heroTitle: "The Future of Property Management is Here",
          heroSubtitle: "A complete SaaS platform for Landlords, Agents, and Tenants."
        };
        setContent(mockData);
        setError('');
      } catch (err) {
        setError('Failed to fetch site content.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    setContent({
      ...content,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        alert('Saving content... (This is a simulation)');
        // A developer would send the updated content to the backend.
        // await apiClient.put('/super-admin/content/landing', content);
        console.log('Saved Content:', content);
        alert('Content saved successfully!');
    } catch (err) {
        alert('Failed to save content.');
        console.error(err);
    }
  };

  if (loading) {
    return <div>Loading Content Editor...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Content Editor (Landing Page)</h1>
      
      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-md space-y-6">
        <div>
          <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Hero Section Title
          </label>
          <input
            type="text"
            id="heroTitle"
            name="heroTitle"
            value={content?.heroTitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
            Hero Section Subtitle
          </label>
          <textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows="3"
            value={content?.heroSubtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteEditorPage;
