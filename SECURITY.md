# Security Guidelines

## Environment Variables

### Best Practices

1. **Never commit `.env` files to git**
   - Only commit `.env.example` files as templates
   - Actual `.env` files contain sensitive data and must stay local

2. **Use strong secrets in production**
   - Generate secure JWT secrets: `openssl rand -base64 32`
   - Never use default/development secrets in production
   - Rotate secrets regularly

3. **Keep secrets out of code**
   - Use environment variables for all sensitive data
   - No hardcoded passwords, API keys, or tokens in source code
   - Review code changes for accidental secret commits

### Environment Files in This Project

- **`.env.development`** - Local development (git-ignored)
- **`.env.production`** - Production build (git-ignored)
- **`.env.*.example`** - Templates (committed to git)

### Backend Environment Variables

Required for production:
```bash
# Generate a secure JWT secret (REQUIRED)
JWT_SECRET_KEY=$(openssl rand -base64 32)

# Database credentials (provided by Render)
DB_HOST=your-database-hostname
DB_PASSWORD=your-database-password

# CORS - Set to your frontend URL
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com
```

### Frontend Environment Variables

For Render deployment:
```bash
# Your backend API URL
VITE_API_BASE_URL=https://your-backend-api.onrender.com

# Base path for routing
VITE_BASE_PATH=/
```

For GitHub Pages deployment:
```bash
# No VITE_API_BASE_URL needed (uses mock data)
# Base path is set automatically in vite.config.ts
```

## If You Accidentally Commit Secrets

If you accidentally commit secrets to git:

### 1. Remove from latest commit (not yet pushed)
```bash
# Remove the file and re-commit
git rm --cached path/to/.env
echo "path/to/.env" >> .gitignore
git commit --amend -m "Remove secrets from commit"
```

### 2. Remove from git history (already pushed)
```bash
# Use git filter-repo (recommended)
git filter-repo --path path/to/.env --invert-paths

# Or use BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/
```

### 3. Rotate the compromised secrets
- Generate new JWT secret
- Update database password if exposed
- Update any other exposed credentials
- Deploy with new secrets immediately

## Deployment Security Checklist

- [ ] All secrets stored as environment variables (not in code)
- [ ] JWT secret is strong and unique (32+ characters)
- [ ] CORS configured to allow only your frontend domain
- [ ] Database uses strong password
- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] Production logs don't expose sensitive data
- [ ] SSL/TLS enabled (automatic on Render)

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT open a public issue
2. Contact the repository maintainers privately
3. Include details and steps to reproduce
4. Allow time for a fix before public disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Render Security Best Practices](https://render.com/docs/security)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

