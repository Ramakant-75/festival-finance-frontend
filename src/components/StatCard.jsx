import { Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ label, value }) => (
  <Card sx={{ minWidth: 200, textAlign: 'center' }}>
    <CardContent>
      <Typography variant="h6">{label}</Typography>
      <Typography variant="h5" color="primary">₹{value}</Typography>
    </CardContent>
  </Card>
);

export default StatCard;
