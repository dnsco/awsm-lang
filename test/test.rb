require "rubygems"
require "bundler/setup"
require "minitest"
require "minitest/autorun"
require "minitest/power_assert"
require "power_assert/colorize"
require "pp"

require "open3"

def clean_and_build
  puts "Clean:"
  stdout, stderr, status = Open3.capture3("idris2 --clean awsm.ipkg")
  pp({out: stdout, err: stderr, status: status})

  puts "\n"
  puts "Build:"
  stdout, stderr, status = Open3.capture3("idris2 --build awsm.ipkg")
  pp({out: stdout, err: stderr, status: status})
  puts "\n"
end

# clean_and_build

describe "the program" do
  def check(program, expected)
    stdout, _, _ = Open3.capture3("./build/exec/awsm", stdin_data: program)
    assert { stdout.strip == expected.to_s }
  end

  it "supports addition" do
    check("2 + 2", 4)
    check("2 + 2 + 4", 9)
  end
end
