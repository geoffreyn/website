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
    
    // Delete Access log entry link click
    $('#accessList table tbody').on('click', 'td a.linkdeleteAccess', deleteAccess);
  
    console.log('Global socket connected');
    socket.on('pageview', function (msg) {
        if (msg.url) {
            appendTable(msg);
        }
    });
});

// Functions ============================================

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
                //alert('Error: ' + response.msg);
                console.log('Error: ' + response.msg);
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

// Delete Access
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

        });

        // Update the displayed log
        populateAccessTable();
        
    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Fill table with data
function populateAccessTable() {
    
    var geoTableContent = '';
               
    // Empty content string
    var tableContent = '';
    
    // jQuery AJAX call for JSON
    $.getJSON( '/analytics/accessList', { user: 'admin', pass: 'password' } , function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
       accessListData = data.reverse();  // Put oldest log on top
       $.each(data, function( index ) {
           if (index < 25) {
               tableContent += '<tr>';
               tableContent += '<td><font size="4">' + (index+1) + '</font></td>';
               tableContent += '<td><font size="3">' + this.accessInfoAddress + '</font></td><td><font size="3">' + this.accessInfoIP + '</font></td>';
               tableContent += '<td><font size="1">' + this.accessInfoTime + '</font></td>';
               if (this.hasOwnProperty('accessRegion')) {
                   tableContent += '<td><font size="3">' + this.accessCountry + '</font></td><td><font size="3">' + this.accessRegion + '</font></td>';
               }
               else {
                    tableContent += '<td><font size="3">??</font></td><td><font size="3">??</font></td>';
               }
               tableContent += '<td><a href="#" class="linkdeleteAccess" rel="' + this._id + '"><font size="3">delete</font></a></td>';
               tableContent += '</tr>'; 
           }
      
        });
        
        // Fill variable regions with name of all regions from access logs
        regions = [];
        geos = [];
        $.each(data, function(index) {
            if (this.hasOwnProperty('accessRegion')) { 
                    regions.push(this.accessRegion);
                    geos.push(this.accessCountry);
            }
        });
        
        // Determine the unique regions
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        uniqueR = regions.filter(onlyUnique);
        
        // Count the occurance of each unique region
        Array.prototype.count = function(value) {
            var counter = 0;
            for(var i=0;i<this.length;i++) {
                if (this[i] === value) counter++;
            }
            return counter;
        };
        regionCounts = [uniqueR.length];
        $.each(uniqueR, function( index ) {
            regionCounts[index] = regions.count(uniqueR[index]);
        });
        
        // Fill table with unique regions and counts
        for (var i = 0; i < uniqueR.length; i++) {
            geoTableContent += '<tr>';
            geoTableContent += '<td><font size="3">' + geos[i] + '</font></td><td><font size="3">' + uniqueR[i] + '</font></td>';
            geoTableContent += '<td><font size="3">' + regionCounts[i].toString() + '</font></td>';   
        };
        
        
        // Inject the whole content string into our existing HTML tables
        $('#accessList table tbody').html(tableContent);
        
        $('#geographyList table tbody').html(geoTableContent);
        
        //Determine color cycle of pie chart
        colors = ["#949FB1", "#46BFBD", "#FDB45C","#F7464A","#949FB1"];
        highlights = ["#A8B3C5", "#5AD3D1", "#FFC870","#FF5A5E","#A8B3C5"];
     
        // Create Pie Chart of first result
        var data1 = [
            {
                value: regionCounts[0],
                color: "#949FB1",
                highlight: "#A8B3C5",
                label: uniqueR[0]
            }
        ];
        
        // Get context with jQuery - using jQuery's .get() method.
         var ctx = $("#myChart").get(0).getContext("2d");
        
        // This will get the first returned node in the jQuery collection.
         var locationChart = new Chart(ctx).Pie(data1);
    
        // Pie chart is expandable for when new regions connect
        $.each(regionCounts, function (index) {
            if (index > 0) {
                locationChart.addData({
                    value: this,
                    label: uniqueR[index],
                    color: colors[index],
                    highlight: highlights[index]
                });
            }
        });
        
    });
};

function appendTable(msg) {
    //console.log('Socket-DB appended');
     
    //var locMsg = jQuery.parseJSON(JSON.stringify(msg.location));
     
    var newAccess = {
            'accessInfoAddress': msg.url,
            'accessInfoIP': msg.ip,
            'accessInfoTime': msg.timestamp,
            'accessCountry': msg.location.country,
            'accessRegion': msg.location.region
    }
    
    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: 'POST',
        data: newAccess,
        url: '/analytics/addAccess',
        dataType: 'JSON', 
        
    }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
            console.log(msg);
        }

        else {

            // If something goes wrong, alert the error message that our service returned
            //alert('Error: ' + response.msg);
            console.log('Error: ' + response.msg);
        }
    });
};