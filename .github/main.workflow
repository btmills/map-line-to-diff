workflow "Build and Test" {
  on = "push"
  resolves = ["Test"]
}

action "Build" {
  uses = "actions/npm@1.0.0"
  runs = "yarn"
  args = "run typecheck"
}

action "Test" {
  uses = "actions/npm@1.0.0"
  needs = ["Build"]
  runs = "yarn"
  args = "test"
}
