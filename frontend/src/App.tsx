
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SignUp from './pages/Signup';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/signup" 
          element={
            isAuthenticated && user?.isVerified ? 
            <Navigate to="/dashboard" replace /> : 
            <SignUp />
          } 
        />
        <Route 
          path="/signin" 
          element={
            isAuthenticated && user?.isVerified ? 
            <Navigate to="/dashboard" replace /> : 
            <SignIn />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated && user?.isVerified ? 
            <Dashboard /> : 
            <Navigate to="/signin" replace />
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={
            <Navigate to={
              isAuthenticated && user?.isVerified ? "/dashboard" : "/signin"
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