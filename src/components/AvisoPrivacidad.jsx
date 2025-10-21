import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const avisoText = `En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, informamos que los datos personales recabados a través de este sistema serán utilizados exclusivamente para los fines relacionados con el Programa de Selección de Candidatos de la Cámara de Comercio y el Tecnológico de Estudios Superiores de Jocotitlán.\n\nSus datos serán tratados de forma confidencial y no serán compartidos con terceros sin su consentimiento, salvo en los casos previstos por la ley. Usted tiene derecho a acceder, rectificar y cancelar sus datos personales, así como a oponerse al tratamiento de los mismos o revocar el consentimiento que para tal fin nos haya otorgado, a través de los procedimientos que hemos implementado.\n\nPara mayor información sobre el tratamiento y los derechos que puede ejercer, puede consultar el aviso de privacidad completo o comunicarse con el responsable de protección de datos del programa.`;

export default function AvisoPrivacidad() {
  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 6, bgcolor: 'white', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#00238b' }}>
        Aviso de Privacidad
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line', color: '#1e293b' }}>
        {avisoText}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => window.close()}>
        Cerrar ventana
      </Button>
    </Box>
  );
}
