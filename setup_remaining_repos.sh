#!/bin/bash

# Handle rubics directory
echo "Processing rubics..."
cd /home/coolhand/html/games/rubics
git init
git add .
git commit -m "Initial commit of Rubik's Cube game"
gh repo create game-rubics-cube --private --description "Rubik's Cube game" 2>/dev/null || echo "Repo may already exist"
git remote add origin https://github.com/lukeslp/game-rubics-cube.git 2>/dev/null || git remote set-url origin https://github.com/lukeslp/game-rubics-cube.git
git push -u origin master || git push -u origin main
echo "✓ Completed rubics"

# Handle star-trek directory
echo "Processing star-trek..."
cd /home/coolhand/html/games/star-trek
git init
git add .
git commit -m "Initial commit of Star Trek 1971 game"
gh repo create game-star-trek-1971 --private --description "Star Trek 1971 game" 2>/dev/null || echo "Repo may already exist"
git remote add origin https://github.com/lukeslp/game-star-trek-1971.git 2>/dev/null || git remote set-url origin https://github.com/lukeslp/game-star-trek-1971.git
git push -u origin master || git push -u origin main
echo "✓ Completed star-trek"

echo "All remaining games processed!"