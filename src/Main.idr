module Main

import Control.App
import Control.App.Console
import Data.String

data Token = Num(Int)

parse: String -> String
parse s = cast  $ exec 0 (words s <&> parseToken) where
    parseToken: String -> Token
    parseToken s = Num $ cast s -- non numbers will be zero, this is our addition-only lang
  
    exec: Int -> List Token -> String
    -- exec n [] = cast n
    exec n ts = """
    (module
      (func $main
        (result i32)
        i32.const 2
        i32.const 2
        i32.add
      )
      (export "main" (func $main))
    )
    """
    -- exec n (Num(t)::ts) = exec (n + t) ts
    
compileStdin : Console es => App es ()
compileStdin = getLine <&> parse >>= putStrLn

main : IO ()
main = run compileStdin
