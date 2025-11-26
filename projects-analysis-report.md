# Projects Directory Analysis Report

## Overview
Analysis of `/home/coolhand/projects` directory to identify game-related projects, git repository status, and project readiness.

## Game-Related Projects Found

### 1. **NaughtyBlocks** 🎮
- **Location**: `/home/coolhand/projects/naughtyblocks`
- **Type**: AI-powered interactive fiction engine
- **Status**: Production ready (per documentation)
- **Description**: Browser-based interactive fiction engine inspired by Twine and SugarCube 2, with AI-powered content generation
- **Tech Stack**: Vue 3, TypeScript, Flask, xAI API
- **Features**:
  - Visual story editor with graph-based interface
  - AI-generated content with Grok integration
  - Markdown support with custom macros
  - Save/load functionality
  - Light/dark theme
- **Game Index Candidate**: YES - This is a complete game creation/playing system

### 2. **StoryBlocks** 📖
- **Location**: `/home/coolhand/projects/storyblocks`
- **Type**: Interactive storytelling platform
- **Status**: Production ready (per README badge)
- **Description**: AI-enhanced interactive storytelling with visual editing and intelligent content generation
- **Tech Stack**: Python 3.9+, JavaScript ES6+
- **Features**:
  - Node-based story editor with 6 node types
  - Keystone plot system
  - Character creation and RPG elements
  - Inventory and skill progression
  - AI-powered content and image generation
- **Game Index Candidate**: YES - This is a game creation and playing platform

### 3. **WordBlocks** 💬
- **Location**: `/home/coolhand/projects/wordblocks`
- **Type**: AAC (Augmentative and Alternative Communication) tool
- **Status**: Production (per README badge)
- **Description**: Visual grammar AAC system for building sentences through semantic networks
- **Tech Stack**: Python 3.7+, Web frontend
- **Features**:
  - Drag-and-drop sentence building
  - AI-powered word suggestions
  - Text-to-speech
  - Visual network representation
- **Game Index Candidate**: MAYBE - While educational/therapeutic, it has game-like interaction

### 4. **Raccoon Mode** 🦝
- **Location**: `/home/coolhand/projects/raccoon_mode`
- **Type**: Productivity/task management app
- **Status**: Active development
- **Description**: AI-powered task and snippet management system
- **Features**:
  - Task extraction from text
  - Code snippet organization
  - Mood analytics
- **Game Index Candidate**: NO - This is a productivity tool, not a game

### 5. **Educational Gaming Platform** 🎓
- **Location**: `/home/coolhand/projects/product_master/educational-gaming-platform`
- **Type**: Gaming platform framework
- **Status**: Implementation started
- **Description**: Infrastructure for educational games including "Crossing" immigration simulation
- **Tech Stack**: FastAPI backend, React frontend
- **Features**:
  - Multiple game modules planned
  - Accessibility features
  - Analytics integration
- **Game Index Candidate**: PARTIAL - Contains game modules but appears to be infrastructure

## Git Repository Status

### Main Projects Repository
- `/home/coolhand/projects` itself is a git repository
- Individual projects within do NOT have separate `.git` directories
- This suggests all projects are tracked in a monorepo structure

### Projects Without Git (Standalone)
All examined projects appear to be part of the main `/home/coolhand/projects` git repository rather than having individual repositories.

## Project Readiness Assessment

### ✅ **Ready for Games Index**
1. **NaughtyBlocks** - Fully documented, has quick start guide, appears production-ready
2. **StoryBlocks** - Production badge, comprehensive features, well-documented

### ⚠️ **Potentially Ready (Need Testing)**
1. **WordBlocks** - Production badge but AAC focus may not fit games category

### 🚧 **Not Ready / In Development**
1. **Educational Gaming Platform** - Infrastructure only, games not yet implemented
2. **Raccoon Mode** - Not a game

### 📦 **Archived Projects**
- Multiple projects in `_archive/` directory including older versions of swarm and io projects

## Recommendations

### For Immediate Addition to Games Index:
1. **NaughtyBlocks** - Interactive fiction creation/playing system
   - Add as "Interactive Fiction Engine"
   - Highlight AI-powered content generation

2. **StoryBlocks** - Story creation and playing platform
   - Add as "Story Creation Platform"
   - Emphasize visual editing and RPG elements

### For Consideration:
1. **WordBlocks** - Could be added under "Educational Games" category
   - Position as communication/language learning game

### Migration Needed:
These projects would need to be moved from `/home/coolhand/projects` to `/home/coolhand/html/games/` and integrated with the service manager for proper deployment.

## Summary

Found 3 game-related projects suitable for the games index:
- 2 ready for immediate inclusion (NaughtyBlocks, StoryBlocks)
- 1 potentially suitable (WordBlocks)
- All projects are part of a monorepo structure
- Projects would need migration and service configuration for deployment