module.exports = {
  useTabs: false,
  arrowParens: "avoid",
  printWidth: 100,
  quoteProps: "as-needed",
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "none",
  jsxSingleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  overrides: [
    {
      files: ["*.json", "*.yml", "*.md"],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: "*.{js}",
      options: {
        parser: "babel",
      },
    },
  ],
};
