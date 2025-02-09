// When the page loads, retrieve the customer ID from the URL and load the customer details.
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('id');

  if (!customerId) {
    alert('No customer ID provided.');
    window.location.href = 'index.html';
    return;
  }

  // Load the customer details from the backend
  getCustomerDetails(customerId);

  // Attach event listeners for the form buttons
  document.getElementById('editForm').addEventListener('submit', updateCustomer);
  document.getElementById('clearBtn').addEventListener('click', clearForm);
  document.getElementById('backBtn').addEventListener('click', function () {
    window.location.href = 'index.html';
  });
});

// Fetch the current customer details and pre-fill the form.
async function getCustomerDetails(customerId) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/customers/${customerId}`);
    const customer = response.data;
    
    // Populate form fields with the returned customer data.
    document.getElementById('username').value = customer.username;
    document.getElementById('name').value = customer.customer_name || '';
    document.getElementById('email').value = customer.email;
    document.getElementById('phone').value = customer.phone;
    document.getElementById('city').value = customer.city;
    document.getElementById('country').value = customer.country;
  } catch (error) {
    console.error('Error fetching customer details:', error.response ? error.response.data : error);
    document.getElementById('error').style.display = 'block';
  }
}

// Handle the form submission to update the customer details.
async function updateCustomer(event) {
  event.preventDefault();

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;

  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('id');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const customer_name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const country = document.getElementById('country').value.trim();

  // Validate input
  const errors = validateCustomerData({ username, password, customer_name, email, phone, city, country }, false);
  if (errors.length > 0) {
    alert(errors.join("\n"));
    saveBtn.disabled = false;
    return;
  }

  try {
    // Get the current customer details
    const response = await axios.get(`http://127.0.0.1:5000/customers/${customerId}`);
    const currentCustomer = response.data;
    
    // Check if the username already exists (excluding the current user)
    const usernameCheck = await axios.get(`http://127.0.0.1:5000/customers/check-username/${username}`);
    
    if (usernameCheck.data.exists && username !== currentCustomer.username) {
      alert("Username already exists. Please choose a different one.");
      saveBtn.disabled = false;
      return;
    }

    document.getElementById('loading').style.display = 'block';

    // Proceed with updating the customer
    await axios.put(`http://127.0.0.1:5000/customers/${customerId}`, {
      username, password, customer_name, email, phone, city, country
    });

    document.getElementById('loading').style.display = 'none';
    alert('Customer updated successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error updating customer:', error.response ? error.response.data : error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    saveBtn.disabled = false;
  }
}

// Utility function to clear the form fields.
function clearForm() {
  document.getElementById('editForm').reset();
}

// ------------------- Validation Function -------------------
function validateCustomerData(data, isNew = true) {
  let errors = [];
  if (!data.username || data.username.length < 3) {
    errors.push("Username must be at least 3 characters long.");
  }
  if (isNew) {
    if (!data.password) {
      errors.push("Password is required.");
    } else if (data.password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }
  } else {
    if (data.password && data.password.length < 6) {
      errors.push("Password must be at least 6 characters long if provided.");
    }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }
  const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
  if (!phoneRegex.test(data.phone)) {
    errors.push("Please enter a valid phone number.");
  }
  if (!data.city) {
    errors.push("City is required.");
  }
  if (!data.country) {
    errors.push("Country is required.");
  }
  return errors;
}
