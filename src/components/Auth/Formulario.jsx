import React, { useState, useContext } from 'react';
// useNavigate removed (no usado)
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  Badge,
  Person,
  School,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Save,
} from '@mui/icons-material';
import { theme } from '../../theme/palette';

// Mapeo de grupos y sus detalles (obligatorio, deseable, niveles)
const GROUPS = {
  g1: {
    title: 'Grupo 1: Ingeniero de software, Desarrollador Full Stack (.NET/Angular)',
    obligatorio: [
      'NET Core, ASP.NET, y C++',
      'HTML, CSS, JavaScript',
      'Angular',
      'Base de datos SQL NoSQL',
      'Tecnología en la nube Azure o AWS',
    ],
    deseable: [
      'Back End (Node, java script, Python, etc.)',
      'Marcos de JavaScript/TypeScript',
      'Carteras CI/CD',
      'RESTful APIs',
    ],
  },
  g2: {
    title: 'Grupo 2: Ingeniero de software, Desarrollador Full Stack (.NET/Angular)',
    obligatorio: [
      'NET Core, ASP.NET, y C++',
      'HTML, CSS, JavaScript',
      'React',
      'Base de datos SQL NoSQL',
      'Tecnología en la nube Azure o AWS',
    ],
    deseable: [
      'Back End (Node, java script, Python, etc.)',
      'Marcos de JavaScript/TypeScript',
      'Carteras CI/CD',
      'RESTful APIs',
    ],
  },
  g3: {
    title: 'Grupo 3: Ingeniero de software, Desarrollador Full Stack (Java/Angular)',
    obligatorio: [
      'Java (8+) Spring Boot / Spring MVC, Seguridad Spring, Spring Data JPA',
      'APIs: RESTful APIs, manejo de JSON/XML',
      'JUnit, Mockito, Jest, Biblioteca React Testing',
      'HTML5, CSS3, JavaScript (ES6+)',
      'Angular o Vue.js',
    ],
    deseable: [
      'Estibador',
      'AWS, Azure o GCP',
      'PostgreSQL, MySQL, Oracle',
      'MongoDB, Redis',
      'Postman or Swagger',
    ],
  },
  g4: {
    title: 'Grupo 4: Ingeniero de software, Desarrollador Full Stack (Java/React)',
    obligatorio: [
      'Java (8+) Spring Boot / Spring MVC, Seguridad Spring, Spring Data JPA',
      'APIs: RESTful APIs, manejo de JSON/XML',
      'JUnit, Mockito, Jest, Biblioteca React Testing',
      'HTML5, CSS3, JavaScript (ES6+)',
      'React.js, Redux',
    ],
    deseable: [
      'Docker',
      'AWS, Azure o GCP',
      'PostgreSQL, MySQL, Oracle',
      'MongoDB, Redis',
      'Jenkins, GitHub Actions, GitLab CI',
    ],
  },
  g5: {
    title: 'Grupo 5: Ingeniero de Nube Azure',
    obligatorio: [
      'Servicios en la nube Azure',
      'Kubernetes (AKS) y contenedores',
      'Azure DevOps Pipelines y Acciones GitHub',
      'PowerShell or Python',
      'Formatos ARM / Procesos CI/CD',
    ],
    deseable: [
      'Ansible Tower y Terraform',
      'Azure SQL, Databricks, y otros servicios de Azure',
      'Certificaciones AZ-104, AZ-400, CKA, CKAD (de preferencia)',
    ],
  },
  g6: {
    title: 'Grupo 6: Ingeniero de Software Python',
    obligatorio: [
      'Python: programación orientada a objetos',
      'Librerías: Pandas, NumPy, SQL Connectors, Flask, Django',
      'APIs y marcadores de language XML y JSON',
    ],
    deseable: [
      'AWS',
      'Métodos estándar y procesos ETL',
      'Conocimiento de SQL/Postgres/MySQL y normalización',
    ],
  },
};

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
            <InputAdornment position="start">{icon}</InputAdornment>
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
          },
        }}
        sx={{
          '& label.Mui-focused': { color: theme.palette.primary.main },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
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
    estadoAcademico: '', // Nueva propiedad
    estado: '', // Regular/Irregular solo si es estudiante
    fulfilled: [], // lista de requisitos que el usuario cumple (strings)
    grupo: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'promedio') {
      let cleaned = value.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 1) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 1);
      }
      newValue = cleaned;
    }

    if (
      name === 'nombre' ||
      name === 'apellidoPaterno' ||
      name === 'apellidoMaterno' ||
      name === 'carrera' ||
      name === 'institucion'
    ) {
      newValue = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
      if (name === 'institucion' || name === 'carrera') {
        newValue = newValue.toUpperCase();
      }
    }

    if (name === 'telefonoCasa' || name === 'telefonoCelular') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    if (name === 'curp') {
      newValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 18);
    }

    setFormData({ ...formData, [name]: newValue });
    // Si cambia estadoAcademico y no es estudiante, limpiar estado
    if (name === 'estadoAcademico' && newValue !== 'estudiante') {
      setFormData((prev) => ({ ...prev, estado: '' }));
    }
    setError('');
  };


  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }
    // Abrir diálogo de confirmación en vez de enviar inmediatamente
    // Validar que se haya seleccionado un grupo
    if (!formData.grupo) {
      setError('Por favor selecciona un grupo antes de continuar.');
      return;
    }
    setConfirmOpen(true);
  };

  // lógica real de envío extraída para llamarla después de la confirmación
  const doSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError('');
    try {
      const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
      if (!formData.nombre || !nameRegex.test(formData.nombre)) throw new Error('El nombre solo debe contener letras y espacios');
      if (!formData.apellidoPaterno || !nameRegex.test(formData.apellidoPaterno)) throw new Error('El apellido paterno solo debe contener letras y espacios');
      if (!formData.apellidoMaterno || !nameRegex.test(formData.apellidoMaterno)) throw new Error('El apellido materno solo debe contener letras y espacios');
      if (!formData.institucion || !nameRegex.test(formData.institucion)) throw new Error('La institución solo debe contener letras y espacios');

      if (!formData.curp || formData.curp.length !== 18) throw new Error('La CURP debe tener exactamente 18 caracteres');
      if (!/^[A-Z0-9]+$/.test(formData.curp)) throw new Error('La CURP solo debe contener letras mayúsculas y números');

      if (!/^[0-9]{10}$/.test(formData.telefonoCasa)) throw new Error('El teléfono de casa debe contener exactamente 10 dígitos');
      if (!/^[0-9]{10}$/.test(formData.telefonoCelular)) throw new Error('El teléfono celular debe contener exactamente 10 dígitos');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.correoPersonal || !emailRegex.test(formData.correoPersonal)) throw new Error('Introduce un correo personal válido');

      if (!formData.promedio) throw new Error('Introduce tu promedio');
      if (!/^[0-9]+(?:\.[0-9])?$/.test(formData.promedio)) throw new Error('El promedio debe ser un número entero o con una sola cifra decimal (ej. 9, 9.0, 8.9)');

      // Validar estado académico
      if (!formData.estadoAcademico) throw new Error('Selecciona el estado académico');
      if (formData.estadoAcademico === 'estudiante' && !formData.estado) throw new Error('Selecciona si eres regular o irregular');

      const fd = new FormData();
      // Enviar el título legible del grupo (no solo el id)
      const payload = { ...formData };
      if (payload.grupo && GROUPS[payload.grupo]) {
        payload.grupo = GROUPS[payload.grupo].title;
      }
      // Guardar estado académico y condición en un solo campo si es necesario
      if (payload.estadoAcademico !== 'estudiante') {
        payload.estado = payload.estadoAcademico;
      }
      delete payload.estadoAcademico;

      // Añadir todos los campos excepto 'fulfilled' de forma estándar
      Object.keys(payload).forEach((k) => {
        if (k === 'fulfilled') return;
        fd.append(k, payload[k]);
      });

      // Enviar 'fulfilled' como JSON-string para preservar comas en los textos
      if (Array.isArray(payload.fulfilled)) {
        fd.append('fulfilled', JSON.stringify(payload.fulfilled));
      }

      const response = await fetch(API_CONFIG.FORMULATION_URL, { method: 'POST', body: fd });
      if (!response.ok) {
        let errorMessage = 'Error en el registro';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await response.json();
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <AnimatedTextField label="Nombre(s)" name="nombre" value={formData.nombre} onChange={handleChange} required icon={<Person />} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Apellido paterno" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} required icon={<Person />} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Apellido materno" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} required icon={<Person />} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="CURP" name="curp" value={formData.curp} onChange={handleChange} required helperText="18 caracteres, ejemplo: GARC800101HMCLNS09" inputProps={{ maxLength: 18 }} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Teléfono de casa" name="telefonoCasa" value={formData.telefonoCasa} onChange={handleChange} required type="tel" inputProps={{ inputMode: 'numeric', maxLength: 10 }} helperText="Ejemplo: 7121234567" sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Teléfono celular" name="telefonoCelular" value={formData.telefonoCelular} onChange={handleChange} required type="tel" inputProps={{ inputMode: 'numeric', maxLength: 10 }} helperText="Ejemplo: 7121234567" sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Correo personal" name="correoPersonal" value={formData.correoPersonal} onChange={handleChange} required type="email" helperText="Ejemplo: usuario@gmail.com" inputProps={{ maxLength: 254 }} sx={{ maxWidth: 500, width: '100%' }} />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <AnimatedTextField label="Institución" name="institucion" value={formData.institucion} onChange={handleChange} required icon={<Badge />} helperText="Escribe el nombre de tu institución (solo letras)" inputProps={{ maxLength: 100, style: { textTransform: 'uppercase' } }} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Carrera" name="carrera" value={formData.carrera} onChange={handleChange} required icon={<School />} helperText="Escribe tu carrera" inputProps={{ maxLength: 100, style: { textTransform: 'uppercase' } }} sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Promedio general" name="promedio" value={formData.promedio} onChange={handleChange} required type="text" inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', maxLength: 5 }} helperText="Ejemplo: 8.0, 8.5, 9" sx={{ maxWidth: 500, width: '100%' }} />
              <AnimatedTextField label="Estado académico" name="estadoAcademico" value={formData.estadoAcademico || ''} onChange={handleChange} required select icon={<School />} sx={{ maxWidth: 500, width: '100%' }}>
                <MenuItem value="">Selecciona estado académico</MenuItem>
                <MenuItem value="estudiante">Estudiante</MenuItem>
                <MenuItem value="egresado">Egresado</MenuItem>
                <MenuItem value="titulado">Titulado</MenuItem>
                <MenuItem value="no-titulado">No Titulado</MenuItem>
              </AnimatedTextField>

              {/* Mostrar subcampo solo si es estudiante */}
              {formData.estadoAcademico === 'estudiante' && (
                <AnimatedTextField label="Condición académica" name="estado" value={formData.estado} onChange={handleChange} required select icon={<School />} sx={{ maxWidth: 500, width: '100%' }}>
                  <MenuItem value="">Seleccione condición</MenuItem>
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="irregular">Irregular</MenuItem>
                </AnimatedTextField>
              )}

              <Box sx={{ mt: 2, textAlign: 'center', maxWidth: 500, width: '100%' }}>
                <Button 
                  variant="outlined" 
                  disabled
                  sx={{ 
                    mb: 1, 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1rem', 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    width: '100%',
                    cursor: 'not-allowed'
                  }}
                >
                  Adjuntar CV (PDF, máx 5MB)
                </Button>

                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                  Apartado en construcción
                </Typography>

                <AnimatedTextField label="Seleccione un grupo" name="grupo" value={formData.grupo} onChange={handleChange} select sx={{ mt: 2, maxWidth: 500, width: '100%' }}>
                  <MenuItem value="">Selecciona un grupo</MenuItem>
                  <MenuItem value="g1">Grupo 1: Ingeniero de software, Desarrollador Full Stack (.NET/Angular)</MenuItem>
                  <MenuItem value="g2">Grupo 2: Ingeniero de software, Desarrollador Full Stack (.NET/Angular)</MenuItem>
                  <MenuItem value="g3">Grupo 3: Ingeniero de software, Desarrollador Full Stack (Java/Angular)</MenuItem>
                  <MenuItem value="g4">Grupo 4: Ingeniero de software, Desarrollador Full Stack (Java/React)</MenuItem>
                  <MenuItem value="g5">Grupo 5: Ingeniero de Nube Azure</MenuItem>
                  <MenuItem value="g6">Grupo 6: Ingeniero de Software Python</MenuItem>
                </AnimatedTextField>

                {/* Render dinámico de detalles según el grupo seleccionado */}
                {formData.grupo && GROUPS[formData.grupo] && (
                  <Box sx={{ mt: 3, bgcolor: '#e9e9ea', p: 2, borderRadius: 1, maxWidth: 780, width: '100%', textAlign: 'left' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{GROUPS[formData.grupo].title}</Typography>
                    <Grid container spacing={1} sx={{ bgcolor: '#f3f3f4', p: 2 }}>
                      <Grid item xs={5}>
                        <Typography variant="subtitle2" fontWeight="bold">Obligatorio</Typography>
                        <FormGroup>
                          {GROUPS[formData.grupo].obligatorio.map((t, i) => (
                            <FormControlLabel
                              key={`ob-${i}`}
                              control={<Checkbox checked={formData.fulfilled.includes(t)} onChange={() => {
                                setFormData(prev => {
                                  const has = prev.fulfilled.includes(t);
                                  return { ...prev, fulfilled: has ? prev.fulfilled.filter(x => x !== t) : [...prev.fulfilled, t] };
                                });
                              }} />}
                              label={<Typography variant="body2">{t}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" fontWeight="bold">Deseable</Typography>
                        <FormGroup>
                          {GROUPS[formData.grupo].deseable.map((t, i) => (
                            <FormControlLabel
                              key={`de-${i}`}
                              control={<Checkbox checked={formData.fulfilled.includes(t)} onChange={() => {
                                setFormData(prev => {
                                  const has = prev.fulfilled.includes(t);
                                  return { ...prev, fulfilled: has ? prev.fulfilled.filter(x => x !== t) : [...prev.fulfilled, t] };
                                });
                              }} />}
                              label={<Typography variant="body2">{t}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2" fontWeight="bold">Niveles</Typography>
                        <FormGroup>
                          {[
                            { key: 'nuevo-ingreso', title: 'Nuevo ingreso', desc: '0 Recién graduado' },
                            { key: 'junior', title: 'Junior', desc: '1 a 3' },
                            { key: 'intermedio', title: 'Intermedio', desc: '3 a 5' },
                            { key: 'experto', title: 'Experto', desc: '5 a 10' },
                            { key: 'lider', title: 'Líder', desc: '+10' },
                          ].map((lvl) => (
                            <FormControlLabel
                              key={lvl.key}
                              control={<Checkbox checked={formData.fulfilled.includes(lvl.title)} onChange={() => {
                                setFormData(prev => {
                                  const has = prev.fulfilled.includes(lvl.title);
                                  return { ...prev, fulfilled: has ? prev.fulfilled.filter(x => x !== lvl.title) : [...prev.fulfilled, lvl.title] };
                                });
                              }} />}
                              label={<span><strong>{lvl.title}</strong> — {lvl.desc}</span>}
                            />
                          ))}
                        </FormGroup>
                      </Grid>
                    </Grid>
                  </Box>
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
          <Paper elevation={8} sx={{ borderRadius: 0, overflow: 'visible', backgroundColor: 'background.paper', width: '100vw', maxWidth: '100vw', margin: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
            <Box sx={{ p: 4, bgcolor: theme.palette.primary.main, color: 'white', textAlign: 'center', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
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
                    <Alert severity="error" variant="filled" sx={{ mt: 2, fontSize: '1rem' }}>{error}</Alert>
                  </Grow>
                )}

                {success && (
                  <Grow in={success} timeout={500}>
                    <Alert severity="success" variant="filled" sx={{ mt: 2, fontSize: '1rem' }}>
                      ¡Registro guardado exitosamente! La página se recargará...
                    </Alert>
                  </Grow>
                )}

                {success && (
                  <Box sx={{ mt: 4, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Datos registrados:</Typography>
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
                      <li><strong>Estado académico:</strong> {formData.estadoAcademico === 'estudiante' ? (formData.estado === 'regular' ? 'Estudiante Regular' : formData.estado === 'irregular' ? 'Estudiante Irregular' : '') : formData.estadoAcademico ? formData.estadoAcademico.charAt(0).toUpperCase() + formData.estadoAcademico.slice(1).replace('-', ' ') : ''}</li>
                      <li><strong>Grupo:</strong> {formData.grupo}</li>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                  <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<KeyboardArrowLeft />} sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 'none' }}>Anterior</Button>
                  <Button variant="contained" onClick={handleSubmit} endIcon={activeStep === steps.length - 1 ? <Save /> : <KeyboardArrowRight />} disabled={loading} sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 'none' }}>
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : activeStep === steps.length - 1 ? 'Registrarse' : 'Siguiente'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
        </Container>

        {/* Dialog de confirmación */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirmar envío</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro que deseas guardar el formulario?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>No</Button>
            <Button onClick={doSubmit} variant="contained">Sí</Button>
          </DialogActions>
        </Dialog>

      </ThemeProvider>
    );
}