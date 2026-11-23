"use strict";

(() => {
  const gate = document.getElementById("authGate");
  const appShell = document.querySelector(".app-shell");
  const authForm = document.getElementById("authForm");
  const resetRequestForm = document.getElementById("resetRequestForm");
  const updatePasswordForm = document.getElementById("updatePasswordForm");
  const authError = document.getElementById("authError");
  const authConfigMessage = document.getElementById("authConfigMessage");
  let supabaseClient;
  let signingUp = false;
  let recoveryMode = false;
  let activeUserId = null;
  let initializedUserId = null;
  let setupNotice = "";

  function showMessage(message, isError) {
    authError.hidden = !isError;
    authError.textContent = isError ? message : "";
    authConfigMessage.textContent = isError ? "" : message || setupNotice;
    authConfigMessage.hidden = isError || !(message || setupNotice);
  }

  function setSignUpMode(enabled) {
    signingUp = enabled;
    document.getElementById("authHeading").textContent = enabled ? "Create your account" : "Welcome back";
    document.getElementById("authSubmit").textContent = enabled ? "Create account" : "Sign in";
    document.getElementById("authPassword").autocomplete = enabled ? "new-password" : "current-password";
    document.getElementById("authModeToggle").textContent = enabled ? "Already have an account? Sign in" : "Create an account";
  }

  function showAuthScreen(screen) {
    if (screen === "login" && signingUp) setSignUpMode(false);
    authForm.hidden = screen !== "login";
    resetRequestForm.hidden = screen !== "reset";
    updatePasswordForm.hidden = screen !== "update-password";
    authError.hidden = true;
  }

  function getRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function showApp(user) {
    if (!user) return;
    if (activeUserId && activeUserId !== user.id) {
      window.location.reload();
      return;
    }

    activeUserId = user.id;
    gate.hidden = true;
    appShell.hidden = false;
    document.getElementById("signedInEmail").textContent = user.email || "";
    if (initializedUserId !== user.id) {
      initializedUserId = user.id;
      document.dispatchEvent(new CustomEvent("thrifi:authenticated", { detail: { user } }));
    }
  }

  function setFormBusy(form, busy) {
    form.querySelectorAll("button").forEach(button => {
      button.disabled = busy;
    });
  }

  function setAuthAvailable(available) {
    [authForm, resetRequestForm, updatePasswordForm].forEach(form => {
      form.querySelector('[type="submit"]').disabled = !available;
    });
  }

  document.querySelectorAll("[data-auth-screen]").forEach(button => {
    button.addEventListener("click", () => {
      showMessage("", false);
      showAuthScreen(button.dataset.authScreen);
      if (button.dataset.authScreen === "reset") {
        document.getElementById("resetEmail").value = document.getElementById("authEmail").value;
      }
    });
  });

  document.getElementById("authModeToggle").addEventListener("click", () => {
    setSignUpMode(!signingUp);
    showMessage("", false);
  });

  authForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("", false);
    setFormBusy(authForm, true);
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    try {
      const result = signingUp
        ? await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: getRedirectUrl() } })
        : await supabaseClient.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (signingUp && !result.data.session) {
        setSignUpMode(false);
        document.getElementById("authHeading").textContent = "Check your email";
        showMessage("Use the confirmation link in your email, then sign in.", false);
      } else if (result.data.session) {
        showApp(result.data.session.user);
      }
    } catch (error) {
      showMessage(error.message || "Could not authenticate. Please try again.", true);
    } finally {
      setFormBusy(authForm, false);
    }
  });

  resetRequestForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("", false);
    setFormBusy(resetRequestForm, true);
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        document.getElementById("resetEmail").value.trim(),
        { redirectTo: getRedirectUrl() }
      );
      if (error) throw error;
      showAuthScreen("login");
      showMessage("If an account exists for that email, a password reset link is on its way.", false);
    } catch (error) {
      showMessage(error.message || "Could not send a reset link. Please try again.", true);
    } finally {
      setFormBusy(resetRequestForm, false);
    }
  });

  updatePasswordForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("", false);
    setFormBusy(updatePasswordForm, true);
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        password: document.getElementById("newPassword").value
      });
      if (error) throw error;
      recoveryMode = false;
      showApp(data.user);
    } catch (error) {
      showMessage(error.message || "Could not update your password. Please try again.", true);
    } finally {
      setFormBusy(updatePasswordForm, false);
    }
  });

  document.getElementById("signOutBtn").addEventListener("click", async () => {
    const button = document.getElementById("signOutBtn");
    button.disabled = true;
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      button.disabled = false;
      const errorMessage = document.getElementById("signOutError");
      errorMessage.textContent = error.message || "Could not sign out. Please try again.";
      errorMessage.hidden = false;
    }
  });

  async function initializeAuth() {
    const url = window.THRIFI_SUPABASE_URL;
    const anonKey = window.THRIFI_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      setAuthAvailable(false);
      setupNotice = "Add your Supabase project URL and public anon key to auth-config.js to enable authentication.";
      showMessage("", false);
      return;
    }
    if (!/^https?:$/.test(window.location.protocol)) {
      setAuthAvailable(false);
      setupNotice = "Open Thri-Fi from its local or deployed web server to use authentication.";
      showMessage("", false);
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setAuthAvailable(false);
      setupNotice = "The Supabase client could not load. Check your internet connection and reload.";
      showMessage("", false);
      return;
    }

    supabaseClient = window.supabase.createClient(url, anonKey, {
      auth: { detectSessionInUrl: true }
    });
    setAuthAvailable(true);
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryMode = true;
        showAuthScreen("update-password");
        return;
      }
      if (event === "SIGNED_OUT") {
        if (activeUserId) window.location.reload();
        return;
      }
      if (session && !recoveryMode) showApp(session.user);
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      subscription.unsubscribe();
      showMessage(error.message, true);
      return;
    }
    if (data.session && !recoveryMode) showApp(data.session.user);
  }

  initializeAuth().catch(error => {
    showMessage(error.message || "Could not initialize authentication.", true);
  });
})();
