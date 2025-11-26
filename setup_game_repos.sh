#!/bin/bash

# Script to create repos and push game directories
GAMES_DIR="/home/coolhand/html/games"

# Array of games to process
declare -a games=(
  "micro-colony"
  "micro-crawl"
  "micro-mystery"
  "moria"
  "nonograms"
  "northern-path"
  "rubics-cube"
  "sandiego"
  "star-trek-1971"
  "wumpus"
  "geoguess"
)

for game in "${games[@]}"; do
  echo "Processing $game..."
  
  if [ -d "$GAMES_DIR/$game" ]; then
    cd "$GAMES_DIR/$game"
    
    # Check if already a git repo
    if [ ! -d ".git" ]; then
      git init
      git add .
      git commit -m "Initial commit of $game game"
    fi
    
    # Create GitHub repo
    gh repo create "game-$game" --private --description "$game game" 2>/dev/null || echo "Repo may already exist"
    
    # Add remote and push
    git remote add origin "https://github.com/lukeslp/game-$game.git" 2>/dev/null || git remote set-url origin "https://github.com/lukeslp/game-$game.git"
    git push -u origin master || git push -u origin main
    
    echo "✓ Completed $game"
    echo ""
  else
    echo "⚠ Directory $GAMES_DIR/$game not found"
  fi
done

echo "All games processed!"