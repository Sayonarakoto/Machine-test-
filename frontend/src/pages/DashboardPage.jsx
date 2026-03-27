import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  AppBar, 
  Toolbar, 
  InputAdornment,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Logout as LogoutIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';
import studentService from '../services/studentService';

const DashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchStudents();
  }, [query]);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll(query);
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students.');
      if (err.response?.status === 401) {
        authService.logout();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            STUDENT CMS
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            Welcome, <strong>{currentUser?.username}</strong>
          </Typography>
          <IconButton color="primary" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name or phone number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'white', borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/register"
              size="large"
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              Add New Student
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" my={10}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {students.length === 0 ? (
                <Grid item xs={12}>
                  <Box textAlign="center" py={10}>
                    <Typography variant="h6" color="text.secondary">No students found.</Typography>
                  </Box>
                </Grid>
              ) : (
                students.map((student, index) => (
                  <Grid item xs={12} sm={6} md={4} key={student.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card elevation={2} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{student.name}</Typography>
                              <Chip label={student.gender} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                            </Box>
                            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'light' }}>
                              {student.age}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          <Box display="flex" alignItems="center" mb={1}>
                            <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2">{student.phone}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{student.email}</Typography>
                          </Box>
                          <Box display="flex" alignItems="flex-start">
                            <HomeIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.2 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {student.address}
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
