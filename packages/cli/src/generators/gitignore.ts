export function generateGitignore(): string {
  return `# Dependencies
node_modules/

# Build output
dist/
.vite/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# Tauri
src-tauri/target/

# TypeScript
*.tsbuildinfo
`
}
