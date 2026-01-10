import fs from 'fs';

export class PackageRegistry {
  constructor(packageJsonPath) {
    this.path = packageJsonPath;
  }

  register(contributions) {
    if (!fs.existsSync(this.path)) {
      throw new Error('package.json não encontrado.');
    }
    const pkg = JSON.parse(fs.readFileSync(this.path, 'utf8'));
    pkg.contributes = pkg.contributes || {};
    pkg.contributes.themes = contributions;
    fs.writeFileSync(this.path, JSON.stringify(pkg, null, 2));
    console.log(`📦 package.json atualizado com ${contributions.length} temas.`);
  }
}
