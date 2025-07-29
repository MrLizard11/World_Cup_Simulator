# World Cup Simulator ⚽

A comprehensive FIFA World Cup tournament simulation Angular app and tournament management.

## Features Overview

### 1. Authentication Pages 🔐

#### Account System
- **✅ Register** – Create a new account (email + password)
- **🔑 Login** – Secure sign-in with session/token handling
- **🚪 Logout** – Ends session safely

### 2. Home Page 🏠

#### Landing Page
- Intro to the app
- Start Simulation button
- **If logged in**: display username, link to history
- **If guest**: prompt login/register

### 3. Team Selection Page 🌍

#### Select Teams
- Full list of FIFA-recognized countries
- Country name, flag, and ELO rating
- Filter by confederation or sort by ELO

#### Options:
- **✅ Select All**
- **🎲 Random 32**
- **❌ Clear**

### 4. Bracket Setup Page 📊

#### Tournament Format
Choose from:
- Group Stage + Knockouts
- Knockout Only
- Randomize or manually set up brackets
- Drag-and-drop bracket builder

#### Bracket Options:
- Number of groups
- Tie-break rules

### 5. Simulation Page ⚽

#### Simulate Tournament
- Simulate by round or all at once
- Group tables and knockout tree update live

#### Match Summary Cards:
- Score
- ELO delta
- Winner highlight

### 6. Summary Page 🏆

#### Tournament Recap
- Champion and runner-up
- Bracket overview

#### Notable Stats:
- Biggest win
- Closest game
- Total goals


### 7. History Page (Logged-in Users) 📜

#### My Simulations
View previous tournaments:
- Teams used
- Format
- Results
