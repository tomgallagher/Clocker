import Dexie from 'dexie';

const localdb = new Dexie('jobDatabase');
//set up the database with the required fields - this is where we add fields in a second version so we can update users' databases
localdb.version(1).stores({
    jobs: '++id,name,browserName,operatingSystem,operatingSystemVersion,unique_id,database_id,createdAt,updatedtAt',
});

export default localdb;
