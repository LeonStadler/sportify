import { AuthContext } from "@/contexts/AuthContextProvider";
import { API_URL } from "@/lib/api";
import React, { ReactNode, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayPreference: "firstName" | "fullName" | "nickname";
  isEmailVerified: boolean;
  has2FA: boolean;
  avatar?: string;
  themePreference?: string;
  languagePreference: "de" | "en";
  createdAt: string;
  lastLoginAt: string;
  twoFactorEnabledAt?: string;
  passwordChangedAt?: string;
  backupCodesCreatedAt?: string;
  role: "user" | "admin";
  showInGlobalRankings?: boolean;
  preferences: {
    timeFormat: "12h" | "24h";
    units: {
      distance: "km" | "m" | "miles" | "yards";
      weight: "kg" | "lbs" | "stone";
      temperature: "celsius" | "fahrenheit";
    };
    notifications: {
      push: boolean;
      email: boolean;
    };
    privacy: {
      publicProfile: boolean;
    };
    theme: "light" | "dark" | "system";
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayPreference?: "firstName" | "fullName" | "nickname";
  invitationToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
    twoFactorToken?: string,
    backupCode?: string,
    rememberMe?: boolean
  ) => Promise<{ requires2FA?: boolean }>;
  register: (
    data: RegisterData
  ) => Promise<{ needsVerification: boolean; email: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  enable2FA: () => Promise<{
    secret: { base32: string; otpauthUrl: string };
    backupCodes: string[];
  }>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: (password: string) => Promise<void>;
  rotateBackupCodes: () => Promise<string[]>;
  updateProfile: (data: Partial<User>, silent?: boolean) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  inviteUser: (
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  inviteFriend: (email: string) => Promise<{
    type: "friend_request" | "invitation" | "user_exists" | "invitation_exists";
    message: string;
    userId?: string;
    displayName?: string;
    email?: string;
  }>;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  getInvitations: () => Promise<Invitation[]>;
  acceptInvitation: (invitationToken: string) => Promise<void>;
  getDisplayName: () => string;
  clearError: () => void;
}

export interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

interface ApiError extends Error {
  status?: number;
  retryAfter?: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token with backend and get user data
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            localStorage.removeItem("token");
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          localStorage.removeItem("token");
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    twoFactorToken?: string,
    backupCode?: string,
    rememberMe: boolean = false
  ): Promise<{ requires2FA?: boolean; invitedBy?: string }> => {
    // Don't set isLoading to true - use local loading state in component instead
    // This prevents the global spinner from showing during login attempts
    setState((prev) => ({ ...prev, error: null }));

    try {
      const body: {
        email: string;
        password: string;
        twoFactorToken?: string;
        backupCode?: string;
        rememberMe?: boolean;
      } = { email, password };
      if (twoFactorToken) {
        body.twoFactorToken = twoFactorToken;
      }
      if (backupCode) {
        body.backupCode = backupCode;
      }
      if (rememberMe) {
        body.rememberMe = rememberMe;
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Parse response body
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, treat as real error
        const errorMessage = "Ungültige Antwort vom Server";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }

      // Check if 2FA is required (now returned as 200 with requires2FA flag)
      if (data.requires2FA === true) {
        // 2FA is required - this is expected behavior, not an error
        setState((prev) => ({ ...prev, isLoading: false, error: null }));
        return { requires2FA: true };
      }

      // Handle other error responses
      if (!response.ok) {
        const errorMessage = data.error || "Login fehlgeschlagen";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }

      // Success - extract user and token
      const { user, token } = data;

      localStorage.setItem("token", token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return {};
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const register = async (
    data: RegisterData
  ): Promise<{ needsVerification: boolean; email: string }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Registrierung fehlgeschlagen.");
      }

      // Nach erfolgreicher Registrierung wird der Benutzer NICHT automatisch eingeloggt
      // Er muss erst seine E-Mail verifizieren
      setState((prev) => ({ ...prev, isLoading: false, error: null }));

      return {
        needsVerification: true,
        email: data.email,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem("token");
  };

  const resetPassword = async (email: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(
          data.error || "Fehler beim Zurücksetzen des Passworts"
        ) as ApiError;
        error.status = response.status;
        error.retryAfter = data.retryAfter;
        throw error;
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Nicht angemeldet");
      }

      const response = await fetch(`${API_URL}/profile/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, treat as error
        const errorMessage = "Ungültige Antwort vom Server";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Ändern des Passworts");
      }

      // Reload user data to get updated passwordChangedAt
      try {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Ensure passwordChangedAt is properly set
          if (
            userData.passwordChangedAt === undefined &&
            userData.password_changed_at !== undefined
          ) {
            userData.passwordChangedAt = userData.password_changed_at;
            delete userData.password_changed_at;
          }
          setState((prev) => ({ ...prev, user: userData, isLoading: false }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (refreshError) {
        console.error("Error refreshing user data:", refreshError);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const confirmResetPassword = async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/auth/confirm-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Fehler beim Bestätigen des neuen Passworts"
        );
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der E-Mail-Verifizierung");
      }

      // Update user state
      if (state.user) {
        const updatedUser = { ...state.user, isEmailVerified: true };
        setState((prev) => ({ ...prev, user: updatedUser, isLoading: false }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const resendVerification = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Nicht angemeldet");
      }

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Fehler beim Senden der Verifizierungs-E-Mail"
        );
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const enable2FA = async (): Promise<{
    secret: { base32: string; otpauthUrl: string };
    backupCodes: string[];
  }> => {
    // Don't set global isLoading - use local loading state in component instead
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({ ...prev, error: error.message }));
        throw error;
      }

      const response = await fetch(`${API_URL}/auth/enable-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aktivieren der 2FA");
      }

      // Note: 2FA is not yet fully activated - user needs to verify TOTP code first
      // The backend sets has_2fa = false until verification is complete via /api/auth/verify-2fa

      return {
        secret: data.secret,
        backupCodes: data.backupCodes,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const verify2FA = async (token: string): Promise<void> => {
    // Don't set global isLoading - use local loading state in component instead

    // Input validation: Check that token is a valid 2FA token
    if (!token || typeof token !== "string" || token.trim() === "") {
      const errorMessage =
        "Ungültiger 2FA-Code. Bitte gib einen 6-stelligen Code ein.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }

    // Validate token format: 6-digit numeric code
    const tokenRegex = /^\d{6}$/;
    if (!tokenRegex.test(token.trim())) {
      const errorMessage =
        "Ungültiger 2FA-Code. Der Code muss genau 6 Ziffern enthalten.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }

    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({ ...prev, error: error.message }));
        throw error;
      }

      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Verifizieren der 2FA");
      }

      // Reload user data to get updated has2FA status
      try {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState((prev) => ({ ...prev, user: userData }));
        } else {
          // If refresh fails, update has2FA locally as fallback
          const refreshError = new Error(
            "Fehler beim Aktualisieren der Benutzerdaten"
          );
          console.error("Error refreshing user data:", refreshError);
          setState((prev) => {
            if (prev.user) {
              return {
                ...prev,
                user: { ...prev.user, has2FA: true },
                error:
                  "2FA wurde aktiviert, aber die Benutzerdaten konnten nicht aktualisiert werden. Bitte lade die Seite neu.",
              };
            }
            return {
              ...prev,
              error:
                "2FA wurde aktiviert, aber die Benutzerdaten konnten nicht geladen werden. Bitte lade die Seite neu.",
            };
          });
        }
      } catch (refreshError) {
        // If refresh fails, update has2FA locally as fallback
        console.error("Error refreshing user data:", refreshError);
        setState((prev) => {
          if (prev.user) {
            return {
              ...prev,
              user: { ...prev.user, has2FA: true },
              error:
                "2FA wurde aktiviert, aber die Benutzerdaten konnten nicht aktualisiert werden. Bitte lade die Seite neu.",
            };
          }
          return {
            ...prev,
            error:
              "2FA wurde aktiviert, aber die Benutzerdaten konnten nicht geladen werden. Bitte lade die Seite neu.",
          };
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const rotateBackupCodes = async (): Promise<string[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({ ...prev, error: error.message }));
        throw error;
      }

      const response = await fetch(`${API_URL}/auth/backup-codes/rotate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Fehler beim Zurücksetzen der Recovery-Keys"
        );
      }

      // Reload user data to get updated backupCodesCreatedAt
      try {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState((prev) => ({ ...prev, user: userData }));
        }
      } catch (refreshError) {
        console.error("Error refreshing user data:", refreshError);
      }

      return data.backupCodes || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const disable2FA = async (password: string): Promise<void> => {
    // Don't set global isLoading - use local loading state in component instead
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({ ...prev, error: error.message }));
        throw error;
      }

      const response = await fetch(`${API_URL}/auth/disable-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Deaktivieren der 2FA");
      }

      // Reload user data to get updated has2FA status
      try {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState((prev) => ({ ...prev, user: userData }));
        }
      } catch (refreshError) {
        console.error("Error refreshing user data:", refreshError);
        // Fallback: Update has2FA locally if refresh fails
        if (state.user) {
          const updatedUser = { ...state.user, has2FA: false };
          setState((prev) => ({ ...prev, user: updatedUser }));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const updateProfile = async (
    data: Partial<User>,
    silent = false
  ): Promise<void> => {
    // Im silent-Modus keinen globalen Loading-State setzen (für Auto-Save)
    if (!silent) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || "Fehler beim Aktualisieren des Profils"
        );
      }

      // User-State aktualisieren ohne Loading-State zu ändern
      setState((prev) => ({
        ...prev,
        user: responseData,
        isLoading: silent ? prev.isLoading : false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      if (!silent) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
      throw error;
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }

      const response = await fetch(`${API_URL}/profile/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Fehler beim Löschen des Kontos");
      }

      // Clear user data and redirect to login
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      localStorage.removeItem("token");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const inviteUser = async (
    email: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }

      const response = await fetch(`${API_URL}/admin/invite-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Einladen des Benutzers");
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const inviteFriend = async (
    email: string
  ): Promise<{
    type: "friend_request" | "invitation" | "user_exists";
    message: string;
    userId?: string;
    displayName?: string;
    email?: string;
  }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }

      const response = await fetch(`${API_URL}/profile/invite-friend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Einladen des Freundes");
      }

      setState((prev) => ({ ...prev, isLoading: false }));

      // Wenn Benutzer bereits existiert, gib speziellen Typ zurück
      if (data.userExists) {
        return {
          type: "user_exists",
          message: data.message || "Dieser Benutzer ist bereits registriert.",
          userId: data.userId,
          displayName: data.displayName,
          email: data.email,
        };
      }

      return {
        type: data.type || "invitation",
        message: data.message || "Einladung gesendet.",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const sendFriendRequest = async (targetUserId: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const error = new Error("Nicht angemeldet");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }

      const response = await fetch(`${API_URL}/friends/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        let errorMessage = "Fehler beim Senden der Freundschaftsanfrage";
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await response.json();
            errorMessage = data.error || data.message || errorMessage;
          } catch (parseError) {
            // Wenn JSON-Parsing fehlschlägt, verwende Standard-Fehlermeldung
            console.error("Error parsing error response:", parseError);
          }
        } else {
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          } catch (textError) {
            console.error("Error reading error response:", textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const getInvitations = async (): Promise<Invitation[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Wenn nicht angemeldet, gib leeres Array zurück statt Fehler zu werfen
        return [];
      }

      const response = await fetch(`${API_URL}/profile/invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Bei Fehlern gib leeres Array zurück statt Fehler zu werfen
        console.warn(
          "Fehler beim Laden der Einladungen:",
          data.error || "Unbekannter Fehler"
        );
        return [];
      }

      // Stelle sicher, dass wir ein Array zurückgeben
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Bei Netzwerkfehlern oder anderen Fehlern, gib leeres Array zurück
      console.warn(
        "Fehler beim Laden der Einladungen:",
        error instanceof Error ? error.message : "Unbekannter Fehler"
      );
      return [];
    }
  };

  const acceptInvitation = async (invitationToken: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Nicht angemeldet");
      }

      const response = await fetch(`${API_URL}/auth/accept-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Akzeptieren der Einladung");
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const getDisplayName = (): string => {
    if (!state.user) return "";

    switch (state.user.displayPreference) {
      case "nickname":
        // Nur Spitzname verwenden, wenn er tatsächlich vorhanden ist
        return state.user.nickname && state.user.nickname.trim() !== ""
          ? state.user.nickname
          : state.user.firstName;
      case "firstName":
        return state.user.firstName;
      case "fullName":
        return `${state.user.firstName} ${state.user.lastName}`;
      default:
        return state.user.firstName;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword,
    changePassword,
    verifyEmail,
    resendVerification,
    enable2FA,
    verify2FA,
    disable2FA,
    rotateBackupCodes,
    updateProfile,
    deleteAccount,
    inviteUser,
    inviteFriend,
    sendFriendRequest,
    getInvitations,
    acceptInvitation,
    getDisplayName,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
