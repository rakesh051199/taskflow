#!/bin/bash

# setup-plan.sh
# Sets up the implementation plan for a feature

set -e

# Parse arguments
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Detect current feature branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Extract feature short name from branch (feature/xxx -> xxx)
if [[ "$CURRENT_BRANCH" == feature/* ]]; then
  SHORT_NAME=$(echo "$CURRENT_BRANCH" | sed 's/feature\///')
else
  # Try to find the most recent feature directory
  FEATURES_DIR="$REPO_ROOT/.specify/features"
  if [[ -d "$FEATURES_DIR" ]]; then
    SHORT_NAME=$(ls -t "$FEATURES_DIR" | head -1)
  else
    echo "Error: Could not determine feature name" >&2
    exit 1
  fi
fi

# Set paths
FEATURE_DIR="$REPO_ROOT/.specify/features/$SHORT_NAME"
FEATURE_SPEC="$FEATURE_DIR/spec.md"
IMPL_PLAN="$FEATURE_DIR/plan.md"
SPECS_DIR="$FEATURE_DIR"

# Check if feature directory exists
if [[ ! -d "$FEATURE_DIR" ]]; then
  echo "Error: Feature directory not found: $FEATURE_DIR" >&2
  exit 1
fi

# Check if spec exists
if [[ ! -f "$FEATURE_SPEC" ]]; then
  echo "Error: Specification file not found: $FEATURE_SPEC" >&2
  exit 1
fi

# Create plan.md from template if it doesn't exist
if [[ ! -f "$IMPL_PLAN" ]]; then
  TEMPLATE="$REPO_ROOT/.specify/templates/plan-template.md"
  if [[ -f "$TEMPLATE" ]]; then
    cp "$TEMPLATE" "$IMPL_PLAN"
  else
    # Create minimal plan if template doesn't exist
    cat > "$IMPL_PLAN" <<EOF
# Implementation Plan: $SHORT_NAME

## Technical Context

## Constitution Check

## Phase 0: Research

## Phase 1: Design & Contracts

EOF
  fi
fi

# Output JSON if requested
if [[ "$JSON_OUTPUT" == "true" ]]; then
  cat <<EOF
{
  "FEATURE_SPEC": "$FEATURE_SPEC",
  "IMPL_PLAN": "$IMPL_PLAN",
  "SPECS_DIR": "$SPECS_DIR",
  "BRANCH": "$CURRENT_BRANCH",
  "FEATURE_DIR": "$FEATURE_DIR"
}
EOF
else
  echo "Feature Spec: $FEATURE_SPEC"
  echo "Implementation Plan: $IMPL_PLAN"
  echo "Specs Directory: $SPECS_DIR"
  echo "Branch: $CURRENT_BRANCH"
fi

