// Write Milesian - makeup
// UTF-8
// Copyright www.calendriermilesien.org
// Import CalendarCycleComputationEngine, MilesianDateProperties, toMilesianString
//
var targetDate = new Date();	// Used for tests.

// Access to month names of the Milesian calendar. To be enhanced. Leave open.
function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.
// Milesian calendar use the standard JS routines to display local values of date. 
   var UnixTime = targetDate.getTime(), TimeZoneOffset = targetDate.getTimezoneOffset() // Originally arguments of the function.
   var LocalTime = UnixTime - TimeZoneOffset * Chronos.MINUTE_UNIT; // This time enables date computations as if the local time was UTC time.
   var displayDate = new Date (LocalTime); 

//	Write local and UTC time
	document.time.hours.value = targetDate.getHours();
	document.time.mins.value = targetDate.getMinutes();
	document.time.secs.value = targetDate.getSeconds(); 
	document.UTCtime.time.value = 
	  targetDate.getUTCHours() + "h "
	  + ((targetDate.getUTCMinutes() < 10) ? "0" : "") + targetDate.getUTCMinutes() + "mn " 
	  + ((targetDate.getUTCSeconds() < 10) ? "0" : "") + targetDate.getUTCSeconds() + "s";
    //  Update Milesian Calendar - here we use Date properties
    document.milesian.year.value = targetDate.getMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = targetDate.getMilesianDate().month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = targetDate.getMilesianDate().date;
// Write string following currently written options
	putStringOnOptions();
}
function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay ();
}
function calcMilesian() {
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
	{ 
		alert ("Valeur non numérique dans cette date : " + document.milesian.day.value + " " + document.milesian.monthname.value + "m " + document.milesian.year.value);
	} else {		
		targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
		setDisplay ();
		}
}
function SetDayOffset () { // Choice here: the days are integer, all 24h, so local time may change making this operation
	var days = Math.round (document.control.shift.value);
	if (isNaN(days)) {alert ("Valeur non entière du délai: " + document.control.shift.value);
	} else { 
	document.control.shift.value = days;
	targetDate.setUTCDate (targetDate.getUTCDate()+days);
	setDisplay();
	}
}
function addTime () { // A number of seconds is added (minus also possible) to the Timestamp.
	var secs = Math.round (document.UTCshift.time_offset.value);
	if (isNaN(secs)) {alert ("Valeur non entière du délai: " + document.UTCtime.time_offset.value);
	} else { 
	document.UTCshift.time_offset.value = secs;
	targetDate.setTime (targetDate.getTime()+secs*Chronos.SECOND_UNIT);
	setDisplay();
	}
}
function calcTime () { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), secs = Math.round (document.time.secs.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs)) {
		alert ("Valeur non numérique de l'heure: " + document.time.hours.value + ":" + document.time.mins.value + ":" + document.time.secs.value);
	} else {
		targetDate.setHours(hours, mins, secs, 0); 
		// targetDate.setMinutes(mins); targetDate.setSeconds(secs); targetDate.setMilliseconds(0); Before Javascript 1.3
		setDisplay();	
	}
}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours sepcified.
		if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
		targetDate.setUTCHours(UTChours, 0, 0, 0); //targetDate.setUTCMinutes(0); targetDate.setSeconds(0); targetDate.setMilliseconds(0);
		setDisplay();	
}
function putStringOnOptions() { // get Locale and Options given on page, print String; No control.
	let Locale = document.LocaleOptions.Locale.value;
	if (Locale == "") Locale = undefined;
	let Options = {	// No control !
		weekday : (document.LocaleOptions.Weekday.value == "") ? undefined : document.LocaleOptions.Weekday.value,
		day 	: (document.LocaleOptions.Day.value == "") ? undefined : document.LocaleOptions.Day.value,
		month	: (document.LocaleOptions.Month.value == "") ? undefined : document.LocaleOptions.Month.value,
		year	: (document.LocaleOptions.Year.value == "") ? undefined : document.LocaleOptions.Year.value
	}
	document.LocaleOptions.Mstring.value = targetDate.toMilesianLocaleDateString(Locale,Options);
	document.LocaleOptions.Gstring.value = targetDate.toLocaleDateString(Locale,Options);
}