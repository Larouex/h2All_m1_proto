#!/bin/bash

# deliver.sh - Professional Project Delivery Script
# Automates handover of software project milestones to client repositories
# Supports both manifest-driven and full project delivery modes

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly MANIFEST_FILE=".delivery-manifest"
readonly CONFIG_FILE=".delivery-config"
readonly TEMP_DIR_PREFIX="/tmp/project-delivery"

# Global variables
TEMP_DIR=""
CLIENT_REPO_URL=""
COMMIT_MESSAGE=""
WHATIF_MODE=false

# Function: Print colored output
print_status() {
    local color="$1"
    local message="$2"
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function: Print error and exit
error_exit() {
    print_status "$RED" "ERROR: $1"
    cleanup
    exit 1
}

# Function: Print usage information
usage() {
    cat << EOF
${BLUE}Professional Project Delivery Script${NC}

${YELLOW}USAGE:${NC}
    $SCRIPT_NAME [--whatif]

${YELLOW}PARAMETERS:${NC}
    --whatif           Optional: Show what files would be delivered without performing delivery

${YELLOW}DELIVERY MODES:${NC}
    ${GREEN}Milestone Mode:${NC}     Uses .delivery-manifest file (if exists)
                        Delivers only files/directories listed in manifest
    
    ${GREEN}Full Project Mode:${NC}  Delivers entire project (if no manifest)
                        Excludes: .git, node_modules, *.tmp, manifest, script

${YELLOW}REPOSITORY-SPECIFIC EXCLUSIONS:${NC}
    Add EXCLUDE_FOR_<owner>_<repo>=<pattern> lines to config files
    Example: EXCLUDE_FOR_Jackalope_Productions_h2All_m1_proto=sensitive.txt
    
    Patterns support wildcards: *.log, temp/, etc.

${YELLOW}CONFIGURATION:${NC}
    TARGET_REPO=<repository-url>           # Default target repository
    COMMIT_MESSAGE=<message>              # Default commit message
    
    These must be configured in .delivery-manifest or .delivery-config

${YELLOW}EXAMPLES:${NC}
    # Show what would be delivered without actually delivering
    $SCRIPT_NAME --whatif
    
    # Deliver using configured repository and commit message
    $SCRIPT_NAME

EOF
}

# Function: Read target repository from configuration
read_target_repo_from_config() {
    local config_files=("$CONFIG_FILE" "$MANIFEST_FILE")
    
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            # Look for TARGET_REPO= line in config file
            local target_repo
            target_repo=$(grep "^TARGET_REPO=" "$config_file" 2>/dev/null | head -1 | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            if [[ -n "$target_repo" ]]; then
                print_status "$GREEN" "Found target repository in $config_file: $target_repo" >&2
                echo "$target_repo"
                return 0
            fi
        fi
    done
    
    print_status "$YELLOW" "No TARGET_REPO configuration found in .delivery-config or .delivery-manifest" >&2
    return 1
}

# Function: Read commit message from configuration
read_commit_message_from_config() {
    local config_files=("$CONFIG_FILE" "$MANIFEST_FILE")
    
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            # Look for COMMIT_MESSAGE= line in config file
            local commit_msg
            commit_msg=$(grep "^COMMIT_MESSAGE=" "$config_file" 2>/dev/null | head -1 | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            if [[ -n "$commit_msg" ]]; then
                print_status "$GREEN" "Found commit message in $config_file" >&2
                echo "$commit_msg"
                return 0
            fi
        fi
    done
    
    print_status "$YELLOW" "No COMMIT_MESSAGE configuration found in .delivery-config or .delivery-manifest" >&2
    return 1
}

# Function: Read repository-specific exclusions
read_repo_specific_excludes() {
    local repo_url="$1"
    local excludes=()
    
    # Extract repository identifier from URL for matching
    local repo_identifier
    if [[ "$repo_url" =~ github\.com[:/]([^/]+)/([^/\.]+) ]]; then
        repo_identifier="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    else
        repo_identifier="$repo_url"
    fi
    
    print_status "$BLUE" "Looking for exclusions for repository: $repo_identifier" >&2
    
    local config_files=("$CONFIG_FILE" "$MANIFEST_FILE")
    
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            # Look for EXCLUDE_FOR_<repo> patterns
            local exclude_patterns
            exclude_patterns=$(grep "^EXCLUDE_FOR_" "$config_file" 2>/dev/null || true)
            
            while IFS= read -r line; do
                if [[ -n "$line" ]]; then
                    # Extract the repository part and exclusion
                    if [[ "$line" =~ ^EXCLUDE_FOR_([^=]+)=(.+)$ ]]; then
                        local pattern_repo="${BASH_REMATCH[1]}"
                        local exclusion="${BASH_REMATCH[2]}"
                        
                        # Convert pattern to match our identifier format
                        # Replace underscores strategically: first one becomes slash (owner/repo separator)
                        # Keep repo name part intact by only replacing the first underscore
                        local owner_repo=$(echo "$pattern_repo" | sed 's/_/\//')
                        
                        # Also try converting the first part (owner) underscores to hyphens
                        local hyphenated_owner=$(echo "$pattern_repo" | sed 's/^\([^_]*\)_\([^_]*\)_/\1-\2\//')
                        
                        if [[ "$repo_identifier" == *"$owner_repo"* ]] || [[ "$repo_identifier" == *"$hyphenated_owner"* ]]; then
                            excludes+=("$exclusion")
                            print_status "$YELLOW" "Found exclusion for $pattern_repo -> $hyphenated_owner: $exclusion" >&2
                        fi
                    fi
                fi
            done <<< "$exclude_patterns"
        fi
    done
    
    # Output excludes array (one per line)
    if [[ ${#excludes[@]} -gt 0 ]]; then
        for exclude in "${excludes[@]}"; do
            echo "$exclude"
        done
    fi
}

# Function: Validate command line arguments
validate_arguments() {
    local args=()
    
    # Parse arguments, checking for --whatif flag
    while [[ $# -gt 0 ]]; do
        case $1 in
            --whatif)
                WHATIF_MODE=true
                print_status "$YELLOW" "What-if mode enabled - no actual delivery will be performed"
                shift
                ;;
            *)
                args+=("$1")
                shift
                ;;
        esac
    done
    
    # Only --whatif parameter is allowed, all other parameters are invalid
    if [[ ${#args[@]} -gt 0 ]]; then
        print_status "$RED" "Invalid arguments: ${args[*]}"
        print_status "$YELLOW" "Only --whatif parameter is supported"
        usage
        exit 1
    fi
    
    # Get repository URL from configuration
    local config_repo
    if config_repo=$(read_target_repo_from_config); then
        CLIENT_REPO_URL="$config_repo"
        print_status "$BLUE" "Using repository URL from configuration"
    else
        print_status "$RED" "No repository URL found in configuration"
        print_status "$YELLOW" "Please configure TARGET_REPO in .delivery-manifest or .delivery-config"
        usage
        exit 1
    fi
    
    # Get commit message from configuration
    local config_commit_msg
    if config_commit_msg=$(read_commit_message_from_config); then
        COMMIT_MESSAGE="$config_commit_msg"
        print_status "$BLUE" "Using commit message from configuration"
    else
        print_status "$RED" "No commit message found in configuration"
        print_status "$YELLOW" "Please configure COMMIT_MESSAGE in .delivery-manifest or .delivery-config"
        usage
        exit 1
    fi
    
    # Validate repository URL format
    if [[ ! "$CLIENT_REPO_URL" =~ ^(https?://|git@) ]]; then
        error_exit "Invalid repository URL format: $CLIENT_REPO_URL"
    fi
    
    # Validate commit message is not empty
    if [[ -z "$COMMIT_MESSAGE" ]]; then
        error_exit "Commit message cannot be empty"
    fi
    
    print_status "$GREEN" "Arguments validated successfully"
    print_status "$BLUE" "Repository: $CLIENT_REPO_URL"
    print_status "$BLUE" "Commit Message: ${COMMIT_MESSAGE:0:50}..."
    
    if [[ "$WHATIF_MODE" == "true" ]]; then
        print_status "$YELLOW" "What-if mode: Will simulate delivery without making changes"
    fi
}

# Function: Determine delivery mode based on manifest file
determine_delivery_mode() {
    if [[ -f "$MANIFEST_FILE" ]]; then
        print_status "$GREEN" "Manifest file found: $MANIFEST_FILE"
        print_status "$YELLOW" "Operating in MILESTONE MODE"
        
        # Validate manifest file is not empty
        if [[ ! -s "$MANIFEST_FILE" ]]; then
            error_exit "Manifest file exists but is empty"
        fi
        
        # Show first few lines of manifest
        print_status "$BLUE" "Manifest contents (first 5 lines):"
        head -5 "$MANIFEST_FILE" | sed 's/^/    /'
        
        return 0  # Milestone mode
    else
        print_status "$YELLOW" "No manifest file found"
        print_status "$YELLOW" "Operating in FULL PROJECT MODE"
        return 1  # Full project mode
    fi
}

# Function: Create temporary directory
create_temp_directory() {
    TEMP_DIR="${TEMP_DIR_PREFIX}-$$"
    
    if ! mkdir -p "$TEMP_DIR"; then
        error_exit "Failed to create temporary directory: $TEMP_DIR"
    fi
    
    print_status "$GREEN" "Created temporary directory: $TEMP_DIR"
}

# Function: Clone client repository
clone_client_repository() {
    print_status "$BLUE" "Cloning client repository..." >&2
    
    local repo_dir="$TEMP_DIR/client-repo"
    
    if ! git clone "$CLIENT_REPO_URL" "$repo_dir" 2>/dev/null; then
        error_exit "Failed to clone repository: $CLIENT_REPO_URL"
    fi
    
    print_status "$GREEN" "Successfully cloned repository to: $repo_dir" >&2
    echo "$repo_dir"
}

# Function: Perform what-if analysis
perform_whatif_analysis() {
    local milestone_mode="$1"
    
    print_status "$BLUE" "WHAT-IF ANALYSIS: Analyzing files that would be delivered..."
    
    # Common rsync excludes
    local excludes=(
        ".git"
        "node_modules"
        "*.tmp"
        "$CONFIG_FILE"
        "$MANIFEST_FILE" 
        "$SCRIPT_NAME"
        ".DS_Store"
        "*.log"
    )
    
    # Add repository-specific excludes
    local repo_excludes_list
    repo_excludes_list=$(read_repo_specific_excludes "$CLIENT_REPO_URL")
    
    if [[ -n "$repo_excludes_list" ]]; then
        while IFS= read -r exclude; do
            if [[ -n "$exclude" ]]; then
                excludes+=("$exclude")
                print_status "$YELLOW" "Repository-specific exclusion: $exclude"
            fi
        done <<< "$repo_excludes_list"
    fi
    
    echo ""
    print_status "$GREEN" "FILES THAT WOULD BE DELIVERED:"
    echo ""
    
    if [[ "$milestone_mode" == "true" ]]; then
        print_status "$YELLOW" "Milestone Mode - Using manifest file selection"
        echo ""
        
        # Create temporary file list for analysis
        local temp_file_list="/tmp/whatif-files-$$"
        grep -v "^TARGET_REPO=" "$MANIFEST_FILE" | grep -v "^COMMIT_MESSAGE=" | grep -v "^EXCLUDE_FOR_" | grep -v "^#" | grep -v "^[[:space:]]*$" > "$temp_file_list"
        
        local file_count=0
        local total_size=0
        
        while IFS= read -r file_pattern; do
            if [[ -n "$file_pattern" ]]; then
                # Check if it's a directory or file pattern
                if [[ -d "$file_pattern" ]]; then
                    # It's a directory, list its contents
                    local dir_files
                    dir_files=$(find "$file_pattern" -type f 2>/dev/null || true)
                    
                    if [[ -n "$dir_files" ]]; then
                        echo -e "${BLUE}📁 Directory: $file_pattern/${NC}"
                        while IFS= read -r file; do
                            if should_include_file "$file" "${excludes[@]}"; then
                                local size=$(stat -f%z "$file" 2>/dev/null || echo "0")
                                total_size=$((total_size + size))
                                file_count=$((file_count + 1))
                                echo "   ✓ $file ($(format_size $size))"
                            fi
                        done <<< "$dir_files"
                        echo ""
                    fi
                elif [[ -f "$file_pattern" ]]; then
                    # It's a file
                    if should_include_file "$file_pattern" "${excludes[@]}"; then
                        local size=$(stat -f%z "$file_pattern" 2>/dev/null || echo "0")
                        total_size=$((total_size + size))
                        file_count=$((file_count + 1))
                        echo "   ✓ $file_pattern ($(format_size $size))"
                    fi
                else
                    echo "   ⚠️  Not found: $file_pattern"
                fi
            fi
        done < "$temp_file_list"
        
        rm -f "$temp_file_list"
    else
        print_status "$YELLOW" "Full Project Mode - All files except exclusions"
        echo ""
        
        local file_count=0
        local total_size=0
        
        # Find all files, excluding the specified patterns
        while IFS= read -r file; do
            if should_include_file "$file" "${excludes[@]}"; then
                local size=$(stat -f%z "$file" 2>/dev/null || echo "0")
                total_size=$((total_size + size))
                file_count=$((file_count + 1))
                echo "   ✓ $file ($(format_size $size))"
            fi
        done < <(find . -type f -not -path "*/\.git/*" 2>/dev/null || true)
    fi
    
    echo ""
    print_status "$GREEN" "DELIVERY SUMMARY:"
    echo "   📊 Total files: $file_count"
    echo "   📦 Total size: $(format_size $total_size)"
    echo "   🎯 Target repository: $CLIENT_REPO_URL"
    echo "   💬 Commit message: $COMMIT_MESSAGE"
    echo "   ⏰ Delivery timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo ""
    print_status "$YELLOW" "What-if analysis complete. No files were actually delivered."
}

# Helper function: Check if file should be included based on excludes
should_include_file() {
    local file="$1"
    shift
    local excludes=("$@")
    
    for exclude in "${excludes[@]}"; do
        if [[ "$file" == *"$exclude"* ]] || [[ "$file" == $exclude ]]; then
            return 1  # Should exclude
        fi
    done
    return 0  # Should include
}

# Helper function: Format file size
format_size() {
    local size="$1"
    if [[ $size -lt 1024 ]]; then
        echo "${size}B"
    elif [[ $size -lt 1048576 ]]; then
        echo "$((size / 1024))KB"
    else
        echo "$((size / 1048576))MB"
    fi
}

# Function: Perform rsync operation based on delivery mode
perform_rsync() {
    local target_dir="$1"
    local milestone_mode="$2"
    
    print_status "$BLUE" "Synchronizing files to delivery directory..."
    
    # Common rsync excludes
    local excludes=(
        "--exclude=.git"
        "--exclude=node_modules"
        "--exclude=*.tmp"
        "--exclude=$CONFIG_FILE"
        "--exclude=$MANIFEST_FILE"
        "--exclude=$SCRIPT_NAME"
        "--exclude=.DS_Store"
        "--exclude=*.log"
    )
    
    # Add repository-specific excludes
    local repo_excludes_list
    repo_excludes_list=$(read_repo_specific_excludes "$CLIENT_REPO_URL")
    
    if [[ -n "$repo_excludes_list" ]]; then
        while IFS= read -r exclude; do
            if [[ -n "$exclude" ]]; then
                excludes+=("--exclude=$exclude")
                print_status "$YELLOW" "Added repository-specific exclusion: $exclude"
            fi
        done <<< "$repo_excludes_list"
    fi
    
    # Build rsync command based on mode
    local rsync_cmd=(rsync -av --delete)
    rsync_cmd+=("${excludes[@]}")
    
    if [[ "$milestone_mode" == "true" ]]; then
        # Milestone mode: use files from manifest (excluding config lines)
        # Create a temporary file list excluding TARGET_REPO and comment lines
        local temp_file_list="/tmp/delivery-files-$$"
        grep -v "^TARGET_REPO=" "$MANIFEST_FILE" | grep -v "^COMMIT_MESSAGE=" | grep -v "^EXCLUDE_FOR_" | grep -v "^#" | grep -v "^[[:space:]]*$" > "$temp_file_list"
        
        rsync_cmd+=("--files-from=$temp_file_list")
        rsync_cmd+=("." "$target_dir/")
        
        print_status "$YELLOW" "Using manifest-driven file selection"
        
        # Execute rsync command
        if ! "${rsync_cmd[@]}"; then
            rm -f "$temp_file_list"
            error_exit "Failed to synchronize files with rsync"
        fi
        
        # Clean up temporary file list
        rm -f "$temp_file_list"
    else
        # Full project mode: copy everything (with excludes)
        rsync_cmd+=("." "$target_dir/")
        
        print_status "$YELLOW" "Using full project delivery"
        
        # Execute rsync command
        if ! "${rsync_cmd[@]}"; then
            error_exit "Failed to synchronize files with rsync"
        fi
    fi
    
    print_status "$GREEN" "File synchronization completed successfully"
}

# Function: Update file timestamps
update_file_timestamps() {
    local target_dir="$1"
    
    print_status "$BLUE" "Updating file modification timestamps..."
    
    # Find all files (excluding .git directory) and update timestamps
    if ! find "$target_dir" -type f -not -path "*/\.git/*" -exec touch {} \; 2>/dev/null; then
        error_exit "Failed to update file timestamps"
    fi
    
    local file_count
    file_count=$(find "$target_dir" -type f -not -path "*/\.git/*" | wc -l)
    
    print_status "$GREEN" "Updated timestamps for $file_count files"
}

# Function: Commit and push changes
commit_and_push() {
    local repo_dir="$1"
    
    print_status "$BLUE" "Committing and pushing changes..."
    
    cd "$repo_dir" || error_exit "Failed to navigate to repository directory"
    
    # Configure git user (use global config or defaults)
    if ! git config user.email >/dev/null 2>&1; then
        git config user.email "delivery@projecthandover.com"
        git config user.name "Project Delivery Script"
        print_status "$YELLOW" "Configured temporary git user for delivery"
    fi
    
    # Stage all changes
    if ! git add .; then
        error_exit "Failed to stage files for commit"
    fi
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_status "$YELLOW" "No changes detected - repository already up to date"
        return 0
    fi
    
    # Create commit with provided message
    if ! git commit -m "$COMMIT_MESSAGE"; then
        error_exit "Failed to create commit"
    fi
    
    # Push to main branch
    if ! git push origin main; then
        error_exit "Failed to push changes to remote repository"
    fi
    
    # Get commit hash for confirmation
    local commit_hash
    commit_hash=$(git rev-parse --short HEAD)
    
    print_status "$GREEN" "Successfully pushed commit: $commit_hash"
}

# Function: Generate delivery summary
generate_summary() {
    local repo_dir="$1"
    local milestone_mode="$2"
    
    print_status "$BLUE" "Generating delivery summary..."
    
    cd "$repo_dir" || return 1
    
    local file_count
    local total_size
    file_count=$(find . -type f -not -path "*/\.git/*" | wc -l)
    total_size=$(du -sh . 2>/dev/null | cut -f1)
    
    cat << EOF

${GREEN}╔══════════════════════════════════════════════════════╗
║                 DELIVERY COMPLETED                   ║
╚══════════════════════════════════════════════════════╝${NC}

${YELLOW}Delivery Details:${NC}
  Repository:     $CLIENT_REPO_URL
  Mode:           $([ "$milestone_mode" == "true" ] && echo "Milestone (Manifest-driven)" || echo "Full Project")
  Files Delivered: $file_count
  Total Size:     $total_size
  Timestamp:      $(date '+%Y-%m-%d %H:%M:%S %Z')

${YELLOW}Commit Information:${NC}
  Hash:           $(git rev-parse --short HEAD)
  Message:        ${COMMIT_MESSAGE:0:100}$([ ${#COMMIT_MESSAGE} -gt 100 ] && echo "...")

${GREEN}✓ Project successfully delivered to client repository${NC}

EOF
}

# Function: Cleanup temporary files
cleanup() {
    if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
        print_status "$BLUE" "Cleaning up temporary directory..."
        rm -rf "$TEMP_DIR"
        print_status "$GREEN" "Cleanup completed"
    fi
}

# Function: Main execution flow
main() {
    print_status "$BLUE" "Starting Professional Project Delivery"
    print_status "$BLUE" "Script: $SCRIPT_NAME"
    print_status "$BLUE" "Working Directory: $(pwd)"
    
    # Validate arguments
    validate_arguments "$@"
    
    # Determine delivery mode
    if determine_delivery_mode; then
        local milestone_mode="true"
    else
        local milestone_mode="false"
    fi
    
    # Handle what-if mode
    if [[ "$WHATIF_MODE" == "true" ]]; then
        perform_whatif_analysis "$milestone_mode"
        return 0
    fi
    
    # Create temporary workspace
    create_temp_directory
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Clone client repository
    local repo_dir
    repo_dir=$(clone_client_repository)
    
    # Synchronize files based on mode
    perform_rsync "$repo_dir" "$milestone_mode"
    
    # Update timestamps to current date/time
    print_status "$BLUE" "Updating all file timestamps to current date/time..."
    update_file_timestamps "$repo_dir"
    
    # Commit and push changes
    commit_and_push "$repo_dir"
    
    # Generate summary
    generate_summary "$repo_dir" "$milestone_mode"
    
    print_status "$GREEN" "Professional delivery completed successfully!"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
