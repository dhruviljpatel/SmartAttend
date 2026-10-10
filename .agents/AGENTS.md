# SmartAttend Project Guidelines

## Icons
- **Primary Source**: Use [Icons8](https://icons8.com/) for all new icons in the project.
- **Format**: Always import and use SVG format.
- **Convention**:
  - Keep the code standard and simple. 
  - Create standard React Functional Components for the SVGs. Example:
    ```tsx
    import React from 'react';

    export const MyIcon = (props: React.SVGProps<SVGSVGElement>) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* SVG Paths from Icons8 */}
      </svg>
    );
    ```
  - Spread `props` to the root `<svg>` tag to allow customization of `className`, `width`, `height`, etc.
  - This ensures simplicity and prevents the icon code from getting messy.
