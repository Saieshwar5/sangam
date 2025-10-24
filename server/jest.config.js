export default {
    testEnvironment: 'node',

    transform: {},

    moduleFileExtensions: ['js', 'json', 'ts'],

    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
      ],

      collectCoverageFrom: [
        'src/**/*.js',
        '!src/models/**/*.js',
        '!src/config/**/*.js',
        '!src/util/**/*.js',
        '!src/routes/**/*.js',
      ],
      
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
      // Clear mocks between tests
      clearMocks: true,
      
      // Verbose output
      verbose: true
    


}