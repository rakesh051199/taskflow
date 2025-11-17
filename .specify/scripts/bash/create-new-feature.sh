#!/bin/bash

# create-new-feature.sh
# Creates a new feature branch and initializes the spec file

set -e

# Parse arguments
FEATURE_DESC=""
SHORT_NAME=""
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --short-name)
      SHORT_NAME="$2"
      shift 2
      ;;
    *)
      if [[ -z "$FEATURE_DESC" ]]; then
        FEATURE_DESC="$1"
      else
        FEATURE_DESC="$FEATURE_DESC $1"
      fi
      shift
      ;;
  esac
done

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Generate short name if not provided
if [[ -z "$SHORT_NAME" ]]; then
  # Simple short name generation: lowercase, replace spaces with hyphens
  SHORT_NAME=$(echo "$FEATURE_DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-50)
fi

# Ensure git is initialized
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  cd "$REPO_ROOT"
  git init
  git config user.name "TaskFlow Developer" || true
  git config user.email "developer@taskflow.local" || true
fi

# Get current branch or use 'main' as default
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Create feature branch name
BRANCH_NAME="feature/$SHORT_NAME"

# Create branch if it doesn't exist
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "Branch $BRANCH_NAME already exists" >&2
else
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

# Create feature directory
FEATURE_DIR="$REPO_ROOT/.specify/features/$SHORT_NAME"
mkdir -p "$FEATURE_DIR"
mkdir -p "$FEATURE_DIR/checklists"

# Create spec file if it doesn't exist
SPEC_FILE="$FEATURE_DIR/spec.md"

if [[ ! -f "$SPEC_FILE" ]]; then
  # Copy template
  TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
  if [[ -f "$TEMPLATE" ]]; then
    cp "$TEMPLATE" "$SPEC_FILE"
    # Update title and date
    sed -i.bak "s/\[Feature Name\]/$FEATURE_DESC/g" "$SPEC_FILE"
    sed -i.bak "s/\[YYYY-MM-DD\]/$(date +%Y-%m-%d)/g" "$SPEC_FILE"
    rm -f "$SPEC_FILE.bak"
  else
    # Create minimal spec if template doesn't exist
    cat > "$SPEC_FILE" <<EOF
---
title: $FEATURE_DESC
status: draft
created: $(date +%Y-%m-%d)
updated: $(date +%Y-%m-%d)
---

# $FEATURE_DESC

## Overview

[Brief description of the feature]

## User Stories

## Functional Requirements

## Success Criteria

EOF
  fi
fi

# Output JSON if requested
if [[ "$JSON_OUTPUT" == "true" ]]; then
  cat <<EOF
{
  "BRANCH_NAME": "$BRANCH_NAME",
  "FEATURE_DIR": "$FEATURE_DIR",
  "FEATURE_SPEC": "$SPEC_FILE",
  "SHORT_NAME": "$SHORT_NAME"
}
EOF
else
  echo "Branch: $BRANCH_NAME"
  echo "Feature Directory: $FEATURE_DIR"
  echo "Spec File: $SPEC_FILE"
fi

