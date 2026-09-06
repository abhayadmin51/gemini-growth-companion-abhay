import { auth } from "../firebase/firebaseConfig";

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

export default function Login() {

 const navigate = useNavigate();
 
  const loginWithGoogle = async () => {
    try {

      const provider =
        new GoogleAuthProvider();

      await signInWithPopup(
        auth,
        provider
      );
	  
	  //redirect to dashboard
	  navigate("/dashboard");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "100px",
      }}
    >
      <button
        onClick={loginWithGoogle}
      >
        Sign In With Google
      </button>
    </div>
  );
}