#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFile = path.join(__dirname, '..', 'lib', 'version.ts');

function getCurrentVersion() {
  const content = fs.readFileSync(versionFile, 'utf-8');
  const match = content.match(/VERSION = '([\d.]+)'/);
  return match ? match[1] : '1.0';
}

function bumpVersion(currentVersion) {
  const parts = currentVersion.split('.').map(Number);
  parts[parts.length - 1] += 1;
  return parts.join('.');
}

function updateVersion(newVersion) {
  let content = fs.readFileSync(versionFile, 'utf-8');
  content = content.replace(/VERSION = '[\d.]+'/, `VERSION = '${newVersion}'`);
  content = content.replace(/BUILD_DATE = '[\d-]+'/, `BUILD_DATE = '${new Date().toISOString().split('T')[0]}'`);
  fs.writeFileSync(versionFile, content);
  console.log(`Version updated to v${newVersion}`);
}

function commitAndPush(newVersion) {
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Release v${newVersion}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log(`Successfully pushed v${newVersion} to GitHub`);
  } catch (error) {
    console.error('Error pushing to GitHub:', error.message);
    process.exit(1);
  }
}

function main() {
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion);
  updateVersion(newVersion);
  commitAndPush(newVersion);
}

main();