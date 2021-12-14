module Main

import CodeGen
import Control.App
import Control.App.Console
import Parser

main : IO ()
main = run compileStdin where
    compileStdin : Console es => App es ()
    compileStdin = getLine <&> compile >>= putStrLn where
        compile: String -> String
        compile = codeGen . parse
