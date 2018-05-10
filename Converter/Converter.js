/* Converter functions (- part 1 ?)
Character set is UTF-8.
These functions are associated with the ConverterClock html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.

Note: as much as possible, the scripts are directly inserted in the html page, since:
- no (known) size limit for HTML file
- strong adequation easier if code is in HTML file itself.

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
*	UnicodeMilesianFormat (used to be: UnicodeMilesian, and even before: toMilesianLocaleDateString)
*	MilesianMonthNameString (indirectly - or access to the name base in XML)
*	RomanMonthNames
*/
/*
Version M2018-01-04 :
*	Display julio-gregorian date 
*	Red background when displayed date is outside validity
Version M2018-02-29
*	New modes (UTC, time zone or special offset) to manage date and time.
*	Specify time zone for Unicode part, giving access to numerous "local" times.
*	Enhance control of calendar validity.
Version M2018-04-11
* 	First version, after Milesian Clock Display
Version M2018-05-13
*	User may specify display language
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
	justNow = new Date(),
	targetDate = new Date(Date.UTC(justNow.getFullYear(),justNow.getMonth(),justNow.getDate(),0,0,0,0)),	// target date will be used to update everything
	gregorianSwitch =  		// Settings: date where the Gregorian calendar was enforced (in Rome) 
		new Date (Date.UTC(1582, 9, 15, 0, 0, 0, 0)), 
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)); // Upper limit of the Republican calendar

function setDisplay () {	// Disseminate targetDate and time on all display fields

	// User Locale and Options used for the Unicode section only
	var Locale = document.LocaleOptions.Language.value; // Read language code as specified by user
	try {		// Try finding the effective language string
	var askedOptions = 
		Locale == "" ? new Intl.DateTimeFormat() : new Intl.DateTimeFormat (Locale);
	}
	catch (e) {	// Locale was not a valid language code
		alert (milesianAlertMsg("invalidCode") + '"' + Locale + '"');
		document.LocaleOptions.Language.value = '';  // Set Language code to empty string
		return; } // exit function after this error.
	let userOptions = askedOptions.resolvedOptions();
	Locale = userOptions.locale; // Locale = userOptions.locale.slice(0,5);
	let myElement = document.querySelector("#langCode");
	myElement.innerHTML = Locale;	// Display Locale as obtained after negotiation process
	
	switch (document.LocaleOptions.Presentation.value) {
		case "long" :
			userOptions = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "long", timeZone : "UTC"}; 
			break;
		case "numeric" : 
			userOptions = {day : "2-digit", month: "2-digit", year : "numeric", era : "short", timeZone : "UTC"}; 
			break;
		}
		
	// Get Milesian date components from targetDate
	let dateComponent = targetDate.getMilesianUTCDate();

	// Set Milesian clock
	myElement = document.querySelector("#clock3");
	setSolarYearClockHands (myElement, dateComponent.year, dateComponent.month, dateComponent.date);

	// Update milesian field selector - using Date properties
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;

	// Set Milesian date string wherever needed
	let milesianLocale = [undefined, Locale]; // First Milesian string shall be on blank Locale, second will be in specified language
	let myElements = document.getElementsByClassName('milesiandate'); 	// List of date elements to be computed
	for (let i = 0; i < myElements.length; i++) {
		interAskedOptions = new Intl.DateTimeFormat(milesianLocale[i],userOptions);
		myElements[i].innerHTML = interAskedOptions.milesianFormat(targetDate);
	}
	// Display standard date 
	// Translate to Julian if before initial date of switch to Gregorian calendar

	if (targetDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		dateComponent = targetDate.getJulianUTCDate()		// dateComponent object set to Julian date
	else { 												// else, dateComponent set to (standard) Gregorian coordinates
		dateComponent.year  = targetDate.getUTCFullYear();
		dateComponent.month = targetDate.getUTCMonth();
		dateComponent.date	= targetDate.getUTCDate();
		};
	myElement = document.getElementById("juliogregdate");
	let weekdayFormat = new Intl.DateTimeFormat("fr",{timeZone:"UTC",weekday:"long"});
	try {	// weekday in a safe manner, even on MS Edge
		var weekday = weekdayFormat.format(shiftDate) ;
		}
	catch (e) {
		weekday = "";
		}
	myElement.innerHTML = 
		weekday // weekday in a safe manner, even on MS Edge
		+ " "
		+ (dateComponent.date) + " "	// Date in the month
		+ romanMonthNames.fr[dateComponent.month] + " "	// Name of the month, in French
		+ (dateComponent.year > 0 ? dateComponent.year : ((-dateComponent.year + 1) + " av. J.-C."))	;

    //  Update Gregorian Calendar - using standard JS date methods
    document.gregorian.year.value = targetDate.getUTCFullYear();
    document.gregorian.monthname.value = targetDate.getUTCMonth();
    document.gregorian.day.value = targetDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	if (targetDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal
	
    //  Update Julian Calendar - using Date properties 
	dateComponent = targetDate.getJulianUTCDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = targetDate.getFrenchRevUTCDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	if (targetDate.valueOf() >= upperRepublicanDate.valueOf()
		|| targetDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	//  Update ISO week calendar - using its Date properties
	dateComponent = targetDate.getIsoWeekCalUTCDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	if (targetDate.valueOf() < gregorianSwitch.valueOf() ) 	// If target date is before gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	// Set Julian Day at 12h
   	document.daycounter.julianday.value = targetDate.getJulianDay() + 0.5; // All dates are at 0h, but Julian Day is at 12h
	
	// Chronological fields frame
	
	// Display chronological counts
//	myElement = document.querySelector("#unixCountDisplay");
//	myElement.innerHTML = targetDate.valueOf().toLocaleString();
	myElement = document.querySelector("#jdDisplay");
	myElement.innerHTML = targetDate.getCount("julianDayAtNight").toLocaleString(); // Shifted Julian Day, integer at 0H UTC
	myElement = document.querySelector("#mjdDisplay");
	myElement.innerHTML = targetDate.getCount("modifiedJulianDay").toLocaleString();
	myElement = document.querySelector("#nasajdDisplay");
	myElement.innerHTML = targetDate.getCount("nasaDay").toLocaleString();
	myElement = document.querySelector("#windowsCountDisplay");
	myElement.innerHTML = targetDate.getCount("windowsCount").toLocaleString();
	myElement = document.querySelector("#MacOSCountDisplay");
	myElement.innerHTML = targetDate.getCount("macOSCount").toLocaleString();

//	Display dates in several calendars provided by Unicode
	myElements = document.getElementsByClassName('unicodedate'); 	// List of date elements to be computed
	for (let i = 0; i < myElements.length; i++) {
		// myElements[i].id is the ID of the Element, which is the Unicode name of the calendar

		// re-initiate Option variable following user's setting
		let Options = Object.assign({}, userOptions);
		
		// Check that browser will display an interesting calendar
		if (unicodeCalendarHandled (myElements[i].id) == myElements[i].id 	// the asked calendar... 
			|| unicodeCalendarHandled (myElements[i].id) != "gregory")	{	// ... or at least a non plain gregory one
		
		//	test validity since a few calendar do not display properly if out of range
		//	and arrange Options: delete era element for calendar which do not use it.
			let valid = true;
			switch (myElements[i].id) {	
				case "hebrew": valid = (toLocalDate(targetDate, Options).valueOf()
					>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
				case "indian": valid = (toLocalDate(targetDate, Options).valueOf() 
					>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
				case "islamic":
				case "islamic-rgsa": valid = (toLocalDate(targetDate, Options).valueOf()
					>= -42521673600000); break; // Computations are false before Haegirian epoch
				case "ethiopic": valid = (toLocalDate(targetDate, Options).valueOf()
					>= -235492444800000); break; // Era is given in an ambiguous way for dates before the Amete Alem epoch
				case "ethioaa": Options.era = undefined; break; // suppress era part of Options, since the displayed era is "ERA0"
				}
			
			// Write date string. Protect writing process against errors raised by browsers.
			try {
				myElements[i].innerHTML = 
				(valid ? targetDate.toLocaleDateString(Locale+"-u-ca-"+myElements[i].id,Options) : milesianAlertMsg("invalidDate"));
				}
			catch (e) {	// Attempt to write time string may fail due to out-of-range error with MS Edge
				myElements[i].innerHTML = milesianAlertMsg("invalidDate");
				}
			}
		else myElements[i].innerHTML = milesianAlertMsg("browserError")
		}
}