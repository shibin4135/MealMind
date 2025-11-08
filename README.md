# MealMind

MealMind is a meal tracking web application that allows users to browse meals, view nutritional information, save meals as favorites, and log meals they have eaten. The project focuses on providing a clean interface for meal exploration and nutrition awareness.

## Features

- Browse meals with calorie and macronutrient information (protein, carbohydrates, fat).
- Save meals to a personal favorites list.
- Log meals to track daily and historical eating patterns.
- Profile model includes subscription-related fields for future Stripe-based subscription support.
- Backend implemented using Prisma ORM with a PostgreSQL database.
- Frontend implemented with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL
- Prisma ORM
- Authentication provider (based on implementation)
- Deployment platform (if deployed)

## Project Structure

src/app – Application routes and pages  
src/components – Reusable UI components  
src/lib – Shared utilities and configuration  
src/prisma – Prisma schema and client

## Database Schema Overview

*Profile*

Stores user profile and subscription information. Links to favorites and meal logs.

*Meal*

Represents an individual meal with nutritional values and category information.

*Favorite* 

Connects a user profile to meals they have marked as favorites. Ensures one unique favorite per user-meal pair.

*MealLog*

Tracks meals logged by a user for daily or historical review.

*Relationships*

Profile 1-to-many Favorite  
Meal 1-to-many Favorite  
Profile 1-to-many MealLog  
Meal 1-to-many MealLog

## Getting Started

### Requirements
- Node.js
- PostgreSQL


