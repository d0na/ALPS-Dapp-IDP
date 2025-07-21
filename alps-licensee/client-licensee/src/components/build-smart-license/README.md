# Build Smart License Components

This directory contains a modular implementation of the Build Smart License feature, broken down into reusable components for better maintainability and development efficiency.

## Directory Structure

```
build-smart-license/
├── README.md                    # This file
├── index.js                     # Main exports file
├── steps/
│   ├── StepModeSelection.js     # Step 1: Mode selection (Manual/AI)
│   ├── StepConfiguration.js     # Step 2: Form configuration
│   └── StepReviewGenerate.js    # Step 3: Review and generate JSON
├── utils/
│   └── jsonGenerator.js         # JSON generation utilities
└── styles/
    └── buildSmartLicenseStyles.js # Shared Material-UI styles
```

## Components Overview

### Steps

#### `StepModeSelection`
- **Purpose**: First step of the wizard - allows users to choose between manual configuration or AI-assisted creation
- **Props**: `mode`, `setMode`, `handleNext`
- **Features**: Radio button selection with descriptions

#### `StepConfiguration`
- **Purpose**: Second step - contains both manual form and AI text input interfaces
- **Props**: `mode`, `manualData`, `setManualData`, `aiText`, `setAiText`, `handleNext`, `handleBack`
- **Features**: 
  - Manual mode: Complete form with license parameters
  - AI mode: File upload and text input areas
  - Form validation using utility functions

#### `StepReviewGenerate`
- **Purpose**: Final step - displays generated JSON and provides actions
- **Props**: `generatedJson`, `generateJson`, `handleBack`, `onCreateLicense`
- **Features**: 
  - JSON display with syntax highlighting
  - Download JSON file
  - Copy to clipboard
  - Create license action
  - Regenerate option

### Utilities

#### `jsonGenerator.js`
- **`generateSmartLicenseJson(mode, manualData, aiText)`**: Main function to generate JSON configuration
- **`validateManualData(manualData)`**: Validates manual form completeness
- **`validateAiText(aiText)`**: Validates AI text input

### Styles

#### `buildSmartLicenseStyles.js`
- Centralized Material-UI styles using `makeStyles`
- Shared across all components for consistency
- Includes hover effects and responsive styling

## Usage

Import components from the main index file:

```javascript
import {
  StepModeSelection,
  StepConfiguration,
  StepReviewGenerate,
  generateSmartLicenseJson,
  useBuildSmartLicenseStyles
} from "components/build-smart-license";
```

## Benefits of Modular Structure

1. **Maintainability**: Each step is isolated in its own file
2. **Reusability**: Components can be reused in different contexts
3. **Testing**: Easier to write unit tests for individual components
4. **Development**: Multiple developers can work on different steps simultaneously
5. **Code Clarity**: Clear separation of concerns
6. **Performance**: Better code splitting possibilities

## Future Enhancements

- Add TypeScript definitions
- Create unit tests for each component
- Add Storybook stories for component documentation
- Implement actual AI integration
- Add form field validation with error messages
- Create custom hooks for state management 