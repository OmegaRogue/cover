#include <iostream>

#include "daScript/daScript.h"
using namespace das;

#define TUTORIAL_NAME   "/static/test.das"

void tutorial () {
    TextPrinter tout;                               // output stream for all compiler messages (stdout. for stringstream use TextWriter)
    ModuleGroup dummyLibGroup;                      // module group for compiled program
    auto fAccess = make_smart<FsFileAccess>();      // default file access
    // compile program
	std::cout << getDasRoot() + TUTORIAL_NAME << std::endl;
    auto program = compileDaScript(getDasRoot() + TUTORIAL_NAME, fAccess, tout, dummyLibGroup);
    if ( program->failed() ) {
        // if compilation failed, report errors
        tout << "failed to compile\n";
        for ( auto & err : program->errors ) {
            tout << reportError(err.at, err.what, err.extra, err.fixme, err.cerr );
        }
        return;
    }
    // create daScript context
    Context ctx(program->getContextStackSize());
    if ( !program->simulate(ctx, tout) ) {
        // if interpretation failed, report errors
        tout << "failed to simulate\n";
        for ( auto & err : program->errors ) {
            tout << reportError(err.at, err.what, err.extra, err.fixme, err.cerr );
        }
        return;
    }
    // find function 'main' in the context
    auto fnMain = ctx.findFunction("main");
    if ( !fnMain ) {
        tout << "function 'main' not found\n";
        return;
    }
    // verify if 'main' is a function, with the correct signature
    // note, this operation is slow, so don't do it every time for every call
    if ( !verifyCall<void>(fnMain->debugInfo, dummyLibGroup) ) {
        tout << "function 'main', call arguments do not match. expecting def main : void\n";
        return;
    }
    // evaluate 'main' function in the context
    ctx.evalWithCatch(fnMain, nullptr);
    if ( auto ex = ctx.getException() ) {       // if function cased panic, report it
        tout << "exception: " << ex << "\n";
        return;
    }
}

int main( int, char * [] ) {
    // request all da-script built in modules
    NEED_ALL_DEFAULT_MODULES;
    // Initialize modules
    Module::Initialize();
    // run the tutorial
    tutorial();
    // shut-down daScript, free all memory
    Module::Shutdown();
    return 0;
}
