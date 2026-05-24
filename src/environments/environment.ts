/**
 * Configuración por defecto (desarrollo).
 * Apunta a la API local de SmartPark Web Services (ASP.NET Core).
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5080/api/v1',
  alertsHubUrl: 'http://localhost:5080/hubs/alerts',
};
