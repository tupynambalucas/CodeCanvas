import * as sudo from '@vscode/sudo-prompt';

/**
 * Executa um comando com privilégios de administrador/sudo.
 * Necessário para modificar arquivos internos do VS Code.
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
