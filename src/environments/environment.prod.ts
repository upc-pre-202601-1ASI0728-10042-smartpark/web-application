/**
 * Configuración de producción.
 * Apunta a la API desplegada en Azure App Service.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://smartpark-api.azurewebsites.net/api/v1',
  alertsHubUrl: 'https://smartpark-api.azurewebsites.net/hubs/alerts',
};
