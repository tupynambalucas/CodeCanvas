import * as sudo from '@vscode/sudo-prompt';

/**
 * Executa comandos com privilégios de administrador.
 * Necessário para editar o JS interno do VS Code.
 */
async function sudoExec(command: string, options: { name: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Sudo stderr: ${stderr}`);
      }
      resolve(stdout ? stdout.toString() : '');
    });
  });
}

export { sudoExec };
