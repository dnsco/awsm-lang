module Main

import CodeGen
import Control.App
import Control.App.Console
import Data.String
import Data.List
import Data.Vect

data Token = NumToken Int

parse: String -> String
parse s = codeGen $ parse' (words s <&> parseToken) where
    parseToken: String -> Token
    parseToken s = NumToken $ cast s -- non numbers will be zero, this is our addition-only lan

    parse': List Token -> Op
    parse' (NumToken t1::sign:: NumToken t2::ts) = Add t1 t2
    parse' _ = Add 0 0

compileStdin : Console es => App es ()
compileStdin = getLine <&> parse >>= putStrLn

main : IO ()
main = run compileStdin
