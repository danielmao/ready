import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useContext } from 'react';

import {
  LoginCancelledError,
  signInWithGoogle,
} from '../features/auth/services/googleLogin';
import {
  clearToken,
  loadToken,
  saveToken,
} from '../features/auth/services/sessionStorage';
import { setAccessToken, setUnauthorizedHandler } from '../services/apiClient';

/**
 * Estado de sesión de la app, con login real contra Google (mediado por el backend).
 *
 * `status` arranca en `restoring` porque leer el token del almacenamiento seguro es
 * asíncrono: sin ese tercer estado, la app parpadearía mostrando el Login durante un
 * instante a alguien que ya tenía sesión.
 */
type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  isAuthenticated: boolean;
  /** true mientras se restaura la sesión guardada al abrir la app. */
  isRestoring: boolean;
  /** true mientras el navegador de Google está abierto. */
  isSigningIn: boolean;
  /** Mensaje del último intento fallido, o null. Cancelar no cuenta como fallo. */
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Única puerta por la que cambia la sesión: mantiene estado y apiClient sincronizados. */
  const applyToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setStatus(token ? 'signedIn' : 'signedOut');
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    applyToken(null);
  }, [applyToken]);

  // Sesión guardada de un uso anterior.
  useEffect(() => {
    void loadToken()
      .then((token) => applyToken(token))
      .catch(() => applyToken(null));
  }, [applyToken]);

  // Un 401 desde cualquier pantalla nos devuelve al login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const token = await signInWithGoogle();
      await saveToken(token);
      applyToken(token);
    } catch (cause) {
      // Cerrar el navegador es una decisión del usuario, no una falla que reportarle.
      if (!(cause instanceof LoginCancelledError)) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo iniciar sesión. Probá de nuevo.',
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [applyToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: status === 'signedIn',
      isRestoring: status === 'restoring',
      isSigningIn,
      error,
      signIn,
      signOut,
    }),
    [status, isSigningIn, error, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Acceso al estado de sesión. Debe usarse dentro de `<AuthProvider>`. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
