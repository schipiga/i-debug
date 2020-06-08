"use strict";

module.exports = ' \
const $__debug__ = async function ($__helpMessage__) { \
    const $__require__ = async $__name__ => global.require ? require($__name__) : (await import($__name__)).default; \
    const $__colors__ = await $__require__("colors"); \
    const $__espree__ = await $__require__("espree"); \
    const $__highlight__ = (await $__require__("cli-highlight")).highlight; \
    const $__readline__ = await $__require__("readline"); \
    const $__util__ = await $__require__("util"); \
    const $__lodash__ = await $__require__("lodash"); \
    const complete = $__line__ => { \
        $__line__ = $__colors__.strip($__line__); \
        const $__tokens__ = $__line__.split(/[^A-Za-z0-9._$]+/).filter(i => i); \
        if (!$__tokens__.length) return [[], $__line__]; \
        const $__targetToken__ = $__tokens__[$__tokens__.length - 1]; \
        let $__namespace__ = global; \
        let $__filterPrefix__ = $__targetToken__; \
        let $__targetObject__; \
        if ($__targetToken__.includes(".")) { \
            $__targetObject__ = $__targetToken__.split("."); \
            $__filterPrefix__ = $__targetObject__.pop(); \
            $__targetObject__ = $__targetObject__.join("."); \
            if (!$__targetObject__) return [[], $__targetToken__]; \
            try { \
                $__namespace__ = eval($__targetObject__); \
            } catch ($__err__) { \
                return [[], $__targetToken__]; \
            } \
        } \
        let $__completions__ = []; \
        try { \
            for (const $__key__ in $__namespace__) { \
                $__completions__.push($__key__); \
            } \
            $__completions__ = $__lodash__.union( \
                $__completions__, \
                Object.getOwnPropertyNames($__namespace__), \
                Object.getOwnPropertyNames(Object.getPrototypeOf($__namespace__)) \
            ).sort() \
                .filter($__i__ => $__i__.startsWith($__filterPrefix__)) \
                .filter($__i__ => /^(\\w|\\$)+$/.test($__i__)) \
                .filter($__i__ => /^\\D/.test($__i__)); \
        } catch ($__e__) { \
            return [[], $__targetToken__]; \
        } \
        if ($__targetObject__) { \
            $__completions__ = $__completions__.map($__i__ => $__targetObject__ + "." + $__i__); \
        } \
        return [$__completions__, $__targetToken__]; \
    }; \
    const $__defaultHelp__ = "In interactive mode you can execute any nodejs code.\\n" + \
        "Also next commands are available:\\n"; \
    $__helpMessage__ = $__helpMessage__ || $__defaultHelp__; \
    $__helpMessage__ += "- .h, .help - show interactive mode help;\\n" + \
        "- .go - continue code execution;\\n" + \
        "- .exit - finish current nodejs process;"; \
    console.log("interactive debug on".yellow); \
    const $__rl__ = $__readline__.createInterface({ \
        input: process.stdin, \
        output: process.stdout, \
        completer: complete, \
    }); \
    const ttyWrite = $__rl__._ttyWrite; \
    $__rl__._ttyWrite = function ($__s__, $__key__) { \
        if (this.cursor <= this.line.length) { \
            this.line = $__colors__.strip(this.line); \
            if (this.cursor > this.line.length) { \
                this._moveCursor(+Infinity); \
            } \
        } \
        ttyWrite.call(this, $__s__, $__key__); \
        if (this.cursor < this.line.length) { \
            this.line = $__colors__.strip(this.line); \
            if (this.cursor > this.line.length) { \
                this._moveCursor(+Infinity); \
            } \
        } else { \
            this.line = $__highlight__($__colors__.strip(this.line), { language: "js" }); \
            this._moveCursor(+Infinity); \
        } \
        if ($__key__.name !== "return") { \
            this._refreshLine(); \
        } \
    }; \
    const $__origGlobals__ = {}; \
    let $__isFinished__ = false; \
    while (!$__isFinished__) { \
        $__isFinished__ = await new Promise($__resolve__ => { \
            $__rl__.question("> ".red, $__answer__ => { \
                $__answer__ = $__colors__.strip($__answer__); \
                if ($__answer__ === ".exit") { \
                    console.log("emergency exit".red); \
                    process.exit(1); \
                } \
                if ($__answer__ === ".go") { \
                    console.log("continue execution".green); \
                    $__rl__.close(); \
                    $__resolve__(true); \
                    return; \
                } \
                if ([".help", ".h"].includes($__answer__)) { \
                    console.log($__helpMessage__); \
                    $__resolve__(false); \
                    return; \
                } \
                let $__ast__, $__varName__; \
                try { \
                    $__ast__ = $__espree__.parse($__answer__, { ecmaVersion: 9 }); \
                    $__varName__ = $__ast__.body[0].expression.left.name; \
                } catch ($__err__) { \
                    try { \
                        $__varName__ = $__ast__.body[0].declarations[0].id.name; \
                    } catch ($__e__) { /* nothing */ } \
                } \
                Promise \
                    .resolve() \
                    .then(() => { \
                        const $__result__ = eval($__answer__); \
                        if ($__varName__) { \
                            if (!Object.prototype.hasOwnProperty.call($__origGlobals__, $__varName__)) { \
                                $__origGlobals__[$__varName__] = global[$__varName__]; \
                            } \
                            global[$__varName__] = eval($__varName__); \
                        } \
                        return $__result__; \
                    }) \
                    .then($__result__ => console.log($__util__.format($__result__).yellow)) \
                    .catch($__err__ => console.log($__util__.format($__err__).red)) \
                    .then(() => $__resolve__(false)); \
            }); \
        }); \
    } \
    for (const [$__key__, $__val__] of Object.entries($__origGlobals__)) { \
        global[$__key__] = $__val__; \
    } \
}; \
$__debug__(); \
';
