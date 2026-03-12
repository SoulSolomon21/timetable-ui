import { defineConfig } from 'orval'

const apiUrl = 'http://localhost:8080'

export default defineConfig({
  'timetable-bubble-api': {
    input: {
      target: `${apiUrl}/api-docs.yaml`,
    },
    output: {
      target: 'src/utils/api.ts',
      schemas: 'src/utils/models',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'split',
      namingConvention: 'kebab-case',
      baseUrl: `${apiUrl}`,
      override: {
        enumGenerationType: 'enum',
      },
    },
    hooks: {
      afterAllFilesWrite: 'eslint --fix'
    },
  },
})
