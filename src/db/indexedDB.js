import { openDB as idbOpenDB } from 'idb';


// opens db connection and returns a db
export async function openDB() {
  console.log('opendDB start')
  const db = await idbOpenDB('my-database', 1, {
    upgrade(db) {
      //if there is no mensas db it creates one
      if (!db.objectStoreNames.contains('mensas')) {
        console.log('upgradeDB add new shit indexedb start')
        //key is mensa.name since i dont get ids via the api lazy get request
        db.createObjectStore('mensas', { keyPath: 'mensa.id', autoIncrement: true });
      }
    },
  });
  return db;
}
export async function openMenueDB(){
  console.log('menue db start')
  const db = await idbOpenDB('my-database',1 ,{
    upgrade(db){
      if(!db.objectStoreNames.contains('menues')){
        console.log('menue db existiert nicht wird kreiert')
        db.createObjectStore('menues',{keyPath: ["canteenId", "date"]})
      }
    }
  })
  return db;
}

  // Add multiple mensas to the database
  export async function addMensas(mensas) {
    console.log('addMensas indexedb start')
    const db = await openDB();
    const tx = db.transaction('mensas', 'readwrite');
    const store = tx.objectStore('mensas');
    
  //  for (const mensa of mensas) {   await store.add(mensa);    }
  for (const mensa of mensas) {
    // Add the favorite field with default false for using favorite system
    //Add distance as well
    const updatedMensa = { ...mensa, favorite: false , distance: 0 };

    await store.add(updatedMensa);
  }    
    await tx.complete;
  }

  
  // Add an mensa to the database
  // not used
  export async function addmensa(mensa) {
    const db = await openDB();
    const tx = db.transaction('mensas', 'readwrite');
    const store = tx.objectStore('mensas');
    await store.add(mensa);
    await tx.complete;
  }
  export async function addMenue(menue,date,canteenId){
    const db = await openMenueDB();
    const tx = db.transaction('menues','readwrite');
    const store = tx.objectStore('menues')
    const key = `${date}-${canteenId}`; // Create a unique key for the menu
    await store.add(menue, key);
    await store.add(menue)
    await tx.complete
  }
  
  // Get all mensas from the database
  //returns a json of berlin mensas
  export async function getAllmensas() {
    console.log('getAllmensas indexedb start')
    const db = await openDB();
    const tx = db.transaction('mensas', 'readonly');
    const store = tx.objectStore('mensas');
    const mensas = await store.getAll();
    return mensas;
  }
  
  // Update an mensa in the database
  // BUG SOMETIMES IT CREATES A NEW MENSA INSTEAD OF UPDATING IT???
  export async function updatemensa(mensa) {
   console.log('updatemensa start');
    const db = await openDB();
    const tx = db.transaction('mensas', 'readwrite');
    const store = tx.objectStore('mensas');
  
    const clonedMensa = JSON.parse(JSON.stringify(mensa));
  
    try {
      //added clonedMensa.id to fix bug
      //      await store.put(clonedMensa,clonedMensa.id);

      await store.put(clonedMensa);
      await tx.complete;
     // console.log('Mensa updated successfully');
    } catch (error) {
      console.error('Error updating mensa:', error);
    }
  
    //console.log('updatemensa end');
  }
  
  
  
  // Delete an mensa from the database
  //not used 
  export async function deletemensa(id) {
    const db = await openDB();
    const tx = db.transaction('mensas', 'readwrite');
    const store = tx.objectStore('mensas');
    await store.delete(id);
    await tx.complete;
  }
  