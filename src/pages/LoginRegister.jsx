import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ship, Eye, EyeOff } from "lucide-react";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { authService } from "../services/dataService";

export default function LoginRegister({ onLoginSuccess, addToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // login or register
  
  // Field toggles
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const loginErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginData.email.trim()) {
      loginErrors.email = "Email is required.";
    } else if (!emailRegex.test(loginData.email)) {
      loginErrors.email = "Enter a valid email address.";
    }

    if (!loginData.password) {
      loginErrors.password = "Password is required.";
    } else if (loginData.password.length < 6) {
      loginErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(loginErrors);

    if (Object.keys(loginErrors).length === 0) {
      try {
        const session = await authService.login({
          email: loginData.email,
          password: loginData.password
        });
        onLoginSuccess(session.user);
        addToast("Successfully logged in!", "success");
        navigate(session.user.role === "admin" ? "/admin" : "/");
      } catch (error) {
        addToast(error.message, "error");
      }
    } else {
      addToast("Invalid login credentials.", "error");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const regErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registerData.name.trim()) {
      regErrors.name = "Full name is required.";
    } else if (registerData.name.trim().length < 3) {
      regErrors.name = "Name must be at least 3 characters.";
    }

    if (!registerData.email.trim()) {
      regErrors.email = "Email is required.";
    } else if (!emailRegex.test(registerData.email)) {
      regErrors.email = "Enter a valid email address.";
    }

    if (!registerData.mobile.trim()) {
      regErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(registerData.mobile)) {
      regErrors.mobile = "Enter a valid 10-digit number.";
    }

    if (!registerData.password) {
      regErrors.password = "Password is required.";
    } else if (registerData.password.length < 6) {
      regErrors.password = "Password must be at least 6 characters.";
    }

    if (!registerData.confirmPassword) {
      regErrors.confirmPassword = "Confirm password is required.";
    } else if (registerData.confirmPassword !== registerData.password) {
      regErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(regErrors);

    if (Object.keys(regErrors).length === 0) {
      try {
        const session = await authService.register({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.mobile,
          password: registerData.password
        });
        onLoginSuccess(session.user);
        addToast("Account created successfully! Welcome aboard.", "success");
        navigate("/");
      } catch (error) {
        addToast(error.message, "error");
      }
    } else {
      addToast("Please complete the registration fields correctly.", "error");
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  return (
    <div className="flex-1 bg-slate-50 pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-br from-ocean-500 to-aqua-500 rounded-2xl text-white w-max mx-auto shadow-md mb-4">
            <Ship className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome to FerryPort</h2>
          <p className="text-xs text-slate-400 mt-1">Secure account access powered by the FerryPort API</p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
          
          {/* Form Tabs */}
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            <button
              onClick={() => toggleTab("login")}
              className={`flex-1 text-center pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "login"
                  ? "border-ocean-500 text-ocean-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleTab("register")}
              className={`flex-1 text-center pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "register"
                  ? "border-ocean-500 text-ocean-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={loginData.email}
                placeholder="name@email.com"
                error={errors.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />

              <div className="relative">
                <InputField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  placeholder="••••••••"
                  error={errors.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot & Remember Me Row */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-1 select-none">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500 cursor-pointer"
                  />
                  Remember Me
                </label>
                
                <button
                  type="button"
                  onClick={() => addToast("Password reset is not configured yet. Contact FerryPort support.", "error")}
                  className="text-ocean-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3.5 mt-2">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              <InputField
                label="Full Name"
                name="name"
                value={registerData.name}
                placeholder="Student Name"
                error={errors.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={registerData.email}
                placeholder="name@email.com"
                error={errors.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />

              <InputField
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={registerData.mobile}
                placeholder="10-digit number"
                error={errors.mobile}
                onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                value={registerData.password}
                placeholder="Min 6 characters"
                error={errors.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              />

              <Button type="submit" variant="primary" className="w-full py-3.5 mt-2">
                Create Account
              </Button>
            </form>
          )}

          {/* Security note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
            Passwords are hashed on the backend and successful sign-in creates a protected JWT session.
          </div>

        </div>

      </div>
    </div>
  );
}
