import axios from 'axios';

const aiApi = axios.create({
  baseURL: 'http://localhost:8091/api',
});

export default aiApi;
