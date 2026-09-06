import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const logout = async () => {
    await signOut(auth);
  };

  const printToken = async () => {
    const token = await currentUser.getIdToken();
    console.log(token);
  };
  
  const navigate = useNavigate();

  return (
    <div>
      <h1>Gemini Growth Companion</h1>
      <p>Welcome: {currentUser?.email}</p>
      <button onClick={logout}>Logout</button>
      <button onClick={printToken}>Print Token</button>
	  <button onClick={()=>navigate("/journal")}>Open Journal</button>
    </div>
  );
}