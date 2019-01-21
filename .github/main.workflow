workflow "Build and Test" {
  on = "push"
  resolves = [
    "Build",
    "Test",
  ]
}

action "Install" {
  uses = "actions/npm@1.0.0"
  runs = "yarn"
  args = "install"
}

action "Build" {
  uses = "actions/npm@1.0.0"
  runs = "yarn"
  args = "run typecheck"
  needs = ["Install"]
}

action "Test" {
  uses = "actions/npm@1.0.0"
  runs = "yarn"
  args = "test"
  needs = ["Install"]
}
