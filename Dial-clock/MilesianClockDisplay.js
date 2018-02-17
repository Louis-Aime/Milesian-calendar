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
*	UnicodeMilesian (used to be: toMilesianLocaleDateString)
*	MilesianMonthNameString (indirectly - or access to the name base in XML)
*/
/*
Version M2018-01-04 :
*	Display julio-gregorian date 
*	Red background when displayed date is outside validity
Version M2018-02-29
*	New modes (UTC, time zone or special offset) to manage date and time.
*	Specify time zone for Unicode part, giving access to numerous "local" times.
*	Enhance control of calendar validity.
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
	gregorianSwitch = { 		// Settings: date where the Gregorian calendar was enforced (may change from one country to the other) 
		year : 1582, month : 11, date : 30 }, // Values for France, on initialisation. In principle, should be fetched from Unicode.
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)); // Upper limit of the Republican calendar
		// Caveat with these limits: it is assumed that the timezone cannot be changed during a session.
	TZSettings = {mode : "TZ", offset : 0, msoffset : 0};	// initialisation to be superseded

function setDisplay () {	// Disseminate targetDate and time on all display fields

	let dateComponent;	// Local result of date decomposition process, used several times
	// Initiate mode from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
	// Timezone offset for next computations - opposite if JS offset.
	switch (TZSettings.mode) {
		case "TZ" : document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset();
		// If TZ mode, Copy computed TZOffset into TZSettings fur future computations
		case "Fixed" : TZSettings.offset = -document.TZmode.TZOffset.value; break;
		// If UTC mode, set computation offset to 0, but set displayed field to TZ value
		case "UTC" : TZSettings.offset = 0; document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset(); 	
	}
	TZSettings.msoffset = TZSettings.offset * Chronos.MINUTE_UNIT; // Small computation made ounce for all
	// Initiate milesian clock and milesian string with present time and date
	let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// This date is shifted as desired
	let myElement = document.querySelector("#clock2");
	setSolarYearClockHands (myElement, shiftDate.getMilesianUTCDate().year, shiftDate.getMilesianUTCDate().month, shiftDate.getMilesianUTCDate().date,
		shiftDate.getUTCHours(), shiftDate.getUTCMinutes(), shiftDate.getUTCSeconds() );

	// Main frame fields

	// Update milesian field selector - using Date properties
	dateComponent = shiftDate.getMilesianUTCDate();		// Get date-time component from shiftDate, following desired time zone
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;
	
	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;
	
	// Set Milesian date string (just under clock dial)
	myElement = document.getElementById("milesiandate");
	myElement.innerHTML = shiftDate.toMilesianLocaleDateString
		(undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});

	// Display standard date in non-editable part
	// Translate to julian if before (local) date of switch to Gregorian calendar
	let gregSwitchDate = new Date; 
	gregSwitchDate.setUTCTimeFromMilesian (gregorianSwitch.year, gregorianSwitch.month, gregorianSwitch.date, 0, 0, 0, 0); 
		// gregSwitchDate is date where Gregorian calendar was enforced, in displayed value. Julian calendar was used before this date.
	if (shiftDate.valueOf() < gregSwitchDate.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		dateComponent = shiftDate.getJulianUTCDate()		// dateComponent object set to Julian date-time
	else { 												// else, dateComponent set to (standard) Gregorian coordinates
		dateComponent.year  = shiftDate.getUTCFullYear();
		dateComponent.month = shiftDate.getUTCMonth();
		dateComponent.date	= shiftDate.getUTCDate();
		};
	myElement = document.juliogregdate;
	myElement.year.value = dateComponent.year;
	myElement.monthname.value = dateComponent.month;
	myElement.day.value = dateComponent.date;

	// Update settings
	document.gregorianswitch.year.value = gregorianSwitch.year;
	document.gregorianswitch.monthname.value = gregorianSwitch.month;
	document.gregorianswitch.day.value = gregorianSwitch.date;
	

	// Date conversion frame
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = shiftDate.getUTCFullYear();
    document.gregorian.monthname.value = shiftDate.getUTCMonth();
    document.gregorian.day.value = shiftDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	if (shiftDate.valueOf() < gregSwitchDate.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal
	

    //  Update Julian Calendar - using Date properties 
	dateComponent = shiftDate.getJulianUTCDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = shiftDate.getFrenchRevUTCDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	if (shiftDate.valueOf() >= upperRepublicanDate.valueOf()
		|| shiftDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	//  Update ISO week calendar - using its Date properties
	dateComponent = shiftDate.getIsoWeekCalUTCDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	if (shiftDate.valueOf() < gregSwitchDate.valueOf() ) 	// If target date is before gregorian calendar was enforced 
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
	document.moon.CElunardate.value = 	Math.ceil(dateComponent.age);
	document.moon.CElunarmonth.value = 	++dateComponent.month;
	document.moon.CElunaryear.value = 	dateComponent.year;
	dateComponent = targetDate.getHegirianMoonDate();	
	document.moon.hegiriandate.value = 	Math.ceil(dateComponent.age);
	document.moon.hegirianmonth.value = ++dateComponent.month;
	document.moon.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT);
	
	// Navigation frame

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
	
	// Unicode frame - this frame is handled with putStringOnOptions

	// Display date string, following options
	putStringOnOptions();				

}
