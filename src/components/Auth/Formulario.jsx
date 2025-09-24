import React, { useState, useContext } from 'react';
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
  // foto no utilizada actualmente
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    telefonoCasa: '',
    telefonoCelular: '',
    correoPersonal: '',
    correoInstitucional: '',
  institucion: '',
    carrera: '',
    promedio: '',
    estado: '', // regular o irregular
    // account fields removed intentionally
  });
  const [cvPdf, setCvPdf] = useState(null);
  const [cvError, setCvError] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  useContext(AuthContext);
  const navigate = useNavigate();

  // (se removió carga de carreras innecesaria)

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Saneamiento según campo
    let newValue = value;
    // Para el campo 'promedio' permitir números y punto decimal
    if (name === 'promedio') {
      // eliminar caracteres no válidos
      let cleaned = value.replace(/[^0-9.]/g, '');
      // permitir solo el primer punto
      const parts = cleaned.split('.');
      if (parts.length > 1) {
        // mantener solo una cifra decimal (p. ej. 8.9) y descartar más
        cleaned = parts[0] + '.' + parts[1].slice(0, 1);
      }
      newValue = cleaned;
    }
  // Para nombre, apellidos, carrera e institución permitir solo letras, espacios, guiones y apóstrofes
  if (name === 'nombre' || name === 'apellidoPaterno' || name === 'apellidoMaterno' || name === 'carrera' || name === 'institucion') {
      // Permite letras latinas acentuadas, espacios, guion y apóstrofe
      newValue = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
      // Forzar mayúsculas en institución y carrera
      if (name === 'institucion' || name === 'carrera') {
        newValue = newValue.toUpperCase();
      }
    }
    // Para teléfonos permitir solo dígitos y limitar a 10 caracteres
    if (name === 'telefonoCasa' || name === 'telefonoCelular') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    // Para CURP permitir solo letras y números, convertir a mayúsculas y limitar a 18
    if (name === 'curp') {
      newValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 18);
    }
    setFormData({
      ...formData,
      [name]: newValue
    });
    setError('');
  };

  // (se removió verificación de email de cuenta)

  // (verificación de número de control removida si no se usa en UI)

  // (manejo de foto simplificado — guardamos archivo si se provee)
  // Nota: la carga de foto se mantiene pero el input no está en el formulario actual.

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
      // Validación de institución: solo letras y espacios
      if (!formData.institucion || !nameRegex.test(formData.institucion)) throw new Error('La institución solo debe contener letras y espacios');

  // Validación CURP: exactamente 18 caracteres alfanuméricos
  if (!formData.curp || formData.curp.length !== 18) throw new Error('La CURP debe tener exactamente 18 caracteres');
  if (!/^[A-Z0-9]+$/.test(formData.curp)) throw new Error('La CURP solo debe contener letras mayúsculas y números');

  // Validación teléfonos: exactamente 10 dígitos
  if (!/^[0-9]{10}$/.test(formData.telefonoCasa)) throw new Error('El teléfono de casa debe contener exactamente 10 dígitos');
  if (!/^[0-9]{10}$/.test(formData.telefonoCelular)) throw new Error('El teléfono celular debe contener exactamente 10 dígitos');

  // Validación de correo electrónico (personal)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.correoPersonal || !emailRegex.test(formData.correoPersonal)) throw new Error('Introduce un correo personal válido');

  // Validación de promedio: entero o con una sola cifra decimal (ej. 9, 9.0, 8.9) pero no 8.88
  if (!formData.promedio) throw new Error('Introduce tu promedio');
  if (!/^[0-9]+(?:\.[0-9])?$/.test(formData.promedio)) throw new Error('El promedio debe ser un número entero o con una sola cifra decimal (ej. 9, 9.0, 8.9)');

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (cvPdf) {
        formDataToSend.append('pdf', cvPdf);
      }

      // Enviar el formulario al endpoint correcto
      const response = await fetch(API_CONFIG.FORMULATION_URL, {
        method: 'POST',
        body: formDataToSend,
        // No incluir Content-Type header para FormData
      });

      if (!response.ok) {
        let errorMessage = 'Error en el registro';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar el status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Registro exitoso:', result);
      setSuccess(true);
      
      // ***** CAMBIO REALIZADO AQUÍ *****
      // Muestra el mensaje de éxito y después de 1.5 segundos, recarga la página.
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error al registrar:', err);
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <AnimatedTextField
                label="Nombre(s)"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                icon={<Person />}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Apellido paterno"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                required
                icon={<Person />}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Apellido materno"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                required
                icon={<Person />}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="CURP"
                name="curp"
                value={formData.curp}
                onChange={handleChange}
                required
                helperText="18 caracteres, ejemplo: GARC800101HMCLNS09"
                inputProps={{ maxLength: 18 }}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Teléfono de casa"
                name="telefonoCasa"
                value={formData.telefonoCasa}
                onChange={handleChange}
                required
                type="tel"
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                helperText="Ejemplo: 7121234567"
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Teléfono celular"
                name="telefonoCelular"
                value={formData.telefonoCelular}
                onChange={handleChange}
                required
                type="tel"
                inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                helperText="Ejemplo: 7121234567"
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Correo personal"
                name="correoPersonal"
                value={formData.correoPersonal}
                onChange={handleChange}
                required
                type="email"
                helperText="Ejemplo: usuario@gmail.com"
                inputProps={{ maxLength: 254 }}
                sx={{ maxWidth: 500, width: '100%' }}
              />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <AnimatedTextField
                label="Institución"
                name="institucion"
                value={formData.institucion}
                onChange={handleChange}
                required
                icon={<Badge />}
                helperText="Escribe el nombre de tu institución (solo letras)"
                inputProps={{ maxLength: 100, style: { textTransform: 'uppercase' } }}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Carrera"
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                required
                icon={<School />}
                helperText="Escribe tu carrera"
                inputProps={{ maxLength: 100, style: { textTransform: 'uppercase' } }}
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Promedio general"
                name="promedio"
                value={formData.promedio}
                onChange={handleChange}
                required
                type="text"
                inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', maxLength: 5 }}
                helperText="Ejemplo: 8.0, 8.5, 9"
                sx={{ maxWidth: 500, width: '100%' }}
              />
              <AnimatedTextField
                label="Estado académico"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                select
                icon={<School />}
                sx={{ maxWidth: 500, width: '100%' }}
              >
                <MenuItem value="">Selecciona estado</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="irregular">Irregular</MenuItem>
              </AnimatedTextField>

              <Box sx={{ mt: 2, textAlign: 'center', maxWidth: 500, width: '100%' }}>
                  <Button
                          variant="outlined"
                          component="label"
                          color={cvError ? 'error' : 'primary'}
                          sx={{ 
                              mb: 1,
                              px: 4,
                              py: 1.5,
                              fontSize: '1rem',
                              borderRadius: 2,
                              textTransform: 'none',
                              width: '100%'
                          }}
                      >
                          Adjuntar CV (PDF, máx 5MB)
                          <input
                              type="file"
                              hidden
                              accept="application/pdf"
                              onChange={handleCvChange}
                          />
                      </Button>

                      {/* --- INICIO DE LA MODIFICACIÓN --- */}

                      {/* Se muestra solo si NO hay un archivo seleccionado */}
                      {!cvPdf && (
                          <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                              La subida del archivo es opcional.
                          </Typography>
                      )}

                      {/* Se muestra solo si SÍ hay un archivo seleccionado */}
                      {cvPdf && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                              Archivo seleccionado: {cvPdf.name}
                          </Typography>
                      )}
                {cvError && (
                  <Alert severity="error" sx={{ mt: 1 }}>{cvError}</Alert>
                )}
              </Box>
            </Box>
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
                      ¡Registro guardado exitosamente! La página se recargará...
                    </Alert>
                  </Grow>
                )}
                {/* Mostrar datos en forma de lista profesional al registrar */}
                {success && (
                  <Box sx={{ mt: 4, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Datos registrados:
                    </Typography>
                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                      <li><strong>Nombre:</strong> {formData.nombre}</li>
                      <li><strong>Apellido paterno:</strong> {formData.apellidoPaterno}</li>
                      <li><strong>Apellido materno:</strong> {formData.apellidoMaterno}</li>
                      <li><strong>CURP:</strong> {formData.curp}</li>
                      <li><strong>Teléfono de casa:</strong> {formData.telefonoCasa}</li>
                      <li><strong>Teléfono celular:</strong> {formData.telefonoCelular}</li>
                      <li><strong>Correo personal:</strong> {formData.correoPersonal}</li>
                      <li><strong>Institución:</strong> {formData.institucion}</li>
                      <li><strong>Carrera:</strong> {formData.carrera}</li>
                      <li><strong>Promedio general:</strong> {formData.promedio}</li>
                      <li><strong>Estado académico:</strong> {formData.estado === 'regular' ? 'Regular' : 'Irregular'}</li>
                    </Box>
                  </Box>
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