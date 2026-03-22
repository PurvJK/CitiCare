import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(process.cwd(), 'frontend', 'src');
const converted = [];
const targets = [];

function walk(dir, visit) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p, visit);
    } else {
      visit(p);
    }
  }
}

walk(root, (file) => {
  if (file.endsWith('.tsx') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
    targets.push(file);
  }
});

for (const file of targets) {
  const src = fs.readFileSync(file, 'utf8');
  const isTsx = file.endsWith('.tsx');
  const output = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: isTsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      verbatimModuleSyntax: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
    fileName: file,
  }).outputText;

  const outFile = isTsx ? file.replace(/\.tsx$/, '.jsx') : file.replace(/\.ts$/, '.js');
  fs.writeFileSync(outFile, output, 'utf8');
  if (outFile !== file) {
    fs.unlinkSync(file);
  }
  converted.push({ from: file, to: outFile });
}

const codeFiles = [];
walk(root, (file) => {
  if (/\.(js|jsx|ts|tsx)$/.test(file)) {
    codeFiles.push(file);
  }
});

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const patched = text
    .replace(/(from\s+['"][^'"]+)\.tsx(['"])/g, '$1.jsx$2')
    .replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2')
    .replace(/(import\s*\(\s*['"][^'"]+)\.tsx(['"]\s*\))/g, '$1.jsx$2')
    .replace(/(import\s*\(\s*['"][^'"]+)\.ts(['"]\s*\))/g, '$1.js$2');

  if (patched !== text) {
    fs.writeFileSync(file, patched, 'utf8');
  }
}

const remaining = [];
walk(root, (file) => {
  if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('vite-env.d.ts')) {
    remaining.push(file);
  }
});

console.log(
  JSON.stringify(
    {
      convertedCount: converted.length,
      converted,
      remainingCount: remaining.length,
      remaining,
    },
    null,
    2,
  ),
);
