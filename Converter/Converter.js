/* Converter functions 
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
*	RealTZmsOffset
2. For conversions
*	MilesianDateProperties
*	JulianDateProperties
*	FrenchRevDateProperties
*	IsoWeekCalendarDateProperties
*	LunarDateProperties
*	ChronologicalCountConversion
3. For clock operation
*	MilesianClockOperations
*	SeasonOnClock
*	Seasons
4. For display, using Unicode standards
*	UnicodeBasic
*	UnicodeMilesianFormat (used to be: UnicodeMilesian, and even before: toMilesianLocaleDateString)
*	UnicodeJulianFormat
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
Version M2018-04-11
* 	First version, after Milesian Clock Display
Version M2018-05-13
*	User may specify display language
Version M2018-05-30
*	Enhance / bug fix
Version M2018-10-26
*	Update reference to UTC date getters
Version M2018-10-29
*	New choices for date string display
Version M2018-11-02
*	Catch out-of-range errors
*	Catch display error on Unicode Um-al-Qura calendar
Version M2018-11-03
*	Add control of date of switching to Gregorian calendar
*	Add validity control of entered dates
Version M2019-03-04
*	Insert error check sequences for "New" dates and formatted dates - used for limitations set by Ms Edge
Version M2019-06-12
* 	Enhance marks for non-valid dates of calendars
*	Change name of chronological counts
Version M2019-08-06
	Display integer moon age
Version M2019-08-22
	Display seasons' mark on clock dial
Version M2019-12-23
	Use an external function of UnicodeBasic to filter bad calendrical computation cases
Version M2020-01-12
	Use strict
	Adapt to new Julian calendar format function
*/
/* Copyright Miletus 2017-2019 - Louis A. de Fouquières
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
"use strict";
var 
	justNow = new Date(),
	targetDate = new Date(Date.UTC(justNow.getFullYear(),justNow.getMonth(),justNow.getDate(),0,0,0,0)),	// target date will be used to update everything
	gregorianSwitch =  		// Settings: date where the Gregorian calendar was enforced (in Rome) 
		new Date (Date.UTC(1582, 11, 20, 0, 0, 0, 0)), 
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)); // Upper limit of the Republican calendar

function setDisplay () {	// Disseminate targetDate and time on all display fields
	
	// Get Milesian date components from targetDate
	let dateComponent = targetDate.getUTCMilesianDate();

	// Set Milesian clock
	let myElement = document.querySelector("#clock3"),
		myCollection;	// work variable used later
	setMilesianCalendarClockHands (myElement, dateComponent.year, dateComponent.month, dateComponent.date);
	myElement.querySelector(".moonage").innerHTML = targetDate.getCELunarDate().date;
	setSeasonsOnClock (myElement, dateComponent.year);

	// Update milesian field selector - using Date properties
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;

	// Write date strings near the clock, using Unicode and Unicode-derived routines
	var labelDate = new Intl.DateTimeFormat (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
	// Write Milesian date string near the clock (another one is among the Unicode calendars)
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = labelDate.milesianFormat (targetDate);
	
	// Display julio-gregorian date. Use standard Unicode or UnicodeJulianFormat. 
	// Translate to Julian if before date of switch to Gregorian calendar

	myElement = document.getElementById("juliogregdate");
	if (targetDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.innerHTML 
			= new Intl.DateTimeFormat (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric",era:"short"}).julianFormat(targetDate)
	else
		try {myElement.innerHTML = labelDate.format(targetDate);}
		catch (error) { myElement.innerHTML = milesianAlertMsg ("browserError"); };

	// Update settings (date of switching to gregorian calendar)
	document.gregorianswitch.year.value = gregorianSwitch.getUTCFullYear();
	document.gregorianswitch.monthname.value = gregorianSwitch.getUTCMonth();
	document.gregorianswitch.day.value = gregorianSwitch.getUTCDate();

    //  Update Gregorian Calendar - using standard JS date methods
    document.gregorian.year.value = targetDate.getUTCFullYear();
    document.gregorian.monthname.value = targetDate.getUTCMonth();
    document.gregorian.day.value = targetDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	myCollection = myElement.getElementsByClassName("mutable");
	if (targetDate.valueOf() < gregorianSwitch.valueOf())	// If target date is before Gregorian calendar was enforced 
		for (let i = 0; i < myCollection.length; i++)		// then mark that calendar was not valid
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds")
	else 				// else remove mark: display shall be normal
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	;
	
    //  Update Julian Calendar - using Date properties 
	dateComponent = targetDate.getUTCJulianDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = targetDate.getUTCFrenchRevDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	myCollection = myElement.getElementsByClassName("mutable");
	if (targetDate.valueOf() >= upperRepublicanDate.valueOf()
		|| targetDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		for (let i = 0; i < myCollection.length; i++)		// then mark that calendar was not valid
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds")
	else 				// else remove mark: display shall be normal
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	;

	//  Update ISO week calendar - using its Date properties
	dateComponent = targetDate.getUTCIsoWeekCalDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	myCollection = myElement.getElementsByClassName("mutable");
	/* As of 2019-12-23: we do not mark this calendar as "not valid", as no confusion is reasonably possible
	if (targetDate.valueOf() < gregorianSwitch.valueOf())	// If target date is before Gregorian calendar was enforced 
		for (let i = 0; i < myCollection.length; i++)		// then mark that calendar was not valid
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds")
	else 				// else remove mark: display shall be normal
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	;
	*/

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
	myElement = document.querySelector("#spreadSheetsCountDisplay");
	myElement.innerHTML = targetDate.getCount("sheetsCount").toLocaleString();
	myElement = document.querySelector("#MacOSCountDisplay");
	myElement.innerHTML = targetDate.getCount("macOSCount").toLocaleString();

	// Handle Intl.DateTimeFormat elements only here, in case browser does not handle this built-in
	// User Locale and Options used 
	var Locale = document.LocaleOptions.Language.value; // Read language code as specified by user
	try {		// Try finding the effective language string
	var askedOptions = 
		Locale == "" ? new Intl.DateTimeFormat() : new Intl.DateTimeFormat (Locale);
	}
	catch (e) {	// Locale was not a valid language code
		alert (milesianAlertMsg("invalidCode") + '"' + Locale + '"');
		document.LocaleOptions.Language.value = '';  // Set Language code to empty string
		askedOptions = new Intl.DateTimeFormat();
		} 
	let userOptions = askedOptions.resolvedOptions();
	Locale = userOptions.locale; 
	if (Locale.includes("-u-"))		// The Unicode extension ("-u-") is indicated in the specified locale, drop it
	Locale = Locale.substring (0,Locale.indexOf("-u-"));

	// Display Locale (only language part)
	myElement = document.querySelector("#langCode");
	myElement.innerHTML = Locale;	// Display Locale as obtained after negotiation process
	
	switch (document.LocaleOptions.Presentation.value) {
		case "long" :
			userOptions = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "long", timeZone : "UTC"}; 
			break;
		case "standard":
			userOptions = {weekday : "long", day : "numeric", month: "long", year : "numeric", timeZone : "UTC"};
			break;
		case "short":
			userOptions = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "short", timeZone : "UTC"};
			break;
		case "narrow":
			userOptions = {weekday : "narrow", day : "numeric", month: "narrow", year : "2-digit", timeZone : "UTC"};
			break;	
		case "numeric" : 
			userOptions = {weekday : "short", day : "numeric", month: "numeric", year : "numeric", era : "short", timeZone : "UTC"}; 
			break;
		case "numericwoera" : 
			userOptions = {weekday : "narrow", day : "2-digit", month: "2-digit", year : "numeric", timeZone : "UTC"}; 
			break;
		}
	// Set Milesian date string wherever needed
	let milesianOptions = new Intl.DateTimeFormat(Locale,userOptions);
	let myElements = document.getElementsByClassName('milesiandate'); 	// List of date elements to be computed
	// myElements.forEach ( function(val, ind, tab) {tab[ind].innerHTML = milesianOptions.milesianFormat(targetDate)} ); // why this does not work ?
	for (let i = 0; i < myElements.length; i++) {
	myElements[i].innerHTML = milesianOptions.milesianFormat(targetDate);
	}
	
	//	Display dates in several calendars provided by Unicode
	myElements = document.getElementsByClassName('unicodedate'); 	// List of date elements to be computed
	for (let i = 0; i < myElements.length; i++) {
		// myElements[i].id is the ID of the Element, which is the Unicode name of the calendar

		// re-initiate Option variable following user's setting
		let Options = Object.assign({}, userOptions);
		
		// Check that browser will display an interesting calendar, considering the language asked
		let displayedCalendar = unicodeCalendarHandled (myElements[i].id,Locale);
		if (displayedCalendar == myElements[i].id 	// the displayed calendar is as expected ...
			|| displayedCalendar != "gregory"	// ... or at least is not the plain gregory one...
			|| displayedCalendar != new Intl.DateTimeFormat(Locale).resolvedOptions().calendar )	{ // ... nor the default one for that language
		//	test validity since a few calendar do not display properly if out of range
		//	and arrange Options: delete era element for a calendar which does not use it.
			let valid = unicodeValidDateinCalendar(targetDate, "UTC", myElements[i].id);
			if (myElements[i].id == "ethioaa") delete Options.era; // suppress era part of Options, since the displayed era is "ERA0"
			
			// Write date string. Protect writing process against errors raised by browsers.
			try {
				myElements[i].innerHTML = 
				(valid ? new Intl.DateTimeFormat(Locale+"-u-ca-"+myElements[i].id, Options).format(targetDate)  //.toLocaleDateString(Locale+"-u-ca-"+myElements[i].id,Options)
						: milesianAlertMsg("invalidDate"));
				}
			catch (e) {	// In case the browser raises an error
				myElements[i].innerHTML = milesianAlertMsg("browserError");
				}
			}
		else myElements[i].innerHTML = "(" + displayedCalendar + ")"; // Calendar displayed is a default one.
		}
}