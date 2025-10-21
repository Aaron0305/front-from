import React, { useState } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const levels = [
  { title: 'Deseable', text: 'Aquellas que puedan complementar la competencia técnica del perfil. Se pueden plantear algunas preguntas clave a los candidatos relacionadas con esos temas, pero no se consideran al momento de tomar la decisión.' },
  { title: 'Entrada', text: 'Recién graduado, alto dominio del inglés' },
  { title: 'Junior', text: 'De 1 a 3 años de experiencia, alto dominio del inglés' },
  { title: 'Intermedio', text: 'De 3 a 5 años de experiencia, alto dominio del inglés, conocimiento del sector industrial (dominio)' },
  { title: 'Senior', text: 'De 5 a 10 años de experiencia, alto nivel de inglés, (dominio del conocimiento) industria, conocimientos básicos de arquitectura y diseño, liderazgo, gestión de las partes interesadas, gestión de personal.' },
  { title: 'Jefe', text: 'Más de 10 años de experiencia, alto nivel de inglés, conocimiento del sector industrial (dominio), buen dominio de la arquitectura y diseño, liderazgo, gestión de las partes interesadas, gestión de personal, toma de decisiones, conocimiento del negocio.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('Deseable'); // Por defecto muestra "Deseable"

  return (
    <Box sx={{ bgcolor: '#0b2b6b', minHeight: '100vh', p: 4, pt: 12 }}>
      <Paper elevation={6} sx={{ maxWidth: 1200, mx: 'auto', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ bgcolor: '#0b2b6b', color: '#fff', py: 2, px: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Programa de Selección de Candidatos</Typography>
        </Box>

        {/* Contenido principal con Flexbox */}
        <Box sx={{ display: 'flex', minHeight: 500 }}>
          {/* Columna izquierda - Botones */}
          <Box sx={{ width: '300px', p: 3, flexShrink: 0 }}>
            <Paper sx={{ bgcolor: '#0b2b6b', color: '#fff', p: 1, mb: 2 }}> 
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Habilidades técnicas necesarias para el perfil</Typography>
            </Paper>

            {levels.map((lv) => (
              <Button
                key={lv.title}
                onClick={() => setSelectedLevel(lv.title)}
                sx={{ 
                  bgcolor: selectedLevel === lv.title ? '#1565c0' : '#0b2b6b',
                  color: '#fff', 
                  p: 1, 
                  mt: 1,
                  width: '100%',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1565c0'
                  }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{lv.title}</Typography>
              </Button>
            ))}
          </Box>

          {/* Columna derecha - Contenido */}
          <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
            {/* Texto explicativo */}
            <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#333', mb: 2 }}>
              Cada candidato es evaluado en función de dichas habilidades, temas conceptuales, entrega de ejercicios realizados en un laboratorio, experiencia, dominio del inglés y habilidades sociales (comunicación, competencias analíticas, trabajo en equipo, aprendizaje, etc.).
            </Typography>

            {/* Recuadro con el contenido del botón seleccionado */}
            <Paper 
              sx={{ 
                bgcolor: '#0b2b6b', 
                color: '#fff', 
                p: 4,
                borderRadius: '8px',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                mb: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: 'center', 
                  fontWeight: 500,
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                {levels.find(lv => lv.title === selectedLevel)?.text || ''}
              </Typography>
            </Paper>

            {/* Botón Realizar Registro */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/formulario')}
                sx={{
                  bgcolor: '#0b2b6b',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  '&:hover': {
                    bgcolor: '#1565c0'
                  }
                }}
              >
                Realizar Registro
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      {/* Footer con aviso de privacidad */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          bgcolor: '#00238b',
          color: 'white',
          py: 1.5,
          textAlign: 'center',
          zIndex: 1200,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="body2" sx={{ mr: 2, fontSize: '1rem', color: 'white' }}>
          Tu información está protegida. Consulta nuestro
        </Typography>
        <Button
          variant="text"
          sx={{ color: 'white', fontWeight: 600, textTransform: 'none', fontSize: '1rem', p: 0, minWidth: 0 }}
          onClick={() => window.open('/aviso-privacidad', '_blank', 'noopener,noreferrer,width=700,height=600')}
        >
          Aviso de Privacidad
        </Button>
      </Box>
    </Box>
  );
}
