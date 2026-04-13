import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "./firebase";
import bcrypt from "bcrypt";

const db = getFirestore(app);

export async function signUp(
  userData: {
    email: string;
    fullName: string;
    password: string;
    role?: string;
  },
  callback: Function,
) {
  const q = query(
    collection(db, "users"),
    where("email", "==", userData.email),
  );
  const querySnapshot = await getDocs(q);
  const existingUsers = querySnapshot.docs.map((doc) => doc.data());

  if (existingUsers.length > 0) {
    callback({
      status: "error",
      message: "Email sudah terdaftar!",
    });
  } else {
    try {
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.role = "user";

      await addDoc(collection(db, "users"), userData);

      callback({
        status: "success",
        message: "Registrasi berhasil!",
      });
    } catch (error: any) {
      callback({
        status: "error",
        message: "Terjadi kesalahan pada server.",
      });
    }
  }
}

export async function signIn(email: string) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return data.length > 0 ? data[0] : null;
}

export async function signInOAuth(userData: any, callback: Function) {
  try {
    const existingUser: any = await signIn(userData.email);

    if (existingUser) {
      userData.role = existingUser.role;
      await updateDoc(doc(db, "users", existingUser.id), userData);
      callback({
        status: true,
        message: "User successfully logged in",
        data: userData,
      });
    } else {
      userData.role = "user";
      await addDoc(collection(db, "users"), userData);
      callback({
        status: true,
        message: "New user registered and logged in",
        data: userData,
      });
    }
  } catch (error: any) {
    callback({
      status: false,
      message: "Failed to authenticate user",
    });
  }
}
