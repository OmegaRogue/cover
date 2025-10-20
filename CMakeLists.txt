cmake_minimum_required(VERSION 4.0)
project(cover)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# daslang

set(DAS_BUILD_TEST NO)
set(DAS_BUILD_PROFILE NO)
set(DAS_BUILD_TUTORIAL NO)
option(DAS_FLEX_BISON_DISABLED "Disable FLEX/BISON stage" ON)
option(DAS_CLANG_BIND_DISABLED "Disable dasClangBind (libclang bindings, C/C++ parsing)" ON)
option(DAS_LLVM_DISABLED "Disable dasLLVM (llvm bindings)" ON)
option(DAS_QUIRREL_DISABLED "Disable dasQuirrel (quirrel bindings)" ON)
option(DAS_HV_DISABLED "Disable dasHV (websokets,http server and client)" ON)
option(DAS_GLFW_DISABLED "Disable dasGLFW (GLFW window for graphics apps)" ON)
option(DAS_IMGUI_DISABLED "Disable dasIMGUI (IMGUI, IMNODES, IMGUI-NODE-EDITOR gui libraries)" ON)
option(DAS_BGFX_DISABLED "Disable dasBGFX (BGFX graphics API)" ON)
option(DAS_XBYAK_DISABLED "Disable dasXbyak (XBYAK and ZYDIS, x86 assembly, jit)" ON)
option(DAS_MINFFT_DISABLED "Disable dasMinfft (Minimal FFT library)" ON)
option(DAS_AUDIO_DISABLED "Disable dasAudio (Miniaudio sound library)" ON)
option(DAS_STDDLG_DISABLED "Disable dasStdDlg (File new,open,save etc dialogs)" ON)
option(DAS_STBIMAGE_DISABLED "Disable dasStbImage (StbImage bindings, image loading and saving)" ON)
option(DAS_STBTRUETYPE_DISABLED "Disable dasStbTrueType (StbTrueType bindings, ttf rasterization)" ON)
option(DAS_SFML_DISABLED "Disable dasSFML (SFML multimedia library)" ON)
option(DAS_PUGIXML_DISABLED "Disable dasPUGIXML (xml parsing library)" ON)
option(DAS_SQLITE_DISABLED "Disable dasSQLITE (sqlite3 library)" ON)
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

set_property(GLOBAL PROPERTY USE_FOLDERS ON)

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

set_target_properties(cover PROPERTIES COMPILE_FLAGS "-Os")
set_target_properties(cover PROPERTIES LINK_FLAGS    "-Os")


find_package(Threads REQUIRED)


target_link_libraries(cover libDaScript Threads::Threads)
#if(WIN32)
#    set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT cover)
#    set(CMAKE_FIND_LIBRARY_SUFFIXES ".lib")
#    set(CMAKE_CXX_FLAGS "-DBUILDING_DASBOX=1")
#    target_link_libraries(dasbox
#            legacy_stdio_definitions
#    )
#elseif(UNIX)
#    set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
#    set(CMAKE_CXX_FLAGS_RELEASE "-O3 -fno-rtti -fno-exceptions -fomit-frame-pointer -fno-stack-protector -s -DBUILDING_DASBOX=1 -DDAS_FUSION=2 -DDAS_DEBUGGER=1 -DNDEBUG=1")
#    set(CMAKE_CXX_FLAGS_DEBUG "-O0 -fno-rtti -fno-exceptions -fomit-frame-pointer -fno-stack-protector -DBUILDING_DASBOX=1")
#elseif(DEFINED EMSCRIPTEN)
#    set(CMAKE_EXECUTABLE_SUFFIX ".wasm")
#    set_target_properties(cover PROPERTIES COMPILE_FLAGS "-Os -s SIDE_MODULE=1 ")
#    set_target_properties(cover PROPERTIES LINK_FLAGS    "-Os -s WASM=1 -s SIDE_MODULE=1 -s STANDALONE_WASM --no-entry")
#endif()

set_target_properties(cover PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${PROJECT_SOURCE_DIR}/bin"
        RUNTIME_OUTPUT_DIRECTORY_DEBUG "${PROJECT_SOURCE_DIR}/bin"
        RUNTIME_OUTPUT_DIRECTORY_RELEASE "${PROJECT_SOURCE_DIR}/bin"
)
