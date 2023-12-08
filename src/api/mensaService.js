import  {addMensas ,getAllmensas} from '../db/indexedDB.js';

// returns the berlin mensas in json and adds them to the indexDB
export async function getMensasFromApi() {
  console.log('getMensasFromApi start')
    var axios = require('axios')
    //api key & apix must be moved to an env. file later
    var apikey ='IvWJWBBclzlN8mOxN9X8NUWhnpc2LmjM3riXZlxqV0J2VjQsIu1Qh78TrqWVs57f515kDI7qIYbnTuVY8qM3WN/jeqJsS8M5I9C3rTUYUP8hqbCE6chgwWo4rLyyre1AxoO2pYf/vE+L3ZF2Smhxye+xneea/6u+DSlUHR/eF2ZKks4Byh/OQDp9kNlix20/ajoPGF0FWqGb5ru0okcXIBmDGYr6srvbUmyWoRkgB9TBymT1G76DfH8VdvYcpbMVKwqZtYxrmfjFJAgPBPytGFL0tmMV+frIbt2NIRB0pwFt5Y1Li/Se5pFJ1C+xZj6uPeIG+AaHfZun8vqlxTZtOA=='
    var apix = 'https://mensa.projekt-ipa.tech/api/v1/canteen?loadingtype=lazy&district='
    try {
    const berlinDistricts = [
    'Reinickendorf',
    'Friedrichshain-Kreuzberg',
    'Pankow',
    'Charlottenburg-Wilmersdorf',
    'Spandau',
    'Steglitz-Zehlendorf',
    'Tempelhof-Schöneberg',
    'Neukölln',
    'Treptow-Köpenick',
    'Marzahn-Hellersdorf',
    'Lichtenberg',
    'Mitte'
  ];
 
  //makes 12 api calls 
  let mensaData = []
  for (let i = 0; i < berlinDistricts.length; i++) {
    const response = await axios.get(`${apix}${berlinDistricts[i]}`, {
      headers: {
        'X-API-KEY': apikey, 
      },
    });
  // appends response to mensaData, its the list of berlins mensas
  mensaData = [...mensaData, ...response.data];
   }
   //add all mensas to the db check '../db/indexedDB.js'
   addMensas(mensaData)
  console.log('getMensasFromApi end')
  return mensaData
//  this.mensaData = this.mensaData.concat(tempData);
  } catch (error) { console.error(error); }

  
}
//gets the list of berlin mensas from the indexdb
export async function getMensasFromDB() {
 console.log('getmensadb called in mensarservice.js')
  return getAllmensas()
}