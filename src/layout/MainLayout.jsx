import { Container, Typography } from '@mui/material';

const MainLayout = ({ title, children }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {children}
    </Container>
  );
};

export default MainLayout;
