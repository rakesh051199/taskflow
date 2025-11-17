#!/bin/bash

# check-prerequisites.sh
# Checks prerequisites and returns feature directory information

set -e

# Parse arguments
JSON_OUTPUT=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --require-tasks)
      REQUIRE_TASKS=true
      shift
      ;;
    --include-tasks)
      INCLUDE_TASKS=true
      shift
      ;;
    --paths-only)
      PATHS_ONLY=true
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
TASKS="$FEATURE_DIR/tasks.md"

# Check if feature directory exists
if [[ ! -d "$FEATURE_DIR" ]]; then
  echo "Error: Feature directory not found: $FEATURE_DIR" >&2
  exit 1
fi

# Check required files
if [[ ! -f "$FEATURE_SPEC" ]]; then
  echo "Error: Specification file not found: $FEATURE_SPEC" >&2
  exit 1
fi

if [[ "$REQUIRE_TASKS" == "true" ]] && [[ ! -f "$TASKS" ]]; then
  echo "Error: Tasks file not found: $TASKS" >&2
  exit 1
fi

# Build available docs list
AVAILABLE_DOCS=()
[[ -f "$FEATURE_SPEC" ]] && AVAILABLE_DOCS+=("spec.md")
[[ -f "$IMPL_PLAN" ]] && AVAILABLE_DOCS+=("plan.md")
[[ -f "$TASKS" ]] && AVAILABLE_DOCS+=("tasks.md")
[[ -f "$FEATURE_DIR/data-model.md" ]] && AVAILABLE_DOCS+=("data-model.md")
[[ -f "$FEATURE_DIR/research.md" ]] && AVAILABLE_DOCS+=("research.md")
[[ -f "$FEATURE_DIR/quickstart.md" ]] && AVAILABLE_DOCS+=("quickstart.md")
[[ -d "$FEATURE_DIR/contracts" ]] && AVAILABLE_DOCS+=("contracts/")

# Output JSON if requested
if [[ "$JSON_OUTPUT" == "true" ]] || [[ "$PATHS_ONLY" == "true" ]]; then
  if [[ "$INCLUDE_TASKS" == "true" ]] && [[ -f "$TASKS" ]]; then
    cat <<EOF
{
  "FEATURE_DIR": "$FEATURE_DIR",
  "FEATURE_SPEC": "$FEATURE_SPEC",
  "IMPL_PLAN": "$IMPL_PLAN",
  "TASKS": "$TASKS",
  "AVAILABLE_DOCS": $(printf '%s\n' "${AVAILABLE_DOCS[@]}" | jq -R . | jq -s .)
}
EOF
  else
    cat <<EOF
{
  "FEATURE_DIR": "$FEATURE_DIR",
  "FEATURE_SPEC": "$FEATURE_SPEC",
  "IMPL_PLAN": "$IMPL_PLAN",
  "AVAILABLE_DOCS": $(printf '%s\n' "${AVAILABLE_DOCS[@]}" | jq -R . | jq -s .)
}
EOF
  fi
else
  echo "Feature Directory: $FEATURE_DIR"
  echo "Feature Spec: $FEATURE_SPEC"
  echo "Implementation Plan: $IMPL_PLAN"
  [[ -f "$TASKS" ]] && echo "Tasks: $TASKS"
  echo "Available Docs: ${AVAILABLE_DOCS[*]}"
fi

