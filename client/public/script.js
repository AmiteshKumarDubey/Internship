document.addEventListener('DOMContentLoaded', function() {
  // ========== DOM Elements ==========
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const loadingDiv = document.getElementById('loading');
  const noResultsDiv = document.getElementById('noResults');
  const employeeResults = document.getElementById('employeeResults');
  const addNewBtn = document.getElementById('addNewBtn');
  const addEmployeeForm = document.getElementById('addEmployeeForm');
  const dynamicFields = document.getElementById('dynamicFields');
  const searchTypeRadios = document.querySelectorAll('input[name="searchType"]');

  // ========== Initialize ==========
  let currentSearchType = 'id'; // Default search type
  const API_BASE_URL = 'http://localhost:3000/api';
  
  setupDarkMode();
  setupSearchSuggestions();
  setupFieldButtons();

  // ========== Event Listeners ==========
  searchBtn.addEventListener('click', searchEmployees);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchEmployees();
  });
  
  searchTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      currentSearchType = this.value;
      searchInput.placeholder = currentSearchType === 'id' 
        ? 'Enter employee ID...' 
        : 'Enter employee name...';
    });
  });

  addNewBtn.addEventListener('click', toggleAddForm);
  document.getElementById('submitAdd').addEventListener('click', submitNewEmployee);
  document.getElementById('cancelAdd').addEventListener('click', toggleAddForm);

  // ========== Core Functions ==========

  // Search employees
  async function searchEmployees() {
  const query = searchInput.value.trim();
  if (!query) {
    showNoResults("Please enter a search term");
    return;
  }

  showLoading(true);
  clearResults();

  try {
    let url, response;
    
    if (currentSearchType === 'id') {
      if (!/^[0-9a-fA-F]{24}$/.test(query)) {
        throw new Error('Please enter a valid 24-character employee ID');
      }
      url = `${API_BASE_URL}/employees/${query}`;
      response = await fetchWithTimeout(url, {}, 5000);
      
      // Handle single employee response
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Employee not found');
      }
      
      // Ensure the data has _id field
      if (!result.data._id) {
        result.data._id = query; // Fallback to the query ID
      }
      
      displayEmployees([result.data]);
      
    } else {
      url = `${API_BASE_URL}/employees?search=${encodeURIComponent(query)}`;
      response = await fetchWithTimeout(url, {}, 5000);
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'No matching employees found');
      }
      
      // Ensure each employee has _id
      const employees = result.data.map(emp => ({
        ...emp,
        _id: emp._id || emp.id // Fallback to id if _id doesn't exist
      }));
      
      displayEmployees(employees);
    }
    
  } catch (error) {
    console.error("Search error:", error);
    showNoResults(error.message);
  } finally {
    showLoading(false);
  }
}
  // Display employees in the UI
  function displayEmployees(employees) {
  if (!employees || employees.length === 0) {
    showNoResults("No employees found");
    return;
  }

  employeeResults.innerHTML = '';

  employees.forEach(employee => {
    // Safely get the ID - try both _id and id properties
    const employeeId = employee._id || employee.id;
    console.log("🧠 Employee ID is:", employeeId); // Debug log

    if (!employeeId) {
      console.error("Invalid employee data:", employee);
      return; // Skip this employee if no ID found
    }

    const card = document.createElement('div');
    card.className = 'employee-card';
    card.id = `employee-${employeeId}`;

    const initials = getInitials(employee.name);
    const detailsHtml = renderEmployeeDetails(employee);

    card.innerHTML = `
      <div class="employee-header">
        <div class="employee-avatar">${initials}</div>
        <h3>${employee.name || 'Unnamed Employee'}</h3>
        <div class="employee-actions">
          <button class="btn btn-icon edit-btn" title="Edit">✏️</button>
          <button class="btn btn-icon add-detail-btn" title="Add Detail">➕</button>
        </div>
      </div>
      <div class="employee-details" id="details-${employeeId}">
        ${detailsHtml}
      </div>
    `;

    employeeResults.appendChild(card);
    attachCardEventListeners(card, employeeId);
  });
}

  // Render employee details
  function renderEmployeeDetails(employee) {
    let html = '';
    const excludedFields = ['_id', '__v', 'createdAt', 'updatedAt'];
    
    // Standard fields
    for (const [key, value] of Object.entries(employee)) {
      if (excludedFields.includes(key)) continue;
      
      if (value && typeof value === 'object') {
        // Handle nested objects (like additionalDetails)
        for (const [subKey, subValue] of Object.entries(value)) {
          html += createDetailItem(`${key}.${subKey}`, subValue);
        }
      } else {
        html += createDetailItem(key, value);
      }
    }
    
    return html;
  }

  function createDetailItem(key, value) {
    return `
      <div class="detail-item">
        <label>${formatKey(key)}</label>
        <div class="detail-value" data-field="${key}" contenteditable="false">
          ${value || 'N/A'}
        </div>
      </div>
    `;
  }

  // ========== Employee Editing ==========
  function toggleEditMode(employeeId) {
    const detailsContainer = document.getElementById(`details-${employeeId}`);
    const isEditing = detailsContainer.classList.contains('editing');
    
    if (isEditing) {
      // Save changes
      const updates = {};
      detailsContainer.querySelectorAll('.detail-value').forEach(el => {
        const field = el.dataset.field;
        updates[field] = el.textContent;
      });
      
      updateEmployee(employeeId, updates);
      detailsContainer.classList.remove('editing');
    } else {
      // Enable editing
      detailsContainer.classList.add('editing');
      detailsContainer.querySelectorAll('.detail-value').forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });
    }
  }

  async function updateEmployee(employeeId, updates) {
  const body = {};
  for (const [k, value] of Object.entries(updates)) {
    const cleanKey = k.replace('additionalDetails.', '');
    body[cleanKey] = value;
  }

  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'Update failed');
  return result.data;
}


  // ========== Adding New Details ==========
  function showAddDetailForm(employeeId) {
  console.log("👉 Validating employeeId:", employeeId);
  
  // Validate employee ID
  if (!employeeId || typeof employeeId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(employeeId)) {
    console.error("Invalid employee ID format:", employeeId);
    alert('Please select a valid employee first');
    return;
  }

  const detailsContainer = document.getElementById(`details-${employeeId}`);
  if (!detailsContainer) {
    console.error("Details container not found for ID:", employeeId);
    return;
  }

  // Remove existing form if present
  const existingForm = detailsContainer.querySelector('.add-detail-form');
  if (existingForm) {
    existingForm.remove();
    return;
  }

  // Create form HTML
  const formHTML = `
    <div class="add-detail-form">
      <div class="field-group">
        <input type="text" placeholder="Field name" class="new-field-name" required>
        <span>:</span>
        <input type="text" placeholder="Value" class="new-field-value" required>
        <button type="button" class="btn btn-primary save-detail-btn">Save</button>
        <button type="button" class="btn btn-secondary cancel-detail-btn">Cancel</button>
      </div>
    </div>
  `;

  // Insert form
  detailsContainer.insertAdjacentHTML('beforeend', formHTML);

  // Get references to buttons
  const saveBtn = detailsContainer.querySelector('.save-detail-btn');
  const cancelBtn = detailsContainer.querySelector('.cancel-detail-btn');

  // Add the improved save button handler HERE:
  saveBtn.addEventListener('click', async function() {
  // Store references to elements before any async operations
  const formToRemove = detailsContainer.querySelector('.add-detail-form');
  const saveBtn = this;
  
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const fieldName = detailsContainer.querySelector('.new-field-name').value.trim();
    const fieldValue = detailsContainer.querySelector('.new-field-value').value.trim();

    if (!fieldName || !fieldValue) {
      alert('Both fields are required!');
      return;
    }

    const updatedEmployee = await addEmployeeDetail(employeeId, fieldName, fieldValue);
    
    // Update UI
    const card = document.getElementById(`employee-${employeeId}`);
    if (card) {
      card.querySelector('.employee-details').innerHTML = 
        renderEmployeeDetails(updatedEmployee);
    }

    // Safely remove form if it exists
    if (formToRemove && formToRemove.parentNode) {
      formToRemove.remove();
    }
  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to save: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
});
}
async function addEmployeeDetail(id, key, value) {
  try {
    // Ensure key is properly formatted for nested fields
    const formattedKey = key.startsWith('additionalDetails.') 
      ? key 
      : `additionalDetails.${key}`;

    const response = await fetch(`${API_BASE_URL}/employees/${id}/details`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        key: formattedKey, 
        value 
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add detail');
    }

    console.log('Detail added successfully:', result.data);
    
    // Force a complete refresh of the employee data
    const freshResponse = await fetch(`${API_BASE_URL}/employees/${id}`);
    const freshData = await freshResponse.json();
    
    return freshData.data; // Return the freshly fetched data
  } catch (error) {
    console.error('Error adding detail:', error);
    throw error;
  }
}
  // ========== Add New Employee ==========
  function toggleAddForm() {
    const isHidden = addEmployeeForm.style.display === 'none';
    addEmployeeForm.style.display = isHidden ? 'block' : 'none';
    addNewBtn.textContent = isHidden ? '× Cancel' : '+ Add New Employee';
    
    if (isHidden) {
      resetAddForm();
    } else {
      searchInput.value = '';
      clearResults();
    }
  }

  function resetAddForm() {
    dynamicFields.innerHTML = `
      <div class="field-group">
        <input type="text" class="field-name" value="name" placeholder="Field name" required>
        <span>:</span>
        <input type="text" class="field-value" placeholder="Value" required>
        <button type="button" class="btn btn-icon remove-field-btn">−</button>
        <button type="button" class="btn btn-icon add-field-btn">+</button>
      </div>
      <div class="field-group">
        <input type="text" class="field-name" value="department" placeholder="Field name" required>
        <span>:</span>
        <input type="text" class="field-value" placeholder="Value" required>
        <button type="button" class="btn btn-icon remove-field-btn">−</button>
        <button type="button" class="btn btn-icon add-field-btn">+</button>
      </div>
    `;
    
    setupFieldButtons();
  }

  function setupFieldButtons() {
    // Add field button
    document.querySelectorAll('.add-field-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'field-group';
        fieldGroup.innerHTML = `
          <input type="text" class="field-name" placeholder="Field name" required>
          <span>:</span>
          <input type="text" class="field-value" placeholder="Value" required>
          <button type="button" class="btn btn-icon remove-field-btn">−</button>
          <button type="button" class="btn btn-icon add-field-btn">+</button>
        `;
        this.parentNode.parentNode.insertBefore(fieldGroup, this.parentNode.nextSibling);
        setupFieldButtons();
      });
    });
    
    // Remove field button
    document.querySelectorAll('.remove-field-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (document.querySelectorAll('.field-group').length > 1) {
          this.parentNode.remove();
        }
      });
    });
  }

  async function submitNewEmployee(e) {
    e.preventDefault();
    
    const employeeData = {};
    let hasErrors = false;
    
    document.querySelectorAll('.field-group').forEach(group => {
      const fieldName = group.querySelector('.field-name').value.trim();
      const fieldValue = group.querySelector('.field-value').value.trim();
      
      if (!fieldName || !fieldValue) {
        hasErrors = true;
        group.classList.add('error');
      } else {
        employeeData[fieldName] = fieldValue;
      }
    });
    
    if (hasErrors || !employeeData.name) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      
      const result = await response.json();
      
      if (!result.success) throw new Error(result.message || 'Failed to add employee');
      
      toggleAddForm();
      searchInput.value = employeeData.name;
      document.querySelector('input[name="searchType"][value="name"]').checked = true;
      searchEmployees();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  }

  // ========== Helper Functions ==========
  function attachCardEventListeners(card, employeeId) {
  card.querySelector('.edit-btn').addEventListener('click', () => toggleEditMode(employeeId));
  card.querySelector('.add-detail-btn').addEventListener('click', () => showAddDetailForm(employeeId));
}


  function formatKey(key) {
    return key.split('.')
      .map(part => part.replace(/([A-Z])/g, ' $1'))
      .join(' > ')
      .replace(/^./, str => str.toUpperCase())
      .replace('Number', 'No.');
  }

  function getInitials(name = '') {
    return name.split(' ')
      .filter(Boolean)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  function showLoading(show) {
    loadingDiv.style.display = show ? 'flex' : 'none';
  }

  function showNoResults(message) {
    noResultsDiv.querySelector('p').textContent = message;
    noResultsDiv.style.display = 'flex';
  }

  function clearResults() {
    employeeResults.innerHTML = '';
    noResultsDiv.style.display = 'none';
  }

  async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    
    clearTimeout(id);
    return response;
  }

  // ========== UI Enhancements ==========
  function setupDarkMode() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = localStorage.getItem('darkMode') === 'true' 
      ? '☀️ Light Mode' 
      : '🌙 Dark Mode';
    
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
      darkModeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? '☀️ Light Mode' 
        : '🌙 Dark Mode';
    });

    document.body.appendChild(darkModeToggle);
  }
  function updateEmployeeCard(employeeId, updatedData) {
  const card = document.getElementById(`employee-${employeeId}`);
  if (card) {
    card.querySelector('.employee-details').innerHTML = 
      renderEmployeeDetails(updatedData);
  }
}

  function setupSearchSuggestions() {
    const suggestions = document.createElement('div');
    suggestions.id = 'searchSuggestions';
    searchInput.parentNode.appendChild(suggestions);

    let debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      suggestions.style.display = 'none';
      
      const query = this.value.trim();
      if (query.length < 2) return;

      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/employees?name=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          if (data.data?.length > 0) {
            suggestions.innerHTML = data.data
              .slice(0, 5)
              .map(emp => `<div class="suggestion">${emp.name}</div>`)
              .join('');
            suggestions.style.display = 'block';
          }
        } catch (error) {
          console.error('Suggestion error:', error);
        }
      }, 300);
    });

    suggestions.addEventListener('click', function(e) {
      if (e.target.classList.contains('suggestion')) {
        searchInput.value = e.target.textContent;
        this.style.display = 'none';
        searchEmployees();
      }
    });

    document.addEventListener('click', function(e) {
      if (e.target !== searchInput) {
        suggestions.style.display = 'none';
      }
    });
  }

function attachCardEventListeners(card, employeeId) {
  if (!employeeId || employeeId.length !== 24) {
    console.error("Invalid employeeId in attachCardEventListeners:", employeeId);
    return;
  }

  const editBtn = card.querySelector('.edit-btn');
  const addBtn = card.querySelector('.add-detail-btn');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      console.log("Edit clicked for:", employeeId);
      toggleEditMode(employeeId);
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      console.log("Add detail clicked for:", employeeId);
      showAddDetailForm(employeeId);
    });
  }
}
// At the very end of script.js
// Add this with your other helper functions
function updateEmployeeDetails(employeeId, updatedData) {
  const detailsContainer = document.getElementById(`details-${employeeId}`);
  if (!detailsContainer) {
    console.error(`Details container not found for employee ${employeeId}`);
    return;
  }

  try {
    const detailsHtml = renderEmployeeDetails(updatedData);
    detailsContainer.innerHTML = detailsHtml;
    // Re-attach event listeners if needed
    const card = document.getElementById(`employee-${employeeId}`);
    if (card) {
      attachCardEventListeners(card, employeeId);
    }
  } catch (error) {
    console.error('Error updating employee details:', error);
  }
}
});