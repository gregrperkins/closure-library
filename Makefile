default: test

test:
	./node_modules/.bin/closure-library-phantomjs all_tests.html

TEST_APP := "Google Chrome"
browsertest:
	./lib/serve_all_tests --auto --app $(TEST_APP) --port 26874

.PHONY: default test browsertest
