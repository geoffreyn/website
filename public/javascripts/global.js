// Userlist data array for filling in info box
var userListData = [];
var accessListData = [];
var socket = io.connect();
    
// DOM ready ============================================
$(document).ready(function() {
    
    // Populate the user table on intial page load
    populateTable();
    
    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
    

    // Populate Access Log
    populateAccessTable();
    
    // Delete Access log entry link click
    $('#accessList table tbody').on('click', 'td a.linkdeleteAccess', deleteAccess);
  
  /*
    // Search textbox enter pressed
    $('#searchInput').on('keypress',function(event) {
        key = event.which;
        
        if (key == 13) {
            startSearch();
        }
    });
    
    
    // Search button pressed
    $('#searchA #searchBtn').on('click', function(event) {
        event.preventDefault();
        
        startSearch();
    });
    */
    
    console.log('Global socket connected');
    socket.on('pageview', function (msg) {
        if (msg.url) {
            console.log('Received at global.js');
            appendTable(msg);
        }
    });
});

// Functions ============================================

/*
// Initiate google search from navbar
function startSearch() {
    event.preventDefault();

    // Determine the Google search for the #searchBtn text
    var newurl = 'https://www.google.com/?&gws_rd=ssl#q=site:firetree.ddns.net+' + $('#searchInput').val();

    //$('#searchA').href = newurl;
    
    // Clear search text
    $('#searchInput').val('');

    // Navigate browser
    window.location.href = newurl;
};
*/

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
           userListData = data;
           $.each(data, function() {
           tableContent += '<tr>';
           tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
           tableContent += '<td>' + this.email + '</td>';
           tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
           tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {
    
    // Prevent Link from Firing
    event.preventDefault();

    // Retreive username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    // Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('I can haz cheezeburger, but you no delete user!: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Delete User
function deleteAccess(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this access log entry?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/analytics/deleteAccess/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('I can haz cheezeburger, but you no delete access log entry!: ' + response.msg);
            }

            // Update the table
            populateAccessTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Fill table with data
function populateAccessTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/analytics/accessList', function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
           accessListData = data;
           $.each(data, function() {
           tableContent += '<tr>';
           tableContent += '<td>' + this.accessInfoAddress + '</td><td>' + this.accessInfoIP + '</td>';
           tableContent += '<td>' + this.accessInfoTime + '</td>';
           tableContent += '<td><a href="#" class="linkdeleteAccess" rel="' + this._id + '">delete</a></td>';
           tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#accessList table tbody').html(tableContent);
    });
};

function appendTable(msg) {
    console.log('Socket-DB appended');
     
    var newAccess = {
            'accessInfoAddress': msg.url,
            'accessInfoIP': msg.ip,
            'accessInfoTime': msg.timestamp
    }
    
    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: 'POST',
        data: newAccess,
        url: '/analytics/addAccess',
        dataType: 'JSON'
        
    }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
            // Update the table
            populateAccessTable();
        }
        else {
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
        }
    });
};