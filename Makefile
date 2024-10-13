.PHONY: build
build:
	npm run build

.PHONY: pack
pack:
	npm run pack

.PHONY: format
format:
	npm run format

.PHONY: lint
lint:
	npm run prettier
	npm run lint