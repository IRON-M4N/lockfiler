const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs").promises;

async function run() {
	try {
		const pkgManager = core.getInput("package-manager");
		const bumpDeps = core.getBooleanInput("bump-dependencies");
		const dryRun = core.getBooleanInput("dry-run");
		const commitmsg = core.getInput("commit-message");

		// check for package.json changes
		const isChanged = await isPackageJsonChanged();
		if (!isChanged) {
			core.info("No changes in package.json");
			return;
		}

		// bump dependencies if true
		if (bumpDeps) {
			core.info("Bumping dependencies...");
			await exec.exec("npx npm-check-updates -u");
		}

		// find package manager
		const pkgmanager = await getPackageManager(pkgManager);
		core.info(`Package manager: ${pkgmanager}`);

		// update lockfile
		await updateLockFile(pkgmanager, dryRun);

		// stop things if it's dry run
		if (dryRun) {
			core.info("Dry run completed - No changes committed.");
			return;
		}
		await commitItems(commitmsg);
	} catch (error) {
		core.setFailed(error.message);
	}
}

// get package manager based on it's lockfile
async function getPackageManager(userChoice) {
	if (userChoice !== "auto") return userChoice;
	//default to npm
	try {
		await fs.access("yarn.lock");
		return "yarn";
	} catch {
		try {
			await fs.access("pnpm-lock.yaml");
			return "pnpm";
		} catch {
			return "npm";
		}
	}
}

// update the lockfile and lockfile only
async function updateLockFile(manager, dryRun) {
	const commands = {
		npm: "npm install --package-lock-only",
		yarn: "yarn install",
		pnpm: "pnpm install --lockfile-only",
	};

	if (dryRun) {
		core.info(`[Dry Run] Would execute: ${commands[manager]}`);
		return;
	}
	await exec.exec(commands[manager]);
}

async function isPackageJsonChanged() {
	var output = "";
	const options = {
		listeners: {
			stdout: data => (output += data.toString()),
		},
	};
	await exec.exec("git diff --name-only HEAD^ HEAD", [], options);
	return output.includes("package.json");
}

// Commit changes, no pull request
async function commitItems(message) {
	await exec.exec("git add package-lock.json yarn.lock pnpm-lock.yaml");
	await exec.exec(`git commit -m "${message}"`);
	await exec.exec("git push");
}
run();
