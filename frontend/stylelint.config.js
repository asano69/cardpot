// Stylelint rules for the migration away from Tailwind (see
// docs/class-base-styling-plan.md). Deliberately small: only rules that check
// the plan's conventions, no style opinions.
export default {
  rules: {
    // Public styles nest one level at most. Wrapper at-rules do not count.
    "max-nesting-depth": [1, { ignoreAtRules: ["layer", "media", "supports"] }],

    // Tailwind's own at-rules, until Tailwind is removed (Phase 5).
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "apply",
          "custom-variant",
          "plugin",
          "source",
          "utility",
          "variant",
          "config",
        ],
      },
    ],

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
