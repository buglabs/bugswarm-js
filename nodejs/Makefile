TESTS = test/configuration/*.js
REPORTER = list
JSLINT   := /usr/local/bin/gjslint
FIX_STYLE := /usr/local/bin/fixjsstyle
JSLINT_PARAMS := --custom_jsdoc_tags public,static --recurse lib/ --recurse test/

test:
	@NODE_ENV=$(NODE_ENV) ./support/mocha/bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--ui bdd \
		$(TESTS)

install: 
	npm install

jslint:
	$(JSLINT) $(JSLINT_PARAMS)

fixstyle:
	$(FIX_STYLE) $(JSLINT_PARAMS)

.PHONY: test jslint fixstyle install
