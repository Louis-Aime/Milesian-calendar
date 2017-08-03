// Common settings for a web site or a standalone application using the international features of the Milesian calendar.
// Charset: UTF-8
// Do not change character set for HTML pages not coded in UTF-8.
var milesianNamesTest; //  milesianNames is the DOM object (document) containing the names of the Milesian calendar. 
//	add here variable with error messages
var xhr = new XMLHttpRequest();		// Request object.
// xhr.open("GET", "./milesianMonthNames.xml", false); // As .xml file is local, synchronous call is issued. Which is not recommended.
xhr.addEventListener ("load", function (event) {	// Catching "loaded" status"
	milesianNamesTest = xhr.responseXML ;
/*  Variant if responseXML is forbidden, as "not available to Web workers"
	var parser = new DOMParser ();
	milesianNames = parser.parseFromString(xhr.responseText, "application/xml");
*/	
	console.log ("XML milesian months file loaded");
//	refresh(); 		// some code that fires recomputation of strings, pages etc.;
	setDateToNow();	// Refresh code.
})
   xhr.open("GET", "http://0602.nccdn.net//000/000/163/c0b/milesianMonthNames.xml"); 	// asynchronous call, real network URL
// xhr.open("GET", "milesianMonthNames.xml"); 	// Test local
xhr.send();
/*	Variant part if synchronous open
	var parser = new DOMParser ();
	milesianNames = parser.parseFromString(xhr.responseText, "application/xml");
or  milesianNames = xhr.responseXML; 
*/	
//	Similar procedure for error messages, to be developped here.
