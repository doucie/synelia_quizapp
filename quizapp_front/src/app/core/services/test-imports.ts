import { SpringBootResponse, UserApiData } from '../models/spring-boot.interfaces';

// Test des imports
const testResponse: SpringBootResponse<UserApiData> = {
  items: [],
  hasError: false,
  status: { code: '200', message: 'OK' }
};

console.log('Imports working:', testResponse);
