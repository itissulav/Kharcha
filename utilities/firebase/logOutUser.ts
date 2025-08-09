import { auth } from "@/firebaseConfig";

export async function logOut(){
    const isLoggedIn = auth.currentUser;

    if (isLoggedIn){
        try{
            auth.signOut();
        }catch(err){
            alert("An unexpected Error Occured")
        }
    }else{
        alert("You need to Login First");
    }
}