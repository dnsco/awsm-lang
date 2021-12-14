module CodeGen

import Parser
import Data.String
import Libraries.Data.String.Extra


toString: Op -> String
toString (Add n1 n2) = addClause (cast n1) (cast n2) where
  addClause: String -> String -> String
  addClause i32_1 i32_2 = """
      (
        i32.add
        (i32.const \{i32_1})
        (i32.const \{i32_2})
      )
  """

export codeGen: Program -> String
codeGen ast = """
(module
  (func $main (result i32)
\{ programText ast }
  )
  (export "main" (func $main))
)
""" where
  programText: Program -> String
  programText (Ast ops) = join "" $ ops <&> toString
