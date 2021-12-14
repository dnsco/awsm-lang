module Parser

import Data.String
import Data.List

data Token = NumToken Int
public export data Op = Add Int Int
public export data  Program = Ast (List Op)

export parse: String -> Program
parse s = parse' (words s <&> parseToken) where
    parseToken: String -> Token
    parseToken s = NumToken $ cast s -- non numbers will be zero, this is our addition-only lan

    parse': List Token -> Program
    parse' (NumToken t1::sign:: NumToken t2::ts) = Ast [Add t1 t2]
    parse' _ = Ast []