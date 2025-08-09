import { auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore();

/**
 * Registers a new user and saves their data to Firestore.
 * @param email - User email
 * @param password - User password
 * @param name - Full name
 * @param phone - Phone number
 */

export async function registerUser({
  email,
  password,
  name,
  phone,
}: {
  email: string;
  password: string;
  name: string;
  phone: string;
}) {
    const userCredential =await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;


    await updateProfile(user, {
        displayName: name,
    });

    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
    });

    return user;
}