require "rubygems"
require "bundler/setup"
require "minitest"
require "minitest/autorun"
require "minitest/power_assert"
require "open3"

`idris2 --clean awsm.ipkg`
`idris2 --build awsm.ipkg`

describe "the program" do
  it "prints a message to the console" do
    stdout, _stderr, _status = Open3.capture3("./build/exec/awsm")
    assert { stdout == "Hey girl hey\n" }
  end
end
