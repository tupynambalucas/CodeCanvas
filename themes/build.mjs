import path from 'path';
import { fileURLToPath } from 'url';
import { BuildService } from './src/core/BuildService.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const paths = {
  ROOT_PACKAGE_JSON: path.join(__dirname, '..', 'package.json'),
  DEFAULTS_PATH: path.join(__dirname, 'src', 'defaults'),
  TEMPLATES_PATH: path.join(__dirname, 'src', 'templates'),
  OUTPUT_PATH: path.join(__dirname, 'build'),
};

new BuildService(paths).run().catch(console.error);
