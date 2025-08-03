# Project Delivery System

A sophisticated bash script for professional handover of software project milestones to client repositories.

## Overview

The `deliver.sh` script automates the process of delivering project code to client repositories with two distinct modes of operation:

- **Milestone Mode**: Delivers only specific files/directories listed in `.delivery-manifest`
- **Full Project Mode**: Delivers the entire project (when no manifest exists)

## Usage

```bash
./deliver.sh <client-repo-url> <commit-message>
```

### Arguments

1. **client-repo-url**: The target Git repository URL where the project will be delivered

   - Supports both HTTPS and SSH formats
   - Example: `https://github.com/client/project.git`
   - Example: `git@github.com:client/project.git`

2. **commit-message**: Multi-line commit message describing the delivery
   - Wrap in quotes for multi-line messages
   - Should describe the milestone or changes being delivered

## Delivery Modes

### Milestone Mode (Manifest-Driven)

When a `.delivery-manifest` file exists in the project root:

- Only files and directories listed in the manifest are delivered
- Ideal for incremental milestone deliveries
- Allows precise control over what gets delivered to the client

**Example manifest file:**

```
# H2All Project Delivery Manifest
h2all-m1/
README.md
DEVELOPER_GUIDE.md
h2all-m1/package.json
h2all-m1/app/
.vscode/
```

### Full Project Mode

When no `.delivery-manifest` file exists:

- Delivers the entire project directory
- Automatically excludes common development files
- Suitable for complete project handovers

## Automatic Exclusions

The script automatically excludes these items in both modes:

- `.git` directories
- `node_modules` directories
- `*.tmp` files
- `.DS_Store` files
- `*.log` files
- The `.delivery-manifest` file itself
- The `deliver.sh` script

## Examples

### Milestone Delivery

```bash
./deliver.sh "https://github.com/client/h2all-project.git" "v1.0.1 - User Journey Implementation

- Added complete 5-step user flow
- Implemented progress tracking
- Added footer with social sharing
- Updated navigation system"
```

### Full Project Delivery

```bash
# First, remove or rename .delivery-manifest
mv .delivery-manifest .delivery-manifest.backup

# Then deliver the full project
./deliver.sh "git@github.com:client/project.git" "Complete project handover - v1.0.0"
```

## Features

### Safety & Error Handling

- Robust error checking at each step
- Automatic cleanup of temporary files
- Fails fast on any error condition
- Validates repository URL format

### Professional Output

- Color-coded status messages
- Detailed progress reporting
- Comprehensive delivery summary
- Timestamp tracking

### Git Integration

- Clones client repository to temporary location
- Updates all file timestamps to delivery time
- Creates single commit with provided message
- Pushes to main branch automatically

## Workflow

1. **Preparation**: Create/update `.delivery-manifest` if using milestone mode
2. **Execution**: Run script with client repo URL and commit message
3. **Automation**: Script handles cloning, file sync, commit, and push
4. **Verification**: Review delivery summary for confirmation

## Security Considerations

- Uses temporary directories with process ID for isolation
- Automatically cleans up temporary files
- Never modifies the source project directory
- Validates all inputs before processing

## Requirements

- Bash shell (version 4.0+)
- Git (configured with user credentials)
- rsync utility
- Network access to target repository

## Troubleshooting

### Common Issues

1. **Authentication Failure**: Ensure Git credentials are properly configured
2. **Permission Denied**: Check if the target repository allows pushes
3. **Network Issues**: Verify repository URL and network connectivity
4. **Empty Manifest**: Ensure `.delivery-manifest` contains valid file paths

### Debug Mode

Add `set -x` to the beginning of the script for detailed execution tracing.

## License

This delivery system is part of the H2All project and follows the same licensing terms.
