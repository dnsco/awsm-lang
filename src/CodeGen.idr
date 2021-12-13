module CodeGen

public export data Op = Add Int Int

toString: Op -> String
toString (Add n1 n2) = """
    i32.const \{cast n1}
    i32.const \{cast n2}
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