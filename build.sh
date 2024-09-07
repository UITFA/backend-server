#!/bin/bash

# Stop on error
set -e
echo "Start build backend...."

# Check build branch
current_branch=$(git branch --show-current)
echo "Checking build branch with $current_branch ..."

if [ "$2" != "true" ] && [ "$current_branch" != "fix/auth" ]; then
  echo "Please checkout to fix/auth or ask bthZang for the permission to build backend"
  exit
fi


if [ -z "$1" ]; then
  # Get version
  read -r -p "Enter version you want to deploy: " version
  # Check if the input is empty
  if [ -z "$version" ]; then
    echo "You did not enter a version."
    exit 1
  fi
else
  version=$1
fi

# Load only GITHUB_TOKEN from .env
if [ -f .env ]; then
  export $(grep -w GITHUB_TOKEN .env | xargs)
fi
github_token=$GITHUB_TOKEN

image=ghcr.io/bthzang/aqa-backend-nestjs/aqa-be:$version
repo="bthzang/aqa-backend-nestjs"

echo "Checking version...."

# response=$(curl --silent --header "Authorization: token $github_token" "https://ghcr.io/v2/$repo/tags/list")

export GHCR_TOKEN=$(echo $github_token | base64)
curl -H "Authorization: Bearer $GHCR_TOKEN" https://ghcr.io/v2/$repo/tags/list
echo "Response: $response"

if echo "$response" | jq -r '.tags[]' | grep -q "^$version$"; then
  echo "$version exists"
  exit 1
else
  echo "$version does not exist"
fi

# Login to GitHub Container Registry
echo "Login to Github registry...."]
echo "$github_token" | docker login ghcr.io -u bthzang --password-stdin

# Repair image
echo "Build image...."
docker build -t "$image" . --platform linux/amd64

echo "Push image...."
docker push "$image"

echo "Clean up by removing image $image"
docker system prune -a -f

echo "Success"
