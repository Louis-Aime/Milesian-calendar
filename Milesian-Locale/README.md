#Milesian Locale: compute Milesian date string following CLDR project model.
The content are experimental, and shall be refined until integration to CLDR is possible.
##MilesianMonthNames.xml : the database of Milesian month names in different languages
Structure is as recommended by CDLR.
##toMilesianString.js ([Locale,[Options]]) : a method for the Date object
MilesianDateProperties.js is used.
This Date method fetches MilesianMonthNames in order to generate the string as specified with Locale and Options 
(see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString] for details).
