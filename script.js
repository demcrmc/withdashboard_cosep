$(document).ready(function() {
    // Function to fetch and display students
    function fetchStudents() {
        $.ajax({
            url: 'getStudents.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                let parent = $("#tablebody");
                parent.empty(); // Clear existing rows

                data.forEach(student => {
                    let row = `<tr>
                        <td>${student['student_id']}</td>
                        <td>${student['profile_image'] ? `<img src='${student['profile_image']}' alt='Profile Image' width='50'>` : 'No Image'}</td>
                        <td>${student['first_name']}</td>
                        <td>${student['last_name']}</td>
                        <td>${student['email']}</td>
                        <td>${student['gender']}</td>
                        <td>${student['course'] || 'N/A'}</td>
                        <td>${student['user_address'] || 'N/A'}</td>
                        <td>${student['age'] || 'N/A'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm btnEditStudent" data-id="${student['student_id']}">Edit</button>
                            <button class="btn btn-danger btn-sm btnDeleteStudent" data-id="${student['student_id']}">Delete</button>
                        </td>
                    </tr>`;
                    parent.append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error fetching students:', error);
            }
        });
    }

    // Fetch students on page load
    fetchStudents();

    // Show the modal when the "Add Student" button is clicked
    $("#btnCreateStudent").click(function() {
        $("#addStudentModal").modal('show'); // Show the modal
    });

    // Add Student
    $("#btnSubmitStudent").click(function() {
        let formData = new FormData($("#addStudentForm")[0]);

        $.ajax({
            url: "create_student.php", // PHP file to handle student creation
            type: "POST",
            dataType: "json",
            data: formData,
            processData: false, // Prevent jQuery from automatically transforming the data into a query string
            contentType: false // Set content type to false to let jQuery set it correctly
        }).done(function(result) {
            if (result.res === "success") {
                alert("Student added successfully!");
                fetchStudents(); // Refresh the student list
                $("#addStudentModal").modal('hide'); // Hide the modal
                $("#addStudentForm")[0].reset(); // Reset the form
            } else {
                alert("Error adding student: " + result.msg);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("AJAX request failed: " + textStatus + ", " + errorThrown);
            console.error("Response Text: ", jqXHR.responseText); // Log the response text for debugging
        });
    });

    // Edit Student
    $(document).on('click', '.btnEditStudent', function() {
        let studentId = $(this).data('id');

        $.ajax({
            url: "getStudents.php", // PHP file to fetch a single student's data
            type: "GET",
            dataType: "json",
            data: { id: studentId }
        }).done(function(student) {
            // Populate the form with student data
            $("#editStudentId").val(student.student_id);
            $("#editFirstName").val(student.first_name);
            $("#editLastName").val(student.last_name);
            $("#editEmail").val(student.email);
            $("#editGender").val(student.gender);
            $("#editCourse").val(student.course);
            $("#editAddress").val(student.user_address);
            $("#editBirthdate").val(student.birthdate);
            $("#editModal").modal('show'); // Show the modal
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("Error fetching student data: " + textStatus + ", " + errorThrown);
        });
    });

    $("#btnUpdateStudent").click(function() {
        // Create a FormData object to handle file uploads
        let formData = new FormData($("#editStudentForm")[0]);

        $.ajax({
            url: "update_student.php", // PHP file to handle student update
            type: "POST",
            dataType: "json",
            data: formData, // Use FormData instead of $.param()
            processData: false, // Prevent jQuery from automatically transforming the data into a query string
            contentType: false // Set content type to false to let jQuery set it correctly
        }).done(function(result) {
            if (result.res === "success") {
                alert("Student updated successfully!");
                fetchStudents(); // Refresh the student list
                $("#editModal").modal('hide'); // Hide the modal after updating
            } else {
                alert("Error updating student: " + result.msg);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert("AJAX request failed: " + textStatus + ", " + errorThrown);
        });
    });

    // Delete Student
    $(document).on('click', '.btnDeleteStudent', function() {
        let studentId = $(this).data('id');
        if (confirm("Are you sure you want to delete this student?")) {
            $.ajax({
                url: "delete_student.php", // PHP file to handle student deletion
                type: "POST",
                dataType: "json",
                data: { id: studentId }
            }).done(function(result) {
                if (result.res === "success") {
                    alert("Student deleted successfully!");
                    fetchStudents(); // Refresh the student list
                } else {
                    alert("Error deleting student: " + result.msg);
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                alert("AJAX request failed: " + textStatus + ", " + errorThrown);
            });
        }
    });
    
});

// Fetch data from backend.php
function fetchData() {
    fetch('backend.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Redirect to login page if not logged in
                alert(data.error);
                window.location.href = 'login.php';
                return;
            }

            // Update profile section
            document.getElementById('profileImage').src = data.user.profile_image || 'default-profile.png';
            document.getElementById('profileName').textContent = `${data.user.first_name} ${data.user.last_name}`;

            // Update system health and verified users
            document.getElementById('systemHealth').textContent = data.systemHealth;
            document.getElementById('systemHealthBox').classList.add(data.systemHealth.toLowerCase());
            document.getElementById('verifiedCount').textContent = data.verifiedCount;

            // Populate user table
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = ''; // Clear existing rows
            data.users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.student_id}</td>
                        <td>${user.profile_image ? `<img src="${user.profile_image}" alt="Profile Image" width="50">` : 'No Image'}</td>
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td class="${user.is_verified ? 'account-status verified' : 'account-status not-verified'}">
                            ${user.is_verified ? 'Verified' : 'Not Verified'}
                        </td>
                    </tr>
                `;
                userTableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Real-time clock
function updateClock() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('realTimeClock').textContent = now.toLocaleDateString('en-US', options);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Fetch data on page load
    setInterval(updateClock, 1000); // Update clock every second
    updateClock(); // Initialize clock immediately
});