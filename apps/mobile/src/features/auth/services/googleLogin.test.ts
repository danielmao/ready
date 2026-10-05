import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-web-browser');
jest.mock('expo-linking');

describe('googleLogin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module initialization', () => {
    it('calls maybeCompleteAuthSession on module load', () => {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./googleLogin');
      });

      expect(WebBrowser.maybeCompleteAuthSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInWithGoogle', () => {
    it('returns token when openAuthSessionAsync resolves with success', async () => {
      const mockToken = 'mock-jwt-token';
      const mockRedirectUri = 'exp://localhost:8081/--/auth';

      (Linking.createURL as jest.Mock).mockReturnValue(mockRedirectUri);
      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: { token: mockToken },
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${mockRedirectUri}?token=${mockToken}`,
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { signInWithGoogle } = require('./googleLogin');

      const result = await signInWithGoogle();

      expect(result).toBe(mockToken);
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalled();
      expect(Linking.parse).toHaveBeenCalled();
    });

    it('throws LoginCancelledError when user cancels', async () => {
      const mockRedirectUri = 'exp://localhost:8081/--/auth';

      (Linking.createURL as jest.Mock).mockReturnValue(mockRedirectUri);
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        signInWithGoogle,
        LoginCancelledError,
      } = require('./googleLogin');

      await expect(signInWithGoogle()).rejects.toThrow(LoginCancelledError);
    });

    it('throws error when backend returns error code', async () => {
      const mockRedirectUri = 'exp://localhost:8081/--/auth';
      const errorCode = 'access_denied';

      (Linking.createURL as jest.Mock).mockReturnValue(mockRedirectUri);
      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: { error: errorCode },
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${mockRedirectUri}?error=${errorCode}`,
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { signInWithGoogle } = require('./googleLogin');

      await expect(signInWithGoogle()).rejects.toThrow(
        'No autorizaste el acceso con Google.',
      );
    });

    it('throws error when token is missing', async () => {
      const mockRedirectUri = 'exp://localhost:8081/--/auth';

      (Linking.createURL as jest.Mock).mockReturnValue(mockRedirectUri);
      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: {},
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: mockRedirectUri,
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { signInWithGoogle } = require('./googleLogin');

      await expect(signInWithGoogle()).rejects.toThrow(
        'El servidor no devolvió una sesión válida.',
      );
    });
  });
});
