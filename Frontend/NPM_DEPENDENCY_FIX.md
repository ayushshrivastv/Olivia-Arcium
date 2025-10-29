# npm Dependency Resolution Fix

## Problem Solved

### Original Issue
- Vercel builds were failing with: `npm error Could not resolve dependency: peerOptional nodemailer@"^7.0.7" from next-auth@4.24.12`

### Root Cause
1. **next-auth peer dependency**: `next-auth@^4.24.11` resolves to `4.24.12`, which declares `nodemailer@^7.0.7` as a `peerOptional` dependency
2. **npm 7+ strict mode**: Vercel uses npm 7+ which has stricter peer dependency resolution than npm 6
3. **Optional but required**: Even though `peerOptional` means "optional", npm 7+ still tries to resolve it and fails if it can't
4. **Our use case**: We only use Google OAuth, so `nodemailer` isn't actually needed

## Solution Implemented

### 1. Added `nodemailer` as `optionalDependencies`
```json
"optionalDependencies": {
  "nodemailer": "^7.0.7"
}
```
- Satisfies the peerOptional requirement
- Won't cause failures if installation fails (that's what optional means)
- Doesn't affect app functionality since we don't use email auth

### 2. Created `.npmrc` with `legacy-peer-deps=true`
```
legacy-peer-deps=true
```

**Why this works:**
- Tells npm to use the older (npm 6) peer dependency resolution algorithm
- npm 6 ignores unresolved peerOptional dependencies
- Ensures Vercel builds succeed regardless of npm version or edge cases
- Acts as a safety net even though we added nodemailer to optionalDependencies

### Why Both Are Needed

1. **optionalDependencies**: Explicitly satisfies the requirement
2. **legacy-peer-deps**: Fallback for edge cases and ensures compatibility across npm versions

## npm Audit Status

### Current Issues
- **16 low severity vulnerabilities** in transitive dependencies from WalletConnect ecosystem
- All vulnerabilities are in:
  - `fast-redact` → `pino` → `@walletconnect/logger` → WalletConnect packages
  - These are transitive dependencies from `@solana/wallet-adapter-walletconnect`

### Why We Can't Fix Them Easily
1. Vulnerabilities are in **transitive dependencies** (not our direct deps)
2. They're from the WalletConnect ecosystem which we use for Solana wallet connections
3. Requires upstream updates from WalletConnect maintainers
4. Low severity = lower risk, often acceptable until upstream fixes

### Options to Address (Future)
1. **Wait for upstream fixes**: WalletConnect will eventually update their dependencies
2. **npm overrides**: Force specific versions (risky, may break compatibility)
   ```json
   "overrides": {
     "fast-redact": "^4.0.0"
   }
   ```
3. **Remove WalletConnect**: If not using it, remove `@solana/wallet-adapter-walletconnect`

## How Vercel Uses This

When Vercel builds your project:
1. Runs `npm install` in the `Frontend/` directory
2. Reads `.npmrc` automatically
3. Uses `legacy-peer-deps=true` to resolve dependencies
4. Installs `nodemailer` from optionalDependencies (may skip if fails, won't fail build)
5. Build proceeds successfully ✅

## Testing Locally

To test the same behavior as Vercel:
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

This should succeed without errors.

