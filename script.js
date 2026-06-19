// Tab switching logic
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    sections.forEach(section => section.style.display = 'none');
    
    const targetSection = button.getAttribute('data-section');
    const targetEl = document.getElementById(targetSection);
    if (targetEl) targetEl.style.display = 'block';
  });
});

// Show dashboard by default
const dashboard = document.getElementById('dashboard');
if (dashboard) dashboard.style.display = 'block';

// VEHICLE MODAL LOGIC - matches your HTML IDs
const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleModal = document.getElementById('vehicleModal');
const vehicleForm = document.getElementById('vehicleForm');
const closeBtn = document.querySelector('.close');
const vehicleList = document.getElementById('vehicleList');

function loadVehicles() {
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  
  if (!vehicleList) return;
  vehicleList.innerHTML = '';
  
  if (vehicles.length === 0) {
    vehicleList.innerHTML = '<p>No vehicles added yet.</p>';
    return;
  }

  vehicles.forEach((vehicle, index) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${vehicle.vehicleYear} ${vehicle.vehicleMake} ${vehicle.vehicleModel}</h3>
      <p><strong>License:</strong> ${vehicle.vehicleLicense}</p>
      <p><strong>VIN:</strong> ${vehicle.vehicleVIN || 'N/A'}</p>
      <p><strong>Mileage:</strong> ${vehicle.vehicleMileage} miles</p>
      <button onclick="deleteVehicle(${index})" class="delete-btn">Delete</button>
    `;
    vehicleList.appendChild(div);
  });
  
  // Update dashboard count
  const totalVehiclesEl = document.getElementById('totalVehicles');
  if (totalVehiclesEl) {
    totalVehiclesEl.textContent = vehicles.length;
  }
}

// Show modal
if (addVehicleBtn) {
  addVehicleBtn.addEventListener('click', () => {
    vehicleModal.style.display = 'block';
  });
}

// Close modal
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    vehicleModal.style.display = 'none';
    vehicleForm.reset();
  });
}

// Close modal if clicking outside
window.addEventListener('click', (e) => {
  if (e.target === vehicleModal) {
    vehicleModal.style.display = 'none';
    vehicleForm.reset();
  }
});

// Save vehicle
if (vehicleForm) {
  vehicleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    
    const newVehicle = {
      vehicleMake: document.getElementById('vehicleMake').value,
      vehicleModel: document.getElementById('vehicleModel').value,
      vehicleYear: document.getElementById('vehicleYear').value,
      vehicleLicense: document.getElementById('vehicleLicense').value,
      vehicleVIN: document.getElementById('vehicleVIN').value,
      vehicleMileage: document.getElementById('vehicleMileage').value
    };
    
    vehicles.push(newVehicle);
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    
    vehicleForm.reset();
    vehicleModal.style.display = 'none';
    loadVehicles();
  });
}

// Delete vehicle - must be global
function deleteVehicle(index) {
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  vehicles.splice(index, 1);
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  loadVehicles();
}

// Load vehicles when page opens
loadVehicles();
