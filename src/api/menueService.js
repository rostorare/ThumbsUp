//import { addMenues, getAllmenues } from '../db/indexedDB.js';

export async function getMenue(canteendId,startDate,endDate) {
    var apikey = 'IvWJWBBclzlN8mOxN9X8NUWhnpc2LmjM3riXZlxqV0J2VjQsIu1Qh78TrqWVs57f515kDI7qIYbnTuVY8qM3WN/jeqJsS8M5I9C3rTUYUP8hqbCE6chgwWo4rLyyre1AxoO2pYf/vE+L3ZF2Smhxye+xneea/6u+DSlUHR/eF2ZKks4Byh/OQDp9kNlix20/ajoPGF0FWqGb5ru0okcXIBmDGYr6srvbUmyWoRkgB9TBymT1G76DfH8VdvYcpbMVKwqZtYxrmfjFJAgPBPytGFL0tmMV+frIbt2NIRB0pwFt5Y1Li/Se5pFJ1C+xZj6uPeIG+AaHfZun8vqlxTZtOA=='

   // var apiy = 'https://mensa.projekt-ipa.tech/api/v1/menue?loadingtype=complete&canteenId=6375f3112e6cbe73bac78a89&startdate=2023-06-30'
    var axios = require('axios')
    try {
     //   let startDate = new Date().toISOString().split('T')[0];
        //for testing on sunday lol
      //  const tomorrowISO = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        //startDate =tomorrowISO
        console.log(startDate);
        const canteenId = canteendId
      // console.log(canteendId+'comic saans')
        //const endDate = startDate
     //   console.log(endDate)
        var apix = 'https://mensa.projekt-ipa.tech/api/v1/menue?loadingtype=complete&canteenId='+ canteenId + '&startdate=' + startDate + '&enddate='+ endDate
        const response = await axios.get(apix, {
            headers: {
                'X-API-KEY': apikey,
            },

        });
        console.log('responsii von menue')
        console.log(response.data)
    return response.data
    }catch(error){
        console.log(error)
    }

 }
 export async function getAllAdditives() {
     var apikey = 'IvWJWBBclzlN8mOxN9X8NUWhnpc2LmjM3riXZlxqV0J2VjQsIu1Qh78TrqWVs57f515kDI7qIYbnTuVY8qM3WN/jeqJsS8M5I9C3rTUYUP8hqbCE6chgwWo4rLyyre1AxoO2pYf/vE+L3ZF2Smhxye+xneea/6u+DSlUHR/eF2ZKks4Byh/OQDp9kNlix20/ajoPGF0FWqGb5ru0okcXIBmDGYr6srvbUmyWoRkgB9TBymT1G76DfH8VdvYcpbMVKwqZtYxrmfjFJAgPBPytGFL0tmMV+frIbt2NIRB0pwFt5Y1Li/Se5pFJ1C+xZj6uPeIG+AaHfZun8vqlxTZtOA=='

     var axios = require('axios')
     try {
         var apix = 'https://mensa.projekt-ipa.tech/api/v1/additive'
         const response = await axios.get(apix, {
             headers: {
                 'X-API-KEY': apikey,
             },

         });
         console.log('additives request')
         console.log(response.data)
         return response.data
     }catch(error){
         console.log(error)
     }
 }

