import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  CircularProgress,
  ThemeProvider,
  Grow,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Save
} from '@mui/icons-material';
import { theme } from '../../theme/palette';

// Componente de campo de entrada animado
const AnimatedTextField = ({ label, type, value, onChange, icon, endAdornment, select, children, ...props }) => {
  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
      <TextField
        label={label}
        type={type}
        fullWidth
        variant="outlined"
        value={value}
        onChange={onChange}
        select={select}
        InputProps={{
          startAdornment: icon && (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ),
          endAdornment: endAdornment,
          sx: {
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
            transition: 'all 0.3s ease-in-out',
          }
        }}
        sx={{
          '& label.Mui-focused': {
            color: theme.palette.primary.main,
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
          mb: 2,
        }}
        {...props}
      >
        {children}
      </TextField>
    </Grow>
  );
};

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' // Se establece automáticamente como admin
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, checkEmailExists } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  // Verificación de email al perder el foco
  const handleEmailBlur = async () => {
    if (formData.email.trim() !== '') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@tesjo\.edu\.mx$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor, introduce un correo válido (ejemplo: usuario@tesjo.edu.mx)');
        return;
      }
      try {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setError('Este correo electrónico ya está registrado');
        }
      } catch (err) {
        console.error('Error al verificar email:', err);
      }
    }
  };

  const handleShowPassword = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      // El role ya está establecido automáticamente como 'admin'
      if (!formData.role) {
        throw new Error('Error en la configuración del rol');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Crear objeto con los datos necesarios + campos requeridos por el backend
      const dataToSend = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        // Campos que el backend espera pero no mostramos en el frontend
        numeroControl: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        carrera: ''
      };

      console.log('Datos de registro a enviar:', dataToSend);
      
      const response = await register(dataToSend);
      console.log('Respuesta del registro:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Error en el registro');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (err) {
      console.error('Error en el registro:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: 'background.paper'
            }}
          >
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Registro de Nuevo Administrador 
              </Typography>
              <Typography variant="subtitle1">
                Completa el formulario para crear tu cuenta
              </Typography>
            </Box>

            <Box sx={{ width: '100%', p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <AnimatedTextField
                  label="Correo Electrónico"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                  icon={<Email />}
                  helperText="Ingresa tu correo (ejemplo: usuario@tesjo.edu.mx)"
                />
                
                <AnimatedTextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon={<Lock />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleShowPassword('password')}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                
                <AnimatedTextField
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  icon={<Lock />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleShowPassword('confirm')}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                
                {/* Campo de rol oculto - solo se muestra el de administrador */}
                <FormControl fullWidth required sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Rol"
                    required
                  >
                    {/* El role de docente está en el código pero no se muestra visualmente */}
                    <MenuItem value="docente" style={{ display: 'none' }}>Docente</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                  <FormHelperText>
                    Rol de Administrador seleccionado automáticamente
                  </FormHelperText>
                </FormControl>

                {error && (
                  <Grow in={!!error} timeout={500}>
                    <Alert
                      severity="error"
                      variant="filled"
                      sx={{ mt: 2 }}
                    >
                      {error}
                    </Alert>
                  </Grow>
                )}

                {success && (
                  <Grow in={success} timeout={500}>
                    <Alert
                      severity="success"
                      variant="filled"
                      sx={{ mt: 2 }}
                    >
                      ¡Registro exitoso! Redirigiendo al inicio de sesión...
                    </Alert>
                  </Grow>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<Save />}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : (
                      'Registrarse'
                    )}
                  </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Inicia sesión aquí
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </ThemeProvider>
  );
}