
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAIpWj5NnCl8HlZ0P6dIqEQxWtE_2Ng1hE",
  authDomain: "modifierapp-89f84.firebaseapp.com",
  projectId: "modifierapp-89f84",
  storageBucket: "modifierapp-89f84.appspot.com",
  messagingSenderId: "1001280088962",
  appId: "1:1001280088962:web:c83b96ce5e0fd26d3a3d9b"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);