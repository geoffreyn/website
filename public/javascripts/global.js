"use strict";

// Data arrays for filling in info box
var userListData = [];
var socket = io.connect();

// For loop variable
var i, j = 0;

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
}

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

}

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
        };

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
}

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
            if (response.msg !== '') {
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

}

//Helper functions for generating gradient
function _interpolation(a, b, factor) {
	var ret = [];
	for (i = 0; i < Math.min(a.length, b.length); i++) {
		ret.push(a[i] * (1 - factor) + b[i] * factor);
	}
	return ret;
}

function colorInterp(start, end, n) {
	var ret = [];
	for (j = 0; j < n; j++) {
		//var color = new Color();
		var rgb = _interpolation(start, end, j / (n - 1));
		//color.setRGB(rgb[0], rgb[1], rgb[2]);
		ret.push(rgb);
	}
	return ret;
}

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


function ajaxRequest(urlIn) {
    var output;
    $.ajax({
        url: urlIn,
        async: false,
        dataType: 'json',
        header: { user: 'admin', pass: 'password' },
        success: function(data) {
            output = data;
        }
    });
    return output;
}

function sortWithIndices(toSort) {
	for (var i = 0; i < toSort.length; i++) {
		toSort[i] = [toSort[i], i];
	}
	toSort.sort(function(left, right) {
		return left[0] > right[0] ? -1 : 1;
	});
	toSort.sortIndices = [];
	for (var j = 0; j < toSort.length; j++) {
		toSort.sortIndices.push(toSort[j][1]);
		toSort[j] = toSort[j][0];
	}
	return toSort;
}
		
// Fill table with data
function populateAccessTable() {
               
    // Empty content string
    var tableContent = '';
    var repeatTableContents = '';    
    var geoTableContent = '';
    
    // For loop variable
    var count = -1;
    
    // Determine which webpages are hottest
    
    // jQuery AJAX call for JSON
    // $.getJSON('/analytics/unique/accessInfoAddress', { user: 'admin', pass: 'password' } , function( data ) {
        
        // var pageCounts = [];
        // $.each(data,function(index) {
            // pageCounts.push(ajaxRequest('/analytics/count/accessInfoAddress/"' + this.valueOf()) +'"');
        // });
        
        // var sortedPages = [];
        // sortedPageCounts = sortWithIndices(pageCounts);
        // $.each(sortedPageCounts, function(index) {
            // sortedPages.push(data[this.sortIndices]);
        // });
        
        // console.log(sortedPages + " + " + sortedPageCounts);
        
        
    // });
    
    var uniqueRegions = ajaxRequest('/analytics/unique/accessRegion');
    
    var regionCounts = [];
    var badIndex = [];
    
    // Determine how often each region occurred
    $.each(uniqueRegions, function( index ) {
        // Request the region's count unless the region is blank
        if (this.valueOf() !== "") {
            regionCounts.push(ajaxRequest('/analytics/count/accessRegion/' + this.valueOf()));
        }
        else {
            // Store unlisted regions indices and temporarily fill with 0's
            regionCounts.push(0);
            badIndex.push(index);
        }
    });
    
    var totalCount =  ajaxRequest('/analytics/count/all/all');
    
    // Replace each 0 with the missing value (If more than one zero this will screw up total count)
    $.each(badIndex, function() {
        regionCounts[this.valueOf()] = totalCount - regionCounts.reduce(function(a, b) {
            return a + b;
        });
    });
    
	// NEW method
	
    // jQuery AJAX call for JSON
    $.getJSON('/analytics/unique/accessInfoIP', { user: 'admin', pass: 'password' } , function( data ) {

		/* FILL DoS table first */
		var superdata = [];
		var ipCounts = [];
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function( index ) {
			superdata.push(ajaxRequest('/analytics/accessInfoIP/' + this.valueOf())[0]);
			ipCounts.push(ajaxRequest('/analytics/count/accessInfoIP/' + this.valueOf()));
			if (superdata[index].accessRegion === "") {
				superdata[index].accessRegion = superdata[index].accessCountry;
			}
	    });
	    
		var sortedIPcounts = sortWithIndices(ipCounts);
		var	sortedSuperdata = [];
	
		$.each(sortedIPcounts.sortIndices, function () {
			sortedSuperdata.push(superdata[this.valueOf()]);
		});
		
		// Fill table with unique regions and counts -  DoS Attempt Tracker
		for (i = 0; i < sortedIPcounts.length; i++) {
			repeatTableContents += '<tr>';
			repeatTableContents += '<td><font size="3">' + sortedSuperdata[i].accessInfoIP + '</font></td><td><font size="3">' + sortedSuperdata[i].accessCountry + "/" +  sortedSuperdata[i].accessRegion + '</font></td>';
			repeatTableContents += '<td><font size="3">' + sortedIPcounts[i].toString() + '</font></td>';   
		}
		$('#connectionCounts table tbody').html(repeatTableContents);
        
        var abbreviatedIPcounts = [],
              abbreviatedIPlist = [];
              
        // TOO many sorted IP counts for pie chart to look reasonable, will sum past 5 slices to "other" slice
        if (sortedIPcounts.length >= 5) {
            
            for (i = 0; i < sortedIPcounts.length; i++) {
                if ( i < 5) {
                    abbreviatedIPcounts.push(sortedIPcounts[i]);
                    abbreviatedIPlist.push(sortedSuperdata[i].accessInfoIP);
                }
                else {
                    abbreviatedIPcounts[4] = abbreviatedIPcounts[4] + sortedIPcounts[5];
                }
            }
            abbreviatedIPlist[4] = 'Other';
        }
        
		/* Make the Pie chart */
        var makeNewChart;
		var ipChart;
        
        //Determine color cycle of pie chart
        var colors = [];
        var col1 = [0, 220, 220];
        var col2 = [220, 220, 0];
        
        // One color doesn't interpolate correct so just skip for less than 3 colors
        if (abbreviatedIPlist.length > 2) {
            var colorsRGB = colorInterp(col1, col2, abbreviatedIPlist.length);
            $.each (colorsRGB, function() {
                colors.push(rgbToHex(this));
            });
        }
        else {
            colors = [rgbToHex(col1), rgbToHex(col2)];
        }
        
        var highlights = [];
        col1 = [50, 255, 255];
        col2 = [255, 255, 50];

        if (abbreviatedIPlist.length > 2) {
            var highlightsRGB = colorInterp(col1, col2, abbreviatedIPlist.length);
            $.each (highlightsRGB, function() {
                highlights.push(rgbToHex(this));
            });
        }
        else {
            highlights = [rgbToHex(col1), rgbToHex(col2)];
        }
        
        if (typeof ipChart === "undefined") {
            makeNewChart = true;
        }
        else {
            if (ipChart.segments.length !== abbreviatedIPlist.length) {
                ipChart.destroy();
                makeNewChart = true;
            }
            else {
                makeNewChart = false;
            }
        }
        if (makeNewChart) {
           // Create Pie Chart of first result
            var data1 = [
                {
                    value: abbreviatedIPcounts[0],
                    color: colors[0],
                    highlight: highlights[0],
                    label: abbreviatedIPlist[0]
                }
            ];
          
            // Get context with jQuery - using jQuery's .get() method.
            var ctx = $("#ipChart").get(0).getContext("2d");
           
            var options = {
                animation: false,
                legendTemplate : "<p><% for (i=0; i<(segments.length); i++){%><span class=\"labelblock\"><span class=\"colorblock\" style=\"background-color:<%=segments[i].fillColor%>\">  </span><span class=\"textblock\"><%if(segments[i].label){%><%='IP'+(i+1)%>=<%=segments[i].value%><%}%>  </span></span><%}%></p>"
            };
         
            // This will get the first returned node in the jQuery collection.
            ipChart = new Chart(ctx).Pie(data1,options);
         
            // Pie chart is expandable for when new regions connect
            $.each(abbreviatedIPcounts, function (index) {
                if (index > 0) {
                    ipChart.addData({
                        value: this,
                        label: abbreviatedIPlist[index],
                        color: colors[index],
                        highlight: highlights[index]
                    });
                }
            });
        }
        else {
            $.each(abbreviatedIPlist, function (index) {
                ipChart.segments[index].value = abbreviatedIPcounts[index];
            });
        }
        
        $('#ipLegend').html(ipChart.generateLegend());
    });
    
    $.getJSON('/analytics/unique/accessInfoIP', { user: 'admin', pass: 'password' } , function( data ) {
		/* FILL Region table and pie chart next */
		
		var repeatCountry = [];
		var repeatRegion = [];
		var curRegion = '';
		var curCountry = '';
        var uniqueIP = ajaxRequest('/analytics/unique/accessInfoIP');
	    $.each(uniqueIP, function( ) {
				curCountry = ajaxRequest('/analytics/accessInfoIP/' + this.valueOf())[0].accessCountry;
				curRegion = ajaxRequest('/analytics/accessInfoIP/' + this.valueOf())[0].accessRegion;
				repeatCountry.push(curCountry);
				// Replace blank regions with the name of the country they lie in
				if (curRegion === "") {
					repeatRegion.push(curCountry);
				}
				else {
					repeatRegion.push(curRegion);
				}
		});
		
        function onlyUnique(value, index, self) {
            if (self.indexOf(value) === index) {
                countryByIpCounts.push(repeatCountry[index]);
            }
            return (self.indexOf(value) === index);
        }
        
        var countryByIpCounts = [];
        var uniqueRegion = repeatRegion.filter(onlyUnique);
        
        // Count the occurance of each unique region
        Array.prototype.count = function(value) {
            count = 0;
            for (i=0;i<this.length;i++) {
                if (this[i] === value) count++;
            }
            return count;
        };
		
        var regionByIpCounts = [];
        $.each(uniqueRegion, function( index ) {
            regionByIpCounts.push(repeatRegion.count(uniqueRegion[index]));
        });
		
		var sortedRegionCounts = sortWithIndices(regionByIpCounts);
		var	sortedCountry = [];
		var sortedRegion = [];
	
		$.each(sortedRegionCounts.sortIndices, function () {
			sortedCountry.push(countryByIpCounts[this.valueOf()]);
			sortedRegion.push(uniqueRegion[this.valueOf()]);
		});
		
        // Fill table with SORTED unique regions and counts
        for (i = 0; i < regionByIpCounts.length; i++) {
            geoTableContent += '<tr>';
            geoTableContent += '<td><font size="3">' + sortedCountry[i] + '</font></td><td><font size="3">' + sortedRegion[i] + '</font></td>';
            geoTableContent += '<td><font size="3">' + sortedRegionCounts[i].toString() + '</font></td>';   
        }
        $('#geographyList table tbody').html(geoTableContent);
        
        
		/* Make the Pie chart */
        var makeNewChart;
		var locationChart;
        
        //Determine color cycle of pie chart
        var colors = [];
        var col1 = [220, 0, 0]; // some red
        var col2 = [0, 220, 0]; // some green
        
        // One color doesn't interpolate correct so just skip for less than 3 colors
        if (uniqueRegion.length > 2) {
            var colorsRGB = colorInterp(col1, col2, uniqueRegion.length);
            $.each (colorsRGB, function() {
                colors.push(rgbToHex(this));
            });
        }
        else {
            colors = [rgbToHex(col1), rgbToHex(col2)];
        }
        
        var highlights = [];
        col1 = [255, 50, 50]; // some red
        col2 = [50, 255, 50]; // some green

        if (uniqueRegion.length > 2) {
            var highlightsRGB = colorInterp(col1, col2, uniqueRegion.length);
            $.each (highlightsRGB, function() {
                highlights.push(rgbToHex(this));
            });
        }
        else {
            highlights = [rgbToHex(col1), rgbToHex(col2)];
        }
        
        if (typeof locationChart === "undefined") {
            makeNewChart = true;
        }
        else {
            if (locationChart.segments.length !== regionByIpCounts.length) {
                locationChart.destroy();
                makeNewChart = true;
            }
            else {
                makeNewChart = false;
            }
        }
        if (makeNewChart) {
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
            var ctx = $("#locChart").get(0).getContext("2d");
           
            var options = {
                 animation: false,
                 legendTemplate : "<p><% for (i=0; i<(segments.length); i++){%><span class=\"labelblock\"><span class=\"colorblock\" style=\"background-color:<%=segments[i].fillColor%>\">  </span><span class=\"textblock\"><%if(segments[i].label){%><%=segments[i].label%>=<%=segments[i].value%><%}%>  </span></span><%}%></p>"
            };
         
            // This will get the first returned node in the jQuery collection.
            locationChart = new Chart(ctx).Pie(data1,options);
         

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
        }
        else {
            $.each(regionByIpCounts, function (index) {
                locationChart.segments[index].value = regionByIpCounts[index];
            });
        }
        $('#locLegend').html(locationChart.generateLegend());
	});
	   
    // jQuery AJAX call for JSON
    $.getJSON( '/analytics/accessList', { user: 'admin', pass: 'password' } , function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
       $.each(data, function( ) {
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
      
        });
        
        // Inject the whole content string into		our existing HTML tables
        $('#accessList table tbody').html(tableContent);
        
		// Possibly class tags are screwed up - if we don't inject blank HTML, it will async inject the full #accessList table contents
        // $('#geographyList table tbody').html('');
        // $('#connectionCounts table tbody').html('');
        
    });
}

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
            if (response.msg !== '') {
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
}

//Add Access log
function appendTable(msg) {
    var newAccess = {
            'accessInfoAddress': msg.url,
            'accessInfoIP': msg.ip,
            'accessInfoTime': msg.timestamp,
            'accessCountry': msg.location.country,
            'accessRegion': msg.location.region
    };
    
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
}


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
