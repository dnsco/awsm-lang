module Main

import Control.App
import Control.App.Console

hello : Console es => App es ()
hello = putStrLn "Hey girl hey"

main : IO ()
main = run hello
