/* Milesian Clock and converter functions - excluding initialisation and global variables.
Character set is UTF-8.
Associated with: 
*	converter.html
*/
/*	Related
	converter.html
	milesianclockinitiate.js
	converteronload.js
	other modules have been made visible with the 'modules' object
*/
/* Version	M2021-08-29 - see GitHub for details
*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
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
/** A utility for the undefined fields
*/

function setDisplay () {	// Disseminate targetDate and time on all display fields
	
	// establish variables used only for this display cycle
	var
		dateComponent = targetDate.getFields(TZ),
		milDate = new modules.ExtDate (milesian, targetDate.valueOf()),
		mildateComponent = milDate.getFields(TZ),	// Initiate a date decomposition in Milesian, to be used several times in subsequent code
		myElement = document.querySelector("#mclock"),	// myElement is a work variable
		myCollection;	// Another work variable, used later

    //  Update custom calendar

    document.custom.year.value = dateComponent.fullYear;
    document.custom.month.value = dateComponent.month;
    document.custom.day.value = dateComponent.day;
	document.week.weekyear.value = targetDate.weekYear(TZ); 
	document.week.weeknumber.value = targetDate.weekNumber(TZ);
	document.week.weekday.value = targetDate.weekday(TZ);
	document.week.weeksinyear.value = targetDate.weeksInYear(TZ);
	document.week.dayofweek.value = weekFormat.format(targetDate);

	// Place marks that say that custom calendar was not valid
	myElement = document.querySelector("#customline");
	myCollection = myElement.getElementsByClassName("mutable");
	// first remove marks from another display
	for (let i = 0; i < myCollection.length; i++)
		myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	// Then check whether marks should be set
	if (typeof calendars[customCalIndex].valid == "function" && !calendars[customCalIndex].valid(dateComponent)) 
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds");

	// Julian Day and chronological fields
	let JD = new modules.ExtCountDate ("julianDayAtNight","iso8601",targetDate.valueOf()).getCount();
	document.daycounter.julianday.value = JD;
		// = JD.toLocaleString(undefined,{maximumFractionDigits:8}); // JD.toLocaleString(undefined,{useGrouping:false, maximumFractionDigits:8})

	// Display Locale (language code only) as obtained after negotiation process
	document.querySelector("#langCode").innerHTML = userOptions.locale.includes("-u-") 
		? userOptions.locale.substring (0,userOptions.locale.indexOf("-u-")) 
		: userOptions.locale ;

	//	Custom calendar date string following options. Catch error if navigator fails, in this case write without time part.
	document.getElementById("customcalname").innerHTML = askedOptions.calendar.id;
	myElement = document.getElementById("CustomString");
	try	{ myElement.innerHTML = askedOptions.format(targetDate); } 
	catch (e) { myElement.innerHTML = "ExtDateTimeFormat.format error: " + e; }

	// Write Milesian date string near dial
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = clockFormat.format(targetDate);
	// Finally update and display clock
	milesianClock.setHands (milDate, TZ); // Display date on clock.
	milesianClock.clock.querySelector(".moonage").innerHTML = modules.Lunar.getCELunarDate(targetDate, TZ).day;
	milesianClock.setSeasons (milDate.year("UTC")); // Display also seasons.

	//	Display dates in several calendars
	myCollection = document.getElementsByClassName('calenddate'); 	// List of date elements to be computed
	for (let i = 0; i < myCollection.length; i++) {
		// myCollection[i].id is the the name of the calendar, either Unicode or custom. select the calendar object among calendar list.
		let myCalendar = calendars.find ( (item) => (item.id == myCollection[i].id)  );	// case the calendar is among the custom calendars.
		if (myCalendar == undefined) myCalendar = myCollection[i].id;	// if not found, it should be a built-in one.
		let myOptions = {...userOptions}	// a copy, since passed options are changed. (bug to be addressed)
		// Write date string. Protect writing process against errors raised by browsers.
		try {
			myCollection[i].innerHTML = 
			 new modules.ExtDateTimeFormat(userOptions.locale, myOptions, myCalendar).format(targetDate);  // .format with conditional Era display. 
			}
		catch (e) {	// In case the browser raises an error
			myCollection[i].innerHTML = e;
			}
		}
}
