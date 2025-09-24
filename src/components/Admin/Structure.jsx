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
    InputAdornment,
    TablePagination,
    Chip,
    Tooltip,
    Card,
    CardContent,
    Fade,
    Zoom
} from '@mui/material';
import { 
    Menu as MenuIcon, 
    GetApp, 
    Search as SearchIcon, 
    FileDownload,
    FilterList,
    Clear,
    Person,
    School,
    Grade
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_CONFIG } from '../../config/api.js';

// Componente estilizado para el header
const HeaderBox = styled(Box)(() => ({
    background: 'linear-gradient(135deg,rgb(0, 27, 149) 0%,rgb(0, 35, 131) 100%)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
}));

// Componente estilizado para la tabla
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '20px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    '& .MuiTableCell-head': {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontWeight: 700,
        color: '#1e293b',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '2px solid #e2e8f0',
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.04)',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease-in-out',
    },
    '& .MuiTableCell-body': {
        fontSize: '0.875rem',
        padding: '16px',
    }
}));

// Componente estilizado para las cards de estadísticas
const StatsCard = styled(Card)(() => ({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    }
}));

export default function Structure() {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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

    const normalizePdfUrl = (url) => {
        if (!url) return url;
        let u = url.replace('http://', 'https://');
        u = u
            .replace('/image/upload/', '/raw/upload/')
            .replace('/upload/fl_attachment:false/', '/upload/')
            .replace('/raw/upload/fl_attachment:false/', '/raw/upload/')
            .replace(/\/upload\/fl_attachment:[^/]+\//, '/upload/');
        return u;
    };

    const buildDownloadUrl = (url, fileName) => {
        let safeName = (fileName || 'documento.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        if (!/\.pdf$/i.test(safeName)) safeName += '.pdf';
        const u = normalizePdfUrl(url);
        if (!u) return u;
        const parts = u.split('/upload/');
        if (parts.length !== 2) return u;
        return `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
    };

    const handleDescargarDocumento = (pdfUrl, fileName) => {
        const downloadUrl = buildDownloadUrl(pdfUrl, fileName || 'documento.pdf');
        if (!downloadUrl) return;
        window.open(downloadUrl, '_self');
    };

    // Función para exportar a CSV de manera correcta y compatible
    const exportToCSV = () => {
        const headers = [
            'Nombre',
            'Apellido Paterno',
            'Apellido Materno',
            'CURP',
            'Teléfono Casa',
            'Teléfono Celular',
            'Correo Personal',
            'Institución',
            'Carrera',
            'Promedio',
            'Estado'
        ];

        // Función auxiliar para sanear y formatear cada celda del CSV
        const formatCell = (field) => {
            // Si el campo es nulo o indefinido, lo tratamos como texto vacío
            let cell = field === null || field === undefined ? '' : String(field);
            // Si el texto contiene comillas, las escapamos duplicándolas
            cell = cell.replace(/"/g, '""');
            // Siempre envolvemos la celda en comillas dobles para manejar comas y espacios
            return `"${cell}"`;
        };

        // Mapeamos los registros filtrados al formato de fila CSV
        const csvData = registrosFiltrados.map(registro => [
            registro.nombre,
            registro.apellidoPaterno,
            registro.apellidoMaterno,
            registro.curp,
            registro.telefonoCasa,
            registro.telefonoCelular,
            registro.correoPersonal,
            registro.institucion,
            registro.carrera,
            registro.promedio,
            registro.estado === 'regular' ? 'Regular' : 'Irregular'
        ].map(formatCell).join(','));

        // Unimos los encabezados y las filas de datos
        const csvContent = [headers.join(','), ...csvData].join('\n');

        // Creamos el Blob con el BOM para UTF-8, esto soluciona los problemas de acentos en Excel
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Creamos un enlace temporal para iniciar la descarga
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `registros_estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPage(0); // Resetear paginación al filtrar
    };

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            carrera: '',
            estado: '',
            promedioMin: '',
            promedioMax: ''
        });
        setPage(0);
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

    // Paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedRegistros = registrosFiltrados.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Obtener lista única de carreras para el filtro
    const carreras = [...new Set(registros.map(r => r.carrera))].filter(Boolean);

    // Estadísticas
    const totalEstudiantes = registros.length;
    const estudiantesRegulares = registros.filter(r => r.estado === 'regular').length;
    const promedioGeneral = registros.length > 0 ? 
        (registros.reduce((sum, r) => sum + parseFloat(r.promedio || 0), 0) / registros.length).toFixed(2) : 0;

    const filtrosActivos = Object.values(filtros).some(filtro => filtro !== '');

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            bgcolor: '#f1f5f9',
            padding: 3,
            pt: 10,
        }}>
            <Fade in={true} timeout={800}>
                <HeaderBox>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 3,
                        px: 2,
                    }}>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 700,
                                flexGrow: 1,
                                letterSpacing: '0.5px',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
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
                                borderRadius: '12px',
                                px: 3,
                                py: 1.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            Nuevo Administrador
                        </Button>
                    </Box>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            opacity: 0.9, 
                            fontWeight: 400,
                            px: 2,
                            fontSize: '1.1rem'
                        }}
                    >
                        Gestion registros estudiantiles
                    </Typography>
                </HeaderBox>
            </Fade>

            {/* Tarjetas de Estadísticas */}
            <Fade in={true} timeout={1000}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <StatsCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6'
                                }}>
                                    <Person sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        {totalEstudiantes}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Estudiantes
                                    </Typography>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatsCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    color: '#22c55e'
                                }}>
                                    <School sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        {estudiantesRegulares}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Estudiantes Regulares
                                    </Typography>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatsCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                    color: '#a855f7'
                                }}>
                                    <Grade sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        {promedioGeneral}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Promedio General
                                    </Typography>
                                </Box>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                </Grid>
            </Fade>

            {/* Panel de Filtros */}
            <Zoom in={true} timeout={1200}>
                <Paper 
                    sx={{ 
                        p: 4, 
                        mb: 3, 
                        borderRadius: '20px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <FilterList sx={{ color: '#64748b' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            Filtros de Búsqueda
                        </Typography>
                        {filtrosActivos && (
                            <Chip 
                                label="Filtros activos" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                            />
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={limpiarFiltros}
                            sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none'
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FileDownload />}
                            onClick={exportToCSV}
                            sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg,rgb(0, 29, 161) 0%,rgb(1, 8, 111) 100%)',
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                }
                            }}
                        >
                            Exportar CSV ({registrosFiltrados.length})
                        </Button>
                    </Box>
                    
                    <Grid 
                        container 
                        spacing={3} 
                        alignItems="center"
                        sx={{
                            '& .MuiTextField-root': {
                                '& .MuiInputBase-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    height: '48px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: '#f1f5f9',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                },
                                '& .MuiSelect-select, & input': {
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }
                            }
                        }}
                    >
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Buscar por nombre, CURP o correo"
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#94a3b8' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Carrera"
                                value={filtros.carrera}
                                onChange={(e) => handleFiltroChange('carrera', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            >
                                <MenuItem value="">Todas las carreras</MenuItem>
                                {carreras.map((carrera) => (
                                    <MenuItem key={carrera} value={carrera}>
                                        {carrera}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Estado académico"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="regular">Regular</MenuItem>
                                <MenuItem value="irregular">Irregular</MenuItem>
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Promedio mín"
                                type="number"
                                value={filtros.promedioMin}
                                onChange={(e) => handleFiltroChange('promedioMin', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ 
                                    step: "0.1", 
                                    min: "0", 
                                    max: "10"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Promedio máx"
                                type="number"
                                value={filtros.promedioMax}
                                onChange={(e) => handleFiltroChange('promedioMax', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ 
                                    step: "0.1", 
                                    min: "0", 
                                    max: "10"
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Zoom>

            {/* Tabla de Registros */}
            <Fade in={true} timeout={1400}>
                <StyledTableContainer component={Paper}>
                    <Table stickyHeader>
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
                                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                                            Cargando registros...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ color: 'error.main', py: 4 }}>
                                        <Typography variant="h6">{error}</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedRegistros.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            {registros.length === 0 ? 
                                                'No hay registros disponibles' : 
                                                'No se encontraron resultados con los filtros aplicados'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRegistros.map((registro, index) => (
                                    <TableRow key={registro._id || index}>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {`${registro.nombre} ${registro.apellidoPaterno} ${registro.apellidoMaterno}`}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {registro.curp}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ fontSize: '0.8rem' }}>
                                                <div>📞 {registro.telefonoCasa}</div>
                                                <div>📱 {registro.telefonoCelular}</div>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: '#3b82f6' }}>
                                            {registro.correoPersonal}
                                        </TableCell>
                                        <TableCell>{registro.institucion}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={registro.carrera} 
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '12px',
                                                backgroundColor: parseFloat(registro.promedio) >= 8 ? 'rgba(34, 197, 94, 0.1)' : 
                                                                    parseFloat(registro.promedio) >= 7 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: parseFloat(registro.promedio) >= 8 ? '#22c55e' : 
                                                    parseFloat(registro.promedio) >= 7 ? '#f59e0b' : '#ef4444',
                                                fontWeight: 600
                                            }}>
                                                {registro.promedio}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={registro.estado === 'regular' ? 'Regular' : 'Irregular'}
                                                size="small"
                                                color={registro.estado === 'regular' ? 'success' : 'warning'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {registro.pdfUrl ? (
                                                <Tooltip title="Descargar CV" arrow>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleDescargarDocumento(
                                                            registro.pdfUrl || registro.cloudinaryDownloadUrl, 
                                                            `cv_${registro.nombre}_${registro.apellidoPaterno || ''}.pdf`
                                                        )}
                                                        sx={{
                                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: 'all 0.2s ease-in-out'
                                                        }}
                                                    >
                                                        <GetApp />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    No disponible
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    {/* Paginación */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={registrosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Registros por página:"
                        labelDisplayedRows={({ from, to, count }) => 
                            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                        }
                        sx={{
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            '& .MuiTablePagination-toolbar': {
                                paddingX: 3,
                                paddingY: 2,
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#475569'
                            }
                        }}
                    />
                </StyledTableContainer>
            </Fade>
        </Box>
    );
}