import { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { setAuthToken } from "@/lib/storage";
import { homeRouteForRole } from "@/lib/constants";
import { getFriendlyErrorMessage } from "@/lib/friendlyErrors";
import app from "@/lib/firebase";

export const auth = getAuth(app);

export function useGoogleLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the ID token from Firebase
      const idToken = await result.user.getIdToken();

      // Intentar login con Google (solo si el usuario ya existe)
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      if (loginResponse.status === 404) {
        // Usuario no existe - redirigir a registro con los datos de Google
        const email = result.user.email;
        const name = result.user.displayName;
        const photoURL = result.user.photoURL;
        // Guardar datos de Google en sessionStorage para que RegisterForm los use
        sessionStorage.setItem("googleSignUp", JSON.stringify({ idToken, email, name, photoURL }));
        window.location.href = "/register";
        return;
      }

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => null);
        throw new Error(errorData?.message || "Error al autenticar con Google");
      }

      const data = await loginResponse.json();

      // Guardar el token JWT devuelto por el backend
      setAuthToken(data.data.accessToken);

      // Redirigir según el rol del usuario
      window.location.href = homeRouteForRole(data.data.user.role);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
  };
}
