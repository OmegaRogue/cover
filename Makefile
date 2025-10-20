
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

buildWasm:
	#cp 3rdparty/daScript/CMakeXxdImpl.txt .
	#sudo emsdk activate latest
	source "/usr/lib/emsdk/emsdk_env.sh"
	rm -rf cmake_temp
	mkdir cmake_temp
	cd cmake_temp
	cmake -DCMAKE_BUILD_TYPE=Debug -G Ninja -DCMAKE_TOOLCHAIN_FILE=/usr/lib/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake ../
	ninja -j16

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
