// client/src/App.js
import React, { useState, useEffect } from 'react';
import './index.css';
import axios from 'axios';
import ChatBot from './components/ChatBot';
// Configure axios baseURL for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // In production, we'll use relative paths since frontend and backend are served from same domain
  : 'http://localhost:5000'; // Point to your Express server port

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formId, setFormId] = useState(null);
  const [matchingVendors, setMatchingVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [showVendorRecommendations, setShowVendorRecommendations] = useState(false);
  
  const [items, setItems] = useState([{
    name: '',
    description: '',
    quantity: '',
    uom: '',
    benchmarkPrice: ''
  }]);
  
  const [formData, setFormData] = useState({
    businessUnit: '',
    region: '',
    endUser: '',
    priority: '',
    industry: '',
    category: '',
    costCenter: '',
    projectName: '',
    projectBudget: '',
    currency: '',
    dueDate: '',
    projectDescription: '',
    recommendedVendor: ''
  });

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/ai-generate', { prompt: aiPrompt });
      const aiData = response.data.data;
      
      setFormData({
        businessUnit: aiData.businessUnit || '',
        region: aiData.region || '',
        endUser: aiData.endUser || '',
        priority: aiData.priority || '',
        industry: aiData.industry || '',
        category: aiData.category || '',
        costCenter: aiData.costCenter || '',
        projectName: aiData.projectName || '',
        projectBudget: aiData.projectBudget || '',
        currency: aiData.currency || '',
        dueDate: aiData.dueDate || '',
        projectDescription: aiData.projectDescription || '',
        recommendedVendor: ''
      });
      
      if (aiData.items && aiData.items.length > 0) {
        setItems(aiData.items);
      }
    } catch (error) {
      console.error('Error generating AI data:', error);
      setError('Failed to generate data with AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      quantity: '',
      uom: '',
      benchmarkPrice: ''
    }]);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const resetForm = () => {
    setFormData({
      businessUnit: '',
      region: '',
      endUser: '',
      priority: '',
      industry: '',
      category: '',
      costCenter: '',
      projectName: '',
      projectBudget: '',
      currency: '',
      dueDate: '',
      projectDescription: '',
      recommendedVendor: ''
    });
    
    setItems([{
      name: '',
      description: '',
      quantity: '',
      uom: '',
      benchmarkPrice: ''
    }]);
    
    setAiPrompt('');
    setMatchingVendors([]);
    setSelectedVendor('');
    setShowVendorRecommendations(false);
  };

  // Effect to fetch vendors when category or region changes
  useEffect(() => {
    // Only fetch if both category and region have values
    if (formData.category && formData.region) {
      fetchMatchingVendors(formData.category, formData.region);
    }
  }, [formData.category, formData.region]);

  const fetchMatchingVendors = async (category, city) => {
    try {
      const response = await axios.get(`/api/vendors?category=${category}&city=${city}`);
      if (response.data.success && response.data.data) {
        setMatchingVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching matching vendors:', error);
    }
  };

  const handleSelectVendor = (vendorEmail) => {
    setSelectedVendor(vendorEmail);
    
    // Find the vendor info by email
    const vendor = matchingVendors.find(v => v.Email === vendorEmail);
    
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        recommendedVendor: `${vendor['Vendor Name']} (${vendor.Email})`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitSuccess(false);
    
    try {
      const response = await axios.post('/api/submit-form', { ...formData, items });
      setSubmitSuccess(true);
      setFormId(response.data.formId);
      
      // Show vendor recommendations if available
      if (response.data.matchingVendors && response.data.matchingVendors.length > 0) {
        setMatchingVendors(response.data.matchingVendors);
        setShowVendorRecommendations(true);
      }
      
      // Don't reset form immediately - let the user see recommendations
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Project Intake Form</h1>
      </header>
      
      {/* Success message */}
      {submitSuccess && (
        <div className="success-message">
          <p>Form submitted successfully! Form ID: {formId}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* Vendor Recommendations Dialog */}
      {showVendorRecommendations && matchingVendors.length > 0 && (
        <div className="vendor-recommendations-overlay">
          <div className="vendor-recommendations-dialog">
            <h3>Recommended Vendors</h3>
            <p>Based on your project category and location, we found these matching vendors:</p>
            
            <div className="vendor-list">
              {matchingVendors.map((vendor, index) => (
                <div 
                  key={index} 
                  className={`vendor-item ${selectedVendor === vendor.Email ? 'selected' : ''}`}
                  onClick={() => handleSelectVendor(vendor.Email)}
                >
                  <h4>{vendor['Vendor Name']}</h4>
                  <div className="vendor-details">
                    <p><strong>Location:</strong> {vendor.City}, {vendor.State}</p>
                    <p><strong>Category:</strong> {vendor.Category}</p>
                    <p><strong>Sector:</strong> {vendor.Sector}</p>
                    <p><strong>Email:</strong> {vendor.Email}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="vendor-actions">
              <button 
                onClick={() => {
                  setShowVendorRecommendations(false);
                  // Reset form after 3 seconds of showing success message
                  setTimeout(() => {
                    resetForm();
                    setSubmitSuccess(false);
                    setFormId(null);
                  }, 3000);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="form-container">
        <div className="ai-prompt-section">
          <h2>AI Assistant</h2>
          <div className="ai-input-container">
            <input
              type="text"
              placeholder="Describe your project briefly and I'll fill the form..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="ai-input"
            />
            <button 
              onClick={handleAIGenerate} 
              disabled={loading}
              className="ai-button"
            >
              {loading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Business Information</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label>Business Unit *</label>
                <select 
                  name="businessUnit" 
                  value={formData.businessUnit} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Business Unit</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Region</label>
                <input 
                  type="text" 
                  name="region" 
                  placeholder="Add Region" 
                  value={formData.region}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>End User</label>
                <input 
                  type="text" 
                  name="endUser" 
                  placeholder="Select End User"
                  value={formData.endUser}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Priority</label>
                <select 
                  name="priority" 
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Industry</label>
                <select 
                  name="industry" 
                  value={formData.industry}
                  onChange={handleInputChange}
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Category</label>
                <select 
                  name="category" 
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Medtech">Medtech</option>
                  <option value="Renewables">Renewables</option>
                  <option value="Biotech">Biotech</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Incubator">Incubator</option>
                  <option value="Assistive">Assistive</option>
                  <option value="Robotics">Robotics</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Cost Center</label>
                <input 
                  type="text" 
                  name="costCenter" 
                  placeholder="Enter Cost Center"
                  value={formData.costCenter}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Project Details</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label>Project Name *</label>
                <input 
                  type="text" 
                  name="projectName" 
                  placeholder="Enter Project Name"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Project Budget (Estimated) *</label>
                <input 
                  type="number" 
                  name="projectBudget" 
                  placeholder="Add Budget"
                  value={formData.projectBudget}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Currency *</label>
                <select 
                  name="currency" 
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Project Currency</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Due Date *</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field full-width">
                <label>Project Description</label>
                <textarea 
                  name="projectDescription" 
                  placeholder="Write about this new project..."
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h2>Item Details</h2>
              <div className="action-buttons">
                <button type="button" className="button-export">Export</button>
                <button type="button" className="button-import">Import Items</button>
              </div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="item-container">
                <div className="form-row">
                  <div className="form-field">
                    <label>Item Name *</label>
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Item Description</label>
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label>Quantity</label>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>UOM</label>
                    <select 
                      value={item.uom}
                      onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                    >
                      <option value="">Select UOM</option>
                      <option value="Each">Each</option>
                      <option value="Box">Box</option>
                      <option value="Kg">Kg</option>
                      <option value="Liter">Liter</option>
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <label>Benchmark Price</label>
                    <input 
                      type="number" 
                      value={item.benchmarkPrice}
                      onChange={(e) => handleItemChange(index, 'benchmarkPrice', e.target.value)}
                      placeholder="Enter benchmark price"
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    className="remove-item-btn"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            <button type="button" className="add-item-btn" onClick={addItem}>
              + Add Item
            </button>
          </div>
          
          <div className="form-section">
            <div className="form-row">
              <div className="form-field full-width">
                <label>Supplier Recommendation</label>
                <input 
                  type="text" 
                  name="recommendedVendor"
                  placeholder="Enter supplier recommendations" 
                  value={formData.recommendedVendor}
                  onChange={handleInputChange}
                />
                {matchingVendors.length > 0 && !showVendorRecommendations && (
                  <div className="vendor-hint">
                    <button 
                      type="button" 
                      className="show-vendors-btn"
                      onClick={() => setShowVendorRecommendations(true)}
                    >
                      Show {matchingVendors.length} matching vendors from our database
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-field full-width file-upload">
              <label>Attach Sample Requirement (optional)</label>
              <div className="file-input-container">
                <button type="button" className="file-select-btn">Choose File: No file chosen</button>
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
      <ChatBot />
    </div>
  );
}

export default App;