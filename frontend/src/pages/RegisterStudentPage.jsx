import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  MenuItem,
  Alert,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import studentService from '../services/studentService';

const RegisterStudentPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      await studentService.create({
        ...formData,
        age: parseInt(formData.age)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register student. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Register Student</Typography>
          </Breadcrumbs>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton component={RouterLink} to="/dashboard" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Register New Student
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number (10 digits)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  inputProps={{ maxLength: 10 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Permanent Address"
                  name="address"
                  multiline
                  rows={4}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{ flexGrow: 1, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                  >
                    {loading ? 'Registering...' : 'Register Student'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/dashboard"
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterStudentPage;
