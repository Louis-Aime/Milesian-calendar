/* Roman months names
A simple function that gives the name of a Roman month (julian or gregorian calendar) in any language. 
This function is provided  because the Julian calendar is not yet implemented with Unicode
Copyright Louis A. de FOUQUIERES
Copy is possible without restriction
*/
var
	romanMonthNames = {
		fr : ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
	}


function romanMonthName (monthNum, monthDisplay='long', langDisplay) { // give the string for a month in the Roman calendar (Julian or Gregorian)
	// monthDisplay : the "month" option to be used for display, "long" (complete name) if undefined or if specified '' or null.
	// langDisplay : language part of the locale to be used. Default locale if left undefined.
	// if monthNum is invalid, an error is thrown (and not catched here).
	// if error trying to use Intl methods, the plain 2-digit month number is returned.
if (!Number.isInteger(monthNum) || monthNum < 0 || monthNum > 11) throw ("Invalid month index " + monthNum); 
if (monthDisplay == null || monthDisplay == '') monthDisplay = 'long';
try {
	var 
		monthFormatter = new Intl.DateTimeFormat(langDisplay, {month: monthDisplay, timeZone: 'UTC' }),
		locale = monthFormatter.resolvedOptions().locale;	// Fetch the negotiated locale after submitting langDisplay 
		// Change the calendar of locale to "gregory"  if not set by default
		if (monthFormatter.resolvedOptions().calendar != 'gregory' ) {
			locale = (locale.includes("-u-") 
				? 	(locale.substring(locale.indexOf("-u-")).includes("ca-") 
						? locale.substring (0,locale.indexOf("ca-",locale.indexOf("-u-")))
						: locale )
					+ "ca-"
				: locale + "-u-ca-"
				) + "gregory" ;
			monthFormatter = new Intl.DateTimeFormat(locale, {month: monthDisplay, timeZone: 'UTC' })
			}
		return monthFormatter.format(new Date(0).setUTCMonth(monthNum));
	}
catch (e) { // Whatever error thrown while trying to format...
	return monthNum >= 9 ? '' + (++monthNum) : '0' + (++monthNum)
	}
}
function romanEra (yearNum, eraDisplay = 'short', langDisplay) { // era BCE or AD for a numeric year in a Roman calendar (Julian or Gregorian)
	// eraDisplay : the "era" option to be used for display, "long" (complete name) if undefined or if specified '' or null.
	// langDisplay : language part of the locale to be used. Default locale if left undefined.
	// if year is invalid, an error is thrown (and not catched here).
	// if error trying to use Intl methods, the plain Latin era designation (AC-AD) is returned.
if (!Number.isInteger(yearNum)) throw ("Invalid year " + yearNum); 
if (eraDisplay == null || eraDisplay == '') eraDisplay = 'short';
try {
	var 
		eraFormatter = new Intl.DateTimeFormat(langDisplay, {era: eraDisplay, timeZone: 'UTC' }),
		locale = eraFormatter.resolvedOptions().locale;	// Fetch the negotiated locale after submitting langDisplay 
		// Change the calendar of locale to "gregory"  if not set by default
		if (eraFormatter.resolvedOptions().calendar != 'gregory' ) {
			locale = (locale.includes("-u-") 
				? 	(locale.substring(locale.indexOf("-u-")).includes("ca-") 
						? locale.substring (0,locale.indexOf("ca-",locale.indexOf("-u-")))
						: locale )
					+ "ca-"
				: locale + "-u-ca-"
				) + "gregory" ;
			eraFormatter = new Intl.DateTimeFormat(locale, {era: eraDisplay, timeZone: 'UTC' })
			}
		return eraFormatter.formatToParts(new Date(0).setUTCFullYear(yearNum)).pop().value;
	}
catch (e) { // Whatever error thrown while trying to format...
	return yearNum <= 0 ? 'AC' : 'AD';
	}	
}