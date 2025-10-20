cmake_minimum_required(VERSION 4.0)
project(cover)

set(CMAKE_CXX_STANDARD 23)


# daslang

set(DAS_BUILD_TEST NO)
set(DAS_BUILD_PROFILE NO)
set(DAS_BUILD_TUTORIAL NO)
set(DAS_GLFW_DISABLED YES)
set(DAS_IMGUI_DISABLED YES)
set(DAS_CLANG_BIND_DISABLED YES)
set(DAS_BGFX_DISABLED YES)
set(DAS_STBIMAGE_DISABLED YES)
set(DAS_STBTRUETYPE_DISABLED YES)
set(DAS_STDDLG_DISABLED YES)
set(DAS_XBYAK_DISABLED YES)
set(DAS_SFML_DISABLED YES)
set(DAS_FLEX_BISON_DISABLED YES)
set(DAS_HV_DISABLED YES)
set(DAS_MINFFT_DISABLED YES)
set(DAS_SOUND_DISABLED YES)
# set(DAS_BUILD_TOOLS NO) # <--- need to build tools to support AOT generation build step in daScript modules
set(DAS_CONFIG_INCLUDE_DIR "src")


add_compile_options(-msimd128)
add_compile_options(-msse2)
add_compile_options(-mnontrapping-fptoint)

add_compile_options(-fwasm-exceptions)
add_link_options(-fwasm-exceptions)

add_compile_definitions(DAS_ENABLE_EXCEPTIONS)
add_compile_definitions(_EMSCRIPTEN_VER)

set(CMAKE_CXX_FLAGS "-s TOTAL_MEMORY=128MB")

INCLUDE(3rdparty/daScript/CMakeCommon.txt)

SETUP_COMPILER()

add_subdirectory(3rdparty/daScript)


include_directories(
        src
        3rdparty/daScript/include/daScript
)
link_directories(
        3rdparty/daScript/build
)
# log implementation for standalone executables
#add_library(logStandalone STATIC src/daScript/logStandalone.cpp)
#add_dependencies(daScript logStandalone)
#target_link_libraries(daScript logStandalone)


include_directories(wasm/src)

add_executable(cover
        wasm/src/main.cpp
        wasm/src/main.h
        static/test.das)

find_package(Threads REQUIRED)


target_link_libraries(cover libDaScript Threads::Threads)

if(WIN32)
    set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT cover)
    set(CMAKE_FIND_LIBRARY_SUFFIXES ".lib")
    set(CMAKE_CXX_FLAGS "-DBUILDING_DASBOX=1")
    target_link_libraries(dasbox
            legacy_stdio_definitions
    )
elseif(UNIX)
    set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
    set(CMAKE_CXX_FLAGS_RELEASE "-O3 -fno-rtti -fno-exceptions -fomit-frame-pointer -fno-stack-protector -s -DBUILDING_DASBOX=1 -DDAS_FUSION=2 -DDAS_DEBUGGER=1 -DNDEBUG=1")
    set(CMAKE_CXX_FLAGS_DEBUG "-O0 -fno-rtti -fno-exceptions -fomit-frame-pointer -fno-stack-protector -DBUILDING_DASBOX=1")
elseif(DEFINED EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".wasm")
    set_target_properties(cover PROPERTIES COMPILE_FLAGS "-Os -s SIDE_MODULE=1 ")
    set_target_properties(cover PROPERTIES LINK_FLAGS    "-Os -s WASM=1 -s SIDE_MODULE=1 -s STANDALONE_WASM --no-entry")
endif()

set_target_properties(cover PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${PROJECT_SOURCE_DIR}/bin"
        RUNTIME_OUTPUT_DIRECTORY_DEBUG "${PROJECT_SOURCE_DIR}/bin"
        RUNTIME_OUTPUT_DIRECTORY_RELEASE "${PROJECT_SOURCE_DIR}/bin"
)
