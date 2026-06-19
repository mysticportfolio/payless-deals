// Tab switching logic
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    sections.forEach(section => section.style.display = 'none');
    
    const targetSection = button.getAttribute('data-section');
    document.getElementById(targetSection).style.display = 'block';
  });
});

// Show dashboard by default
document.getElementById('dashboard').style.display = 'block';

// VEHICLE LOGIC STARTS HERE
const addVehicleBtn = document.getElementById('add-vehicle-btn');
const vehicleForm = document.getElementById('vehicle-form');
const vehicleList = document.getElementById('vehicle-list');
const cancelBtn = document.getElementById('cancel-vehicle');

// Load vehicles from localStorage on page load
function loadVehicles() {
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  vehicleList.innerHTML = '';
  
  if (vehicles.length === 0) {
    vehicleList.innerHTML = '<p>No vehicles added yet.</p>';
    return;
  }

  vehicles.forEach((vehicle, index) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
      <p>License: ${vehicle.license || 'N/A'}</p>
      <button onclick="deleteVehicle(${index})" class="delete-btn">Delete</button>
    `;
    vehicleList.appendChild(div);
  });
  
  // Update dashboard count
  document.getElementById('total-vehicles').textContent = vehicles.length;
}

// Show form when clicking Add Vehicle
addVehicleBtn.addEventListener('click', () => {
  vehicleForm.style.display = 'block';
});

// Hide form
cancelBtn.addEventListener('click', () => {
  vehicleForm.style.display = 'none';
});

// Save vehicle on form submit
vehicleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  
  const newVehicle = {
    make: document.getElementById('make').value,
    model: document.getElementById('model').value,
    year: document.getElementById('year').value,
    license: document.getElementById('license').value
  };
  
  vehicles.push(newVehicle);
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  
  vehicleForm.reset();
  vehicleForm.style.display = 'none';
  loadVehicles(); // Refresh the list
});

// Delete vehicle function
function deleteVehicle(index) {
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  vehicles.splice(index, 1);
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  loadVehicles();
}

// Load vehicles when page opens
loadVehicles();
