import axios from 'axios';

const aiApi = axios.create({
  // baseURL: 'http://localhost:8091/api',
  baseURL: 'https://festival-finance-backend.onrender.com/api',
});

export default aiApi;
