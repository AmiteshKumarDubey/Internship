document.getElementById("searchBtn").addEventListener("click", () => {
  const searchInput = document.getElementById("searchInput").value.trim();
  const searchType = document.querySelector("input[name='searchType']:checked").value;

  if (!searchInput) return;

  showLoading();

  let apiUrl = "http://localhost:5000/api/employees";
  if (searchType === "id") {
    fetchEmployeeById(searchInput);
  } else {
    fetchEmployeesByName(searchInput);
  }
});

const loadingDiv = document.getElementById("loading");
const noResultsDiv = document.getElementById("noResults");
const employeeResults = document.getElementById("employeeResults");

// Fetch employee by ID
function fetchEmployeeById(id) {
  fetch(`http://localhost:5000/api/employees/${id}`)
    .then(res => res.json())
    .then(data => {
      hideLoading();
      if (data.success && data.data) {
        displayEmployees([data.data]);
      } else {
        showNoResults();
      }
    })
    .catch(err => {
      console.error("Error fetching by ID:", err);
      hideLoading();
      showNoResults();
    });
}

// Fetch employees by name
function fetchEmployeesByName(name) {
  fetch(`http://localhost:5000/api/employees?name=${encodeURIComponent(name)}`)
    .then(res => res.json())
    .then(data => {
      hideLoading();
      if (data.success && data.data && data.data.length > 0) {
        displayEmployees(data.data);
      } else {
        showNoResults();
      }
    })
    .catch(err => {
      console.error("Error fetching by name:", err);
      hideLoading();
      showNoResults();
    });
}

// Display employees
function displayEmployees(employees) {
  employeeResults.innerHTML = "";
  hideNoResults();

  employees.forEach(emp => {
    const card = document.createElement("div");
    card.className = "employee-card";

    card.innerHTML = `
      <div class="employee-photo">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp["Full Name"] || "E")}&background=3498db&color=fff&size=150" alt="${emp["Full Name"]}">
      </div>
      <div class="employee-details">
        <h2>${emp["Full Name"] || "No Name"}</h2>
        <p><strong>ID:</strong> ${emp.employeeID || "N/A"}</p>
        <p><strong>Job Title:</strong> ${emp["Job Title"] || "N/A"}</p>
        <p><strong>Department:</strong> ${emp.Department || "N/A"}</p>
        <p><strong>Salary:</strong> ${emp["Annual Salary"] || "N/A"}</p>
        <p><strong>Age:</strong> ${emp.Age || "N/A"}</p>
        <p><strong>City:</strong> ${emp.City || "N/A"}</p>
        <p><strong>Status:</strong> ${emp.Attrition === "Yes" ? "Former Employee" : "Current Employee"}</p>
      </div>
    `;
    employeeResults.appendChild(card);
  });
}

// UI helpers
function showLoading() {
  loadingDiv.style.display = "block";
  noResultsDiv.style.display = "none";
  employeeResults.style.display = "none";
}

function hideLoading() {
  loadingDiv.style.display = "none";
  employeeResults.style.display = "block";
}

function showNoResults() {
  noResultsDiv.style.display = "block";
  employeeResults.innerHTML = "";
  employeeResults.style.display = "none";
}

function hideNoResults() {
  noResultsDiv.style.display = "none";
  employeeResults.style.display = "block";
}
