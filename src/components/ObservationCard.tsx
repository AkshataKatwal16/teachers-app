import { Box, Typography, Card, CardContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

interface ObservationCardProp {
  observationName?: string;
  observationId?: string;
  observationDescription?: string;
  onCardClick?: (observationId: string) => void;
  startDate?: string;
  endDate?: string;
}

const ObservationCard: React.FC<ObservationCardProp> = ({
  observationName,
  observationId,
  observationDescription,
  onCardClick,
  startDate,
  endDate
}) => {
  const [remainingDays, setRemainingDays] = useState<string>("");
  const [remainingTimes, setRemainingTimes] = useState<any>();


  useEffect(() => {
    const today = new Date(); 
    const targetDate = new Date('2025-10-21T14:58:44.524Z'); 
    
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingTimes(diffDays)
    let remainingTime = '';
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      
      const months = Math.floor(remainingDays / 30.44); 
      const days = Math.round(remainingDays % 30.44);
      
      remainingTime = `${years} year(s)${months > 0 ? `, ${months} months` : ''}${days > 0 ? `, and ${days} days` : ''}`;
    } else if (diffDays > 31) {
      const months = Math.floor(diffDays / 30.44); 
      const days = Math.round(diffDays % 30.44);
      
      remainingTime = `${months} months ${days > 0 ? ` and ${days} days` : ''}`;
    } else {
      remainingTime = `${diffDays} days`;
    }

    setRemainingDays(remainingTime)
  }, []);
  return (
    <Card
      variant="outlined"
      sx={{
        margin: '16px',
        padding: '8px',
        boxShadow: 3,
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 10,
        },
        width: '300px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #fff9e6 0%, #faf2d6 100%)',
        borderRadius: '16px',
        border: '1px solid #f0e68c',
        height: '200px', // Fixed height for all cards
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onCardClick?.(observationId || '')}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" flexGrow={1}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              width: '100px',
              padding: '4px 8px',
              gap: '10px',
              borderRadius: '8px',
              background: remainingTimes<=5?'#FFDAD6':"#FFDEA1" ,
              mb: 2, // Added margin for spacing
            }}
          >
            <Typography color={remainingTimes<=5?"#BA1A1A":"#7A5900"}variant="h5">   
              {remainingDays} 
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1} mt={1}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 'bold',
                flexGrow: 1,
              }}
            >
              {observationName}
            </Typography>
          </Box>

          {/* Description */}
          {observationDescription && (
            <Typography
              variant="body2"
              component="p"
              sx={{
                marginTop: '8px',
                color: '#555',
                lineHeight: 1.5,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                height: '3em',
              }}
            >
              {observationDescription}
            </Typography>
          )}

          {/* <Typography
            sx={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
              letterSpacing: '0.4px',
              textAlign: 'left',
              marginTop: 'auto', // Pushes this element to the bottom
            }}
          >
            16 Jun, 2024 - 31 Dec, 2024
          </Typography> */}
        </CardContent>
      </Box>
    </Card>
  );
};

export default ObservationCard;
