// utilities/firebase/loginUsers.ts
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function loginUsers(email: string, password: string) {

  try{
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);

    // check if user is verified
    if (!userCredentials.user.emailVerified){
        throw new Error("Please Verify your Email!");
    }
    return userCredentials
    
  } catch(err: any){
    throw new Error(err.message)
  }
}
