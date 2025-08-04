# Project Delivery System

A sophisticated bash script for professional handover of software project milestones to client repositories.

## Overview

The `deliver.sh` script automates the process of delivering project code to client repositories with two distinct modes of operation:

- **Milestone Mode**: Delivers only specific files/directories listed in `.delivery-manifest`
- **Full Project Mode**: Delivers the entire project (when no manifest exists)

## Usage

```bash
./deliver.sh [--whatif]
```

### Parameters

- **--whatif** (Optional): Shows what files would be delivered without performing the actual delivery

### Configuration

The script reads all configuration from files:

- **TARGET_REPO**: The target Git repository URL (configured in `.delivery-manifest` or `.delivery-config`)
- **COMMIT_MESSAGE**: The commit message for the delivery (configured in `.delivery-manifest` or `.delivery-config`)

Example configuration in `.delivery-manifest`:

```ini
# Repository configuration
TARGET_REPO=https://github.com/Jackalope-Productions/h2All_m1_proto.git

# Commit message configuration
COMMIT_MESSAGE=init - Initial documentation delivery: H2All M1 comprehensive project documentation

# File list
.copilot-instructions.md
h2all-m1/README.md
h2all-m1/DEVELOPER_GUIDE.md
```

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

````bash
### Milestone Delivery (with manifest)

```bash
# Test what would be delivered
./deliver.sh --whatif

# Perform actual delivery
./deliver.sh
````

````

### Full Project Delivery

```bash
# First, remove or rename .delivery-manifest to disable milestone mode
mv .delivery-manifest .delivery-manifest.backup

# Configure target repository in .delivery-config
echo "TARGET_REPO=git@github.com:client/project.git" > .delivery-config
echo "COMMIT_MESSAGE=Complete project handover - v1.0.0" >> .delivery-config

# Then deliver the full project
./deliver.sh
````

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
