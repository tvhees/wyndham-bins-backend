import axios from "axios";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.APP_SERVICE_ACCOUNT);
const stage = process.env.APP_STAGE;
const collection = stage === 'production' ? 'features' : `features-${stage}`;
const firebaseConfig = {
    credential: admin.credential.cert(serviceAccount),
    apiKey: "AIzaSyB4RDTcIYiHW2ZR58-Wt6Bts0rH5QCJqzQ",
    authDomain: "wyndham-bins-data.firebaseapp.com",
    projectId: "wyndham-bins-data",
    storageBucket: "wyndham-bins-data.appspot.com",
    messagingSenderId: "584917108713",
    appId: "1:584917108713:web:95beb9e7cc5f5ff13f6d78"
};
const source = 'https://data.gov.au/data/dataset/08531201-ac9f-4f5f-bb7e-ac16b1da28b4/resource/15732b49-3e50-40ce-8dfd-0efed18661f4/download/sb_fill_lvel.json';

admin.initializeApp(firebaseConfig);
const db = admin.firestore();

const fetch = async (): Promise<any> => {
    console.log(`Fetching data from ${source} on stage ${stage}`);

    const data = await axios.get(source).then(response => response.data);

    console.log(`Sending data to firestore as '${collection}': `, data);

    await db.collection(collection).add({
        ...data,
        // This uses client timestamp - since we control the server and just want this for document ordering, that should be ok
        createdAt: admin.firestore.Timestamp.now()
    });
};

fetch().then(() => {
    console.log('Operation successful, exiting');
    process.exit(0);
});