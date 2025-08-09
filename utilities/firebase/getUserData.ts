import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export async function getUserData(){
    onAuthStateChanged(auth, (user) => {
        if (user){
            return user.displayName as string;
        }
        else{
            return null;
        }
    })
}