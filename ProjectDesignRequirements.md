Product Overview:
Name: LockedIn

Goal:
Help students get quick access to resources as well as a one stop for built in productivity tools.

Core Value:
Fetch course info from UTD Nebula API
Extract syllabus -> recommend resources
Combine planning + studying

Target Users:
UTD Students

Core Features:
Course search + Syllabus Fetching
Description:
User searches course
App fetches course data through API
Display syllabus (parsed)
Requirements:
API Integration
Handle missing syllabus cases
AI Resource Recommendation
Description:
Parse syllabus topics
Recommend:
Youtube videos
Articles
Practice problems
AI:
Extract topics from syllabus text
Generate study recommendations
Pomodoro Timer
Built in focus timer
Requirements:
Start/pause/reset
Optional:
Track Sessions
ToDo list and Calendar Integration
Tasks generated from syllabus or manually added
Calendar import (google calendar)
Task creation/edit/delete
Sync or import calendar
User Flow:
User logins (optional)
Searches for course
Selects course -> syllabus loads
Clicks “generate study plan” /”find resources”
App:
Parses syllabus
Creates tasks
Recommend resources
User:
Track tasks
Uses pomodoro timer
MVP Scope:
Course search via API
Basic syllabus parsing
Ai generated study plan
Pomodoro timer
Basic todo

Techstack:
React 
Fast API
AI layer:
Using Gemini (for parsing and recommendations)
Ex:
Prompt:”extract topics from syllabus”
Prompt:”Generate study plan for topics”
Database:
Firebase
MongoDB
SupaBase
API:
Nebula API
Calendar:
Simulate calendar view
