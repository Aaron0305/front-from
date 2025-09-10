import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    IconButton, 
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
    Grid,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { Menu as MenuIcon, Visibility, GetApp, Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_CONFIG } from '../../config/api.js';

// Componente estilizado para el header
const HeaderBox = styled(Box)(() => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
}));

// Componente estilizado para la tabla
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    '& .MuiTableCell-head': {
        backgroundColor: '#f5f7fa',
        fontWeight: 600,
        color: '#1976d2',
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
}));

export default function Structure() {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        carrera: '',
        estado: '',
        promedioMin: '',
        promedioMax: ''
    });

    useEffect(() => {
        const fetchRegistros = async () => {
            try {
                const response = await fetch(API_CONFIG.FORMULATION_URL);
                if (!response.ok) {
                    throw new Error('Error al obtener los registros');
                }
                const data = await response.json();
                setRegistros(data);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError('Error al cargar los registros');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistros();
    }, []);

    const handleVerDocumento = (pdfUrl) => {
        window.open(pdfUrl, '_blank');
    };

    const handleDescargarDocumento = async (pdfUrl, fileName) => {
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'documento.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error al descargar:', error);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const registrosFiltrados = registros.filter(registro => {
        const nombreCompleto = `${registro.nombre} ${registro.apellidoPaterno} ${registro.apellidoMaterno}`.toLowerCase();
        const busquedaLower = filtros.busqueda.toLowerCase();
        const cumpleBusqueda = !filtros.busqueda || 
            nombreCompleto.includes(busquedaLower) ||
            registro.curp.toLowerCase().includes(busquedaLower) ||
            registro.correoPersonal.toLowerCase().includes(busquedaLower);
        
        const cumpleCarrera = !filtros.carrera || registro.carrera === filtros.carrera;
        const cumpleEstado = !filtros.estado || registro.estado === filtros.estado;
        const cumplePromedioMin = !filtros.promedioMin || parseFloat(registro.promedio) >= parseFloat(filtros.promedioMin);
        const cumplePromedioMax = !filtros.promedioMax || parseFloat(registro.promedio) <= parseFloat(filtros.promedioMax);

        return cumpleBusqueda && cumpleCarrera && cumpleEstado && cumplePromedioMin && cumplePromedioMax;
    });

    // Obtener lista única de carreras para el filtro
    const carreras = [...new Set(registros.map(r => r.carrera))].filter(Boolean);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            bgcolor: '#f8fafc',
            padding: 3,
            pt: 10,
        }}>
            <HeaderBox>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    px: 2,
                }}>
                    <IconButton
                        color="inherit"
                        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                        sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 600,
                            flexGrow: 1,
                            letterSpacing: '0.5px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        Panel de Administración
                    </Typography>
                    <Button
                        variant="contained"
                        href="/Register"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '10px',
                            boxShadow: 'none'
                        }}
                    >
                        Registro de nuevo administrador
                    </Button>
                </Box>
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        opacity: 0.9, 
                        fontWeight: 300,
                        px: 2,
                        pb: 2
                    }}
                >
                    Consulta registros y administración del sistema
                </Typography>
            </HeaderBox>

            {/* Filtros */}
            <Paper 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
            >
                <Grid 
                    container 
                    spacing={3} 
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        '& .MuiTextField-root': {
                            '& .MuiInputBase-root': {
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                height: '45px'
                            },
                            '& .MuiInputLabel-root': {
                                color: '#64748b',
                                fontSize: '0.875rem',
                                transform: 'translate(14px, 12px) scale(1)'
                            },
                            '& .MuiInputLabel-shrink': {
                                transform: 'translate(14px, -9px) scale(0.75)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                fontSize: '0.875rem'
                            },
                            '& .MuiSelect-select': {
                                fontSize: '0.875rem',
                                padding: '8px 14px'
                            },
                            '& input': {
                                fontSize: '0.875rem',
                                padding: '8px 14px'
                            }
                        }
                    }}
                >
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Buscar por nombre, CURP o correo"
                            sx={{ minWidth: '250px' }}
                            value={filtros.busqueda}
                            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Carrera"
                            sx={{ minWidth: '300px' }}
                            value={filtros.carrera}
                            onChange={(e) => handleFiltroChange('carrera', e.target.value)}
                        >
                            <MenuItem value="">Todas las carreras</MenuItem>
                            {carreras.map((carrera) => (
                                <MenuItem key={carrera} value={carrera}>
                                    {carrera}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Estado académico"
                            sx={{ minWidth: '300px' }}
                            value={filtros.estado}
                            onChange={(e) => handleFiltroChange('estado', e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="regular">Regular</MenuItem>
                            <MenuItem value="irregular">Irregular</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Promedio mínimo"
                            sx={{ minWidth: '150px' }}
                            type="number"
                            value={filtros.promedioMin}
                            onChange={(e) => handleFiltroChange('promedioMin', e.target.value)}
                            inputProps={{ 
                                step: "0.1", 
                                min: "0", 
                                max: "10",
                                style: { textAlign: 'center' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Promedio máximo"
                            sx={{ minWidth: '150px' }}
                            type="number"
                            value={filtros.promedioMax}
                            onChange={(e) => handleFiltroChange('promedioMax', e.target.value)}
                            inputProps={{ 
                                step: "0.1", 
                                min: "0", 
                                max: "10",
                                style: { textAlign: 'center' }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabla de Registros */}
            <StyledTableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>CURP</TableCell>
                            <TableCell>Teléfonos</TableCell>
                            <TableCell>Correo Personal</TableCell>
                            <TableCell>Institución</TableCell>
                            <TableCell>Carrera</TableCell>
                            <TableCell>Promedio</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Documentos</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ color: 'error.main' }}>
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : registrosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    {registros.length === 0 ? 'No hay registros disponibles' : 'No se encontraron resultados con los filtros aplicados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            registrosFiltrados.map((registro, index) => (
                                <TableRow key={registro._id || index}>
                                    <TableCell>
                                        {`${registro.nombre} ${registro.apellidoPaterno} ${registro.apellidoMaterno}`}
                                    </TableCell>
                                    <TableCell>{registro.curp}</TableCell>
                                    <TableCell>
                                        <div>Casa: {registro.telefonoCasa}</div>
                                        <div>Cel: {registro.telefonoCelular}</div>
                                    </TableCell>
                                    <TableCell>{registro.correoPersonal}</TableCell>
                                    <TableCell>{registro.institucion}</TableCell>
                                    <TableCell>{registro.carrera}</TableCell>
                                    <TableCell>{registro.promedio}</TableCell>
                                    <TableCell>
                                        {registro.estado === 'regular' ? 'Regular' : 'Irregular'}
                                    </TableCell>
                                    <TableCell>
                                        {registro.pdfUrl ? (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleVerDocumento(registro.pdfUrl)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() => handleDescargarDocumento(registro.pdfUrl, `cv_${registro.nombre}.pdf`)}
                                                >
                                                    <GetApp />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            'No disponible'
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        </Box>
    );
}
