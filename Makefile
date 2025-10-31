# Web2Wave React Native Makefile

.PHONY: build prepare publish version

build:
	npm run build

prepare:
	npm install && npm run build

version:
	@set -e; \
	node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); const [major, minor, patch] = pkg.version.split('.').map(Number); const newVersion = \`\${major}.\${minor}.\${patch + 1}\`; pkg.version = newVersion; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n'); console.log('Updated version:', newVersion);"

publish:
	@make prepare
	@make version
	npm publish