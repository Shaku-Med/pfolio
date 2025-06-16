const { EncryptCombine } = require("../Lock/Combine");
const { encrypt } = require("../Lock/Enc");

const GITHUB_OWNER = process.env.GITHUB_OWNER;

const isExist = async (octokit, name) => {
    try {
        await octokit.repos.get({
            owner: GITHUB_OWNER,
            repo: name
        });

        return true;
    } catch (error) {
        if (error.status === 404) {
            return null;
        } else {
            return true;
        }
    }
};

const createRepo = async (name, octokit, exist) => {
    try {
        if (!await exist) {
            let repo = await octokit.repos.createForAuthenticatedUser({
                name: name
            });
            return repo;
        } else {
            return null;
        }
    } catch (er) {
        return null;
    }
};

let LockData = (data) => {
    try {
        // let enc = encrypt(data, `${process.env.SECURE_GITHUB_FILE}`)
        // return Buffer.from(enc).toString('base64');
        return data
    }
    catch (e) {
        console.log(e)
        return null;
    }
}

const adR = async (repo, path, data, owner, octokit, exist) => {
    try {
        if (!exist) {
            return null;
        }

        if (!data) {
            return null;
        }

        try {
            // Fetch the current file to get its SHA
            const { data: fileData } = await octokit.repos.getContent({
                owner: owner,
                repo: repo,
                path: path,
            });

            // Use the sha from the current file
            const sha = fileData.sha;

            // Update the file
            await octokit.repos.createOrUpdateFileContents({
                owner: owner,
                repo: repo,
                path: path,
                message: `Update file: ${path}`,
                content: LockData(data),
                sha: sha,
            });

            return true;
        } catch (error) {
            if (error.status === 404) {
                // Create the file since it does not exist
                await octokit.repos.createOrUpdateFileContents({
                    owner: owner,
                    repo: repo,
                    path: path,
                    message: `Create new file: ${path}`,
                    content: LockData(data),
                });
                return true;
            }
            console.error(`Error in adR: ${error.message}`);
            throw error;
        }
    } catch (error) {
        console.error(`Failed to add/update file: ${error.message}`);
        return null;
    }
};

module.exports = {
    createRepo,
    adR,
    isExist,
    LockData
}; 