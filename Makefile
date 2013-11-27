BUILDER	 := ./builder.js

dist: install-dep
	$(BUILDER) dist

install-dep: 
	npm install

.PHONY: dist install

