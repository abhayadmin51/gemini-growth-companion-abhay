import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
});

apiClient.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const token =
        await currentUser.getIdToken();

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

export default apiClient;