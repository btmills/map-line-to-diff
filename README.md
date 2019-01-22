# Map Line to Diff

When [submitting a pull request review via the GitHub API]( https://developer.github.com/v3/pulls/reviews/#create-a-pull-request-review), comments must be mapped to their position within the diff:

> Note: To comment on a specific line in a file, you need to first determine the position of that line in the diff.... The position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. The line just below the "@@" line is position 1, the next line is position 2, and so on. The position in the diff continues to increase through lines of whitespace and additional hunks until the beginning of a new file.

## Installation

```sh
$ yarn install map-line-to-diff
```

## Usage

Given a string representation of a Git diff, the name of a file in the diff, and a line number in the file's current state, `mapLineToDiff` returns the position of that line within the diff relative to the file's first `@@` hunk header, as defined by the GitHub API guidelines above. If the file does not appear in the diff, or the line is not contained in any of the hunks, the function returns `-1`.

```diff
diff --git a/example.txt b/example.txt
--- a/example.txt
+++ b/example.txt
@@ -1,3 +1,3 @@
 It's
 a
-test.
+trap!
@@ -10,1 +10,2 @@
 Hello
+world
diff --git a/testing.txt b/testing.txt
--- /dev/null
+++ b/testing.txt
@@ -0,0 +1,1 @@
+Testing.
```

```js
import mapLineToDiff from 'map-line-to-diff';

// Assume `diff` contains the diff above.
const diff = '...';

// Lines 1 and 2 aren't changed.
mapLineToDiff(diff, 'example.txt', 1); // => 1
mapLineToDiff(diff, 'example.txt', 2); // => 2

// Line 3 in the current file was changed to "trap!" on line 4 of the diff.
mapLineToDiff(diff, 'example.txt', 3); // => 4

// Lines 4-9 aren't in the diff.
mapLineToDiff(diff, 'example.txt', 4); // => -1
mapLineToDiff(diff, 'example.txt', 9); // => -1

// Line 10, "Hello", is unchanged 6 lines after the first hunk's @@ header.
mapLineToDiff(diff, 'example.txt', 10); // => 6
// Line 11, "world", is was added in the diff.
mapLineToDiff(diff, 'example.txt', 11); // => 7

// Lines greater than 11 aren't in the diff.
mapLineToDiff(diff, 'example.txt', 12); // => -1

// A new file resets the line count to 1 at "Testing." in testing.txt.
mapLineToDiff(diff, 'testing.txt', 1); // => 1

// README.md is not in the diff.
mapLineToDiff(diff, 'README.md', 1); // -1
```

## License

MIT &copy; [Brandon Mills](https://bmills.net/)
