import React, { useState, useEffect, useCallback } from 'react';
import { doctorService } from '../../services/doctorService';
import DoctorCard from './DoctorCard';
import './FindDoctors.css';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  // Memoize loadDoctors to prevent unnecessary re-renders
  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Auto-refresh when page becomes visible (e.g., switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDoctors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadDoctors]);

  // Optional: Auto-refresh every 30 seconds to catch admin changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadDoctors();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [loadDoctors]);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadDoctors();
      return;
    }

    try {
      setLoading(true);
      let data;
      if (searchType === 'name') {
        data = await doctorService.searchByName(searchTerm);
      } else if (searchType === 'specialty') {
        data = await doctorService.searchBySpecialty(searchTerm);
      } else if (searchType === 'city') {
        data = await doctorService.searchByCity(searchTerm);
      }
      setDoctors(data);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-doctors-container">
      <div className="search-section">
        <h1>Find Your Doctor</h1>
        <p>Search from our network of verified healthcare professionals</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-select"
          >
            <option value="name">Doctor Name</option>
            <option value="specialty">Specialty</option>
            <option value="city">City</option>
          </select>
          
          <input
            type="text"
            placeholder={`Search by doctor ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </form>
      </div>

      <div className="doctors-section">
        {loading ? (
          <div className="loading">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="no-results">No doctors found matching your search.</div>
        ) : (
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors;
