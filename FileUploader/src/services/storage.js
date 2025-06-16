const fs = require('fs');
const path = require('path');
const os = require('os');
const { Octokit } = require('@octokit/rest');
const { createRepo, adR, isExist } = require('./githubService');

// Array of GitHub tokens
const GITHUB_TOKENS = [`${process.env.GithubKey1}`, `${process.env.GithubKey2}`, `${process.env.GithubKey3}`, `${process.env.GithubKey4}`, `${process.env.GithubKey5}`, `${process.env.GithubKey6}`].filter(token => token && token !== 'undefined');
const GITHUB_OWNER = process.env.GITHUB_OWNER;

// Function to get random token and create Octokit instance
const getRandomOctokit = async () => {
    if (GITHUB_TOKENS.length === 0) {
        throw new Error('No valid GitHub tokens available');
    }

    let rand = Math.floor(Math.random() * GITHUB_TOKENS.length);
    return GITHUB_TOKENS[rand];
};

const uploadHLSFiles = async (outputDir, body) => {
    const GITHUB_REPO = `${body?.owner_id}`;
    const files = fs.readdirSync(outputDir);
    
    const uploadPromises = files.map(async (file) => {
        const filePath = path.join(outputDir, file);
        const fileContent = fs.readFileSync(filePath, 'base64');

        const destination = `${new Date().toDateString().split('-').join('_')}/${body?.id}/${file}`;
        
        try {
            let sv = await saveToGitHub(0, GITHUB_REPO, destination, fileContent);
            return sv ? `${destination}` : null
        } catch (error) {
            console.error(`Error uploading file ${file}:`, error.message);
            return null;
        }
    });

    return Promise.all(uploadPromises);
};

const uploadFile = async (file, body) => {
    const GITHUB_REPO = `${body?.owner_id}`;
    const fileName = body?.originalname || `file_${Date.now()}`;
    const destination = `${new Date().toDateString().split('-').join('_')}/${body?.id}/${fileName}_${body?.index}`;
    
    try {
        file = file.toString('base64');
        let sv = await saveToGitHub(0, GITHUB_REPO, destination, file);
        return sv ? `${destination}` : null
    } catch (error) {
       return null;
    }
};

const saveToGitHub = async (attempts = 0, REPO_NAME, targetFilePath, fileData) => {

    if (attempts >= 3) return false;

    try {
        let t = await getRandomOctokit();
        const octokit = new Octokit({ auth: t });
        
        // Check if repo exists
        const repoExists = await isExist(octokit, REPO_NAME);
        if (!repoExists) {
            await createRepo(REPO_NAME, octokit, repoExists);
        }
        
        // Create new file with the data
        const result = await adR(REPO_NAME, targetFilePath, fileData, GITHUB_OWNER, octokit, repoExists);
        return result ? true : await saveToGitHub(attempts + 1, REPO_NAME, targetFilePath, fileData);
    } catch (error) {
        // console.error(`GitHub save attempt ${attempts + 1} failed:`, error);
        return await saveToGitHub(attempts + 1, REPO_NAME, targetFilePath, fileData);
    }
};

module.exports = { 
    uploadHLSFiles,
    uploadFile
}; 