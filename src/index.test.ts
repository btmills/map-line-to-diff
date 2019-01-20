import mapLine from './';

function t(
	message: string,
	filename: string,
	mappings: Array<[number, number]>,
	diff: string,
) {
	describe(message, () => {
		for (const [desired, expected] of mappings) {
			test(`${desired} in file => ${expected} in diff`, () => {
				expect(mapLine(diff, filename, desired)).toBe(expected);
			});
		}
	});
}

t(
	'first line unchanged',
	'test.txt',
	[[1, 1]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -1,4 +1,4 @@',
		' This',
		'-is',
		"+isn't",
		' a',
		' test.',
	].join('\n'),
);

t(
	'skip over removed lines',
	'test.txt',
	[[2, 2], [3, 5]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -1,6 +1,4 @@',
		' This',
		' is',
		'-not',
		'-actually',
		' a',
		' test.',
	].join('\n'),
);

t(
	'new file',
	'test.txt',
	[[1, 1], [2, 2], [3, 3], [4, 4]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- /dev/null',
		'+++ b/test.txt',
		'@@ -0,0 +1,4 @@',
		'+This',
		'+is',
		'+a',
		'+test.',
	].join('\n'),
);

t(
	'ignores arbitrary file headers',
	'test.txt',
	[[1, 1], [2, 2]],
	[
		'diff --git a/test.txt b/test.txt',
		'new file mode 100644',
		'index 1234567..0abcdef',
		'--- /dev/null',
		'+++ b/test.txt',
		'@@ -0,0 +1,2 @@',
		'+Hello',
		'+world',
	].join('\n'),
);

t(
	'ignores text after hunk header',
	'test.txt',
	[[1, 1], [2, 2]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- /dev/null',
		'+++ b/test.txt',
		'@@ -0,0 +1,2 @@ function thisTextIsIgnored(',
		'+Hello',
		'+world',
	].join('\n'),
);

t(
	'finds the correct hunk',
	'test.txt',
	[/*[1, 1], [2, 2],*/ [11, 5], [12, 6], [13, 8], [14, 9], [15, 10]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -1,2 +1,3 @@',
		' Hello',
		'+world',
		' ',
		'@@ -10,4 +11,5 @@',
		' This',
		' is',
		'-a',
		'+an',
		'+important',
		' test.',
	].join('\n'),
);

t(
	'finds the correct file',
	'yes.txt',
	[[1, 1], [2, 2], [3, 4], [4, 5]],
	[
		'diff --git a/no.txt b/no.txt',
		'--- a/no.txt',
		'+++ b/no.txt',
		'@@ -1,2 +1,3 @@',
		' Hello',
		'+world',
		' ',
		'diff --git a/yes.txt b/yes.txt',
		'--- a/yes.txt',
		'+++ b/yes.txt',
		'@@ -1,4 +1,4 @@',
		" It's",
		' a',
		'-test.',
		'+trap!',
		' ',
	].join('\n'),
);

t(
	'handles renamed files',
	'new.txt',
	[[1, 1], [2, 2], [3, 4]],
	[
		'diff --git a/old.txt b/new.txt',
		'similarity index 80%',
		'rename from old.txt',
		'rename to new.txt',
		'--- a/old.txt',
		'+++ b/new.txt',
		'@@ -1,3 +1,3 @@',
		" It's",
		' a',
		'-test.',
		'+trap!',
	].join('\n'),
);

t(
	'starting in the middle of a file',
	'test.txt',
	[[3, 1], [4, 2], [5, 4]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -3,3 +3,3 @@',
		" It's",
		' a',
		'-test.',
		'+trap!',
	].join('\n'),
);

t(
	'file not in diff',
	'missing.txt',
	[[1, -1]],
	[
		'diff --git a/nope.txt b/nope.txt',
		'--- a/nope.txt',
		'+++ b/nope.txt',
		'@@ -1,1 +1,2 @@',
		' Hello',
		'+world.',
	].join('\n'),
);

t(
	'desired line before first hunk',
	'test.txt',
	[[1, -1], [2, -1], [3, 1]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -3,1 +3,2 @@',
		' Hello',
		'+world.',
	].join('\n'),
);

t(
	'desired line between hunks',
	'test.txt',
	[[2, 2], [3, -1], [4, -1], [5, 4]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -1,1 +1,2 @@',
		' Before',
		'+diff',
		'@@ -4,1 +5,2 @@',
		' After',
		'+diff',
	].join('\n'),
);

t(
	'desired line after last hunk',
	'test.txt',
	[[2, 2], [3, -1]],
	[
		'diff --git a/test.txt b/test.txt',
		'--- a/test.txt',
		'+++ b/test.txt',
		'@@ -1,1 +1,2 @@',
		' Hello',
		'+world',
	].join('\n'),
);

t(
	'desired line after last hunk with another file after',
	'first.txt',
	[[2, 2], [3, -1], [4, -1], [5, -1]],
	[
		'diff --git a/first.txt b/first.txt',
		'--- a/first.txt',
		'+++ b/first.txt',
		'@@ -1,1 +1,2 @@',
		' Hello',
		'+world',
		'diff --git a/second.txt b/second.txt',
		'--- a/second.txt',
		'+++ b/second.txt',
		'@@ -1,4 +1,4 @@',
		" It's",
		' a',
		'-test.',
		'+trap!',
		' ',
	].join('\n'),
);
