# Sehra Wedding Platform Branching Strategy

## Core Branches
- `main` - Production-ready code
  - Always stable and deployable
  - Tagged with version numbers for releases
  - Protected from direct pushes (requires pull requests)

- `develop` - Integration branch
  - Contains completed features ready for the next release
  - Main development branch where features are merged
  - Should be relatively stable

## Supporting Branches

### Feature Branches
- Naming convention: `feature/feature-name` (e.g., `feature/vendor-dashboard`)
- Created from: `develop`
- Merged back into: `develop`
- Used for developing new features
- Should be deleted after merging

### Release Branches
- Naming convention: `release/v1.0.0`
- Created from: `develop`
- Merged into: `main` and `develop`
- Used for release preparation, minor bug fixes, and documentation updates
- No new features should be added here

### Hotfix Branches
- Naming convention: `hotfix/bug-description` (e.g., `hotfix/login-redirect-issue`)
- Created from: `main`
- Merged into: `main` and `develop`
- Used for urgent fixes to production code

## Environment-specific Branches
- `staging` - For staging/UAT environment
- `demo` - For demonstration instances

## Workflow Example

1. Develop new features in feature branches
2. Merge completed features to develop
3. Create release branches for release preparation
4. Merge releases to main and tag with version
5. Create hotfixes from main for urgent production fixes

## Feature Branches for Sehra Project

1. `feature/admin-user-management` - Admin dashboard and user management system
2. `feature/vendor-tier-system` - Vendor tier categorization and SQS scoring
3. `feature/customer-supervisor-allocation` - Customer-supervisor allocation system
4. `feature/budget-management` - Budget selection and management module
5. `feature/dashboard-enhancements` - Dashboard improvements for different user roles
6. `feature/contact-form-system` - Contact form submission and assignment

## Branch Protection Recommendations

It is recommended to set up these protection rules in GitHub:

1. Protect `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Restrict who can push to this branch

2. Protect `develop` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
