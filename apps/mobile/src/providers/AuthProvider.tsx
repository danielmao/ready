import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * Estado de sesión de la app. En el MVP la auth de Google está **diferida** (CLAUDE.md §1): el
 * backend es single-user con `userId` fijo. Esta sesión es puramente de UI —la pantalla de login
 * "pasa" sin validar nada— y sirve de punto de extensión: el día que entre OAuth real, `signIn`
 * guardará el token y el interceptor de `apiClient` lo mandará. Nada más de la app cambia.
 */
interface AuthContextValue {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      signIn: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
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
