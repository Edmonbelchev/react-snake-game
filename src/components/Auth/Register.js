import React, { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "../../styles/auth.css";

export default function Register({ onToggleForm, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      await updateProfile(userCredential.user, {
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      });
      
      onClose();
    } catch (error) {
      let errorMessage = "Failed to create account";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // If the user doesn't have a display name, set it from their email
      if (!result.user.displayName) {
        await updateProfile(result.user, {
          displayName: result.user.email.split('@')[0],
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.email)}&background=random`,
        });
      }
      
      onClose();
    } catch (error) {
      let errorMessage = "Failed to register with Google";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Registration cancelled";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-close" onClick={onClose}>&times;</div>
      <h2>Create Account</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            minLength={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={6}
          />
          <small className="password-hint">Must be at least 6 characters long</small>
        </div>
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register with Email'}
        </button>
      </form>

      <div className="auth-separator">
        <span>or</span>
      </div>

      <button 
        onClick={handleGoogleRegister} 
        className="google-button"
        disabled={isLoading}
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google"
        />
        Sign up with Google
      </button>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <span onClick={onToggleForm} className="auth-link">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
