import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SignUp from './pages/Signup';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import LoadingScreen from './components/ui/LoadingScreen';
import SSOCallback from './pages/SSOCallback';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  const isUserAuthenticated = isAuthenticated && user?.isVerified

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/signup" 
          element={
            isUserAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignUp />
          } 
        />
        <Route 
          path="/signin" 
          element={
            isUserAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignIn />
          } 
        />
        
        {/* SSO Callback Route */}
        <Route path="/sso-callback" element={<SSOCallback />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            isUserAuthenticated ? 
            <Dashboard /> : 
            <Navigate to="/signin" replace />
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={
            <Navigate to={
              isUserAuthenticated ? "/dashboard" : "/signin"
            } replace />
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;