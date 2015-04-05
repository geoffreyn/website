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
               
    // Empty content string
    var tableContent = '';
    var repeatTableContents = '';    
    var geoTableContent = '';
    
    
    // jQuery AJAX call for JSON
    $.getJSON( '/analytics/accessList', { user: 'admin', pass: 'password' } , function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
       accessListData = data.reverse();  // Put oldest log on top
       $.each(data, function( index ) {
           if (index < 25) {
               tableContent += '<tr>';
               tableContent += '<td><font size="3">' + this.accessInfoAddress + '</font></td><td><font size="3">' + this.accessInfoIP + '</font></td>';
               tableContent += '<td><font size="1">' + this.accessInfoTime + '</font></td>';
               if (this.hasOwnProperty('accessRegion')) {
                   tableContent += '<td><font size="3">' + this.accessCountry + '/' + this.accessRegion + '</font></td>';
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
        locers = [];
        superdata = [];
        count = -1;
        $.each(data, function(index) {
            if (this.hasOwnProperty('accessRegion')) { 
                    count++;
                    regions.push(this.accessRegion);
                    geos.push(this.accessCountry);
                    locers.push(index);
                    superdata[count] = ({
                        accessRegion: this.accessRegion,
                        accessCountry: this.accessCountry,
                        accessInfoIP: this.accessInfoIP
                    });
                    //superdata[count] = this;
            }
        });
        
        function compare(a,b) {
          if (a.accessInfoIP < b.accessInfoIP) {
             return -1;
          }
          if (a.accessInfoIP > b.accessInfoIP) {
            return 1;
          }
          return 0;
        }

        sortedByIP = superdata.sort(compare);
        lastIp = "0";
        repeatCount = [];
        repeatRegion = [];
        uniqueIP = [];
        repeatCountry = [];
        count = -1;
        $.each(sortedByIP, function(index) {
            // if (index === 0) {
                // repeatCount[0]
            // }
            // else {
                if (this.accessInfoIP.toLowerCase() != lastIp.toLowerCase()) {
                    if (this.accessRegion === "") {
                        repeatRegion.push("??");
                    }
                    else {
                        repeatRegion.push(this.accessRegion);
                    }
                    repeatCountry.push(this.accessCountry);
                    uniqueIP.push(this.accessInfoIP);
                    repeatCount.push(1);
                    lastIp = this.accessInfoIP;
                    count++;
                }
                else {
                    repeatCount[count]++;
                }
            // }
            
        });

        //console.log(uniqueRegion + repeatCountry + uniqueIP + repeatCount);
        
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        
        uniqueR = regions.filter(onlyUnique);
        uniqueRegion = repeatRegion.filter(onlyUnique);
        
        // Count the occurance of each unique region
        Array.prototype.count = function(value) {
            var counter = 0;
            for(var i=0;i<this.length;i++) {
                if (this[i] === value) counter++;
            }
            return counter;
        };
        regionCounts = [0];
        $.each(uniqueR, function( index ) {
            regionCounts[index] = regions.count(uniqueR[index]);
        });
        
        regionByIpCounts = [0];
        $.each(repeatCount, function( index ) {
            regionByIpCounts[index] = repeatRegion.count(uniqueRegion[index]);
        });
        
        // Fill table with unique regions and counts
        for (var i = 0; i < uniqueRegion.length; i++) {
            geoTableContent += '<tr>';
            geoTableContent += '<td><font size="3">' + repeatCountry[i] + '</font></td><td><font size="3">' + uniqueRegion[i] + '</font></td>';
            geoTableContent += '<td><font size="3">' + regionByIpCounts[i].toString() + '</font></td>';   
        };

        // Fill table with unique regions and counts
        for (var i = 0; i < uniqueIP.length; i++) {
            repeatTableContents += '<tr>';
            repeatTableContents += '<td><font size="3">' + uniqueIP[i] + '</font></td><td><font size="3">' + repeatRegion[i] + '</font></td>';
            repeatTableContents += '<td><font size="3">' + repeatCount[i].toString() + '</font></td>';   
        };
        
        
        // Inject the whole content string into our existing HTML tables
        $('#accessList table tbody').html(tableContent);
        
        $('#geographyList table tbody').html(geoTableContent);
        
        $('#connectionCounts table tbody').html(repeatTableContents);
        
        function _interpolation(a, b, factor) {
			var ret = [];

			for(var i = 0; i < Math.min(a.length, b.length); i++) {
				ret.push(a[i] * (1 - factor) + b[i] * factor);
			}

			return ret;
		}
        
        function colorInterp(start, end, n) {
			var ret = [];

			//var a = new Color(start);
			//var b = new Color(end);

			for(var i = 0; i < n; i++) {
				//var color = new Color();
				var rgb = _interpolation(start, end, i / (n - 1));
				//color.setRGB(rgb[0], rgb[1], rgb[2]);
				ret.push(rgb);
			}

			return ret;
		};
        
        function decimalToHexString(number)
        {
            if (number < 0)
            {
                number = 0xFFFFFFFF + number + 1;
            }
            if (number < 10) {
                return "0" + Math.ceil(number).toString(16).toUpperCase();
            }
            else {
                return Math.ceil(number).toString(16).toUpperCase();
            }
        }
        function rgbToHex(r) {
            return "#" + decimalToHexString(r[0]) + decimalToHexString(r[1]) + decimalToHexString(r[2]);
        }

        col1 = [220, 0, 0]; // some red
        col2 = [0, 220, 0]; // some green
        
        colorsRGB = colorInterp(col1, col2, uniqueRegion.length);
       
        colors = [];
        $.each (colorsRGB, function() {
            colors.push(rgbToHex(this));
        });
        
        col1 = [255, 50, 50]; // some red
        col2 = [50, 255, 50]; // some green

        highlightsRGB = colorInterp(col1, col2, uniqueRegion.length);

        highlights = [];
        $.each (highlightsRGB, function() {
            highlights.push(rgbToHex(this));
        });
        
        //Determine color cycle of pie chart
        //colors = ["#949FB1", "#46BFBD", "#FDB45C","#F7464A","#949FB1"];
        //highlights = ["#A8B3C5", "#5AD3D1", "#FFC870","#FF5A5E","#A8B3C5"];
     
        // Create Pie Chart of first result
        var data1 = [
            {
                value: regionByIpCounts[0],
                color: colors[0],
                highlight: highlights[0],
                label: uniqueRegion[0]
            }
        ];
      
        // Get context with jQuery - using jQuery's .get() method.
         var ctx = $("#myChart").get(0).getContext("2d");
       
         var options = {
            //legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span     style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
            // TWO EXTRA ENTRIES? <h3>Legend</h3>
            legendTemplate : "<p><% for (var i=0; i<(segments.length-2); i++){%><span class=\"labelblock\"><span class=\"colorblock\" style=\"background-color:<%=segments[i].fillColor%>\">  </span><span class=\"textblock\"><%if(segments[i].label){%><%=segments[i].label%>=<%=segments[i].value%><%}%>  </span></span><%}%></p>"

         }
         
        // This will get the first returned node in the jQuery collection.
         var locationChart = new Chart(ctx).Doughnut(data1,options);
    
        // Pie chart is expandable for when new regions connect
        $.each(regionByIpCounts, function (index) {
            if (index > 0) {
                locationChart.addData({
                    value: this,
                    label: uniqueRegion[index],
                    color: colors[index],
                    highlight: highlights[index]
                });
            }
        });
        
        $('#chartLegend').html(locationChart.generateLegend());
        console.log(locationChart.generateLegend());
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