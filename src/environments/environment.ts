// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  prod: false,
  api: {
    baseURL: 'http://localhost:8080',
  },
  identityProvider: {
    baseURL: 'http://localhost:8081',
    clientId: 'hexagonalChess-client',
    realm: 'HexagonalChess',
  },
};
