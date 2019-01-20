enum State {
	Diff, // Anywhere in a diff
	File, // Found the correct file
	Hunk, // Found the correct hunk
}

const fileRegex = /^\+\+\+ (?:b\/)?(.*)$/;
const hunkRegex = /^@@ -\d+,\d+ \+(?<start>\d+),(?<count>\d+) @@/;

export default function mapLine(
	diff: string,
	filename: string,
	desiredLine: number,
): number {
	const diffLines = diff.split('\n');
	let state = State.Diff;
	let fileStartIndex = 0;
	let currentLine = 0;
	let hunkLineCount = 0;
	for (let i = 0; i < diffLines.length; i++) {
		switch (state) {
			case State.Diff: {
				const match = fileRegex.exec(diffLines[i]);
				if (match && match[1] === filename) {
					state = State.File;
					// GitHub API comment positions in the diff are relative to
					// the file's first hunk's `@@`, which is the next line.
					fileStartIndex = i + 1;
				}
				break;
			}
			case State.File: {
				if (diffLines[i].startsWith('diff ')) {
					// We've reached the end of the current file.
					state = State.Diff;

					// Rewind and reenter with the current line.
					i--;
					break;
				}

				const match = hunkRegex.exec(diffLines[i]);
				if (match && match.groups) {
					currentLine = parseInt(match.groups.start, 10);
					hunkLineCount = parseInt(match.groups.count, 10);
					if (desiredLine < currentLine) {
						// The desired line occurs before this hunk.
						return -1;
					}
					if (desiredLine < currentLine + hunkLineCount) {
						state = State.Hunk;
					}
				}
				break;
			}
			case State.Hunk: {
				switch (diffLines[i][0]) {
					case ' ': // Line present in the old and the new file.
					case '+': // Line added in the new file.
						if (currentLine === desiredLine) {
							return i - fileStartIndex;
						}
						currentLine++;
						break;
					case '-': // Line removed from the old file. Ignore this.
						break;
					case '@': // Beginning of the next hunk.
						state = State.File;
						i--; // Rewind and reenter with the current line.
						break;
					default:
						state = State.Diff;
						i--; // Rewind and reenter with the current line.
				}
			}
		}
	}

	return -1;
}
