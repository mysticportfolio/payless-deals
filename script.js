import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// PASTE YOUR REAL CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyBWT0Q1_Zp-GNxXw03oOrLAYAQiXEWgjN4",
  authDomain: "payless-deals.firebaseapp.com",
  projectId: "payless-deals",
  storageBucket: "payless-deals.firebasestorage.app",
  messagingSenderId: "707548051602",
  appId: "1:707548051602:web:43aa333af8c2c3c9d14e4b"
};

const ADMIN_EMAIL = "Emmanuelcarlos680@gmail.com";
const YOUR_PHONE = "233538858862"; // for WhatsApp tracking

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const vehiclesList = document.getElementById('vehicles-list');
const saveVehicleBtn = document.getElementById('save-vehicle-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const vehicleForm = document.getElementById('vehicle-form');
const searchBtn = document.getElementById('search-btn');

// Auth
signupBtn.onclick = () => createUserWithEmailAndPassword(auth, email.value, password.value).catch(e => alert(e.message));
loginBtn.onclick = () => signInWithEmailAndPassword(auth, email.value, password.value).catch(e => alert(e.message));
logoutBtn.onclick = () => signOut(auth);
toggleFormBtn.onclick = () => vehicleForm.classList.toggle('hidden');

onAuthStateChanged(auth, user => {
  if (user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userEmailSpan.textContent = user.email;
    loadVehicles();
  } else {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }
});

// Save Vehicle with multiple photos + featured
saveVehicleBtn.onclick = async () => {
  const id = document.getElementById('vehicle-id').value;
  const files = document.getElementById('image').files;
  const featured = document.getElementById('featured').checked;
  
  let imageUrls = [];
  if (files.length) {
    for (let file of files) {
      const storageRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrls.push(await getDownloadURL(storageRef));
    }
  }

  const data = {
    make: make.value, model: model.value, year: Number(year.value), 
    price: Number(price.value), mileage: Number(mileage.value), 
    location: location.value, description: description.value,
    featured: featured, clicks: 0,
    userId: auth.currentUser.uid,
    createdAt: new Date()
  };

  if (imageUrls.length) data.imageUrls = imageUrls;
  if (id &&!imageUrls.length) delete data.imageUrls; // keep old images

  if (id) await updateDoc(doc(db, 'vehicles', id), data);
  else await addDoc(collection(db, 'vehicles'), data);
  
  resetForm();
};

cancelEditBtn.onclick = resetForm;

function resetForm() {
  vehicleForm.reset();
  document.getElementById('vehicle-id').value = '';
  document.getElementById('form-title').textContent = 'Add Vehicle';
  vehicleForm.classList.add('hidden');
}

// Search + Load Vehicles
searchBtn.onclick = loadVehicles;
function loadVehicles() {
  let q = query(collection(db, 'vehicles'), orderBy('featured', 'desc'), orderBy('createdAt', 'desc'));
  
  const makeQuery = document.getElementById('search-make').value.toLowerCase();
  const yearQuery = document.getElementById('filter-year').value;
  const priceQuery = document.getElementById('filter-price').value;

  onSnapshot(q, snapshot => {
    vehiclesList.innerHTML = '';
    snapshot.forEach(docSnap => {
      const v = docSnap.data();
      
      // Client-side filtering for simplicity
      if (makeQuery &&!v.make.toLowerCase().includes(makeQuery)) return;
      if (yearQuery && v.year < Number(yearQuery)) return;
      if (priceQuery && v.price > Number(priceQuery)) return;

      const firstImage = v.imageUrls? v.imageUrls[0] : 'https://via.placeholder.com/300x200?text=No+Image';
      const card = document.createElement('div');
      card.className = 'vehicle-card';
      card.innerHTML = `
        ${v.featured? '<div class="featured-badge">FEATURED</div>' : ''}
        <img src="${firstImage}" alt="${v.make} ${v.model}">
        <div class="vehicle-info">
          <h3>${v.year} ${v.make} ${v.model}</h3>
          <div class="price">GHS ${v.price.toLocaleString()}</div>
          <p><strong>Mileage:</strong> ${v.mileage? v.mileage.toLocaleString() + ' km' : 'N/A'}</p>
          <p><strong>Location:</strong> ${v.location || 'Accra'}</p>
          <p>${v.description || ''}</p>
          <button class="call-btn" onclick="trackClick('${docSnap.id}', '${v.userId}')">Contact Seller on WhatsApp</button>
          ${auth.currentUser && auth.currentUser.uid === v.userId? `
            <button onclick="editVehicle('${docSnap.id}', ${JSON.stringify(v).replace(/"/g, '&quot;')})">Edit</button>
            <button onclick="deleteVehicle('${docSnap.id}')">Delete</button>
          ` : ''}
        </div>
      `;
      vehiclesList.appendChild(card);
    });
  });
}

// Track clicks = money. This logs when buyers click WhatsApp
window.trackClick = async (vehicleId, sellerId) => {
  await updateDoc(doc(db, 'vehicles', vehicleId), { clicks: increment(1) });
  window.open(`https://wa.me/${YOUR_PHONE}?text=I'm interested in your car on Payless Auto Ghana: ${window.location.href}`, '_blank');
};

window.editVehicle = (id, v) => {
  document.getElementById('vehicle-id').value = id;
  document.getElementById('make').value = v.make;
  document.getElementById('model').value = v.model;
  document.getElementById('year').value = v.year;
  document.getElementById('price').value = v.price;
  document.getElementById('mileage').value = v.mileage;
  document.getElementById('location').value = v.location;
  document.getElementById('description').value = v.description;
  document.getElementById('featured').checked = v.featured || false;
  document.getElementById('form-title').textContent = 'Edit Vehicle';
  vehicleForm.classList.remove('hidden');
  window.scrollTo(0, 0);
};

window.deleteVehicle = async (id) => {
  if (confirm('Delete this vehicle?')) await deleteDoc(doc(db, 'vehicles', id));
};
