#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

console.log(`Compiling definitions...`);

// shell.exec(`tsc -p tsconfig.declaration.json --outDir es/`);

// replace block ts-ignore comments with line ones to support TS < 3.9
shell.sed(
  '-i',
  /\*\* @ts-ignore/g,
  '/ @ts-ignore',
  path.join(__dirname, '../../es/**/*.d.ts')
);

// TypeScript uses `import()` types in very small files, but API extractor does not support that
// We will hardcode the type definitions here, to avoid the build not passing.

fs.writeFileSync(
  path.join(
    __dirname,
    '../../es/connectors/infinite-hits/connectInfiniteHitsWithInsights.d.ts'
  ),
  `
// edited by yarn build:types
import { Connector } from '../../types';
import {
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams,
} from './connectInfiniteHits';

declare const connectInfiniteHitsWithInsights: Connector<
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams
>;
export default connectInfiniteHitsWithInsights;
`
);

fs.writeFileSync(
  path.join(__dirname, '../../es/connectors/hits/connectHitsWithInsights.d.ts'),
  `
// edited by yarn build:types
import { Connector } from '../../types';
import {
  HitsRendererOptions,
  HitsConnectorParams,
} from './connectHits';

declare const connectHitsWithInsights: Connector<
  HitsRendererOptions,
  HitsConnectorParams
>;
export default connectHitsWithInsights;
`
);

console.log();
console.log(`Validating definitions...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const publicExports = [
  // 'components' -> does not contains index.d.ts yet
  'connectors',
  // 'lib', -> Api extrator "import * as ___ from ___;" is not supported yet for local files
  // 'middleware',
  'helpers',
  'types',
  'widgets', //  -> It does not compile as WidgetFactory is not imported in all files
  'lib/routers',
];

fs.writeFileSync(
  path.join(__dirname, '../../', 'es/index.d.ts'),
  [
    `export { default } from './index.es';`,
    ...publicExports
      .map(publicExport => `./${publicExport}`)
      .map(exportedFile => {
        return `export * from '${exportedFile}';`;
      }),
  ].join('\r\n')
);

const extractorConfig = ExtractorConfig.loadFileAndPrepare(
  path.resolve(path.join(__dirname, '../../', 'api-extractor.json'))
);

const result = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});

if (!result.succeeded) {
  console.error(
    `API Extractor completed with ${result.errorCount} errors` +
      ` and ${result.warningCount} warnings`
  );

  process.exitCode = 1;
}
