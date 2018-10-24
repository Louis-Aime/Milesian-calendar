/* Milesian Clock and converter functions - part 1
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.

Associated with: 
*	MilesianClock.html
Other js necessary
1. Common functions
*	CBCCE (the Cycle-Based Calendar Computation Engine)
*	MilesianAlertMsg
2. For conversions
*	MilesianClockOperations
*	MilesianDateProperties
*	JulianDateProperties
*	FrenchRevDateProperties
*	IsoWeekCalendarDateProperties
*	LunarDateProperties
*	ChronologicalCountConversion
3. For clock operation
*	MilesianClockOperations
4. For display, using Unicode standards
*	UnicodeMilesianFormat (used to be: toMilesianLocaleDateString then UnicodeMilesian)
*	MilesianMonthNameString (indirectly - or access to the name base in XML)
5. Continuation of present file
*	MilesianClockDisplayCompEntries (could be appended to this file, but total file is then more than 20k)
*/
/*
Version M2018-01-04 :
*	Display julio-gregorian date 
*	Red background when displayed date is outside validity
Version M2018-02-29
*	New modes (UTC, time zone or special offset) to manage date and time.
*	Specify time zone for Unicode part, giving access to numerous "local" times.
*	Enhance control of calendar validity.
Version M2018-05-15
*	Put Unicode and Milesian strings computation in setDisplay. 
Version M2018-10-26
*	askedOptions and userOptions variables were mis-declared, due to a ";" instead of ","
Version M2018-10-29
*	enhanced management of display parameters
Version M2018-11-02
*	Catch out-of-range errors
*	Catch display error on Unicode Um-al-Qura calendar
Version M2018-11-03
*	Display ISO week calendar string
*	Use date entry validity control option
*	Adapt TZ offset to min and sec
*/
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non-infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.

Inquiries: www.calendriermilesien.org
*/
var 
	targetDate = new Date(),	// target date will be used to update everything
	gregorianSwitch =  		// Settings: date where the Gregorian calendar was enforced (may change from one country to the other) 
		new Date (Date.UTC(1582, 11, 20, 0, 0, 0, 0)), // Values for France, on initialisation. In principle, should be fetched from Unicode.
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)), // Upper limit of the Republican calendar
		// Caveat with these limits: it is assumed that the timezone cannot be changed during a session.

	// Initial definition of display options parameters (global variables), to be superseded at initialisation
	TZSettings = {mode : "TZ", msoffset : 0},	
	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", 
					hour : "numeric", minute : "numeric", second : "numeric"}, 	
	askedOptions = new Intl.DateTimeFormat(undefined,Options), 	
	userOptions = askedOptions.resolvedOptions(); 
	
function setDisplay () {	// Disseminate targetDate and time on all display fields

	// Initiate Time zone mode for the "local" time from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
	// Timezone offset for next computations - opposite of JS off;set.
	// if (isNaN (document.TZmode.TZOffset.value)) alert (milesianAlertMsg("nonNumeric") + ' "' + document.TZmode.TZOffset.value + '"');
	let 
		systemDecimalTZ = - targetDate.getTimezoneOffset(), // Decimal minutes
		systemSign = (systemDecimalTZ < 0 ? -1 : 1),
		absoluteDecimalTZ = systemSign * systemDecimalTZ,
		absoluteTZmin = Math.floor (absoluteDecimalTZ),
		absoluteTZsec = Math.round ((absoluteDecimalTZ-absoluteTZmin) * 60);
	switch (TZSettings.mode) {
		case "TZ" : 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
		// Continue for  this case, copy computed TZOffset into TZSettings fur future computations
		case "Fixed" : TZSettings.msoffset = 
			- document.TZmode.TZOffsetSign.value 
			* (document.TZmode.TZOffset.value * Chronos.MINUTE_UNIT + document.TZmode.TZOffsetSec.value * Chronos.SECOND_UNIT);
			break;
		// If UTC mode, set computation offset to 0, but set displayed field to TZ value
		case "UTC" : 
			TZSettings.msoffset = 0; 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
	}
	
	compLocalePresentationCalendar(); // Establish initial / recomputed date string display parameters 

	var shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The UTC representation of targetDate date is the local date of TZ
	if (isNaN (shiftDate.valueOf())) { // targetDate may be in bounds, and shiftDate out of bounds.
		alert (milesianAlertMsg("outOfRange")) ; return 
	}
	// Initiate milesian clock and milesian string with present time and date
	var myElement = document.querySelector("#clock2");	// myElement is a work variable
	setSolarYearClockHands (myElement, shiftDate.getUTCMilesianDate().year, shiftDate.getUTCMilesianDate().month, shiftDate.getUTCMilesianDate().date,
		shiftDate.getUTCHours(), shiftDate.getUTCMinutes(), shiftDate.getUTCSeconds() );

	var dateComponent = shiftDate.getUTCMilesianDate();	// Initiate a date decomposition in Milesian, to be used several times in subsequent code

	// Update milesian field selector - using Date properties
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;
	
	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;

	// Write Milesian date string, near the clock (without time)
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = shiftDate.toUTCIntlMilesianDateString() // the international notation, not sensitive to browsers nor languages								//toMilesianLocaleDateString
		//if necessary, the format options are: (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
	
	// Display julio-gregorian date 
	// Translate to Julian if before date of switch to Gregorian calendar

	if (shiftDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		dateComponent = shiftDate.getUTCJulianDate()		// dateComponent object set to Julian date
	else { 												// else, dateComponent set to (standard) Gregorian coordinates
		dateComponent.year  = shiftDate.getUTCFullYear();
		dateComponent.month = shiftDate.getUTCMonth();
		dateComponent.date	= shiftDate.getUTCDate();
		};
	myElement = document.getElementById("juliogregdate");
	let weekdayFormat = new Intl.DateTimeFormat("fr",{timeZone:"UTC",weekday:"long"});
	let  weekday = ""; // by default
	try {	// weekday in a safe manner, even on MS Edge
		weekday = weekdayFormat.format(shiftDate) ;
		}
	catch (e) {
		weekday = "";
		}
	myElement.innerHTML = 
		weekday
		+ " "
		+ (dateComponent.date) + " "	// Date in the month
		+ romanMonthNames.fr[dateComponent.month] + " "	// Name of the month, in French
		+ (dateComponent.year > 0 ? dateComponent.year : ((-dateComponent.year + 1) + " av. J.-C."));

	// Update settings (date of switching to gregorian calendar)
	document.gregorianswitch.year.value = gregorianSwitch.getUTCFullYear();
	document.gregorianswitch.monthname.value = gregorianSwitch.getUTCMonth();
	document.gregorianswitch.day.value = gregorianSwitch.getUTCDate();
	
	// Date conversion frame - other calendars than the Milesian
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = shiftDate.getUTCFullYear();
    document.gregorian.monthname.value = shiftDate.getUTCMonth();
    document.gregorian.day.value = shiftDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	if (shiftDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal
	

    //  Update Julian Calendar - using Date properties 
	dateComponent = shiftDate.getUTCJulianDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = shiftDate.getUTCFrenchRevDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	if (shiftDate.valueOf() >= upperRepublicanDate.valueOf()
		|| shiftDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	//  Update ISO week calendar - using Date properties
	dateComponent = shiftDate.getUTCIsoWeekCalDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	if (shiftDate.valueOf() < gregorianSwitch.valueOf() ) 	// If target date is before gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	// Set Julian Day 
   	document.daycounter.julianday.value = targetDate.getJulianDay();
	
	// Chronological fields frame
	
	// Display chronological counts
	myElement = document.querySelector("#unixCountDisplay");
	myElement.innerHTML = targetDate.valueOf().toLocaleString();
	myElement = document.querySelector("#jdDisplay");
	myElement.innerHTML = targetDate.getCount("julianDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#mjdDisplay");
	myElement.innerHTML = targetDate.getCount("modifiedJulianDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#nasajdDisplay");
	myElement.innerHTML = targetDate.getCount("nasaDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#windowsCountDisplay");
	myElement.innerHTML = targetDate.getCount("windowsCount").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#MacOSCountDisplay");
	myElement.innerHTML = targetDate.getCount("macOSCount").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#weekDisplay");
	myElement.innerHTML = targetDate.toIsoWeekCalDateString();

	
	// Unicode frame 
	myElement = document.querySelector("#langCode");
	// Display Locale (language code only) as obtained after negotiation process
	myElement.innerHTML = userOptions.locale.includes("-u-") ? userOptions.locale.substring (0,userOptions.locale.indexOf("-u-")) : userOptions.locale ;		
	myElement = document.querySelector("#CalendarCode");
	myElement.innerHTML = userOptions.calendar;	// Display calendar obtained after negotiation process
	myElement = document.querySelector("#timeZone");
	myElement.innerHTML = userOptions.timeZone;	// Display time zone as obtained after negotiation process
	
	// Print Unicode string, following already computed options.
 
	let valid = true; 	// Flag the few cases where calendar computations under Unicode yield a wrong result
	// Certain Unicode calendars do not give a proper result: set the flag.
	switch (userOptions.calendar) {	
		case "hebrew": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
		case "indian": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf() 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -42521673600000); break; // Computations are false before Haegirian epoch
		case "islamic-umalqura": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -6227305142400000); break; // Computations are false before 2 6m -195366
		}
	//	Write date string. Catch error if navigator fails to handle writing routine (MS Edge)
	myElement = document.getElementById("UnicodeString");
	try { myElement.innerHTML = (valid ? askedOptions.format(targetDate) : milesianAlertMsg("invalidDate")); } // Plutôt que targetDate.toLocaleTimeString(Locale,Options)
	catch (e) { myElement.innerHTML = milesianAlertMsg("invalidDate"); }

	//	Milesian date string following options. Catch error if navigator fails, in this case write without time part.
	myElement = document.getElementById("milesianDisplay");
	try	{ myElement.innerHTML = askedOptions.milesianFormat(targetDate); } // .toMilesianLocaleDateString(userOptions.locale,Options);
	catch (e) { myElement.innerHTML = milesianAlertMsg("bowserError"); }
	
	// Lunar data frame

	// Update lunar parameters - using targetDate
	dateComponent = targetDate.getCEMoonDate();
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	document.moon.height.value = targetDate.getDraconiticHeight().toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});
	document.moon.moontime.value = targetDate.getLunarTime().hours + "h " 
				+  ((targetDate.getLunarTime().minutes < 10) ? "0" : "") + targetDate.getLunarTime().minutes + "mn "
				+  ((targetDate.getLunarTime().seconds < 10) ? "0" : "") + targetDate.getLunarTime().seconds + "s";
	document.moon.moondate.value = targetDate.getLunarDateTime().date + " " 
				+  (++targetDate.getLunarDateTime().month) + "m";

	dateComponent = shiftDate.getCELunarDate();				
	document.moon.CElunardate.value = 	dateComponent.date;
	document.moon.CElunarmonth.value = 	++dateComponent.month;
	document.moon.CElunaryear.value = 	dateComponent.year;
	dateComponent = shiftDate.getHegirianLunarDate();	
	document.moon.hegiriandate.value = 	dateComponent.date;
	document.moon.hegirianmonth.value = ++dateComponent.month;
	document.moon.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT);
	
	// Display UTC date & time
	myElement = document.getElementById("UTCdate");
	myElement.innerHTML = targetDate.toUTCIntlMilesianDateString();
	myElement = document.getElementById("UTCtime");
	myElement.innerHTML = 
	  targetDate.getUTCHours() + "h "
	  + ((targetDate.getUTCMinutes() < 10) ? "0" : "") + targetDate.getUTCMinutes() + "mn " 
	  + ((targetDate.getUTCSeconds() < 10) ? "0" : "") + targetDate.getUTCSeconds() + "s";
	// This variant makes a bug with MS Edge, if outside the range of handled values :
	/*	targetDate.toLocaleTimeString
		(Locale,{timeZone: "UTC", hour12: false}); */

}
