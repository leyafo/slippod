.PHONY: all bundle_main main preload renderer pack release preview clean

DIST := ./dist
MAIN_DIST := $(DIST)/main
PRELOAD_SRC := ./src/preload
PRELOAD_DIST := $(DIST)/preload

SOURCES := $(wildcard $(PRELOAD_SRC)/*.js)
TARGETS := $(SOURCES:$(PRELOAD_SRC)/%.js=$(PRELOAD_DIST)/%.jsc)

all: release

bundle_main:
	mkdir -p $(MAIN_DIST)
	npx esbuild src/main/main.js --platform=node --packages=external --minify --bundle --outfile=$(MAIN_DIST)/main.js

main: bundle_main
	npx bytenode -e -c $(MAIN_DIST)/main.js
	@rm $(MAIN_DIST)/main.js
	node scripts/loader.js main.jsc $(MAIN_DIST)/main.js

$(PRELOAD_DIST):
	mkdir -p $@

$(PRELOAD_DIST)/%.jsc: $(PRELOAD_SRC)/%.js | $(PRELOAD_DIST)
	npx bytenode -e -c $<
	mv $(PRELOAD_SRC)/$(notdir $@) $@
	node scripts/loader.js $(notdir $@) $(PRELOAD_DIST)/$(notdir $<)

preload: $(TARGETS)

renderer:
	npx vite build 

pack:
	npx electron-builder build --config electron-builder.config.js --dir

release: renderer preload main

preview: 
	npx electron $(MAIN_DIST)/index.js

clean:
	rm -rf $(DIST)/* out/*
