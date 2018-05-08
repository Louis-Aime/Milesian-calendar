// MilesianAlertMsg
// Language dependant messages to be used with Milesian demonstrator routines
// This version UTF-8 to be recoded as necessary
// M2017-12-23
//  Changes from M2017-08:
//		Delete MilesianAlertMsg object (not used anymore)
//		Suppress ":" at end of messages, but leave " " (blank character)
//  Changes M2018-05
//		Enhance messages in German
//		New entry: invalid code
/* Copyright Miletus 2016-2017 - Louis A. de Fouquières
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 1. The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 2. Changes with respect to any former version shall be documented.
//
// The software is provided "as is", without warranty of any kind,
// express of implied, including but not limited to the warranties of
// merchantability, fitness for a particular purpose and noninfringement.
// In no event shall the authors of copyright holders be liable for any
// claim, damages or other liability, whether in an action of contract,
// tort or otherwise, arising from, out of or in connection with the software
// or the use or other dealings in the software.
// Inquiries: www.calendriermilesien.org
*/
function milesianAlertMsg (inputError) {	// Prepare an error message in suitable language
	var	languages = [ "en", "fr", "de", "es", "pt" ];
	var errorMsg = {
		"nonNumeric" : { 
			en	: "Non numeric entry ",
			fr	: "Entrée non numérique ",
			de	: "Nicht numerische Eingabe ",
			es	: "Entrada no numérica ",
			pt	: "Entrada não numérica "
			},
		"nonInteger" : {
			en	: "Non integer entry ",
			fr	: "Entrée non entière ",
			de	: "Nicht ganzzahlige Zahl",
			es	: "Entrada no entera ",
			pt	: "Entrada não inteira "
			},
		"invalidDate" : {
			en	: "Invalid date or time ",
			fr	: "Date ou heure non valide ",
			de	: "Ungültiges Datum oder Uhrzeit ",
			es	: "Fecha o hora no válida ",
			pt	: "Data ou hora inválida "
			},
		"invalidCode" : {
			en	: "Invalid code ",
			fr	: "Code non valide ",
			de	: "Ungültiger Code ",
			es	: "Código inválido ",
			pt	: "Código inválido "
			}
		};
	let askedOptions = new Intl.DateTimeFormat(); let usedOptions = askedOptions.resolvedOptions(); // Current language... may be simplier.
	let lang = usedOptions.locale[0] + usedOptions.locale[1];
	let usedLang = "en";
	for (let i = 0; i < languages.length; i++) if (lang == languages[i]) usedLang = lang; // Set usedLang to one of our languages, else to "en".
	let message = errorMsg[inputError][usedLang];
	return message;
}