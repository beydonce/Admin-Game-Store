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
    // The backend returns the customer data as a flat JSON object.
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

  // Get the Save button element and disable it immediately.
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;

  // Get the customer ID from the URL query parameters.
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('id');

  // Gather form field values.
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const country = document.getElementById('country').value.trim();

  // Simple validation for required fields.
  if (!username || !email || !phone || !city || !country) {
    alert('Please fill in all required fields.');
    saveBtn.disabled = false;
    return;
  }

  // Prepare the update data. Include the password only if provided.
  let updateData = {
    username: username,
    customer_name: name,
    email: email,
    phone: phone,
    city: city,
    country: country
  };
  if (password) {
    updateData.password = password;
  }
  
  console.log('Sending update for customer:', customerId, updateData);

  try {
    // Show the loading indicator.
    document.getElementById('loading').style.display = 'block';

    // Send a PUT request to update the customer.
    await axios.put(`http://127.0.0.1:5000/customers/${customerId}`, updateData);

    // Hide the loading indicator.
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
