.PHONY: all bundle_main main preload renderer pack release preview clean publish publish_pack

DIST := ./dist
MAIN_DIST := $(DIST)/main
PRELOAD_DIST := $(DIST)/preload

all: release

bundle_main:
	mkdir -p $(MAIN_DIST)
	cp -r src/main/* $(MAIN_DIST)/

preload:
	mkdir -p $(PRELOAD_DIST)
	cp -r src/preload/* $(PRELOAD_DIST)/

renderer:
	npx vite build 

pack:
	npx electron-builder build --config electron-builder.config.js --dir

release: renderer preload bundle_main

publish: renderer preload bundle_main 
	npx electron-builder build --config electron-builder.config.js --dir --publish 'never'

publish_pack: release
	NODE_ENV=pre npx --no-install electron-builder --config electron-builder.config.js --publish 'never'

preview: 
	npx electron $(MAIN_DIST)/main.js

clean:
	rm -rf $(DIST)/* out/*
