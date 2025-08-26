# GEMINI.md: Time Tracking Application

## Introduction

This document provides a comprehensive overview of the Time Tracking Application, a sophisticated tool designed for meticulous time management and productivity analysis. The application empowers users to plan and track their activities on an 84-hour weekly grid, utilizing the Eisenhower Matrix for prioritization. It offers rich data visualizations and interactive charts to provide actionable insights into time allocation and plan execution.

The project is a testament to modern front-end development practices, showcasing a clean, scalable, and maintainable architecture. It is built with a focus on user experience, performance, and developer ergonomics.

## Getting Started

### Prerequisites

-   Node.js 18.17 or later
-   `npm` or `yarn`

### Installation and Execution

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd time_track_app2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Architecture

The application is a client-side rendered React application built with Next.js 14 and TypeScript.

### Technology Stack

-   **Framework**: Next.js 14 / React 18
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: Custom-built, with `lucide-react` for icons.
-   **Charts**: `chart.js` with `react-chartjs-2` wrappers.
-   **State Management**: React Context API with `useReducer`.
-   **Data Persistence**: `localStorage` abstracted by a Repository pattern.
-   **Testing**: Jest and React Testing Library.

### Directory Structure

The project follows a logical and organized directory structure:

```
src/
├── app/                # Next.js app router, entry point, and layout
├── components/         # Reusable React components
│   ├── charts/         # Chart components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── ui/             # Generic UI elements (Button, ResizablePanel)
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Core application logic
│   ├── models/         # Data models (Category, TimeEntry)
│   ├── repositories/   # Data access layer (TimeTrackingRepository)
│   ├── services/       # Services (StorageService)
│   └── utils/          # Utility functions
├── stores/             # Centralized state management (TimeTrackingContext)
└── types/              # TypeScript type definitions
```

## Key Modules and Components

### State Management (`src/stores/TimeTrackingContext.tsx`)

State is managed centrally using React's Context API and the `useReducer` hook. This provides a single source of truth for the application state and a predictable way to update it. The `TimeTrackingProvider` encapsulates the state logic and provides it to the entire application.

### Data Persistence (`src/lib/repositories/TimeTrackingRepository.ts`)

The `TimeTrackingRepository` class implements the Repository design pattern, abstracting the data source from the rest of the application. It handles all CRUD operations for categories, time entries, and planned entries. By default, it uses the `LocalStorageService` to persist data in the browser's local storage. This design makes it easy to switch to a different storage mechanism (e.g., a remote database) in the future without affecting the application's business logic.

### Core Components

-   **`TimeGrid.tsx`**: The central component of the application. It displays the 84-hour weekly grid and handles user interactions for planning and tracking time.
-   **`Sidebar.tsx`**: A multi-functional sidebar that allows users to manage categories and view statistics. It features a tabbed interface to switch between "Categories" and "Stats" views.
-   **`ResizablePanel.tsx`**: A higher-order component that makes the sidebar resizable, demonstrating a commitment to user-customizable interfaces.
-   **Chart Components (`src/components/charts/`)**: A suite of components for data visualization, including `CategoryDistributionChart`, `EisenhowerMatrixChart`, and `WeeklyProgressChart`.

## Data Model

The application's data model is defined in `src/lib/models/`. The core entities are:

-   **`Category.ts`**: Represents a user-defined category for time entries (e.g., "Work", "Study", "Exercise"). Each category has a name, color, and unique ID.
-   **`TimeEntry.ts`**: Represents an actual time entry for a specific hour. It includes the category, date, hour, and Eisenhower Matrix attributes (`isImportant`, `isUrgent`).
-   **`PlannedEntry.ts`**: Represents a planned activity for a future time slot.

## Design Decisions

-   **Client-Side Rendering**: As a highly interactive application, a client-side rendered approach provides a responsive user experience without frequent page reloads.
-   **Repository Pattern**: The use of the Repository pattern for data access is a strategic choice that enhances maintainability and testability. It decouples the application logic from the data storage mechanism.
-   **Centralized State Management**: Using React Context with `useReducer` provides a lightweight yet powerful solution for managing global state, avoiding the need for external libraries like Redux for an application of this scale.
-   **TypeScript**: The entire codebase is written in TypeScript, ensuring type safety and improving developer productivity, especially in a team environment.
-   **Test-Driven Development (TDD)**: The presence of a comprehensive test suite (`src/__tests__`) indicates a commitment to quality and a TDD-like approach, ensuring that new features are reliable and do not introduce regressions.

## Usage

1.  **Category Management**: Create and manage categories in the "Categories" tab of the sidebar.
2.  **Planning**: Click on the left side of a time slot in the `TimeGrid` to plan an activity.
3.  **Tracking**: Click on the right side of a time slot to track an actual activity.
4.  **Prioritization**: When creating or editing a time entry, mark it as important and/or urgent to categorize it within the Eisenhower Matrix.
5.  **Analysis**: Switch to the "Stats" tab in the sidebar to view interactive charts and gain insights into your time allocation.
6.  **Data Export**: Use the "Export" button in the header to download your time tracking data as a CSV file.

## Future Roadmap

The project's documentation (`docs/next_phase_roadmap.md`) outlines a clear vision for future development, including:

-   Enhanced Eisenhower Matrix visualization.
-   Advanced analytics and reporting features.
-   Cloud synchronization and user accounts.

This well-documented roadmap demonstrates a forward-thinking approach to the project's evolution.
