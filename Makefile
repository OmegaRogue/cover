
.PHONY: clean default update refresh build
.ONESHELL:

DATA_PATH := $(shell node -e 'console.log(JSON.parse(require("fs").readFileSync("foundryconfig.json")).dataPath.join(" "));')
PF2E_REPO_PATH := $(shell node -e 'console.log(JSON.parse(require("fs").readFileSync("foundryconfig.json")).pf2eRepoPath);')

build:
	yarn build
buildDa:
	cd 3rdparty/daScript
	mkdir -p build && cd build
	cmake -G Ninja .. -DCMAKE_BUILD_TYPE=RelWithDebInfo
	cmake --build . -j16 --target daslang --config RelWithDebInfo
deps:
	yarn install
build_dev:
	yarn build:dev
clean:
	yarn clean
watch:
	yarn watch
hot:
	yarn hot
install:
	for f in ${DATA_PATH}
	do
		ln -s $$(pwd)/dist "$$f/modules/cover"
	done
lint:
	yarn lint
lint_json:
	yarn lint:json
lint_fix:
	yarn lint:fix

android_debug:
	adb forward tcp:9222 localabstract:chrome_devtools_remote
