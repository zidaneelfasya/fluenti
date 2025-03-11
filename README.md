# Installation
To get started with this project, follow the steps below:

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation Steps

1. **Clone the repository:**

  ```sh
  git clone https://github.com/yourusername/fe-capstone.git
  cd fe-capstone
  ```

2. **Install dependencies:**

  Using npm:

  ```sh
  npm install
  ```

  Or using yarn:

  ```sh
  yarn install
  ```

3. **Start the development server:**

  Using npm:

  ```sh
  npm run dev
  ```

  Or using yarn:

  ```sh
  yarn dev
  ```

4. **Open the project in your browser:**

  The development server will start on `http://localhost:3000`. Open this URL in your browser to see the project running.


## Contributing

contribute project with this:

1. Fork repo.
2. make a branch based on the feature ure makeing or ur name 
3. make a changes.
4. Commit your changes and push the branch to your fork.
5. Dont instantly pull ur project into main!, make a pull request first 
6. Create a pull request to the main repository.
7. Verified ur changes, DONE!!

Happy coding!


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
