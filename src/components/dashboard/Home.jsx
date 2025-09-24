import React from 'react';
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

  return (
    <Box sx={{ bgcolor: '#0b2b6b', minHeight: '100vh', p: 4 }}>
      <Paper elevation={6} sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Box sx={{ bgcolor: '#0b2b6b', color: '#fff', py: 2, px: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Programa de Selección de Candidatos</Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={4}>
            <Paper sx={{ bgcolor: '#0b2b6b', color: '#fff', p: 1 }}> 
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Habilidades técnicas necesarias para el perfil</Typography>
            </Paper>

            {levels.map((lv) => (
              <Paper key={lv.title} sx={{ bgcolor: '#0b2b6b', color: '#fff', p: 1, mt: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{lv.title}</Typography>
              </Paper>
            ))}
          </Grid>

          <Grid item xs={8}>
            <Paper sx={{ p: 2, minHeight: 400 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Cada candidato es evaluado en función de dichas habilidades, temas conceptuales, entrega de ejercicios realizados en un laboratorio, experiencia, dominio del inglés y habilidades sociales (comunicación, competencias analíticas, trabajo en equipo, aprendizaje, etc.).</Typography>
              </Box>

              {levels.map((lv) => (
                <Paper key={lv.title} sx={{ bgcolor: '#e9eef7', p: 2, my: 1 }}>
                  <Typography variant="body2">{lv.text}</Typography>
                </Paper>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={() => navigate('/formulario')}>Realizar Registro</Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
