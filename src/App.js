
import React, { useState, useEffect } from "react";
import data from "./data/celebrities.json";
import "./styles.css";
import { createGlobalStyle } from "styled-components"; 
import "@fontsource/roboto";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif; /* Apply Roboto font to body */
  }
`;


function App() {
  // Define state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({
    gender: "",
    country: "",
    description: "",
  });
  const [validationError, setValidationError] = useState("");

  // useEffect to initialize searchResults with sorted data on component mount
  useEffect(() => {
    const sortedUsers = data.sort((a, b) => a.first.localeCompare(b.first));
    setSearchResults(sortedUsers);
  }, []);

  // Function to handle search logic
  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    // Filter data based on search term
    const filteredResults = data.filter((item) =>
      item.first.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  // Function to handle accordion functionality
  const handleAccordion = (id) => {
    setSearchResults((prevResults) =>
      prevResults.map((item) => ({
        ...item,
        isOpen: item.id === id ? !item.isOpen : false,
      }))
    );
  };

  // Function to show delete confirmation modal
  const showDeleteConfirmModal = (id) => {
    setDeleteUserId(id);
    setShowDeleteConfirmation(true);
  };

  // Function to hide delete confirmation modal
  const hideDeleteConfirmModal = () => {
    setShowDeleteConfirmation(false);
    setDeleteUserId(null);
  };

  // Function to handle edit user
  const handleEdit = (id) => {
    const userToEdit = searchResults.find((item) => item.id === id);

    // Calculate age
    const age = calculateAge(userToEdit.dob);

    // Check if user is 18 or older
    if (age < 18) {
      const alertMessage = "You must be 18 or older to edit your profile.";
      const alertContainer = document.createElement("div");
      alertContainer.classList.add("custom-alert");
      alertContainer.textContent = alertMessage;
      document.body.appendChild(alertContainer);

      setTimeout(() => {
        alertContainer.remove();
      }, 3000); 
      return;
    }

    // Proceed with editing for users 18 or older
    setEditedUser(userToEdit);
    setEditedUserData({ ...userToEdit });
    setEditMode(true);
    setEditModalOpen(true);
  };

  // Function to handle edit modal change
  const handleEditModalChange = (event) => {
    const { name, value } = event.target;
    setEditedUserData({ ...editedUserData, [name]: value });
  };

  // Function to save edited user details
  const handleSaveEdit = () => {

    if (!validateEditedUser()) {
      setValidationError("All fields are required");
      return;
    }

    // Update user data
    const updatedUsers = searchResults.map((user) =>
      user.id === editedUser.id ? { ...user, ...editedUserData } : user
    );
    setSearchResults(updatedUsers);
    setEditMode(false);
    setEditModalOpen(false);
  };

  // Function to cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditModalOpen(false);
  };

  // Function to validate edited user details
  const validateEditedUser = () => {
    const { gender, country, description } = editedUserData;
    if (!gender || !country || !description) {
      return false;
    }
    return true;
  };

  // Function to handle delete
  const handleDelete = () => {
    
    const updatedUsers = searchResults.filter(
      (user) => user.id !== deleteUserId
    );
    setSearchResults(updatedUsers);
    console.log("Deleting user with ID:", deleteUserId);
    
    hideDeleteConfirmModal();
  };

  return (
    <div className="container">
      <h1>Celebrity <span>Search</span></h1>
      <input
        className="search-input"
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div className="user-list">
        {/* Map over search results */}
        {searchResults.map((item) => (
          <div key={item.id} className="user-item">
            <div className="user-details" onClick={() => handleAccordion(item.id)}>
              <img src={item.picture} alt={item.first} />
              <p>{item.first} {item.last}</p>
              <span className={`accordion-icon ${item.isOpen ? 'open' : ''}`}>&#9654;</span>
            </div>
            {/* Show expanded details when accordion is open */}
            {item.isOpen && (
              <div className="user-details-expanded">
                {/* Flex row for age, gender, and country */}
                <div className="flex-row">
                  <div>
                    <p className="profile-item">Age 
                      <span className="profile-answer">{calculateAge(item.dob)} years</span>
                    </p>
                  </div>
                  <div>
                    <p className="profile-item">Gender
                      <span className="profile-answer">{item.gender}</span>
                    </p>
                  </div>
                  <div>
                    <p className="profile-item">Country
                      <span className="profile-answer">{item.country}</span>
                    </p>
                  </div>
                </div>
                {/* Description in the next row */}
                <div className="description-row">
                  <p className="profile-item">Description
                    <span className="profile-answer">{item.description}</span>
                  </p>
                </div>
                <div className="edit-buttons">
                  {/* Edit button */}
                  <button className="edit-but" onClick={() => handleEdit(item.id)}>Edit</button>
                  {/* Delete button */}
                  <button className="delete-but" onClick={() => showDeleteConfirmModal(item.id)}>Delete</button>
                </div>
              </div>
            )}
            {/* Edit modal */}
            {editMode && editedUser && editedUser.id === item.id && (
              <div className="edit-modal">
                <div className="edit-form">
                  <div className="form-row">
                    {/* Gender and Country input fields */}
                    <div className="form-group">
                      <label>Gender:</label>
                      <select name="gender" value={editedUserData.gender} onChange={handleEditModalChange}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Rather not say">Rather not say</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Country:</label>
                      <input
                        type="text"
                        name="country"
                        value={editedUserData.country}
                        onChange={handleEditModalChange}
                      />
                    </div>
                  </div>
                  {/* Description input field */}
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={editedUserData.description}
                      onChange={handleEditModalChange}
                    />
                  </div>
                </div>
                {/* Buttons with styling */}
                <div className="button-container">
                  <button className="save-button" onClick={handleSaveEdit}>Save</button>
                  <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                </div>
                {/* Validation error message */}
                {validationError && <p className="error-message">{validationError}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <div className="delete-modal">
          <p>Are you sure you want to delete?</p>
          <div>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={hideDeleteConfirmModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Function to calculate age 
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const currentDate = new Date();
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  return age;
};


export default App;
