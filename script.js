// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBWTQ6l_Zp-GNiXw93oOrLAYAQjXEWgjW4",
  authDomain: "payless-deals.firebaseapp.com",
  projectId: "payless-deals",
  storageBucket: "payless-deals.firebasestorage.app",
  messagingSenderId: "7077548051682",
  appId: "1:7077548051682:web:43aa332a1f8c2c7c9d14e4b"
};

// SET YOUR EMAIL HERE TO BECOME ADMIN
const ADMIN_EMAIL = "mysticaljhunea11@gmail.com"; // Change this to YOUR email

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    if (user.email === ADMIN_EMAIL) {
      document.getElementById('adminTab').style.display = 'block';
      loadAdminData();
    }
    loadUserVehicles();
    setupNav();
  } else {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('appScreen').style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => document.getElementById('authError').textContent = err.message);
});

document.getElementById('signupBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => document.getElementById('authError').textContent = err.message);
});

document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());

function setupNav() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      sections.forEach(section => section.style.display = 'none');
      document.getElementById(button.dataset.section).style.display = 'block';
    });
  });
}

function loadUserVehicles() {
  db.collection('vehicles').where('userId', '==', currentUser.uid)
    .onSnapshot(snapshot => {
      const vehicleList = document.getElementById('vehicleList');
      vehicleList.innerHTML = '';
      document.getElementById('totalVehicles').textContent = snapshot.size;
      if (snapshot.empty) {
        vehicleList.innerHTML = '<p>No vehicles added yet.</p>';
        return;
      }
      snapshot.forEach(doc => {
        const v = doc.data();
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <h3>${v.vehicleYear} ${v.vehicleMake} ${v.vehicleModel}</h3>
          <p><strong>License:</strong> ${v.vehicleLicense}</p>
          <p><strong>VIN:</strong> ${v.vehicleVIN || 'N/A'}</p>
          <p><strong>Mileage:</strong> ${v.vehicleMileage} miles</p>
          <button onclick="deleteVehicle('${doc.id}')" class="delete-btn">Delete</button>
        `;
        vehicleList.appendChild(div);
      });
    });
}

function loadAdminData() {
  db.collection('vehicles').onSnapshot(snapshot => {
    const allList = document.getElementById('allVehiclesList');
    allList.innerHTML = '';
    document.getElementById('allVehiclesCount').textContent = snapshot.size;
    const userEmails = new Set();
    snapshot.forEach(doc => {
      const v = doc.data();
      userEmails.add(v.userEmail);
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${v.vehicleYear} ${v.vehicleMake} ${v.vehicleModel}</h3>
        <p><strong>Owner:</strong> ${v.userEmail}</p>
        <p><strong>License:</strong> ${v.vehicleLicense}</p>
        <p><strong>VIN:</strong> ${v.vehicleVIN || 'N/A'}</p>
        <p><strong>Mileage:</strong> ${v.vehicleMileage} miles</p>
      `;
      allList.appendChild(div);
    });
    document.getElementById('totalUsers').textContent = userEmails.size;
  });
}

const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleModal = document.getElementById('vehicleModal');
const vehicleForm = document.getElementById('vehicleForm');
const closeBtn = document.querySelector('.close');

addVehicleBtn.addEventListener('click', () => vehicleModal.style.display = 'block');
closeBtn.addEventListener('click', () => {
  vehicleModal.style.display = 'none';
  vehicleForm.reset();
});
window.addEventListener('click', e => {
  if (e.target === vehicleModal) {
    vehicleModal.style.display = 'none';
    vehicleForm.reset();
  }
});

vehicleForm.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('vehicles').add({
    userId: currentUser.uid,
    userEmail: currentUser.email,
    vehicleMake: document.getElementById('vehicleMake').value,
    vehicleModel: document.getElementById('vehicleModel').value,
    vehicleYear: document.getElementById('vehicleYear').value,
    vehicleLicense: document.getElementById('vehicleLicense').value,
    vehicleVIN: document.getElementById('vehicleVIN').value,
    vehicleMileage: document.getElementById('vehicleMileage').value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  vehicleForm.reset();
  vehicleModal.style.display = 'none';
});

function deleteVehicle(id) {
  db.collection('vehicles').doc(id).delete();
}
