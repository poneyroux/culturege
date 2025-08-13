import { supabase } from "../supabaseClient";

export const authProvider = {
  // Connexion
  login: async (params) => {
    const { username, password } = params;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Vérifier l'authentification
  checkAuth: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data.session) {
        return Promise.resolve();
      }
      return Promise.reject("No session");
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Permissions (vous êtes admin)
  getPermissions: () => Promise.resolve("admin"),

  // Identité utilisateur
  getIdentity: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (data.user) {
        return Promise.resolve({
          id: data.user.id,
          fullName: data.user.email,
          avatar: null,
        });
      }
      return Promise.resolve(null);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
