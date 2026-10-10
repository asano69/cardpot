// Stylelint rules that check the styling conventions of CLAUDE.md.
// Deliberately small: no style opinions.
export default {
  rules: {
    // Public styles nest one level at most. Wrapper at-rules do not count.
    "max-nesting-depth": [1, { ignoreAtRules: ["layer", "media", "supports"] }],

    "at-rule-no-unknown": true,

    // Colors come from tokens. Only a warning for now: existing files still
    // hold literals, and the migration removes them step by step. Raise it
    // to an error once the count reaches zero.
    "color-no-hex": [true, { severity: "warning" }],
  },
  overrides: [
    {
      // Token definitions and user overrides are where literals belong.
      files: ["src/styles/theme/*.css", "src/styles/user.css"],
      rules: { "color-no-hex": null },
    },
  ],
};
