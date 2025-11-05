import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isDark, onToggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = onLogin(username, password);
    if (!success) {
      setError('Credenciales incorrectas. Intenta nuevamente.');
    }
    setIsLoading(false);
  };

  const handleBackToCatalog = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-300">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Back Button and Theme Toggle */}
      <div className="absolute top-6 left-6 flex gap-3">
        <button
          onClick={handleBackToCatalog}
          className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border border-white/20"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Volver al Catálogo</span>
        </button>
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-blue-100 dark:text-gray-300">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-blue-100 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 dark:bg-gray-700/50 border border-white/20 dark:border-gray-600/50 rounded-lg text-white placeholder-blue-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-blue-100 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 dark:bg-gray-700/50 border border-white/20 dark:border-gray-600/50 rounded-lg text-white placeholder-blue-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-100 text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};