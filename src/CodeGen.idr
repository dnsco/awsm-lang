module CodeGen

public export data Op = Add Int Int

toString: Op -> String
toString (Add n1 n2) = addClause (cast n1) (cast n2) where
  addClause: String -> String -> String
  addClause i32_1 i32_2 = """
      i32.const \{i32_1}
      i32.const \{i32_2}
      i32.add
  """

export codeGen: Op -> String
-- exec n [] = cast n
codeGen op = """
(module
  (func $main (result i32)
\{toString op}
  )
  (export "main" (func $main))
)
"""