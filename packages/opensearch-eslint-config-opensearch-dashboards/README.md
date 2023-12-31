# opensearch-eslint-config-opensearch-dashboards

The eslint config used by the opensearch dashboards team

## Usage

To use this eslint config, just install the peer dependencies and reference it
in your `.eslintrc`:

```javascript
{
  extends: [
    '@elastic/eslint-config-kibana'
  ]
}
```

## Optional jest config

If the project uses the [jest test runner](https://jestjs.io),
the `@elastic/eslint-config-kibana/jest` config can be extended as well to use
`eslint-plugin-jest` and add settings specific to it:

```javascript
{
  extends: [
    '@elastic/eslint-config-kibana',
    '@elastic/eslint-config-kibana/jest'
  ]
}
```
