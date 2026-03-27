import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper, 
  Link,
  CssBaseline 
} from '@mui/material';
import authService from '../services/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Student Portal
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Enter your credentials to access the dashboard
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/signup" variant="body2" sx={{ textDecoration: 'none', fontWeight: 'medium' }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
