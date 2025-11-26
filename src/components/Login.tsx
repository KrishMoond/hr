import { useState } from 'react';
import { Eye, EyeOff, LogIn, User, Lock, Lightbulb } from 'lucide-react';
import apiService from '../services/api';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLightOn, setIsLightOn] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
    department: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await apiService.login(formData.email, formData.password);
      } else {
        response = await apiService.register(formData);
      }
      
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleLight = () => {
    setIsLightOn(!isLightOn);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
      isLightOn 
        ? 'bg-gradient-to-br from-[#E8EDF5] via-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900'
    }`}>
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`floating-circle absolute w-20 h-20 rounded-full transition-all duration-1000 ${
          isLightOn ? 'bg-blue-200/30' : 'bg-blue-400/10'
        }`} style={{
          top: '20%',
          left: '10%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div className={`floating-circle absolute w-32 h-32 rounded-full transition-all duration-1000 ${
          isLightOn ? 'bg-indigo-200/30' : 'bg-indigo-400/10'
        }`} style={{
          top: '60%',
          right: '15%',
          animation: 'float 6s ease-in-out infinite 2s'
        }}></div>
        <div className={`floating-circle absolute w-16 h-16 rounded-full transition-all duration-1000 ${
          isLightOn ? 'bg-purple-200/30' : 'bg-purple-400/10'
        }`} style={{
          bottom: '20%',
          left: '20%',
          animation: 'float 6s ease-in-out infinite 4s'
        }}></div>
      </div>

      {/* Light Bulb Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleLight}
          className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
            isLightOn 
              ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Lightbulb size={24} className={isLightOn ? 'animate-pulse' : ''} />
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`max-w-md w-full backdrop-blur-lg rounded-3xl shadow-2xl p-8 border transition-all duration-500 ${
          isLightOn 
            ? 'bg-white/90 border-white/20 shadow-xl' 
            : 'bg-white/10 border-white/10 shadow-2xl'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
              isLightOn 
                ? 'bg-[#4169E1] shadow-lg shadow-[#4169E1]/30' 
                : 'bg-[#4169E1]/80 shadow-lg shadow-[#4169E1]/20'
            }`}>
              <User className="text-white" size={36} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
              isLightOn ? 'text-gray-900' : 'text-white'
            }`}>HR SARTHI</h1>
            <p className={`transition-colors duration-500 ${
              isLightOn ? 'text-gray-600' : 'text-gray-300'
            }`}>Intelligent Human Resource Management</p>
          </div>

          {/* Toggle Buttons */}
          <div className={`flex mb-6 p-1 rounded-xl transition-all duration-500 ${
            isLightOn ? 'bg-gray-100' : 'bg-white/10'
          }`}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                isLogin 
                  ? 'bg-[#4169E1] text-white shadow-lg transform scale-105' 
                  : isLightOn 
                    ? 'text-gray-600 hover:bg-gray-200' 
                    : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                !isLogin 
                  ? 'bg-[#4169E1] text-white shadow-lg transform scale-105' 
                  : isLightOn 
                    ? 'text-gray-600 hover:bg-gray-200' 
                    : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isLightOn ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                        isLightOn 
                          ? 'bg-white border-gray-300 text-gray-900' 
                          : 'bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isLightOn ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                        isLightOn 
                          ? 'bg-white border-gray-300 text-gray-900' 
                          : 'bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isLightOn ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                      isLightOn 
                        ? 'bg-white border-gray-300 text-gray-900' 
                        : 'bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isLightOn ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                      isLightOn 
                        ? 'bg-white border-gray-300 text-gray-900' 
                        : 'bg-white/10 border-white/20 text-white backdrop-blur-sm'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isLightOn ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Email
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${
                  isLightOn ? 'text-gray-400' : 'text-gray-300'
                }`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                    isLightOn 
                      ? 'bg-white border-gray-300 text-gray-900' 
                      : 'bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isLightOn ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${
                  isLightOn ? 'text-gray-400' : 'text-gray-300'
                }`} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4169E1] ${
                    isLightOn 
                      ? 'bg-white border-gray-300 text-gray-900' 
                      : 'bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${
                    isLightOn ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#4169E1] text-white rounded-xl hover:bg-[#3559d1] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  {isLogin ? 'Login to HR SARTHI' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          {isLogin && (
            <div className={`mt-6 p-4 rounded-xl transition-all duration-500 ${
              isLightOn 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-blue-900/20 border border-blue-500/30 backdrop-blur-sm'
            }`}>
              <h4 className={`font-semibold mb-3 transition-colors duration-500 ${
                isLightOn ? 'text-blue-900' : 'text-blue-300'
              }`}>🚀 Demo Accounts:</h4>
              <div className={`text-sm space-y-2 transition-colors duration-500 ${
                isLightOn ? 'text-blue-800' : 'text-blue-200'
              }`}>
                <p><strong>Admin:</strong> admin@hrsarthi.com / admin123</p>
                <p><strong>HR:</strong> hr@hrsarthi.com / hr123</p>
                <p><strong>Employee:</strong> sarah.j@hrsarthi.com / password123</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        .cord-pull:hover {
          animation: swing 0.5s ease-in-out;
        }
        
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}