import { useEffect, useState } from 'react';
import api from '../api/axios';

const useUserRole = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setRole(res.data.role))
      .catch(() => setRole(null));
  }, []);

  return role;
};

export default useUserRole;
