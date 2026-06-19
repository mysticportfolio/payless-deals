// Tab switching logic
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    // Add active to clicked button
    button.classList.add('active');
    
    // Hide all sections
    sections.forEach(section => section.style.display = 'none');
    
    // Show the target section
    const targetSection = button.getAttribute('data-section');
    document.getElementById(targetSection).style.display = 'block';
  });
});

// Show dashboard by default on load
document.getElementById('dashboard').style.display = 'block';
