const fs = require("fs");
const path = require("path");

const projectRoot = __dirname; // diretório onde o script está
const outputFile = path.join(projectRoot, "project_dump.docx");

// extensões que você quer incluir no dump:
const allowedExtensions = [".js", ".ts", ".tsx", ".json", ".jsx", ".css", ".scss"];

function dumpDirectory(currentPath, writeStream) {
  const items = fs.readdirSync(currentPath);

  for (const item of items) {
    const itemPath = path.join(currentPath, item);
    const relativePath = path.relative(projectRoot, itemPath);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      if (item === "node_modules") {
        // Ignora a pasta node_modules
        continue;
      }
      dumpDirectory(itemPath, writeStream);
    } else if (allowedExtensions.includes(path.extname(item))) {
      try {
        const fileContent = fs.readFileSync(itemPath, "utf-8");
        writeStream.write(`\n=== ${relativePath} ===\n`);
        writeStream.write(fileContent + "\n");
        console.log(`Copiado: ${relativePath}`);
      } catch (error) {
        console.error(`Erro ao ler ${relativePath}:`, error.message);
      }
    }
  }
}

function main() {
  const writeStream = fs.createWriteStream(outputFile, { flags: "w" });

  writeStream.write(`DUMP DO PROJETO - ${new Date().toISOString()}\n`);
  writeStream.write(`Diretório do projeto: ${projectRoot}\n\n`);

  dumpDirectory(projectRoot, writeStream);

  writeStream.end(() => {
    console.log(`\nArquivo gerado com sucesso: ${outputFile}`);
  });
}

main();
