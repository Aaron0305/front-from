import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api.js';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
  InputAdornment,
  CircularProgress,
  ThemeProvider,
  Grow,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  Badge,
  Person,
  School,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Save
} from '@mui/icons-material';
import { theme } from '../../theme/palette';

// Componente de campo de entrada animado
const AnimatedTextField = ({ label, type, value, onChange, icon, endAdornment, select, children, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasIcon = Boolean(icon);

  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
      <TextField
        label={label}
        type={type}
        fullWidth
        variant="outlined"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        select={select}
        InputLabelProps={{
          shrink: focused || Boolean(value),
          sx: hasIcon ? { left: '44px' } : {},
        }}
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
  const [activeStep, setActiveStep] = useState(0);
  const [foto, setFoto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    telefonoCasa: '',
    telefonoCelular: '',
    correoPersonal: '',
    correoInstitucional: '',
    claveEscuela: '',
    carrera: '',
    promedio: '',
    estado: '', // regular o irregular
    // account fields removed intentionally
  });
  const [cvPdf, setCvPdf] = useState(null);
  const [cvError, setCvError] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, checkNumeroControlExists } = useContext(AuthContext);
  const navigate = useNavigate();

  // (se removió carga de carreras innecesaria)

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Saneamiento según campo
    let newValue = value;
    // Para el campo 'promedio' permitir números y punto decimal
    if (name === 'promedio') {
      newValue = value.replace(/[^0-9.]/g, '');
    }
  // Para nombre, apellidos y carrera permitir solo letras, espacios, guiones y apóstrofes
  if (name === 'nombre' || name === 'apellidoPaterno' || name === 'apellidoMaterno' || name === 'carrera') {
      // Permite letras latinas acentuadas, espacios, guion y apóstrofe
      newValue = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
    }
    // Para teléfonos permitir solo dígitos
    if (name === 'telefonoCasa' || name === 'telefonoCelular') {
      newValue = value.replace(/[^0-9]/g, '');
    }
    setFormData({
      ...formData,
      [name]: newValue
    });
    setError('');
  };

  // (se removió verificación de email de cuenta)

  // (verificación de número de control removida si no se usa en UI)

  const handleShowPassword = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // (manejo de número de control removido)

  // (manejo de foto simplificado — guardamos archivo si se provee)
  const handleFotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }
    setFoto(file);
  };

  // Manejo de carga de PDF académico
  const handleCvChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setCvError('Solo se permiten archivos PDF');
      setCvPdf(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('El archivo no debe superar los 5MB');
      setCvPdf(null);
      return;
    }
    setCvPdf(file);
    setCvError('');
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }
    
    setLoading(true);
    setError('');
    
  try {
      // Validaciones de nombres: solo letras y espacios
      const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
      if (!formData.nombre || !nameRegex.test(formData.nombre)) throw new Error('El nombre solo debe contener letras y espacios');
      if (!formData.apellidoPaterno || !nameRegex.test(formData.apellidoPaterno)) throw new Error('El apellido paterno solo debe contener letras y espacios');
      if (!formData.apellidoMaterno || !nameRegex.test(formData.apellidoMaterno)) throw new Error('El apellido materno solo debe contener letras y espacios');

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (foto) {
        formDataToSend.append('fotoPerfil', foto);
      }
      if (cvPdf) {
        formDataToSend.append('pdf', cvPdf);
      }
      // Enviar el formulario al endpoint correcto y aumentar el timeout
      const response = await fetch('/api/formulation', {
        method: 'POST',
        body: formDataToSend,
        headers: {},
        timeout: 30000 // 30 segundos
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el registro');
      }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Información Personal', 'Información Académica'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AnimatedTextField
                  label="Nombre(s)"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  icon={<Person />}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      left: 56,
                      background: 'white',
                      px: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '2px',
                        background: 'inherit',
                        zIndex: 1,
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <Person />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <AnimatedTextField
                  label="Apellido paterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                  icon={<Person />}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      left: 56,
                      background: 'white',
                      px: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '2px',
                        background: 'inherit',
                        zIndex: 1,
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <Person />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <AnimatedTextField
                  label="Apellido materno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  required
                  icon={<Person />}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      left: 56,
                      background: 'white',
                      px: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '2px',
                        background: 'inherit',
                        zIndex: 1,
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <Person />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AnimatedTextField
                  label="CURP"
                  name="curp"
                  value={formData.curp}
                  onChange={handleChange}
                  required
                  helperText="18 caracteres, ejemplo: GARC800101HMCLNS09"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <AnimatedTextField
                  label="Teléfono celular"
                  name="telefonoCelular"
                  value={formData.telefonoCelular}
                  onChange={handleChange}
                  required
                  type="tel"
                  inputProps={{ inputMode: 'numeric' }}
                  helperText="Ejemplo: 7121234567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AnimatedTextField
                  label="Correo personal"
                  name="correoPersonal"
                  value={formData.correoPersonal}
                  onChange={handleChange}
                  required
                  type="email"
                  helperText="Ejemplo: usuario@gmail.com"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <AnimatedTextField
                  label="Clave de la escuela"
                  name="claveEscuela"
                  value={formData.claveEscuela}
                  onChange={handleChange}
                  required
                  icon={<Badge />}
                  helperText="Escribe tu número de control escolar"
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      left: 56,
                      background: 'white',
                      px: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '2px',
                        background: 'inherit',
                        zIndex: 1,
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <Badge />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedTextField
                  label="Carrera"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                  required
                  icon={<School />}
                  helperText="Escribe tu carrera"
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      left: 56,
                      background: 'white',
                      px: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '2px',
                        background: 'inherit',
                        zIndex: 1,
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <School />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedTextField
                  label="Promedio general"
                  name="promedio"
                  value={formData.promedio}
                  onChange={handleChange}
                  required
                  type="text"
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                  helperText="Ejemplo: 8.0, 8.5, 9"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <AnimatedTextField
                  label="Estado académico"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  select
                  icon={<School />}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1, mr: 0.5 }}>
                        <School />
                      </InputAdornment>
                    ),
                    sx: { pl: 5.5 }
                  }}
                >
                  <MenuItem value="">Selecciona estado</MenuItem>
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="irregular">Irregular</MenuItem>
                </AnimatedTextField>
              </Grid>

              <Grid item xs={12} md={12}>
                <Button
                  variant="outlined"
                  component="label"
                  color={cvError ? 'error' : 'primary'}
                  sx={{ mt: 2, mb: 1 }}
                >
                  Adjuntar documento académico (PDF, máx. 5MB)
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleCvChange}
                  />
                </Button>
                {cvPdf && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Archivo seleccionado: {cvPdf.name}
                  </Typography>
                )}
                {cvError && (
                  <Alert severity="error" sx={{ mt: 1 }}>{cvError}</Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 0, minWidth: '100vw', bgcolor: '#f5f6fa', mt: { xs: 8, md: 8 } }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 0,
              overflow: 'visible',
              backgroundColor: 'background.paper',
              width: '100vw',
              maxWidth: '100vw',
              margin: 0,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                textAlign: 'center',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ letterSpacing: 1 }}>
                Registro de Candidatos
              </Typography>
              <Typography variant="subtitle1" sx={{ fontSize: '1.1rem', opacity: 0.95 }}>
                Completa el Formulario para Finalizar tu Registro
              </Typography>
            </Box>

            <Box sx={{ width: '100%', p: 5, pt: 3, maxWidth: '1600px', margin: '0 auto' }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ fontSize: '1.1rem' }}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                {renderStepContent(activeStep)}

                {error && (
                  <Grow in={!!error} timeout={500}>
                    <Alert
                      severity="error"
                      variant="filled"
                      sx={{ mt: 2, fontSize: '1rem' }}
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
                      sx={{ mt: 2, fontSize: '1rem' }}
                    >
                      ¡Registro exitoso! Redirigiendo al inicio de sesión...
                    </Alert>
                  </Grow>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<KeyboardArrowLeft />}
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 'none' }}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    endIcon={activeStep === steps.length - 1 ? <Save /> : <KeyboardArrowRight />}
                    disabled={loading}
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 'none' }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : activeStep === steps.length - 1 ? (
                      'Registrarse'
                    ) : (
                      'Siguiente'
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </ThemeProvider>
  );
}