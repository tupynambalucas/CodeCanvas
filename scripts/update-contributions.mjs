import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.join(__dirname, '..');
const packageJsonPath = path.join(rootPath, 'package.json');
const themesPath = path.join(rootPath, 'src', 'themes');

function getFiles(dir, extension) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, extension));
        } else if (file.endsWith(extension)) {
            results.push(filePath);
        }
    });
    return results;
}

function updateContributions() {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Adjusted to specifically look in defaults/themes and custom folders.
    const defaultThemesPath = path.join(themesPath, 'defaults', 'themes');
    const customThemesPath = path.join(themesPath, 'custom');
    
    const themeFiles = [
        ...getFiles(defaultThemesPath, '.theme.json'),
        ...getFiles(customThemesPath, '.theme.json')
    ];
    
    const contributions = [];

    themeFiles.forEach(file => {
        // This check is technically redundant due to specific path search now, but good for safety.
        if (file.includes('templates')) return;

        const theme = JSON.parse(fs.readFileSync(file, 'utf8'));

        // Only add themes that have backgroundConfig
        if (theme.backgroundConfig) {
            const relativePath = path.relative(rootPath, file).replace(/\\/g, '/');
            
            const contribution = {
                label: theme.name || path.basename(file, '.theme.json'),
                uiTheme: theme.type === 'dark' ? 'vs-dark' : 'vs',
                path: './' + relativePath
            };

            contributions.push(contribution);
        }
    });

    packageJson.contributes.themes = contributions;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`Updated package.json with ${contributions.length} themes with backgroundConfig.`);
}

updateContributions();
