// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  qa: false,
  demo: false,
  e2e: false,
  hmr: false,
  offline: false,
  supportEmail: 'support@wnyfoodweb.com',
  googleMapsJSApiKey: 'AIzaSyDQdydkED1Z-nZvQXQQHlOYXnrmdqdFedA',
  server: 'http://localhost:5000/server'
};
