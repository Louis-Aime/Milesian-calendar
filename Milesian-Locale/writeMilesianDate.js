// Write Milesian - makeup
// UTF-8
// Copyright www.calendriermilesien.org
// Import CalendarCycleComputationEngine, MilesianDateProperties, toMilesianString, MilesianAlertMsg
//
var targetDate = new Date();
// Access to month names of the Milesian calendar. To be enhanced. Leave open.
function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.
	// Milesian calendar use the standard JS routines to display local values of date, here the Date methods
    document.milesian.year.value = targetDate.getMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = targetDate.getMilesianDate().month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = targetDate.getMilesianDate().date;
	document.milesian.dayofweek.value = targetDate.toLocaleDateString ("fr-FR", {weekday : "long"});
	// Write Milesian and Gregorian strings following currently visible options
	putStringOnOptions();
}
function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay ();
}
function calcMilesian() {	// on OK on Milesian date
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"'  + document.milesian.day.value + '" "' + document.milesian.year.value + '"')
	else {		
		targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
		setDisplay ();
		}
}
function SetDayOffset (sign) { // the days are integer, all 24h, so local time may change making this operation
	if (sign == undefined) sign = 1;	// Sign is either +1 or -1. Just in case it does not come as a parameter.
	let days = Math.round (document.control.shift.value);
	if (!Number.isInteger(days)) alert (milesianAlertMsg("nonInteger") + '"' + days + '"')
	else { 
		targetDate.setUTCDate (targetDate.getUTCDate()+sign*days);
		setDisplay();
	}
}
function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String; No control.
	let Locale = document.LocaleOptions.Locale.value;
	let Calendar = document.LocaleOptions.Calendar.value;
	let timeZone = document.LocaleOptions.TimeZone.value;
	var askedOptions, usedOptions;
	if (Locale == ""){ 
		if (Calendar !== "") {
			askedOptions = new Intl.DateTimeFormat ();
			usedOptions = askedOptions.resolvedOptions();
			Locale = usedOptions.locale.slice(0,5) + "-u-ca-" + Calendar}
		else Locale = undefined}
	else if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar;
	askedOptions = new Intl.DateTimeFormat (Locale);
	userOptions = askedOptions.resolvedOptions(); 
	let Options = {	// No control !
		weekday : (document.LocaleOptions.Weekday.value == "") ? undefined : document.LocaleOptions.Weekday.value,
		day 	: (document.LocaleOptions.Day.value == "") ? undefined : document.LocaleOptions.Day.value,
		month	: (document.LocaleOptions.Month.value == "") ? undefined : document.LocaleOptions.Month.value,
		year	: (document.LocaleOptions.Year.value == "") ? undefined : document.LocaleOptions.Year.value,
		era		: (document.LocaleOptions.Era.value == "") ? undefined : document.LocaleOptions.Era.value
	}
	if (timeZone !== "") 
		Options.timeZone = timeZone ; // Object.defineProperty(Options, "timeZone", {enumerable : true, writable : true, value : timeZone});
	// Check here that Options with timeZone is valid
	try {
		askedOptions = Intl.DateTimeFormat (Locale, Options);
		}
	catch (e) {
		alert (milesianAlertMsg("invalidCode") + '"' + Options.timeZone + '"');
		document.LocaleOptions.TimeZone.value = ''; 	// Reset TimeZone indication to empty string
		delete Options.timeZone; // Delete property
		askedOptions = Intl.DateTimeFormat (Locale, Options);	// Finally the options do not comprise the time zone
	}

	askedOptions = new Intl.DateTimeFormat (Locale,Options);
	usedOptions = askedOptions.resolvedOptions();
	document.LocaleOptions.ETimeZone.value=usedOptions.timeZone;
	document.LocaleOptions.Elocale.value = usedOptions.locale;
	document.LocaleOptions.Ecalend.value = usedOptions.calendar;
	document.LocaleOptions.M2string.value = askedOptions.milesianFormat(targetDate);
	// document.LocaleOptions.Mstring.value = targetDate.toMilesianLocaleDateString(Locale,Options);
	document.LocaleOptions.Gstring.value = targetDate.toLocaleDateString(Locale,Options);
}