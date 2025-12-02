module.exports = {
  apps: [
    {
      name: 'orcid-analyst',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 4173
      }
    }
  ]
}
