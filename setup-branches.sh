#!/bin/bash
# Sehra Wedding Platform - Git Branching Setup Script
# This script sets up a GitFlow-based branching strategy for your repository

echo "🚀 Setting up Git branching structure for Sehra Wedding Platform..."

# Ensure we're on main branch and fully up-to-date
echo "📥 Updating main branch..."
git checkout main
git pull origin main
echo "✅ Main branch is up-to-date"

# Push any local changes to make sure we're in sync
echo "☁️ Pushing any local changes to remote..."
git push origin main

# Create and push develop branch
echo "🌱 Creating develop branch..."
git checkout -b develop
git push -u origin develop
echo "✅ Develop branch created"

# Create and push feature branches
echo "🔨 Creating feature branches..."
feature_branches=(
    "admin-user-management" 
    "vendor-tier-system" 
    "customer-supervisor-allocation" 
    "budget-management" 
    "dashboard-enhancements" 
    "contact-form-system"
)

for branch in "${feature_branches[@]}"; do
    echo "  Creating feature/$branch branch..."
    git checkout develop
    git checkout -b "feature/$branch"
    git push -u origin "feature/$branch"
    echo "  ✅ feature/$branch branch created"
done

# Create and push environment branches
echo "🌍 Creating environment branches..."
git checkout main
git checkout -b staging
git push -u origin staging

git checkout main
git checkout -b demo
git push -u origin demo
echo "✅ Environment branches created"

# Return to develop branch
git checkout develop

# Create BRANCHING.md file
echo "📝 Creating BRANCHING.md documentation..."
cat > BRANCHING.md << 'EOF'
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
EOF

git add BRANCHING.md
git commit -m "Add Git branching strategy documentation"
git push origin develop

echo "✨ Branching setup complete! You are now on the develop branch."
echo "📚 Review the BRANCHING.md file for details on the branching strategy."
echo "🔒 Don't forget to set up branch protection rules in GitHub repository settings!"